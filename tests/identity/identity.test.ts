import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
vi.mock('server-only', () => ({}));
import { bootstrapAdult, identityHandler } from '../../src/server/auth/service';
import { config, db, adult, Browser, provision, totp } from './helpers';
beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit" CASCADE',
  );
});
afterAll(async () => {
  await db.$disconnect();
});
describe('local PostgreSQL identity boundary', () => {
  it('runs the operator CLI with stdin secrets, rejects repeat/remote setup and never prints them', async () => {
    const args = [
      '--conditions=react-server',
      '--experimental-strip-types',
      'scripts/local-identity.ts',
      'bootstrap',
    ];
    const result = spawnSync(process.execPath, args, {
      input: JSON.stringify(adult),
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).not.toContain(adult.password);
    expect(await db.user.count()).toBe(1);
    expect(
      spawnSync(process.execPath, args, {
        input: JSON.stringify(adult),
        encoding: 'utf8',
      }).status,
    ).toBe(1);
    expect(
      spawnSync(process.execPath, args, {
        input: JSON.stringify(adult),
        encoding: 'utf8',
        env: {
          ...process.env,
          DATABASE_URL:
            'postgresql://fixture:fixture@remote.invalid/production',
        },
      }).status,
    ).toBe(1);
  });

  it('bootstraps once under concurrency and never reopens after deleting the user', async () => {
    const results = await Promise.allSettled([
      bootstrapAdult(db, config, adult),
      bootstrapAdult(db, config, { ...adult, email: 'other@example.invalid' }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await db.user.count()).toBe(1);
    expect(await db.account.count()).toBe(1);
    const account = await db.account.findFirstOrThrow();
    expect(account.password).not.toBe(adult.password);
    expect(
      await db.identityAudit.count({ where: { event: 'adult-bootstrapped' } }),
    ).toBe(1);
    await db.user.deleteMany();
    await expect(bootstrapAdult(db, config, adult)).rejects.toThrow();
  });
  it('rolls back every bootstrap write if the audit cannot be saved', async () => {
    await db.$executeRawUnsafe(
      `ALTER TABLE "IdentityAudit" ADD CONSTRAINT fail_audit CHECK (event <> 'adult-bootstrapped')`,
    );
    try {
      await expect(bootstrapAdult(db, config, adult)).rejects.toThrow();
      expect(await db.user.count()).toBe(0);
      expect(await db.account.count()).toBe(0);
      expect(await db.identityBootstrap.count()).toBe(0);
    } finally {
      await db.$executeRawUnsafe(
        'ALTER TABLE "IdentityAudit" DROP CONSTRAINT fail_audit',
      );
    }
    await bootstrapAdult(db, config, adult);
  });
  it('denies public signup, bootstrap, linking, factor disabling and hostile origins', async () => {
    const b = new Browser();
    for (const path of [
      '/sign-up/email',
      '/bootstrap',
      '/link-social',
      '/two-factor/disable',
      '/two-factor/view-backup-codes',
    ])
      expect((await b.call(path, adult)).status).toBe(404);
    const response = await identityHandler(
      db,
      config,
      new Request(`${config.origin}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          origin: 'https://attacker.invalid',
          'content-type': 'application/json',
        },
        body: JSON.stringify(adult),
      }),
    );
    expect(response.status).toBe(403);
    expect(await db.user.count()).toBe(0);
    await expect(
      bootstrapAdult(db, config, { ...adult, email: 'real@example.com' }),
    ).rejects.toThrow();
  });
  it('requires verified email, then MFA, and exposes only a safe adult session', async () => {
    await bootstrapAdult(db, config, adult);
    const b = new Browser();
    expect(
      (
        await b.call('/sign-in/email', {
          email: adult.email,
          password: adult.password,
        })
      ).status,
    ).not.toBe(200);
    expect((await b.call('/get-session')).status).toBe(401);
    await db.user.deleteMany();
    await db.identityBootstrap.deleteMany();
    const { browser } = await provision();
    const response = await browser.call('/get-session');
    expect(response.status).toBe(200);
    const value = await response.json();
    expect(value.user.email).toBe(adult.email);
    expect(JSON.stringify(value)).not.toContain('token');
    await db.session.deleteMany();
    expect((await browser.call('/get-session')).status).toBe(401);
  });
  it('requires password plus a single-use recovery code, revokes older sessions and records recovery', async () => {
    const { browser, codes } = await provision();
    const recovery = new Browser();
    expect(
      (
        await recovery.call('/two-factor/verify-backup-code', {
          code: codes[0],
        })
      ).status,
    ).not.toBe(200);
    const login = await recovery.call('/sign-in/email', {
      email: adult.email,
      password: adult.password,
    });
    expect((await login.json()).twoFactorRedirect).toBe(true);
    expect((await recovery.call('/get-session')).status).toBe(401);
    expect(
      (
        await recovery.call('/two-factor/verify-backup-code', {
          code: 'invalid',
        })
      ).status,
    ).not.toBe(200);
    expect(
      (
        await recovery.call('/two-factor/verify-backup-code', {
          code: codes[0],
        })
      ).status,
    ).toBe(200);
    expect((await browser.call('/get-session')).status).toBe(401);
    expect((await recovery.call('/get-session')).status).toBe(200);
    expect(
      (
        await recovery.call('/two-factor/verify-backup-code', {
          code: codes[0],
        })
      ).status,
    ).not.toBe(200);
    expect(
      await db.identityAudit.count({
        where: { event: 'backup-code-recovery' },
      }),
    ).toBe(1);
    const user = await db.user.findFirstOrThrow();
    expect(user.twoFactorEnabled).toBe(true);
  });
  it('allows only one concurrent consumption of a recovery code', async () => {
    const { codes } = await provision();
    const a = new Browser(),
      b = new Browser();
    for (const browser of [a, b])
      await browser.call('/sign-in/email', {
        email: adult.email,
        password: adult.password,
      });
    const responses = await Promise.all([
      a.call('/two-factor/verify-backup-code', { code: codes[0] }),
      b.call('/two-factor/verify-backup-code', { code: codes[0] }),
    ]);
    expect(responses.filter((r) => r.status === 200)).toHaveLength(1);
    expect(
      await db.identityAudit.count({
        where: { event: 'backup-code-recovery' },
      }),
    ).toBe(1);
  });
  it('rolls recovery back, including consumed code and issued session, on audit failure', async () => {
    const { codes, browser } = await provision();
    const b = new Browser();
    await b.call('/sign-in/email', {
      email: adult.email,
      password: adult.password,
    });
    await db.$executeRawUnsafe(
      `ALTER TABLE "IdentityAudit" ADD CONSTRAINT fail_recovery CHECK (event <> 'backup-code-recovery')`,
    );
    try {
      expect(
        (await b.call('/two-factor/verify-backup-code', { code: codes[0] }))
          .status,
      ).toBe(503);
      expect((await browser.call('/get-session')).status).toBe(200);
    } finally {
      await db.$executeRawUnsafe(
        'ALTER TABLE "IdentityAudit" DROP CONSTRAINT fail_recovery',
      );
    }
    expect(
      (await b.call('/two-factor/verify-backup-code', { code: codes[0] }))
        .status,
    ).toBe(200);
  });
  it('resets a forgotten password via local delivery without removing MFA; token is single-use', async () => {
    const { browser } = await provision();
    const b = new Browser();
    expect(
      (
        await b.call('/request-password-reset', {
          email: adult.email,
          redirectTo: config.origin,
        })
      ).status,
    ).toBe(200);
    const mail = await db.localAuthMessage.findFirstOrThrow({
      where: { kind: 'reset-password' },
    });
    const token = new URL(mail.url).pathname.split('/').at(-1)!;
    const newPassword = 'new-synthetic-password-987654321';
    expect(
      (await b.call('/reset-password', { token, newPassword })).status,
    ).toBe(200);
    expect((await browser.call('/get-session')).status).toBe(401);
    expect(
      (await b.call('/reset-password', { token, newPassword })).status,
    ).not.toBe(200);
    const login = await b.call('/sign-in/email', {
      email: adult.email,
      password: newPassword,
    });
    expect((await login.json()).twoFactorRedirect).toBe(true);
    expect((await b.call('/get-session')).status).toBe(401);
    expect(
      await db.identityAudit.count({ where: { event: 'password-recovered' } }),
    ).toBe(1);
  });
  it('replaces a lost authenticator only after recovery proof, then requires the new TOTP', async () => {
    const { browser, codes } = await provision();
    expect(
      (await browser.call('/recover-totp', { password: adult.password }))
        .status,
    ).toBe(403);
    await browser.call('/two-factor/verify-backup-code', { code: codes[0] });
    const replacement = await browser.call('/recover-totp', {
      password: adult.password,
    });
    expect(replacement.status).toBe(200);
    const setup = await replacement.json();
    expect((await browser.call('/get-session')).status).toBe(401);
    expect(
      (await browser.call('/recover-totp', { password: adult.password }))
        .status,
    ).toBe(403);
    const secret = new URL(setup.totpURI).searchParams.get('secret')!;
    expect(
      (await browser.call('/two-factor/verify-totp', { code: totp(secret) }))
        .status,
    ).toBe(200);
    expect((await browser.call('/get-session')).status).toBe(200);
    expect(
      (await browser.call('/two-factor/verify-backup-code', { code: codes[1] }))
        .status,
    ).not.toBe(200);
    expect(
      await db.identityAudit.count({
        where: { event: 'authenticator-replaced' },
      }),
    ).toBe(1);
  });
  it('does not grant adult assurance after a wrong password or TOTP', async () => {
    const { secret } = await provision();
    const b = new Browser();
    expect(
      (
        await b.call('/sign-in/email', {
          email: adult.email,
          password: 'incorrect-password-0123456789',
        })
      ).status,
    ).toBe(401);
    expect((await b.call('/get-session')).status).toBe(401);
    await b.call('/sign-in/email', {
      email: adult.email,
      password: adult.password,
    });
    // Malformed OTP cannot accidentally match the current six-digit code.
    expect(
      (await b.call('/two-factor/verify-totp', { code: 'not-a-totp' })).status,
    ).not.toBe(200);
    expect((await b.call('/get-session')).status).toBe(401);
    expect(
      (await db.twoFactor.findFirstOrThrow()).failedVerificationCount,
    ).toBe(1);
    expect(
      (await b.call('/two-factor/verify-totp', { code: totp(secret) })).status,
    ).toBe(200);
    expect((await b.call('/get-session')).status).toBe(200);
  });
  it('rejects expired challenges without consuming a recovery code', async () => {
    const { codes } = await provision();
    const b = new Browser();
    await b.call('/sign-in/email', {
      email: adult.email,
      password: adult.password,
    });
    await db.verification.updateMany({ data: { expiresAt: new Date(0) } });
    const stored = await db.twoFactor.findFirstOrThrow();
    expect(
      (await b.call('/two-factor/verify-backup-code', { code: codes[0] }))
        .status,
    ).not.toBe(200);
    expect((await db.twoFactor.findFirstOrThrow()).backupCodes).toBe(
      stored.backupCodes,
    );
  });
  it('rejects stale assurance, expired sessions and oversized requests', async () => {
    const { browser } = await provision();
    await db.session.updateMany({ data: { mfaVerifiedAt: new Date(0) } });
    expect(
      (
        await browser.call('/two-factor/generate-backup-codes', {
          password: adult.password,
        })
      ).status,
    ).toBe(403);
    await db.session.updateMany({ data: { expiresAt: new Date(0) } });
    expect((await browser.call('/get-session')).status).toBe(401);
    expect(
      (
        await browser.call('/sign-in/email', {
          email: adult.email,
          password: 'x'.repeat(9000),
        })
      ).status,
    ).toBe(413);
  });
  it('persists throttling across handler instances and ignores spoofed forwarded IPs', async () => {
    const b = new Browser();
    for (let i = 0; i < 3; i++) {
      b.forwardedIP = `192.0.2.${i + 1}`;
      expect(
        (
          await b.call('/sign-in/email', {
            email: adult.email,
            password: adult.password,
          })
        ).status,
      ).not.toBe(429);
    }
    b.forwardedIP = '192.0.2.99';
    expect(
      (
        await b.call('/sign-in/email', {
          email: adult.email,
          password: adult.password,
        })
      ).status,
    ).toBe(429);
    expect(await db.rateLimit.count()).toBeGreaterThan(0);
  });
  it('rolls password recovery back if its audit write fails', async () => {
    const { browser } = await provision();
    const b = new Browser();
    await b.call('/request-password-reset', {
      email: adult.email,
      redirectTo: config.origin,
    });
    const mail = await db.localAuthMessage.findFirstOrThrow({
      where: { kind: 'reset-password' },
    });
    const token = new URL(mail.url).pathname.split('/').at(-1)!;
    const before = await db.account.findFirstOrThrow();
    await db.$executeRawUnsafe(
      `ALTER TABLE "IdentityAudit" ADD CONSTRAINT fail_password CHECK (event <> 'password-recovered')`,
    );
    try {
      expect(
        (
          await b.call('/reset-password', {
            token,
            newPassword: 'new-synthetic-password-0123456789',
          })
        ).status,
      ).toBe(503);
      expect((await db.account.findFirstOrThrow()).password).toBe(
        before.password,
      );
      expect((await browser.call('/get-session')).status).toBe(200);
    } finally {
      await db.$executeRawUnsafe(
        'ALTER TABLE "IdentityAudit" DROP CONSTRAINT fail_password',
      );
    }
    expect(
      (
        await b.call('/reset-password', {
          token,
          newPassword: 'new-synthetic-password-0123456789',
        })
      ).status,
    ).toBe(200);
  });
  it('never accepts client assurance fields or a student credential login', async () => {
    const { codes } = await provision();
    const b = new Browser();
    await b.call('/sign-in/email', {
      email: adult.email,
      password: adult.password,
    });
    expect(
      (
        await b.call('/two-factor/verify-backup-code', {
          code: codes[0],
          trustDevice: true,
        })
      ).status,
    ).toBe(400);
    await db.user.updateMany({ data: { principalKind: 'student' } });
    expect(
      (
        await b.call('/sign-in/email', {
          email: adult.email,
          password: adult.password,
          mfaVerifiedAt: new Date().toISOString(),
        })
      ).status,
    ).not.toBe(200);
  });
});

// D03: these requests go through real Better Auth cookie verification and the
// same PostgreSQL transaction used for resource authorization and mutation.
async function resource(
  browser: Browser,
  path = '',
  method = 'GET',
  body?: unknown,
  extraHeaders?: Record<string, string>,
) {
  const { studentsHandler } =
    await import('../../src/server/identity/students');
  return studentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/identity/students${path}`, {
      method,
      headers: {
        origin: config.origin,
        'content-type': 'application/json',
        cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
        ...extraHeaders,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}
async function secondGuardian() {
  // Trusted fixture only: D03 does not expose a second-adult signup endpoint.
  const credential = await db.account.findFirstOrThrow();
  await db.user.create({
    data: {
      id: 'guardian-b',
      name: 'Synthetic second guardian',
      email: 'second@example.invalid',
      emailVerified: true,
      accounts: {
        create: {
          id: 'credential-b',
          providerId: 'credential',
          accountId: 'guardian-b',
          password: credential.password,
        },
      },
    },
  });
  const browser = new Browser();
  expect(
    (
      await browser.call('/sign-in/email', {
        email: 'second@example.invalid',
        password: adult.password,
      })
    ).status,
  ).toBe(200);
  const setup = await browser.call('/two-factor/enable', {
    password: adult.password,
  });
  const secret = new URL((await setup.json()).totpURI).searchParams.get(
    'secret',
  )!;
  expect(
    (await browser.call('/two-factor/verify-totp', { code: totp(secret) }))
      .status,
  ).toBe(200);
  return browser;
}
async function createStudent(browser: Browser, displayName: string) {
  const result = await resource(browser, '', 'POST', { displayName });
  expect(result.status).toBe(201);
  return (await result.json()) as { id: string; displayName: string };
}
describe('D03 PostgreSQL resource ownership', () => {
  it('isolates two families through real cookie-authenticated reads, writes and revocation', async () => {
    const { browser: a } = await provision();
    const b = await secondGuardian();
    const sa = await createStudent(a, 'Synthetic A');
    const sb = await createStudent(b, 'Synthetic B');
    for (const [owner, other, student] of [
      [a, b, sa],
      [b, a, sb],
    ] as const) {
      const own = await resource(owner, `/${student.id}`);
      expect(await own.json()).toEqual(student);
      expect(own.headers.get('cache-control')).toBe('no-store');
      const denied = await resource(other, `/${student.id}`);
      const missing = await resource(
        other,
        '/00000000-0000-0000-0000-000000000000',
      );
      expect(denied.status).toBe(404);
      expect(await denied.json()).toEqual(await missing.json());
      expect(
        (
          await resource(other, `/${student.id}`, 'PATCH', {
            displayName: 'Intruder',
          })
        ).status,
      ).toBe(404);
      expect(
        (await resource(other, `/${student.id}/supervision`, 'DELETE')).status,
      ).toBe(404);
      expect(
        (await db.student.findUniqueOrThrow({ where: { id: student.id } }))
          .displayName,
      ).toBe(student.displayName);
    }
    expect(
      (
        await resource(a, `/${sa.id}`, 'PATCH', {
          displayName: 'Updated synthetic A',
        })
      ).status,
    ).toBe(200);
    expect((await resource(a, `/${sa.id}/supervision`, 'DELETE')).status).toBe(
      200,
    );
    expect((await resource(a, `/${sa.id}`)).status).toBe(404);
    expect(
      (await resource(a, `/${sa.id}`, 'PATCH', { displayName: 'Denied' }))
        .status,
    ).toBe(404);
    expect(await db.student.count()).toBe(2); // Last link revocation retains history/profile.
    expect(await db.identityAudit.count({ where: { studentId: sa.id } })).toBe(
      3,
    );
  });
  it('supports multiple explicit guardians and multiple students without household authority', async () => {
    const { browser: a } = await provision();
    const b = await secondGuardian();
    const one = await createStudent(a, 'Synthetic one');
    const two = await createStudent(a, 'Synthetic two');
    await db.guardianStudent.create({
      data: { guardianId: 'guardian-b', studentId: one.id, canView: true },
    });
    expect((await resource(b, `/${one.id}`)).status).toBe(200);
    expect((await resource(b, `/${two.id}`)).status).toBe(404);
    expect(
      (await resource(b, `/${one.id}`, 'PATCH', { displayName: 'Denied' }))
        .status,
    ).toBe(404);
    await resource(a, `/${one.id}/supervision`, 'DELETE');
    expect((await resource(b, `/${one.id}`)).status).toBe(200);
    expect((await resource(a, `/${one.id}`)).status).toBe(404);
  });
  it('uses scoped database queries for student self access and separate capabilities', async () => {
    const { browser } = await provision();
    const one = await createStudent(browser, 'Synthetic one');
    const two = await createStudent(browser, 'Synthetic two');
    const student = await db.student.findUniqueOrThrow({
      where: { id: one.id },
    });
    const { authorizedStudent } =
      await import('../../src/server/identity/students');
    const actor = { kind: 'student' as const, userId: student.userId };
    await db.$transaction(async (tx) => {
      expect(await authorizedStudent(tx, actor, one.id, 'view')).toEqual(one);
      expect(await authorizedStudent(tx, actor, one.id, 'practice')).toEqual(
        one,
      );
      expect(await authorizedStudent(tx, actor, two.id, 'view')).toBeNull();
      expect(await authorizedStudent(tx, actor, two.id, 'practice')).toBeNull();
      expect(await authorizedStudent(tx, actor, one.id, 'assign')).toBeNull();
      expect(await authorizedStudent(tx, actor, one.id, 'manage')).toBeNull();
    });
  });
  it('denies unverified, expired, revoked and student sessions and spoofed authority', async () => {
    const { browser } = await provision();
    const student = await createStudent(browser, 'Synthetic child');
    const row = await db.student.findUniqueOrThrow({
      where: { id: student.id },
    });
    expect(
      (
        await resource(new Browser(), `/${student.id}`, 'GET', undefined, {
          'x-user-id': row.userId,
          'x-role': 'adult',
        })
      ).status,
    ).toBe(401);
    // A signed adult cookie attached to a changed DB session must not retain adult authority.
    await db.session.updateMany({ data: { userId: row.userId } });
    expect((await resource(browser, `/${student.id}`)).status).toBe(401);
    expect(
      (await resource(browser, '', 'POST', { displayName: 'Denied' })).status,
    ).toBe(401);
    const guardian = await db.user.findUniqueOrThrow({
      where: { email: adult.email },
    });
    await db.session.updateMany({
      data: { userId: guardian.id, mfaVerifiedAt: null },
    });
    expect((await resource(browser, `/${student.id}`)).status).toBe(401);
    await db.session.updateMany({
      data: { mfaVerifiedAt: new Date(), expiresAt: new Date(0) },
    });
    expect((await resource(browser, `/${student.id}`)).status).toBe(401);
    await db.session.deleteMany();
    expect((await resource(browser, `/${student.id}`)).status).toBe(401);
  });
  it('requires fresh MFA for management, explicit view permission, strict inputs and same origin', async () => {
    const { browser } = await provision();
    const student = await createStudent(browser, 'Synthetic child');
    for (const body of [
      { displayName: 'X', guardianId: 'other' },
      { displayName: 'X', principalKind: 'adult' },
      { displayName: '' },
      { displayName: 'x'.repeat(1100) },
    ])
      expect((await resource(browser, '', 'POST', body)).status).toBe(400);
    expect(
      (
        await resource(
          browser,
          `/${student.id}`,
          'PATCH',
          { displayName: 'X' },
          { origin: 'https://hostile.invalid' },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await resource(
          browser,
          `/${student.id}/supervision`,
          'DELETE',
          undefined,
          { origin: '' },
        )
      ).status,
    ).toBe(403);
    await db.session.updateMany({
      data: { mfaVerifiedAt: new Date(Date.now() - 301_000) },
    });
    expect((await resource(browser, `/${student.id}`)).status).toBe(200);
    expect(
      (await resource(browser, `/${student.id}`, 'PATCH', { displayName: 'X' }))
        .status,
    ).toBe(404);
    expect(
      (await resource(browser, `/${student.id}/supervision`, 'DELETE')).status,
    ).toBe(404);
    expect(
      (await resource(browser, '', 'POST', { displayName: 'X' })).status,
    ).toBe(403);
    await db.guardianStudent.updateMany({ data: { canView: false } });
    expect((await resource(browser, `/${student.id}`)).status).toBe(404);
  });
  it('rejects invalid role relationships, duplicate identity mapping and role conversion at database level', async () => {
    const { browser } = await provision();
    const student = await createStudent(browser, 'Synthetic child');
    const row = await db.student.findUniqueOrThrow({
      where: { id: student.id },
    });
    const guardian = await db.user.findUniqueOrThrow({
      where: { email: adult.email },
    });
    await expect(
      db.student.create({
        data: { id: 'invalid', userId: guardian.id, displayName: 'X' },
      }),
    ).rejects.toThrow();
    await expect(
      db.student.create({
        data: { id: 'duplicate', userId: row.userId, displayName: 'X' },
      }),
    ).rejects.toThrow();
    await expect(
      db.guardianStudent.create({
        data: { guardianId: row.userId, studentId: row.id },
      }),
    ).rejects.toThrow();
    await expect(
      db.user.update({
        where: { id: row.userId },
        data: { principalKind: 'adult' },
      }),
    ).rejects.toThrow();
    await expect(
      db.user.update({
        where: { id: guardian.id },
        data: { principalKind: 'student' },
      }),
    ).rejects.toThrow();
    await expect(
      db.user.update({
        where: { id: guardian.id },
        data: { principalKind: 'admin' },
      }),
    ).rejects.toThrow();
    await expect(
      db.student.update({
        where: { id: row.id },
        data: { principalKind: 'adult' },
      }),
    ).rejects.toThrow();
  });
  it('rolls back creation, profile mutation and revocation when auditing fails', async () => {
    const { browser } = await provision();
    const student = await createStudent(browser, 'Synthetic child');
    const before = await db.user.count();
    await db.$executeRawUnsafe(
      `ALTER TABLE "IdentityAudit" ADD CONSTRAINT fail_ownership_audit CHECK ("studentId" IS NULL) NOT VALID`,
    );
    try {
      expect(
        (await resource(browser, '', 'POST', { displayName: 'Rollback' }))
          .status,
      ).toBe(503);
      expect(await db.user.count()).toBe(before);
      expect(await db.student.count()).toBe(1);
      expect(
        (
          await resource(browser, `/${student.id}`, 'PATCH', {
            displayName: 'Rollback',
          })
        ).status,
      ).toBe(503);
      expect(
        (await db.student.findUniqueOrThrow({ where: { id: student.id } }))
          .displayName,
      ).toBe(student.displayName);
      expect(
        (await resource(browser, `/${student.id}/supervision`, 'DELETE'))
          .status,
      ).toBe(503);
      expect((await resource(browser, `/${student.id}`)).status).toBe(200);
    } finally {
      await db.$executeRawUnsafe(
        'ALTER TABLE "IdentityAudit" DROP CONSTRAINT fail_ownership_audit',
      );
    }
  });
  it('serializes concurrent revoke/update and denies every request after revocation commits', async () => {
    const { browser } = await provision();
    const student = await createStudent(browser, 'Synthetic child');
    const [revoke, rename] = await Promise.all([
      resource(browser, `/${student.id}/supervision`, 'DELETE'),
      resource(browser, `/${student.id}`, 'PATCH', {
        displayName: 'Concurrent',
      }),
    ]);
    expect(revoke.status).toBe(200);
    expect([200, 404]).toContain(rename.status); // Whichever transaction acquires the lock first.
    expect((await resource(browser, `/${student.id}`)).status).toBe(404);
    expect(
      (
        await resource(browser, `/${student.id}`, 'PATCH', {
          displayName: 'After revoke',
        })
      ).status,
    ).toBe(404);
  });
});
