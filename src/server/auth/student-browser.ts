import 'server-only';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { APIError } from 'better-auth/api';
import { passkey } from '@better-auth/passkey';
import type { Prisma } from '../../generated/prisma/client.ts';
import type { LocalIdentityConfig } from './config.ts';
import { permitsStudentAccess } from '../../modules/identity/authorization.ts';

// Local synthetic defaults from ADR-003; hosted origin/cookie configuration is gated.
export const browserCookie = 'nexo-local-browser';
const enrollMs = 10 * 60_000;
const grantMs = 90 * 86400_000;
const idleMs = 30 * 60_000;
type Tx = Prisma.TransactionClient;
export type AuthSession = {
  user: {
    id: string;
    principalKind?: string;
    emailVerified: boolean;
    twoFactorEnabled?: boolean | null;
  };
  session: { id: string; mfaVerifiedAt?: Date | string | null };
} | null;
const deny = () => {
  throw new APIError('FORBIDDEN', { message: 'BROWSER_ACCESS_DENIED' });
};
const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const reply = (
  status: number,
  data: unknown = { error: 'BROWSER_ACCESS_DENIED' },
) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
export async function browserGrant(tx: Tx, headers: Headers) {
  const values = (headers.get('cookie') ?? '')
    .split(';')
    .map((v) => v.trim())
    .filter((v) => v.startsWith(`${browserCookie}=`));
  if (values.length !== 1) return null;
  const token = values[0]!.slice(browserCookie.length + 1);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return tx.studentBrowser.findUnique({ where: { secretHash: digest(token) } });
}
async function supervised(
  tx: Tx,
  grant: NonNullable<Awaited<ReturnType<typeof browserGrant>>>,
) {
  if (!grant.studentId || !grant.approvedBy) return null;
  return tx.student.findFirst({
    where: {
      id: grant.studentId,
      guardians: {
        some: {
          guardianId: grant.approvedBy,
          canManage: true,
          revokedAt: null,
        },
      },
    },
  });
}
async function ceremonyGrant(
  tx: Tx,
  headers: Headers,
  registration: boolean,
  context?: string | null,
) {
  const grant = await browserGrant(tx, headers);
  if (!grant || grant.expiresAt.getTime() <= Date.now()) return deny();
  const approved =
    grant.state === 'approved' && grant.enrollExpires.getTime() > Date.now();
  if (
    registration
      ? !approved || context !== grant.id
      : !approved && grant.state !== 'active'
  )
    return deny();
  const student = await supervised(tx, grant);
  if (!student) return deny();
  return { grant, student };
}
export function studentPasskey(tx: Tx, config: LocalIdentityConfig) {
  return passkey({
    rpID: new URL(config.origin).hostname,
    rpName: 'nexo local synthetic identity',
    origin: config.origin,
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
    registration: {
      requireSession: false,
      resolveUser: async ({ ctx, context }) => {
        const { student } = await ceremonyGrant(
          tx,
          ctx.headers!,
          true,
          context,
        );
        return {
          id: student.userId,
          name: student.userId,
          displayName: 'Synthetic student',
        };
      },
      afterVerification: async ({ ctx, context, verification, user }) => {
        if (verification.registrationInfo?.userVerified !== true) return deny();
        const { grant, student } = await ceremonyGrant(
          tx,
          ctx.headers!,
          true,
          context,
        );
        if (student.userId !== user.id) return deny();
        await tx.studentBrowser.update({
          where: { id: grant.id },
          data: {
            state: 'registering',
            credentialID: verification.registrationInfo.credential.id,
          },
        });
        return { userId: student.userId };
      },
    },
    authentication: {
      afterVerification: async ({ ctx, verification, clientData }) => {
        if (verification.authenticationInfo.userVerified !== true)
          return deny();
        const { grant, student } = await ceremonyGrant(tx, ctx.headers!, false);
        const key = await tx.passkey.findUnique({
          where: { credentialID: clientData.id },
        });
        if (
          !key ||
          key.userId !== student.userId ||
          (grant.state === 'active' && grant.credentialID !== key.credentialID)
        )
          return deny();
        await tx.studentBrowser.update({
          where: { id: grant.id },
          data: { state: 'active', credentialID: key.credentialID },
        });
      },
    },
  });
}

/** Must run in the shared authenticated transaction, including each future practice use case. */
export async function studentIdentity(
  tx: Tx,
  headers: Headers,
  session: AuthSession,
) {
  if (!session || session.user.principalKind !== 'student') return null;
  const grant = await browserGrant(tx, headers);
  if (
    !grant ||
    grant.state !== 'active' ||
    grant.expiresAt.getTime() <= Date.now() ||
    !grant.credentialID
  )
    return null;
  const student = await supervised(tx, grant);
  if (!student || student.userId !== session.user.id) return null;
  const key = await tx.passkey.findUnique({
    where: { credentialID: grant.credentialID },
  });
  const binding = await tx.studentSessionBinding.findUnique({
    where: { sessionId: session.session.id },
  });
  if (
    !key ||
    key.userId !== student.userId ||
    !binding ||
    binding.browserId !== grant.id ||
    binding.lastSeen.getTime() > Date.now() ||
    Date.now() - binding.lastSeen.getTime() >= idleMs
  )
    return null;
  await tx.studentSessionBinding.update({
    where: { sessionId: session.session.id },
    data: { lastSeen: new Date() },
  });
  return {
    kind: 'student' as const,
    userId: student.userId,
    studentId: student.id,
    displayName: student.displayName,
  };
}

