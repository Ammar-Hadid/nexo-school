import {
  generatorProviderId,
  generatorPolicy,
  generatorManifest,
  readGeneratorRequest,
  generatorExperimentCeiling,
  generatorUsageStop,
} from '../../modules/content/review-benchmark/generator.ts';
import {
  expandedProviderId,
  expandedPolicy,
} from '../../modules/content/review-benchmark/expanded.ts';
import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '../../generated/prisma/client';
import {
  canonicalJson,
  record,
} from '../../modules/content/content-records.ts';
import {
  generationPolicy as fakePolicy,
  validateGenerationRequest,
  validateMonthlyCap,
} from '../../modules/content/generation-policy.ts';

import {
  liveProviderId,
  liveRunCeilingMicroEur,
  smokePolicy,
} from '../../modules/content/review-benchmark/live-smoke.ts';
export type ProviderId =
  | 'fake-v1'
  | typeof liveProviderId
  | typeof expandedProviderId
  | typeof generatorProviderId;
function executionPolicy(provider: string, specification: string) {
  if (provider === generatorProviderId) return generatorPolicy(specification);
  if (provider === 'fake-v1') return fakePolicy;
  if (provider === liveProviderId) return smokePolicy(specification);
  if (provider === expandedProviderId) return expandedPolicy(specification);
  throw new Error('PROVIDER_NOT_ENABLED');
}

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');
async function locked<T>(
  db: PrismaClient,
  action: (tx: Prisma.TransactionClient, now: Date) => Promise<T>,
) {
  return db.$transaction(async (tx) => {
    // One short shared lock covers every feature, enqueue, claim and settlement.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(120012)`;
    const [clock] = await tx.$queryRaw<
      { now: Date }[]
    >`SELECT clock_timestamp() AT TIME ZONE 'UTC' AS now`;
    return action(tx, clock!.now);
  });
}

/** Internal trusted operator/worker use case; not exposed to browsers or HTTP. */
export async function enqueueGeneration(
  db: PrismaClient,
  input: unknown,
  provider: ProviderId = 'fake-v1',
) {
  const request = validateGenerationRequest(input);
  const policy = executionPolicy(provider, request.specification);
  if (
    provider !== 'fake-v1' &&
    provider !== generatorProviderId &&
    request.feature !== 'review'
  )
    throw new Error('SMOKE_REVIEW_ONLY');
  const generator =
    provider === generatorProviderId
      ? readGeneratorRequest(request.specification)
      : null;
  if (generator) {
    const parent = generatorManifest.find((m) =>
      generator.phase === 'generate'
        ? m.model === generator.model && m.briefId === generator.briefId
        : m.requestId === generator.parentRequestId,
    );
    if (
      !parent ||
      request.requestId !==
        (generator.phase === 'generate'
          ? parent.requestId
          : `${parent.requestId}-review`) ||
      request.feature !==
        (generator.phase === 'generate' ? 'generation' : 'review')
    )
      throw new Error('GENERATOR_MANIFEST_CONFLICT');
  }
  const requestHash = hash(
    canonicalJson({
      ...request,
      policy: policy.version,
      provider: policy.provider,
    }),
  );
  return locked(db, async (tx, now) => {
    const existing = await tx.generationJob.findUnique({
      where: { requestId: request.requestId },
    });
    if (existing) {
      if (existing.requestHash !== requestHash)
        throw new Error('GENERATION_REQUEST_CONFLICT');
      return existing;
    }
    if (generator?.phase === 'review') {
      const parent = await tx.generationJob.findUnique({
        where: { requestId: generator.parentRequestId },
      });
      if (
        parent?.provider !== generatorProviderId ||
        parent.feature !== 'generation' ||
        parent.state !== 'succeeded' ||
        !parent.result ||
        canonicalJson(JSON.parse(JSON.parse(parent.result).draft).candidate) !==
          canonicalJson(generator.candidate)
      )
        throw new Error('GENERATOR_REVIEW_PROVENANCE_CONFLICT');
    }
    return tx.generationJob.create({
      data: {
        id: randomUUID(),
        ...request,
        requestHash,
        policyVersion: policy.version,
        provider: policy.provider,
        // Use the same millisecond database clock as claims. A timestamp default
        // can round a sub-millisecond enqueue instant ahead of the next claim.
        availableAt: now,
      },
    });
  });
}

