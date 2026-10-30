import type { ExerciseContract, ExercisePayload } from '../exercise-contract';
export const reviewBatchId = 'd14-taal-demo-v1';
export const reviewBatchTitle =
  'Taal · Werkwoordsvormen — synthetische proefset';
export const reviewRubricId = 'd1400000-0000-4000-8000-000000000001';
export const reviewRules: ExerciseContract = {
  version: 'exercise-checks-v1',
  response: 'open',
  optionCount: 0,
  context: 'gap-sentence',
  passageWords: null,
  requiredPromptTerms: [],
  calculation: null,
};
export const reviewRubric = {
  criteria: ['Controleer de persoonsvorm, de zin en de uitleg.'],
  responsePolicy:
    'Correct gespelde persoonsvorm; menselijke semantische controle vereist.',
  evaluatorVersion: 'd14-synthetic-not-for-assignment-v1',
  exerciseContract: reviewRules,
};
const payload = (
  prompt: string,
  answer: string,
  explanation: string,
): ExercisePayload => ({
  schemaVersion: 'exercise-v2',
  learner: { prompt, passage: '', options: [] },
  privateEvaluation: {
    acceptedAnswers: [answer],
    explanation,
    gradingRules: ['Alleen de correct gespelde persoonsvorm is geldig.'],
  },
  rights: 'project-authored-synthetic',
  provenance:
    'D14 demonstration only; not D13 evidence or educationally approved content',
});
export const reviewSeeds = [
  {
    contentId: 'd1400000-0000-4000-8000-000000000011',
    title: 'Hebben',
    payload: payload(
      'Hij __ (hebben) een boek.',
      'heeft',
      'Bij hij hoort de persoonsvorm heeft.',
    ),
    advisory: 'clear' as const,
    note: 'In dit gesimuleerde voorbeeld zijn geen aandachtspunten gemeld. Controleer zelf de volledige inhoud.',
  },
  {
    contentId: 'd1400000-0000-4000-8000-000000000012',
    title: 'Lopen',
    payload: payload(
      'Zij __ (lopen) elke dag naar school.',
      'loopt',
      'Bij één persoon, zij, hoort loopt.',
    ),
    advisory: 'flagged' as const,
    note: 'Zij kan ook meervoud zijn. Maak de bedoelde persoon ondubbelzinnig en controleer sleutel en uitleg.',
  },
  {
    contentId: 'd1400000-0000-4000-8000-000000000013',
    title: 'Spelen',
    payload: payload(
      'Welke vorm van spelen past in de zin?',
      'speelt',
      'Lina speelt buiten.</br>',
    ),
    advisory: 'clear' as const,
    note: 'Gesimuleerd gemist defect: een clear-melding vervangt de controles en jouw beoordeling niet.',
  },
];
