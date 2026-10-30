import { expect, it } from 'vitest';
import {
  doublingBank,
  doublingQuestion,
  doublingCorrect,
  doublingExposure,
} from './doubling-family';
import {
  checkExercise,
  learnerExercise,
} from '../../content/exercise-contract';
import {
  spellingPayload,
  spellingRules,
  spellingPayloadValid,
} from '../../content/spelling/doubling-content';
it('uses ten explicitly sourced words covering five short vowels, with independently pinned keys', () => {
  expect(doublingBank.map((w) => w.plural)).toEqual([
    'katten',
    'kippen',
    'petten',
    'poppen',
    'netten',
    'biggen',
    'koppen',
    'muggen',
    'remmen',
    'ballen',
  ]);
  expect(new Set(doublingBank.map((w) => w.vowel))).toEqual(
    new Set(['a', 'e', 'i', 'o', 'u']),
  );
  for (const [i, w] of doublingBank.entries()) {
    const q = doublingQuestion(i);
    expect(q.prompt).toBe(`één ${w.singular} → twee …`);
    expect(q.answer).toBe(w.plural);
    expect(w.source).toMatch(/^https:\/\//);
    expect(doublingCorrect(i, ` ${w.plural.toUpperCase()} `)).toBe(true);
    for (const wrong of [
      w.singular + 'en',
      w.plural + '.',
      w.plural.replace(/(.)/, '$1 '),
      w.plural.replace(/[aeiou]/, 'é'),
    ])
      expect(doublingCorrect(i, wrong)).toBe(false);
    const payload = spellingPayload(i);
    expect(checkExercise(payload, spellingRules)).toEqual([]);
    expect(
      JSON.stringify(learnerExercise(payload, spellingRules)),
    ).not.toContain(w.plural);
    expect(spellingPayloadValid(payload)).toBe(true);
  }
});
it('refuses unknown words and indexes; wording or answer changes cannot become verified bank content', () => {
  for (const n of [-1, 10, 1.5, NaN])
    expect(() => doublingQuestion(n)).toThrow();
  for (const field of ['prompt', 'answer', 'explanation']) {
    const p = spellingPayload(0);
    if (field === 'prompt') p.learner.prompt = 'één pad → twee …';
    if (field === 'answer') p.privateEvaluation.acceptedAnswers = ['katen'];
    if (field === 'explanation')
      p.privateEvaluation.explanation = 'Schrijf maar één t.';
    expect(spellingPayloadValid(p)).toBe(false);
  }
  expect(
    spellingPayloadValid({ ...spellingPayload(0), authority: 'approved' }),
  ).toBe(false);
  expect(new Set(doublingBank.map((_, i) => doublingExposure(i))).size).toBe(
    10,
  );
});
