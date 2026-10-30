import { expect, it } from 'vitest';
import {
  emptyFamilyDraft,
  familyDraftValid,
  familyDecision,
} from './family-review-contract';
it('never treats incomplete, guardian or AI-assisted positive feedback as an educator certificate', () => {
  const draft = emptyFamilyDraft();
  expect(familyDecision(draft)).toBe('incomplete');
  const complete = {
    ...draft,
    examples: [0, 9, 90, 45, 55, 79, 99],
    judgments: {
      scope: 'accept',
      wording: 'accept',
      explanation: 'accept',
      response: 'accept',
    },
    basis: 'independent-human',
    notes: 'Independent synthetic test review.',
  };
  expect(familyDecision(complete)).toBe('guardian-feedback');
  expect(
    familyDecision({
      ...complete,
      role: 'educator',
      qualification: 'Experienced mathematics educator.',
    }),
  ).toBe('educator-approved');
  expect(
    familyDecision({
      ...complete,
      role: 'educator',
      qualification: 'Experienced mathematics educator.',
      basis: 'ai-assisted',
    }),
  ).toBe('provisional');
  expect(familyDecision({ ...complete, role: 'educator' })).toBe('incomplete');
});
it('requires complete authentic judgments; disagreements and uncertainty stay visible', () => {
  const d = {
    ...emptyFamilyDraft(),
    examples: [0, 9, 90, 45, 55, 79, 99],
    judgments: {
      scope: 'accept',
      wording: 'accept',
      explanation: 'change',
      response: 'unsure',
    },
    basis: 'independent-human',
    notes: 'Explanation needs more support.',
  };
  expect(familyDecision(d)).toBe('changes-required');
  expect(
    familyDecision({
      ...d,
      judgments: { ...d.judgments, explanation: 'accept' },
    }),
  ).toBe('unresolved');
  expect(familyDecision({ ...d, examples: [0] })).toBe('changes-required');
  expect(
    familyDecision({
      ...d,
      examples: [0],
      judgments: { ...d.judgments, explanation: 'accept', response: 'accept' },
    }),
  ).toBe('incomplete');
  expect(
    familyDecision({
      ...emptyFamilyDraft(),
      basis: 'independent-human',
      notes: 'Scope needs educator clarification.',
      judgments: { ...emptyFamilyDraft().judgments, scope: 'unsure' },
    }),
  ).toBe('unresolved');
});
it('rejects arbitrary sample IDs, duplicate evidence, unknown judgments and injected authority fields', () => {
  const d = emptyFamilyDraft();
  expect(familyDraftValid(d)).toBe(true);
  for (const bad of [
    { ...d, examples: [0, 0] },
    { ...d, examples: [100] },
    { ...d, reviewerId: 'another' },
    { ...d, role: 'admin' },
    { ...d, judgments: { ...d.judgments, scope: 'approved' } },
    { ...d, notes: 'x'.repeat(2001) },
  ])
    expect(familyDraftValid(bad)).toBe(false);
});
