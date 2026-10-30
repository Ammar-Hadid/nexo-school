import { describe, expect, it } from 'vitest';
import {
  advancePreview,
  initialPreview,
  previewQuestion,
  previewScore,
  submitPreview,
} from './rekenen-preview';

describe('synthetic Rekenen review flow', () => {
  it('keeps weighted scoring separate from the child-facing correct count', () => {
    const state = initialPreview('result');
    expect(previewScore(state.outcomes)).toBe(8.5);
    expect(
      state.outcomes.filter((x) => x === 'first' || x === 'second'),
    ).toHaveLength(9);
  });
  it('continues directly to the identical final question without an interstitial', () => {
    let state = initialPreview('question');
    for (let i = 0; i < 10; i++) {
      state = advancePreview(
        submitPreview(state, i === 9 ? '1' : String(previewQuestion(i).answer)),
      );
    }
    expect(state.stage).toBe('answer');
    expect(state.queue).toEqual([9]);
    expect(state.index).toBe(9);
    expect(state.retry).toBe(true);
    state = advancePreview(submitPreview(state, '63'));
    expect(state.stage).toBe('result');
    expect(state.outcomes).toEqual([...Array(9).fill('first'), 'second']);
    expect(previewScore(state.outcomes)).toBe(9.5);
  });
  it('finishes without a retry round when every first answer is correct', () => {
    let state = initialPreview('question');
    for (let i = 0; i < 10; i++)
      state = advancePreview(
        submitPreview(state, String(previewQuestion(i).answer)),
      );
    expect(state.stage).toBe('result');
    expect(state.queue).toEqual([]);
  });
  it('ignores duplicate submissions during feedback and after completion', () => {
    const feedback = submitPreview(initialPreview('question'), '1');
    expect(submitPreview(feedback, '42')).toBe(feedback);
    expect(feedback.queue).toEqual([0]);
    const result = initialPreview('result');
    expect(submitPreview(result, '1')).toBe(result);
    expect(advancePreview(result)).toBe(result);
  });
});
