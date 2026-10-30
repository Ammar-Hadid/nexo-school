import type { ExercisePresentation } from '../exercise/exercise-definition';
import { wordCompanion } from '../exercise/word-companion';
export const readingPresentation: Omit<
  ExercisePresentation,
  'previewQuestion'
> = {
  subject: 'Begrijpend Lezen',
  task: 1,
  exerciseLabel: 'Leestekst en vragen',
  instruction: 'Lees en kies',
  inputMode: 'text',
  maxLength: 1,
  nextFeedback: 'Op naar de volgende vraag!',
  explanationHeading: 'Zo vind je het in de tekst',
  explanationIntro: 'Kijk nog eens naar dit stukje:',
  summary: {
    title: 'Begrijpend Lezen · taak 1',
    singular: 'vraag',
    plural: 'vragen',
    success: 'Vragen goed beantwoord. Goed gedaan!',
    support: 'Je hebt alle vragen geprobeerd. We oefenen samen verder.',
  },
  validate: (answer) =>
    ['a', 'b', 'c', 'd'].includes(answer) ? '' : 'Kies eerst een antwoord.',
  companion: wordCompanion,
};
