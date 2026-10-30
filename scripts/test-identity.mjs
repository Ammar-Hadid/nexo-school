import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
const testFiles = process.argv.slice(2).filter((arg) => arg !== '--built');
if (
  testFiles.some(
    (file) => !/^tests\/identity\/[a-z0-9-]+\.test\.ts$/.test(file),
  )
)
  throw new Error('Use an explicit tests/identity/*.test.ts path.');
const name = `nexo-identity-test-${randomBytes(6).toString('hex')}`;
const password = randomBytes(32).toString('hex');
function run(command, args, env = process.env, capture = false) {
  const result = spawnSync(command, args, {
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.status !== 0)
    throw new Error(`${command} failed; identity tests did not pass.`);
  return result.stdout?.trim();
}
try {
  run(
    'docker',
    [
      'run',
      '--detach',
      '--rm',
      '--name',
      name,
      '-e',
      'POSTGRES_PASSWORD',
      '-e',
      'POSTGRES_DB=nexo_identity_test_run',
      '-p',
      '127.0.0.1::5432',
      'postgres:17-alpine',
    ],
    { ...process.env, POSTGRES_PASSWORD: password },
    true,
  );
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    if (
      spawnSync('docker', ['exec', name, 'pg_isready', '-U', 'postgres'], {
        stdio: 'ignore',
      }).status === 0
    ) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Disposable PostgreSQL did not become ready.');
  const port = run('docker', ['port', name, '5432/tcp'], process.env, true)
    .split(':')
    .at(-1);
  const url = `postgresql://postgres:${password}@127.0.0.1:${port}/nexo_identity_test_run`;
  const env = {
    ...process.env,
    NEXO_TEST_BUILT: process.argv.includes('--built') ? '1' : '',
    DATABASE_URL: url,
    DIRECT_DATABASE_URL: url,
    NEXO_LOCAL_IDENTITY: 'synthetic-only',
    BETTER_AUTH_URL: 'http://127.0.0.1:3000',
    BETTER_AUTH_SECRET: randomBytes(48).toString('hex'),
  };
  // The database/port/credentials are generated here; caller DATABASE_URL is never used.
  run('npm', ['run', 'db:generate'], env);
  run('npx', ['--no-install', 'prisma', 'migrate', 'deploy'], env);
  run('npx', ['--no-install', 'prisma', 'migrate', 'deploy'], env);
  run(
    'npx',
    [
      '--no-install',
      'vitest',
      'run',
      '--config',
      'vitest.identity.config.ts',
      ...testFiles,
      ...(process.env.NEXO_CONTENT_REHEARSAL === '1'
        ? [
            '-t',
            'D14-S4/D15 built published-content journey',
            '--disableConsoleIntercept',
          ]
        : []),
    ],
    env,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  spawnSync('docker', ['rm', '--force', name], { stdio: 'ignore' });
}
