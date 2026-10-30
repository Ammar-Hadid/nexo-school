import { canonicalJson, exact, record } from '../content-records.ts';
import { fingerprint, type Stage } from './benchmark.ts';
import { defectCodes, type Candidate } from './fixtures.ts';
import { benchmarkModels } from './setup.ts';
import { expandedCases } from './expanded-fixtures.ts';
import { smokePolicy, smokeSpecification } from './live-smoke.ts';
export const expandedProviderId = 'd13-expanded-v2';
export const expandedVersion = 'd13-screen-20261022-v2';
export const expandedDefectCodes: string[] = [
  ...defectCodes,
  'rubric-response-mismatch',
  'instruction-contamination',
  'explanation-error',
];
export type ExpandedFinding = {
  code: string;
  severity: 'blocking' | 'attention';
  field:
    | 'prompt'
    | 'passage'
    | 'explanation'
    | 'answer'
    | 'options'
    | 'rubric'
    | 'objective';
  quote: string;
  reason: string;
};
export type ExpandedReview = {
  contentHash: string;
  status: 'clear' | 'flagged' | 'abstain';
  answer: string | null;
  findings: ExpandedFinding[];
};
export const screeningCases = expandedCases.filter((c) => c.split === 'screen');
export const referenceHash =
  '07139051117ad4303b1c85afea6cd7438ed0d4624255e0785d0cfa31f7ec6346';
if (fingerprint(expandedCases) !== referenceHash)
  throw new Error('EXPANDED_REFERENCE_VERSION_CONFLICT');
export function expandedRequest(id: string, stage: Stage, model: string) {
  const source = screeningCases.find((c) => c.candidate.id === id);
  if (
    !source ||
    !['solve', 'semantic'].includes(stage) ||
    !benchmarkModels.some((m) => m.model === model)
  )
    throw new Error('INVALID_EXPANDED_REQUEST');
  const { answer, explanation, ...blind } = source.candidate;
  return canonicalJson({
    namespace: 'd13-expanded-review',
    version: expandedVersion,
    model,
    stage,
    contentHash: fingerprint(source.candidate),
    ...blind,
    ...(stage === 'semantic' ? { answer, explanation } : {}),
  });
}
export function readExpandedRequest(specification: string) {
  const value: unknown = JSON.parse(specification);
  if (
    !record(value) ||
    typeof value.id !== 'string' ||
    typeof value.model !== 'string' ||
    (value.stage !== 'solve' && value.stage !== 'semantic') ||
    specification !== expandedRequest(value.id, value.stage, value.model)
  )
    throw new Error('EXPANDED_REQUEST_CONFLICT');
  return {
    model: value.model,
    stage: value.stage as Stage,
    candidate: screeningCases.find((c) => c.candidate.id === value.id)!
      .candidate,
  };
}
export function expandedPolicy(specification: string) {
  const { model } = readExpandedRequest(specification);
  return {
    ...smokePolicy(smokeSpecification(model, 'solve')),
    version: expandedVersion,
    provider: expandedProviderId,
  };
}
export function parseExpandedReview(
  candidate: Candidate,
  stage: Stage,
  value: unknown,
): ExpandedReview | null {
  if (
    !record(value) ||
    !exact(value, ['contentHash', 'status', 'answer', 'findings']) ||
    value.contentHash !== fingerprint(candidate) ||
    typeof value.status !== 'string' ||
    !['clear', 'flagged', 'abstain'].includes(value.status) ||
    !Array.isArray(value.findings) ||
    value.findings.length > 8 ||
    !(
      value.answer === null ||
      (typeof value.answer === 'string' &&
        value.answer.trim().length > 0 &&
        value.answer.length <= 300)
    )
  )
    return null;
  for (const finding of value.findings) {
    if (
      !record(finding) ||
      !exact(finding, ['code', 'severity', 'field', 'quote', 'reason']) ||
      typeof finding.code !== 'string' ||
      !expandedDefectCodes.includes(finding.code) ||
      typeof finding.severity !== 'string' ||
      !['blocking', 'attention'].includes(finding.severity) ||
      typeof finding.field !== 'string' ||
      ![
        'prompt',
        'passage',
        'explanation',
        'answer',
        'options',
        'rubric',
        'objective',
      ].includes(finding.field) ||
      typeof finding.quote !== 'string' ||
      !finding.quote.trim() ||
      typeof finding.reason !== 'string' ||
      !finding.reason.trim() ||
      finding.reason.length > 1000
    )
      return null;
    if (
      stage === 'solve' &&
      ['answer', 'explanation'].includes(String(finding.field))
    )
      return null;
    const field = candidate[finding.field as ExpandedFinding['field']];
    if (
      !(Array.isArray(field) ? field.join('\n') : field).includes(finding.quote)
    )
      return null;
  }
  if (value.status === 'flagged' && value.findings.length === 0) return null;
  if (value.status !== 'flagged' && value.findings.length !== 0) return null;
  if (stage === 'solve' && value.status === 'clear' && value.answer === null)
    return null;
  if (stage === 'semantic' && value.answer !== null) return null;
  return value as ExpandedReview;
}

