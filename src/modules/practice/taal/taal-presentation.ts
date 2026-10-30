import type { ExercisePresentation } from '../exercise/exercise-definition';
import { taalCompanion } from './taal-companion';
export const taalPresentation: Omit<ExercisePresentation, 'previewQuestion'> = {
  subject: 'Taal',
  task: 1,
  exerciseLabel: 'Taaloefening',
  instruction: 'Welk woord is het werkwoord?',
  inputMode: 'text',
  maxLength: 40,
  nextFeedback: 'Op naar de volgende vraag!',
  explanationHeading: 'Zo vind je het werkwoord',
  explanationIntro: 'Bekijk de zin in kleine stappen:',
  summary: {
    title: 'Taal · taak 1',
    singular: 'vraag',
    plural: 'vragen',
    success: 'Vragen goed beantwoord. Goed gedaan!',
    support: 'Je hebt alle vragen geprobeerd. We oefenen samen verder.',
  },
  validate: (answer) =>
    !answer.trim()
      ? 'Typ eerst een woord in.'
      : !/^\p{L}{1,40}$/u.test(answer.trim())
        ? 'Typ één woord uit de zin.'
        : '',
  companion: taalCompanion,
};
