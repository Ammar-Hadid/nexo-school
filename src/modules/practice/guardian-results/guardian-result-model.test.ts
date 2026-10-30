import { describe, expect, it } from 'vitest';
import { guardianResult } from './guardian-result-model';
import {
  initialPreview,
  recordPreviewAnswer,
  advancePreview,
} from '../exercise/exercise-preview';

const definition = {
  initialPreview: () => initialPreview('question', 'yes', 'no', 3),
  previewQuestion: (index: number) => ({
    prompt: `Question ${index}`,
    answer: 'Correct choice',
    steps: ['Explanation'],
    options: [
      { value: 'a', label: 'Correct choice' },
      { value: 'b', label: 'Wrong choice' },
    ],
  }),
};
describe('read-only guardian projection', () => {
  it('uses the actual bundle size and withholds scores, drafts and keys before completion', () => {
    const state = advancePreview(
      recordPreviewAnswer(definition.initialPreview(), 'b', false),
    );
    const snapshot = { state, answer: 'UNSUBMITTED DRAFT', error: '' };
    const before = structuredClone(snapshot);
    const result = guardianResult(definition, snapshot);
    expect(result.total).toBe(3);
    expect(result.score).toBeUndefined();
    expect(result.answered).toBe(1);
    expect(result.pendingRetries).toBe(1);
    expect(result.questions.map((question) => question.answerModel)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(result.questions[0]?.attempts[0]?.label).toBe('Wrong choice');
    expect(JSON.stringify(result)).not.toContain('UNSUBMITTED DRAFT');
    expect(snapshot).toEqual(before);
  });
  it('retains original order and both attempts, distinguishes solved count from weighted score', () => {
    let state = definition.initialPreview();
    for (const [answer, correct] of [
      ['kátten', false],
      ['a', true],
      ['b', false],
      ['a', true],
      ['b', false],
    ] as const) {
      state = advancePreview(recordPreviewAnswer(state, answer, correct));
    }
    const result = guardianResult(definition, { state, answer: '', error: '' });
    expect(result.complete).toBe(true);
    expect(result.first).toBe(1);
    expect(result.second).toBe(1);
    expect(result.solved).toBe(2);
    expect(result.score).toBe(1.5);
    expect(result.questions.map((question) => question.index)).toEqual([
      0, 1, 2,
    ]);
    expect(
      result.questions[0]?.attempts.map((attempt) => attempt.answer),
    ).toEqual(['kátten', 'a']);
    expect(result.questions[2]?.attempts).toHaveLength(2);
    expect(
      result.questions.every(
        (question) => question.answerModel?.steps[0] === 'Explanation',
      ),
    ).toBe(true);
  });
  it('leaves an absent task unstarted with no inferred errors or results', () => {
    const result = guardianResult(definition);
    expect(result.status).toBe('Nog niet gestart');
    expect(
      result.questions.every(
        (question) => question.outcome === 'open' && !question.attempts.length,
      ),
    ).toBe(true);
    expect(result.score).toBeUndefined();
  });
});
