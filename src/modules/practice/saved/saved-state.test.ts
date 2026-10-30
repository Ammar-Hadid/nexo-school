import { expect, it } from 'vitest';
import { savedSnapshot, type SavedProgress } from './saved-state';
import type { PublicAssignment } from '../assignment/public-contract';
const assignment: PublicAssignment = {
  id: 'a',
  studentId: 's',
  revision: 1,
  subject: 'Rekenen',
  category: 'Optellen',
  items: [
    { id: 'one', position: 0, prompt: '0 + 0 =', responseType: 'integer' },
    { id: 'two', position: 1, prompt: '1 + 3 =', responseType: 'integer' },
  ],
};
const saved: SavedProgress = {
  progress: {
    revision: 1,
    next: { itemId: 'two', attemptNumber: 1 },
    outcomes: ['first', 'open'],
    result: null,
  },
  lastSubmission: null,
  presentation: {
    version: 2,
    progressRevision: 1,
    acknowledgedRevision: 1,
    answer: '004',
    requestId: 'r',
  },
};
it('resumes the exact saved draft and rejects drafts from older progress', () => {
  expect(savedSnapshot(assignment, saved)).toMatchObject({
    answer: '004',
    state: { stage: 'answer', index: 1 },
  });
  expect(
    savedSnapshot(assignment, {
      ...saved,
      presentation: { ...saved.presentation, progressRevision: 0 },
    }).answer,
  ).toBe('');
});
it('restores unacknowledged feedback even when submission has advanced the server', () => {
  const receipt = {
    attemptId: 'r',
    itemId: 'one',
    attemptNumber: 1,
    submitted: '000',
    correct: true,
    progress: saved.progress,
  };
  expect(
    savedSnapshot(assignment, {
      ...saved,
      lastSubmission: receipt,
      presentation: { ...saved.presentation, acknowledgedRevision: 0 },
    }),
  ).toMatchObject({
    answer: '000',
    state: { index: 0, stage: 'feedback', submitted: '000' },
  });
});
it('keeps final feedback until Continue and restores the completed result afterward', () => {
  const progress: SavedProgress['progress'] = {
    revision: 3,
    next: null,
    outcomes: ['first', 'missed'],
    result: {
      total: 2,
      firstCorrect: 1,
      secondCorrect: 0,
      missed: 1,
      solved: 1,
      weightedScore: 1,
    },
  };
  const final: SavedProgress = {
    ...saved,
    progress,
    lastSubmission: {
      attemptId: 'last',
      itemId: 'two',
      attemptNumber: 2,
      submitted: '999',
      correct: false,
      solution: { answer: '4', steps: ['1 + 3 = 4'] },
      progress,
    },
  };
  expect(savedSnapshot(assignment, final)).toMatchObject({
    answer: '999',
    state: { stage: 'feedback', retry: true },
  });
  expect(
    savedSnapshot(assignment, {
      ...final,
      presentation: {
        ...final.presentation,
        acknowledgedRevision: 3,
        progressRevision: 3,
        answer: '',
      },
    }).state.stage,
  ).toBe('result');
});
