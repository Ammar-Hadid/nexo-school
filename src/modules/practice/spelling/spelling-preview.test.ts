import { describe, expect, it } from 'vitest';
import {
  initialPreview,
  submitPreview,
  advancePreview,
  previewScore,
  previewQuestion,
  scenarios,
  type Scenario,
} from './spelling-preview';
import { wordCompanion, wordMessages } from '../exercise/word-companion';
import { exerciseSituation } from '../exercise/exercise-companion';
import { messageCandidates } from '../../../components/nexai/nexai-message-candidates';

const gold = [
  'katten',
  'honden',
  'bomen',
  'kippen',
  'ramen',
  'boeken',
  'pennen',
  'boten',
  'vissen',
  'tenten',
];
describe('synthetic Spelling preview', () => {
  it('preserves spelling errors and counts them as attempts, ignoring only case and outer spaces', () => {
    const state = initialPreview('question');
    for (const invalid of ['', '  ', 'a'.repeat(41)])
      expect(submitPreview(state, invalid)).toBe(state);
    expect(submitPreview(state, ' KATTEN ').outcomes[0]).toBe('first');
    for (const wrong of [
      'katen',
      'kátten',
      'kat ten',
      'katten!',
      'kat',
      '123',
    ]) {
      const feedback = submitPreview(state, wrong);
      expect(feedback.outcomes[0]).toBe('queued');
      expect(feedback.submitted).toBe(wrong);
      expect(feedback.queue).toEqual([0]);
    }
  });
  it('matches independent plural gold cases and rejects representative doubling/single-vowel mistakes', () => {
    let state = initialPreview('question');
    const errors = [
      'katen',
      'hond',
      'boomen',
      'kipen',
      'raamen',
      'boecken',
      'penen',
      'booten',
      'visen',
      'tentten',
    ];
    for (const [index, answer] of gold.entries()) {
      expect(previewQuestion(index).answer).toBe(answer);
      expect(submitPreview(state, errors[index]!).outcomes[index]).toBe(
        'queued',
      );
      state = advancePreview(submitPreview(state, answer));
    }
    expect(state.stage).toBe('result');
    expect(state.outcomes).toEqual(Array(10).fill('first'));
    expect(exerciseSituation(state)).toBe('perfect');
  });
  it('defers identical words, shows no third attempt, and keeps the 8 + 1 + 1 result', () => {
    let state = initialPreview('question');
    for (const [index, answer] of gold.entries())
      state = advancePreview(
        submitPreview(
          state,
          index === 3 ? 'kipen' : index === 8 ? 'visen' : answer,
        ),
      );
    expect(state.queue).toEqual([3, 8]);
    expect(previewQuestion(state.index).prompt).toBe('één kip → twee …');
    const retryCorrect = submitPreview(state, 'kippen');
    expect(exerciseSituation(retryCorrect)).toBe('retryCorrect');
    state = advancePreview(retryCorrect);
    expect(previewQuestion(state.index).prompt).toBe('één vis → twee …');
    const missed = submitPreview(state, 'visen');
    expect(missed.submitted).toBe('visen');
    expect(submitPreview(missed, 'vissen')).toBe(missed);
    expect(exerciseSituation(missed)).toBe('explanation');
    state = advancePreview(missed);
    expect(state.stage).toBe('result');
    expect(state.outcomes.filter((x) => x === 'first')).toHaveLength(8);
    expect(state.outcomes[3]).toBe('second');
    expect(state.outcomes[8]).toBe('missed');
    expect(previewScore(state.outcomes)).toBe(8.5);
    expect(submitPreview(state, 'vissen')).toBe(state);
  });
  it('retries a lone final miss directly and completes with the correct factual pose', () => {
    let state = initialPreview('question');
    for (const [index, answer] of gold.entries())
      state = advancePreview(
        submitPreview(state, index === 9 ? 'tentten' : answer),
      );
    expect(state.stage).toBe('answer');
    expect(state.index).toBe(9);
    expect(state.retry).toBe(true);
    state = advancePreview(submitPreview(state, 'tenten'));
    expect(state.stage).toBe('result');
    expect(exerciseSituation(state)).toBe('complete');
  });
  it('reuses exact approved word-context messages and keeps selection stable while typing', () => {
    for (const scenario of Object.keys(scenarios) as Scenario[]) {
      const state = initialPreview(scenario);
      const messages = wordMessages(exerciseSituation(state));
      expect(messages.length).toBeGreaterThan(0);
      for (const message of messages) {
        expect(messageCandidates).toContain(message);
        expect(message.text).not.toMatch(
          /som|getal|reken|uitkomst|uitkomen|hieronder/i,
        );
        expect(message.pose).not.toMatch(/angry|sad/);
      }
      expect(wordCompanion({ ...state, submitted: 'anders' })).toBe(
        wordCompanion(state),
      );
      expect(wordCompanion(state, messages.length)).toBe(messages[0]);
    }
  });
});
