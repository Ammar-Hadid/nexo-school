import 'server-only';
import { evaluateAnswer } from './evaluate-answer';
import {
  assignedItemInclude,
  assignedQuestion,
  assignmentWithdrawals,
} from './assigned-content';
import { lockContent } from '../content/eligibility';
import { createHash, randomUUID } from 'node:crypto';
import type { Prisma } from '../../generated/prisma/client';
import type { IdentityActor } from '../../modules/identity/authorization';
import {
  replaySubmissions,
  type SubmissionProgress,
  type SubmissionReceipt,
} from '../../modules/practice/assignment/submission-state';

export type SubmitInput = {
  requestId: string;
  itemId: string;
  expectedRevision: number;
  answer: string;
};
const reply = (status: number, data: unknown) =>
  Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
const deny = () => reply(404, { error: 'ASSIGNMENT_REQUEST_DENIED' });

async function load(
  tx: Prisma.TransactionClient,
  actor: IdentityActor,
  id: string,
) {
  if (actor.kind !== 'student') return null;
  return tx.assignment.findFirst({
    where: { id, student: { userId: actor.userId } },
    include: {
      items: { orderBy: { position: 'asc' }, include: assignedItemInclude },
      attempts: { orderBy: { sequence: 'asc' } },
    },
  });
}
type Loaded = NonNullable<Awaited<ReturnType<typeof load>>>;
function progress(row: Loaded): SubmissionProgress {
  const { state, result } = replaySubmissions(
    row.items.length,
    row.attempts.map((a) => {
      if (a.policyVersion !== 'deferred-retry-v1')
        throw new Error('Unsupported scoring policy');
      const item = row.items.find((i) => i.id === a.itemId);
      if (!item) throw new Error('Attempt membership mismatch');
      return {
        index: item.position,
        retry: a.attemptNumber === 2,
        answer: a.rawAnswer,
        correct: a.correct,
      };
    }),
  );
  return {
    revision: row.attempts.length,
    next: result
      ? null
      : {
          itemId: row.items[state.index]!.id,
          attemptNumber: state.retry ? 2 : 1,
        },
    outcomes: state.outcomes,
    result,
  };
}
/** Authenticated student transaction only. GET returns saved feedback and next work, never private rows. */
export async function readProgress(
  tx: Prisma.TransactionClient,
  actor: IdentityActor,
  id: string,
) {
  const row = await load(tx, actor, id);
  if (!row) return deny();
  const withdrawn = (await assignmentWithdrawals(tx, id)).length > 0;
  return reply(200, {
    ...(withdrawn ? { withdrawn: true } : {}),
    progress: withdrawn
      ? { ...progress(row), next: null, result: null }
      : progress(row),
    lastSubmission: withdrawn ? null : (row.attempts.at(-1)?.response ?? null),
    presentation: (await tx.practicePresentation.findUnique({
      where: { assignmentId: id },
      select: {
        version: true,
        progressRevision: true,
        acknowledgedRevision: true,
        answer: true,
        requestId: true,
      },
    })) ?? {
      version: 0,
      progressRevision: 0,
      acknowledgedRevision: 0,
      answer: '',
      requestId: null,
    },
  });
}
/** D04 owns authentication. Row lock also serializes trusted in-process command callers. */
export async function submitAnswer(
  tx: Prisma.TransactionClient,
  actor: IdentityActor,
  id: string,
  input: SubmitInput,
): Promise<Response> {
  if (actor.kind !== 'student') return deny();
  const owned = await tx.assignment.findFirst({
    where: { id, student: { userId: actor.userId } },
    select: { id: true },
  });
  if (!owned) return deny();
  await tx.$queryRaw`SELECT id FROM "Assignment" WHERE id = ${id} FOR UPDATE`;
  await lockContent(tx);
  if ((await assignmentWithdrawals(tx, id)).length)
    return reply(409, { error: 'CONTENT_WITHDRAWN' });
  const hash = createHash('sha256')
    .update(
      JSON.stringify({
        itemId: input.itemId,
        expectedRevision: input.expectedRevision,
        answer: input.answer,
      }),
    )
    .digest('hex');
  const prior = await tx.practiceAttempt.findUnique({
    where: {
      assignmentId_requestId: { assignmentId: id, requestId: input.requestId },
    },
  });
  if (prior)
    return prior.requestHash === hash
      ? reply(200, prior.response)
      : reply(409, { error: 'REQUEST_CONFLICT' });
  const row = (await load(tx, actor, id))!;
  const current = progress(row);
  if (
    current.revision !== input.expectedRevision ||
    current.next?.itemId !== input.itemId
  )
    return reply(409, { error: 'STALE_ITEM' });
  const item = row.items.find((i) => i.id === input.itemId)!;
  const question = assignedQuestion(item);
  const evaluated = evaluateAnswer(question, input.answer);
  if (!evaluated) return reply(400, { error: 'INVALID_ANSWER' });
  const { normalized, correct } = evaluated;
  const attemptNumber = current.next.attemptNumber;
  const idempotentId = randomUUID();
  const data = {
    id: idempotentId,
    assignmentId: id,
    itemId: item.id,
    requestId: input.requestId,
    requestHash: hash,
    sequence: current.revision + 1,
    attemptNumber,
    rawAnswer: input.answer,
    normalizedAnswer: normalized,
    correct,
    scoreUnits: correct ? (attemptNumber === 1 ? 2 : 1) : 0,
    evaluatorVersion: question.evaluatorVersion,
    policyVersion: 'deferred-retry-v1',
  };
  // Use the exact same lifecycle projection for writes, reads and retries.
  const nextProgress = progress({
    ...row,
    attempts: [
      ...row.attempts,
      { ...data, response: {}, createdAt: new Date() },
    ],
  });
  const receipt: SubmissionReceipt = {
    attemptId: idempotentId,
    itemId: item.id,
    attemptNumber,
    submitted: input.answer,
    correct,
    progress: nextProgress,
  };
  if (!correct && attemptNumber === 2) {
    // Synthetic fixed worked sum; no live personalized explanation or mastery inference.
    receipt.solution = {
      answer: question.answer,
      steps: question.steps,
    };
  }
  await tx.practiceAttempt.create({
    data: { ...data, response: receipt as unknown as Prisma.InputJsonValue },
  });
  await tx.identityAudit.create({
    data: {
      id: randomUUID(),
      userId: actor.userId,
      studentId: row.studentId,
      event: 'practice-answer-committed',
    },
  });
  return reply(200, receipt);
}
