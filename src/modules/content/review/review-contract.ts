import { exact, record } from '../content-records';
import type {
  ExercisePayload,
  ExerciseContract,
  ExerciseIssue,
} from '../exercise-contract';
export type ReviewItem = {
  id: string;
  contentId: string;
  contentHash: string;
  revision: number;
  title: string;
  objective: string;
  payload: ExercisePayload;
  rules: ExerciseContract;
  checks: ExerciseIssue[];
  decision: 'pending' | 'approved' | 'rejected';
  published: boolean;
  advisory: {
    status: 'clear' | 'flagged' | 'stale';
    text: string;
    sourceHash: string;
    provenance: 'synthetic-haiku-example' | 'deterministic-check';
  };
};
export type ReviewBatch = {
  supply?: boolean;
  id: string;
  title: string;
  items: ReviewItem[];
  cursor: string | null;
  activeMs: number;
};
export type ReviewRef = { id: string; contentHash: string };
export function exactSelection(
  refs: unknown,
  items: ReviewRef[],
): refs is ReviewRef[] {
  return (
    Array.isArray(refs) &&
    refs.length > 0 &&
    refs.length <= items.length &&
    new Set(refs.map((r) => (record(r) ? r.id : null))).size === refs.length &&
    refs.every(
      (r) =>
        record(r) &&
        exact(r, ['id', 'contentHash']) &&
        items.some((i) => i.id === r.id && i.contentHash === r.contentHash),
    )
  );
}
/** Self-reported active time is workload telemetry, never evidence of review quality. */
export function acceptedReviewTime(
  old: {
    sessionMs: number;
    sequence: number;
    lastPulseAt: Date;
    startedAt: Date;
  },
  next: { sessionMs: number; sequence: number },
  now: Date,
) {
  if (
    !Number.isSafeInteger(next.sequence) ||
    !Number.isSafeInteger(next.sessionMs) ||
    next.sessionMs < 0
  )
    throw new Error('INVALID_TIME');
  if (next.sequence === old.sequence && next.sessionMs === old.sessionMs)
    return 0;
  const delta = next.sessionMs - old.sessionMs;
  if (
    next.sequence !== old.sequence + 1 ||
    delta < 0 ||
    delta > 60000 ||
    now.getTime() - old.lastPulseAt.getTime() > 60000 ||
    next.sessionMs > now.getTime() - old.startedAt.getTime() + 500
  )
    throw new Error('STALE_TIME');
  return delta;
}
