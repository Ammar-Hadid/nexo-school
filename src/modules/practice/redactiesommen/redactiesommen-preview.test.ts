import { describe, expect, it } from 'vitest';
import {
  initialPreview,
  submitPreview,
  advancePreview,
  previewQuestion,
  previewScore,
  scenarios,
  type Scenario,
} from './redactiesommen-preview';
import {
  exerciseCompanion,
  exerciseMessages,
  exerciseSituation,
} from '../exercise/exercise-companion';
import { messageCandidates } from '../../../components/nexai/nexai-message-candidates';

// Independently checked calculations and units for these fixed story specimens.
const gold = [
  24 + 18,
  56 - 19,
  7 * 8,
  36 + 27,
  81 - 34,
  6 * 9,
  48 / 6,
  45 + 38,
  72 - 28,
  9 * 7,
];
const units = [
  'stickers',
  'knikkers',
  'potloden',
  'knikkers',
  'boeken',
  'appels',
  'koekjes',
  'kralen',
  'euro',
  'stoelen',
];
describe('synthetic Redactiesommen preview', () => {
  it('matches independent arithmetic and keeps the unit in each question and conclusion', () => {
    for (const [index, answer] of gold.entries()) {
      const question = previewQuestion(index);
      expect(question.answer).toBe(answer);
      expect(question.answerUnit).toBe(units[index]);
      expect(question.prompt).toContain(units[index]);
      expect(question.steps.at(-1)).toContain(`${answer} ${units[index]}`);
    }
    expect(previewQuestion(6).prompt).toBe(
      'Sara heeft voor een picknick een trommel met 48 koekjes meegenomen. Er zitten 6 kinderen aan de picknicktafel. Ze wil alle koekjes eerlijk over de kinderen verdelen, zodat iedereen evenveel krijgt en er niets in de trommel achterblijft. Hoeveel koekjes krijgt ieder kind?',
    );
    expect(previewQuestion(6).steps[1]).toBe('48 ÷ 6 = 8.');
  });
  it('rejects empty, unit-bearing and unsupported numeric formats without consuming a chance', () => {
    const state = initialPreview('question');
    for (const invalid of [
      '',
      ' ',
      '42 stickers',
      '4.2',
      '4,2',
      '-42',
      '1e2',
      '1234567',
    ])
      expect(submitPreview(state, invalid)).toBe(state);
    expect(submitPreview(state, ' 42 ').outcomes[0]).toBe('first');
    const miss = submitPreview(state, '1');
    expect(miss.outcomes[0]).toBe('queued');
    expect(miss.submitted).toBe('1');
  });
  it('returns the identical story and unit after deferral and preserves the expected result', () => {
    let state = initialPreview('question');
    const original = previewQuestion(3);
    for (const [index, answer] of gold.entries())
      state = advancePreview(
        submitPreview(state, index === 3 || index === 8 ? '1' : String(answer)),
      );
    expect(state.queue).toEqual([3, 8]);
    expect(previewQuestion(state.index)).toBe(original);
    const corrected = submitPreview(state, '63');
    expect(exerciseSituation(corrected)).toBe('retryCorrect');
    state = advancePreview(corrected);
    expect(previewQuestion(state.index).answerUnit).toBe('euro');
    const missed = submitPreview(state, '1');
    expect(submitPreview(missed, '44')).toBe(missed);
    expect(exerciseSituation(missed)).toBe('explanation');
    state = advancePreview(missed);
    expect(state.stage).toBe('result');
    expect(state.outcomes.filter((x) => x === 'first')).toHaveLength(8);
    expect(state.outcomes[3]).toBe('second');
    expect(state.outcomes[8]).toBe('missed');
    expect(previewScore(state.outcomes)).toBe(8.5);
    expect(submitPreview(state, '44')).toBe(state);
  });
  it('completes a perfect run and directly retries a lone final miss', () => {
    let perfect = initialPreview('question');
    let finalMiss = initialPreview('question');
    for (const [index, answer] of gold.entries()) {
      perfect = advancePreview(submitPreview(perfect, String(answer)));
      finalMiss = advancePreview(
        submitPreview(finalMiss, index === 9 ? '1' : String(answer)),
      );
    }
    expect(exerciseSituation(perfect)).toBe('perfect');
    expect(finalMiss.index).toBe(9);
    expect(finalMiss.retry).toBe(true);
    expect(finalMiss.stage).toBe('answer');
    expect(advancePreview(submitPreview(finalMiss, '63')).stage).toBe('result');
  });
  it('uses approved arithmetic-context messages without changing on entry or inferring misconduct', () => {
    for (const scenario of Object.keys(scenarios) as Scenario[]) {
      const state = initialPreview(scenario);
      for (const message of exerciseMessages(exerciseSituation(state))) {
        expect(messageCandidates).toContain(message);
        expect(message.pose).not.toMatch(/angry|sad/);
        expect(message.text).not.toContain('hieronder');
      }
      expect(exerciseCompanion({ ...state, submitted: '123' })).toBe(
        exerciseCompanion(state),
      );
    }
  });
});
