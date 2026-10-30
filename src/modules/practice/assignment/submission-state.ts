import {
  advancePreview,
  recordPreviewAnswer,
  previewScore,
  type PreviewState,
} from '../exercise/exercise-preview';

/** integer-exact-v1: the approved Rekenen grammar; no coercion of empty/exponent input. */
export function parseIntegerAnswer(answer: string): string | null {
  const trimmed = answer.trim();
  return /^\d{1,6}$/.test(trimmed) ? String(Number(trimmed)) : null;
}
export type CommittedAnswer = PreviewState['attempts'][number];
/** Reuse the approved lifecycle with committed server facts, never preview specimen data. */
export function replaySubmissions(
  questionCount: number,
  attempts: CommittedAnswer[],
) {
  if (
    !Number.isInteger(questionCount) ||
    questionCount < 1 ||
    questionCount > 10
  )
    throw new Error('Invalid assignment size');
  let state: PreviewState = {
    index: 0,
    retry: false,
    stage: 'answer',
    outcomes: Array.from({ length: questionCount }, () => 'open'),
    queue: [],
    retryIndex: 0,
    submitted: '',
    attempts: [],
  };
  for (const attempt of attempts) {
    if (
      state.stage !== 'answer' ||
      state.index !== attempt.index ||
      state.retry !== attempt.retry
    )
      throw new Error('Invalid committed attempt sequence');
    state = advancePreview(
      recordPreviewAnswer(state, attempt.answer, attempt.correct),
    );
  }
  const count = (outcome: string) =>
    state.outcomes.filter((o) => o === outcome).length;
  return {
    state,
    result:
      state.stage === 'result'
        ? {
            total: questionCount,
            firstCorrect: count('first'),
            secondCorrect: count('second'),
            missed: count('missed'),
            solved: count('first') + count('second'),
            weightedScore: previewScore(state.outcomes),
          }
        : null,
  };
}
export type SubmissionProgress = {
  revision: number;
  next: { itemId: string; attemptNumber: number } | null;
  outcomes: PreviewState['outcomes'];
  result: ReturnType<typeof replaySubmissions>['result'];
};
export type SubmissionReceipt = {
  attemptId: string;
  itemId: string;
  attemptNumber: number;
  submitted: string;
  correct: boolean;
  solution?: { answer: string; steps: string[] };
  progress: SubmissionProgress;
};
