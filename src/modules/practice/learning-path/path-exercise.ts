import type { ExerciseDefinition } from '../exercise/exercise-definition';
import { definition as rekenen } from '../rekenen/rekenen-screen';
import { definition as taal } from '../taal/taal-screen';
import { definition as redactiesommen } from '../redactiesommen/redactiesommen-screen';
import { emptySnapshot, submit, type Assignment } from './path-model';

/** The existing approved composition and exact companion messages remain shared. */
export function pathExercise(task: Assignment): ExerciseDefinition {
  const base =
    task.purpose === 'daily'
      ? redactiesommen
      : task.subject === 'taal'
        ? taal
        : rekenen;
  return {
    ...base,
    subject: task.subject === 'taal' ? 'Taal' : 'Rekenen',
    instruction:
      task.purpose === 'daily'
        ? base.instruction
        : 'Lees en beantwoord de vraag',
    explanationHeading:
      task.purpose === 'daily'
        ? base.explanationHeading
        : 'Zo vind je het antwoord',
    explanationIntro:
      task.purpose === 'daily'
        ? base.explanationIntro
        : 'Bekijk de vraag in kleine stappen:',
    initialPreview: () => emptySnapshot(task.questions.length).state,
    previewQuestion: (index) => task.questions[index]!,
    submitPreview: (state, answer) =>
      submit(task, { state, answer: '', error: '' }, answer).state,
  };
}
