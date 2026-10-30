'use client';
import { ExerciseReview } from '../exercise/exercise-review';
import { BegrijpendLezenScreen } from './begrijpend-lezen-screen';
import { initialPreview } from './begrijpend-lezen-preview';
export function BegrijpendLezenReview() {
  return (
    <ExerciseReview
      subject="Begrijpend Lezen"
      approved={true}
      revision={3}
      Screen={BegrijpendLezenScreen}
      initialPreview={initialPreview}
      keyboard="antwoordkeuze"
      exerciseLabel="Lezen en antwoorden"
      intro="Een lange tekst met ruimte om terug te lezen. De vraag en antwoordkeuzes staan ernaast, met Nexai eronder."
      fixtureNote="Eén oorspronkelijk verhaal met tien vaste meerkeuzevragen. Dit zijn ontwerpvoorbeelden; leesniveau, vraagkwaliteit en samenhang moeten voor gebruik met leerlingen inhoudelijk worden beoordeeld."
    />
  );
}
