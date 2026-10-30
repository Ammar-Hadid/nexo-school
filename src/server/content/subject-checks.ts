import 'server-only';
import { rehearsalSpecs } from './rehearsal-batches';
import { checkExercise } from '../../modules/content/exercise-contract';
import { canonicalJson, record } from '../../modules/content/content-records';
import {
  spellingPayloadValid,
  spellingRubric,
} from '../../modules/content/spelling/doubling-content';
/** Same mechanical blockers at draft, review and publication boundaries. */
export function subjectContentChecks(payload: unknown, rubric: unknown) {
  const issues = checkExercise(
    payload,
    record(rubric) ? rubric.exerciseContract : null,
  );
  if (
    record(rubric) &&
    rubric.evaluatorVersion === spellingRubric.evaluatorVersion &&
    (canonicalJson(rubric) !== canonicalJson(spellingRubric) ||
      !spellingPayloadValid(payload))
  )
    issues.push({ code: 'spelling-bank-mismatch', field: 'payload' });
  if (
    record(rubric) &&
    rehearsalSpecs.some(
      (s) => s.rubric.evaluatorVersion === rubric.evaluatorVersion,
    )
  ) {
    const spec = rehearsalSpecs.find(
      (s) => s.rubric.evaluatorVersion === rubric.evaluatorVersion,
    );
    if (
      !spec ||
      canonicalJson(spec.rubric) !== canonicalJson(rubric) ||
      !spec.seeds.some(
        (s) => canonicalJson(s.payload) === canonicalJson(payload),
      )
    )
      issues.push({ code: 'rehearsal-source-mismatch', field: 'payload' });
  }
  return issues;
}
