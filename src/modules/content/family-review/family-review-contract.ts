import { exact, record } from '../content-records';
/** Shared review envelope: subject adapters own generation and educational rules. */
export type FamilyItem = {
  index: number;
  familyId: string;
  contractHash: string;
  instanceId: string;
  exposureKey: string;
  prompt: string;
  answer: string;
  explanation: string;
  contentHash: string;
  steps?: string[];
};
export type FamilyPackage = {
  version: string;
  title: string;
  purpose: string;
  reviewEstimateMinutes: number;
  automaticPublication: boolean;
  contract: Record<string, string | boolean>;
  contractHash: string;
  inventoryHash: string;
  sources: Record<string, string>;
  technical: {
    checkedInstances: number;
    mismatches: number;
    exposureGroups: number;
    independentFamilies: number;
    aiCalls: number;
  };
  scope?: {
    bounds: string;
    prerequisites: string;
    objective: string;
    pattern: string;
    changes: string;
  };
  examples: (FamilyItem & { reason: string })[];
  criteria: { id: string; title: string; question: string; detail: string }[];
  inventory: FamilyItem[];
};
export const familyExampleIds = [0, 9, 90, 45, 55, 79, 99];
export const familyCriteria = [
  'scope',
  'wording',
  'explanation',
  'response',
] as const;
export type FamilyJudgment = '' | 'accept' | 'change' | 'unsure';
export type FamilyDraft = {
  examples: number[];
  judgments: Record<string, FamilyJudgment>;
  role: 'guardian' | 'educator';
  basis: '' | 'independent-human' | 'ai-assisted';
  qualification: string;
  notes: string;
};
export const emptyFamilyDraft = (pkg?: FamilyPackage): FamilyDraft => ({
  examples: [],
  judgments: Object.fromEntries(
    (pkg?.criteria.map((c) => c.id) ?? familyCriteria).map((id) => [id, '']),
  ),
  role: 'guardian',
  basis: '',
  qualification: '',
  notes: '',
});
export function familyDraftValid(
  value: unknown,
  pkg?: FamilyPackage,
): value is FamilyDraft {
  if (
    !record(value) ||
    !exact(value, [
      'examples',
      'judgments',
      'role',
      'basis',
      'qualification',
      'notes',
    ]) ||
    !Array.isArray(value.examples) ||
    !record(value.judgments)
  )
    return false;
  return (
    value.examples.every((i) =>
      (pkg?.examples.map((e) => e.index) ?? familyExampleIds).includes(i),
    ) &&
    new Set(value.examples).size === value.examples.length &&
    exact(
      value.judgments,
      pkg?.criteria.map((c) => c.id) ?? [...familyCriteria],
    ) &&
    Object.values(value.judgments).every(
      (v) =>
        typeof v === 'string' && ['', 'accept', 'change', 'unsure'].includes(v),
    ) &&
    typeof value.role === 'string' &&
    ['guardian', 'educator'].includes(value.role) &&
    typeof value.basis === 'string' &&
    ['', 'independent-human', 'ai-assisted'].includes(value.basis) &&
    [value.qualification, value.notes].every(
      (v) => typeof v === 'string' && v.length <= 2000,
    )
  );
}
export type FamilyOutcome =
  | 'incomplete'
  | 'guardian-feedback'
  | 'provisional'
  | 'educator-approved'
  | 'changes-required'
  | 'unresolved';
/** Educational authority is never inferred from delivery approval, a technical pass, guardian feedback or AI agreement. */
export function familyDecision(
  value: unknown,
  pkg?: FamilyPackage,
): FamilyOutcome {
  if (
    !familyDraftValid(value, pkg) ||
    !value.basis ||
    value.notes.trim().length < 10
  )
    return 'incomplete';
  // A concern can stop the review early. Positive approval still needs the whole bounded package.
  if (Object.values(value.judgments).includes('change'))
    return 'changes-required';
  if (Object.values(value.judgments).includes('unsure')) return 'unresolved';
  if (
    value.examples.length !==
      (pkg?.examples.length ?? familyExampleIds.length) ||
    Object.values(value.judgments).includes('') ||
    (value.role === 'educator' && value.qualification.trim().length < 10)
  )
    return 'incomplete';
  if (value.basis === 'ai-assisted') return 'provisional';
  return value.role === 'educator' ? 'educator-approved' : 'guardian-feedback';
}
export const familyOutcomeLabels: Record<FamilyOutcome, string> = {
  incomplete: 'Nog niet volledig',
  'guardian-feedback': 'Ouderfeedback vastgelegd · certificering blijft open',
  provisional: 'Voorlopige AI-ondersteunde beoordeling · geen certificaat',
  'educator-approved':
    'Onderwijskundige goedkeuring vastgelegd · publicatie blijft geblokkeerd',
  'changes-required': 'Aanpassing nodig · geen certificaat',
  unresolved: 'Onzekerheid vastgelegd · certificering blijft open',
};
export type FamilyReviewState = {
  package: FamilyPackage;
  packageHash: string;
  revision: number;
  draft: FamilyDraft;
  activeMs: number;
  history: {
    id: string;
    revision: number;
    outcome: FamilyOutcome;
    createdAt: string;
    reviewerId: string;
    snapshot: string;
  }[];
  automaticPublication: false;
};
