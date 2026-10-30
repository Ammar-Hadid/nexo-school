export type DeliveryOverview = {
  scope: 'local-synthetic-practice';
  students: { id: string; displayName: string }[];
  measuredReviewMs: number;
  pending: number;
  items: {
    id: string;
    contentId: string;
    contentHash: string;
    revision: number;
    coverageId: string;
    title: string;
    prompt: string;
    eligible: boolean;
    reason: string | null;
    withdrawal: {
      id: string;
      note: string;
      correction: { replacementVersionId: string; note: string } | null;
    } | null;
  }[];
};
export type DeliveryImpact = {
  items: {
    id: string;
    assignmentId: string;
    assignment: { student: { displayName: string } };
    attempts: { id: string; attemptNumber: number; correct: boolean }[];
  }[];
};
