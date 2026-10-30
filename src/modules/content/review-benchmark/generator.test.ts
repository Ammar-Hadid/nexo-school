import { expect, it } from 'vitest';
import {
  generatorManifest,
  generatorRequest,
  readGeneratorRequest,
  parseGeneratedExercise,
  checkGeneratedExercise,
  generatorReviewRequest,
} from './generator';
import { validateGenerationRequest } from '../generation-policy';

it('freezes 32 generation requests across four models and four content types', () => {
  expect(generatorManifest).toHaveLength(32);
  for (const r of generatorManifest) {
    expect(() =>
      validateGenerationRequest({
        requestId: r.requestId,
        feature: 'generation',
        specification: r.specification,
      }),
    ).not.toThrow();
    expect(readGeneratorRequest(r.specification).phase).toBe('generate');
  }
  expect(() => generatorRequest('r01', 'gpt-6.1-sol')).toThrow();
});
it('preserves wrong keys as candidate data and independently checks the fixed arithmetic', () => {
  const value = {
    prompt:
      'Er zijn 4 zakjes met elk 6 knikkers. Hoeveel knikkers zijn dat samen?',
    passage: '',
    options: [],
    rubric: 'Schrijf het aantal knikkers als een getal.',
    answer: '25',
    explanation: '4 × 6 = 25.',
  };
  const candidate = parseGeneratedExercise('w01', value)!;
  expect(candidate.answer).toBe('25');
  expect(checkGeneratedExercise('w01', candidate).findings).toContain(
    'answer-does-not-match-independent-reference',
  );
  expect(
    parseGeneratedExercise('w01', { ...value, approved: true }),
  ).toBeNull();
  expect(
    parseGeneratedExercise('w01', { ...value, prompt: 'x'.repeat(9000) }),
  ).toBeNull();
  const spec = generatorReviewRequest(
    generatorManifest.find((m) => m.briefId === 'w01')!.requestId,
    candidate,
  );
  expect(readGeneratorRequest(spec).model).toBe('claude-haiku-5-5');
  expect(() => readGeneratorRequest(spec.replace('25', '26'))).toThrow();
});

it('checks reading length and option/key consistency without asserting educational approval', () => {
  const c = parseGeneratedExercise('r01', {
    prompt: 'Op welke dag gaat Noor?',
    passage: 'Noor gaat woensdag.',
    options: [],
    rubric: 'Schrijf de dag.',
    answer: 'woensdag',
    explanation: 'Noor gaat woensdag.',
  })!;
  expect(checkGeneratedExercise('r01', c).findings).toContain(
    'passage-word-count-outside-brief',
  );
  expect(checkGeneratedExercise('r01', c).humanApproved).toBe(false);
  const t = parseGeneratedExercise('t01', {
    prompt: 'Wat betekent dapper?',
    passage: '',
    options: ['bang', 'bang'],
    rubric: 'Kies één antwoord.',
    answer: 'moedig',
    explanation: 'Dapper is moedig.',
  })!;
  expect(checkGeneratedExercise('t01', t).findings).toEqual(
    expect.arrayContaining([
      'option-count-mismatch',
      'duplicate-options',
      'key-not-an-exact-option',
    ]),
  );
});