export const studentRoutes = new Map([
  ['/student/enroll', 'POST'],
  ['/student/enrollment', 'GET'],
  ['/student/approve', 'POST'],
  ['/student/revoke', 'POST'],
  ['/student/browsers', 'POST'],
  ['/student/session', 'GET'],
  ['/passkey/generate-register-options', 'GET'],
  ['/passkey/verify-registration', 'POST'],
  ['/passkey/generate-authenticate-options', 'GET'],
  ['/passkey/verify-authentication', 'POST'],
]);
async function manage(tx: Tx, session: AuthSession, studentId: unknown) {
  if (
    !session ||
    session.user.principalKind !== 'adult' ||
    !session.user.emailVerified ||
    !session.user.twoFactorEnabled ||
    !session.session.mfaVerifiedAt ||
    typeof studentId !== 'string'
  )
    return false;
  const link = await tx.guardianStudent.findUnique({
    where: { guardianId_studentId: { guardianId: session.user.id, studentId } },
  });
  return permitsStudentAccess(
    {
      kind: 'adult',
      userId: session.user.id,
      mfaVerifiedAt: new Date(session.session.mfaVerifiedAt),
    },
    '',
    link,
    'manage',
  );
}
async function audit(tx: Tx, userId: string, studentId: string, event: string) {
  await tx.identityAudit.create({
    data: { id: randomUUID(), userId, studentId, event },
  });
}
function fields(body: Record<string, unknown>, names: string[]) {
  return Object.keys(body).every((key) => names.includes(key));
}
export async function studentRequest(
  tx: Tx,
  request: Request,
  path: string,
  body: Record<string, unknown>,
  session: AuthSession,
): Promise<Response | null> {
  if (path === '/student/enrollment') {
    if (session?.user.principalKind === 'adult') return reply(403);
    const grant = await browserGrant(tx, request.headers);
    if (!grant) return reply(200, { state: 'none' });
    const expired =
      grant.expiresAt.getTime() <= Date.now() ||
      (['pending', 'approved'].includes(grant.state) &&
        grant.enrollExpires.getTime() <= Date.now());
    return reply(200, {
      state: expired ? 'expired' : grant.state,
      enrollmentId: grant.id,
      label: grant.label,
      enrollExpires: grant.enrollExpires,
    });
  }
  if (path === '/student/enroll') {
    if (
      !fields(body, ['label']) ||
      typeof body.label !== 'string' ||
      !body.label.trim() ||
      body.label.length > 80 ||
      /[\u0000-\u001f\u007f]/.test(body.label)
    )
      return reply(400);
    // Persistent global local-synthetic cap; never trust forwarded IP headers.
    const since = new Date(Date.now() - 60_000);
    if (
      (await tx.studentBrowser.count({
        where: { createdAt: { gte: since } },
      })) >= 20
    )
      return reply(429);
    const old = await browserGrant(tx, request.headers);
    if (
      old &&
      ['pending', 'approved'].includes(old.state) &&
      old.enrollExpires.getTime() > Date.now()
    )
      return reply(200, { enrollmentId: old.id, label: old.label });
    const secret = randomBytes(32).toString('base64url');
    const grant = await tx.studentBrowser.create({
      data: {
        id: randomUUID(),
        secretHash: digest(secret),
        label: body.label.trim(),
        enrollExpires: new Date(Date.now() + enrollMs),
        expiresAt: new Date(Date.now() + grantMs),
      },
    });
    const result = reply(201, { enrollmentId: grant.id, label: grant.label });
    result.headers.append(
      'set-cookie',
      `${browserCookie}=${secret}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${grantMs / 1000}`,
    );
    return result;
  }
  if (path === '/student/session') {
    const actor = await studentIdentity(tx, request.headers, session);
    return actor
      ? reply(200, {
          student: { id: actor.studentId, displayName: actor.displayName },
        })
      : reply(401);
  }
  if (
    ['/student/approve', '/student/revoke', '/student/browsers'].includes(path)
  ) {
    if (!(await manage(tx, session, body.studentId))) return reply(404);
    const studentId = body.studentId as string;
    if (path === '/student/browsers') {
      if (!fields(body, ['studentId'])) return reply(400);
      return reply(
        200,
        await tx.studentBrowser.findMany({
          where: { studentId },
          select: { id: true, label: true, state: true, expiresAt: true },
        }),
      );
    }
    if (path === '/student/approve') {
      if (!fields(body, ['studentId', 'enrollmentId'])) return reply(400);
      if (typeof body.enrollmentId !== 'string') return reply(400);
      const changed = await tx.studentBrowser.updateMany({
        where: {
          id: body.enrollmentId,
          state: 'pending',
          enrollExpires: { gt: new Date() },
        },
        data: { state: 'approved', studentId, approvedBy: session!.user.id },
      });
      if (changed.count !== 1) return reply(409);
      await audit(tx, session!.user.id, studentId, 'student-browser-approved');
      return reply(200, { ok: true });
    }
    if (
      !fields(body, ['studentId', 'browserId', 'scope']) ||
      !['browser', 'credential', 'all'].includes(String(body.scope)) ||
      (body.scope !== 'all' && typeof body.browserId !== 'string')
    )
      return reply(400);
    const target =
      body.scope === 'all'
        ? null
        : await tx.studentBrowser.findFirst({
            where: { id: body.browserId as string, studentId },
          });
    if (body.scope !== 'all' && !target) return reply(404);
    if (body.scope === 'credential' && !target?.credentialID) return reply(400);
    const where = {
      studentId,
      ...(body.scope === 'all'
        ? {}
        : body.scope === 'credential'
          ? { credentialID: target!.credentialID }
          : { id: target!.id }),
    };
    const affected = await tx.studentBrowser.findMany({
      where,
      select: { id: true },
    });
    await tx.session.deleteMany({
      where: {
        browserBinding: { browserId: { in: affected.map((g) => g.id) } },
      },
    });
    await tx.studentBrowser.updateMany({ where, data: { state: 'revoked' } });
    if (body.scope === 'credential')
      await tx.passkey.deleteMany({
        where: { credentialID: target!.credentialID! },
      });
    if (body.scope === 'all') {
      const student = await tx.student.findUniqueOrThrow({
        where: { id: studentId },
      });
      await tx.passkey.deleteMany({ where: { userId: student.userId } });
      await tx.session.deleteMany({ where: { userId: student.userId } });
    }
    await audit(
      tx,
      session!.user.id,
      studentId,
      `student-access-revoked-${body.scope}`,
    );
    return reply(200, { ok: true });
  }
  // No adult session may supply the registration identity or carry into student login.
  if (session) return reply(403);
  const url = new URL(request.url);
  if (path === '/passkey/generate-register-options') {
    if ([...url.searchParams.keys()].some((k) => k !== 'context'))
      return reply(400);
    await ceremonyGrant(
      tx,
      request.headers,
      true,
      url.searchParams.get('context'),
    );
  } else if (path === '/passkey/verify-registration') {
    if (!fields(body, ['response']) || !body.response) return reply(400);
    const grant = await browserGrant(tx, request.headers);
    await ceremonyGrant(tx, request.headers, true, grant?.id);
  } else {
    if (!fields(body, ['response'])) return reply(400);
    await ceremonyGrant(tx, request.headers, false);
  }
  return null;
}

