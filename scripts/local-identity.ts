import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { localIdentityConfig } from '../src/server/auth/config.ts';
import { bootstrapAdult } from '../src/server/auth/service.ts';

let db: PrismaClient | undefined;
try {
  const config = localIdentityConfig(process.env);
  const command = process.argv[2];
  if (command === 'migrate') {
    const result = spawnSync(
      'npx',
      ['--no-install', 'prisma', 'migrate', 'deploy'],
      {
        env: { ...process.env, DIRECT_DATABASE_URL: config.databaseUrl },
        stdio: 'inherit',
      },
    );
    if (result.status !== 0) throw new Error('Migration failed.');
  } else {
    db = new PrismaClient({
      adapter: new PrismaPg({ connectionString: config.databaseUrl }),
    });
    if (command === 'bootstrap') {
      let input = '';
      for await (const chunk of process.stdin) {
        input += chunk;
        if (Buffer.byteLength(input) > 8192)
          throw new Error('Input too large.');
      }
      await bootstrapAdult(db, config, JSON.parse(input));
      console.log(
        'Synthetic adult created. Verify email and enroll TOTP before accessing an adult session.',
      );
    } else if (command === 'mailbox') {
      await mkdir('.artifacts', { recursive: true });
      // Exclusive create prevents following a pre-existing file/symlink.
      await writeFile(
        '.artifacts/local-identity-mailbox.json',
        JSON.stringify(await db.localAuthMessage.findMany(), null, 2),
        { flag: 'wx', mode: 0o600 },
      );
      console.log(
        'Local test messages saved privately to .artifacts/local-identity-mailbox.json. Delete after use.',
      );
    } else throw new Error('Unknown command.');
  }
} catch {
  console.error(
    'Local identity command failed. Check local synthetic configuration, input and command; no secrets are printed.',
  );
  process.exitCode = 1;
} finally {
  await db?.$disconnect();
}
