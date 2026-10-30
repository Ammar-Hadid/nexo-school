import type { guardianResult } from './guardian-result-model';

/** Read-only DTO. No drafts, evaluator specifications, identity credentials or mutations. */
export type GuardianResultTask = {
  id: string;
  title: string;
  corrections?: {
    itemId: string;
    reason: string;
    note: string;
    withdrawnAt: string;
    replacementVersionId: string | null;
    correctionNote: string | null;
  }[];
  readingText?: { title: string; paragraphs: readonly string[] };
  result: ReturnType<typeof guardianResult>;
};
