import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { expect as browserExpect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { chromium, type BrowserContext, type Page } from '@playwright/test';
vi.mock('server-only', () => ({}));
import { config, db, provision, Browser } from './helpers';
import { identityHandler } from '../../src/server/auth/service';
import { assignmentsHandler } from '../../src/server/practice/assignments';
import { randomUUID } from 'node:crypto';
import { studentsHandler } from '../../src/server/identity/students';

const originalOrigin = config.origin;
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/') {
      res.setHeader('content-type', 'text/html');
      res.end('<!doctype html><title>Synthetic D04 WebAuthn test</title>');
      return;
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers))
      if (value)
        headers.set(key, Array.isArray(value) ? value.join('; ') : value);
    const handler = req.url?.startsWith('/api/practice/')
      ? assignmentsHandler
      : identityHandler;
    const response = await handler(
      db,
      config,
      new Request(`${config.origin}${req.url}`, {
        method: req.method,
        headers,
        ...(body.length ? { body } : {}),
      }),
    );
    res.statusCode = response.status;
    for (const [key, value] of response.headers)
      if (key !== 'set-cookie') res.setHeader(key, value);
    res.setHeader('set-cookie', response.headers.getSetCookie());
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.statusCode = 500;
    res.end();
  }
});
let chromiumBrowser: Awaited<ReturnType<typeof chromium.launch>>;
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing test port');
  config.origin = `http://localhost:${address.port}`;
  chromiumBrowser = await chromium.launch({
    headless: process.env.NEXO_CONTENT_REHEARSAL !== '1',
  });
});
beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit", "StudentBrowser", "CoverageObjective", "ContentRubricVersion" CASCADE',
  );
});
afterAll(async () => {
  await chromiumBrowser?.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  config.origin = originalOrigin;
  await db.$disconnect();
});
async function student(guardian: Browser) {
  const response = await studentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/identity/students`, {
      method: 'POST',
      headers: {
        origin: config.origin,
        'content-type': 'application/json',
        cookie: [...guardian.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
      },
      body: JSON.stringify({ displayName: 'Synthetic learner' }),
    }),
  );
  expect(response.status).toBe(201);
  return (await response.json()).id as string;
}
async function pageBrowser() {
  const context = await chromiumBrowser.newContext();
  const page = await context.newPage();
  await page.goto(config.origin);
  const cdp = await context.newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  const { authenticatorId } = await cdp.send(
    'WebAuthn.addVirtualAuthenticator',
    {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
        automaticPresenceSimulation: true,
      },
    },
  );
  return { context, page, cdp, authenticatorId };
}
async function call(page: Page, path: string, body?: Record<string, unknown>) {
  return page.evaluate(
    async ({ path, body }) => {
      const response = await fetch(`/api/auth${path}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          origin: location.origin,
          ...(body ? { 'content-type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: response.status, data: await response.json() };
    },
    { path, body },
  );
}
async function register(page: Page, enrollmentId: string) {
  const options = await call(
    page,
    `/passkey/generate-register-options?context=${enrollmentId}`,
  );
  expect(options.status).toBe(200);
  const response = await page.evaluate(async (options) => {
    const decode = (s: string) =>
      Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
        c.charCodeAt(0),
      );
    options.challenge = decode(options.challenge);
    options.user.id = decode(options.user.id);
    options.excludeCredentials = options.excludeCredentials.map(
      (c: { id: string }) => ({ ...c, id: decode(c.id) }),
    );
    const credential = (await navigator.credentials.create({
      publicKey: options,
    })) as PublicKeyCredential;
    return credential.toJSON();
  }, options.data);
  return call(page, '/passkey/verify-registration', { response });
}
async function assertion(page: Page) {
  const options = await call(page, '/passkey/generate-authenticate-options');
  expect(options.status).toBe(200);
  return page.evaluate(async (options) => {
    const decode = (s: string) =>
      Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
        c.charCodeAt(0),
      );
    options.challenge = decode(options.challenge);
    if (options.allowCredentials)
      options.allowCredentials = options.allowCredentials.map(
        (c: { id: string }) => ({ ...c, id: decode(c.id) }),
      );
    const credential = (await navigator.credentials.get({
      publicKey: options,
    })) as PublicKeyCredential;
    return credential.toJSON();
  }, options.data);
}
async function approve(page: Page, guardian: Browser, studentId: string) {
  const enrollment = await call(page, '/student/enroll', {
    label: 'Synthetic tablet',
  });
  expect([200, 201], JSON.stringify(enrollment.data)).toContain(
    enrollment.status,
  );
  expect(
    (
      await guardian.call('/student/approve', {
        studentId,
        enrollmentId: enrollment.data.enrollmentId,
      })
    ).status,
  ).toBe(200);
  return enrollment.data.enrollmentId as string;
}
async function logout(page: Page) {
  expect((await call(page, '/sign-out', {})).status).toBe(200);
}
async function login(page: Page) {
  const response = await call(page, '/passkey/verify-authentication', {
    response: await assertion(page),
  });
  expect(response.status).toBe(200);
  expect(response.data).toEqual({ ok: true });
}
async function copyCookies(
  from: BrowserContext,
  to: BrowserContext,
  keep: (name: string) => boolean,
) {
  await to.addCookies((await from.cookies()).filter((c) => keep(c.name)));
}

