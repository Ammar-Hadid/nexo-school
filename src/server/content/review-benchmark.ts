import 'server-only';
import type { PrismaClient } from '../../generated/prisma/client';
import { canonicalJson } from '../../modules/content/content-records.ts';
import {
  benchmarkCases,
  benchmarkVersion,
  modelProfiles,
  type ModelProfile,
} from '../../modules/content/review-benchmark/fixtures.ts';
import {
  fingerprint,
  reviewRequest,
  summarizeBenchmark,
  type Observation,
  type Stage,
} from '../../modules/content/review-benchmark/benchmark.ts';
import { enqueueGeneration } from './generation-jobs.ts';

function requests(runId: string, model: ModelProfile) {
  if (!/^[a-zA-Z0-9_-]{1,30}$/.test(runId) || !modelProfiles.includes(model))
    throw new Error('INVALID_BENCHMARK_RUN');
  return benchmarkCases.flatMap(({ candidate }) =>
    (['solve', 'semantic'] as Stage[]).map((stage) => ({
      candidateId: candidate.id,
      stage,
      requestId: `d13-${runId}-${model}-${candidate.id}-${stage}`,
      specification: canonicalJson(reviewRequest(candidate, stage, model)),
    })),
  );
}
/** Re-enqueue after a crash is safe. A changed benchmark under the same run conflicts. */
export async function enqueueReviewBenchmark(
  db: PrismaClient,
  runId: string,
  model: ModelProfile,
) {
  for (const request of requests(runId, model))
    await enqueueGeneration(db, {
      requestId: request.requestId,
      feature: 'review',
      specification: request.specification,
    });
}
/** Reads durable receipts including all uncertain/retried attempts, never model-supplied costs. */
export async function readReviewBenchmark(
  db: PrismaClient,
  runId: string,
  model: ModelProfile,
) {
  const observations: Observation[] = [];
  for (const request of requests(runId, model)) {
    const job = await db.generationJob.findUnique({
      where: { requestId: request.requestId },
      include: { runs: true },
    });
    if (!job) continue;
    if (job.feature !== 'review' || job.specification !== request.specification)
      throw new Error('BENCHMARK_VERSION_CONFLICT');
    let response: unknown = null;
    if (job.state === 'succeeded' && job.result) {
      try {
        response = JSON.parse(JSON.parse(job.result).draft);
      } catch {
        /* Invalid output remains unresolved. */
      }
    }
    observations.push({
      candidateId: request.candidateId,
      stage: request.stage,
      response,
      attemptCount: job.runs.length,
      chargedMicroEur: job.runs.reduce(
        (n, run) => n + (run.chargedMicroEur ?? run.reservedMicroEur),
        0,
      ),
      inputTokens: job.runs.reduce((n, r) => n + (r.inputTokens ?? 0), 0),
      outputTokens: job.runs.reduce((n, r) => n + (r.outputTokens ?? 0), 0),
      unknownUsageCalls: job.runs.filter(
        (r) => r.inputTokens === null || r.outputTokens === null,
      ).length,
    });
  }
  return {
    runId,
    requestSetHash: fingerprint(requests(runId, model)),
    ...summarizeBenchmark(model, observations),
  };
}

/** Zero-network/zero-database smoke report; never a ledger or real model result. */
export async function simulateReviewBenchmark() {
  const { fakeReviewProvider } = await import('./fake-review-provider.ts');
  const reports = [];
  for (const model of modelProfiles) {
    const observations: Observation[] = [];
    for (const request of requests('offline-smoke', model)) {
      const receipt = await fakeReviewProvider.generate({
        specification: request.specification,
        feature: 'review',
        idempotencyKey: request.requestId,
        signal: new AbortController().signal,
      });
      observations.push({
        candidateId: request.candidateId,
        stage: request.stage,
        response: JSON.parse(receipt.draft),
        chargedMicroEur: receipt.costMicroEur,
        inputTokens: receipt.inputTokens,
        outputTokens: receipt.outputTokens,
        attemptCount: 1,
      });
    }
    reports.push(summarizeBenchmark(model, observations));
  }
  return {
    version: benchmarkVersion,
    source: 'offline-scripted-smoke-not-durable-ledger',
    reports,
  };
}
