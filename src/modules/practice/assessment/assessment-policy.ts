/** Canonical executable demo policy. Rationale: docs/product/assessment-policy.md.
 * No confidence probabilities or claim of educational validation. */
export const ASSESSMENT_POLICY = 'synthetic-assessment-v1';
export const assessmentLimits = {
  maxAgeDays: 14,
  retentionDays: 2,
  recheckDays: 3,
  instructionFailureSessions: 3,
  unsuccessfulFollowups: 2,
  recoveryFailures: 2,
} as const;
export type Facet = 'procedure' | 'concept' | 'application';
export const facetLabels: Record<Facet, string> = {
  procedure: 'uitvoeren',
  concept: 'begrip',
  application: 'toepassen',
};
export type AssessmentSubject =
  'rekenen' | 'taal' | 'spelling' | 'begrijpend-lezen';
export type Blueprint = {
  version: string;
  subject: AssessmentSubject;
  category: string;
  level: string;
  objectives: readonly { skill: string; facets: readonly Facet[] }[];
  prerequisites: readonly string[];
};
export type ItemEvidence = {
  contentVersion: string;
  evaluatorVersion: string;
  curriculumVersion: string;
  subject: AssessmentSubject;
  category: string;
  skill: string;
  level: string;
  family: string;
  representation: string;
  facet: Facet;
  response: 'constructed' | 'choice' | 'unsupported';
  role: 'assessed' | 'supporting';
  review: 'synthetic' | 'reviewed' | 'missing';
  passage?: string;
};
export type Evidence = ItemEvidence & {
  id: string;
  item: string;
  day: number;
  session: string;
  correct: boolean;
  firstAttempt: boolean;
  assisted: boolean;
  novel: boolean;
  complete: boolean;
  purpose: 'check' | 'confirm' | 'retention' | 'practice' | 'repair' | 'daily';
};
export type Decision =
  | 'more-evidence'
  | 'targeted-practice'
  | 'targeted-instruction'
  | 'ready-provisional'
  | 'retention-due'
  | 'no-longer-demonstrated';
export const decisionLabels: Record<Decision, string> = {
  'more-evidence': 'Aanvullend bewijs nodig',
  'targeted-practice': 'Gericht oefenen nodig',
  'targeted-instruction': 'Passende uitleg nodig',
  'ready-provisional': 'Voorlopig klaar om verder te gaan',
  'retention-due': 'Uitgestelde controle nodig',
  'no-longer-demonstrated': 'Niet meer voldoende aangetoond',
};
export type SkillAssessment = {
  skill: string;
  decision: Decision;
  evidenceIds: string[];
  missing: Facet[];
  conflicts: Facet[];
  families: number;
  observations: number;
  excluded: number;
  reason: string;
};

/** Shared eligibility for both advancement and delayed observations. */
export function isEligibleEvidence(
  blueprint: Blueprint,
  e: Evidence,
  day: number,
): boolean {
  return (
    Number.isFinite(day) &&
    Number.isFinite(e.day) &&
    Boolean(
      e.id &&
      e.item &&
      e.family &&
      e.representation &&
      e.contentVersion &&
      e.evaluatorVersion,
    ) &&
    e.subject === blueprint.subject &&
    e.category === blueprint.category &&
    blueprint.objectives.some(
      (objective) =>
        objective.skill === e.skill && objective.facets.includes(e.facet),
    ) &&
    e.complete &&
    e.firstAttempt &&
    !e.assisted &&
    e.novel &&
    e.role === 'assessed' &&
    e.review !== 'missing' &&
    e.response !== 'unsupported' &&
    e.curriculumVersion === blueprint.version &&
    e.level === blueprint.level &&
    ['check', 'confirm', 'retention'].includes(e.purpose) &&
    e.day <= day &&
    day - e.day <= assessmentLimits.maxAgeDays
  );
}

