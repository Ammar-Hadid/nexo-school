import { expect, it } from 'vitest';
import { parseIntegerAnswer, replaySubmissions } from './submission-state';
it('accepts only the approved whole-number input grammar', () => {
  expect(parseIntegerAnswer(' 000042 ')).toBe('42');
  expect(parseIntegerAnswer('0')).toBe('0');
  for (const value of [
    '',
    ' ',
    '-1',
    '+1',
    '1.0',
    '1e2',
    '1,2',
    '1234567',
    '１２',
    '0x10',
  ])
    expect(parseIntegerAnswer(value)).toBeNull();
});
it('defers identical retries, preserves miss order and separates solved from weighted score', () => {
  const history = Array.from({ length: 10 }, (_, index) => ({
    index,
    retry: false,
    answer: index === 3 || index === 8 ? 'wrong' : 'right',
    correct: index !== 3 && index !== 8,
  }));
  const first = replaySubmissions(10, history);
  expect(first.state.index).toBe(3);
  expect(first.state.retry).toBe(true);
  expect(first.result).toBeNull();
  history.push({ index: 3, retry: true, answer: 'right', correct: true });
  expect(replaySubmissions(10, history).state.index).toBe(8);
  history.push({ index: 8, retry: true, answer: 'wrong', correct: false });
  expect(replaySubmissions(10, history).result).toEqual({
    total: 10,
    firstCorrect: 8,
    secondCorrect: 1,
    missed: 1,
    solved: 9,
    weightedScore: 8.5,
  });
  expect(() => replaySubmissions(10, [...history, history[0]!])).toThrow();
});
it('rejects out-of-order history and handles sole-final-miss and zero/perfect scores', () => {
  expect(() =>
    replaySubmissions(2, [
      { index: 1, retry: false, answer: 'x', correct: true },
    ]),
  ).toThrow();
  for (const correct of [false, true]) {
    const history = [{ index: 0, retry: false, answer: '0', correct }];
    if (!correct) history.push({ index: 0, retry: true, answer: '0', correct });
    expect(replaySubmissions(1, history).result?.weightedScore).toBe(
      correct ? 1 : 0,
    );
  }
});
