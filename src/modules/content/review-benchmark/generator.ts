import { canonicalJson, exact, record } from '../content-records.ts';
import { fingerprint } from './benchmark.ts';
import type { Candidate } from './fixtures.ts';
import { smokePolicy, smokeSpecification } from './live-smoke.ts';

export const generatorProviderId = 'd13-generator-v1';
export const generatorVersion = 'd13-generator-20261022-v1';
export const generatorExperimentCeiling = 4_000_000;
export const generatorUsageStop = 750_000;
export const generatorModels = [
  'claude-sonnet-5-5',
  'gemini-3.8-flash',
  'claude-haiku-5-5',
  'gpt-6-luna',
];
export type GeneratorBrief = {
  id: string;
  type: 'taal' | 'spelling' | 'word-problems' | 'reading';
  subject: Candidate['subject'];
  objective: string;
  instruction: string;
  options: number;
  accepted: string[];
  referenceBasis:
    'arithmetic' | 'fixed-linguistic-target' | 'fixed-passage-fact';
  words?: [number, number];
};
export const generatorBriefs: GeneratorBrief[] = [
  {
    id: 't01',
    type: 'taal',
    subject: 'Taal',
    objective: 'Een synoniem van dapper in een eenvoudige zin herkennen.',
    instruction:
      'Maak een nieuwe korte contextzin met dapper en vraag welk woord daar ongeveer hetzelfde betekent. Gebruik vier opties: moedig, bang, lui en stil, in een eigen volgorde. Geen passage.',
    options: 4,
    accepted: ['moedig'],
    referenceBasis: 'fixed-linguistic-target',
  },
  {
    id: 't02',
    type: 'taal',
    subject: 'Taal',
    objective: 'Het tegengestelde van vol in een alledaagse context herkennen.',
    instruction:
      'Maak een nieuwe context over een voorwerp dat vol is en vraag naar het tegengestelde van vol. Gebruik vier opties: leeg, rond, zwaar en groot, in een eigen volgorde. Geen passage.',
    options: 4,
    accepted: ['leeg'],
    referenceBasis: 'fixed-linguistic-target',
  },
  {
    id: 's01',
    type: 'spelling',
    subject: 'Spelling',
    objective: 'De tegenwoordige tijd van hebben bij hij kiezen.',
    instruction:
      'Maak een nieuwe natuurlijke zin met hij en één invulplek voor hebben in de tegenwoordige tijd. Opties: heeft, hebben. Vraag naar de juiste vorm in deze zin, niet naar een los correct gespeld woord. Geen passage.',
    options: 2,
    accepted: ['heeft'],
    referenceBasis: 'fixed-linguistic-target',
  },
  {
    id: 's02',
    type: 'spelling',
    subject: 'Spelling',
    objective: 'Het meervoud van boom correct spellen.',
    instruction:
      'Maak een nieuwe korte context en vraag naar het correct gespelde meervoud van boom. Opties: bomen, boomen. Geen passage.',
    options: 2,
    accepted: ['bomen'],
    referenceBasis: 'fixed-linguistic-target',
  },
  {
    id: 'w01',
    type: 'word-problems',
    subject: 'Rekenen',
    objective:
      'Het totaal van gelijke groepen met vermenigvuldiging berekenen.',
    instruction:
      'Schrijf één doorlopend verhaaltje met de vraag erin: precies 4 zakjes, elk met 6 knikkers, vraag naar het totale aantal knikkers. Zet alles in prompt; passage leeg. Geen opties. Rubric vraagt alleen het aantal als getal; answer bevat alleen het getal. Explanation toont de vermenigvuldiging. Geen antwoord in het verhaaltje.',
    options: 0,
    accepted: [String(4 * 6)],
    referenceBasis: 'arithmetic',
  },
  {
    id: 'w02',
    type: 'word-problems',
    subject: 'Rekenen',
    objective: 'Wisselgeld na twee aankopen berekenen.',
    instruction:
      'Schrijf één doorlopend verhaaltje met vraag erin: iemand betaalt met 20 euro voor één boek van 7 euro en één schrift van 5 euro. Vraag hoeveel euro die persoon terugkrijgt. Zet alles in prompt; passage leeg. Geen opties. Rubric en answer vereisen euro bij het antwoord. Explanation toont beide rekenstappen. Geef het antwoord niet weg in het verhaal.',
    options: 0,
    accepted: [`${20 - 7 - 5} euro`, '€ 8', '€8'],
    referenceBasis: 'arithmetic',
  },
  {
    id: 'r01',
    type: 'reading',
    subject: 'Begrijpend Lezen',
    objective: 'Een expliciet genoemde dag terugvinden in een verhaal.',
    instruction:
      'Schrijf een nieuw samenhangend verhaal van 120–160 woorden over Noor die met haar klas een moestuin bezoekt. Het bezoek is expliciet op woensdag. Andere dagen mogen in het verhaal voorkomen, maar niet als bezoekdag. Stel één korte open vraag naar de dag van het bezoek. Geen opties. Geef in explanation een letterlijk citaat uit passage dat het antwoord bewijst. Laat het antwoord niet in prompt of rubric staan.',
    options: 0,
    accepted: ['woensdag', 'op woensdag'],
    referenceBasis: 'fixed-passage-fact',
    words: [120, 160],
  },
  {
    id: 'r02',
    type: 'reading',
    subject: 'Begrijpend Lezen',
    objective:
      'Een expliciet genoemde oorzaak van een routewijziging begrijpen.',
    instruction:
      'Schrijf een nieuw samenhangend verhaal van 120–160 woorden over een klas die een omweg naar de bibliotheek maakt. De expliciete reden is dat de brug wordt gerepareerd; het weer is niet de reden. Stel één korte open waaromvraag over de omweg. Geen opties. Geef in explanation een letterlijk citaat uit passage dat het antwoord bewijst. Laat het antwoord niet in prompt of rubric staan.',
    options: 0,
    accepted: [
      'omdat de brug wordt gerepareerd',
      'de brug wordt gerepareerd',
      'omdat de brug gerepareerd wordt',
      'de brug gerepareerd wordt',
    ],
    referenceBasis: 'fixed-passage-fact',
    words: [120, 160],
  },
];
export const generatorInstructions =
  'Create exactly one synthetic Dutch groep-5 exercise obeying the supplied brief. Use natural age-appropriate Dutch. Return only the specified JSON, no extra commentary. For reading put the whole original passage in passage and the question in prompt. For other types keep passage empty. Give one unambiguous answer, a concise factual explanation and response instructions matching the options/open format. Do not include hints or the answer in the question. Do not use real learner data. No publication or educational approval is implied.';