export type ExpandedObservation = {
  id: string;
  stage: Stage;
  review: ExpandedReview | null;
  attempts: number;
  costMicroEur: number;
  inputTokens: number | null;
  outputTokens: number | null;
  unresolvedCost: boolean;
};
const normalize = (s: string) =>
  s
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('nl-NL')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '');
export function summarizeExpanded(
  model: string,
  observations: ExpandedObservation[],
) {
  const rows = screeningCases.map((c) => {
    const stage = (name: Stage) => {
      const matches = observations.filter(
        (o) => o.id === c.candidate.id && o.stage === name,
      );
      return matches.length === 1 ? matches[0]! : null;
    };
    const solve = stage('solve'),
      semantic = stage('semantic');
    const answer = solve?.review?.answer ?? null;
    const answered = Boolean(
      solve?.review && (answer !== null || solve.review.status === 'abstain'),
    );
    const matched =
      answered &&
      (c.acceptedAnswers === null
        ? solve?.review?.status === 'abstain'
        : answer !== null &&
          c.acceptedAnswers.some((a) => normalize(a) === normalize(answer)));
    const resolved = Boolean(
      semantic?.review && semantic.review.status !== 'abstain',
    );
    const findings = semantic?.review?.findings ?? [];
    const missed = c.expected.filter(
      (e) =>
        !findings.some(
          (f) =>
            f.code === e.code &&
            (e.severity !== 'blocking' || f.severity === 'blocking'),
        ),
    );
    return {
      id: c.candidate.id,
      stratum: c.stratum,
      family: c.family,
      contentHash: fingerprint(c.candidate),
      humanApproved: false,
      answerEvidence: c.answerEvidence,
      acceptedAnswers: c.acceptedAnswers,
      observedAnswer: answer,
      answered,
      matchedReference: matched,
      answerStatus: !answered
        ? 'unresolved'
        : matched
          ? 'matches-reference'
          : 'unmatched-needs-review',
      provisional: {
        expected: c.expected,
        resolved,
        missed: resolved ? missed : [],
        unresolvedDefects: resolved ? [] : c.expected,
        falseAlarm: resolved && c.expected.length === 0 && findings.length > 0,
        findings,
      },
      solve: solve?.review ?? null,
      semantic: semantic?.review ?? null,
    };
  });
  const objective = rows.filter((r) => r.answerEvidence === 'objective');
  const linguistic = rows.filter((r) => r.answerEvidence === 'linguistic');
  return {
    model,
    referenceHash,
    humanApproval: 'pending',
    educationalApproval: false,
    referenceProvenance:
      'agent-authored; factual checks separate from provisional labels',
    objective: {
      total: objective.length,
      answered: objective.filter((r) => r.answered).length,
      matches: objective.filter((r) => r.matchedReference).length,
      unmatched: objective.filter((r) => r.answered && !r.matchedReference)
        .length,
      unresolved: objective.filter((r) => !r.answered).length,
    },
    linguistic: {
      total: linguistic.length,
      matches: linguistic.filter((r) => r.matchedReference).length,
      unmatched: linguistic.filter((r) => r.answered && !r.matchedReference)
        .length,
      unresolved: linguistic.filter((r) => !r.answered).length,
    },
    provisional: {
      total: rows.length,
      resolvedItems: rows.filter((r) => r.provisional.resolved).length,
      unresolvedItems: rows.filter((r) => !r.provisional.resolved).length,
      missedBlockingDefects: rows
        .flatMap((r) => r.provisional.missed)
        .filter((f) => f.severity === 'blocking').length,
      unresolvedBlockingDefects: rows
        .flatMap((r) => r.provisional.unresolvedDefects)
        .filter((f) => f.severity === 'blocking').length,
      falseAlarmItems: rows.filter((r) => r.provisional.falseAlarm).length,
    },
    attempts: observations.reduce((n, o) => n + o.attempts, 0),
    committedMicroEur: observations.reduce((n, o) => n + o.costMicroEur, 0),
    knownInputTokens: observations.reduce(
      (n, o) => n + (o.inputTokens ?? 0),
      0,
    ),
    knownOutputTokens: observations.reduce(
      (n, o) => n + (o.outputTokens ?? 0),
      0,
    ),
    unresolvedCostAttempts: observations.filter((o) => o.unresolvedCost).length,
    rows,
  };
}

// Largest reservation first. Each settles before the next request. No retries.
export const expandedModels = [
  'gpt-6.1-sol',
  'claude-opus-5-5',
  'gemini-4-argon',
  'claude-sonnet-5-5',
  'gemini-3.8-flash',
  'claude-haiku-5-5',
  'gpt-6-luna',
];
export const expandedManifest = expandedModels.flatMap((model) =>
  screeningCases.flatMap((c) =>
    (['solve', 'semantic'] as const).map((stage) => ({
      model,
      id: c.candidate.id,
      stage,
      requestId: `d13-v2-${model.replaceAll('.', '_')}-${c.candidate.id}-${stage}`,
      specification: expandedRequest(c.candidate.id, stage, model),
    })),
  ),
);
