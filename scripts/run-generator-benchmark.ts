import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { fingerprint } from '../src/modules/content/review-benchmark/benchmark.ts';
import {
  generatorProviderId,
  generatorVersion,
  generatorManifest,
  generatorModels,
  generatorBriefs,
  generatorReviewRequest,
  checkGeneratedExercise,
  generatorExperimentCeiling,
  generatorUsageStop,
} from '../src/modules/content/review-benchmark/generator.ts';
import { parseExpandedReview } from '../src/modules/content/review-benchmark/expanded.ts';
import { readBenchmarkKeys } from '../src/server/content/benchmark-setup.ts';
import {
  createLiveReviewProvider,
  buildLiveRequest,
} from '../src/server/content/live-review-provider.ts';
import {
  enqueueGeneration,
  runGenerationOnce,
} from '../src/server/content/generation-jobs.ts';
import type { Candidate } from '../src/modules/content/review-benchmark/fixtures.ts';
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
      where: { provider: generatorProviderId },
      include: { runs: { include: { reconciliation: true } } },
    });
    const rows = generatorManifest.map((m) => {
      const generation = jobs.find((j) => j.requestId === m.requestId),
        reviewJob = jobs.find((j) => j.requestId === `${m.requestId}-review`);
      const receipt = (
        result: string | null | undefined,
      ): {
        candidate?: Candidate | null;
        review?: unknown;
        responseText?: string;
      } | null => {
        try {
          return result ? JSON.parse(JSON.parse(result).draft) : null;
        } catch {
          return null;
        }
      };
      const generated = receipt(generation?.result),
        reviewed = receipt(reviewJob?.result);
      const candidate = generated?.candidate ?? null;
      const review =
        candidate && reviewed
          ? parseExpandedReview(candidate, 'semantic', reviewed.review)
          : null;
      const runs = [...(generation?.runs ?? []), ...(reviewJob?.runs ?? [])];
      return {
        ...m,
        generationState: generation?.state ?? 'not-enqueued',
        reviewState: reviewJob?.state ?? 'not-enqueued',
        candidate,
        review,
        mechanical: candidate
          ? checkGeneratedExercise(m.briefId, candidate)
          : null,
        generationReceipt: generated,
        reviewReceipt: reviewed,
        reviewRequestHash: reviewJob
          ? fingerprint(buildLiveRequest(reviewJob.specification, 'generator'))
          : null,
        attempts: runs.length,
        costMicroEur: runs.reduce(
          (n, a) =>
            n +
            (a.reconciliation?.costMicroEur ??
              a.chargedMicroEur ??
              a.reservedMicroEur),
          0,
        ),
        generationCostMicroEur: (generation?.runs ?? []).reduce(
          (n, a) =>
            n +
            (a.reconciliation?.costMicroEur ??
              a.chargedMicroEur ??
              a.reservedMicroEur),
          0,
        ),
        reviewCostMicroEur: (reviewJob?.runs ?? []).reduce(
          (n, a) =>
            n +
            (a.reconciliation?.costMicroEur ??
              a.chargedMicroEur ??
              a.reservedMicroEur),
          0,
        ),
        knownInputTokens: runs.reduce((n, a) => n + (a.inputTokens ?? 0), 0),
        knownOutputTokens: runs.reduce((n, a) => n + (a.outputTokens ?? 0), 0),
        unresolvedCostAttempts: runs.filter(
          (a) => a.state === 'uncertain' && !a.reconciliation,
        ).length,
        humanApproval: 'pending',
        reviewerModel: 'claude-haiku-5-5',
        sameModelReview: m.model === 'claude-haiku-5-5',
      };
    });
    const summaries = generatorModels.flatMap((model) =>
      ['taal', 'spelling', 'word-problems', 'reading'].map((type) => {
        const group = rows.filter((r) => r.model === model && r.type === type);
        const provisionalPass = group.filter(
          (r) =>
            r.mechanical?.findings.length === 0 && r.review?.status === 'clear',
        ).length;
        const costMicroEur = group.reduce((n, r) => n + r.costMicroEur, 0);
        return {
          model,
          type,
          plannedItems: 2,
          validOutputs: group.filter((r) => r.candidate).length,
          mechanicallyPassing: group.filter(
            (r) => r.mechanical?.findings.length === 0,
          ).length,
          haikuClear: group.filter((r) => r.review?.status === 'clear').length,
          haikuFlagged: group.filter((r) => r.review?.status === 'flagged')
            .length,
          reviewUnresolved: group.filter(
            (r) => !r.review || r.review.status === 'abstain',
          ).length,
          provisionalPass,
          costMicroEur,
          costPerProvisionalPassingDraftMicroEur: provisionalPass
            ? Math.ceil(costMicroEur / provisionalPass)
            : null,
        };
      }),
    );
    const result = {
      version: generatorVersion,
      reportedAt: new Date().toISOString(),
      manifestHash: fingerprint(generatorManifest),
      briefHash: fingerprint(generatorBriefs),
      providerRequestHash: fingerprint(
        generatorManifest.map((m) =>
          buildLiveRequest(m.specification, 'generator'),
        ),
      ),
      maxCalls: 64,
      experimentReservationCeilingMicroEur: generatorExperimentCeiling,
      usageStopMicroEur: generatorUsageStop,
      monthlyCeilingMicroEur: 10_000_000,
      monthlyBudgets: await database.generationBudget.findMany(),
      costBasis: 'conservative-usage-and-FX-tax-ceiling-not-invoice',
      invoiceReconciliation: 'pending',
      humanApproval: 'pending',
      publicationEnabled: false,
      attempts: rows.reduce((n, r) => n + r.attempts, 0),
      committedMicroEur: rows.reduce((n, r) => n + r.costMicroEur, 0),
      validOutputs: rows.filter((r) => r.candidate).length,
      validReviews: rows.filter((r) => r.review).length,
      unresolvedCostAttempts: rows.reduce(
        (n, r) => n + r.unresolvedCostAttempts,
        0,
      ),
      summaries,
      rows,
    };
    mkdirSync('.artifacts/d13', { recursive: true, mode: 0o700 });
    const temp = `.artifacts/d13/generator-report-${process.pid}.tmp`;
    writeFileSync(temp, JSON.stringify(result, null, 2) + '\n', {
      mode: 0o600,
      flag: 'wx',
    });
    renameSync(temp, '.artifacts/d13/generator-report.json');
    console.log(
      JSON.stringify({
        at: result.reportedAt,
        attempts: result.attempts,
        validOutputs: result.validOutputs,
        validReviews: result.validReviews,
        committedMicroEur: result.committedMicroEur,
        unresolvedCostAttempts: result.unresolvedCostAttempts,
        monthlyBudgets: result.monthlyBudgets,
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
    for (const m of generatorManifest)
      await enqueueGeneration(
        database,
        {
          requestId: m.requestId,
          feature: 'generation',
          specification: m.specification,
        },
        generatorProviderId,
      );
    const provider = createLiveReviewProvider(
      keys,
      fetch,
      (model, code) => console.error(`D13 generator ${model}: ${code}`),
      'generator',
    );
    for (let i = 0; i < 64; i++) {
      const completed = await database.generationJob.findMany({
        where: {
          provider: generatorProviderId,
          feature: 'generation',
          state: 'succeeded',
        },
      });
      for (const job of completed) {
        const candidate = JSON.parse(JSON.parse(job.result!).draft)
          .candidate as Candidate | null;
        if (candidate)
          await enqueueGeneration(
            database,
            {
              requestId: `${job.requestId}-review`,
              feature: 'review',
              specification: generatorReviewRequest(job.requestId, candidate),
            },
            generatorProviderId,
          );
      }
      const state = await runGenerationOnce(database, 10_000_000, provider);
      if ((i + 1) % 4 === 0 || state === 'idle') await report();
      if (
        state === 'idle' ||
        (await database.generationAttempt.count({
          where: {
            state: 'uncertain',
            reconciliation: null,
            job: { provider: generatorProviderId },
          },
        }))
      )
        break;
    }
    await report();
  }
} catch {
  console.error(
    'GENERATOR_BENCHMARK_STOPPED: inspect the durable ledger and private configuration; no raw errors or secrets printed.',
  );
  process.exitCode = 1;
} finally {
  await db?.$disconnect();
}
