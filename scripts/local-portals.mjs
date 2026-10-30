import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, chmod, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
const folder = resolve('.local/portals'),
  container = 'nexo-school-local-portals-pg',
  volume = 'nexo-school-local-portals-pgdata';
const origin = 'http://localhost:3060',
  databasePort = '15435';
const command = process.argv[2];
function run(bin, args, env = process.env, capture = false) {
  const r = spawnSync(bin, args, {
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (r.status !== 0) throw Error(`${bin} did not complete.`);
  return r.stdout?.trim();
}
function inspect() {
  const r = spawnSync('docker', ['inspect', container], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  const data = JSON.parse(r.stdout)[0];
  if (data.Config.Labels?.['nexo.school.purpose'] !== 'local-portals')
    throw Error('Container name is already owned by another environment.');
  return data;
}
function ownedRunner(pid) {
  const commandLine =
    spawnSync('ps', ['-p', String(pid), '-o', 'command='], { encoding: 'utf8' })
      .stdout ?? '';
  const cwd =
    spawnSync('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn'], {
      encoding: 'utf8',
    }).stdout ?? '';
  return (
    /scripts\/local-portals\.mjs start(?:\s|$)/.test(commandLine) &&
    cwd.split('\n').includes(`n${process.cwd()}`)
  );
}
function inspectVolume() {
  const r = spawnSync('docker', ['volume', 'inspect', volume], {
    encoding: 'utf8',
  });
  if (r.status !== 0) return null;
  const v = JSON.parse(r.stdout)[0];
  if (v.Labels?.['nexo.school.purpose'] !== 'local-portals')
    throw Error('Volume name belongs to a different environment.');
  return v;
}
async function readEnvironment() {
  return JSON.parse(await readFile(`${folder}/environment.json`, 'utf8'));
}
function envFor(stored) {
  return {
    ...process.env,
    NEXO_LOCAL_IDENTITY: 'synthetic-only',
    DATABASE_URL: stored.databaseUrl,
    DIRECT_DATABASE_URL: stored.databaseUrl,
    BETTER_AUTH_URL: origin,
    BETTER_AUTH_SECRET: stored.secret,
  };
}
try {
  if (!['setup', 'start', 'stop', 'mailbox', 'status'].includes(command))
    throw Error('Use setup, start, stop, mailbox or status.');
  if (command === 'stop') {
    try {
      const { pid } = JSON.parse(
        await readFile(`${folder}/server.json`, 'utf8'),
      );
      if (ownedRunner(pid)) process.kill(pid, 'SIGTERM');
    } catch (e) {
      if (e.code !== 'ENOENT' && e.code !== 'ESRCH') throw e;
    }
    if (inspect()) run('docker', ['stop', container], process.env, true);
    console.log(
      'Local portal app/database stopped. Accounts and saved work retained.',
    );
  } else if (command === 'status') {
    const data = inspect();
    console.log(
      `Local database: ${data?.State.Running ? 'running' : 'stopped or not set up'}. Portal origin: ${origin}`,
    );
  } else {
    if (command === 'start') {
      try {
        const { pid } = JSON.parse(
          await readFile(`${folder}/server.json`, 'utf8'),
        );
        if (ownedRunner(pid))
          throw Error(
            'Local portal is already running. Use portal:stop before restarting.',
          );
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
    }
    await mkdir(folder, { recursive: true, mode: 0o700 });
    await chmod(folder, 0o700);
    let stored;
    try {
      stored = await readEnvironment();
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      if (inspect() || inspectVolume())
        throw Error(
          'Existing local data has no matching environment file. Restore the private configuration; do not reset accounts.',
        );
      stored = {
        password: randomBytes(32).toString('hex'),
        secret: randomBytes(48).toString('hex'),
      };
      stored.databaseUrl = `postgresql://postgres:${stored.password}@127.0.0.1:${databasePort}/nexo_identity_local`;
      await writeFile(`${folder}/environment.json`, JSON.stringify(stored), {
        flag: 'wx',
        mode: 0o600,
      });
    }
    const env = envFor(stored),
      existing = inspect();
    if (!inspectVolume())
      run(
        'docker',
        [
          'volume',
          'create',
          '--label',
          'nexo.school.purpose=local-portals',
          volume,
        ],
        process.env,
        true,
      );
    if (!existing)
      run(
        'docker',
        [
          'run',
          '-d',
          '--name',
          container,
          '--label',
          'nexo.school.purpose=local-portals',
          '--restart',
          'unless-stopped',
          '-e',
          'POSTGRES_PASSWORD',
          '-e',
          'POSTGRES_DB=nexo_identity_local',
          '-p',
          `127.0.0.1:${databasePort}:5432`,
          '-v',
          `${volume}:/var/lib/postgresql/data`,
          'postgres:17.11@sha256:d74eeac9a635390a49bc21bd49fccd973de707e2a53a76ac49b552b8712ec46f',
        ],
        { ...process.env, POSTGRES_PASSWORD: stored.password },
        true,
      );
    else if (!existing.State.Running)
      run('docker', ['start', container], process.env, true);
    let ready = false;
    for (let n = 0; n < 30; n++) {
      if (
        spawnSync(
          'docker',
          ['exec', container, 'pg_isready', '-U', 'postgres'],
          { stdio: 'ignore' },
        ).status === 0
      ) {
        ready = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!ready) throw Error('Local database did not become ready.');
    if (command !== 'mailbox') {
      run('npm', ['run', 'db:generate'], env);
      run('npx', ['--no-install', 'prisma', 'migrate', 'deploy'], env);
    }
    run(
      process.execPath,
      [
        '--conditions=react-server',
        '--experimental-strip-types',
        'scripts/portal-bootstrap.ts',
        command === 'mailbox' ? 'mailbox' : 'prepare',
      ],
      env,
    );
    console.log(
      `Local portal: ${origin}/guardian and ${origin}/student. Private instructions: ${folder}/START-HERE.md`,
    );
    if (command === 'start') {
      run('npm', ['run', 'build'], env);
      const server = spawn(
        process.execPath,
        [resolve('.next/standalone/server.js')],
        {
          env: { ...env, PORT: '3060', HOSTNAME: '127.0.0.1' },
          stdio: 'inherit',
        },
      );
      await writeFile(
        `${folder}/server.json`,
        JSON.stringify({ pid: process.pid }),
        { mode: 0o600 },
      );
      const stop = () => server.kill('SIGTERM');
      process.on('SIGINT', stop);
      process.on('SIGTERM', stop);
      const status = await new Promise((r) =>
        server.once('exit', (code) => r(code)),
      );
      await unlink(`${folder}/server.json`).catch(() => {});
      process.exitCode = status ?? 0;
    }
  }
} catch (error) {
  console.error(
    error.message?.includes('postgresql:')
      ? 'Local portal operation failed; credentials not printed.'
      : error.message,
  );
  process.exitCode = 1;
}
