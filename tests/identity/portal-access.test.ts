import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { config, db, Browser, provision, totp } from './helpers';
import { studentsHandler } from '../../src/server/identity/students';
const originalOrigin = config.origin;
beforeEach(async () => {
  config.origin = config.origin.replace('127.0.0.1', 'localhost');
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit" CASCADE',
  );
});
afterAll(async () => {
  config.origin = originalOrigin;
  await db.$disconnect();
});
it('projects portal authority without tokens and refreshes stale MFA in the existing session', async () => {
  expect((await new Browser().call('/portal-session')).status).toBe(401);
  const { browser, secret } = await provision();
  const r = await browser.call('/portal-session');
  expect(r.status).toBe(200);
  expect(await r.json()).toMatchObject({
    role: 'guardian',
    fresh: true,
    operator: true,
  });
  await db.session.updateMany({
    data: { mfaVerifiedAt: new Date(Date.now() - 360_000) },
  });
  expect(await (await browser.call('/portal-session')).json()).toMatchObject({
    fresh: false,
  });
  expect(
    (await browser.call('/two-factor/verify-totp', { code: totp(secret) }))
      .status,
  ).toBe(200);
  const body = await (await browser.call('/portal-session')).text();
  expect(JSON.parse(body).fresh).toBe(true);
  expect(body).not.toMatch(/token|secret|password|sessionId/);
  await browser.call('/sign-out', {});
  expect((await browser.call('/portal-session')).status).toBe(401);
});
it('returns only this browser enrollment and owned student choices', async () => {
  const stranger = new Browser();
  expect(await (await stranger.call('/student/enrollment')).json()).toEqual({
    state: 'none',
  });
  const own = new Browser();
  const grant = await (
    await own.call('/student/enroll', { label: 'Synthetic browser' })
  ).json();
  expect(await (await own.call('/student/enrollment')).json()).toMatchObject({
    state: 'pending',
    enrollmentId: grant.enrollmentId,
  });
  expect(await (await stranger.call('/student/enrollment')).json()).toEqual({
    state: 'none',
  });
  const { browser } = await provision();
  const req = (method: string, body?: object) =>
    new Request(`${config.origin}/api/identity/students`, {
      method,
      headers: {
        origin: config.origin,
        cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
        'content-type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  const created = await (
    await studentsHandler(
      db,
      config,
      req('POST', { displayName: 'Test leerling' }),
    )
  ).json();
  const list = await studentsHandler(db, config, req('GET'));
  expect(list.status).toBe(200);
  expect(await list.json()).toEqual([
    { id: created.id, displayName: 'Test leerling', canManage: true },
  ]);
});
it('opens the local password recovery link without bypassing MFA', async () => {
  const { browser } = await provision();
  await browser.call('/sign-out', {});
  expect(
    (
      await browser.call('/request-password-reset', {
        email: 'guardian@example.invalid',
        redirectTo: `${config.origin}/guardian/reset-password`,
      })
    ).status,
  ).toBe(200);
  const email = await db.localAuthMessage.findFirstOrThrow({
    where: { kind: 'reset-password' },
  });
  const url = new URL(email.url);
  const opened = await browser.call(
    url.pathname.slice('/api/auth'.length) + url.search,
  );
  expect(opened.status).toBe(302);
  const destination = new URL(opened.headers.get('location')!);
  expect(destination.origin).toBe(config.origin);
  expect(destination.pathname).toBe('/guardian/reset-password');
  expect(destination.searchParams.get('token')).toBeTruthy();
  expect((await browser.call('/portal-session')).status).toBe(401);
});
