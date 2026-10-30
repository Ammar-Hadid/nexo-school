import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db } from './helpers';
import {
  enqueueGeneration,
  claimGeneration,
  finishGeneration,
} from '../../src/server/content/generation-jobs';
import {
  liveProviderId,
  smokeSpecification,
} from '../../src/modules/content/review-benchmark/live-smoke';

beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "GenerationJob", "GenerationBudget" CASCADE',
  );
});
afterAll(() => db.$disconnect());
const request = (id: string, model = 'claude-opus-5-5') => ({
  requestId: id,
  feature: 'review',
  specification: smokeSpecification(model, 'solve'),
});

it('preserves separate worker lanes and shared atomic reservations, settling/refunding exactly once', async () => {
  const job = await enqueueGeneration(db, request('live-1'), liveProviderId);
  expect(
    (await enqueueGeneration(db, request('live-1'), liveProviderId)).id,
  ).toBe(job.id);
  expect(await claimGeneration(db, 10_000_000)).toBeNull();
  const leases = await Promise.all([
    claimGeneration(db, 10_000_000, liveProviderId),
    claimGeneration(db, 10_000_000, liveProviderId),
  ]);
  expect(leases.filter(Boolean)).toHaveLength(1);
  const run = leases.find(Boolean)!.run;
  expect(run.reservedMicroEur).toBeGreaterThan(6_000_000);
  expect(
    await finishGeneration(db, run.id, {
      draft: 'synthetic receipt',
      inputTokens: 100,
      outputTokens: 100,
      costMicroEur: 3600,
    }),
  ).toBe(true);
  expect(await finishGeneration(db, run.id, null)).toBe(false);
  expect((await db.generationBudget.findFirstOrThrow()).committedMicroEur).toBe(
    3600,
  );
});

it('retains uncertain cost, prevents retries and blocks another large reservation within the run cap', async () => {
  await enqueueGeneration(db, request('live-1'), liveProviderId);
  await enqueueGeneration(db, request('live-2'), liveProviderId);
  const lease = (await claimGeneration(db, 10_000_000, liveProviderId))!;
  await finishGeneration(db, lease.run.id, null);
  expect(
    (await db.generationJob.findUniqueOrThrow({ where: { id: lease.job.id } }))
      .state,
  ).toBe('failed');
  expect(await claimGeneration(db, 10_000_000, liveProviderId)).toBeNull();
  expect((await db.generationBudget.findFirstOrThrow()).committedMicroEur).toBe(
    lease.run.reservedMicroEur,
  );
  await expect(
    enqueueGeneration(
      db,
      { ...request('bad'), feature: 'generation' },
      liveProviderId,
    ),
  ).rejects.toThrow('SMOKE_REVIEW_ONLY');
  await expect(
    enqueueGeneration(
      db,
      { ...request('bad'), specification: '{}' },
      liveProviderId,
    ),
  ).rejects.toThrow();
});

it('stops every later live dispatch after uncertain usage even when both reservations fit', async () => {
  await enqueueGeneration(db, request('small-1', 'gpt-6-luna'), liveProviderId);
  await enqueueGeneration(db, request('small-2', 'gpt-6-luna'), liveProviderId);
  const lease = (await claimGeneration(db, 10_000_000, liveProviderId))!;
  await finishGeneration(db, lease.run.id, null);
  expect(await claimGeneration(db, 10_000_000, liveProviderId)).toBeNull();
  expect(await db.generationAttempt.count()).toBe(1);
});

