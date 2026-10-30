import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '../../generated/prisma/client';
import type { IdentityActor } from '../../modules/identity/authorization';
import type { PublicAssignment } from '../../modules/practice/assignment/public-contract';
import { authorizedStudent } from '../identity/students';
import { localIdentityConfig, type LocalIdentityConfig } from '../auth/config';
import { withAdultIdentity, withStudentIdentity } from '../auth/service';
import { requestBody } from './request-body';
import { savePresentation } from './presentation';
import { readProgress, submitAnswer } from './submissions';
import { assignedItemInclude, assignedQuestion } from './assigned-content';
import {
  issuePublished,
  type PublishedAssignmentInput,
} from './issue-published';
import { seedItems, arithmeticPolicy } from '../content/arithmetic';

const reply = (
  status: number,
  data: unknown = { error: 'ASSIGNMENT_REQUEST_DENIED' },
) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Call only within the authenticated transaction. Select public fields explicitly. */
export async function readAssignment(
  tx: Prisma.TransactionClient,
  actor: IdentityActor,
  id: string,
): Promise<PublicAssignment | null> {
  const row = await tx.assignment.findFirst({
    where: {
      id,
      student:
        actor.kind === 'student'
          ? { userId: actor.userId }
          : {
              guardians: {
                some: {
                  guardianId: actor.userId,
                  canView: true,
                  revokedAt: null,
                },
              },
            },
    },
    select: {
      id: true,
      studentId: true,
      revision: true,
      items: {
        orderBy: { position: 'asc' },
        include: assignedItemInclude,
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    studentId: row.studentId,
    revision: row.revision,
    subject: assignedQuestion(row.items[0]!).subject,
    category: assignedQuestion(row.items[0]!).category,
    items: row.items.map((item) => {
      const q = assignedQuestion(item);
      return {
        id: item.id,
        position: item.position,
        prompt: q.prompt,
        responseType: q.responseType,
        ...(q.answerUnit ? { answerUnit: q.answerUnit } : {}),
        ...(q.options.length ? { options: q.options } : {}),
        ...(q.readingText ? { readingText: q.readingText } : {}),
      };
    }),
  };
}

async function input(
  request: Request,
): Promise<
  { studentId: string; requestId: string } | PublishedAssignmentInput | null
> {
  const body = await requestBody(request);
  if (
    !body ||
    ![
      'requestId,studentId',
      'count,coverageId,requestId,source,studentId',
    ].includes(Object.keys(body).sort().join(',')) ||
    typeof body.studentId !== 'string' ||
    typeof body.requestId !== 'string' ||
    !uuid.test(body.studentId) ||
    !uuid.test(body.requestId)
  )
    return null;
  if ('source' in body) {
    if (
      body.source !== 'published-practice' ||
      typeof body.coverageId !== 'string' ||
      !uuid.test(body.coverageId) ||
      !Number.isInteger(body.count) ||
      Number(body.count) < 1 ||
      Number(body.count) > 10
    )
      return null;
    return {
      studentId: body.studentId,
      requestId: body.requestId,
      source: body.source,
      coverageId: body.coverageId,
      count: Number(body.count),
    };
  }
  return { studentId: body.studentId, requestId: body.requestId };
}

export async function assignmentsHandler(
  db: PrismaClient,
  config: LocalIdentityConfig,
  request: Request,
): Promise<Response> {
  try {
    localIdentityConfig({
      NEXO_LOCAL_IDENTITY: 'synthetic-only',
      DATABASE_URL: config.databaseUrl,
      BETTER_AUTH_URL: config.origin,
      BETTER_AUTH_SECRET: config.secret,
    });
    const url = new URL(request.url);
    if (url.origin !== config.origin) return reply(403);
    const match =
      /^\/api\/practice\/assignments(?:\/([0-9a-f-]{36})(?:\/(attempts|progress|presentation))?)?$/.exec(
        url.pathname,
      );
    if (!match || url.search) return reply(404);
    const id = match[1];
    const action = match[2];
    if (action === 'presentation' && request.method === 'POST' && id) {
      if (request.headers.get('origin') !== config.origin) return reply(403);
      const body = await requestBody(request);
      if (
        !body ||
        Object.keys(body).sort().join(',') !==
          'action,answer,expectedRevision,expectedVersion' ||
        !['draft', 'continue'].includes(String(body.action)) ||
        typeof body.answer !== 'string' ||
        body.answer.length > 64 ||
        !Number.isSafeInteger(body.expectedVersion) ||
        Number(body.expectedVersion) < 0 ||
        !Number.isInteger(body.expectedRevision) ||
        Number(body.expectedRevision) < 0 ||
        Number(body.expectedRevision) > 20 ||
        (body.action === 'continue' && body.answer !== '')
      )
        return reply(400);
      return await withStudentIdentity(
        db,
        config,
        request.headers,
        (tx, actor) =>
          savePresentation(tx, actor, id, {
            action: body.action as 'draft' | 'continue',
            answer: body.answer as string,
            expectedVersion: body.expectedVersion as number,
            expectedRevision: body.expectedRevision as number,
          }),
      );
    }
    if (action === 'attempts' && request.method === 'POST' && id) {
      if (request.headers.get('origin') !== config.origin) return reply(403);
      const body = await requestBody(request);
      if (
        !body ||
        Object.keys(body).sort().join(',') !==
          'answer,expectedRevision,itemId,requestId' ||
        typeof body.answer !== 'string' ||
        body.answer.length > 64 ||
        typeof body.itemId !== 'string' ||
        !uuid.test(body.itemId) ||
        typeof body.requestId !== 'string' ||
        !uuid.test(body.requestId) ||
        typeof body.expectedRevision !== 'number' ||
        !Number.isInteger(body.expectedRevision) ||
        body.expectedRevision < 0 ||
        body.expectedRevision > 20
      )
        return reply(400);
      const command = {
        answer: body.answer,
        itemId: body.itemId,
        requestId: body.requestId,
        expectedRevision: body.expectedRevision,
      };
      return await withStudentIdentity(
        db,
        config,
        request.headers,
        (tx, actor) => submitAnswer(tx, actor, id, command),
      );
    }
    if (action && !(action === 'progress' && request.method === 'GET'))
      return reply(405);
    if (request.method === 'GET') {
      if (
        request.headers.get('origin') !== config.origin &&
        !(
          request.headers.get('origin') === null &&
          request.headers.get('sec-fetch-site') === 'same-origin'
        )
      )
        return reply(403);
      return await withStudentIdentity(
        db,
        config,
        request.headers,
        async (tx, actor) => {
          if (!id) {
            const assignments = await tx.assignment.findMany({
              where: { student: { userId: actor.userId } },
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              take: 100,
              select: {
                id: true,
                itemCount: true,
                presentation: {
                  select: { answer: true, acknowledgedRevision: true },
                },
                attempts: {
                  orderBy: { sequence: 'desc' },
                  take: 1,
                  select: { sequence: true, response: true },
                },
                items: {
                  orderBy: { position: 'asc' },
                  take: 1,
                  include: assignedItemInclude,
                },
              },
            });
            return reply(
              200,
              assignments.map((a) => {
                const last = a.attempts[0];
                const completed = (
                  last?.response as
                    { progress?: { result?: unknown } } | undefined
                )?.progress?.result;
                return {
                  id: a.id,
                  title: `${assignedQuestion(a.items[0]!).subject} · ${assignedQuestion(a.items[0]!).category}`,
                  questions: a.itemCount,
                  status:
                    completed &&
                    a.presentation?.acknowledgedRevision === last?.sequence
                      ? 'done'
                      : last || a.presentation?.answer
                        ? 'active'
                        : 'planned',
                };
              }),
            );
          }
          if (action === 'progress') return readProgress(tx, actor, id);
          const assignment = await readAssignment(tx, actor, id);
          return assignment ? reply(200, assignment) : reply(404);
        },
      );
    }
    if (request.method !== 'POST' || id) return reply(405);
    if (request.headers.get('origin') !== config.origin) return reply(403);
    const body = await input(request);
    if (!body) return reply(400);
    return await withAdultIdentity(
      db,
      config,
      request.headers,
      async (tx, actor) => {
        if (!(await authorizedStudent(tx, actor, body.studentId, 'assign')))
          return reply(404);
        if ('source' in body) return issuePublished(tx, actor, body);
        const requestHash = createHash('sha256')
          .update(
            JSON.stringify({
              studentId: body.studentId,
              policy: arithmeticPolicy,
            }),
          )
          .digest('hex');
        const previous = await tx.assignment.findUnique({
          where: {
            createdBy_requestId: {
              createdBy: actor.userId,
              requestId: body.requestId,
            },
          },
        });
        if (previous)
          return previous.requestHash === requestHash
            ? reply(200, { id: previous.id })
            : reply(409);
        const questions = seedItems();
        await tx.arithmeticQuestionVersion.createMany({
          data: questions,
          skipDuplicates: true,
        });
        // Fail closed if the stored publication differs from this exact synthetic certificate.
        const published = await tx.arithmeticQuestionVersion.findMany({
          where: { id: { in: questions.map((q) => q.id) } },
        });
        if (
          questions.some(
            (q) =>
              !published.some(
                (p) =>
                  p.id === q.id &&
                  Object.entries(q).every(
                    ([key, value]) => p[key as keyof typeof p] === value,
                  ),
              ),
          )
        )
          throw new Error('Publication mismatch');
        const assignment = await tx.assignment.create({
          data: {
            id: randomUUID(),
            studentId: body.studentId,
            createdBy: actor.userId,
            requestId: body.requestId,
            requestHash,
            selectionVersion: arithmeticPolicy,
            itemCount: questions.length,
            items: {
              create: questions.map((q, position) => ({
                id: randomUUID(),
                position,
                questionVersionId: q.id,
              })),
            },
          },
        });
        await tx.identityAudit.create({
          data: {
            id: randomUUID(),
            userId: actor.userId,
            studentId: body.studentId,
            event: 'synthetic-assignment-created',
          },
        });
        return reply(201, { id: assignment.id });
      },
    );
  } catch {
    return reply(503);
  }
}
