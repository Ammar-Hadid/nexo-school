import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { simulateReviewBenchmark } from './review-benchmark';
import { fakeReviewProvider } from './fake-review-provider';
import { reviewRequest } from '../../modules/content/review-benchmark/benchmark';
import { benchmarkCases } from '../../modules/content/review-benchmark/fixtures';
it('retains deliberate misses, false positives and abstention in both scripted controls', async () => {
  const { reports } = await simulateReviewBenchmark();
  expect(reports[0]).toMatchObject({
    totalItems: 12,
    defectiveItems: 8,
    cleanItems: 4,
    completedCriticalMisses: 1,
    unresolvedCriticalDefects: 1,
    falseAlarms: 1,
    flaggedItems: 8,
    unresolvedItems: 1,
    attemptedCalls: 24,
    inputTokens: 240,
    outputTokens: 480,
    simulatedCommittedMicroEur: 9600,
    actualSpendMicroEur: 0,
  });
  expect(reports[1]).toMatchObject({
    completedCriticalMisses: 6,
    undetectedDefects: 8,
    flaggedItems: 0,
    unresolvedItems: 1,
  });
  expect(reports[0]!.fixtureHash).toBe(
    'd1a6482afa85f1f1d256c86ef06bc49ffcd018d897afbf80092eb0db22b789f7',
  );
});
it('the blind fake solver refuses injected proposed keys', async () => {
  const request = reviewRequest(
    benchmarkCases[0]!.candidate,
    'solve',
    'fake-checker-v1',
  );
  await expect(
    fakeReviewProvider.generate({
      specification: JSON.stringify({ ...request, answer: '7' }),
      feature: 'review',
      idempotencyKey: 'test',
      signal: new AbortController().signal,
    }),
  ).rejects.toThrow('SOLVE_KEY_DISCLOSURE');
});
