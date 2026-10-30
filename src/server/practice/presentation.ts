import 'server-only';
import { assignmentWithdrawals } from './assigned-content';
import { lockContent } from '../content/eligibility';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client';
import type { IdentityActor } from '../../modules/identity/authorization';

export type PresentationInput = {
  expectedVersion: number;
  expectedRevision: number;
  action: 'draft' | 'continue';
  answer: string;
};
export async function savePresentation(
  tx: Prisma.TransactionClient,
  actor: IdentityActor,
  id: string,
  input: PresentationInput,
) {
  const reply = (status: number) =>
    Response.json(
      { ok: status === 200 },
      { status, headers: { 'cache-control': 'no-store' } },
    );
  if (
    actor.kind !== 'student' ||
    !(await tx.assignment.findFirst({
      where: { id, student: { userId: actor.userId } },
    }))
  )
    return reply(404);
  await tx.$queryRaw`SELECT id FROM "Assignment" WHERE id = ${id} FOR UPDATE`;
  await lockContent(tx);
  if ((await assignmentWithdrawals(tx, id)).length) return reply(409);
  const revision = await tx.practiceAttempt.count({
    where: { assignmentId: id },
  });
  const prior = await tx.practicePresentation.findUnique({
    where: { assignmentId: id },
  });
  if (
    revision !== input.expectedRevision ||
    (prior?.version ?? 0) !== input.expectedVersion
  )
    return reply(409);
  const acknowledged = prior?.acknowledgedRevision ?? 0;
  if (
    input.action === 'draft' &&
    (acknowledged !== revision || revision === 20)
  )
    return reply(409);
  if (input.action === 'draft') {
    const last = await tx.practiceAttempt.findFirst({
      where: { assignmentId: id },
      orderBy: { sequence: 'desc' },
    });
    if (
      last &&
      (last.response as { progress?: { result?: unknown } }).progress?.result
    )
      return reply(409);
  }
  const data = {
    version: (prior?.version ?? 0) + 1,
    progressRevision: revision,
    acknowledgedRevision: input.action === 'continue' ? revision : acknowledged,
    answer: input.action === 'draft' ? input.answer : '',
    requestId: input.action === 'draft' ? randomUUID() : null,
  };
  await tx.practicePresentation.upsert({
    where: { assignmentId: id },
    create: { assignmentId: id, ...data },
    update: data,
  });
  await tx.identityAudit.create({
    data: {
      id: randomUUID(),
      userId: actor.userId,
      event: 'practice-presentation-saved',
    },
  });
  return reply(200);
}
