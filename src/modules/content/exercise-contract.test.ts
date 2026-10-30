import { expect, it } from 'vitest';
import {
  checkExercise,
  exercisePayload,
  exerciseContract,
  learnerExercise,
} from './exercise-contract';
import { contentPayload, rubricPayload } from './content-records';

const contract = {
  version: 'exercise-checks-v1',
  response: 'open',
  optionCount: 0,
  context: 'gap-sentence',
  passageWords: null,
  requiredPromptTerms: ['hebben'],
  calculation: null,
};
const draft = {
  schemaVersion: 'exercise-v2',
  learner: {
    prompt: 'Vul de vorm van hebben in: Hij __ een boek.',
    passage: '',
    options: [],
  },
  privateEvaluation: {
    acceptedAnswers: ['heeft'],
    gradingRules: ['De persoonsvorm moet correct gespeld zijn.'],
    explanation: 'Bij hij hoort heeft.',
  },
  rights: 'project-authored',
  provenance: 'synthetic test, no educational approval',
};
const codes = (value: unknown, rules: unknown = contract) =>
  checkExercise(value, rules).map((x) => x.code);
it('requires a strict versioned separation, rejects unknown fields and never repairs source bytes', () => {
  expect(exercisePayload(draft)).toBe(true);
  expect(contentPayload(draft)).toBe(true);
  expect(
    rubricPayload({
      criteria: ['Correct form'],
      responsePolicy: 'exact',
      evaluatorVersion: 'test-v1',
      exerciseContract: contract,
    }),
  ).toBe(true);
  for (const value of [
    { ...draft, rubric: 'answer' },
    { ...draft, learner: { ...draft.learner, answer: 'heeft' } },
    {
      ...draft,
      privateEvaluation: { ...draft.privateEvaluation, acceptedAnswers: [] },
    },
  ])
    expect(exercisePayload(value)).toBe(false);
  expect(codes({})).toEqual(['schema']);
  expect(codes(draft, { ...contract, version: 'unknown' })).toEqual([
    'contract',
  ]);
  expect(codes(draft)).toEqual([]);
});
it('projects an allowlisted learner DTO with application-owned response instructions and no key or explanation', () => {
  const dto = learnerExercise(draft, contract);
  expect(dto).toEqual({
    prompt: draft.learner.prompt,
    passage: '',
    options: [],
    instructions: 'Vul je antwoord in.',
    response: 'open',
  });
  expect(JSON.stringify(dto)).not.toContain('heeft');
  expect(() =>
    learnerExercise(
      { ...draft, learner: { ...draft.learner, answer: 'heeft' } },
      contract,
    ),
  ).toThrow();
});
it('blocks missing sentence context, objective cues and malformed markup found in D13', () => {
  expect(
    codes({
      ...draft,
      learner: {
        ...draft.learner,
        prompt: 'Welke vorm van hebben past in de zin?',
      },
    }),
  ).toContain('missing-context');
  expect(
    codes({
      ...draft,
      learner: {
        ...draft.learner,
        prompt: 'Een fles heeft geen water meer. De fles is __.',
      },
    }),
  ).toContain('objective-cue');
  for (const explanation of [
    'Uitleg.</br>',
    'Uitleg.</explanation>',
    'Uitleg."}',
  ])
    expect(
      codes({
        ...draft,
        privateEvaluation: { ...draft.privateEvaluation, explanation },
      }),
    ).toContain('formatting');
});
it('checks response mismatch, normalized unique options and key membership without changing spelling', () => {
  expect(
    codes({
      ...draft,
      learner: {
        ...draft.learner,
        prompt: 'Kies het juiste woord: Hij __ (hebben) een boek.',
      },
    }),
  ).toContain('response-mismatch');
  const rules = { ...contract, response: 'single-choice', optionCount: 2 };
  expect(codes(draft, rules)).toContain('options');
  expect(
    codes(
      {
        ...draft,
        learner: { ...draft.learner, options: ['heeft', ' heeft '] },
      },
      rules,
    ),
  ).toContain('options');
  expect(
    codes(
      { ...draft, learner: { ...draft.learner, options: ['hebben', 'hebt'] } },
      rules,
    ),
  ).toContain('answer-option');
  expect(
    codes(
      {
        ...draft,
        learner: {
          ...draft.learner,
          prompt: 'Hij __ (hebben) een boek.',
          options: ['heeft', 'hebben'],
        },
      },
      rules,
    ),
  ).toEqual([]);
});
it('detects explicit answer disclosure but permits evidence and answer words in reading passages and options', () => {
  expect(
    codes({
      ...draft,
      learner: {
        ...draft.learner,
        prompt: draft.learner.prompt + ' Het antwoord is: heeft.',
      },
    }),
  ).toContain('answer-disclosure');
  const reading = {
    ...draft,
    learner: {
      prompt: 'Wat heeft Noor?',
      passage: 'Noor heeft een boek.',
      options: [],
    },
  };
  expect(
    codes(reading, {
      ...contract,
      context: 'passage',
      requiredPromptTerms: [],
      passageWords: { min: 4, max: 4 },
    }),
  ).toEqual([]);
});
it('enforces declared passage bounds and does not accept missing required context', () => {
  const rules = {
    ...contract,
    context: 'passage',
    passageWords: { min: 2, max: 4 },
  };
  expect(codes(draft, rules)).toContain('missing-context');
  expect(
    codes(
      {
        ...draft,
        learner: { ...draft.learner, passage: 'een twee drie vier vijf' },
      },
      rules,
    ),
  ).toContain('passage-length');
});
it('independently checks a bounded calculation and unit from the pinned specification, never from the model', () => {
  const rules = {
    ...contract,
    context: 'none',
    requiredPromptTerms: [],
    calculation: { operation: 'subtract', operands: [20, 7, 5], unit: 'euro' },
  };
  const item = {
    ...draft,
    learner: {
      prompt: 'Hoeveel euro blijft er over?',
      passage: '',
      options: [],
    },
    privateEvaluation: {
      ...draft.privateEvaluation,
      acceptedAnswers: ['8 euro'],
    },
  };
  expect(codes(item, rules)).toEqual([]);
  for (const acceptedAnswers of [['9 euro'], ['8'], ['8 euro', '9 euro']])
    expect(
      codes(
        {
          ...item,
          privateEvaluation: { ...item.privateEvaluation, acceptedAnswers },
        },
        rules,
      ),
    ).toContain('calculation-key');
  expect(
    exerciseContract({
      ...rules,
      calculation: {
        ...rules.calculation,
        operands: [Number.MAX_SAFE_INTEGER, 1],
      },
    }),
  ).toBe(false);
  // Objective wording and explanation truth are still human judgments; passing is not approval.
  expect(checkExercise(item, rules)).toEqual([]);
});
it('rejects impossible or permissive contracts instead of silently skipping checks', () => {
  for (const value of [
    { ...contract, response: 'single-choice', optionCount: 0 },
    { ...contract, passageWords: { min: 5, max: 2 } },
    { ...contract, context: 'none', passageWords: { min: 2, max: 5 } },
    {
      ...contract,
      calculation: { operation: 'eval', operands: [1, 2], unit: null },
    },
  ])
    expect(exerciseContract(value)).toBe(false);
});
