import type {
  SubmissionProgress,
  SubmissionReceipt,
} from '../assignment/submission-state';
import type { PublicAssignment } from '../assignment/public-contract';
import type { ExerciseSnapshot } from '../exercise/exercise-definition';
export type SavedProgress = {
  withdrawn?: boolean;
  progress: SubmissionProgress;
  lastSubmission: SubmissionReceipt | null;
  presentation: {
    version: number;
    progressRevision: number;
    acknowledgedRevision: number;
    answer: string;
    requestId: string | null;
  };
};
export function savedSnapshot(
  assignment: PublicAssignment,
  saved: SavedProgress,
): ExerciseSnapshot {
  const { progress, lastSubmission: receipt, presentation } = saved;
  const feedback =
    receipt !== null && presentation.acknowledgedRevision < progress.revision;
  const itemId = feedback ? receipt.itemId : progress.next?.itemId;
  const index = itemId
    ? assignment.items.findIndex((item) => item.id === itemId)
    : 0;
  if (index < 0) throw new Error('Unknown saved item');
  const retry =
    (feedback ? receipt.attemptNumber : progress.next?.attemptNumber) === 2;
  // Retry position is the count of already resolved retries before this item.
  const retryIndex = progress.outcomes
    .slice(0, index)
    .filter((o) => o === 'second' || o === 'missed').length;
  const answer = feedback
    ? receipt.submitted
    : presentation.progressRevision === progress.revision
      ? presentation.answer
      : '';
  return {
    answer,
    error: '',
    state: {
      index,
      retry,
      stage: feedback ? 'feedback' : progress.result ? 'result' : 'answer',
      outcomes: progress.outcomes,
      queue: [],
      retryIndex,
      submitted: feedback ? receipt.submitted : '',
      attempts: [],
    },
  };
}
