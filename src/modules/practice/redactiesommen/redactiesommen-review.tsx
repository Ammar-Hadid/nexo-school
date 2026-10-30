'use client';
import { ExerciseReview } from '../exercise/exercise-review';
import { exerciseMessages } from '../exercise/exercise-companion';
import { RedactiesommenScreen } from './redactiesommen-screen';
import { initialPreview } from './redactiesommen-preview';
export function RedactiesommenReview() {
  return (
    <ExerciseReview
      subject="Redactiesommen"
      approved={true}
      revision={2}
      Screen={RedactiesommenScreen}
      initialPreview={initialPreview}
      messages={exerciseMessages}
      keyboard="cijfertoetsenbord"
      exerciseLabel="Redactiesommen"
      intro="Lees het hele verhaal, met de vraag in dezelfde tekst, en vul je antwoord in. De eenheid staat bij het antwoordveld."
      fixtureNote="Deze tien verhalen zijn vaste ontwerpvoorbeelden. Je geeft hier één eindantwoord; losse redeneerstappen worden niet beoordeeld."
    />
  );
}
