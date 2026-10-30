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
  validateAnswer,
} from './taal-preview';
import { taalPresentation } from './taal-presentation';

export const definition: ExerciseDefinition = {
  ...taalPresentation,
  initialPreview,
  previewQuestion,
  submitPreview,
  validate: validateAnswer,
};
export function TaalScreen(props: ExerciseScreenProps) {
  return <ExerciseScreen definition={definition} {...props} />;
}
