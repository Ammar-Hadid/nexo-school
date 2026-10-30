import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client';
import { canonicalJson } from '../../modules/content/content-records';
import { eligibleStock, lockContent } from '../content/eligibility';
import { supplyLimits } from '../../modules/content/supply/supply-policy';
import { assignedItemInclude, assignedQuestion } from './assigned-content';
export type PublishedAssignmentInput = {
  studentId: string;
  requestId: string;
  source: 'published-practice';
  coverageId: string;
  count: number;
};
export const deliveryPolicy = 'published-practice-v1';
const reply = (status: number, data: unknown) =>
  Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
/** Must be called in the existing adult transaction after checking the student's assign capability. */
export async function issuePublished(
  tx: Prisma.TransactionClient,
  actor: { userId: string },
  input: PublishedAssignmentInput,
) {
  await lockContent(tx);
  const requestHash = createHash('sha256')
    .update(
      canonicalJson({
        studentId: input.studentId,
        coverageId: input.coverageId,
        count: input.count,
        policy: deliveryPolicy,
      }),
    )
    .digest('hex');
  const prior = await tx.assignment.findUnique({
    where: {
      createdBy_requestId: {
        createdBy: actor.userId,
        requestId: input.requestId,
      },
    },
  });
  if (prior)
    return prior.requestHash === requestHash
      ? reply(200, { id: prior.id })
      : reply(409, { error: 'REQUEST_CONFLICT' });
  const rows = await eligibleStock(tx, input.coverageId);
  const history = await tx.assignmentItem.findMany({
    where: {
      assignment: {
        studentId: input.studentId,
        createdAt: {
          gte: new Date(Date.now() - supplyLimits.cooldownDays * 86400000),
        },
      },
    },
    include: assignedItemInclude,
  });
  const exposed = new Set(
    history.flatMap((i) => {
      if (i.exposureKey) return [i.exposureKey];
      // D05 issued pairs also count as exposure; never relabel them fresh after migration.
      const q = assignedQuestion(i),
        m = /^(\d+) \+ (\d+) =$/.exec(q.prompt);
      return m
        ? [
            `addition-digits:${Math.min(Number(m[1]), Number(m[2]))}:${Math.max(Number(m[1]), Number(m[2]))}`,
          ]
        : [];
    }),
  );
  const selected = [];
  for (const candidate of rows) {
    const e = candidate.eligibility;
    if (!e.eligible || exposed.has(e.descriptor.exposureKey)) continue;
    selected.push({ ...candidate, source: e });
    exposed.add(e.descriptor.exposureKey);
    if (selected.length === input.count) break;
  }
  if (selected.length < input.count)
    return reply(409, {
      error: 'CONTENT_SHORTAGE',
      requested: input.count,
      available: selected.length,
      shortage: input.count - selected.length,
      purpose: 'practice',
    });
  const assignment = await tx.assignment.create({
    data: {
      id: randomUUID(),
      studentId: input.studentId,
      createdBy: actor.userId,
      requestId: input.requestId,
      requestHash,
      selectionVersion: deliveryPolicy,
      itemCount: input.count,
      items: {
        create: selected.map(({ row, source }, position) => ({
          id: randomUUID(),
          position,
          contentVersionId: row.id,
          contentHash: row.contentHash,
          familyId: source.descriptor.familyId,
          exposureKey: source.descriptor.exposureKey,
          purpose: 'practice',
        })),
      },
    },
  });
  await tx.identityAudit.create({
    data: {
      id: randomUUID(),
      userId: actor.userId,
      studentId: input.studentId,
      event: 'published-practice-assigned',
    },
  });
  return reply(201, { id: assignment.id });
}
