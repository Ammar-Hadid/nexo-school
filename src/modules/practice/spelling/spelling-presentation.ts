import type { ExercisePresentation } from '../exercise/exercise-definition';
import { wordCompanion } from '../exercise/word-companion';
export const spellingPresentation: Omit<
  ExercisePresentation,
  'previewQuestion'
> = {
  subject: 'Spelling',
  task: 1,
  exerciseLabel: 'Spellingoefening',
  instruction: 'Schrijf het meervoud',
  inputMode: 'text',
  maxLength: 40,
  autoCorrect: 'off',
  nextFeedback: 'Op naar het volgende woord!',
  explanationHeading: 'Zo schrijf je het woord',
  explanationIntro: 'Bekijk de spelling in kleine stappen:',
  summary: {
    title: 'Spelling · taak 1',
    singular: 'woord',
    plural: 'woorden',
    success: 'Woorden goed geschreven. Goed gedaan!',
    support: 'Je hebt alle woorden geprobeerd. We oefenen samen verder.',
  },
  validate: (answer) =>
    !answer.trim()
      ? 'Typ eerst een woord in.'
      : answer.length > 40
        ? 'Gebruik maximaal 40 tekens.'
        : '',
  companion: wordCompanion,
};
