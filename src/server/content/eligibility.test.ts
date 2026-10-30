import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { deliveryDescriptor } from './delivery-adapters';
import { spellingReviewSpec } from './spelling-review-batch';
import { supplyCatalogue } from './addition-supply-catalogue';
it('resolves exact subject-owned practice metadata without inventing family or assessment authority', () => {
  const spelling = spellingReviewSpec.seeds[0]!;
  expect(
    deliveryDescriptor(
      spelling.contentId,
      spelling.payload,
      spellingReviewSpec.rubric,
    ),
  ).toMatchObject({
    familyId: 'spelling-doubling-v1',
    exposureKey: 'spelling:consonant-doubling:kat',
    purpose: 'practice',
    responseType: 'word',
  });
  const addition = supplyCatalogue[0]!;
  expect(
    deliveryDescriptor(addition.contentId, addition.payload, addition.rubric),
  ).toMatchObject({
    purpose: 'practice',
    responseType: 'integer',
    exposureKey: addition.instance.exposureKey,
  });
  expect(
    deliveryDescriptor('unknown', spelling.payload, spellingReviewSpec.rubric),
  ).toBeNull();
  const wrong = structuredClone(spelling.payload);
  wrong.privateEvaluation.acceptedAnswers = ['katen'];
  expect(
    deliveryDescriptor(spelling.contentId, wrong, spellingReviewSpec.rubric),
  ).toBeNull();
  const unsupportedRules = structuredClone(addition.payload);
  unsupportedRules.privateEvaluation.gradingRules = [
    'Also accept an answer within one of the key.',
  ];
  expect(
    deliveryDescriptor(addition.contentId, unsupportedRules, addition.rubric),
  ).toBeNull();
  expect(
    deliveryDescriptor(addition.contentId, addition.payload, {
      ...addition.rubric,
      evaluatorVersion: 'unknown',
    }),
  ).toBeNull();
});