export async function claimGeneration(
  db: PrismaClient,
  monthlyCapMicroEur: number,
  provider: ProviderId = 'fake-v1',
) {
  const cap = validateMonthlyCap(monthlyCapMicroEur);
  if (
    ![
      'fake-v1',
      liveProviderId,
      expandedProviderId,
      generatorProviderId,
    ].includes(provider)
  )
    throw new Error('PROVIDER_NOT_ENABLED');
  if (
    provider !== 'fake-v1' &&
    Date.now() >= Date.parse('2026-11-01T00:00:00Z')
  )
    throw new Error('LIVE_PRICE_MANIFEST_EXPIRED');
  return locked(db, async (tx, now) => {
    // Recover a crashed process conservatively, including a crash before sending.
    const expired = await tx.generationAttempt.findMany({
      where: { state: 'reserved', leaseUntil: { lte: now } },
      include: { job: true },
    });
    for (const run of expired) {
      const policy = executionPolicy(run.job.provider, run.job.specification);
      await tx.generationAttempt.update({
        where: { id: run.id },
        data: { state: 'uncertain', chargedMicroEur: run.reservedMicroEur },
      });
      await tx.generationJob.update({
        where: { id: run.jobId },
        data: {
          state: run.sequence >= policy.maxAttempts ? 'failed' : 'queued',
          availableAt: now,
        },
      });
    }
    if (await tx.generationAttempt.count({ where: { state: 'reserved' } }))
      return null;
    const job = await tx.generationJob.findFirst({
      where: { provider, state: 'queued', availableAt: { lte: now } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    if (!job) return null;
    const policy = executionPolicy(job.provider, job.specification);
    if (job.policyVersion !== policy.version)
      throw new Error('POLICY_VERSION_CONFLICT');
    if (provider !== 'fake-v1') {
      if (
        await tx.generationAttempt.count({
          where: {
            state: 'uncertain',
            reconciliation: null,
            job: {
              provider: {
                in: [liveProviderId, expandedProviderId, generatorProviderId],
              },
            },
          },
        })
      )
        return null;
      const attempts = await tx.generationAttempt.findMany({
        where: {
          job: {
            provider: {
              in: [liveProviderId, expandedProviderId, generatorProviderId],
            },
          },
        },
        include: { reconciliation: true, job: true },
      });
      const committed = attempts.reduce(
        (sum, run) =>
          sum +
          (run.reconciliation?.costMicroEur ??
            run.chargedMicroEur ??
            run.reservedMicroEur),
        0,
      );
      if (provider === generatorProviderId) {
        const own = attempts
          .filter((a) => a.job.provider === generatorProviderId)
          .reduce(
            (n, a) =>
              n +
              (a.reconciliation?.costMicroEur ??
                a.chargedMicroEur ??
                a.reservedMicroEur),
            0,
          );
        if (
          own >= generatorUsageStop ||
          own + policy.reservationMicroEur > generatorExperimentCeiling
        )
          return null;
      }
      if (
        committed + policy.reservationMicroEur >
        (provider === liveProviderId ? liveRunCeilingMicroEur : 10_000_000)
      )
        return null;
    }
    const period = now.toISOString().slice(0, 7);
    const budget = await tx.generationBudget.upsert({
      where: { period },
      create: { period, capMicroEur: cap },
      update: {},
    });
    if (budget.capMicroEur !== cap) throw new Error('MONTHLY_CAP_CONFLICT');
    if (budget.committedMicroEur + policy.reservationMicroEur > cap)
      return null;
    await tx.generationBudget.update({
      where: { period },
      data: { committedMicroEur: { increment: policy.reservationMicroEur } },
    });
    const run = await tx.generationAttempt.create({
      data: {
        id: randomUUID(),
        jobId: job.id,
        sequence: job.attempts + 1,
        period,
        leaseUntil: new Date(now.getTime() + policy.leaseMs),
        reservedMicroEur: policy.reservationMicroEur,
      },
    });
    await tx.generationJob.update({
      where: { id: job.id },
      data: { state: 'running', attempts: run.sequence },
    });
    return { job, run };
  });
}
export type GenerationLease = NonNullable<
  Awaited<ReturnType<typeof claimGeneration>>
>;
export type ProviderResult = {
  draft: string;
  costMicroEur: number;
  inputTokens: number;
  outputTokens: number;
};
export interface GenerationProvider {
  readonly id: ProviderId;
  generate(input: {
    specification: string;
    feature: string;
    idempotencyKey: string;
    signal: AbortSignal;
  }): Promise<ProviderResult>;
}
function validResult(
  value: unknown,
  reservedMicroEur: number,
): value is ProviderResult {
  return (
    record(value) &&
    typeof value.draft === 'string' &&
    value.draft.trim().length > 0 &&
    value.draft.length <= 8000 &&
    canonicalJson(value.draft).length <= 15000 &&
    Number.isSafeInteger(value.costMicroEur) &&
    typeof value.costMicroEur === 'number' &&
    value.costMicroEur >= 0 &&
    value.costMicroEur <= reservedMicroEur &&
    [value.inputTokens, value.outputTokens].every(
      (n) =>
        typeof n === 'number' &&
        Number.isSafeInteger(n) &&
        n >= 0 &&
        n <= 1_050_000,
    )
  );
}

/** Fenced by durable attempt ID, state, sequence and database lease time. */
export async function finishGeneration(
  db: PrismaClient,
  attemptId: string,
  result: ProviderResult | null,
) {
  return locked(db, async (tx, now) => {
    const run = await tx.generationAttempt.findUnique({
      where: { id: attemptId },
      include: { job: true },
    });
    if (
      !run ||
      run.state !== 'reserved' ||
      run.leaseUntil <= now ||
      run.job.state !== 'running' ||
      run.job.attempts !== run.sequence
    )
      return false;
    const policy = executionPolicy(run.job.provider, run.job.specification);
    if (!result || !validResult(result, run.reservedMicroEur)) {
      await tx.generationAttempt.update({
        where: { id: run.id },
        data: { state: 'uncertain', chargedMicroEur: run.reservedMicroEur },
      });
      await tx.generationJob.update({
        where: { id: run.jobId },
        data: {
          state: run.sequence >= policy.maxAttempts ? 'failed' : 'queued',
          availableAt: new Date(
            now.getTime() + policy.retryDelayMs * run.sequence,
          ),
        },
      });
      return true;
    }
    const snapshot = canonicalJson({
      draft: result.draft,
      status: 'unreviewed-synthetic',
      provider: policy.provider,
      policy: policy.version,
    });
    await tx.generationAttempt.update({
      where: { id: run.id },
      data: {
        state: 'settled',
        chargedMicroEur: result.costMicroEur,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      },
    });
    await tx.generationBudget.update({
      where: { period: run.period },
      data: {
        committedMicroEur: {
          decrement: run.reservedMicroEur - result.costMicroEur,
        },
      },
    });
    await tx.generationJob.update({
      where: { id: run.jobId },
      data: {
        state: 'succeeded',
        result: snapshot,
        resultHash: hash(snapshot),
      },
    });
    return true;
  });
}

/** One call, outside transactions. Timeout remains effective even for a non-cooperative adapter. */
export async function runGenerationOnce(
  db: PrismaClient,
  cap: number,
  provider: GenerationProvider,
) {
  if (
    ![
      'fake-v1',
      liveProviderId,
      expandedProviderId,
      generatorProviderId,
    ].includes(provider.id)
  )
    throw new Error('PROVIDER_NOT_ENABLED');
  const lease = await claimGeneration(db, cap, provider.id);
  if (!lease) return 'idle' as const;
  const policy = executionPolicy(lease.job.provider, lease.job.specification);
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let result: ProviderResult | null = null;
  try {
    result = await Promise.race([
      Promise.resolve().then(() =>
        provider.generate({
          specification: lease.job.specification,
          feature: lease.job.feature,
          idempotencyKey: lease.run.id,
          signal: controller.signal,
        }),
      ),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('PROVIDER_TIMEOUT'));
        }, policy.timeoutMs);
      }),
    ]);
  } catch {
    // Never persist provider errors: they may contain prompts, keys or credentials.
  } finally {
    clearTimeout(timer);
  }
  const accepted = await finishGeneration(db, lease.run.id, result);
  return accepted ? ('processed' as const) : ('stale' as const);
}

