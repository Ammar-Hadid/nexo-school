import { expect, it } from 'vitest';
import {
  assessCategory,
  type Evidence,
  type Blueprint,
} from './assessment-policy';

const blueprint: Blueprint = {
  version: 'test-v1',
  subject: 'rekenen',
  category: 'number',
  level: 'g5-demo',
  objectives: [
    { skill: 'place-value', facets: ['procedure', 'concept', 'application'] },
  ],
  prerequisites: [],
};
const observation = (id: string, patch: Partial<Evidence> = {}): Evidence => ({
  id,
  item: id,
  contentVersion: '1',
  evaluatorVersion: '1',
  curriculumVersion: 'test-v1',
  subject: 'rekenen',
  category: 'number',
  skill: 'place-value',
  level: 'g5-demo',
  family: id,
  representation: id,
  facet: 'procedure',
  response: 'constructed',
  role: 'assessed',
  review: 'synthetic',
  day: 0,
  session: 'entry',
  correct: true,
  firstAttempt: true,
  assisted: false,
  novel: true,
  complete: true,
  purpose: 'check',
  ...patch,
});
const diverse = () => [
  observation('p'),
  observation('c', { facet: 'concept', session: 'confirm' }),
  observation('a', { facet: 'application', session: 'confirm' }),
];
it('requires every objective and diverse independent evidence; passing is provisional, not durable mastery', () => {
  expect(assessCategory(blueprint, [], 0).decision).toBe('more-evidence');
  expect(assessCategory(blueprint, [observation('p')], 0).decision).toBe(
    'more-evidence',
  );
  expect(assessCategory(blueprint, diverse(), 0).decision).toBe(
    'ready-provisional',
  );
  expect(
    assessCategory(
      {
        ...blueprint,
        objectives: [
          ...blueprint.objectives,
          { skill: 'ordering', facets: ['procedure'] },
        ],
      },
      diverse(),
      0,
    ).decision,
  ).toBe('more-evidence');
  expect(
    assessCategory(
      blueprint,
      diverse().map((e) => ({ ...e, response: 'choice' })),
      0,
    ).decision,
  ).toBe('more-evidence');
});

it('rejects correlated, assisted, repeated, stale, unsupported and cross-subject evidence without fabricating a weakness', () => {
  const attacks: Partial<Evidence>[] = [
    { family: 'one-template' },
    { assisted: true },
    { firstAttempt: false },
    { novel: false },
    { response: 'unsupported' },
    { review: 'missing' },
    { role: 'supporting' },
    { complete: false },
    { curriculumVersion: 'old' },
    { level: 'easier' },
    { subject: 'taal' },
    { day: -20 },
    { day: 1 },
    { item: 'same-question' },
    { purpose: 'daily' },
    { purpose: 'practice' },
  ];
  for (const attack of attacks) {
    const result = assessCategory(
      blueprint,
      diverse().map((e) => ({ ...e, ...attack })),
      0,
    );
    expect(result.decision, JSON.stringify(attack)).toBe('more-evidence');
  }
});
it('a conceptual weakness cannot be compensated by many procedural successes and recovery reuses valid evidence', () => {
  const failed = [
    ...diverse(),
    observation('concept-miss', {
      facet: 'concept',
      correct: false,
      session: 'later',
    }),
  ];
  expect(assessCategory(blueprint, failed, 0).decision).toBe(
    'targeted-practice',
  );
  expect(
    assessCategory(
      blueprint,
      [
        ...failed,
        observation('concept-miss-2', {
          facet: 'concept',
          correct: false,
          session: 'later-2',
        }),
        observation('concept-miss-3', {
          facet: 'concept',
          correct: false,
          session: 'later-3',
        }),
      ],
      0,
    ).decision,
  ).toBe('targeted-instruction');
  expect(
    assessCategory(
      blueprint,
      [
        ...failed,
        observation('concept-new', {
          facet: 'concept',
          session: 'fresh-check',
        }),
      ],
      0,
    ).decision,
  ).toBe('ready-provisional');
});
it('questions on one reading passage cannot establish broad reading competence; supporting reading receives no credit', () => {
  const reading = { ...blueprint, subject: 'begrijpend-lezen' as const };
  const history = diverse().map((e) => ({
    ...e,
    subject: reading.subject,
    passage: 'passage-1',
  }));
  expect(assessCategory(reading, history, 0).decision).toBe('more-evidence');
  expect(
    assessCategory(
      reading,
      history.map((e, i) => ({ ...e, passage: `passage-${i}` })),
      0,
    ).decision,
  ).toBe('ready-provisional');
  expect(
    assessCategory(
      reading,
      history.map((e) => ({ ...e, role: 'supporting' })),
      0,
    ).decision,
  ).toBe('more-evidence');
});
it('requires prerequisites explicitly and will not advance an empty blueprint', () => {
  expect(
    assessCategory({ ...blueprint, prerequisites: ['counting'] }, diverse(), 0)
      .decision,
  ).toBe('more-evidence');
  expect(
    assessCategory({ ...blueprint, objectives: [] }, diverse(), 0).decision,
  ).toBe('more-evidence');
});
it('does not reinterpret existing observations when later attempts are added', () => {
  const history = diverse();
  const copy = JSON.stringify(history);
  assessCategory(blueprint, history, 30);
  expect(JSON.stringify(history)).toBe(copy);
});

