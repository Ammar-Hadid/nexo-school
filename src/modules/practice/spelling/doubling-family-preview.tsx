'use client';
import { ExerciseScreen } from '../exercise/exercise-screen';
import type {
  ExerciseDefinition,
  ExerciseScreenProps,
} from '../exercise/exercise-definition';
import {
  initialPreview,
  recordPreviewAnswer,
} from '../exercise/exercise-preview';
import { definition } from './spelling-screen';
import { validateAnswer } from './spelling-preview';
import { doublingQuestion, doublingCorrect } from './doubling-family';
export const doublingDefinition: ExerciseDefinition = {
  ...definition,
  summary: {
    ...definition.summary,
    title: 'Spelling · medeklinkerverdubbeling',
  },
  initialPreview: (scenario) =>
    initialPreview(scenario, doublingQuestion(3).answer, 'popen'),
  previewQuestion: doublingQuestion,
  submitPreview: (state, answer) =>
    state.stage !== 'answer' || validateAnswer(answer)
      ? state
      : recordPreviewAnswer(
          state,
          answer.trim(),
          doublingCorrect(state.index, answer),
        ),
};
export function DoublingFamilyPreview(props: ExerciseScreenProps) {
  return <ExerciseScreen definition={doublingDefinition} {...props} />;
}
