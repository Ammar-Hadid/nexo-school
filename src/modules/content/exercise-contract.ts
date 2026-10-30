import { exact, record, text } from './json-records.ts';

/** Future authored content only. Frozen D13 experiment protocols remain unchanged. */
export type ExercisePayload = {
  schemaVersion: 'exercise-v2';
  learner: { prompt: string; passage: string; options: string[] };
  privateEvaluation: {
    acceptedAnswers: string[];
    gradingRules: string[];
    explanation: string;
  };
  rights: string;
  provenance: string;
};
export type ExerciseContract = {
  version: 'exercise-checks-v1';
  response: 'open' | 'single-choice';
  optionCount: number;
  context: 'none' | 'passage' | 'gap-sentence';
  passageWords: { min: number; max: number } | null;
  requiredPromptTerms: string[];
  calculation: {
    operation: 'sum' | 'subtract' | 'product';
    operands: number[];
    unit: string | null;
  } | null;
};
const strings = (v: unknown, min: number, max: number): v is string[] =>
  Array.isArray(v) && v.length >= min && v.length <= max && v.every(text);
const optionalText = (v: unknown): v is string =>
  typeof v === 'string' && v.length <= 16000;
const normal = (s: string) =>
  s.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('nl');
const boundedInteger = (v: unknown, min: number, max: number) =>
  Number.isSafeInteger(v) && Number(v) >= min && Number(v) <= max;

