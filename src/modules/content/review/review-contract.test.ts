import { expect, it } from 'vitest';
import { acceptedReviewTime, exactSelection } from './review-contract';
it('accepts only distinct exact current version selections and never silently substitutes an edit', () => {
  const current = [
    { id: 'a', contentHash: 'h1' },
    { id: 'b', contentHash: 'h2' },
  ];
  expect(exactSelection([{ id: 'a', contentHash: 'h1' }], current)).toBe(true);
  for (const refs of [
    [],
    [{ id: 'a', contentHash: 'old' }],
    [current[0], current[0]],
    [{ id: 'x', contentHash: 'h1' }],
  ])
    expect(exactSelection(refs, current)).toBe(false);
});
it('counts monotonic acknowledged active time once, bounded by wall time and heartbeat gaps', () => {
  const old = {
    sessionMs: 5000,
    sequence: 1,
    lastPulseAt: new Date(10000),
    startedAt: new Date(5000),
  };
  expect(
    acceptedReviewTime(old, { sessionMs: 8000, sequence: 2 }, new Date(14000)),
  ).toBe(3000);
  expect(
    acceptedReviewTime(old, { sessionMs: 5000, sequence: 1 }, new Date(14000)),
  ).toBe(0);
  for (const update of [
    { sessionMs: 9000, sequence: 1 },
    { sessionMs: 4000, sequence: 2 },
    { sessionMs: 50000, sequence: 2 },
  ])
    expect(() => acceptedReviewTime(old, update, new Date(14000))).toThrow();
  expect(() =>
    acceptedReviewTime(old, { sessionMs: 8000, sequence: 2 }, new Date(80000)),
  ).toThrow();
});
