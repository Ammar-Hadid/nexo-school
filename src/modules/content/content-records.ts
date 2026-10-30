import { record, exact, text } from './json-records.ts';
import { exerciseContract, exercisePayload } from './exercise-contract.ts';
export { canonicalJson, record, exact, text } from './json-records.ts';
export function rubricPayload(value: unknown) {
  return (
    record(value) &&
    (exact(value, ['criteria', 'responsePolicy', 'evaluatorVersion']) ||
      (exact(value, [
        'criteria',
        'responsePolicy',
        'evaluatorVersion',
        'exerciseContract',
      ]) &&
        exerciseContract(value.exerciseContract))) &&
    Array.isArray(value.criteria) &&
    value.criteria.length > 0 &&
    value.criteria.length <= 30 &&
    value.criteria.every(text) &&
    text(value.responsePolicy) &&
    text(value.evaluatorVersion)
  );
}
/** Storage structure only; truth/appropriateness require explicit human review. */
export function contentPayload(value: unknown) {
  if (exercisePayload(value)) return true;
  return (
    record(value) &&
    exact(value, [
      'prompt',
      'responseSpecification',
      'evaluationSpecification',
      'explanation',
      'rights',
      'provenance',
    ]) &&
    ['prompt', 'explanation', 'rights', 'provenance'].every((key) =>
      text(value[key]),
    ) &&
    record(value.responseSpecification) &&
    Object.keys(value.responseSpecification).length > 0 &&
    record(value.evaluationSpecification) &&
    Object.keys(value.evaluationSpecification).length > 0
  );
}
