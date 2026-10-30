import { expect, it } from 'vitest';
import { evaluateSavedShadow, type ShadowFact } from './saved-evidence-shadow';
import type { Blueprint } from './assessment-policy';
const blueprint: Blueprint = {
  version: 'synthetic-test-v1',
  subject: 'rekenen',
  category: 'optellen',
  level: 'digits',
  objectives: [
    { skill: 'addition', facets: ['procedure', 'concept', 'application'] },
  ],
  prerequisites: ['counting'],
};
const fact = (n: number): ShadowFact => ({
  attemptId: `attempt-${n}`,
  itemId: `item-${n}`,
  assignmentId: `task-${n}`,
  contentHash: `hash-${n}`,
  contentVersion: `version-${n}`,
  evaluatorVersion: 'integer-exact-v1',
  scoringPolicy: 'deferred-retry-v1',
  family: 'addition-digits-procedure',
  exposureKey: `group-${n}`,
  observedAt: `2026-10-${String(20 + n).padStart(2, '0')}T10:00:00.000Z`,
  correct: true,
  attemptNumber: 1,
  complete: true,
  integrity: 'verified',
  contentStatus: 'reviewed',
  assistance: 'none-recorded',
  priorExposure: false,
  purpose: 'check',
  mapping: {
    curriculumVersion: blueprint.version,
    subject: 'rekenen',
    category: 'optellen',
    skill: 'addition',
    level: 'digits',
    representation: 'symbolic',
    facet: 'procedure',
    response: 'constructed',
    role: 'assessed',
  },
});
it('keeps repeated family variants insufficient and prerequisites unresolved', () => {
  const r = evaluateSavedShadow(
    blueprint,
    [fact(0), fact(1), fact(2)],
    '2026-10-23T12:00:00.000Z',
  );
  expect(r.assessment.decision).toBe('more-evidence');
  expect(r.assessment.skills[0]!.families).toBe(1);
  expect(r.assessment.missingPrerequisites).toEqual(['counting']);
  expect(r.activation).toBe('disabled');
});
it('excludes defects, withdrawals, unreviewed, unknown assistance, practice and retry observations without learner penalties', () => {
  const candidates: ShadowFact[] = [
    { ...fact(0), contentStatus: 'withdrawn', correct: false },
    { ...fact(1), contentStatus: 'defective', correct: false },
    { ...fact(2), contentStatus: 'rejected', correct: false },
    { ...fact(0), contentStatus: 'unknown' },
    { ...fact(1), assistance: 'unknown' },
    { ...fact(2), purpose: 'practice' },
    { ...fact(0), attemptNumber: 2 },
    { ...fact(1), priorExposure: true },
    { ...fact(2), integrity: 'unverified' },
  ];
  for (const f of candidates) {
    const r = evaluateSavedShadow(blueprint, [f], '2026-10-23T12:00:00.000Z');
    expect(r.evidence).toHaveLength(0);
    expect(r.exclusions).toHaveLength(1);
    expect(r.assessment.decision).toBe('more-evidence');
    expect(r.assessment.skills[0]!.conflicts).toEqual([]);
  }
});
it('fails closed on missing mappings, dates, completion, duplicate attempts and repeated exposure, reproducibly', () => {
  const facts = [
    fact(0),
    { ...fact(1), exposureKey: fact(0).exposureKey },
    fact(0),
    { ...fact(2), mapping: null },
    { ...fact(2), observedAt: 'invalid' },
    { ...fact(2), complete: false },
  ];
  const a = evaluateSavedShadow(blueprint, facts, '2026-10-23T12:00:00.000Z');
  expect(a.evidence).toHaveLength(1);
  expect(a.exclusions).toHaveLength(5);
  expect(a).toEqual(
    evaluateSavedShadow(blueprint, facts, '2026-10-23T12:00:00.000Z'),
  );
});
