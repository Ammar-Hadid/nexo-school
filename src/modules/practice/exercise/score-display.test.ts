import { expect, it } from 'vitest';
import { scoreOutOfTen } from './score-display';
import { previewScore } from './exercise-preview';

it('normalizes weighted points independently of task length', () => {
  expect(scoreOutOfTen(8, 8)).toBe('10');
  expect(scoreOutOfTen(2, 2)).toBe('10');
  expect(scoreOutOfTen(9.5, 10)).toBe('9,5');
  expect(scoreOutOfTen(7.5, 8)).toBe('9,4');
  expect(scoreOutOfTen(0, 8)).toBe('0');
  expect(scoreOutOfTen(previewScore(['first', 'second', 'missed']), 3)).toBe(
    '5',
  );
});
it('withholds a score when missing or without a valid denominator', () => {
  expect(scoreOutOfTen(undefined, 8)).toBeUndefined();
  expect(scoreOutOfTen(0, 0)).toBeUndefined();
  expect(scoreOutOfTen(9, 8)).toBeUndefined();
  expect(scoreOutOfTen(-1, 8)).toBeUndefined();
});
