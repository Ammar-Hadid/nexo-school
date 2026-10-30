import { describe, expect, it } from 'vitest';
import {
  initialPreview,
  submitPreview,
  advancePreview,
  previewQuestion,
  previewScore,
  readingText,
} from './begrijpend-lezen-preview';

// Independently read against the original story: purpose, sunlight, blooming,
// shelter, reference word, reuse, watering, flowers, ending and whole-text summary.
const gold = ['b', 'd', 'a', 'c', 'a', 'd', 'b', 'c', 'a', 'd'];
describe('synthetic reading bundle', () => {
  it('keeps every evidence quote grounded in its declared paragraph and offers four distinct choices', () => {
    for (let index = 0; index < 10; index++) {
      const question = previewQuestion(index);
      expect(readingText.paragraphs[question.paragraph]).toContain(
        question.evidence,
      );
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map((o) => o.label)).size).toBe(4);
      expect(question.correctChoice).toBe(gold[index]);
    }
  });
  it('rejects missing/unknown selections without consuming an attempt and locks committed answers', () => {
    const state = initialPreview('question');
    for (const invalid of ['', 'e', 'B', ' b', 'Noor'])
      expect(submitPreview(state, invalid)).toBe(state);
    const submitted = submitPreview(state, 'b');
    expect(submitted.outcomes[0]).toBe('first');
    expect(submitPreview(submitted, 'a')).toBe(submitted);
  });
  it('defers exact questions until all original answers are committed, then completes with 8 + 1 + 1', () => {
    let state = initialPreview('question');
    for (const [index, answer] of gold.entries())
      state = advancePreview(
        submitPreview(state, index === 3 || index === 8 ? 'b' : answer),
      );
    expect(state.queue).toEqual([3, 8]);
    expect(state.retry).toBe(true);
    expect(state.index).toBe(3);
    expect(previewQuestion(state.index).prompt).toBe(
      'Waarvoor dient het hoopje takken?',
    );
    state = advancePreview(submitPreview(state, 'c'));
    expect(state.index).toBe(8);
    state = advancePreview(submitPreview(state, 'b'));
    expect(state.stage).toBe('result');
    expect(
      state.outcomes.filter((outcome) => outcome === 'first'),
    ).toHaveLength(8);
    expect(state.outcomes[3]).toBe('second');
    expect(state.outcomes[8]).toBe('missed');
    expect(previewScore(state.outcomes)).toBe(8.5);
  });
  it('accepts all ten independent gold answers without retries', () => {
    let state = initialPreview('question');
    for (const answer of gold)
      state = advancePreview(submitPreview(state, answer));
    expect(state.stage).toBe('result');
    expect(state.queue).toEqual([]);
    expect(previewScore(state.outcomes)).toBe(10);
  });
});