export const generatorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['prompt', 'passage', 'options', 'rubric', 'answer', 'explanation'],
  properties: {
    prompt: { type: 'string' },
    passage: { type: 'string' },
    options: { type: 'array', items: { type: 'string' } },
    rubric: { type: 'string' },
    answer: { type: 'string' },
    explanation: { type: 'string' },
  },
};
export function generatorRequestId(briefId: string, model: string) {
  return `d13-gen-v1-${model.replaceAll('.', '_')}-${briefId}`;
}
export function generatorRequest(briefId: string, model: string) {
  const brief = generatorBriefs.find((b) => b.id === briefId);
  if (!brief || !generatorModels.includes(model))
    throw new Error('INVALID_GENERATOR_PROFILE');
  const { accepted, referenceBasis, ...visible } = brief;
  void accepted;
  void referenceBasis;
  return canonicalJson({
    namespace: generatorProviderId,
    version: generatorVersion,
    phase: 'generate',
    model,
    brief: visible,
  });
}
export const generatorManifest = generatorModels.flatMap((model) =>
  generatorBriefs.map((b) => ({
    model,
    briefId: b.id,
    type: b.type,
    requestId: generatorRequestId(b.id, model),
    specification: generatorRequest(b.id, model),
  })),
);
export function parseGeneratedExercise(
  briefId: string,
  value: unknown,
): Candidate | null {
  const brief = generatorBriefs.find((b) => b.id === briefId);
  if (
    !brief ||
    !record(value) ||
    !exact(value, [
      'prompt',
      'passage',
      'options',
      'rubric',
      'answer',
      'explanation',
    ])
  )
    return null;
  for (const key of ['prompt', 'passage', 'rubric', 'answer', 'explanation'])
    if (
      typeof value[key] !== 'string' ||
      (key !== 'passage' && !value[key].trim()) ||
      value[key].length >
        (key === 'passage' ? 2600 : key === 'prompt' ? 700 : 600)
    )
      return null;
  if (
    !Array.isArray(value.options) ||
    value.options.length > 4 ||
    !value.options.every(
      (o) => typeof o === 'string' && o.trim() && o.length <= 100,
    )
  )
    return null;
  const fields = value as Pick<
    Candidate,
    'prompt' | 'passage' | 'rubric' | 'answer' | 'explanation' | 'options'
  >;
  return {
    id: brief.id,
    subject: brief.subject,
    category: brief.type,
    objective: brief.objective,
    ...fields,
  };
}
export function generatorReviewRequest(
  parentRequestId: string,
  candidate: Candidate,
) {
  const parent = generatorManifest.find((m) => m.requestId === parentRequestId);
  if (!parent || candidate.id !== parent.briefId)
    throw new Error('INVALID_GENERATOR_PARENT');
  const { prompt, passage, options, rubric, answer, explanation } = candidate;
  const parsed = parseGeneratedExercise(parent.briefId, {
    prompt,
    passage,
    options,
    rubric,
    answer,
    explanation,
  });
  if (!parsed || canonicalJson(candidate) !== canonicalJson(parsed))
    throw new Error('INVALID_GENERATED_CANDIDATE');
  return canonicalJson({
    namespace: generatorProviderId,
    version: generatorVersion,
    phase: 'review',
    model: 'claude-haiku-5-5',
    parentRequestId,
    contentHash: fingerprint(candidate),
    candidate,
  });
}
export function readGeneratorRequest(specification: string) {
  const value: unknown = JSON.parse(specification);
  if (!record(value)) throw new Error('INVALID_GENERATOR_REQUEST');
  if (
    value.phase === 'generate' &&
    record(value.brief) &&
    typeof value.brief.id === 'string' &&
    typeof value.model === 'string' &&
    specification === generatorRequest(value.brief.id, value.model)
  )
    return {
      phase: 'generate' as const,
      model: value.model,
      briefId: value.brief.id,
      candidate: null,
      parentRequestId: null,
    };
  if (
    value.phase === 'review' &&
    typeof value.parentRequestId === 'string' &&
    record(value.candidate) &&
    specification ===
      generatorReviewRequest(
        value.parentRequestId,
        value.candidate as Candidate,
      )
  )
    return {
      phase: 'review' as const,
      model: 'claude-haiku-5-5',
      briefId: (value.candidate as Candidate).id,
      candidate: value.candidate as Candidate,
      parentRequestId: value.parentRequestId,
    };
  throw new Error('INVALID_GENERATOR_REQUEST');
}
export function generatorPolicy(specification: string) {
  const { model } = readGeneratorRequest(specification);
  return {
    ...smokePolicy(smokeSpecification(model, 'solve')),
    provider: generatorProviderId,
    version: generatorVersion,
  };
}
export function generatorInput(specification: string) {
  const req = readGeneratorRequest(specification);
  if (req.phase === 'generate') return specification;
  const { accepted, referenceBasis, ...brief } = generatorBriefs.find(
    (b) => b.id === req.briefId,
  )!;
  void accepted;
  void referenceBasis;
  return canonicalJson({
    stage: 'semantic',
    brief,
    contentHash: fingerprint(req.candidate),
    ...req.candidate,
  });
}
const normalize = (s: string) =>
  s.trim().toLocaleLowerCase('nl-NL').replace(/\s+/g, ' ').replace(/\.$/, '');
