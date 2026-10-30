import {
  initialPreview as initialExercise,
  recordPreviewAnswer,
  scenarios as exerciseScenarios,
  type PreviewState,
  type Scenario,
} from '../exercise/exercise-preview';
export { advancePreview, previewScore } from '../exercise/exercise-preview';
export type {
  Outcome,
  PreviewState,
  Scenario,
} from '../exercise/exercise-preview';
/** Synthetic review data/state only. Never used to publish or save learner work. */
export const questions = [
  { sum: '24 + 18', answer: 42, steps: ['24 + 10 = 34', '34 + 8 = 42'] },
  { sum: '56 − 19', answer: 37, steps: ['56 − 20 = 36', '36 + 1 = 37'] },
  {
    sum: '7 × 8',
    answer: 56,
    steps: ['5 × 8 = 40', '2 × 8 = 16', '40 + 16 = 56'],
  },
  { sum: '36 + 27', answer: 63, steps: ['36 + 20 = 56', '56 + 7 = 63'] },
  { sum: '81 − 34', answer: 47, steps: ['81 − 30 = 51', '51 − 4 = 47'] },
  { sum: '6 × 9', answer: 54, steps: ['6 × 10 = 60', '60 − 6 = 54'] },
  { sum: '48 ÷ 6', answer: 8, steps: ['6 × 8 = 48', 'Dus 48 ÷ 6 = 8'] },
  { sum: '45 + 38', answer: 83, steps: ['45 + 30 = 75', '75 + 8 = 83'] },
  { sum: '72 − 28', answer: 44, steps: ['72 − 20 = 52', '52 − 8 = 44'] },
  { sum: '9 × 7', answer: 63, steps: ['10 × 7 = 70', '70 − 7 = 63'] },
];
export const scenarios = {
  ...exerciseScenarios,
  perfect: 'Alle sommen in één keer goed',
} as const;
export function initialPreview(scenario: Scenario): PreviewState {
  return initialExercise(scenario, '63', '53');
}
export function previewQuestion(index: number) {
  const question = questions[index];
  if (!question) throw new Error('Unknown synthetic question');
  return question;
}
export function submitPreview(
  state: PreviewState,
  answer: string,
): PreviewState {
  if (state.stage !== 'answer') return state;
  return recordPreviewAnswer(
    state,
    answer,
    Number(answer) === previewQuestion(state.index).answer,
  );
}
