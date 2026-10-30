import 'server-only';
import { randomUUID } from 'node:crypto';
import type { PrismaClient, Prisma } from '../../generated/prisma/client';
import { withAdultIdentity } from '../auth/service';
import type { LocalIdentityConfig } from '../auth/config';
import { exact, text } from '../../modules/content/content-records';
import { requestBody } from '../practice/request-body';
import {
  contentEligibility,
  contentInclude,
  eligibleStock,
  lockContent,
} from './eligibility';
const reply = (
  status: number,
  data: unknown = { error: 'CONTENT_DELIVERY_DENIED' },
) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
const uuid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
const reasons = [
  'incorrect-answer',
  'misleading-explanation',
  'unsuitable-content',
  'other-defect',
];
async function overview(tx: Prisma.TransactionClient, userId: string) {
  const stock = await eligibleStock(tx);
  const students = await tx.student.findMany({
    where: {
      guardians: {
        some: { guardianId: userId, canAssign: true, revokedAt: null },
      },
    },
    select: { id: true, displayName: true },
    orderBy: { createdAt: 'asc' },
  });
  const timing = await tx.contentReviewProgress.aggregate({
    where: { reviewerId: userId },
    _sum: { totalMs: true },
  });
  return {
    scope: 'local-synthetic-practice',
    students,
    measuredReviewMs: timing._sum.totalMs ?? 0,
    pending: stock.filter(
      (s) => s.eligibility.reason === 'review-required' && !s.row.review,
    ).length,
    items: stock.map(({ row, eligibility }) => ({
      id: row.id,
      contentId: row.contentId,
      contentHash: row.contentHash,
      revision: row.revision,
      coverageId: row.coverageId,
      title: `${row.coverage.subject} · ${row.coverage.category}`,
      prompt:
        JSON.parse(row.snapshot).payload.learner?.prompt ??
        'Ouder inhoudsformaat',
      eligible: eligibility.eligible,
      reason: eligibility.eligible ? null : eligibility.reason,
      withdrawal: row.withdrawal
        ? {
            id: row.withdrawal.id,
            note: row.withdrawal.note,
            correction: row.withdrawal.correction
              ? {
                  replacementVersionId:
                    row.withdrawal.correction.replacementVersionId,
                  note: row.withdrawal.correction.note,
                }
              : null,
          }
        : null,
    })),
  };
}
/** Operator-only delivery/withdrawal surface; assignment itself keeps D03 assign authorization. */
export async function contentDeliveryHandler(
  db: PrismaClient,
  config: LocalIdentityConfig,
  request: Request,
) {
  try {
    const url = new URL(request.url);
    if (
      url.origin !== config.origin ||
      url.pathname !== '/api/guardian/content-delivery' ||
      url.search
    )
      return reply(403);
    if (!['GET', 'POST'].includes(request.method)) return reply(405);
    if (
      request.headers.get('origin') !== config.origin &&
      !(
        request.method === 'GET' &&
        request.headers.get('origin') === null &&
        request.headers.get('sec-fetch-site') === 'same-origin'
      )
    )
      return reply(403);
    const input = request.method === 'POST' ? await requestBody(request) : null;
    if (request.method === 'POST' && !input) return reply(400);
    return await withAdultIdentity(
      db,
      config,
      request.headers,
      async (tx, actor) => {
        if (
          !(await tx.identityBootstrap.findFirst({
            where: { userId: actor.userId },
          })) ||
          Date.now() - actor.mfaVerifiedAt.getTime() > 300000
        )
          return reply(403);
        await lockContent(tx);
        if (input === null) return reply(200, await overview(tx, actor.userId));
        if (
          input.action === 'withdraw' &&
          exact(input, [
            'action',
            'contentVersionId',
            'contentHash',
            'reason',
            'note',
          ]) &&
          uuid(input.contentVersionId) &&
          text(input.contentHash) &&
          reasons.includes(String(input.reason)) &&
          text(input.note) &&
          input.note.trim().length > 0 &&
          input.note.length <= 500
        ) {
          const content = await tx.contentVersion.findUnique({
            where: { id: input.contentVersionId },
            include: { withdrawal: true },
          });
          if (!content || content.contentHash !== input.contentHash)
            return reply(409);
          const old = content.withdrawal;
          if (old)
            return old.reason === input.reason &&
              old.note === input.note &&
              old.actorId === actor.userId
              ? reply(200, { id: old.id })
              : reply(409);
          const withdrawal = await tx.contentWithdrawal.create({
            data: {
              id: randomUUID(),
              contentVersionId: content.id,
              contentHash: content.contentHash,
              reason: String(input.reason),
              note: input.note,
              actorId: actor.userId,
            },
          });
          await tx.identityAudit.create({
            data: {
              id: randomUUID(),
              userId: actor.userId,
              event: 'content-withdrawn',
            },
          });
          return reply(201, { id: withdrawal.id });
        }
        if (
          input.action === 'correct' &&
          exact(input, [
            'action',
            'withdrawalId',
            'replacementVersionId',
            'replacementHash',
            'note',
          ]) &&
          uuid(input.withdrawalId) &&
          uuid(input.replacementVersionId) &&
          text(input.replacementHash) &&
          text(input.note) &&
          input.note.trim().length > 0 &&
          input.note.length <= 500
        ) {
          const withdrawal = await tx.contentWithdrawal.findUnique({
            where: { id: input.withdrawalId },
            include: { content: true, correction: true },
          });
          const replacement = await tx.contentVersion.findUnique({
            where: { id: input.replacementVersionId },
            include: contentInclude,
          });
          if (
            !withdrawal ||
            !replacement ||
            replacement.contentHash !== input.replacementHash
          )
            return reply(409);
          const old = withdrawal.correction;
          if (old)
            return old.replacementVersionId === replacement.id &&
              old.note === input.note &&
              old.actorId === actor.userId
              ? reply(200, { id: old.id })
              : reply(409);
          if (
            replacement.contentId !== withdrawal.content.contentId ||
            replacement.coverageId !== withdrawal.content.coverageId ||
            replacement.revision <= withdrawal.content.revision ||
            !(await contentEligibility(tx, replacement)).eligible
          )
            return reply(409);
          const correction = await tx.contentCorrection.create({
            data: {
              id: randomUUID(),
              withdrawalId: withdrawal.id,
              replacementVersionId: replacement.id,
              replacementHash: replacement.contentHash,
              note: input.note,
              actorId: actor.userId,
            },
          });
          await tx.identityAudit.create({
            data: {
              id: randomUUID(),
              userId: actor.userId,
              event: 'content-correction-linked',
            },
          });
          return reply(201, { id: correction.id });
        }
        if (
          input.action === 'impact' &&
          exact(input, ['action', 'contentVersionId']) &&
          uuid(input.contentVersionId)
        ) {
          const items = await tx.assignmentItem.findMany({
            where: {
              contentVersionId: input.contentVersionId,
              assignment: {
                student: {
                  guardians: {
                    some: {
                      guardianId: actor.userId,
                      canView: true,
                      revokedAt: null,
                    },
                  },
                },
              },
            },
            select: {
              id: true,
              assignmentId: true,
              assignment: {
                select: { student: { select: { displayName: true } } },
              },
              attempts: {
                select: { id: true, attemptNumber: true, correct: true },
              },
            },
          });
          return reply(200, { items });
        }
        return reply(400);
      },
    );
  } catch {
    return reply(409);
  }
}
