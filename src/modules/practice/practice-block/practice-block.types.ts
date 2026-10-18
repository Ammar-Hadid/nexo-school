/** Synthetic view models only. These do not determine eligibility or grant passes. */
export type BlockState = 'planned' | 'active' | 'review' | 'completed';
export type SessionView = {
  id: string;
  title: string;
  questions: number;
  status: 'planned' | 'active' | 'review' | 'done';
};
export type PracticeBlockView = {
  state: BlockState;
  number: number;
  title: string;
  subjects: string;
  sessions: SessionView[];
  passMinutes: number;
  availability: string;
  studentAvailability: string;
  carryoverNote?: string;
};
export const blockLabels: Record<BlockState, string> = {
  planned: 'Nog niet gestart',
  active: 'Bezig',
  review: 'Wacht op beoordeling',
  completed: 'Afgerond',
};
