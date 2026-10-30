'use client';
import { ExerciseScreen } from '../exercise/exercise-screen';
import type {
  ExerciseDefinition,
  ExerciseScreenProps,
} from '../exercise/exercise-definition';
import { redactiesommenPresentation } from './redactiesommen-presentation';
import {
  initialPreview,
  previewQuestion,
  submitPreview,
  validateAnswer,
} from './redactiesommen-preview';

export const definition: ExerciseDefinition = {
  ...redactiesommenPresentation,
  initialPreview,
  previewQuestion,
  submitPreview,
  validate: validateAnswer,
};
export function RedactiesommenScreen(props: ExerciseScreenProps) {
  return <ExerciseScreen definition={definition} {...props} />;
}
