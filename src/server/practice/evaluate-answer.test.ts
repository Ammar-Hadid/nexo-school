import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { evaluateAnswer } from './evaluate-answer';
it('grades finite Taal words without correcting spelling, and rejects invalid syntax without an attempt', () => {
  const q = {
    responseType: 'word',
    evaluatorVersion: 'taal-word-exact-v1',
    answer: 'slaapt',
    options: [],
  };
  expect(evaluateAnswer(q, ' SLAAPT ')).toEqual({
    normalized: 'slaapt',
    correct: true,
  });
  expect(evaluateAnswer(q, 'slaap')).toEqual({
    normalized: 'slaap',
    correct: false,
  });
  expect(evaluateAnswer(q, 'sláápt')?.correct).toBe(false);
  for (const s of ['', 'de kat', 'slaapt!', '1'])
    expect(evaluateAnswer(q, s)).toBeNull();
});
it('accepts only an issued choice identifier, never a submitted key or fabricated option', () => {
  const q = {
    responseType: 'single-choice',
    evaluatorVersion: 'reading-choice-exact-v1',
    answer: 'Doel B',
    options: [
      { value: 'a', label: 'Doel A' },
      { value: 'b', label: 'Doel B' },
    ],
  };
  expect(evaluateAnswer(q, 'b')).toEqual({ normalized: 'b', correct: true });
  expect(evaluateAnswer(q, 'a')?.correct).toBe(false);
  for (const s of ['', 'c', 'Doel B', 'B'])
    expect(evaluateAnswer(q, s)).toBeNull();
});
it('retains integer and spelling semantics and fails closed for unknown evaluators', () => {
  expect(
    evaluateAnswer(
      {
        responseType: 'integer',
        evaluatorVersion: 'integer-exact-v1',
        answer: '42',
        options: [],
      },
      '042',
    )?.correct,
  ).toBe(true);
  expect(
    evaluateAnswer(
      {
        responseType: 'word',
        evaluatorVersion: 'spelling-doubling-v1',
        answer: 'katten',
        options: [],
      },
      'kat ten',
    )?.correct,
  ).toBe(false);
  expect(() =>
    evaluateAnswer(
      {
        responseType: 'word',
        evaluatorVersion: 'unknown',
        answer: 'x',
        options: [],
      },
      'x',
    ),
  ).toThrow();
});
