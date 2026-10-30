import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Always isolated: never read operator DATABASE_URL or use the VPS paths/container.
const id = `nexo-hosting-test-${randomBytes(6).toString('hex')}`;
const dir = mkdtempSync(join(tmpdir(), `${id}-`));
const password = randomBytes(32).toString('hex');
const file = join(dir, 'compose.yaml');
const compose = ['compose', '-f', file, '-p', id];
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    ...options,
  });
  if (result.status !== 0)
    throw new Error(
      `${command} ${args[0]} failed during isolated hosting verification: ${result.stderr}`,
    );
  return result.stdout.trim();
}
function sql(
  query,
  role = 'postgres',
  database = 'nexo_identity_local',
  succeeds = true,
) {
  const result = spawnSync(
    'docker',
    [
      'exec',
      '-i',
      '-e',
      'PGPASSWORD',
      id,
      'psql',
      '-h',
      '127.0.0.1',
      '-U',
      role,
      '-d',
      database,
      '-v',
      'ON_ERROR_STOP=1',
      '-At',
    ],
    {
      env: { ...process.env, PGPASSWORD: password },
      input: query,
      encoding: 'utf8',
    },
  );
  if ((result.status === 0) !== succeeds)
    throw new Error(`Unexpected database permission result for ${role}.`);
  return result.stdout.trim();
}
try {
  writeFileSync(
    join(dir, 'postgres.env'),
    [
      'POSTGRES_PASSWORD',
      'NEXO_MIGRATOR_PASSWORD',
      'NEXO_APP_PASSWORD',
      'NEXO_BACKUP_PASSWORD',
    ]
      .map((key) => `${key}=${password}`)
      .join('\n') + '\n',
    { mode: 0o600 },
  );
  const source = readFileSync('deploy/postgresql/compose.yaml', 'utf8')
    .replace('container_name: nexo-postgres', `container_name: ${id}`)
    .replace(
      '/srv/data/nexo-school/current/postgres.env',
      join(dir, 'postgres.env'),
    )
    .replace('/srv/data/nexo-school/current/postgresql', 'test-data')
    .replace('./init-roles.sh', resolve('deploy/postgresql/init-roles.sh'))
    .replace('127.0.0.1:15432:5432', '127.0.0.1::5432')
    .replace('name: nexo-school-db', `name: ${id}`);
  writeFileSync(file, `${source}\nvolumes:\n  test-data:\n`, { mode: 0o600 });
  run('docker', [...compose, 'up', '-d', '--wait', '--wait-timeout', '90']);
  const port = run('docker', ['port', id, '5432/tcp']).split(':').at(-1);
  const url = `postgresql://nexo_migrator:${password}@127.0.0.1:${port}/nexo_identity_local`;
  const env = { ...process.env, DATABASE_URL: url, DIRECT_DATABASE_URL: url };
  run('npx', ['--no-install', 'prisma', 'migrate', 'deploy'], { env });
  run('npx', ['--no-install', 'prisma', 'migrate', 'deploy'], { env });
  sql(
    'REVOKE ALL ON TABLE "_prisma_migrations" FROM nexo_app;',
    'nexo_migrator',
  );
  sql(
    'CREATE TABLE hosting_probe (id integer PRIMARY KEY); INSERT INTO hosting_probe VALUES (1);',
    'nexo_migrator',
  );
  sql(
    'INSERT INTO hosting_probe VALUES (2); UPDATE hosting_probe SET id=3 WHERE id=2; DELETE FROM hosting_probe WHERE id=3; SELECT * FROM "User";',
    'nexo_app',
  );
  sql('CREATE TABLE denied (id int);', 'nexo_app', undefined, false);
  sql('SELECT * FROM "_prisma_migrations";', 'nexo_app', undefined, false);
  sql('INSERT INTO hosting_probe VALUES (9);', 'nexo_backup', undefined, false);
  if (sql('SELECT count(*) FROM hosting_probe;', 'nexo_backup') !== '1')
    throw new Error('Backup role cannot read fixture.');
  run('docker', [...compose, 'restart', 'postgres']);
  run('docker', [...compose, 'up', '-d', '--wait', '--wait-timeout', '90']);
  if (sql('SELECT count(*) FROM hosting_probe;', 'nexo_app') !== '1')
    throw new Error('Restart lost persistent data.');
  const dump = spawnSync(
    'docker',
    [
      'exec',
      '-e',
      'PGPASSWORD',
      id,
      'pg_dump',
      '-h',
      '127.0.0.1',
      '-U',
      'nexo_backup',
      '-d',
      'nexo_identity_local',
      '-Fc',
    ],
    {
      env: { ...process.env, PGPASSWORD: password },
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  if (dump.status !== 0 || !dump.stdout.length)
    throw new Error('Backup failed.');
  sql('CREATE DATABASE nexo_restore_test;');
  run(
    'docker',
    [
      'exec',
      '-i',
      id,
      'pg_restore',
      '-U',
      'postgres',
      '-d',
      'nexo_restore_test',
      '--exit-on-error',
    ],
    { input: dump.stdout },
  );
  if (
    sql(
      'SELECT count(*) FROM hosting_probe;',
      'postgres',
      'nexo_restore_test',
    ) !== '1'
  )
    throw new Error('Restore lost fixture.');
  console.log(
    'PASS: pinned PostgreSQL Compose startup; migration/replay; runtime CRUD and DDL denial; migration metadata denial; backup read-only; persistent restart; custom dump/full restore.',
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  spawnSync('docker', [...compose, 'down', '--volumes'], { stdio: 'ignore' });
  rmSync(dir, { recursive: true, force: true });
}
