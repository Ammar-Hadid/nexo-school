import { definition as rekenen } from '../rekenen/rekenen-screen';
import { definition as taal } from '../taal/taal-screen';
import { definition as spelling } from '../spelling/spelling-screen';
import { definition as redactiesommen } from '../redactiesommen/redactiesommen-screen';
import { definition as reading } from '../begrijpend-lezen/begrijpend-lezen-screen';
import type { ExerciseDefinition } from '../exercise/exercise-definition';

export type PracticeTask = {
  id: string;
  definition: ExerciseDefinition;
  number: number;
};

// Explicit fixture assignment, never inferred from translated labels. Both rekenen
// tasks intentionally reuse the approved specimen; these are not fresh inventory.
export const practiceTasks = [
  { id: 'rekenen-1', definition: rekenen, number: 1 },
  { id: 'rekenen-2', definition: rekenen, number: 2 },
  { id: 'taal-1', definition: taal, number: 1 },
  { id: 'spelling-1', definition: spelling, number: 1 },
  { id: 'redactiesommen-1', definition: redactiesommen, number: 1 },
  { id: 'reading-1', definition: reading, number: 1 },
] as const;
