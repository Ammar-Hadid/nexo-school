import { describe, expect, it } from 'vitest';
import {
  initialPreview,
  submitPreview,
  advancePreview,
  previewScore,
  previewQuestion,
  scenarios,
  type Scenario,
} from './taal-preview';
import { taalCompanion, taalMessages } from './taal-companion';
import { exerciseSituation } from '../exercise/exercise-companion';
import { messageCandidates } from '../../../components/nexai/nexai-message-candidates';

const gold = [
  'slaapt',
  'leest',
  'rent',
  'fietst',
  'zingt',
  'tekent',
  'lacht',
  'danst',
  'zwemt',
  'bouwt',
];
describe('synthetic Taal preview', () => {
  it('accepts case/outer spaces only, and never consumes a chance for empty or malformed entry', () => {
    const state = initialPreview('question');
    for (const invalid of [
      '',
      '  ',
      'de kat',
      '123',
      'slaapt!',
      'a'.repeat(41),
    ])
      expect(submitPreview(state, invalid)).toBe(state);
    expect(submitPreview(state, ' SLAAPT ').outcomes[0]).toBe('first');
    for (const wrong of ['slaap', 'sláápt', 'bank'])
      expect(submitPreview(state, wrong).outcomes[0]).toBe('queued');
  });
  it('retains identical deferred questions, ends after two chances and preserves the factual result', () => {
    let state = initialPreview('question');
    for (const [i, answer] of gold.entries())
      state = advancePreview(
        submitPreview(state, i === 3 || i === 8 ? 'ander' : answer),
      );
    expect(state.queue).toEqual([3, 8]);
    expect(state.index).toBe(3);
    expect(previewQuestion(state.index).prompt).toBe(
      'Mila fietst naar school.',
    );
    state = advancePreview(submitPreview(state, 'fietst'));
    expect(state.index).toBe(8);
    const feedback = submitPreview(state, 'vijver');
    expect(submitPreview(feedback, 'zwemt')).toBe(feedback);
    state = advancePreview(feedback);
    expect(state.stage).toBe('result');
    expect(state.outcomes.filter((x) => x === 'first')).toHaveLength(8);
    expect(state.outcomes[3]).toBe('second');
    expect(state.outcomes[8]).toBe('missed');
    expect(previewScore(state.outcomes)).toBe(8.5);
    expect(submitPreview(state, 'zwemt')).toBe(state);
  });
  it('finishes an all-correct run and directly retries a lone final miss', () => {
    let perfect = initialPreview('question');
    let lastMiss = initialPreview('question');
    for (const [i, answer] of gold.entries()) {
      perfect = advancePreview(submitPreview(perfect, answer));
      lastMiss = advancePreview(
        submitPreview(lastMiss, i === 9 ? 'toren' : answer),
      );
    }
    expect(perfect.stage).toBe('result');
    expect(perfect.queue).toEqual([]);
    expect(exerciseSituation(perfect)).toBe('perfect');
    expect(lastMiss.stage).toBe('answer');
    expect(lastMiss.index).toBe(9);
    expect(lastMiss.retry).toBe(true);
    expect(advancePreview(submitPreview(lastMiss, 'bouwt')).stage).toBe(
      'result',
    );
  });
  it('uses exact approved neutral copy and poses for every scenario and keeps it stable while typing', () => {
    for (const scenario of Object.keys(scenarios) as Scenario[]) {
      const state = initialPreview(scenario);
      const messages = taalMessages(exerciseSituation(state));
      expect(messages.length).toBeGreaterThan(0);
      for (const message of messages) {
        expect(messageCandidates).toContain(message);
        expect(message.text).not.toMatch(
          /som|getal|reken|uitkomst|uitkomen|hieronder/i,
        );
        expect(message.pose).not.toMatch(/angry|sad/);
      }
      expect(taalCompanion({ ...state, submitted: 'anders' })).toBe(
        taalCompanion(state),
      );
      expect(taalCompanion(state, messages.length)).toBe(messages[0]);
    }
    expect(taalCompanion(initialPreview('question')).pose).toBe('calm-1');
    expect(taalCompanion(initialPreview('retryCorrect')).pose).toBe('proud-1');
    expect(taalCompanion(initialPreview('retryIncorrect')).pose).toBe(
      'curious-2',
    );
  });
});
