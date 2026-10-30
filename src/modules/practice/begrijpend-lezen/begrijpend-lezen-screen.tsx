'use client';
import { ExerciseScreen } from '../exercise/exercise-screen';
import type {
  ExerciseDefinition,
  ExerciseScreenProps,
} from '../exercise/exercise-definition';
import { readingPresentation } from './begrijpend-lezen-presentation';
import {
  initialPreview,
  previewQuestion,
  submitPreview,
  validateAnswer,
  readingText,
} from './begrijpend-lezen-preview';

export const definition: ExerciseDefinition = {
  ...readingPresentation,
  initialPreview,
  previewQuestion,
  submitPreview,
  validate: validateAnswer,
  readingText,
};
export function BegrijpendLezenScreen(props: ExerciseScreenProps) {
  return <ExerciseScreen definition={definition} {...props} />;
}
