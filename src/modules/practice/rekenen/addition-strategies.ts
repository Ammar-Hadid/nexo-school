/** Subject-owned, finite procedural practice. No educational approval or learner progression. */
export type AdditionRange = 'digits' | 'two-digits';
export type AdditionPurpose = 'practice' | 'check' | 'retention';
export const additionRevision = {
  digits: 'addition-digits-teaching-v2',
  'two-digits': 'addition-two-digits-v1',
} as const;
export function additionPairs(range: AdditionRange): [number, number][] {
  if (!['digits', 'two-digits'].includes(range))
    throw new Error('UNKNOWN_ADDITION_RANGE');
  const pairs: [number, number][] = [];
  for (
    let a = range === 'digits' ? 0 : 10;
    a <= (range === 'digits' ? 9 : 99);
    a++
  )
    for (
      let b = range === 'digits' ? 0 : 10;
      b <= (range === 'digits' ? 9 : 99);
      b++
    )
      if (range === 'digits' || a + b <= 100) pairs.push([a, b]);
  return pairs;
}
export function additionExposure(a: number, b: number) {
  return `${a < 10 ? 'addition-digits' : 'addition-two-digits'}:${Math.min(a, b)}:${Math.max(a, b)}`;
}
/** Adapts the existing tens/units worked examples and path's make-ten method. */
export function explainAddition(
  a: number,
  b: number,
): {
  answer: string;
  strategy: 'zero' | 'doubles' | 'make-ten' | 'count-on' | 'place-value';
  steps: string[];
} {
  if (
    ![a, b].every(
      (n) => Number.isSafeInteger(n) && n >= 0 && !Object.is(n, -0),
    ) ||
    !(
      (a <= 9 && b <= 9) ||
      (a >= 10 && b >= 10 && a <= 99 && b <= 99 && a + b <= 100)
    )
  )
    throw new Error('OUTSIDE_ADDITION_BOUNDS');
  const answer = String(a + b);
  if (a === 0 || b === 0)
    return {
      answer,
      strategy: 'zero',
      steps: [
        a === 0 && b === 0
          ? 'Je begint met niets en er komt niets bij.'
          : b === 0
            ? `Je begint met ${a}. Er komt niets bij, dus het aantal blijft gelijk.`
            : `Je begint met niets. Er komen ${b} bij, dus je hebt er ${b}.`,
        `${a} + ${b} = ${answer}.`,
      ],
    };
  if (a >= 10) {
    const tens = Math.floor(b / 10) * 10,
      units = b % 10,
      subtotal = a + tens,
      gap = 10 - (subtotal % 10);
    const steps = [
      `Splits ${b} in ${tens} en ${units}. Tel eerst de tientallen erbij.`,
      `${a} + ${tens} = ${subtotal}.`,
    ];
    if (units >= gap && subtotal % 10 !== 0)
      steps.push(
        `Maak eerst ${subtotal + gap}. Splits ${units} in ${gap} en ${units - gap}.`,
        `${subtotal} + ${gap} = ${subtotal + gap}.`,
        `Daarna ${subtotal + gap} + ${units - gap} = ${answer}.`,
      );
    else
      steps.push(
        `Tel nu de ${units} eenheden erbij: ${subtotal} + ${units} = ${answer}.`,
      );
    return { answer, strategy: 'place-value', steps };
  }
  if (a === b) {
    if (a >= 5)
      return {
        answer,
        strategy: 'doubles',
        steps: [
          'Gebruik het dubbel van 5: 5 + 5 = 10.',
          `Bij allebei komt er ${a - 5} bij: ${a - 5} + ${a - 5} = ${2 * (a - 5)}.`,
          `Dus 10 + ${2 * (a - 5)} = ${answer}.`,
        ],
      };
    return {
      answer,
      strategy: 'doubles',
      steps: [
        `Neem twee groepjes van ${a}. Begin bij ${a} en tel nog ${a} verder: ${Array.from({ length: a }, (_, i) => a + i + 1).join(', ')}.`,
        `${a} + ${b} = ${answer}.`,
      ],
    };
  }
  if (a + b >= 10) {
    const gap = 10 - a,
      rest = b - gap;
    return {
      answer,
      strategy: 'make-ten',
      steps: [
        `Maak eerst 10. Splits ${b} in ${gap} en ${rest}.`,
        `${a} + ${gap} = 10.`,
        `Daarna 10 + ${rest} = ${answer}.`,
      ],
    };
  }
  const larger = Math.max(a, b),
    smaller = Math.min(a, b);
  return {
    answer,
    strategy: 'count-on',
    steps: [
      `Begin bij het grootste getal, ${larger}. Tel ${smaller} verder: ${Array.from({ length: smaller }, (_, i) => larger + i + 1).join(', ')}.`,
      `${larger} + ${smaller} = ${answer}.`,
    ],
  };
}
/** Allocation is a finite rehearsal, not durable learner exposure. Commuted pairs stay in one lane across revisions. */
export function selectAddition(
  range: AdditionRange,
  purpose: AdditionPurpose,
  count: number,
  exposed: readonly string[],
) {
  if (
    !Number.isSafeInteger(count) ||
    count < 0 ||
    count > 5000 ||
    !['practice', 'check', 'retention'].includes(purpose)
  )
    throw new Error('INVALID_SELECTION');
  const seen = new Set(exposed),
    lane = ['practice', 'check', 'retention'].indexOf(purpose);
  const groups = additionPairs(range).filter(([a, b]) => a <= b);
  const available = groups
    .flatMap(([a, b], index) =>
      index % 5 === (lane === 0 ? 0 : lane)
        ? [{ a, b }]
        : lane === 0 && index % 5 >= 3
          ? [{ a, b }]
          : [],
    )
    .map(({ a, b }) => ({
      a,
      b,
      exposureKey: additionExposure(a, b),
      carry: (a % 10) + (b % 10) >= 10,
    }))
    .filter((i) => !seen.has(i.exposureKey));
  // Alternate carrying/non-carrying while either pool has stock.
  const carry = available.filter((i) => i.carry),
    plain = available.filter((i) => !i.carry),
    ordered: typeof available = [];
  for (let i = 0; i < Math.max(carry.length, plain.length); i++) {
    if (plain[i]) ordered.push(plain[i]!);
    if (carry[i]) ordered.push(carry[i]!);
  }
  const items = ordered.slice(0, count);
  return {
    items,
    shortage: count - items.length,
    purpose,
    version: 'addition-lanes-v1' as const,
  };
}
