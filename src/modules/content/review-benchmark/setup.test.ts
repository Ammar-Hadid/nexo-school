import { expect, it } from 'vitest';
import { benchmarkCases } from './fixtures';
import { fingerprint } from './benchmark';
import {
  benchmarkModels,
  estimateScreen,
  reviewReadiness,
  createReviewDecisions,
  renderReviewPackage,
} from './setup';

it('lists the agreed seven models and calculates cost with integer ceiling and explicit assumptions', () => {
  expect(benchmarkModels).toHaveLength(7);
  expect(new Set(benchmarkModels.map((m) => m.provider)).size).toBe(3);
  const estimate = estimateScreen({
    items: 40,
    inputTokens: 2000,
    outputTokens: 500,
    microEurPerUsd: 1_500_000,
  });
  expect(estimate.calls).toBe(560);
  expect(estimate.planningMicroEur).toBe(5_913_000);
  expect(estimate.isDispatchBound).toBe(false);
  for (const items of [-1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER])
    expect(() =>
      estimateScreen({
        items,
        inputTokens: 2000,
        outputTokens: 500,
        microEurPerUsd: 1_500_000,
      }),
    ).toThrow();
});

it('requires explicit, exact-version human decisions and never invents adjudication', () => {
  const decisions = createReviewDecisions();
  expect(decisions.reviewer).toBe('Ammar');
  expect(reviewReadiness(decisions).ready).toBe(false);
  expect(decisions.items.every((i) => i.decision === 'pending')).toBe(true);
  const accepted = {
    ...decisions,
    reviewedAt: '2026-10-22',
    items: decisions.items.map((i) => ({
      ...i,
      decision: 'accept-proposal',
      note: 'Reviewed.',
    })),
  };
  expect(reviewReadiness(accepted)).toMatchObject({
    ready: true,
    accepted: 12,
  });
  expect(reviewReadiness({ ...accepted, fixtureHash: 'stale' }).ready).toBe(
    false,
  );
  expect(
    reviewReadiness({ ...accepted, items: accepted.items.slice(1) }).ready,
  ).toBe(false);
  expect(
    reviewReadiness({
      ...accepted,
      items: [...accepted.items.slice(1), accepted.items[1]],
    }).ready,
  ).toBe(false);
  expect(reviewReadiness({ ...accepted, reviewedAt: '2026-02-31' }).ready).toBe(
    false,
  );
  const correction = structuredClone(accepted);
  correction.items[0]!.decision = 'change-required';
  expect(reviewReadiness(correction).ready).toBe(false);
  const staleItem = structuredClone(accepted);
  staleItem.items[0]!.contentHash = 'bad';
  expect(reviewReadiness(staleItem).ready).toBe(false);
});

it('shows complete existing material, uncertainty and blank human decisions without changing fixture identity', () => {
  const before = fingerprint(benchmarkCases);
  const markdown = renderReviewPackage();
  for (const { candidate } of benchmarkCases) {
    expect(markdown).toContain(candidate.id);
    expect(markdown).toContain(candidate.prompt);
    expect(markdown).toContain(candidate.answer);
    expect(markdown).toContain(candidate.explanation);
    expect(markdown).toContain(fingerprint(candidate));
  }
  expect(markdown).toContain('Pending');
  expect(markdown).toContain('not an unused holdout');
  expect(fingerprint(benchmarkCases)).toBe(before);
});
