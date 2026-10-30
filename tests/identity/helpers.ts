import { expect, vi } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client';
import { createHmac } from 'node:crypto';
// Independent RFC 6238 code from the public otpauth URI, as an authenticator would.
export function totp(secret: string) {
  const bits = [...secret]
    .map((c) =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
        .indexOf(c)
        .toString(2)
        .padStart(5, '0'),
    )
    .join('');
  const key = Buffer.from(
    (bits.match(/.{8}/g) ?? []).map((v) => parseInt(v, 2)),
  );
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const mac = createHmac('sha1', key).update(counter).digest();
  const offset = mac[19]! & 15;
  return ((mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000)
    .toString()
    .padStart(6, '0');
}
vi.mock('server-only', () => ({}));
import { localIdentityConfig } from '../../src/server/auth/config';
import { bootstrapAdult, identityHandler } from '../../src/server/auth/service';
export const config = localIdentityConfig(process.env);
export const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.databaseUrl }),
});
export const adult = {
  email: 'guardian@example.invalid',
  name: 'Synthetic guardian',
  password: 'synthetic-password-0123456789',
};
export class Browser {
  cookies = new Map<string, string>();
  forwardedIP = '192.0.2.1';
  async call(path: string, body?: Record<string, unknown>) {
    const headers = new Headers({
      origin: config.origin,
      'x-forwarded-for': this.forwardedIP,
      cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
    });
    if (body) headers.set('content-type', 'application/json');
    const result = await identityHandler(
      db,
      config,
      new Request(`${config.origin}/api/auth${path}`, {
        method: body ? 'POST' : 'GET',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      }),
    );
    for (const cookie of result.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const pos = pair!.indexOf('=');
      this.cookies.set(pair!.slice(0, pos), pair!.slice(pos + 1));
    }
    return result;
  }
}
export async function provision() {
  await bootstrapAdult(db, config, adult);
  const browser = new Browser();
  await browser.call('/send-verification-email', { email: adult.email });
  const message = await db.localAuthMessage.findFirstOrThrow({
    where: { kind: 'verify-email' },
  });
  const url = new URL(message.url);
  expect((await browser.call(`/verify-email?${url.searchParams}`)).status).toBe(
    302,
  );
  expect((await db.user.findFirstOrThrow()).emailVerified).toBe(true);
  expect(
    (
      await browser.call('/sign-in/email', {
        email: adult.email,
        password: adult.password,
      })
    ).status,
  ).toBe(200);
  expect((await browser.call('/get-session')).status).toBe(401);
  const setup = await browser.call('/two-factor/enable', {
    password: adult.password,
  });
  expect(setup.status).toBe(200);
  const data = await setup.json();
  const secret = new URL(data.totpURI).searchParams.get('secret')!;
  expect(
    (await browser.call('/two-factor/verify-totp', { code: totp(secret) }))
      .status,
  ).toBe(200);
  return { browser, secret, codes: data.backupCodes as string[] };
}
