'use client';
import { ExerciseReview } from '../exercise/exercise-review';
import { TaalScreen } from './taal-screen';
import { initialPreview } from './taal-preview';
export function TaalReview() {
  return (
    <ExerciseReview
      subject="Taal"
      approved
      Screen={TaalScreen}
      initialPreview={initialPreview}
      intro="Zoek het werkwoord in tien korte zinnen."
      fixtureNote="Deze tien zinnen zijn vaste ontwerpvoorbeelden."
    />
  );
}
