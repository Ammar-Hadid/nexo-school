export type SupplyOverview = {
  week: string;
  planned: boolean;
  demand: number;
  ready: number;
  readyIds: string[];
  shortage: number;
  pending: number;
  admitted: number;
  capacity: number;
  measuredMs: number;
  estimatedMs: number;
  bank: number;
  recentGroups: number;
  certification: 'pending';
  automaticPublication: false;
  purpose: 'local-synthetic-practice';
};
