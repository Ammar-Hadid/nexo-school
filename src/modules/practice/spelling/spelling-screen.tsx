'use client';
import { ExerciseScreen } from '../exercise/exercise-screen';
import type {
  ExerciseDefinition,
  ExerciseScreenProps,
} from '../exercise/exercise-definition';
import { spellingPresentation } from './spelling-presentation';
import {
  initialPreview,
  previewQuestion,
  submitPreview,
  validateAnswer,
} from './spelling-preview';

export const definition: ExerciseDefinition = {
  ...spellingPresentation,
  initialPreview,
  previewQuestion,
  submitPreview,
  validate: validateAnswer,
};
export function SpellingScreen(props: ExerciseScreenProps) {
  return <ExerciseScreen definition={definition} {...props} />;
}
