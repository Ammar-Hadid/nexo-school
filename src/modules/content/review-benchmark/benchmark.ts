import { createHash } from 'node:crypto';
import { canonicalJson, exact, record } from '../content-records.ts';
import {
  benchmarkCases,
  benchmarkVersion,
  defectCodes,
  type Candidate,
  type DefectCode,
  type ModelProfile,
} from './fixtures.ts';
export const fingerprint = (value: unknown) =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');
export type Stage = 'solve' | 'semantic';
export type Finding = {
  code: DefectCode;
  severity: 'blocking' | 'attention';
  field: 'prompt' | 'passage' | 'explanation' | 'answer' | 'options';
  quote: string;
  reason: string;
};
export type Review = {
  contentHash: string;
  status: 'clear' | 'flagged' | 'abstain';
  answer: string | null;
  findings: Finding[];
};
export function reviewRequest(
  candidate: Candidate,
  stage: Stage,
  model: ModelProfile,
) {
  const { answer, explanation, ...blind } = candidate;
  return {
    namespace: 'd13-review',
    version: benchmarkVersion,
    model,
    stage,
    contentHash: fingerprint(candidate),
    ...blind,
    ...(stage === 'semantic' ? { answer, explanation } : {}),
  };
}
export function parseReview(
  candidate: Candidate,
  stage: Stage,
  value: unknown,
): Review | null {
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
      !defectCodes.includes(finding.code as DefectCode) ||
      typeof finding.severity !== 'string' ||
      !['blocking', 'attention'].includes(finding.severity) ||
      typeof finding.field !== 'string' ||
      !['prompt', 'passage', 'explanation', 'answer', 'options'].includes(
        finding.field,
      ) ||
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
    const field = candidate[finding.field as Finding['field']];
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
  return value as Review;
}
export type Observation = {
  candidateId: string;
  stage: Stage;
  response: unknown;
  chargedMicroEur: number;
  inputTokens: number | null;
  outputTokens: number | null;
  attemptCount: number;
  unknownUsageCalls?: number;
};
export function summarizeBenchmark(
  model: ModelProfile,
  observations: Observation[],
) {
  const rows = benchmarkCases.map(({ candidate, expected }) => {
    const observed = observations.filter((o) => o.candidateId === candidate.id);
    const stage = (name: Stage) => {
      const matches = observed.filter((o) => o.stage === name);
      return matches.length === 1
        ? parseReview(candidate, name, matches[0]!.response)
        : null;
    };
    const solve = stage('solve');
    const semantic = stage('semantic');
    const unresolved =
      !solve ||
      !semantic ||
      solve.status === 'abstain' ||
      semantic.status === 'abstain';
    const flags = semantic?.findings ?? [];
    const missed = expected.filter(
      (e) =>
        !flags.some(
          (f) =>
            f.code === e.code &&
            (e.severity !== 'blocking' || f.severity === 'blocking'),
        ),
    );
    return {
      id: candidate.id,
      contentHash: fingerprint(candidate),
      expected,
      solve,
      semantic,
      unresolved,
      answerDisagreement:
        solve?.answer != null && solve.answer !== candidate.answer,
      missedCodes: missed.map((e) => e.code),
      criticalMisses: unresolved
        ? 0
        : missed.filter((e) => e.severity === 'blocking').length,
      falseAlarm:
        expected.length === 0 &&
        (flags.length > 0 ||
          (solve?.answer != null && solve.answer !== candidate.answer)),
    };
  });
  return {
    version: benchmarkVersion,
    fixtureHash: fingerprint(benchmarkCases),
    model,
    mode: 'fake-only',
    humanAdjudication: 'pending',
    educationalApproval: false,
    totalItems: rows.length,
    defectiveItems: rows.filter((r) => r.expected.length > 0).length,
    cleanItems: rows.filter((r) => r.expected.length === 0).length,
    unresolvedItems: rows.filter((r) => r.unresolved).length,
    completedCriticalMisses: rows.reduce((n, r) => n + r.criticalMisses, 0),
    unresolvedCriticalDefects: rows
      .filter((r) => r.unresolved)
      .reduce(
        (n, r) =>
          n + r.expected.filter((e) => e.severity === 'blocking').length,
        0,
      ),
    undetectedDefects: rows.reduce((n, r) => n + r.missedCodes.length, 0),
    flaggedItems: rows.filter((r) => (r.semantic?.findings.length ?? 0) > 0)
      .length,
    falseAlarms: rows.filter((r) => r.falseAlarm).length,
    answerDisagreements: rows.filter((r) => r.answerDisagreement).length,
    attemptedCalls: observations.reduce((n, o) => n + o.attemptCount, 0),
    inputTokens: observations.reduce((n, o) => n + (o.inputTokens ?? 0), 0),
    outputTokens: observations.reduce((n, o) => n + (o.outputTokens ?? 0), 0),
    unknownUsageCalls: observations.reduce(
      (n, o) =>
        n +
        (o.unknownUsageCalls ??
          (o.inputTokens === null || o.outputTokens === null
            ? o.attemptCount
            : 0)),
      0,
    ),
    simulatedCommittedMicroEur: observations.reduce(
      (n, o) => n + o.chargedMicroEur,
      0,
    ),
    actualSpendMicroEur: 0,
    rows,
  };
}
