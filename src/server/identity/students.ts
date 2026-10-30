import 'server-only';
import { randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '../../generated/prisma/client';
import {
  permitsStudentAccess,
  type IdentityActor,
  type StudentCapability,
} from '../../modules/identity/authorization';
import { localIdentityConfig, type LocalIdentityConfig } from '../auth/config';
import { withAdultIdentity } from '../auth/service';

const reply = (
  status: number,
  data: unknown = { error: 'RESOURCE_REQUEST_DENIED' },
) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });

/** Only call inside the authenticated transaction; return a minimal safe DTO. */
export async function authorizedStudent(
  tx: Prisma.TransactionClient,
  actor: IdentityActor,
  studentId: string,
  capability: StudentCapability,
) {
  const student = await tx.student.findFirst({
    where: {
      id: studentId,
      ...(actor.kind === 'student'
        ? { userId: actor.userId }
        : {
            guardians: { some: { guardianId: actor.userId, revokedAt: null } },
          }),
    },
    select: {
      id: true,
      userId: true,
      displayName: true,
      guardians: {
        where: { guardianId: actor.userId, revokedAt: null },
        select: {
          guardianId: true,
          revokedAt: true,
          canView: true,
          canAssign: true,
          canManage: true,
        },
      },
    },
  });
  if (
    !student ||
    !permitsStudentAccess(
      actor,
      student.userId,
      student.guardians[0] ?? null,
      capability,
    )
  )
    return null;
  return { id: student.id, displayName: student.displayName };
}

async function displayNameBody(request: Request): Promise<string | null> {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json')
    return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  try {
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      !('displayName' in body) ||
      typeof body.displayName !== 'string'
    )
      return null;
    const name = body.displayName.trim();
    return name.length >= 1 &&
      name.length <= 100 &&
      !/[\u0000-\u001f\u007f]/.test(name)
      ? name
      : null;
  } catch {
    return null;
  }
}

/** Local synthetic resource API. No arbitrary linking, role changes or admin grant. */
export async function studentsHandler(
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
      /^\/api\/identity\/students(?:\/([0-9a-f-]{36})(\/supervision)?)?$/.exec(
        url.pathname,
      );
    if (!match || url.search) return reply(404);
    const [, studentId, supervision] = match;
    const allowed = supervision
      ? ['DELETE']
      : studentId
        ? ['GET', 'PATCH']
        : ['GET', 'POST'];
    if (!allowed.includes(request.method)) return reply(405);
    if (
      request.method !== 'GET' &&
      request.headers.get('origin') !== config.origin
    )
      return reply(403);
    const name = ['POST', 'PATCH'].includes(request.method)
      ? await displayNameBody(request)
      : null;
    if (['POST', 'PATCH'].includes(request.method) && name === null)
      return reply(400);
    // DELETE has no input; reject hidden role/ownership payloads.
    if (request.method === 'DELETE' && request.body !== null) return reply(400);
    return await withAdultIdentity(
      db,
      config,
      request.headers,
      async (tx, actor) => {
        if (!studentId && request.method === 'GET') {
          const links = await tx.guardianStudent.findMany({
            where: {
              guardianId: actor.userId,
              revokedAt: null,
              OR: [{ canView: true }, { canAssign: true }, { canManage: true }],
            },
            include: { student: { select: { id: true, displayName: true } } },
            orderBy: { studentId: 'asc' },
          });
          return reply(
            200,
            links.map((link) => ({
              ...link.student,
              canManage: link.canManage,
            })),
          );
        }
        if (!studentId) {
          const age = Date.now() - actor.mfaVerifiedAt.getTime();
          if (age < 0 || age > 5 * 60_000) return reply(403);
          const id = randomUUID();
          const userId = randomUUID();
          await tx.user.create({
            data: {
              id: userId,
              name: 'Synthetic student',
              email: `${userId}@example.invalid`,
              principalKind: 'student',
            },
          });
          const student = await tx.student.create({
            data: {
              id,
              userId,
              displayName: name!,
              guardians: {
                create: {
                  guardianId: actor.userId,
                  canView: true,
                  canAssign: true,
                  canManage: true,
                },
              },
            },
            select: { id: true, displayName: true },
          });
          await tx.identityAudit.create({
            data: {
              id: randomUUID(),
              userId: actor.userId,
              studentId: id,
              event: 'student-created',
            },
          });
          return reply(201, student);
        }
        const student = await authorizedStudent(
          tx,
          actor,
          studentId,
          request.method === 'GET' ? 'view' : 'manage',
        );
        // Missing and unauthorized resources have exactly the same response.
        if (!student) return reply(404);
        if (request.method === 'GET') return reply(200, student);
        if (request.method === 'PATCH') {
          await tx.student.update({
            where: { id: studentId },
            data: { displayName: name! },
          });
        } else {
          await tx.guardianStudent.update({
            where: {
              guardianId_studentId: { guardianId: actor.userId, studentId },
            },
            data: { revokedAt: new Date() },
          });
        }
        await tx.identityAudit.create({
          data: {
            id: randomUUID(),
            userId: actor.userId,
            studentId,
            event:
              request.method === 'PATCH'
                ? 'student-profile-updated'
                : 'supervision-revoked',
          },
        });
        return reply(200, { ok: true });
      },
    );
  } catch {
    return reply(503);
  }
}
