import 'server-only';
import { assignedItemInclude, assignedQuestion } from './assigned-content';
import { createHash } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client';
import type { IdentityActor } from '../../modules/identity/authorization';
import { authorizedStudent } from '../identity/students';
import { arithmeticItem } from '../content/arithmetic';
import { canonicalJson } from '../../modules/content/content-records';
import { additionExposure } from '../../modules/practice/rekenen/addition-strategies';
import {
  parseIntegerAnswer,
  replaySubmissions,
} from '../../modules/practice/assignment/submission-state';
import {
  evaluateSavedShadow,
  type ShadowFact,
} from '../../modules/practice/assessment/saved-evidence-shadow';
import type { Blueprint } from '../../modules/practice/assessment/assessment-policy';
const sourcePolicy = 'saved-source-withdrawal-v2';
const blueprint: Blueprint = {
  version: 'synthetic-d05-v1',
  subject: 'rekenen',
  category: 'optellen',
  level: 'single-digits',
  objectives: [
    {
      skill: 'demo:optellen:single-digits',
      facets: ['procedure', 'concept', 'application'],
    },
  ],
  prerequisites: ['reviewed-counting-prerequisite'],
};
/** Existing authenticated transaction only. Reads persisted facts, never accepts attempts/evidence from callers.
 * No HTTP route, automatic job or write path is enabled by this preparation slice. */
export async function savedEvidenceShadow(
  tx: Prisma.TransactionClient,
  actor: IdentityActor,
  studentId: string,
  asOf: Date,
) {
  if (!Number.isFinite(asOf.getTime())) throw new Error('INVALID_SHADOW_DATE');
  if (!(await authorizedStudent(tx, actor, studentId, 'view')))
    throw new Error('SHADOW_ACCESS_DENIED');
  const rows = await tx.assignment.findMany({
    where: { studentId, createdAt: { lte: asOf } },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    include: {
      items: { orderBy: { position: 'asc' }, include: assignedItemInclude },
      attempts: {
        where: { createdAt: { lte: asOf } },
        orderBy: { sequence: 'asc' },
      },
    },
  });
  const facts: ShadowFact[] = [];
  const exposures = new Set<string>();
  for (const row of rows) {
    let complete = false,
      historyValid = true;
    try {
      complete = Boolean(
        replaySubmissions(
          row.items.length,
          row.attempts.map((a) => {
            const item = row.items.find((i) => i.id === a.itemId);
            if (
              !item ||
              a.policyVersion !== 'deferred-retry-v1' ||
              ![1, 2].includes(a.attemptNumber)
            )
              throw new Error('INVALID_HISTORY');
            return {
              index: item.position,
              retry: a.attemptNumber === 2,
              answer: a.rawAnswer,
              correct: a.correct,
            };
          }),
        ).result,
      );
    } catch {
      historyValid = false;
    }
    for (const item of row.items) {
      const q = assignedQuestion(item);
      const match = /^([0-9]) \+ ([0-9]) =$/.exec(q.prompt);
      const expected = match
        ? arithmeticItem(Number(match[1]), Number(match[2]))
        : null;
      const known =
        expected &&
        Object.entries(expected).every(
          ([k, v]) => q[k as keyof typeof q] === v,
        );
      const exposure = known
        ? additionExposure(Number(match![1]), Number(match![2]))
        : (item.exposureKey ?? `unknown:${q.id}`);
      for (const a of row.attempts.filter((a) => a.itemId === item.id)) {
        facts.push({
          attemptId: a.id,
          itemId: item.id,
          assignmentId: row.id,
          contentHash: q.contentHash,
          contentVersion: q.id,
          evaluatorVersion: a.evaluatorVersion,
          scoringPolicy: a.policyVersion,
          family: known
            ? 'addition-digits-procedure'
            : (item.familyId ?? 'unknown'),
          exposureKey: exposure,
          observedAt: a.createdAt.toISOString(),
          correct: a.correct,
          attemptNumber: a.attemptNumber,
          complete,
          integrity:
            known &&
            historyValid &&
            a.evaluatorVersion === q.evaluatorVersion &&
            a.normalizedAnswer === parseIntegerAnswer(a.rawAnswer) &&
            a.correct === (a.normalizedAnswer === q.answer)
              ? 'verified'
              : 'unverified',
          // Current withdrawal is authoritative even when replaying an earlier attempt cutoff.
          // Individual synthetic practice review does not supply a reviewed assessment mapping or assistance.
          contentStatus: item.content?.withdrawal
            ? 'withdrawn'
            : known || item.content
              ? 'synthetic-only'
              : 'unknown',
          assistance: 'unknown',
          priorExposure: exposures.has(exposure) ? true : null,
          purpose: 'practice',
          mapping: known
            ? {
                curriculumVersion: item.question!.curriculumVersion,
                subject: 'rekenen',
                category: 'optellen',
                skill: item.question!.skillId,
                level: 'single-digits',
                representation: 'symbolic-sum',
                facet: 'procedure',
                response: 'constructed',
                role: 'assessed',
              }
            : null,
        });
      }
      // Conservatively regard assignment as exposure, even when no answer was submitted.
      exposures.add(exposure);
    }
  }
  const report = evaluateSavedShadow(blueprint, facts, asOf.toISOString());
  return {
    ...report,
    sourcePolicy,
    sourceHash: createHash('sha256')
      .update(canonicalJson({ studentId, sourcePolicy, report }))
      .digest('hex'),
    gates: [
      'D24/D25-purpose-and-exposure',
      'D29–D31-reviewed-blueprints-and-shadow-validation',
    ],
  };
}