it('adversarial learner matrix: 64 known simulated skill states, no false skips or missed weaknesses', () => {
  const twoSkills: Blueprint = {
    ...blueprint,
    objectives: [
      ...blueprint.objectives,
      { skill: 'ordering', facets: ['procedure', 'concept', 'application'] },
    ],
  };
  let falseSkips = 0;
  let missedWeaknesses = 0;
  let unnecessaryChecks = 0;
  let readyCases = 0;
  for (let mask = 0; mask < 64; mask++) {
    const facts = ['place-value', 'ordering'].flatMap((skill, i) =>
      diverse().map((e, j) => ({
        ...e,
        id: `${skill}-${e.id}`,
        item: `${skill}-${e.item}`,
        skill,
        correct: Boolean(mask & (1 << (i * 3 + j))),
      })),
    );
    const result = assessCategory(twoSkills, facts, 0);
    const fullyKnown = mask === 63;
    if (result.decision === 'ready-provisional') {
      readyCases++;
      if (!fullyKnown) falseSkips++;
    }
    if (fullyKnown && result.decision !== 'ready-provisional')
      unnecessaryChecks++;
    for (let i = 0; i < 2; i++)
      if (
        (mask & (7 << (i * 3))) !== 7 << (i * 3) &&
        !result.skills[i]!.conflicts.length
      )
        missedWeaknesses++;
  }
  expect({
    falseSkips,
    missedWeaknesses,
    unnecessaryChecks,
    readyCases,
  }).toEqual({
    falseSkips: 0,
    missedWeaknesses: 0,
    unnecessaryChecks: 0,
    readyCases: 1,
  });
});
it('two subject estimates advance independently even if skill names collide', () => {
  const taal = { ...blueprint, subject: 'taal' as const };
  const math = diverse();
  expect(assessCategory(taal, math, 0).coverage.demonstrated).toBe(0);
  const language = diverse().map((e) => ({
    ...e,
    id: `taal-${e.id}`,
    item: `taal-${e.item}`,
    subject: 'taal' as const,
  }));
  expect(assessCategory(taal, [...math, ...language], 0).decision).toBe(
    'ready-provisional',
  );
  expect(assessCategory(blueprint, [...math, ...language], 0).decision).toBe(
    'ready-provisional',
  );
});
it('reuses the strongest eligible observation within a family without counting it twice', () => {
  const choices = diverse().map((e) => ({ ...e, response: 'choice' as const }));
  const constructed = diverse()
    .slice(1)
    .map((e) => ({
      ...e,
      id: `new-${e.id}`,
      item: `new-${e.item}`,
      session: 'follow-up',
    }));
  const result = assessCategory(blueprint, [...choices, ...constructed], 0);
  expect(result.decision).toBe('ready-provisional');
  expect(result.skills[0]!.observations).toBe(3);
});

it('rejects duplicate evidence sources and invalid observation dates', () => {
  expect(
    assessCategory(
      blueprint,
      diverse().map((e) => ({ ...e, id: 'one-attempt' })),
      0,
    ).decision,
  ).toBe('more-evidence');
  expect(
    assessCategory(
      blueprint,
      diverse().map((e) => ({ ...e, day: Number.NaN })),
      0,
    ).decision,
  ).toBe('more-evidence');
});
it('documents the residual negative control: undisclosed answer-key memorization is indistinguishable from valid-looking success', () => {
  // Simulated latent state: does not understand. The recorded facts, however,
  // falsely appear novel/unassisted. No rule over these same facts can detect it.
  const apparentlyIndependent = diverse();
  expect(assessCategory(blueprint, apparentlyIndependent, 0).decision).toBe(
    'ready-provisional',
  );
  // If familiarity is known and recorded, the same response pattern is blocked.
  expect(
    assessCategory(
      blueprint,
      apparentlyIndependent.map((e) => ({ ...e, novel: false })),
      0,
    ).decision,
  ).toBe('more-evidence');
});
