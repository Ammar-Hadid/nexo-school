import 'server-only';
import type {
  ExerciseContract,
  ExercisePayload,
} from '../../modules/content/exercise-contract';
import { additionFamily, generateAddition } from './addition-family';
const uuid = (kind: number, index: number) =>
  `d1410000-0000-4000-800${kind}-${String(index).padStart(12, '0')}`;
// One representative per commutative exposure group. Interleave sums so a small review batch isn't all zero-addends.
export const supplyCatalogue = Array.from({ length: 100 }, (_, i) =>
  generateAddition(i),
)
  .filter((i) => Math.floor(i.index / 10) <= i.index % 10)
  .sort((a, b) => ((a.index * 37) % 101) - ((b.index * 37) % 101))
  .map((instance) => {
    const rules: ExerciseContract = {
      version: 'exercise-checks-v1',
      response: 'open',
      optionCount: 0,
      context: 'none',
      passageWords: null,
      requiredPromptTerms: [],
      calculation: {
        operation: 'sum',
        operands: [Math.floor(instance.index / 10), instance.index % 10],
        unit: null,
      },
    };
    const rubric = {
      criteria: ['Controleer som, antwoord, uitleg en geschiktheid.'],
      responsePolicy: additionFamily.responsePolicy,
      evaluatorVersion: 'd14-optellen-local-v1',
      exerciseContract: rules,
    };
    const payload: ExercisePayload = {
      schemaVersion: 'exercise-v2',
      learner: { prompt: instance.prompt, passage: '', options: [] },
      privateEvaluation: {
        acceptedAnswers: [instance.answer],
        explanation: instance.explanation,
        gradingRules: ['Vul het gehele getal in.'],
      },
      rights: additionFamily.rights,
      provenance: `Local synthetic D14-S1; ${instance.instanceId}; family certification pending`,
    };
    return {
      instance,
      rules,
      rubric,
      payload,
      contentId: uuid(1, instance.index),
      rubricId: uuid(2, instance.index),
    };
  });
