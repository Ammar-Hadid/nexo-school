'use client';
import { ExerciseScreen } from '../exercise/exercise-screen';
import type {
  ExerciseDefinition,
  ExerciseScreenProps,
} from '../exercise/exercise-definition';
import {
  initialPreview,
  previewQuestion,
  submitPreview,
} from './rekenen-preview';
import { rekenenPresentation } from './rekenen-presentation';
import { rekenenCompanion } from './rekenen-companion';

export const definition: ExerciseDefinition = {
  ...rekenenPresentation,
  initialPreview,
  submitPreview,
  companion: rekenenCompanion,
  previewQuestion: (index) => {
    const question = previewQuestion(index);
    return { ...question, prompt: `${question.sum} = ?` };
  },
  validate: (answer) =>
    /^\d{1,6}$/.test(answer.trim()) ? '' : 'Typ eerst een getal in.',
};
export function RekenenScreen(props: ExerciseScreenProps) {
  return <ExerciseScreen definition={definition} {...props} />;
}
