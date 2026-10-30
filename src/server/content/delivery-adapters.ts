import 'server-only';
import { rehearsalSpecs } from './rehearsal-batches';
import { canonicalJson } from '../../modules/content/content-records';
import { exercisePayload } from '../../modules/content/exercise-contract';
import { supplyCatalogue } from './addition-supply-catalogue';
import { spellingReviewSpec } from './spelling-review-batch';
import {
  doublingExposure,
  doublingVersion,
} from '../../modules/practice/spelling/doubling-family';
import { additionFamily } from './addition-family';
import { subjectContentChecks } from './subject-checks';
export type DeliveryDescriptor = {
  familyId: string;
  exposureKey: string;
  purpose: 'practice';
  responseType: 'integer' | 'word' | 'single-choice';
  answerUnit?: string;
  passageTitle?: string;
  evaluatorVersion: string;
  coverageCode: string;
};
/** Subject adapters certify shape/identity only. Eligibility still requires exact human review/publication.
 * Unknown content is a shortage, never a fabricated family, mapping or certificate. */
export function deliveryDescriptor(
  contentId: string,
  payload: unknown,
  rubric: unknown,
): DeliveryDescriptor | null {
  if (!exercisePayload(payload) || subjectContentChecks(payload, rubric).length)
    return null;
  const addition = supplyCatalogue.find((s) => s.contentId === contentId);
  if (
    addition &&
    canonicalJson(rubric) === canonicalJson(addition.rubric) &&
    payload.learner.prompt === addition.payload.learner.prompt &&
    payload.learner.passage === '' &&
    !payload.learner.options.length &&
    canonicalJson(payload.privateEvaluation.acceptedAnswers) ===
      canonicalJson(addition.payload.privateEvaluation.acceptedAnswers) &&
    canonicalJson(payload.privateEvaluation.gradingRules) ===
      canonicalJson(addition.payload.privateEvaluation.gradingRules) &&
    payload.rights === addition.payload.rights &&
    payload.provenance === addition.payload.provenance
  ) {
    return {
      familyId: additionFamily.familyId,
      exposureKey: addition.instance.exposureKey,
      purpose: 'practice',
      responseType: 'integer',
      evaluatorVersion: 'integer-exact-v1',
      coverageCode: additionFamily.coverageCode,
    };
  }
  const index = spellingReviewSpec.seeds.findIndex(
    (s) =>
      s.contentId === contentId &&
      canonicalJson(s.payload) === canonicalJson(payload),
  );
  if (
    index >= 0 &&
    canonicalJson(rubric) === canonicalJson(spellingReviewSpec.rubric)
  )
    return {
      familyId: doublingVersion,
      exposureKey: doublingExposure(index),
      purpose: 'practice',
      responseType: 'word',
      evaluatorVersion: doublingVersion,
      coverageCode: spellingReviewSpec.requirement.code,
    };
  for (const spec of rehearsalSpecs) {
    const seed = spec.seeds.find((s) => s.contentId === contentId);
    if (
      seed &&
      canonicalJson(seed.payload) === canonicalJson(payload) &&
      canonicalJson(spec.rubric) === canonicalJson(rubric)
    )
      return seed.descriptor;
  }
  return null;
}