export function checkGeneratedExercise(briefId: string, candidate: Candidate) {
  const b = generatorBriefs.find((b) => b.id === briefId)!;
  const words = candidate.passage.trim().split(/\s+/).filter(Boolean).length;
  const findings: string[] = [];
  if (candidate.options.length !== b.options)
    findings.push('option-count-mismatch');
  if (new Set(candidate.options).size !== candidate.options.length)
    findings.push('duplicate-options');
  if (b.options && !candidate.options.includes(candidate.answer))
    findings.push('key-not-an-exact-option');
  if (!b.accepted.some((a) => normalize(a) === normalize(candidate.answer)))
    findings.push('answer-does-not-match-independent-reference');
  if (b.words && (words < b.words[0] || words > b.words[1]))
    findings.push('passage-word-count-outside-brief');
  if (!b.words && candidate.passage !== '')
    findings.push('unexpected-separate-passage');
  return {
    findings,
    passageWords: words,
    referenceBasis: b.referenceBasis,
    referenceAnswer: b.accepted,
    humanApproved: false,
    semanticSuitability: 'pending-independent-review',
  };
}

if (
  fingerprint(generatorBriefs) !==
  'ac5877136c4185da18352580e322bdae78f3b0840431d998ba3ba1c1ab3242b1'
)
  throw new Error('GENERATOR_BRIEF_VERSION_CONFLICT');
