import 'server-only';
import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { hashPassword } from 'better-auth/crypto';
import { twoFactor } from 'better-auth/plugins';
import {
  browserGrant,
  studentPasskey,
  studentRoutes,
  studentRequest,
  finishStudentCeremony,
  studentIdentity,
} from './student-browser.ts';
import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import { localIdentityConfig, type LocalIdentityConfig } from './config.ts';
import type { IdentityActor } from '../../modules/identity/authorization.ts';
function validateConfig(config: LocalIdentityConfig) {
  localIdentityConfig({
    NEXO_LOCAL_IDENTITY: 'synthetic-only',
    DATABASE_URL: config.databaseUrl,
    BETTER_AUTH_URL: config.origin,
    BETTER_AUTH_SECRET: config.secret,
  });
}

type Transaction = Prisma.TransactionClient;
const error = (status: number) =>
  Response.json(
    { error: 'IDENTITY_REQUEST_DENIED' },
    { status, headers: { 'cache-control': 'no-store' } },
  );
// One local-family auth mutation at a time. Keeps library changes, revocation and
// audit atomic, including library endpoints with multiple adapter operations.
async function locked<T>(
  db: PrismaClient,
  work: (tx: Transaction) => Promise<T>,
) {
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(78210402)`;
      return work(tx);
    },
    { maxWait: 10_000, timeout: 20_000 },
  );
}
function audit(tx: Transaction, userId: string, event: string) {
  return tx.identityAudit.create({ data: { id: randomUUID(), userId, event } });
}
function authFor(tx: Transaction, config: LocalIdentityConfig) {
  return betterAuth({
    appName: 'nexo local synthetic identity',
    baseURL: config.origin,
    secret: config.secret,
    database: prismaAdapter(tx, { provider: 'postgresql', transaction: false }),
    trustedOrigins: [config.origin],
    logger: { disabled: true },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      requireEmailVerification: true,
      minPasswordLength: 16,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        if (
          (await tx.user.findUnique({ where: { id: user.id } }))
            ?.principalKind !== 'adult'
        )
          throw new Error('PRINCIPAL_DENIED');
        await tx.localAuthMessage.create({
          data: {
            id: randomUUID(),
            recipient: user.email,
            kind: 'reset-password',
            url,
          },
        });
      },
      onPasswordReset: async ({ user }) => {
        await tx.session.deleteMany({ where: { userId: user.id } });
        await tx.verification.deleteMany({ where: { value: user.id } });
        await audit(tx, user.id, 'password-recovered');
      },
    },
    emailVerification: {
      autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url }) => {
        await tx.localAuthMessage.create({
          data: {
            id: randomUUID(),
            recipient: user.email,
            kind: 'verify-email',
            url,
          },
        });
      },
    },
    user: {
      additionalFields: {
        principalKind: {
          type: 'string',
          required: true,
          defaultValue: 'adult',
          input: false,
        },
      },
    },
    session: {
      expiresIn: 12 * 60 * 60,
      updateAge: 60 * 60,
      cookieCache: { enabled: false },
      additionalFields: {
        mfaVerifiedAt: { type: 'date', required: false, input: false },
        recoveryVerifiedAt: { type: 'date', required: false, input: false },
      },
    },
    account: { accountLinking: { enabled: false } },
    advanced: {
      trustedProxyHeaders: false,
      ipAddress: { ipAddressHeaders: [] },
      cookiePrefix: 'nexo-local',
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        path: '/',
      },
    },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 40 },
    plugins: [
      studentPasskey(tx, config),
      twoFactor({
        issuer: 'nexo local synthetic identity',
        skipVerificationOnEnable: false,
        backupCodeOptions: { storeBackupCodes: 'encrypted' },
      }),
    ],
  });
}

/**
 * Session verification and protected work share the auth transaction lock.
 * Student operations use withStudentIdentity below; a generic library session
 * never supplies student or adult authority on its own.
 */
export async function withAdultIdentity(
  db: PrismaClient,
  config: LocalIdentityConfig,
  headers: Headers,
  work: (
    tx: Transaction,
    actor: IdentityActor & { kind: 'adult' },
  ) => Promise<Response>,
): Promise<Response> {
  validateConfig(config);
  return locked(db, async (tx) => {
    const session = await authFor(tx, config).api.getSession({ headers });
    if (
      !session ||
      session.user.principalKind !== 'adult' ||
      !session.user.emailVerified ||
      !session.user.twoFactorEnabled ||
      !session.session.mfaVerifiedAt ||
      new Date(session.session.mfaVerifiedAt).getTime() > Date.now()
    )
      return error(401);
    return work(tx, {
      kind: 'adult',
      userId: session.user.id,
      mfaVerifiedAt: new Date(session.session.mfaVerifiedAt),
    });
  });
}

/** Every protected student operation revalidates browser, credential, supervision and session. */
export async function withStudentIdentity(
  db: PrismaClient,
  config: LocalIdentityConfig,
  headers: Headers,
  work: (
    tx: Transaction,
    actor: IdentityActor & { kind: 'student' },
  ) => Promise<Response>,
): Promise<Response> {
  validateConfig(config);
  return locked(db, async (tx) => {
    const session = await authFor(tx, config).api.getSession({ headers });
    const actor = await studentIdentity(tx, headers, session);
    return actor ? work(tx, actor) : error(401);
  });
}

/** Trusted local operator entry point; deliberately not an HTTP endpoint. */
export async function bootstrapAdult(
  db: PrismaClient,
  config: LocalIdentityConfig,
  input: { email: string; name: string; password: string },
) {
  validateConfig(config);
  if (
    !/^[a-z0-9._+-]+@example\.invalid$/.test(input.email) ||
    !input.name.trim() ||
    input.name.length > 100 ||
    input.password.length < 16 ||
    input.password.length > 128
  )
    throw new Error('Synthetic adult input is invalid.');
  const password = await hashPassword(input.password);
  try {
    return await locked(db, async (tx) => {
      if ((await tx.identityBootstrap.count()) || (await tx.user.count()))
        throw new Error('Bootstrap unavailable.');
      const id = randomUUID();
      await tx.identityBootstrap.create({
        data: { id: 'initial-adult', userId: id },
      });
      await tx.user.create({
        data: {
          id,
          email: input.email,
          name: input.name,
          principalKind: 'adult',
          accounts: {
            create: {
              id: randomUUID(),
              providerId: 'credential',
              accountId: id,
              password,
            },
          },
        },
      });
      await audit(tx, id, 'adult-bootstrapped');
      return { userId: id };
    });
  } catch {
    throw new Error('Local identity bootstrap failed; no account was created.');
  }
}

const routes = new Map([
  ...studentRoutes,
  ['/recover-totp', 'POST'],
  ['/sign-in/email', 'POST'],
  ['/sign-out', 'POST'],
  ['/get-session', 'GET'],
  ['/portal-session', 'GET'],
  ['/send-verification-email', 'POST'],
  ['/verify-email', 'GET'],
  ['/request-password-reset', 'POST'],
  ['/reset-password', 'POST'],
  ['/two-factor/enable', 'POST'],
  ['/two-factor/verify-totp', 'POST'],
  ['/two-factor/verify-backup-code', 'POST'],
  ['/two-factor/generate-backup-codes', 'POST'],
]);
function responseCookies(request: Request, response: Response) {
  const cookies = new Map(
    request.headers
      .get('cookie')
      ?.split(';')
      .filter(Boolean)
      .map((v) => {
        const i = v.indexOf('=');
        return [v.slice(0, i).trim(), v.slice(i + 1)] as const;
      }),
  );
  for (const header of response.headers.getSetCookie()) {
    const pair = header.split(';')[0]!;
    const i = pair.indexOf('=');
    cookies.set(pair.slice(0, i), pair.slice(i + 1));
  }
  return new Headers({
    cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  });
}

/** Narrow HTTP surface; raw Better Auth handlers/APIs are never exported. */
export async function identityHandler(
  db: PrismaClient,
  config: LocalIdentityConfig,
  request: Request,
): Promise<Response> {
  try {
    validateConfig(config);
  } catch {
    return error(503);
  }
  const url = new URL(request.url);
  if (url.origin !== config.origin) return error(403);
  const path = url.pathname.slice('/api/auth'.length);
  // Library-owned password recovery link; token validity and callback origins stay with Better Auth.
  const resetCallback = /^\/reset-password\/[A-Za-z0-9_-]{1,256}$/.test(path);
  const method = resetCallback ? 'GET' : routes.get(path);
  if (!url.pathname.startsWith('/api/auth/') || !method) return error(404);
  if (method !== request.method) return error(405);
  let body: Record<string, unknown> = {};
  if (request.method === 'POST') {
    if (request.headers.get('origin') !== config.origin) return error(403);
    if (
      request.headers.get('content-type')?.split(';')[0] !== 'application/json'
    )
      return error(415);
    const reader = request.body?.getReader();
    if (!reader) return error(400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return error(413);
      }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    // Next wraps its incoming Request; Node's constructor cannot clone that proxy.
    // Reconstruct only after the existing bounded-body check.
    request = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: text,
    });
    try {
      body = JSON.parse(text);
      if (!body || typeof body !== 'object' || Array.isArray(body))
        return error(400);
    } catch {
      return error(400);
    }
    if (
      body.trustDevice ||
      body.disableSession ||
      body.mfaVerifiedAt ||
      body.recoveryVerifiedAt ||
      body.principalKind ||
      body.method === 'otp'
    )
      return error(400);
  }
  try {
    return await locked(db, async (tx) => {
      const auth = authFor(tx, config);
      const session = await auth.api.getSession({ headers: request.headers });
      if (path === '/portal-session') {
        if (
          url.search ||
          (request.headers.get('origin') !== config.origin &&
            request.headers.get('sec-fetch-site') !== 'same-origin')
        )
          return error(403);
        if (!session) return error(401);
        if (session.user.principalKind === 'student') {
          const student = await studentIdentity(tx, request.headers, session);
          return student
            ? Response.json(
                { role: 'student', name: student.displayName },
                { headers: { 'cache-control': 'no-store' } },
              )
            : error(401);
        }
        if (
          session.user.principalKind !== 'adult' ||
          !session.user.emailVerified
        )
          return error(401);
        if (!session.user.twoFactorEnabled)
          return Response.json(
            { role: 'setup' },
            { headers: { 'cache-control': 'no-store' } },
          );
        const proof =
          session.session.mfaVerifiedAt &&
          new Date(session.session.mfaVerifiedAt).getTime();
        if (!proof || proof > Date.now()) return error(401);
        return Response.json(
          {
            role: 'guardian',
            name: session.user.name,
            fresh: Date.now() - proof <= 300000,
            freshUntil: proof + 300000,
            operator: Boolean(
              await tx.identityBootstrap.findFirst({
                where: { userId: session.user.id },
              }),
            ),
          },
          { headers: { 'cache-control': 'no-store' } },
        );
      }
      if (studentRoutes.has(path)) {
        if (new URL(config.origin).hostname !== 'localhost') return error(503);
        if (
          request.headers.get('origin') !== config.origin &&
          !(
            request.method === 'GET' &&
            !request.headers.has('origin') &&
            request.headers.get('sec-fetch-site') === 'same-origin'
          )
        )
          return error(403);
        if (url.search && path !== '/passkey/generate-register-options')
          return error(400);
        const handled = await studentRequest(tx, request, path, body, session);
        if (handled) return handled;
        const before = await browserGrant(tx, request.headers);
        const result = await auth.handler(request);
        if (!result.ok) {
          const after = await browserGrant(tx, request.headers);
          if (before?.state !== after?.state)
            throw new Error('PASSKEY_WRITE_FAILED');
        }
        if (result.status >= 500) throw new Error('PASSKEY_TRANSACTION_FAILED');
        result.headers.set('cache-control', 'no-store');
        const verified =
          path === '/passkey/verify-authentication' && result.ok
            ? await auth.api.getSession({
                headers: responseCookies(request, result),
              })
            : null;
        return finishStudentCeremony(tx, request, path, result, verified);
      }
      if (
        session &&
        session.user.principalKind !== 'adult' &&
        path !== '/sign-out'
      )
        return error(403);
      if (path === '/sign-in/email' && typeof body.email === 'string') {
        const principal = await tx.user.findUnique({
          where: { email: body.email.toLowerCase() },
        });
        if (principal && principal.principalKind !== 'adult') return error(403);
      }
      if (path === '/get-session') {
        if (
          !session ||
          !session.user.twoFactorEnabled ||
          !session.session.mfaVerifiedAt
        )
          return error(401);
        return Response.json(
          {
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              principalKind: 'adult',
            },
            mfaVerifiedAt: session.session.mfaVerifiedAt,
          },
          { headers: { 'cache-control': 'no-store' } },
        );
      }
      if (
        path === '/two-factor/generate-backup-codes' &&
        (!session?.session.mfaVerifiedAt ||
          Date.now() - new Date(session.session.mfaVerifiedAt).getTime() >
            5 * 60_000)
      )
        return error(403);
      if (path === '/recover-totp') {
        if (
          !session?.session.recoveryVerifiedAt ||
          Date.now() - new Date(session.session.recoveryVerifiedAt).getTime() >
            5 * 60_000 ||
          typeof body.password !== 'string'
        )
          return error(403);
        // Both library operations commit together. There is no observable
        // password-only interval, nor a public factor-disabling endpoint.
        const disable = await auth.handler(
          new Request(`${config.origin}/api/auth/two-factor/disable`, {
            method: 'POST',
            headers: request.headers,
            body: JSON.stringify({ password: body.password }),
          }),
        );
        if (!disable.ok) return error(403);
        const headers = responseCookies(request, disable);
        headers.set('origin', config.origin);
        headers.set('content-type', 'application/json');
        const enable = await auth.handler(
          new Request(`${config.origin}/api/auth/two-factor/enable`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ password: body.password }),
          }),
        );
        if (!enable.ok) throw new Error('FACTOR_REPLACEMENT_FAILED');
        const pending = await auth.api.getSession({
          headers: responseCookies(
            new Request(request.url, { headers }),
            enable,
          ),
        });
        if (!pending) throw new Error('FACTOR_SESSION_MISSING');
        await tx.session.deleteMany({
          where: { userId: session.user.id, id: { not: pending.session.id } },
        });
        await tx.session.update({
          where: { id: pending.session.id },
          data: { mfaVerifiedAt: null, recoveryVerifiedAt: null },
        });
        await audit(tx, session.user.id, 'authenticator-replaced');
        const responseHeaders = new Headers(enable.headers);
        for (const cookie of disable.headers.getSetCookie())
          responseHeaders.append('set-cookie', cookie);
        responseHeaders.set('cache-control', 'no-store');
        return new Response(enable.body, {
          status: enable.status,
          headers: responseHeaders,
        });
      }
      const response = await auth.handler(request);
      if (response.status >= 500) throw new Error('AUTH_TRANSACTION_FAILED');
      response.headers.set('cache-control', 'no-store');
      if (
        response.ok &&
        (path === '/two-factor/verify-totp' ||
          path === '/two-factor/verify-backup-code')
      ) {
        const verified = await auth.api.getSession({
          headers: responseCookies(request, response),
        });
        if (
          !verified ||
          verified.user.principalKind !== 'adult' ||
          !verified.user.twoFactorEnabled
        )
          throw new Error('MFA_SESSION_MISSING');
        await tx.session.update({
          where: { id: verified.session.id },
          data: {
            mfaVerifiedAt: new Date(),
            recoveryVerifiedAt:
              path === '/two-factor/verify-backup-code' ? new Date() : null,
          },
        });
        if (path === '/two-factor/verify-backup-code') {
          await tx.session.deleteMany({
            where: {
              userId: verified.user.id,
              id: { not: verified.session.id },
            },
          });
          await tx.verification.deleteMany({
            where: { value: verified.user.id },
          });
          await audit(tx, verified.user.id, 'backup-code-recovery');
        } else await audit(tx, verified.user.id, 'totp-verified');
      }
      // Never put bearer session tokens into response JSON; only HttpOnly cookies.
      if (
        response.ok &&
        response.headers.get('content-type')?.includes('application/json')
      ) {
        const data = await response.json();
        if (data && typeof data === 'object') delete data.token;
        return Response.json(data, {
          status: response.status,
          headers: response.headers,
        });
      }
      response.headers.set('cache-control', 'no-store');
      return response;
    });
  } catch (cause) {
    if (cause instanceof APIError && cause.message === 'BROWSER_ACCESS_DENIED')
      return error(403);
    return error(503);
  }
}
