import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { benchmarkModels } from '../src/modules/content/review-benchmark/setup.ts';
import {
  liveProviderId,
  livePolicyVersion,
  liveRunCeilingMicroEur,
  smokeSpecification,
  smokeRequestId,
} from '../src/modules/content/review-benchmark/live-smoke.ts';
import { fingerprint } from '../src/modules/content/review-benchmark/benchmark.ts';
import { readBenchmarkKeys } from '../src/server/content/benchmark-setup.ts';
import { createLiveReviewProvider } from '../src/server/content/live-review-provider.ts';
import {
  enqueueGeneration,
  runGenerationOnce,
  reconcileGenerationCost,
} from '../src/server/content/generation-jobs.ts';

let db: PrismaClient | undefined;
try {
  const command = process.argv[2];
  if (
    process.argv.length !== 3 ||
    !['report', 'execute', 'reconcile', 'retry-gemini'].includes(command ?? '')
  )
    throw new Error('INVALID_COMMAND');
  const url = new URL(process.env.DATABASE_URL ?? '');
  if (
    url.protocol !== 'postgresql:' ||
    url.hostname !== '127.0.0.1' ||
    url.pathname !== '/nexo_benchmark_local' ||
    url.search
  )
    throw new Error('LOCAL_BENCHMARK_DATABASE_REQUIRED');
  db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url.toString() }),
  });
  // Large reservations first; actual usage settles before the next serial call.
  const ordered = [...benchmarkModels].sort(
    (a, b) =>
      Number(b.model === 'gpt-6.1-sol') - Number(a.model === 'gpt-6.1-sol'),
  );
  const manifest = ordered.flatMap(({ model }) =>
    (['solve', 'semantic'] as const).map((stage) => ({
      model,
      stage,
      requestId: smokeRequestId(model, stage),
      specification: smokeSpecification(model, stage),
    })),
  );
  const originalGeminiId = smokeRequestId('gemini-3.8-flash', 'solve');
  const retryId = `${originalGeminiId}-recovery-1`;
  if (command === 'reconcile' || command === 'retry-gemini') {
    const original = await db.generationJob.findUniqueOrThrow({
      where: { requestId: originalGeminiId },
      include: { runs: { include: { reconciliation: true } } },
    });
    const run = original.runs[0];
    if (
      original.state !== 'failed' ||
      original.provider !== liveProviderId ||
      original.runs.length !== 1 ||
      run?.state !== 'uncertain' ||
      run.createdAt < new Date('2026-10-22T18:23:00Z') ||
      run.createdAt > new Date('2026-10-22T18:24:00Z')
    )
      throw new Error('RECOVERY_TARGET_MISMATCH');
    if (command === 'reconcile') {
      const evidenceHash = createHash('sha256')
        .update(readFileSync('.artifacts/d13/gemini-20261022-dashboard.png'))
        .digest('hex');
      if (
        evidenceHash !==
        '1be39c3eaa8c74c86351d8c7f54122ffc90f218f71f272c742dc11a747b8fc92'
      )
        throw new Error('RECOVERY_EVIDENCE_MISMATCH');
      await reconcileGenerationCost(db, {
        attemptId: run.id,
        costMicroEur: 0,
        evidenceHash,
        note: 'Operator-reviewed user dashboard: nexo-school Free tier, Gemini Flash request at 10:23 UTC-8 / 18:23 UTC, 503 ServiceUnavailable, no output-token data. Historical free-tier cost reconciled to zero. User enabled billing subsequently; future calls retain paid-rate reservations. Source: docs/engineering/d13-gemini-recovery.md.',
      });
    } else {
      if (!run.reconciliation || run.reconciliation.costMicroEur !== 0)
        throw new Error('RECONCILE_FIRST');
      await enqueueGeneration(
        db,
        {
          requestId: retryId,
          specification: smokeSpecification('gemini-3.8-flash', 'solve'),
          feature: 'review',
        },
        liveProviderId,
      );
    }
  }
  const retryJob = await db.generationJob.findUnique({
    where: { requestId: retryId },
  });
  if (retryJob)
    manifest.push({
      model: 'gemini-3.8-flash',
      stage: 'solve',
      requestId: retryId,
      specification: smokeSpecification('gemini-3.8-flash', 'solve'),
    });
  if (command === 'execute' || command === 'retry-gemini') {
    if (Date.now() >= Date.parse('2026-11-01T00:00:00Z'))
      throw new Error('PRICE_MANIFEST_EXPIRED');
    const keys = readBenchmarkKeys(resolve('.env.d13.local'));
    if (!keys.OPENAI_API_KEY || !keys.ANTHROPIC_API_KEY || !keys.GEMINI_API_KEY)
      throw new Error('MISSING_KEYS');
    for (const { requestId, specification } of manifest)
      await enqueueGeneration(
        db,
        { requestId, specification, feature: 'review' },
        liveProviderId,
      );
    const provider = createLiveReviewProvider(keys, fetch, (model, code) =>
      console.error(`D13 ${model}: ${code}`),
    );
    for (let i = 0; i < manifest.length; i++) {
      const status = await runGenerationOnce(db, 10_000_000, provider);
      console.error(
        `D13 bounded dispatch ${i + 1}/${manifest.length}: ${status}`,
      );
      if (status === 'idle') break;
      if (
        await db.generationAttempt.count({
          where: {
            state: 'uncertain',
            reconciliation: null,
            job: { provider: liveProviderId },
          },
        })
      )
        break;
    }
  }
  const jobs = await db.generationJob.findMany({
    where: { provider: liveProviderId },
    include: { runs: { include: { reconciliation: true } } },
  });
  const rows = manifest.map(({ model, stage, requestId }) => {
    const job = jobs.find((j) => j.requestId === requestId);
    let response: unknown = null;
    if (job?.result) {
      try {
        response = JSON.parse(JSON.parse(job.result).draft);
      } catch {
        /* Unresolved. */
      }
    }
    return {
      model,
      stage,
      requestId,
      recoveryOf: requestId === retryId ? originalGeminiId : null,
      reconciliations:
        job?.runs.flatMap((r) =>
          r.reconciliation ? [r.reconciliation] : [],
        ) ?? [],
      state: job?.state ?? 'not-enqueued',
      attempts: job?.runs.length ?? 0,
      committedMicroEur:
        job?.runs.reduce(
          (sum, r) =>
            sum +
            (r.reconciliation?.costMicroEur ??
              r.chargedMicroEur ??
              r.reservedMicroEur),
          0,
        ) ?? 0,
      unknownUsageAttempts:
        job?.runs.filter(
          (r) => r.inputTokens === null || r.outputTokens === null,
        ).length ?? 0,
      unresolvedCostAttempts:
        job?.runs.filter((r) => r.state === 'uncertain' && !r.reconciliation)
          .length ?? 0,
      response,
    };
  });
  const report = {
    mode: 'authorized-live-technical-smoke',
    policy: livePolicyVersion,
    requestSetHash: fingerprint(manifest),
    reportedAt: new Date().toISOString(),
    runCeilingMicroEur: liveRunCeilingMicroEur,
    monthlyCeilingMicroEur: 10_000_000,
    humanAdjudication: 'pending',
    educationalApproval: false,
    qualityRanking: null,
    invoiceReconciliation: 'pending',
    costBasis:
      'conservative-token-price-and-FX-tax-ceiling; not exact vendor invoice',
    committedMicroEur: rows.reduce((sum, r) => sum + r.committedMicroEur, 0),
    monthlyBudgets: await db.generationBudget.findMany(),
    rows,
  };
  mkdirSync('.artifacts/d13', { recursive: true, mode: 0o700 });
  const temp = `.artifacts/d13/smoke-report-${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(report, null, 2) + '\n', {
    mode: 0o600,
    flag: 'wx',
  });
  renameSync(temp, '.artifacts/d13/smoke-report.json');
  console.log(JSON.stringify(report, null, 2));
} catch {
  console.error(
    'LIVE_SMOKE_STOPPED: inspect the durable local ledger and configuration; no secrets or raw errors are printed.',
  );
  process.exitCode = 1;
} finally {
  await db?.$disconnect();
}
