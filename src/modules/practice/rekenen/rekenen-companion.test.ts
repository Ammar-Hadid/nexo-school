import { expect, it } from 'vitest';
import {
  rekenenSituation,
  rekenenCompanion,
  rekenenMessages,
} from './rekenen-companion';
import { messageCandidates } from '../../../components/nexai/nexai-message-candidates';
import { initialPreview, type Scenario } from './rekenen-preview';
import {
  nexaiSituations,
  type NexaiSituation,
} from '../../../components/nexai/nexai-situations';

it('keeps retries unannounced and mistakes supportive without inferring effort', () => {
  expect(rekenenSituation(initialPreview('question'))).toBe('ready');
  expect(rekenenSituation(initialPreview('retry'))).toBe('ready');
  expect(rekenenSituation(initialPreview('incorrect'))).toBe('firstIncorrect');
  expect(rekenenSituation(initialPreview('retryIncorrect'))).toBe(
    'explanation',
  );
  expect(rekenenSituation(initialPreview('support'))).toBe('support');
  const scenarios: Scenario[] = [
    'question',
    'correct',
    'incorrect',
    'retry',
    'retryCorrect',
    'retryIncorrect',
    'result',
    'perfect',
    'support',
  ];
  for (const scenario of scenarios) {
    const response =
      nexaiSituations[rekenenSituation(initialPreview(scenario))];
    expect(response.pose).not.toMatch(/angry|sad/);
  }
});
it('distinguishes correct retries, ordinary completion and perfect first-attempt completion', () => {
  expect(rekenenSituation(initialPreview('correct'))).toBe('firstCorrect');
  expect(rekenenSituation(initialPreview('retryCorrect'))).toBe('retryCorrect');
  expect(rekenenSituation(initialPreview('result'))).toBe('complete');
  expect(rekenenSituation(initialPreview('perfect'))).toBe('perfect');
  const allRetries = initialPreview('perfect');
  allRetries.outcomes = allRetries.outcomes.map(() => 'second');
  expect(rekenenSituation(allRetries)).toBe('complete');
});

it('rotates through all ready messages across original questions and retries without local mutation', () => {
  const original = initialPreview('question');
  const ids = new Set<string>();
  for (let turn = 0; turn < 20; turn++) {
    const state = {
      ...original,
      index: turn % 10,
      retry: turn >= 10,
      retryIndex: turn % 10,
    };
    const message = rekenenCompanion(state);
    ids.add(message.id);
    expect(message.id).toBe(`ready-${String(turn + 1).padStart(2, '0')}`);
    expect(rekenenCompanion({ ...state, submitted: '123' })).toBe(message);
    expect(rekenenCompanion(state)).toBe(message);
  }
  expect(ids.size).toBe(20);
  expect(rekenenCompanion(original, 19).id).toBe('ready-20');
  expect(rekenenCompanion(original, 20).id).toBe('ready-01');
  expect(rekenenCompanion(original, Number.NaN).id).toBe('ready-01');
});

it('uses exact approved messages and only spatially valid explanations in this layout', () => {
  for (const situation of Object.keys(nexaiSituations) as NexaiSituation[]) {
    const messages = rekenenMessages(situation);
    expect(messages).toHaveLength(situation === 'explanation' ? 17 : 20);
    for (const message of messages) {
      expect(messageCandidates).toContain(message);
      expect(message.category).toBe(situation);
      expect(message.pose).toBe(nexaiSituations[situation].pose);
    }
  }
  const explanation = initialPreview('retryIncorrect');
  for (let variant = 0; variant < 40; variant++) {
    expect(rekenenCompanion(explanation, variant).text).not.toMatch(
      /hieronder/,
    );
  }
  expect(rekenenCompanion(initialPreview('perfect')).id).toBe('perfect-01');
  expect(rekenenCompanion(initialPreview('support')).id).toBe('support-01');
  expect(rekenenCompanion(initialPreview('result')).id).toBe('complete-01');
});
