import { exerciseCompanion } from '../exercise/exercise-companion';
import type { ExercisePresentation } from '../exercise/exercise-definition';
export const rekenenPresentation: Omit<
  ExercisePresentation,
  'previewQuestion'
> = {
  subject: 'Rekenen',
  task: 1,
  exerciseLabel: 'Rekenoefening',
  instruction: 'Reken uit',
  inputMode: 'numeric',
  maxLength: 6,
  nextFeedback: 'Op naar de volgende som!',
  explanationHeading: 'Zo kun je het uitrekenen',
  explanationIntro: 'Reken in kleine stappen:',
  summary: {
    title: 'Rekenen · taak 1',
    singular: 'som',
    plural: 'sommen',
    success: 'Sommen goed opgelost. Goed gedaan!',
    support: 'Je hebt alle sommen geprobeerd. We oefenen samen verder.',
  },
  companion: exerciseCompanion,
  validate: (answer) =>
    /^\d{1,6}$/.test(answer.trim()) ? '' : 'Typ eerst een getal in.',
};
