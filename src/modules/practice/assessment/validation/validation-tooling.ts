import {
  assessCategory,
  type Evidence,
  type Facet,
} from '../assessment-policy';
import {
  emptySnapshot,
  submit,
  type Assignment,
} from '../../learning-path/path-model';
import {
  PACKAGE_VERSION,
  PREREQUISITE,
  facets,
  foundationBlueprint,
  targetBlueprint,
  requiredSkills,
  type DraftItem,
} from './validation-blueprint';

/** Preparation tools only: no publication, scheduler or competing policy. */
export function inspectInventory(items: readonly DraftItem[]) {
  const missing = requiredSkills.flatMap((skill) =>
    facets
      .filter(
        (facet) => !items.some((i) => i.skill === skill && i.facet === facet),
      )
      .map((facet) => `${skill}:${facet}`),
  );
  const unsupported = items
    .filter((i) => i.response === 'unsupported')
    .map((i) => i.id);
  const duplicateIds = items
    .filter((item, index) => items.findIndex((i) => i.id === item.id) !== index)
    .map((item) => item.id);
  return { missing, unsupported, duplicateIds };
}

/** Bounded dry-run selection. Held-out and practice items are never fallback checks. */
export function selectDraftBatch(
  bank: readonly DraftItem[],
  requests: readonly { skill: string; facet: Facet }[],
  seen: ReadonlySet<string>,
): DraftItem[] {
  if (requests.length > 4 || inspectInventory(bank).duplicateIds.length)
    return [];
  const used = new Set(seen);
  const selected: DraftItem[] = [];
  for (const request of requests) {
    const item = bank.find(
      (i) =>
        i.pool === 'entry-confirmation' &&
        i.skill === request.skill &&
        i.facet === request.facet &&
        i.response !== 'unsupported' &&
        !used.has(i.id),
    );
    if (!item) return [];
    selected.push(item);
    used.add(item.id);
  }
  return selected;
}

/** Validate syntax before using the existing route's deterministic whole-number scorer.
 * Raw text is retained here; no modification to the approved submit/retry behavior. */
export function scoreDraft(item: DraftItem, raw: string) {
  const normalized = raw.trim();
  if (item.response === 'unsupported' || item.key === null)
    return { raw, normalized, status: 'unscorable' as const };
  if (!/^\d{1,6}$/.test(normalized))
    return { raw, normalized, status: 'invalid' as const };
  const snapshot = emptySnapshot(1);
  const task: Assignment = {
    id: `validation:${item.id}`,
    subject: 'rekenen',
    category: 'getalbegrip',
    purpose: 'check',
    issuedDay: 0,
    reason: 'Synthetic draft validation only',
    processed: false,
    started: false,
    snapshot,
    questions: [
      {
        id: item.id,
        objective: 0,
        family: item.family,
        prompt: item.prompt,
        answer: String(item.key),
        steps: [item.rubric],
      },
    ],
  };
  const correct = submit(task, snapshot, normalized).state.attempts[0]!.correct;
  return {
    raw,
    normalized,
    status: correct ? ('correct' as const) : ('incorrect' as const),
  };
}

export type DraftAttempt = {
  source: string;
  item: string;
  raw: string;
  day: number;
  session: string;
  assisted?: boolean;
  retry?: boolean;
  familiar?: boolean;
};

export function observe(
  bank: readonly DraftItem[],
  attempts: readonly DraftAttempt[],
): Evidence[] {
  if (inspectInventory(bank).duplicateIds.length) return [];
  const sources = new Set<string>();
  const items = new Set<string>();
  return attempts.flatMap((a) => {
    const item = bank.find((i) => i.id === a.item);
    if (
      !item ||
      !a.source ||
      !a.session ||
      sources.has(a.source) ||
      items.has(a.item)
    )
      return [];
    const score = scoreDraft(item, a.raw);
    if (score.status === 'invalid' || score.status === 'unscorable') return [];
    sources.add(a.source);
    items.add(a.item);
    return [
      {
        id: a.source,
        item: item.id,
        day: a.day,
        session: a.session,
        contentVersion: `${PACKAGE_VERSION}:${item.id}:${item.version}`,
        evaluatorVersion: 'path-whole-number-v2+validation-syntax-v1',
        curriculumVersion: PACKAGE_VERSION,
        subject: 'rekenen' as const,
        category: 'getalbegrip',
        skill: item.skill,
        level: targetBlueprint.level,
        family: item.family,
        representation: item.representation,
        facet: item.facet,
        response: item.response,
        role: 'assessed' as const,
        review: 'synthetic' as const,
        correct: score.status === 'correct',
        firstAttempt: !a.retry,
        assisted: Boolean(a.assisted),
        novel: !a.familiar,
        complete: true,
        purpose:
          item.pool === 'practice-repair'
            ? ('practice' as const)
            : item.pool === 'held-out-delayed'
              ? ('retention' as const)
              : ('check' as const),
      },
    ];
  });
}

/** Derive prerequisite permission from the same policy, never from a fabricated ready flag. */
export function assessPackage(history: readonly Evidence[], day: number) {
  const foundation = assessCategory(foundationBlueprint, history, day);
  const target = assessCategory(
    targetBlueprint,
    history,
    day,
    new Set(foundation.decision === 'ready-provisional' ? [PREREQUISITE] : []),
  );
  return { ...target, foundation };
}
