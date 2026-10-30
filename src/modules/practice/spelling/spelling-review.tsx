'use client';
import { ExerciseReview } from '../exercise/exercise-review';
import { SpellingScreen } from './spelling-screen';
import { initialPreview } from './spelling-preview';
export function SpellingReview() {
  return (
    <ExerciseReview
      subject="Spelling"
      approved
      Screen={SpellingScreen}
      initialPreview={initialPreview}
      intro="Van één naar meer: schrijf bij elk woord het hele meervoud."
      fixtureNote="Deze tien woorden zijn vaste ontwerpvoorbeelden."
    />
  );
}