/** Same-image scheduled entry point; explicit bounded burst, no permanent polling loop. */
export async function runGenerationBurst(
  db: PrismaClient,
  cap: number,
  provider: GenerationProvider,
  limit = 3,
) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 3)
    throw new Error('INVALID_BURST_LIMIT');
  const results = [];
  for (let index = 0; index < limit; index++) {
    const result = await runGenerationOnce(db, cap, provider);
    results.push(result);
    if (result === 'idle') break;
  }
  return results;
}

/** Trusted operator evidence, not an API receipt. Does not rewrite failed jobs or unknown tokens. */
export async function reconcileGenerationCost(
  db: PrismaClient,
  input: {
    attemptId: string;
    costMicroEur: number;
    evidenceHash: string;
    note: string;
  },
) {
  if (
    !/^[a-zA-Z0-9_-]{1,100}$/.test(input.attemptId) ||
    !Number.isSafeInteger(input.costMicroEur) ||
    input.costMicroEur < 0 ||
    input.costMicroEur > liveRunCeilingMicroEur ||
    !/^[a-f0-9]{64}$/.test(input.evidenceHash) ||
    !input.note.trim() ||
    input.note.length > 2000
  )
    throw new Error('INVALID_RECONCILIATION');
  return locked(db, async (tx) => {
    const existing = await tx.generationCostReconciliation.findUnique({
      where: { attemptId: input.attemptId },
    });
    if (existing) {
      if (
        existing.costMicroEur !== input.costMicroEur ||
        existing.evidenceHash !== input.evidenceHash ||
        existing.note !== input.note
      )
        throw new Error('RECONCILIATION_CONFLICT');
      return existing;
    }
    // The INSERT trigger validates the attempt and atomically adjusts its original month's budget.
    return tx.generationCostReconciliation.create({ data: input });
  });
}
