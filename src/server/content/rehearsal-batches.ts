import 'server-only';
import coverage from '../../modules/curriculum/required-coverage.json';
import type {
  ExerciseContract,
  ExercisePayload,
} from '../../modules/content/exercise-contract';
import { questions as taal } from '../../modules/practice/taal/taal-preview';
import { questions as stories } from '../../modules/practice/redactiesommen/redactiesommen-preview';
import {
  readingText,
  previewQuestion,
} from '../../modules/practice/begrijpend-lezen/begrijpend-lezen-preview';

/** Bounded, original synthetic specimens, not certificates or production curriculum. */
const openRules: ExerciseContract = {
  version: 'exercise-checks-v1',
  response: 'open',
  optionCount: 0,
  context: 'none',
  passageWords: null,
  requiredPromptTerms: [],
  calculation: null,
};
const reading = previewQuestion(0);
const definitions = [
  {
    key: 'taal',
    title: 'Taal · Werkwoorden herkennen',
    code: 'taal:woordsoorten:03',
    evaluatorVersion: 'taal-word-exact-v1',
    responseType: 'word' as const,
    responsePolicy:
      'Eén woord uit de zin; alleen hoofdletters en buitenste spaties negeren. Geen spellingcorrectie of synoniemen.',
    rules: openRules,
    questions: taal.slice(0, 2).map((q) => ({
      ...q,
      passage: '',
      options: [] as string[],
      answerUnit: '',
    })),
  },
  {
    key: 'redactiesommen',
    title: 'Rekenen · Redactiesommen',
    code: 'rekenen:redactiesommen:01',
    evaluatorVersion: 'redactiesommen-integer-v1',
    responseType: 'integer' as const,
    responsePolicy:
      'Alleen het gehele eindantwoord. Bewerkingskeuze, berekening en zelfstandig gekozen eenheid worden hier niet beoordeeld.',
    rules: openRules,
    questions: [stories[0]!, stories[3]!].map((q) => ({
      ...q,
      answer: String(q.answer),
      passage: '',
      options: [] as string[],
    })),
  },
  {
    key: 'reading',
    title: 'Begrijpend Lezen · Informatie vinden',
    code: 'begrijpend-lezen:informatie-vinden:01',
    evaluatorVersion: 'reading-choice-exact-v1',
    responseType: 'single-choice' as const,
    responsePolicy:
      'Precies één bestaande antwoordoptie. Eén vraag per tekstblootstelling; geen onafhankelijke beheersingsbewijzen.',
    rules: {
      ...openRules,
      response: 'single-choice' as const,
      optionCount: 4,
      context: 'passage' as const,
      passageWords: { min: 300, max: 500 },
    },
    questions: [
      {
        ...reading,
        answerUnit: '',
        passage: readingText.paragraphs.join('\n\n'),
        options: reading.options.map((o) => o.label),
      },
    ],
  },
];
export const rehearsalSpecs = definitions.map((d, n) => {
  const familyId = `d14-s5-${d.key}-v1`;
  const rubric = {
    criteria: [
      'Controleer de volledige synthetische inhoud, antwoordvorm en uitleg.',
    ],
    responsePolicy: d.responsePolicy,
    evaluatorVersion: d.evaluatorVersion,
    exerciseContract: d.rules,
  };
  return {
    key: d.key,
    id: familyId,
    title: `${d.title} — synthetische proefset`,
    rubricId: `d145000${n}-0000-4000-8000-000000000001`,
    rubric,
    rules: d.rules,
    requirement: coverage.find((r) => r.code === d.code)!,
    provenance: 'deterministic-check' as const,
    seeds: d.questions.map((q, i) => ({
      contentId: `d145000${n}-0000-4000-8000-${String(i + 11).padStart(12, '0')}`,
      title: d.key === 'reading' ? readingText.title : `Oefening ${i + 1}`,
      payload: {
        schemaVersion: 'exercise-v2',
        learner: { prompt: q.prompt, passage: q.passage, options: q.options },
        privateEvaluation: {
          acceptedAnswers: [q.answer],
          gradingRules: [d.responsePolicy],
          explanation: q.steps.join(' '),
        },
        rights: 'project-authored-synthetic',
        provenance: `${familyId}; original design specimens; synthetic practice only; educational review pending`,
      } satisfies ExercisePayload,
      advisory: 'clear' as const,
      note: 'Vaste synthetische proefinhoud. Geen AI-beoordeling of onderwijskundige certificering. Beoordeel zelf vraag, antwoord en uitleg.',
      descriptor: {
        familyId,
        exposureKey:
          d.key === 'reading' ? `${familyId}:passage:tuin` : `${familyId}:${i}`,
        purpose: 'practice' as const,
        responseType: d.responseType,
        evaluatorVersion: d.evaluatorVersion,
        coverageCode: d.code,
        answerUnit: q.answerUnit,
        ...(d.key === 'reading' ? { passageTitle: readingText.title } : {}),
      },
    })),
  };
});