describe('D04 PostgreSQL + Chromium virtual authenticator', () => {
  it('D05 returns only public assignment fields after real approved-browser login', async () => {
    const { browser: guardian } = await provision();
    const studentId = await student(guardian);
    const assignment = await assignmentsHandler(
      db,
      config,
      new Request(`${config.origin}/api/practice/assignments`, {
        method: 'POST',
        headers: {
          origin: config.origin,
          'content-type': 'application/json',
          cookie: [...guardian.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
        },
        body: JSON.stringify({ studentId, requestId: randomUUID() }),
      }),
    );
    expect(assignment.status).toBe(201);
    const { id } = await assignment.json();
    const { page, context } = await pageBrowser();
    try {
      const read = () =>
        page.evaluate(async (id) => {
          const response = await fetch(`/api/practice/assignments/${id}`);
          return { status: response.status, data: await response.json() };
        }, id);
      expect((await read()).status).toBe(401);
      await register(page, await approve(page, guardian, studentId));
      await login(page);
      const response = await read();
      expect(response.status).toBe(200);
      expect(response.data.items).toHaveLength(10);
      const presentationUrl = `${config.origin}/api/practice/assignments/${id}/presentation`;
      const validDraft = {
        action: 'draft',
        answer: '',
        expectedVersion: 0,
        expectedRevision: 0,
      };
      expect(
        (
          await page.request.post(presentationUrl, {
            headers: { origin: 'http://untrusted.invalid' },
            data: validDraft,
          })
        ).status(),
      ).toBe(403);
      expect(
        (
          await page.request.post(presentationUrl, {
            headers: { origin: config.origin },
            data: { ...validDraft, correct: true },
          })
        ).status(),
      ).toBe(400);
      expect(
        (
          await page.request.post(presentationUrl, {
            headers: { origin: config.origin },
            data: { ...validDraft, expectedVersion: -1 },
          })
        ).status(),
      ).toBe(400);
      expect(
        (
          await page.request.post(presentationUrl, {
            headers: { origin: config.origin },
            data: { ...validDraft, answer: '0'.repeat(65) },
          })
        ).status(),
      ).toBe(400);
      expect(
        (
          await page.request.get(`${config.origin}/api/practice/assignments`, {
            headers: { origin: config.origin },
          })
        ).status(),
      ).toBe(200);

      expect(Object.keys(response.data).sort()).toEqual([
        'category',
        'id',
        'items',
        'revision',
        'studentId',
        'subject',
      ]);
      for (const item of response.data.items)
        expect(Object.keys(item).sort()).toEqual([
          'id',
          'position',
          'prompt',
          'responseType',
        ]);
      const submit = (body: Record<string, unknown>) =>
        page.evaluate(
          async ({ id, body }) => {
            const response = await fetch(
              `/api/practice/assignments/${id}/attempts`,
              {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(body),
              },
            );
            return { status: response.status, data: await response.json() };
          },
          { id, body },
        );
      const input = {
        itemId: response.data.items[0].id,
        requestId: randomUUID(),
        expectedRevision: 0,
        answer: '0',
      };
      expect((await submit({ ...input, answer: '' })).status).toBe(400);
      expect((await submit({ ...input, correct: true })).status).toBe(400);
      const committed = await submit(input);
      expect(committed.status).toBe(200);
      expect(committed.data.correct).toBe(true);
      expect(committed.data.solution).toBeUndefined();
      expect(await submit(input)).toEqual(committed);
      const saved = await page.evaluate(async (id) => {
        const response = await fetch(
          `/api/practice/assignments/${id}/progress`,
        );
        return { status: response.status, data: await response.json() };
      }, id);
      expect(saved.status).toBe(200);
      expect(saved.data.lastSubmission).toEqual(committed.data);
      expect(saved.data.progress.revision).toBe(1);
      await guardian.call('/student/revoke', { studentId, scope: 'all' });
      expect((await read()).status).toBe(401);
      expect((await submit(input)).status).toBe(401);
    } finally {
      await context.close();
    }
  });

  it('enrolls, logs in independently, rejects copied credentials/cookies, revokes browsers and recovers', async () => {
    const { browser: guardian } = await provision();
    const studentId = await student(guardian);
    const first = await pageBrowser();
    const second = await pageBrowser();
    try {
      const id = await approve(first.page, guardian, studentId);
      expect((await call(first.page, '/student/session')).status).toBe(401);
      expect((await register(first.page, id)).status).toBe(200);
      expect((await call(first.page, '/student/session')).status).toBe(401);
      await login(first.page);
      expect((await call(first.page, '/student/session')).data).toEqual({
        student: { id: studentId, displayName: 'Synthetic learner' },
      });
      expect((await call(first.page, '/get-session')).status).toBe(403);
      const { credentials } = await first.cdp.send('WebAuthn.getCredentials', {
        authenticatorId: first.authenticatorId,
      });
      await second.cdp.send('WebAuthn.addCredential', {
        authenticatorId: second.authenticatorId,
        credential: credentials[0]!,
      });
      expect(
        (await call(second.page, '/passkey/generate-authenticate-options'))
          .status,
      ).not.toBe(200);
      await copyCookies(first.context, second.context, (name) =>
        name.includes('session_token'),
      );
      expect((await call(second.page, '/student/session')).status).toBe(401);
      await second.context.clearCookies();
      const secondId = await approve(second.page, guardian, studentId);
      await login(second.page); // Same synced key still needs its own guardian approval.
      expect(
        (
          await guardian.call('/student/revoke', {
            studentId,
            browserId: id,
            scope: 'browser',
          })
        ).status,
      ).toBe(200);
      expect((await call(first.page, '/student/session')).status).toBe(401);
      expect((await call(second.page, '/student/session')).status).toBe(200);
      expect(
        (
          await guardian.call('/student/revoke', {
            studentId,
            browserId: secondId,
            scope: 'credential',
          })
        ).status,
      ).toBe(200);
      expect((await call(second.page, '/student/session')).status).toBe(401);
      await second.context.clearCookies();
      const recovery = await approve(second.page, guardian, studentId);
      expect((await register(second.page, recovery)).status).toBe(200);
      await login(second.page);
      expect(
        (await db.student.findUnique({ where: { id: studentId } }))?.id,
      ).toBe(studentId);
      await logout(second.page);
      const pendingLogin = await assertion(second.page);
      const raced = await Promise.all([
        call(second.page, '/passkey/verify-authentication', {
          response: pendingLogin,
        }),
        guardian.call('/student/revoke', { studentId, scope: 'all' }),
      ]);
      expect([200, 403]).toContain(raced[0].status);
      expect(raced[1].status).toBe(200);
      expect(await db.studentSessionBinding.count()).toBe(0);
      expect((await call(second.page, '/student/session')).status).toBe(401);
    } finally {
      await first.context.close();
      await second.context.close();
    }
  }, 60_000);

  it('requires user verification, prevents replay, expires idle sessions and denies orphan sessions', async () => {
    const { browser: guardian } = await provision();
    const studentId = await student(guardian);
    const browser = await pageBrowser();
    try {
      const id = await approve(browser.page, guardian, studentId);
      await browser.cdp.send('WebAuthn.setResponseOverrideBits', {
        authenticatorId: browser.authenticatorId,
        isBadUV: true,
      });
      // Override the client prompt to preferred to obtain an actual signed UV=false response.
      await browser.page.evaluate(() => {
        const create = navigator.credentials.create.bind(navigator.credentials);
        navigator.credentials.create = (options) => {
          if (options?.publicKey?.authenticatorSelection)
            options.publicKey.authenticatorSelection.userVerification =
              'preferred';
          return create(options);
        };
        const get = navigator.credentials.get.bind(navigator.credentials);
        navigator.credentials.get = (options) => {
          if (options?.publicKey)
            options.publicKey.userVerification = 'discouraged';
          return get(options);
        };
      });
      expect((await register(browser.page, id)).status).not.toBe(200);
      expect(await db.passkey.count()).toBe(0);
      await browser.cdp.send('WebAuthn.setResponseOverrideBits', {
        authenticatorId: browser.authenticatorId,
      });
      await browser.cdp.send('WebAuthn.setUserVerified', {
        authenticatorId: browser.authenticatorId,
        isUserVerified: true,
      });
      expect((await register(browser.page, id)).status).toBe(200);
      await browser.cdp.send('WebAuthn.setUserVerified', {
        authenticatorId: browser.authenticatorId,
        isUserVerified: false,
      });
      expect(
        (
          await call(browser.page, '/passkey/verify-authentication', {
            response: await assertion(browser.page),
          })
        ).status,
      ).not.toBe(200);
      expect(await db.studentSessionBinding.count()).toBe(0);
      await browser.cdp.send('WebAuthn.setUserVerified', {
        authenticatorId: browser.authenticatorId,
        isUserVerified: true,
      });
      await browser.page.reload(); // Restore required UV after the deliberately downgraded prompt.
      const signed = await assertion(browser.page);
      expect(
        (
          await call(browser.page, '/passkey/verify-authentication', {
            response: signed,
          })
        ).status,
      ).toBe(200);
      await logout(browser.page);
      expect(
        (
          await call(browser.page, '/passkey/verify-authentication', {
            response: signed,
          })
        ).status,
      ).not.toBe(200);
      await login(browser.page);
      await db.studentSessionBinding.updateMany({
        data: { lastSeen: new Date(Date.now() - 31 * 60_000) },
      });
      expect((await call(browser.page, '/student/session')).status).toBe(401);
      await logout(browser.page);
      await login(browser.page);
      await db.studentSessionBinding.deleteMany();
      expect((await call(browser.page, '/student/session')).status).toBe(401);
    } finally {
      await browser.context.close();
    }
  }, 60_000);

  it('serializes approval, denies cross-family/stale MFA, expired and mismatched browser enrollments', async () => {
    const { browser: guardian } = await provision();
    const studentId = await student(guardian);
    const browser = new Browser();
    const pending = await (
      await browser.call('/student/enroll', { label: 'Synthetic tablet' })
    ).json();
    const input = { studentId, enrollmentId: pending.enrollmentId };
    expect((await browser.call('/student/approve', input)).status).toBe(404);
    const results = await Promise.all([
      guardian.call('/student/approve', input),
      guardian.call('/student/approve', input),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(
      (
        await new Browser().call(
          `/passkey/generate-register-options?context=${pending.enrollmentId}`,
        )
      ).status,
    ).not.toBe(200);
    expect(
      (await browser.call('/passkey/generate-register-options?context=wrong'))
        .status,
    ).not.toBe(200);
    await db.studentBrowser.updateMany({
      data: { enrollExpires: new Date(0) },
    });
    expect(
      (
        await browser.call(
          `/passkey/generate-register-options?context=${pending.enrollmentId}`,
        )
      ).status,
    ).not.toBe(200);
    const user = await db.user.findFirstOrThrow({
      where: { principalKind: 'adult' },
    });
    await db.guardianStudent.updateMany({ data: { revokedAt: new Date() } });
    expect(
      (await guardian.call('/student/revoke', { studentId, scope: 'all' }))
        .status,
    ).toBe(404);
    await db.guardianStudent.updateMany({ data: { revokedAt: null } });
    await db.session.updateMany({
      where: { userId: user.id },
      data: { mfaVerifiedAt: new Date(Date.now() - 6 * 60_000) },
    });
    expect(
      (await guardian.call('/student/revoke', { studentId, scope: 'all' }))
        .status,
    ).toBe(404);
  });

  it('keeps student authority narrow and validates origin, input, management capability and throttling', async () => {
    const { browser: guardian } = await provision();
    const studentId = await student(guardian);
    const browser = new Browser();
    for (const path of [
      '/passkey/delete-passkey',
      '/passkey/update-passkey',
      '/passkey/list-user-passkeys',
    ]) {
      expect((await browser.call(path, {})).status).toBe(404);
    }
    expect(
      (await browser.call('/student/enroll', { label: 'Tablet', studentId }))
        .status,
    ).toBe(400);
    const hostile = await identityHandler(
      db,
      config,
      new Request(`${config.origin}/api/auth/student/enroll`, {
        method: 'POST',
        headers: {
          origin: 'https://other.invalid',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ label: 'Tablet' }),
      }),
    );
    expect(hostile.status).toBe(403);
    const pending = await (
      await browser.call('/student/enroll', { label: 'Tablet' })
    ).json();
    expect(
      (
        await (
          await browser.call('/student/enroll', { label: 'Tablet' })
        ).json()
      ).enrollmentId,
    ).toBe(pending.enrollmentId);
    const input = { studentId, enrollmentId: pending.enrollmentId };
    await db.guardianStudent.updateMany({ data: { canManage: false } });
    expect((await guardian.call('/student/approve', input)).status).toBe(404);
    await db.guardianStudent.updateMany({ data: { canManage: true } });
    const foreign = await db.user.create({
      data: {
        id: 'foreign-student',
        name: 'Synthetic',
        email: 'foreign@example.invalid',
        principalKind: 'student',
        studentProfile: {
          create: { id: 'foreign-profile', displayName: 'Synthetic' },
        },
      },
    });
    expect(foreign.principalKind).toBe('student');
    expect(
      (
        await guardian.call('/student/approve', {
          ...input,
          studentId: 'foreign-profile',
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await guardian.call('/student/revoke', {
          studentId: 'foreign-profile',
          scope: 'all',
        })
      ).status,
    ).toBe(404);
    await db.session.updateMany({
      data: { mfaVerifiedAt: new Date(Date.now() + 60_000) },
    });
    expect((await guardian.call('/student/approve', input)).status).toBe(404);
    for (let index = 1; index < 20; index++)
      expect(
        (await new Browser().call('/student/enroll', { label: 'Tablet' }))
          .status,
      ).toBe(201);
    expect(
      (await new Browser().call('/student/enroll', { label: 'Tablet' })).status,
    ).toBe(429);
  });

  it('rolls credential, challenge, grant and session writes back on audit failure, then retries safely', async () => {
    const { browser: guardian } = await provision();
    const studentId = await student(guardian);
    const browser = await pageBrowser();
    try {
      const id = await approve(browser.page, guardian, studentId);
      await db.$executeRawUnsafe(
        `ALTER TABLE "IdentityAudit" ADD CONSTRAINT d04_fail CHECK (event NOT IN ('student-passkey-registered','student-passkey-authenticated'))`,
      );
      expect((await register(browser.page, id)).status).toBe(503);
      expect(await db.passkey.count()).toBe(0);
      await browser.cdp.send('WebAuthn.setResponseOverrideBits', {
        authenticatorId: browser.authenticatorId,
      });
      expect(
        (await db.studentBrowser.findUniqueOrThrow({ where: { id } })).state,
      ).toBe('approved');
      await db.$executeRawUnsafe(
        'ALTER TABLE "IdentityAudit" DROP CONSTRAINT d04_fail',
      );
      expect((await register(browser.page, id)).status).toBe(200);
      await db.$executeRawUnsafe(
        `ALTER TABLE "IdentityAudit" ADD CONSTRAINT d04_fail CHECK (event <> 'student-passkey-authenticated')`,
      );
      const retryable = await assertion(browser.page);
      expect(
        (
          await call(browser.page, '/passkey/verify-authentication', {
            response: retryable,
          })
        ).status,
      ).toBe(503);
      expect(await db.studentSessionBinding.count()).toBe(0);
      expect(
        await db.session.count({
          where: { user: { principalKind: 'student' } },
        }),
      ).toBe(0);
      await db.$executeRawUnsafe(
        'ALTER TABLE "IdentityAudit" DROP CONSTRAINT d04_fail',
      );
      expect(
        (
          await call(browser.page, '/passkey/verify-authentication', {
            response: retryable,
          })
        ).status,
      ).toBe(200);
      expect((await call(browser.page, '/student/session')).status).toBe(200);
    } finally {
      await db.$executeRawUnsafe(
        'ALTER TABLE "IdentityAudit" DROP CONSTRAINT IF EXISTS d04_fail',
      );
      await browser.context.close();
    }
  }, 60_000);
});

if (process.env.NEXO_TEST_BUILT === '1')
  it('D07 built saved journey: passkey, draft, lost response, reopen, restart, tabs and result', async () => {
    const port = new URL(config.origin).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    let child: ChildProcess | undefined;
    async function start() {
      child = spawn(process.execPath, ['.next/standalone/server.js'], {
        env: {
          ...process.env,
          PORT: port,
          HOSTNAME: '127.0.0.1',
          BETTER_AUTH_URL: config.origin,
        },
        stdio: 'ignore',
      });
      for (let i = 0; i < 100; i++) {
        try {
          if ((await fetch(config.origin)).ok) return;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error('Built server unavailable');
    }
    async function stop() {
      if (child) {
        const stopped = new Promise<void>((resolve) =>
          child!.once('exit', () => resolve()),
        );
        child.kill();
        await stopped;
        child = undefined;
      }
    }
    let context: BrowserContext | undefined;
    try {
      await start();
      const { browser: guardian } = await provision();
      const studentId = await student(guardian);
      const created = await assignmentsHandler(
        db,
        config,
        new Request(`${config.origin}/api/practice/assignments`, {
          method: 'POST',
          headers: {
            origin: config.origin,
            'content-type': 'application/json',
            cookie: [...guardian.cookies]
              .map(([k, v]) => `${k}=${v}`)
              .join('; '),
          },
          body: JSON.stringify({ studentId, requestId: randomUUID() }),
        }),
      );
      const { id } = await created.json();
      const browser = await pageBrowser();
      context = browser.context;
      let page = browser.page;
      await register(page, await approve(page, guardian, studentId));
      await page.goto(`${config.origin}/student`);
      await page
        .getByRole('button', { name: 'Aanmelden', exact: true })
        .click();
      await browserExpect(
        page.getByRole('heading', { name: 'Jouw taken' }),
      ).toBeVisible();
      await page.getByRole('button', { name: /^Start taak:/ }).click();
      await browserExpect(page.getByRole('textbox')).toBeVisible();
      expect(page.url()).toBe(`${config.origin}/student/assignments/${id}`);
      await browserExpect(page.locator('svg[data-pose]')).toHaveAttribute(
        'data-ready',
        'true',
      );
      const forbidden =
        /synthetic-addition-seed-v1|counting-oracle-v1|addition-digits-v1|integer-exact-v1|normalizedAnswer|requestHash/;
      const html = await page.request.get(page.url());
      const rsc = await page.request.get(page.url(), { headers: { RSC: '1' } });
      expect(await html.text()).not.toMatch(forbidden);
      expect(await rsc.text()).not.toMatch(forbidden);
      for (const src of await page
        .locator('script[src]')
        .evaluateAll((nodes) =>
          nodes.map((node) => (node as HTMLScriptElement).src),
        )) {
        expect(await (await page.request.get(src)).text()).not.toMatch(
          forbidden,
        );
      }

      const errors: string[] = [];
      const watch = (page: Page) => {
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (
            message.type() === 'error' &&
            !message.text().startsWith('Failed to load resource:')
          )
            errors.push(message.text());
        });
      };
      watch(page);
      await browserExpect(
        page.getByRole('link', { name: '← Mijn taken' }),
      ).toHaveAttribute('href', '/student');
      await page.getByRole('textbox').fill('000');
      await browserExpect(
        page.getByRole('status').filter({ hasText: 'nog niet opgeslagen' }),
      ).toBeVisible();
      await page.route('**/presentation', (route) => route.abort());
      await page.getByRole('button', { name: 'Bewaar concept' }).click();
      await browserExpect(
        page.getByRole('status').filter({ hasText: 'Opslaan niet bevestigd' }),
      ).toBeVisible();
      expect(await db.practiceAttempt.count()).toBe(0);
      await page.unroute('**/presentation');
      await page.getByRole('button', { name: 'Bewaar concept' }).click();
      await browserExpect(
        page.getByRole('status').filter({ hasText: 'Concept opgeslagen' }),
      ).toBeVisible();
      const persistedCookies = await context.storageState();
      await context.close();
      await chromiumBrowser.close();
      chromiumBrowser = await chromium.launch();
      context = await chromiumBrowser.newContext({
        storageState: persistedCookies,
      });
      page = await context.newPage();
      watch(page);
      await page.goto(`${config.origin}/student/assignments/${id}`);
      await browserExpect(page.getByRole('textbox')).toHaveValue('000');
      await page.route('**/attempts', async (route) => {
        await route.fetch();
        await route.abort();
      });
      await page.getByRole('button', { name: 'Controleer antwoord' }).click();
      await browserExpect(
        page.getByRole('status').filter({ hasText: 'Opslaan niet bevestigd' }),
      ).toBeVisible();
      expect(await db.practiceAttempt.count()).toBe(1);
      await page.unroute('**/attempts');
      await page.getByRole('button', { name: 'Controleer antwoord' }).click();
      await browserExpect(
        page.getByText('✓ Goed!', { exact: true }),
      ).toBeVisible();
      expect(await db.practiceAttempt.count()).toBe(1);
      await stop();
      await start();
      await page.reload();
      await browserExpect(
        page.getByText('✓ Goed!', { exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Verder', exact: true }).click();
      await browserExpect(page.getByRole('textbox')).toHaveValue('');
      await page.reload();
      await browserExpect(
        page.getByRole('heading', { level: 2 }),
      ).toContainText('1 + 3');
      const tab = await context.newPage();
      await tab.goto(page.url());
      await browserExpect(tab.getByRole('textbox')).toBeVisible();
      await page.getByRole('textbox').fill('4');
      await page.getByRole('button', { name: 'Bewaar concept' }).click();
      await browserExpect(
        page.getByRole('status').filter({ hasText: 'Concept opgeslagen' }),
      ).toBeVisible();
      await tab.getByRole('textbox').fill('999');
      await tab.getByRole('button', { name: 'Bewaar concept' }).click();
      await browserExpect(
        tab.getByRole('status').filter({ hasText: 'elders gewijzigd' }),
      ).toBeVisible();
      await browserExpect(tab.getByRole('textbox')).toHaveValue('4');
      await tab.close();
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 950 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: `/tmp/nexo-d07-${width}.png`,
          fullPage: true,
        });
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      const items = await db.assignmentItem.findMany({
        where: { assignmentId: id },
        orderBy: { position: 'asc' },
        include: { question: true },
      });
      for (let i = 1; i < items.length; i++) {
        await page
          .getByRole('textbox')
          .fill(i === 3 || i === 8 ? '999' : items[i]!.question!.answer);
        await page.getByRole('button', { name: 'Controleer antwoord' }).click();
        await browserExpect(
          page.getByRole('button', { name: 'Verder', exact: true }),
        ).toBeVisible();
        await page.getByRole('button', { name: 'Verder', exact: true }).click();
        await browserExpect(
          page.getByRole('button', { name: 'Controleer antwoord' }),
        ).toBeVisible();
      }
      for (const [i, answer] of [
        [3, '12'],
        [8, '999'],
      ] as const) {
        await browserExpect(
          page.getByRole('heading', { level: 2 }),
        ).toContainText(items[i]!.question!.prompt);
        await page.getByRole('textbox').fill(answer);
        await page.getByRole('button', { name: 'Controleer antwoord' }).click();
        await browserExpect(
          page.getByRole('button', { name: 'Verder', exact: true }),
        ).toBeVisible();
        if (i === 8)
          await browserExpect(
            page.getByText('Het juiste antwoord is 12', { exact: false }),
          ).toBeVisible();
        await page.getByRole('button', { name: 'Verder', exact: true }).click();
        if (i === 3)
          await browserExpect(
            page.getByRole('button', { name: 'Controleer antwoord' }),
          ).toBeVisible();
      }
      await browserExpect(
        page.getByText('9 van de 10', { exact: false }).first(),
      ).toBeVisible();
      await page.reload();
      await browserExpect(
        page.getByText('9 van de 10', { exact: false }).first(),
      ).toBeVisible();
      expect(await db.practiceAttempt.count()).toBe(12);
      expect(errors).toEqual([]);
      // D08 reads the actual student browser's committed work through an independent guardian session.
      const guardianContext = await chromiumBrowser.newContext();
      try {
        await guardianContext.addCookies(
          [...guardian.cookies].map(([name, value]) => ({
            name,
            value,
            url: config.origin,
          })),
        );
        const guardianPage = await guardianContext.newPage();
        const guardianErrors: string[] = [];
        guardianPage.on('pageerror', (e) => guardianErrors.push(e.message));
        await guardianPage.goto(`${config.origin}/guardian/results`);
        await browserExpect(
          guardianPage.getByRole('button', { name: /^Bekijk sessie:/ }),
        ).toBeVisible();
        await guardianPage
          .getByRole('button', { name: /^Bekijk sessie:/ })
          .press('Enter');
        await browserExpect(
          guardianPage.getByRole('heading', { level: 1 }),
        ).toBeFocused();
        await browserExpect(
          guardianPage.getByText('8,5 / 10', { exact: true }),
        ).toBeVisible();
        await browserExpect(
          guardianPage.getByText('9 / 10', { exact: true }),
        ).toBeVisible();
        await guardianPage.getByText('Vraag 4', { exact: true }).click();
        await browserExpect(
          guardianPage
            .locator('details[open]')
            .getByText('Eerste poging · Niet goed', { exact: true }),
        ).toBeVisible();
        await browserExpect(
          guardianPage.getByText('Tweede poging · Goed', { exact: true }),
        ).toBeVisible();
        expect(await guardianPage.getByRole('textbox').count()).toBe(0);
        expect(
          await guardianPage
            .getByRole('button', { name: /leerlingpreview/i })
            .count(),
        ).toBe(0);
        for (const width of [390, 1280]) {
          await guardianPage.setViewportSize({ width, height: 900 });
          expect(
            await guardianPage.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          expect(
            (await new AxeBuilder({ page: guardianPage }).analyze()).violations,
          ).toEqual([]);
          await guardianPage.screenshot({
            path: `/tmp/nexo-d08-guardian-${width}.png`,
            fullPage: true,
          });
        }
        // Student credentials must never unlock the guardian API.
        expect(
          (
            await page.request.get(`${config.origin}/api/guardian/results`, {
              headers: { origin: config.origin },
            })
          ).status(),
        ).toBe(401);
        await db.guardianStudent.updateMany({
          where: { studentId },
          data: { canView: false },
        });
        await guardianPage.reload();
        await browserExpect(
          guardianPage.getByText('Nog geen sessie om te bekijken'),
        ).toBeVisible();
        await browserExpect(
          guardianPage.getByText('8,5 / 10', { exact: true }),
        ).toHaveCount(0);
        await db.guardianStudent.updateMany({
          where: { studentId },
          data: { canView: true },
        });
        expect(guardianErrors).toEqual([]);
      } finally {
        await guardianContext.close();
      }

      await guardian.call('/student/revoke', { studentId, scope: 'all' });
      await page.reload();
      await browserExpect(
        page.getByRole('button', { name: 'Aanmelden', exact: true }),
      ).toBeVisible();
      await browserExpect(page.getByRole('textbox')).toHaveCount(0);
    } finally {
      await context?.close();
      await stop();
      await new Promise<void>((resolve) =>
        server.listen(Number(port), '127.0.0.1', resolve),
      );
    }
  }, 120_000);

if (process.env.NEXO_TEST_BUILT === '1')
  it(
    'D14-S4/D15 built published-content journey: review, assign, reopen, guardian result and withdrawal',
    async () => {
      const port = new URL(config.origin).port;
      await new Promise<void>((resolve) => server.close(() => resolve()));
      let child: ChildProcess | undefined;
      let learner: BrowserContext | undefined;
      let guardianContext: BrowserContext | undefined;
      async function start() {
        child = spawn(process.execPath, ['.next/standalone/server.js'], {
          env: {
            ...process.env,
            PORT: port,
            HOSTNAME: '127.0.0.1',
            BETTER_AUTH_URL: config.origin,
          },
          stdio: 'ignore',
        });
        for (let i = 0; i < 100; i++) {
          try {
            if ((await fetch(config.origin)).ok) return;
          } catch {}
          await new Promise((r) => setTimeout(r, 100));
        }
        throw new Error('Built content server unavailable');
      }
      async function stop() {
        if (child) {
          const exited = new Promise<void>((r) =>
            child!.once('exit', () => r()),
          );
          child.kill();
          await exited;
          child = undefined;
        }
      }
      try {
        await start();
        const { browser: guardian } = await provision();
        const studentId = await student(guardian);
        guardianContext = await chromiumBrowser.newContext();
        await guardianContext.addCookies(
          [...guardian.cookies].map(([name, value]) => ({
            name,
            value,
            url: config.origin,
          })),
        );
        const gp = await guardianContext.newPage();
        gp.setDefaultTimeout(12000);
        const errors: string[] = [];
        gp.on('pageerror', (e) => errors.push(e.message));
        await gp.goto(`${config.origin}/guardian/content/supply`);
        await gp.getByRole('spinbutton').fill('2');
        await gp
          .getByRole('button', { name: 'Kleine set voorbereiden' })
          .click();
        await browserExpect(
          gp.getByText('Weekvoorraad opgeslagen.', { exact: false }),
        ).toBeVisible();
        await gp.goto(`${config.origin}/guardian/content/supply/review`);
        for (const decision of ['approve', 'publish']) {
          // Inspect and select both full versioned review cards, including their private rubric/key.
          for (let i = 0; i < 2; i++) {
            if (
              i === 0 &&
              (await gp
                .getByRole('button', { name: 'Vorige', exact: true })
                .isEnabled())
            )
              await gp
                .getByRole('button', { name: 'Vorige', exact: true })
                .click();
            await gp.getByRole('checkbox', { name: /^Selecteer / }).check();
            if (i === 0)
              await gp
                .getByRole('button', { name: 'Volgende oefening', exact: true })
                .click();
          }
          await gp
            .getByRole('button', { name: /Beslis over selectie \(2\)/ })
            .click();
          if (decision === 'approve')
            await gp
              .getByLabel('Beoordelingsnotitie (optioneel)')
              .fill(
                'Synthetische geïntegreerde browsertest; geen echte educatieve goedkeuring.',
              );
          await gp
            .getByRole('checkbox', {
              name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
            })
            .check();
          await gp
            .getByRole('button', {
              name:
                decision === 'approve'
                  ? 'Selectie goedkeuren'
                  : 'Goedgekeurde selectie publiceren',
              exact: true,
            })
            .click();
          await browserExpect(
            gp.getByText(
              decision === 'approve'
                ? 'Versie 1 · Goedgekeurd'
                : 'Versie 1 · Gepubliceerd voor lokale proef',
              { exact: true },
            ),
          ).toBeVisible();
        }
        await gp.goto(`${config.origin}/guardian/content/assignments`);
        await gp.getByRole('spinbutton').fill('2');
        let lostAssignmentResponse = false;
        await gp.route('**/api/practice/assignments', async (route) => {
          if (route.request().method() === 'POST' && !lostAssignmentResponse) {
            lostAssignmentResponse = true;
            const committed = await route.fetch();
            expect(committed.status()).toBe(201);
            await route.abort('failed');
          } else await route.continue();
        });
        await gp
          .getByRole('button', { name: 'Sessie klaarzetten', exact: true })
          .click();
        await browserExpect(
          gp
            .getByRole('alert')
            .filter({ hasText: 'Toewijzing niet bevestigd' }),
        ).toBeVisible();
        await gp.reload();
        await browserExpect(gp.getByRole('spinbutton')).toHaveValue('2');
        await gp
          .getByRole('button', { name: 'Sessie klaarzetten', exact: true })
          .click();
        await browserExpect(gp.getByRole('status')).toContainText(
          'Sessie opgeslagen.',
        );
        const assignment = await db.assignment.findFirstOrThrow({
          where: { studentId },
        });
        const items = await db.assignmentItem.findMany({
          where: { assignmentId: assignment.id },
          orderBy: { position: 'asc' },
          include: { content: true },
        });
        expect(items.every((i) => i.contentVersionId !== null)).toBe(true);
        const key = (index: number) =>
          JSON.parse(items[index]!.content!.snapshot).payload.privateEvaluation
            .acceptedAnswers[0] as string;
        const browser = await pageBrowser();
        learner = browser.context;
        let page = browser.page;
        page.on('pageerror', (e) => errors.push(e.message));
        await register(page, await approve(page, guardian, studentId));
        await page.goto(`${config.origin}/student`);
        await page
          .getByRole('button', { name: 'Aanmelden', exact: true })
          .click();
        await browserExpect(
          page.getByRole('heading', { name: 'Jouw taken' }),
        ).toBeVisible();
        await page.getByRole('button', { name: /^Start taak:/ }).click();
        await page.getByRole('textbox').fill(key(0));
        await page.getByRole('button', { name: 'Bewaar concept' }).click();
        await browserExpect(
          page.getByText('Concept opgeslagen.', { exact: false }),
        ).toBeVisible();
        const storage = await learner.storageState();
        await learner.close();
        learner = undefined;
        await stop();
        await start();
        learner = await chromiumBrowser.newContext({ storageState: storage });
        page = await learner.newPage();
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(
          `${config.origin}/student/assignments/${assignment.id}`,
        );
        await browserExpect(page.getByRole('textbox')).toHaveValue(key(0));
        const html = await (await page.request.get(page.url())).text();
        const rsc = await (
          await page.request.get(page.url(), { headers: { RSC: '1' } })
        ).text();
        const forbidden =
          /privateEvaluation|acceptedAnswers|gradingRules|d14-optellen-local-v1|spelling-doubling-v1|integer-exact-v1/;
        expect(html).not.toMatch(forbidden);
        expect(rsc).not.toMatch(forbidden);
        for (const src of await page
          .locator('script[src]')
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLScriptElement).src),
          ))
          expect(await (await page.request.get(src)).text()).not.toMatch(
            forbidden,
          );
        for (let index = 0; index < 2; index++) {
          await page.getByRole('textbox').fill(key(index));
          await page
            .getByRole('button', { name: 'Controleer antwoord' })
            .click();
          await browserExpect(
            page.getByText('✓ Goed!', { exact: true }),
          ).toBeVisible();
          await page
            .getByRole('button', { name: 'Verder', exact: true })
            .click();
        }
        await browserExpect(
          page.getByRole('heading', { name: 'Taak klaar!', exact: true }),
        ).toBeVisible();
        await gp.goto(`${config.origin}/guardian/results`);
        await gp.getByRole('button', { name: /^Bekijk sessie:/ }).click();
        await browserExpect(
          gp.getByText('2 / 2', { exact: true }).first(),
        ).toBeVisible();
        const before = await db.practiceAttempt.findMany({
          where: { assignmentId: assignment.id },
          orderBy: { sequence: 'asc' },
        });
        await gp.goto(`${config.origin}/guardian/content/assignments`);
        const details = gp.locator('details').filter({
          has: gp.locator('summary', {
            hasText: JSON.parse(items[0]!.content!.snapshot).payload.learner
              .prompt,
          }),
        });
        await details.locator('summary').click();
        await details
          .getByLabel('Toelichting voor de ouder')
          .fill('Synthetische intrekking: uitleg opnieuw beoordelen.');
        await details
          .getByRole('button', { name: 'Versie intrekken en sessies pauzeren' })
          .click();
        await browserExpect(gp.getByRole('status')).toContainText(
          'Versie ingetrokken.',
        );
        await details
          .getByRole('button', { name: 'Bekijk betrokken sessies' })
          .click();
        await browserExpect(
          gp.getByRole('region', { name: 'Betrokken sessies' }),
        ).toContainText('1 bewaarde pogingen');
        await gp.reload();
        await gp.getByRole('spinbutton').fill('2');
        await gp
          .getByRole('button', { name: 'Sessie klaarzetten', exact: true })
          .click();
        await browserExpect(
          gp.getByRole('alert').filter({ hasText: 'Er ontbreken' }),
        ).toContainText('Er ontbreken 2');
        expect(await db.assignment.count()).toBe(1);
        await page.reload();
        await browserExpect(
          page.getByRole('heading', { name: 'Deze taak is gepauzeerd' }),
        ).toBeVisible();
        await browserExpect(page.getByRole('textbox')).toHaveCount(0);
        await gp.goto(`${config.origin}/guardian/results`);
        await gp.getByRole('button', { name: /^Bekijk sessie:/ }).click();
        await browserExpect(
          gp.getByText('Inhoud ingetrokken · resultaat niet gebruiken', {
            exact: true,
          }),
        ).toBeVisible();
        await browserExpect(
          gp.getByText('Gewogen score', { exact: true }),
        ).toHaveCount(0);
        expect(
          await db.practiceAttempt.findMany({
            where: { assignmentId: assignment.id },
            orderBy: { sequence: 'asc' },
          }),
        ).toEqual(before);
        for (const width of [390, 1280]) {
          await gp.setViewportSize({ width, height: 900 });
          expect(
            await gp.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          ).toBe(true);
          expect(
            (await new AxeBuilder({ page: gp }).analyze()).violations,
          ).toEqual([]);
          await gp.screenshot({
            path: `.artifacts/d14-s4-d15/guardian-withdrawal-${width}.png`,
            fullPage: true,
          });
        }
        await gp.goto(`${config.origin}/guardian/content/assignments`);
        for (const width of [320, 768, 1440]) {
          await gp.setViewportSize({ width, height: 1000 });
          await browserExpect(
            gp.getByRole('heading', { name: 'Een oefensessie klaarzetten' }),
          ).toBeVisible();
          expect(
            await gp.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth &&
                [...document.querySelectorAll('main, [role="main"]')].every(
                  (el) => el.scrollWidth <= el.clientWidth,
                ),
            ),
          ).toBe(true);
          expect(
            (await new AxeBuilder({ page: gp }).analyze()).violations,
          ).toEqual([]);
          await gp.screenshot({
            path: `.artifacts/d14-s4-d15/delivery-${width}.png`,
            fullPage: true,
          });
        }
        expect(errors).toEqual([]);
        if (process.env.NEXO_CONTENT_REHEARSAL === '1') {
          console.log(
            `Synthetic rehearsal ready in the two authenticated Chromium windows. Guardian: ${config.origin}/guardian/content/assignments ; learner: ${config.origin}/student . Close Chromium to remove the disposable database. Content mutations require fresh MFA; rerun this rehearsal if the five-minute operator window expires.`,
          );
          await new Promise<void>((resolve) =>
            chromiumBrowser.once('disconnected', () => resolve()),
          );
        }
      } finally {
        await learner?.close();
        await guardianContext?.close();
        await stop();
        await new Promise<void>((resolve) =>
          server.listen(Number(port), '127.0.0.1', resolve),
        );
      }
    },
    process.env.NEXO_CONTENT_REHEARSAL === '1' ? 0 : 120_000,
  );

if (process.env.NEXO_TEST_BUILT === '1')
  it('D14-S5 built four-subject rehearsal: review, saved drafts, restart, retries and original Guardian detail', async () => {
    const { rehearsalSpecs } =
      await import('../../src/server/content/rehearsal-batches');
    const { mkdir } = await import('node:fs/promises');
    const port = new URL(config.origin).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    let child: ChildProcess | undefined,
      learner: BrowserContext | undefined,
      adult: BrowserContext | undefined;
    async function start() {
      child = spawn(process.execPath, ['.next/standalone/server.js'], {
        env: {
          ...process.env,
          PORT: port,
          HOSTNAME: '127.0.0.1',
          BETTER_AUTH_URL: config.origin,
        },
        stdio: 'ignore',
      });
      for (let i = 0; i < 100; i++) {
        try {
          if ((await fetch(config.origin)).ok) return;
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      throw Error('Built rehearsal server unavailable');
    }
    async function stop() {
      if (child) {
        const exited = new Promise<void>((r) => child!.once('exit', () => r()));
        child.kill();
        await exited;
        child = undefined;
      }
    }
    try {
      await start();
      await mkdir('.artifacts/d14-s5', { recursive: true });
      const { browser: guardian } = await provision(),
        studentId = await student(guardian);
      adult = await chromiumBrowser.newContext();
      await adult.addCookies(
        [...guardian.cookies].map(([name, value]) => ({
          name,
          value,
          url: config.origin,
        })),
      );
      const gp = await adult.newPage();
      gp.setDefaultTimeout(12000);
      const errors: string[] = [];
      gp.on('pageerror', (e) => errors.push(e.message));
      const formats = [
        {
          key: 'arithmetic',
          path: '/guardian/content/supply/review',
          category: 'Rekenen · Optellen',
        },
        {
          key: 'spelling',
          path: '/guardian/content/spelling',
          category: 'Spelling · Regelwoorden',
        },
        ...rehearsalSpecs.map((s) => ({
          key: s.key,
          path: `/guardian/content/rehearsal/${s.key}`,
          category: `${s.requirement.subject} · ${s.requirement.category}`,
        })),
      ];
      const ids: string[] = [];
      for (const format of formats) {
        if (format.key === 'arithmetic') {
          await gp.goto(`${config.origin}/guardian/content/supply`);
          await gp.getByRole('spinbutton').fill('2');
          await gp
            .getByRole('button', { name: 'Kleine set voorbereiden' })
            .click();
          await browserExpect(
            gp.getByText('Weekvoorraad opgeslagen.', { exact: false }),
          ).toBeVisible();
        }
        await gp.goto(config.origin + format.path);
        if (format.key !== 'arithmetic') {
          await gp
            .getByRole('button', { name: 'Proefset klaarzetten', exact: true })
            .click();
          await browserExpect(
            gp.getByRole('checkbox', { name: /^Selecteer / }),
          ).toBeVisible();
        }
        for (const publish of [false, true]) {
          await gp.getByRole('checkbox', { name: /^Selecteer / }).check();
          await gp
            .getByRole('button', { name: 'Beslis over selectie (1)' })
            .click();
          await gp
            .getByRole('checkbox', {
              name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
            })
            .check();
          await gp
            .getByRole('button', {
              name: publish
                ? 'Goedgekeurde selectie publiceren'
                : 'Selectie goedkeuren',
              exact: true,
            })
            .click();
          await browserExpect(
            gp.getByText(
              publish
                ? 'Versie 1 · Gepubliceerd voor lokale proef'
                : 'Versie 1 · Goedgekeurd',
              { exact: true },
            ),
          ).toBeVisible();
        }
        await gp.goto(`${config.origin}/guardian/content/assignments`);
        await gp
          .getByRole('combobox', { name: /^Categorie/ })
          .selectOption({ label: format.category });
        await gp.getByRole('spinbutton').fill('1');
        await gp
          .getByRole('button', { name: 'Sessie klaarzetten', exact: true })
          .click();
        await browserExpect(gp.getByRole('status')).toContainText(
          'Sessie opgeslagen.',
        );
        const a = await db.assignment.findFirstOrThrow({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
        });
        ids.push(a.id);
      }
      const browser = await pageBrowser();
      learner = browser.context;
      let page = browser.page;
      page.setDefaultTimeout(12000);
      await register(page, await approve(page, guardian, studentId));
      await page.goto(`${config.origin}/student`);
      await page
        .getByRole('button', { name: 'Aanmelden', exact: true })
        .click();
      await browserExpect(
        page.getByRole('heading', { name: 'Jouw taken' }),
      ).toBeVisible();
      await browserExpect(
        page.getByRole('button', { name: /^Start taak:/ }),
      ).toHaveCount(5);
      for (let n = 0; n < formats.length; n++) {
        const format = formats[n]!,
          id = ids[n]!;
        await page.goto(`${config.origin}/student/assignments/${id}`);
        const radio = format.key === 'reading',
          wrong = radio
            ? 'a'
            : format.key === 'taal'
              ? 'kat'
              : format.key === 'spelling'
                ? 'katen'
                : '999';
        const enter = async () => {
          if (radio) {
            await browserExpect(page.getByRole('radio').first()).toBeEnabled();
            await page.getByRole('radio').first().check();
          } else await page.getByRole('textbox').fill(wrong);
        };
        await enter();
        await page.getByRole('button', { name: 'Bewaar concept' }).click();
        await browserExpect(
          page.getByText('Concept opgeslagen.', { exact: false }),
        ).toBeVisible();
        if (radio) {
          const storage = await learner.storageState();
          await learner.close();
          learner = undefined;
          await stop();
          await start();
          learner = await chromiumBrowser.newContext({ storageState: storage });
          page = await learner.newPage();
          page.setDefaultTimeout(12000);
          await page.goto(`${config.origin}/student/assignments/${id}`);
        } else await page.reload();
        page.on('pageerror', (e) => errors.push(e.message));
        if (radio) {
          await browserExpect(page.getByRole('radio').first()).toBeChecked();
          await browserExpect(
            page.getByRole('heading', { name: 'Een tuin voor iedereen' }),
          ).toBeVisible();
          await browserExpect(
            page.getByText(/Een maand later zitten Noor en Kian/),
          ).toBeVisible();
        } else
          await browserExpect(page.getByRole('textbox')).toHaveValue(wrong);
        if (format.key === 'redactiesommen') {
          await browserExpect(
            page.getByLabel('Jouw antwoord in stickers'),
          ).toBeVisible();
          await browserExpect(
            page.locator('h2').filter({ hasText: 'Voor een knutselmiddag' }),
          ).toHaveCount(0);
        }
        const forbidden =
          /privateEvaluation|acceptedAnswers|gradingRules|taal-word-exact-v1|reading-choice-exact-v1|redactiesommen-integer-v1/;
        expect(await (await page.request.get(page.url())).text()).not.toMatch(
          forbidden,
        );
        expect(
          await (
            await page.request.get(page.url(), { headers: { RSC: '1' } })
          ).text(),
        ).not.toMatch(forbidden);
        for (const src of await page
          .locator('script[src]')
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLScriptElement).src),
          ))
          expect(await (await page.request.get(src)).text()).not.toMatch(
            forbidden,
          );
        for (const width of [390, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
            [],
          );
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          await page.screenshot({
            path: `.artifacts/d14-s5/${format.key}-student-${width}.png`,
            fullPage: true,
          });
        }
        await page.getByRole('button', { name: 'Controleer antwoord' }).click();
        await browserExpect(
          page.getByText('Nog niet goed', { exact: true }),
        ).toBeVisible();
        await browserExpect(
          page.getByText(/Het juiste antwoord is/),
        ).toHaveCount(0);
        await page.reload();
        await browserExpect(
          page.getByText('Nog niet goed', { exact: true }),
        ).toBeVisible();
        const unfinished = await gp.request.get(
          `${config.origin}/api/guardian/results/${id}`,
          { headers: { origin: config.origin } },
        );
        expect(
          (await unfinished.json()).result.questions[0].answerModel,
        ).toBeUndefined();
        await page.getByRole('button', { name: 'Verder', exact: true }).click();
        await enter();
        await page.getByRole('button', { name: 'Controleer antwoord' }).click();
        await browserExpect(
          page.getByText(/Het juiste antwoord is/),
        ).toBeVisible();
        await page.getByRole('button', { name: 'Verder', exact: true }).click();
        await browserExpect(
          page.getByRole('heading', { name: 'Taak klaar!', exact: true }),
        ).toBeVisible();
        await page.reload();
        await browserExpect(
          page.getByRole('heading', { name: 'Taak klaar!', exact: true }),
        ).toBeVisible();
        expect(
          await db.practiceAttempt.count({ where: { assignmentId: id } }),
        ).toBe(2);
        await gp.goto(`${config.origin}/guardian/results`);
        await gp
          .getByRole('button', {
            name: new RegExp(
              `^Bekijk sessie:.*${format.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            ),
          })
          .click();
        if (radio)
          await browserExpect(
            gp.getByText(/Een maand later zitten Noor en Kian/),
          ).toBeVisible();
        await gp.locator('details').last().locator('summary').click();
        await browserExpect(
          gp
            .getByText(
              radio ? 'Om meer ruimte te maken voor balspellen.' : wrong,
              { exact: true },
            )
            .first(),
        ).toBeVisible();
        for (const width of [390, 1440]) {
          await gp.setViewportSize({ width, height: 1000 });
          expect(
            (await new AxeBuilder({ page: gp }).analyze()).violations,
          ).toEqual([]);
          expect(
            await gp.evaluate(
              () =>
                document.documentElement.scrollWidth <= innerWidth &&
                [...document.querySelectorAll('main')].every(
                  (e) => e.scrollWidth <= e.clientWidth,
                ),
            ),
          ).toBe(true);
          await gp.screenshot({
            path: `.artifacts/d14-s5/${format.key}-guardian-${width}.png`,
            fullPage: true,
          });
        }
      }
      expect(errors).toEqual([]);
    } finally {
      await learner?.close();
      await adult?.close();
      await stop();
      await new Promise<void>((resolve) =>
        server.listen(Number(port), '127.0.0.1', resolve),
      );
    }
  }, 180_000);