/** Library persistence, activation and binding commit together or all roll back. */
export async function finishStudentCeremony(
  tx: Tx,
  request: Request,
  path: string,
  response: Response,
  verifiedSession: AuthSession,
) {
  if (!response.ok) return response;
  const grant = await browserGrant(tx, request.headers);
  if (!grant) throw new Error('MISSING_BROWSER_GRANT');
  if (path === '/passkey/verify-registration') {
    const student = await supervised(tx, grant);
    const key =
      grant.credentialID &&
      (await tx.passkey.findUnique({
        where: { credentialID: grant.credentialID },
      }));
    if (
      grant.state !== 'registering' ||
      !student ||
      !key ||
      key.userId !== student.userId
    )
      throw new Error('REGISTRATION_NOT_COMMITTED');
    await tx.studentBrowser.update({
      where: { id: grant.id },
      data: { state: 'active' },
    });
    await audit(tx, student.userId, student.id, 'student-passkey-registered');
    return reply(200, { ok: true });
  }
  if (path === '/passkey/verify-authentication') {
    const student = await supervised(tx, grant);
    if (
      !student ||
      !verifiedSession ||
      verifiedSession.user.id !== student.userId ||
      verifiedSession.user.principalKind !== 'student' ||
      grant.state !== 'active'
    )
      throw new Error('SESSION_BINDING_FAILED');
    await tx.studentSessionBinding.create({
      data: { sessionId: verifiedSession.session.id, browserId: grant.id },
    });
    await audit(
      tx,
      student.userId,
      student.id,
      'student-passkey-authenticated',
    );
    return Response.json({ ok: true }, { headers: response.headers });
  }
  // Force the browser prompt too; the verification hook is the security boundary.
  if (path === '/passkey/generate-authenticate-options') {
    const options = await response.json();
    return Response.json(
      {
        ...options,
        userVerification: 'required',
        ...(grant.credentialID
          ? {
              allowCredentials: [
                { id: grant.credentialID, type: 'public-key' },
              ],
            }
          : {}),
      },
      { headers: response.headers },
    );
  }
  return response;
}