it('reconciles uncertain cost once with immutable evidence, preserves failure and resumes the shared ledger', async () => {
  const { reconcileGenerationCost } =
    await import('../../src/server/content/generation-jobs');
  await enqueueGeneration(
    db,
    request('reconcile-old', 'gemini-3.8-flash'),
    liveProviderId,
  );
  const lease = (await claimGeneration(db, 10_000_000, liveProviderId))!;
  await finishGeneration(db, lease.run.id, null);
  const evidence = {
    attemptId: lease.run.id,
    costMicroEur: 0,
    evidenceHash: 'a'.repeat(64),
    note: 'Synthetic free-tier dashboard evidence; operator-reviewed.',
  };
  await Promise.all([
    reconcileGenerationCost(db, evidence),
    reconcileGenerationCost(db, evidence),
  ]);
  expect((await db.generationBudget.findFirstOrThrow()).committedMicroEur).toBe(
    0,
  );
  expect(await db.generationCostReconciliation.count()).toBe(1);
  expect(
    (
      await db.generationAttempt.findUniqueOrThrow({
        where: { id: lease.run.id },
      })
    ).chargedMicroEur,
  ).toBe(lease.run.reservedMicroEur);
  expect(
    (await db.generationJob.findUniqueOrThrow({ where: { id: lease.job.id } }))
      .state,
  ).toBe('failed');
  await expect(
    reconcileGenerationCost(db, { ...evidence, costMicroEur: 1 }),
  ).rejects.toThrow('RECONCILIATION_CONFLICT');
  await expect(
    db.generationCostReconciliation.update({
      where: { attemptId: lease.run.id },
      data: { costMicroEur: 1 },
    }),
  ).rejects.toThrow();
  await expect(
    db.generationCostReconciliation.delete({
      where: { attemptId: lease.run.id },
    }),
  ).rejects.toThrow();
  await enqueueGeneration(
    db,
    request('after-reconcile', 'gpt-6.1-sol'),
    liveProviderId,
  );
  const next = (await claimGeneration(db, 10_000_000, liveProviderId))!;
  expect(next.job.requestId).toBe('after-reconcile');
  await expect(
    reconcileGenerationCost(db, { ...evidence, attemptId: next.run.id }),
  ).rejects.toThrow();
});

it('rejects invalid reconciliation and rolls back the evidence when budget adjustment fails', async () => {
  const { reconcileGenerationCost } =
    await import('../../src/server/content/generation-jobs');
  await enqueueGeneration(
    db,
    request('reconcile-rollback', 'gemini-3.8-flash'),
    liveProviderId,
  );
  const lease = (await claimGeneration(db, 10_000_000, liveProviderId))!;
  await finishGeneration(db, lease.run.id, null);
  const evidence = {
    attemptId: lease.run.id,
    costMicroEur: 0,
    evidenceHash: 'b'.repeat(64),
    note: 'Synthetic evidence.',
  };
  for (const costMicroEur of [-1, 0.5, lease.run.reservedMicroEur + 1])
    await expect(
      reconcileGenerationCost(db, { ...evidence, costMicroEur }),
    ).rejects.toThrow();
  await expect(
    reconcileGenerationCost(db, { ...evidence, evidenceHash: '' }),
  ).rejects.toThrow();
  // Forced inconsistency makes the atomic refund violate the nonnegative budget guard.
  await db.generationBudget.update({
    where: { period: lease.run.period },
    data: { committedMicroEur: 0 },
  });
  await expect(reconcileGenerationCost(db, evidence)).rejects.toThrow();
  expect(await db.generationCostReconciliation.count()).toBe(0);
  expect(
    (
      await db.generationAttempt.findUniqueOrThrow({
        where: { id: lease.run.id },
      })
    ).state,
  ).toBe('uncertain');
});

it('isolates expanded jobs, preserves all live spending and blocks unknown receipts across live lanes', async () => {
  const { expandedProviderId, expandedRequest } =
    await import('../../src/modules/content/review-benchmark/expanded');
  await enqueueGeneration(
    db,
    {
      requestId: 'expanded-one',
      feature: 'review',
      specification: expandedRequest('s01', 'solve', 'gpt-6.1-sol'),
    },
    expandedProviderId,
  );
  expect(await claimGeneration(db, 10_000_000, liveProviderId)).toBeNull();
  const lease = (await claimGeneration(db, 10_000_000, expandedProviderId))!;
  expect(lease.run.reservedMicroEur).toBeGreaterThan(7_000_000);
  await finishGeneration(db, lease.run.id, null);
  await enqueueGeneration(
    db,
    request('smoke-after-expanded', 'gpt-6-luna'),
    liveProviderId,
  );
  expect(await claimGeneration(db, 10_000_000, liveProviderId)).toBeNull();
  expect((await db.generationBudget.findFirstOrThrow()).committedMicroEur).toBe(
    lease.run.reservedMicroEur,
  );
  await expect(
    enqueueGeneration(
      db,
      {
        requestId: 'expanded-bad',
        feature: 'generation',
        specification: expandedRequest('s01', 'solve', 'gpt-6-luna'),
      },
      expandedProviderId,
    ),
  ).rejects.toThrow();
});

