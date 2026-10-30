import { canonicalJson } from '../content-records.ts';
import type {
  ExerciseContract,
  ExercisePayload,
} from '../exercise-contract.ts';
import {
  doublingBank,
  doublingQuestion,
  doublingVersion,
} from '../../practice/spelling/doubling-family.ts';
export const spellingRules: ExerciseContract = {
  version: 'exercise-checks-v1',
  response: 'open',
  optionCount: 0,
  context: 'none',
  passageWords: null,
  requiredPromptTerms: ['één', 'twee'],
  calculation: null,
};
export const spellingRubric = {
  criteria: [
    'Controleer de gesloten woordenbank, de korte klinker en de uitleg.',
  ],
  responsePolicy:
    'Alleen buitenste spaties en hoofdletters negeren; spelfouten, accenten, leestekens en binnenste spaties behouden.',
  evaluatorVersion: doublingVersion,
  exerciseContract: spellingRules,
};
export function spellingPayload(index: number): ExercisePayload {
  const q = doublingQuestion(index);
  return {
    schemaVersion: 'exercise-v2',
    learner: { prompt: q.prompt, passage: '', options: [] },
    privateEvaluation: {
      acceptedAnswers: [q.answer],
      gradingRules: [spellingRubric.responsePolicy],
      explanation: q.steps.join(' '),
    },
    rights:
      'project-authored prompts/explanations; cited spelling facts, no copied dictionary definitions',
    provenance: `${doublingVersion}; source checked 2026-10-24: ${doublingBank[index]!.source}; agent-authored; educational review pending; practice only`,
  };
}
export function spellingPayloadValid(value: unknown) {
  try {
    return doublingBank.some(
      (_, i) => canonicalJson(value) === canonicalJson(spellingPayload(i)),
    );
  } catch {
    return false;
  }
}
