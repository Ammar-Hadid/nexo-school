import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { fingerprint } from '../src/modules/content/review-benchmark/benchmark.ts';
import {
  expandedProviderId,
  expandedVersion,
  expandedManifest as manifest,
  expandedModels as models,
  screeningCases,
  referenceHash,
  parseExpandedReview,
  summarizeExpanded,
} from '../src/modules/content/review-benchmark/expanded.ts';
import { readBenchmarkKeys } from '../src/server/content/benchmark-setup.ts';
import {
  createLiveReviewProvider,
  buildLiveRequest,
} from '../src/server/content/live-review-provider.ts';
import {
  enqueueGeneration,
  runGenerationOnce,
} from '../src/server/content/generation-jobs.ts';

let db: PrismaClient | undefined;
try {
  const command = process.argv[2];
  if (process.argv.length !== 3 || !['report', 'run'].includes(command ?? ''))
    throw new Error('INVALID_COMMAND');
  const url = new URL(process.env.DATABASE_URL ?? '');
  if (
    url.protocol !== 'postgresql:' ||
    url.hostname !== '127.0.0.1' ||
    url.pathname !== '/nexo_benchmark_local' ||
    url.search
  )
    throw new Error('LOCAL_DATABASE_REQUIRED');
  db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url.toString() }),
  });
  const database = db;
  async function report() {
    const jobs = await database.generationJob.findMany({
      where: { provider: expandedProviderId },
      include: { runs: { include: { reconciliation: true } } },
    });
    const observations = manifest.map((m) => {
      const job = jobs.find((j) => j.requestId === m.requestId);
      const candidate = screeningCases.find(
        (c) => c.candidate.id === m.id,
      )!.candidate;
      let review = null;
      let receipt: unknown = null;
      if (job?.result) {
        try {
          const draft = JSON.parse(JSON.parse(job.result).draft);
          receipt = draft;
          review = parseExpandedReview(candidate, m.stage, draft.review);
        } catch {
          /* Retain unresolved result and cost. */
        }
      }
      const runs = job?.runs ?? [];
      return {
        model: m.model,
        id: m.id,
        stage: m.stage,
        requestId: m.requestId,
        state: job?.state ?? 'not-enqueued',
        review,
        receipt,
        attempts: runs.length,
        costMicroEur: runs.reduce(
          (n, r) =>
            n +
            (r.reconciliation?.costMicroEur ??
              r.chargedMicroEur ??
              r.reservedMicroEur),
          0,
        ),
        inputTokens:
          runs.length && runs.every((r) => r.inputTokens !== null)
            ? runs.reduce((n, r) => n + r.inputTokens!, 0)
            : null,
        outputTokens:
          runs.length && runs.every((r) => r.outputTokens !== null)
            ? runs.reduce((n, r) => n + r.outputTokens!, 0)
            : null,
        unresolvedCost: runs.some(
          (r) => r.state === 'uncertain' && !r.reconciliation,
        ),
      };
    });
    const summaries = models.map((model) =>
      summarizeExpanded(
        model,
        observations.filter((o) => o.model === model),
      ),
    );
    const result = {
      mode: 'authorized-provisional-reviewer-screen',
      version: expandedVersion,
      referenceHash,
      requestSetHash: fingerprint(manifest),
      providerRequestHash: fingerprint(
        manifest.map((m) => buildLiveRequest(m.specification, 'expanded')),
      ),
      reportedAt: new Date().toISOString(),
      plannedCalls: 560,
      screeningItems: 40,
      validationItemsNotDispatched: 40,
      humanApproval: 'pending',
      educationalApproval: false,
      invoiceReconciliation: 'pending',
      costBasis:
        'conservative-token-price-and-FX-tax-ceiling; not exact vendor invoice',
      monthlyCeilingMicroEur: 10_000_000,
      monthlyBudgets: await database.generationBudget.findMany(),
      attempts: observations.reduce((n, o) => n + o.attempts, 0),
      validResponses: observations.filter((o) => o.review).length,
      committedMicroEur: observations.reduce((n, o) => n + o.costMicroEur, 0),
      summaries,
      observations,
    };
    mkdirSync('.artifacts/d13', { recursive: true, mode: 0o700 });
    const temp = `.artifacts/d13/expanded-report-${process.pid}.tmp`;
    writeFileSync(temp, JSON.stringify(result, null, 2) + '\n', {
      mode: 0o600,
      flag: 'wx',
    });
    renameSync(temp, '.artifacts/d13/expanded-report.json');
    console.log(
      JSON.stringify({
        at: result.reportedAt,
        attempts: result.attempts,
        validResponses: result.validResponses,
        committedMicroEur: result.committedMicroEur,
        monthlyBudgets: result.monthlyBudgets,
        models: summaries.map(
          ({
            model,
            attempts,
            objective,
            linguistic,
            provisional,
            committedMicroEur,
            unresolvedCostAttempts,
          }) => ({
            model,
            attempts,
            objective,
            linguistic,
            provisional,
            committedMicroEur,
            unresolvedCostAttempts,
          }),
        ),
      }),
    );
    return result;
  }
  await report();
  if (command === 'run') {
    if (Date.now() >= Date.parse('2026-11-01T00:00:00Z'))
      throw new Error('PRICE_MANIFEST_EXPIRED');
    const keys = readBenchmarkKeys(resolve('.env.d13.local'));
    if (!keys.OPENAI_API_KEY || !keys.ANTHROPIC_API_KEY || !keys.GEMINI_API_KEY)
      throw new Error('MISSING_KEYS');
    for (const { requestId, specification } of manifest)
      await enqueueGeneration(
        database,
        { requestId, specification, feature: 'review' },
        expandedProviderId,
      );
    const provider = createLiveReviewProvider(
      keys,
      fetch,
      (model, code) => console.error(`D13 ${model}: ${code}`),
      'expanded',
    );
    for (let i = 0; i < manifest.length; i++) {
      const state = await runGenerationOnce(database, 10_000_000, provider);
      if ((i + 1) % 10 === 0 || state === 'idle') await report();
      if (
        state === 'idle' ||
        (await database.generationAttempt.count({
          where: {
            state: 'uncertain',
            reconciliation: null,
            job: { provider: expandedProviderId },
          },
        }))
      )
        break;
    }
    await report();
  }
} catch {
  console.error(
    'EXPANDED_BENCHMARK_STOPPED: inspect the durable ledger and configuration; no raw errors or secrets printed.',
  );
  process.exitCode = 1;
} finally {
  await db?.$disconnect();
}
