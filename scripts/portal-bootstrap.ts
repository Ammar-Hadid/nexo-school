import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { localIdentityConfig } from '../src/server/auth/config.ts';
import { bootstrapAdult, identityHandler } from '../src/server/auth/service.ts';
const config = localIdentityConfig(process.env);
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.databaseUrl }),
});
const folder = resolve('.local/portals');
try {
  const marker = await db.identityBootstrap.findFirst();
  let credentials: { email: string; name: string; password: string };
  try {
    credentials = JSON.parse(
      await readFile(`${folder}/credentials.json`, 'utf8'),
    );
  } catch (error) {
    if (
      !(error instanceof Error && 'code' in error && error.code === 'ENOENT') ||
      marker
    )
      throw error;
    credentials = {
      email: 'guardian@example.invalid',
      name: 'Testouder',
      password: randomBytes(24).toString('base64url'),
    };
    await writeFile(`${folder}/credentials.json`, JSON.stringify(credentials), {
      flag: 'wx',
      mode: 0o600,
    });
  }
  if (!marker) await bootstrapAdult(db, config, credentials);
  const owner = await db.user.findUnique({
    where: { email: credentials.email },
  });
  if (!owner || owner.principalKind !== 'adult') throw Error();
  if (!owner.emailVerified) {
    const response = await identityHandler(
      db,
      config,
      new Request(`${config.origin}/api/auth/send-verification-email`, {
        method: 'POST',
        headers: { origin: config.origin, 'content-type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          callbackURL: `${config.origin}/guardian`,
        }),
      }),
    );
    if (!response.ok) throw Error();
  }
  const messages = await db.localAuthMessage.findMany({
    where: { recipient: credentials.email },
    orderBy: { createdAt: 'desc' },
  });
  await writeFile(`${folder}/mailbox.json`, JSON.stringify(messages, null, 2), {
    mode: 0o600,
  });
  if (process.argv[2] !== 'mailbox') {
    const verify = messages.find((m) => m.kind === 'verify-email');
    const text = `# Private local test account\n\nSynthetic account only. Keep this file private; it contains your initial password and possibly a one-time email-verification link.\n\n- Guardian: ${config.origin}/guardian\n- Student (separate browser profile): ${config.origin}/student\n- Email: ${credentials.email}\n- Initial password: ${credentials.password}\n${!owner.emailVerified && verify ? `- First verify your synthetic email: ${verify.url}\n` : ''}\nSign in as the guardian, set up your authenticator using the displayed secret, save the recovery codes, and enter a current code. Then open Accounts en browsers, create a synthetic learner, and approve the enrollment code shown in your other browser profile. Register a passkey there and sign in.\n\nAfter changing your password, the initial password above no longer works. Recovery emails are exported privately with npm run portal:mailbox. No real email is sent.\n\nStart: npm run portal:start. Stop: npm run portal:stop. Stopping preserves accounts, keys and saved work. Closing browsers never deletes the database. No automatic reset or seeded approval is performed.\n`;
    await writeFile(`${folder}/START-HERE.md`, text, { mode: 0o600 });
  }
  console.log(
    'Private local account instructions/mailbox updated; no credentials printed.',
  );
} catch {
  console.error(
    'Local account preparation failed; credentials have not been printed.',
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
