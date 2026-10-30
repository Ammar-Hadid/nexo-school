import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db } from './helpers';
import {
  enqueueReviewBenchmark,
  readReviewBenchmark,
} from '../../src/server/content/review-benchmark';
import {
  runGenerationBurst,
  runGenerationOnce,
} from '../../src/server/content/generation-jobs';
import { fakeReviewProvider } from '../../src/server/content/fake-review-provider';
import { modelProfiles } from '../../src/modules/content/review-benchmark/fixtures';
beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "GenerationJob", "GenerationBudget" CASCADE',
  );
});
afterAll(() => db.$disconnect());

it('runs both controls through durable leased review jobs and reports exact usage without publication', async () => {
  const publishedBefore = await db.contentPublication.count();
  for (const model of modelProfiles)
    await enqueueReviewBenchmark(db, 'durable', model);
  for (let i = 0; i < 16; i++)
    await runGenerationBurst(db, 50000, fakeReviewProvider);
  expect(await db.generationJob.count({ where: { state: 'succeeded' } })).toBe(
    48,
  );
  for (const model of modelProfiles) {
    const report = await readReviewBenchmark(db, 'durable', model);
    expect(report).toMatchObject({
      attemptedCalls: 24,
      inputTokens: 240,
      outputTokens: 480,
      simulatedCommittedMicroEur: 9600,
      actualSpendMicroEur: 0,
      unresolvedItems: 1,
      unknownUsageCalls: 0,
    });
    expect(report.completedCriticalMisses).toBe(
      model === 'fake-checker-v1' ? 1 : 6,
    );
  }
  expect((await db.generationBudget.findFirstOrThrow()).committedMicroEur).toBe(
    19200,
  );
  expect(await db.contentPublication.count()).toBe(publishedBefore);
});

it('re-enqueue and reconnect reuse exact jobs and results without repeated charges', async () => {
  await enqueueReviewBenchmark(db, 'resume', 'fake-checker-v1');
  await runGenerationBurst(db, 20000, fakeReviewProvider);
  await db.$disconnect();
  await enqueueReviewBenchmark(db, 'resume', 'fake-checker-v1');
  for (let i = 0; i < 7; i++)
    await runGenerationBurst(db, 20000, fakeReviewProvider);
  expect(await db.generationJob.count()).toBe(24);
  expect(await db.generationAttempt.count()).toBe(24);
  expect(
    (await readReviewBenchmark(db, 'resume', 'fake-checker-v1'))
      .simulatedCommittedMicroEur,
  ).toBe(9600);
  await enqueueReviewBenchmark(db, 'resume', 'fake-checker-v1');
  expect(await runGenerationOnce(db, 20000, fakeReviewProvider)).toBe('idle');
});

it('keeps budget-blocked, malformed and absent reviews unresolved', async () => {
  await enqueueReviewBenchmark(db, 'blocked', 'fake-checker-v1');
  const malformed = {
    id: 'fake-v1' as const,
    generate: async () => ({
      draft: '{}',
      costMicroEur: 400,
      inputTokens: 10,
      outputTokens: 20,
    }),
  };
  await runGenerationBurst(db, 1000, malformed);
  const report = await readReviewBenchmark(db, 'blocked', 'fake-checker-v1');
  expect(report).toMatchObject({
    unresolvedItems: 12,
    attemptedCalls: 1,
    simulatedCommittedMicroEur: 400,
  });
  expect(report.unresolvedCriticalDefects).toBe(7);
  expect(await db.generationJob.count({ where: { state: 'queued' } })).toBe(23);
});

it('reports uncertain charges and partial token knowledge instead of dropping failed attempts', async () => {
  await enqueueReviewBenchmark(db, 'failed', 'fake-checker-v1');
  await runGenerationOnce(db, 20000, {
    id: 'fake-v1',
    generate: async () => {
      throw new Error('synthetic failure');
    },
  });
  const first = await readReviewBenchmark(db, 'failed', 'fake-checker-v1');
  expect(first).toMatchObject({
    attemptedCalls: 1,
    unknownUsageCalls: 1,
    simulatedCommittedMicroEur: 1000,
  });
  await db.generationJob.updateMany({
    where: { state: 'queued' },
    data: { availableAt: new Date(0) },
  });
  for (let i = 0; i < 8; i++)
    await runGenerationBurst(db, 20000, fakeReviewProvider);
  const report = await readReviewBenchmark(db, 'failed', 'fake-checker-v1');
  expect(report).toMatchObject({
    attemptedCalls: 25,
    unknownUsageCalls: 1,
    inputTokens: 240,
    outputTokens: 480,
    simulatedCommittedMicroEur: 10600,
  });
});
