import { describe, expect, it } from 'vitest';
import {
  advancePreview,
  initialPreview,
  recordPreviewAnswer,
  previewScore,
} from './exercise-preview';

describe('connected preview evidence', () => {
  it('retains every original submission and deferred retry, ignoring duplicate submissions', () => {
    let state = initialPreview('question', 'right', 'wrong', 3);
    state = recordPreviewAnswer(state, 'first miss', false);
    expect(recordPreviewAnswer(state, 'duplicate', true)).toBe(state);
    state = advancePreview(state);
    state = advancePreview(recordPreviewAnswer(state, 'correct', true));
    state = advancePreview(recordPreviewAnswer(state, 'last miss', false));
    expect(state.queue).toEqual([0, 2]);
    expect(state.index).toBe(0);
    const firstRound = state.attempts;
    state = advancePreview(recordPreviewAnswer(state, 'fixed', true));
    expect(state.index).toBe(2);
    state = advancePreview(recordPreviewAnswer(state, 'still wrong', false));
    expect(state.stage).toBe('result');
    expect(state.outcomes).toEqual(['second', 'first', 'missed']);
    expect(state.attempts.map(({ answer }) => answer)).toEqual([
      'first miss',
      'correct',
      'last miss',
      'fixed',
      'still wrong',
    ]);
    expect(state.attempts.map(({ index, retry }) => [index, retry])).toEqual([
      [0, false],
      [1, false],
      [2, false],
      [0, true],
      [2, true],
    ]);
    expect(firstRound).toHaveLength(3);
    expect(
      state.outcomes.filter((x) => x === 'first' || x === 'second'),
    ).toHaveLength(2);
    expect(previewScore(state.outcomes)).toBe(1.5);
    expect(recordPreviewAnswer(state, 'third attempt', true)).toBe(state);
  });
  it('a reading-sized bundle can have one question and immediately retry its sole miss', () => {
    let state = initialPreview('question', 'yes', 'no', 1);
    state = advancePreview(recordPreviewAnswer(state, 'no', false));
    expect(state).toMatchObject({
      index: 0,
      retry: true,
      stage: 'answer',
      queue: [0],
    });
    state = advancePreview(recordPreviewAnswer(state, 'yes', true));
    expect(state.stage).toBe('result');
    expect(state.outcomes).toEqual(['second']);
  });
});
