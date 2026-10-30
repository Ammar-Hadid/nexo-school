import {
  assessCategory,
  isEligibleEvidence,
  type Blueprint,
  type Evidence,
  type ItemEvidence,
} from './assessment-policy';
export const SAVED_SHADOW_VERSION = 'saved-evidence-shadow-v1';
/** Trusted adapter output, never an HTTP input. Unknown metadata remains unknown. */
export type ShadowFact = {
  attemptId: string;
  itemId: string;
  assignmentId: string;
  contentHash: string;
  contentVersion: string;
  evaluatorVersion: string;
  scoringPolicy: string;
  family: string;
  exposureKey: string;
  observedAt: string;
  correct: boolean;
  attemptNumber: number;
  complete: boolean;
  integrity: 'verified' | 'unverified';
  contentStatus:
    | 'reviewed'
    | 'synthetic-only'
    | 'unknown'
    | 'defective'
    | 'rejected'
    | 'withdrawn';
  assistance: 'none-recorded' | 'assisted' | 'unknown';
  priorExposure: boolean | null;
  purpose: Evidence['purpose'] | 'unknown';
  mapping: Omit<
    ItemEvidence,
    'contentVersion' | 'evaluatorVersion' | 'family' | 'review'
  > | null;
};
const day = (date: string) => Math.floor(Date.parse(date) / 86400000);
/** Reuses the policy unchanged. No transition/assignment writer, permission flag or prerequisite override. */
export function evaluateSavedShadow(
  blueprint: Blueprint,
  facts: readonly ShadowFact[],
  asOf: string,
) {
  const today = day(asOf);
  if (!Number.isFinite(today)) throw new Error('INVALID_SHADOW_DATE');
  const evidence: Evidence[] = [],
    exclusions: { attemptId: string; reasons: string[] }[] = [];
  const ids = new Set<string>(),
    exposures = new Set<string>();
  const ordered = [...facts].sort(
    (a, b) =>
      a.observedAt.localeCompare(b.observedAt) ||
      a.attemptId.localeCompare(b.attemptId),
  );
  for (const f of ordered) {
    const reasons: string[] = [];
    if (
      !f.attemptId ||
      !f.itemId ||
      !f.assignmentId ||
      !f.contentHash ||
      !f.contentVersion ||
      !f.family ||
      !f.exposureKey
    )
      reasons.push('missing-provenance');
    if (f.integrity !== 'verified') reasons.push('unverified-source');
    if (f.contentStatus !== 'reviewed')
      reasons.push(`content-${f.contentStatus}`);
    if (f.assistance !== 'none-recorded')
      reasons.push('assistance-not-cleared');
    if (f.priorExposure !== false || exposures.has(f.exposureKey))
      reasons.push('previous-or-unknown-exposure');
    if (ids.has(f.attemptId)) reasons.push('duplicate-attempt');
    if (!f.mapping) reasons.push('missing-reviewed-mapping');
    if (f.attemptNumber !== 1) reasons.push('retry');
    if (!f.complete) reasons.push('unfinished');
    if (!['check', 'confirm', 'retention'].includes(f.purpose))
      reasons.push('ordinary-or-unknown-purpose');
    if (
      f.scoringPolicy !== 'deferred-retry-v1' ||
      f.evaluatorVersion !== 'integer-exact-v1'
    )
      reasons.push('unsupported-evaluation');
    const timestamp = Date.parse(f.observedAt);
    if (!Number.isFinite(timestamp) || timestamp > Date.parse(asOf))
      reasons.push('invalid-observation-date');
    ids.add(f.attemptId);
    exposures.add(f.exposureKey);
    const e: Evidence | null = f.mapping
      ? {
          ...f.mapping,
          id: f.attemptId,
          item: f.exposureKey,
          session: f.assignmentId,
          day: day(f.observedAt),
          contentVersion: f.contentVersion,
          evaluatorVersion: f.evaluatorVersion,
          family: f.family,
          review: 'reviewed',
          correct: f.correct,
          firstAttempt: f.attemptNumber === 1,
          assisted: f.assistance !== 'none-recorded',
          novel: f.priorExposure === false,
          complete: f.complete,
          purpose: f.purpose === 'unknown' ? 'practice' : f.purpose,
        }
      : null;
    if (e && !isEligibleEvidence(blueprint, e, today))
      reasons.push('policy-ineligible');
    if (!reasons.length && e) evidence.push(e);
    else exclusions.push({ attemptId: f.attemptId, reasons });
  }
  return {
    adapter: SAVED_SHADOW_VERSION,
    activation: 'disabled' as const,
    asOf,
    blueprint,
    facts,
    evidence,
    exclusions,
    assessment: assessCategory(blueprint, evidence, today),
  };
}