it('binds generated reviews to their exact durable parent, prevents extra requests and keeps one shared budget', async () => {
  const {
    generatorManifest,
    generatorProviderId,
    generatorReviewRequest,
    parseGeneratedExercise,
  } = await import('../../src/modules/content/review-benchmark/generator');
  const m = generatorManifest[0]!;
  const candidate = parseGeneratedExercise(m.briefId, {
    prompt: 'Een dappere held. Wat betekent dapper?',
    passage: '',
    options: ['moedig', 'bang', 'lui', 'stil'],
    rubric: 'Kies één antwoord.',
    answer: 'moedig',
    explanation: 'Dapper betekent moedig.',
  })!;
  const review = {
    requestId: `${m.requestId}-review`,
    feature: 'review',
    specification: generatorReviewRequest(m.requestId, candidate),
  };
  await expect(
    enqueueGeneration(db, review, generatorProviderId),
  ).rejects.toThrow('GENERATOR_REVIEW_PROVENANCE_CONFLICT');
  await expect(
    enqueueGeneration(
      db,
      {
        requestId: 'extra',
        feature: 'generation',
        specification: m.specification,
      },
      generatorProviderId,
    ),
  ).rejects.toThrow('GENERATOR_MANIFEST_CONFLICT');
  await enqueueGeneration(
    db,
    {
      requestId: m.requestId,
      feature: 'generation',
      specification: m.specification,
    },
    generatorProviderId,
  );
  const lease = (await claimGeneration(db, 10_000_000, generatorProviderId))!;
  expect(lease.run.reservedMicroEur).toBeLessThan(4_000_000);
  await finishGeneration(db, lease.run.id, {
    draft: JSON.stringify({ candidate }),
    costMicroEur: 1000,
    inputTokens: 100,
    outputTokens: 100,
  });
  await expect(
    enqueueGeneration(
      db,
      {
        ...review,
        specification: generatorReviewRequest(m.requestId, {
          ...candidate,
          answer: 'bang',
        }),
      },
      generatorProviderId,
    ),
  ).rejects.toThrow('GENERATOR_REVIEW_PROVENANCE_CONFLICT');
  await enqueueGeneration(db, review, generatorProviderId);
  const reviewLease = (await claimGeneration(
    db,
    10_000_000,
    generatorProviderId,
  ))!;
  await finishGeneration(db, reviewLease.run.id, null);
  await enqueueGeneration(
    db,
    request('smoke-after-generator', 'gpt-6-luna'),
    liveProviderId,
  );
  expect(await claimGeneration(db, 10_000_000, liveProviderId)).toBeNull();
  expect((await db.generationBudget.findFirstOrThrow()).committedMicroEur).toBe(
    1000 + reviewLease.run.reservedMicroEur,
  );
});

it('stops generator dispatch at its usage threshold and respects remaining monthly commitments', async () => {
  const { generatorManifest, generatorProviderId } =
    await import('../../src/modules/content/review-benchmark/generator');
  const first = generatorManifest[0]!,
    next = generatorManifest[1]!;
  for (const m of [first, next])
    await enqueueGeneration(
      db,
      {
        requestId: m.requestId,
        feature: 'generation',
        specification: m.specification,
      },
      generatorProviderId,
    );
  const lease = (await claimGeneration(db, 10_000_000, generatorProviderId))!;
  await finishGeneration(db, lease.run.id, {
    draft: 'synthetic cost threshold receipt',
    costMicroEur: 750_000,
    inputTokens: 1000,
    outputTokens: 1000,
  });
  expect(await claimGeneration(db, 10_000_000, generatorProviderId)).toBeNull();
});
