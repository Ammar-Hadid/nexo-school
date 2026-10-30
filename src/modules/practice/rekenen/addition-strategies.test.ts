import { expect, it } from 'vitest';
import {
  explainAddition,
  additionPairs,
  selectAddition,
} from './addition-strategies';

it('teaches zero, doubles, make-ten and counting-on in that precedence', () => {
  expect(explainAddition(0, 0).strategy).toBe('zero');
  expect(explainAddition(0, 9).steps.join(' ')).toContain('niets');
  expect(explainAddition(9, 0).steps.join(' ')).toContain('niets');
  expect(explainAddition(6, 6).strategy).toBe('doubles');
  expect(explainAddition(6, 6).steps.join(' ')).toContain('5 + 5 = 10');
  expect(explainAddition(7, 9).steps).toEqual([
    'Maak eerst 10. Splits 9 in 3 en 6.',
    '7 + 3 = 10.',
    'Daarna 10 + 6 = 16.',
  ]);
  expect(explainAddition(2, 7).steps[0]).toContain('7');
});
it('independently verifies every displayed equation and final answer across both complete domains', () => {
  for (const range of ['digits', 'two-digits'] as const) {
    const pairs = additionPairs(range);
    expect(pairs.length).toBe(range === 'digits' ? 100 : 3321);
    for (const [a, b] of pairs) {
      const explanation = explainAddition(a, b);
      const oracle = [...Array(a), ...Array(b)].length;
      expect(explanation.answer).toBe(String(oracle));
      expect(explanation.steps.at(-1)).toContain(`= ${oracle}.`);
      for (const step of explanation.steps) {
        for (const match of step.matchAll(/(\d+) \+ (\d+) = (\d+)/g))
          expect(
            [...Array(Number(match[1])), ...Array(Number(match[2]))].length,
          ).toBe(Number(match[3]));
        const split = /Splits (\d+) in (\d+) en (\d+)/.exec(step);
        if (split)
          expect(
            [...Array(Number(split[2])), ...Array(Number(split[3]))].length,
          ).toBe(Number(split[1]));
      }
    }
  }
});
it('retains inspected place-value examples and handles exact hundreds', () => {
  for (const [a, b, sum] of [
    [24, 18, 42],
    [36, 27, 63],
    [45, 38, 83],
    [50, 50, 100],
    [11, 89, 100],
  ]) {
    const e = explainAddition(a!, b!);
    expect(e.answer).toBe(String(sum));
    expect(e.strategy).toBe('place-value');
  }
  expect(explainAddition(24, 18).steps).toContain('24 + 10 = 34.');
  expect(explainAddition(24, 18).steps).toContain(
    'Maak eerst 40. Splits 8 in 6 en 2.',
  );
});
it('reserves commutative groups separately for practice/check/retention and refuses exhausted stock', () => {
  const pools = ['practice', 'check', 'retention'].map((purpose) =>
    selectAddition('two-digits', purpose as 'practice', 5000, []),
  );
  const keys = pools.map((p) => new Set(p.items.map((i) => i.exposureKey)));
  expect([...keys[0]!].some((k) => keys[1]!.has(k) || keys[2]!.has(k))).toBe(
    false,
  );
  expect([...keys[1]!].some((k) => keys[2]!.has(k))).toBe(false);
  for (const p of pools) {
    expect(p.shortage).toBeGreaterThan(0);
    expect(p.items.some((i) => i.carry)).toBe(true);
    expect(p.items.some((i) => !i.carry)).toBe(true);
  }
  const first = selectAddition('digits', 'practice', 10, []);
  const next = selectAddition(
    'digits',
    'practice',
    100,
    first.items.map((i) => i.exposureKey),
  );
  expect(
    next.items.some((i) =>
      first.items.some((j) => j.exposureKey === i.exposureKey),
    ),
  ).toBe(false);
});
it('rejects out-of-contract operands and selection requests', () => {
  for (const pair of [
    [-1, 1],
    [1.5, 2],
    [10, 2],
    [99, 99],
    [NaN, 1],
    [-0, 1],
  ])
    expect(() => explainAddition(pair[0]!, pair[1]!)).toThrow();
  expect(() => selectAddition('digits', 'practice', -1, [])).toThrow();
});