export function exercisePayload(v: unknown): v is ExercisePayload {
  if (
    !record(v) ||
    !exact(v, [
      'schemaVersion',
      'learner',
      'privateEvaluation',
      'rights',
      'provenance',
    ]) ||
    v.schemaVersion !== 'exercise-v2'
  )
    return false;
  const l = v.learner,
    p = v.privateEvaluation;
  return (
    record(l) &&
    exact(l, ['prompt', 'passage', 'options']) &&
    text(l.prompt) &&
    optionalText(l.passage) &&
    strings(l.options, 0, 8) &&
    record(p) &&
    exact(p, ['acceptedAnswers', 'gradingRules', 'explanation']) &&
    strings(p.acceptedAnswers, 1, 20) &&
    strings(p.gradingRules, 1, 30) &&
    text(p.explanation) &&
    text(v.rights) &&
    text(v.provenance)
  );
}
/** Authored rules belong to the immutable rubric, never inferred from a generated draft. */
export function exerciseContract(v: unknown): v is ExerciseContract {
  if (
    !record(v) ||
    !exact(v, [
      'version',
      'response',
      'optionCount',
      'context',
      'passageWords',
      'requiredPromptTerms',
      'calculation',
    ]) ||
    v.version !== 'exercise-checks-v1'
  )
    return false;
  if (
    !(v.response === 'open' && v.optionCount === 0) &&
    !(v.response === 'single-choice' && boundedInteger(v.optionCount, 2, 8))
  )
    return false;
  if (
    !['none', 'passage', 'gap-sentence'].includes(String(v.context)) ||
    !strings(v.requiredPromptTerms, 0, 20)
  )
    return false;
  const w = v.passageWords,
    c = v.calculation;
  if (
    w !== null &&
    !(
      v.context === 'passage' &&
      record(w) &&
      exact(w, ['min', 'max']) &&
      boundedInteger(w.min, 1, 3000) &&
      boundedInteger(w.max, Number(w.min), 3000)
    )
  )
    return false;
  if (
    c !== null &&
    !(
      record(c) &&
      exact(c, ['operation', 'operands', 'unit']) &&
      ['sum', 'subtract', 'product'].includes(String(c.operation)) &&
      Array.isArray(c.operands) &&
      c.operands.length >= 2 &&
      c.operands.length <= 4 &&
      c.operands.every((n) => boundedInteger(n, 0, 10000)) &&
      (c.unit === null || text(c.unit))
    )
  )
    return false;
  // Reject results outside exact integer arithmetic, including large products.
  if (c !== null && record(c) && Array.isArray(c.operands)) {
    const values = c.operands as number[];
    if (!Number.isSafeInteger(calculate(String(c.operation), values)))
      return false;
  }
  return true;
}
function calculate(operation: string, values: number[]) {
  return values
    .slice(1)
    .reduce(
      (a, b) =>
        operation === 'sum' ? a + b : operation === 'subtract' ? a - b : a * b,
      values[0]!,
    );
}
export type ExerciseIssue = { code: string; field: string };
/** Findings are deterministic blockers, not a claim of educational approval. */
export function checkExercise(value: unknown, rules: unknown): ExerciseIssue[] {
  if (!exercisePayload(value)) return [{ code: 'schema', field: 'payload' }];
  if (!exerciseContract(rules)) return [{ code: 'contract', field: 'rubric' }];
  const issues: ExerciseIssue[] = [];
  const add = (code: string, field: string) => issues.push({ code, field });
  const { learner: l, privateEvaluation: p } = value;
  const fields: [string, string][] = [
    ['learner.prompt', l.prompt],
    ['learner.passage', l.passage],
    ...l.options.map((s, i): [string, string] => [`learner.options.${i}`, s]),
    ['privateEvaluation.explanation', p.explanation],
    ...p.gradingRules.map((s, i): [string, string] => [
      `privateEvaluation.gradingRules.${i}`,
      s,
    ]),
    ...p.acceptedAnswers.map((s, i): [string, string] => [
      `privateEvaluation.acceptedAnswers.${i}`,
      s,
    ]),
  ];
  for (const [field, s] of fields) {
    if (
      /<\/?[a-z][^>]*>|```|[{}]|[\u0000-\u0008\u000b\u000c\u000e-\u001f]/iu.test(
        s,
      )
    )
      add('formatting', field);
  }
  if (
    l.options.length !== rules.optionCount ||
    new Set(l.options.map(normal)).size !== l.options.length
  )
    add('options', 'learner.options');
  if (
    rules.response === 'single-choice' &&
    (p.acceptedAnswers.length !== 1 ||
      !l.options.map(normal).includes(normal(p.acceptedAnswers[0]!)))
  )
    add('answer-option', 'privateEvaluation.acceptedAnswers');
  if (rules.response === 'open' && /\bkies\b|\bselecteer\b/iu.test(l.prompt))
    add('response-mismatch', 'learner.prompt');
  if (rules.response === 'single-choice' && /\bvul\b.*\bin\b/iu.test(l.prompt))
    add('response-mismatch', 'learner.prompt');
  if (rules.context === 'passage' && !l.passage.trim())
    add('missing-context', 'learner.passage');
  // Gap tasks must carry their actual sentence in learner-visible content.
  if (rules.context === 'gap-sentence' && !/__+/.test(l.prompt))
    add('missing-context', 'learner.prompt');
  if (rules.passageWords) {
    const count = l.passage.trim().split(/\s+/u).filter(Boolean).length;
    if (count < rules.passageWords.min || count > rules.passageWords.max)
      add('passage-length', 'learner.passage');
  }
  for (const term of rules.requiredPromptTerms) {
    const words = (s: string) =>
      normal(s)
        .match(/[\p{L}\p{N}]+/gu)
        ?.join(' ') ?? '';
    if (!` ${words(l.prompt)} `.includes(` ${words(term)} `))
      add('objective-cue', 'learner.prompt');
  }
  // Literal disclosure cues only: evidence containing an answer is valid reading context.
  for (const [field, s] of fields.filter(([field]) =>
    field.startsWith('learner.'),
  )) {
    if (
      /\b(?:het\s+(?:juiste\s+)?antwoord|de\s+oplossing|antwoord|oplossing)\s*(?:is\b|:|=)/iu.test(
        s,
      ) ||
      (p.explanation.length >= 20 && normal(s).includes(normal(p.explanation)))
    )
      add('answer-disclosure', field);
  }
  if (rules.calculation) {
    const c = rules.calculation;
    const expected = `${calculate(c.operation, c.operands)}${c.unit ? ` ${c.unit}` : ''}`;
    if (p.acceptedAnswers.some((a) => normal(a) !== normal(expected)))
      add('calculation-key', 'privateEvaluation.acceptedAnswers');
  }
  return issues;
}
/** Only call at an authorized server projection boundary; never serialize the full payload to a learner. */
export function learnerExercise(value: unknown, rules: unknown) {
  if (
    !exercisePayload(value) ||
    !exerciseContract(rules) ||
    checkExercise(value, rules).length
  )
    throw new Error('EXERCISE_NOT_PROJECTABLE');
  return {
    prompt: value.learner.prompt,
    passage: value.learner.passage,
    options: [...value.learner.options],
    instructions:
      rules.response === 'single-choice'
        ? 'Kies één antwoord.'
        : 'Vul je antwoord in.',
    response: rules.response,
  };
}
