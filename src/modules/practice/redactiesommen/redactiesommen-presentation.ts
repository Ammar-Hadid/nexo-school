import type { ExercisePresentation } from '../exercise/exercise-definition';
import { exerciseCompanion } from '../exercise/exercise-companion';
export const redactiesommenPresentation: Omit<
  ExercisePresentation,
  'previewQuestion'
> = {
  subject: 'Redactiesommen',
  task: 1,
  exerciseLabel: 'Redactiesom',
  instruction: 'Lees en reken uit',
  promptAppearance: 'passage',
  inputMode: 'numeric',
  maxLength: 6,
  nextFeedback: 'Op naar de volgende som!',
  explanationHeading: 'Zo los je de som op',
  explanationIntro: 'Van het verhaal naar de som:',
  summary: {
    title: 'Redactiesommen · taak 1',
    singular: 'som',
    plural: 'sommen',
    success: 'Sommen goed opgelost. Goed gedaan!',
    support: 'Je hebt alle sommen geprobeerd. We oefenen samen verder.',
  },
  validate: (answer) =>
    /^\d{1,6}$/.test(answer.trim()) ? '' : 'Typ eerst een getal in.',
  companion: exerciseCompanion,
};