/** Pure projection. Input order breaks same-day ties; facts themselves are never edited. */
export function assessCategory(
  blueprint: Blueprint,
  history: readonly Evidence[],
  day: number,
  prerequisites: ReadonlySet<string> = new Set(),
) {
  const skills: SkillAssessment[] = blueprint.objectives.map((objective) => {
    const scoped = history
      .filter(
        (e) =>
          e.subject === blueprint.subject &&
          e.category === blueprint.category &&
          e.skill === objective.skill,
      )
      .sort((a, b) => a.day - b.day);
    const used = new Set<string>();
    const sources = new Set<string>();
    const eligible = scoped.filter((e) => {
      if (
        !isEligibleEvidence(blueprint, e, day) ||
        sources.has(e.id) ||
        used.has(e.item)
      )
        return false;
      used.add(e.item);
      sources.add(e.id);
      return true;
    });
    const conflicts = objective.facets.filter((f) => {
      const entries = eligible.filter((e) => e.facet === f);
      const lastWrong = entries.reduce(
        (last, e, index) => (e.correct ? last : index),
        -1,
      );
      return (
        lastWrong >= 0 &&
        !entries
          .slice(lastWrong + 1)
          .some((e) => e.correct && e.session !== entries[lastWrong]!.session)
      );
    });
    const positive = eligible.filter(
      (e, i) =>
        e.correct &&
        !eligible
          .slice(0, i)
          .some(
            (earlier) =>
              !earlier.correct &&
              earlier.facet === e.facet &&
              earlier.session === e.session,
          ) &&
        !eligible
          .slice(i + 1)
          .some((later) => later.facet === e.facet && !later.correct),
    );
    // A family is one observation regardless of numeric variants or wording.
    // Reading questions also cluster by passage, regardless of question family.
    const clusters = new Set<string>();
    const independent = [...positive]
      .sort(
        (a, b) =>
          Number(b.response === 'constructed') -
          Number(a.response === 'constructed'),
      )
      .filter((e) => {
        const cluster =
          blueprint.subject === 'begrijpend-lezen' ? e.passage : e.family;
        if (!cluster || clusters.has(cluster)) return false;
        clusters.add(cluster);
        return true;
      });
    const missing = objective.facets.filter(
      (f) => !independent.some((e) => e.facet === f),
    );
    const sufficient =
      missing.length === 0 &&
      independent.length >= Math.max(3, objective.facets.length) &&
      new Set(independent.map((e) => e.representation)).size >= 2 &&
      new Set(independent.map((e) => e.session)).size >= 2 &&
      independent.filter((e) => e.response === 'constructed').length >= 2;
    const failures = new Set(
      eligible
        .filter((e) => !e.correct && conflicts.includes(e.facet))
        .map((e) => e.session),
    ).size;
    const decision: Decision = conflicts.length
      ? failures >= assessmentLimits.instructionFailureSessions
        ? 'targeted-instruction'
        : 'targeted-practice'
      : sufficient
        ? 'ready-provisional'
        : 'more-evidence';
    return {
      skill: objective.skill,
      decision,
      evidenceIds: independent.map((e) => e.id),
      missing,
      conflicts,
      families: clusters.size,
      observations: independent.length,
      excluded: scoped.length - eligible.length,
      reason: conflicts.length
        ? `Conflicting evidence: ${conflicts.join(', ')}.`
        : sufficient
          ? 'Required demo facets and independent observations present; retention remains unverified.'
          : `Missing or insufficient independent coverage: ${missing.join(', ') || 'families, representations, sessions or constructed responses'}.`,
    };
  });
  const missingPrerequisites = blueprint.prerequisites.filter(
    (s) => !prerequisites.has(s),
  );
  const decision: Decision = skills.some(
    (s) => s.decision === 'targeted-instruction',
  )
    ? 'targeted-instruction'
    : skills.some((s) => s.decision === 'targeted-practice')
      ? 'targeted-practice'
      : skills.length > 0 &&
          missingPrerequisites.length === 0 &&
          skills.every((s) => s.decision === 'ready-provisional')
        ? 'ready-provisional'
        : 'more-evidence';
  return {
    policy: ASSESSMENT_POLICY,
    decision,
    skills,
    missingPrerequisites,
    coverage: {
      demonstrated: skills.filter((s) => s.decision === 'ready-provisional')
        .length,
      required: skills.length,
    },
  };
}

/** Retention is a separate temporal state; success never becomes durable mastery. */
export function retentionDecision(
  due: number,
  hasConflict: boolean,
  day: number,
): Decision {
  return hasConflict
    ? 'no-longer-demonstrated'
    : day >= due
      ? 'retention-due'
      : 'ready-provisional';
}
