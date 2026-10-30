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
import { parseIntegerAnswer } from '../assignment/submission-state';
import { rekenenPresentation } from './rekenen-presentation';
import { rekenenCompanion } from './rekenen-companion';
import { explainAddition, type AdditionRange } from './addition-strategies';
/** The same subject generator and approved screen; deliberately in-memory, never an assignment API. */
export const additionPreviewPairs: Record<
  AdditionRange,
  readonly [number, number][]
> = {
  digits: [
    [7, 9],
    [0, 0],
    [0, 9],
    [6, 6],
    [9, 0],
    [2, 7],
    [2, 2],
    [5, 5],
    [1, 9],
    [9, 9],
  ],
  'two-digits': [
    [24, 18],
    [21, 34],
    [36, 27],
    [45, 38],
    [10, 10],
    [11, 89],
    [50, 50],
    [90, 10],
    [28, 32],
    [62, 17],
  ],
};
export function additionDefinition(range: AdditionRange): ExerciseDefinition {
  const pairs = additionPreviewPairs[range];
  return {
    ...rekenenPresentation,
    companion: rekenenCompanion,
    initialPreview: (scenario) =>
      initialPreview(scenario, explainAddition(...pairs[3]!).answer, '999'),
    previewQuestion: (index) => {
      const pair = pairs[index];
      if (!pair) throw new Error('UNKNOWN_PREVIEW_ITEM');
      return {
        prompt: `${pair[0]} + ${pair[1]} = ?`,
        ...explainAddition(...pair),
      };
    },
    submitPreview: (state, answer) =>
      recordPreviewAnswer(
        state,
        answer,
        parseIntegerAnswer(answer) ===
          explainAddition(...pairs[state.index]!).answer,
      ),
  };
}
export function AdditionFamilyPreview({
  range = 'digits',
  ...props
}: ExerciseScreenProps & { range?: AdditionRange }) {
  return <ExerciseScreen definition={additionDefinition(range)} {...props} />;
}
