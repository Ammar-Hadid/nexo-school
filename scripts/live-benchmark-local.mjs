import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

const name = 'nexo-school-d13-benchmark';
const root = resolve('.artifacts/d13');
const configFile = resolve(root, 'database.json');
const command = process.argv[2] ?? 'report';
function run(cmd, args, env = process.env, capture = true) {
  const result = spawnSync(cmd, args, {
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.status !== 0) throw new Error('LOCAL_BENCHMARK_COMMAND_FAILED');
  return result.stdout?.trim();
}
try {
  if (
    process.argv.length > 3 ||
    ![
      'setup',
      'report',
      'execute',
      'reconcile',
      'retry-gemini',
      'expanded-report',
      'expanded-run',
      'generator-report',
      'generator-run',
    ].includes(command)
  )
    throw new Error('INVALID_COMMAND');
  if (!existsSync(root)) mkdirSync(root, { recursive: true, mode: 0o700 });
  if (!lstatSync(root).isDirectory() || lstatSync(root).isSymbolicLink())
    throw new Error('INVALID_LOCAL_DIRECTORY');
  if (!existsSync(configFile)) {
    if (command !== 'setup') throw new Error('RUN_SETUP_FIRST');
    // Refuse to adopt an existing container without this checkout's credential record.
    if (
      spawnSync('docker', ['container', 'inspect', name], { stdio: 'ignore' })
        .status === 0
    )
      throw new Error('CONTAINER_ALREADY_EXISTS');
    writeFileSync(
      configFile,
      JSON.stringify({ password: randomBytes(32).toString('hex') }),
      { mode: 0o600, flag: 'wx' },
    );
  }
  const stat = lstatSync(configFile);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0)
    throw new Error('PRIVATE_CONFIG_REQUIRED');
  const { password } = JSON.parse(readFileSync(configFile, 'utf8'));
  if (typeof password !== 'string' || !/^[a-f0-9]{64}$/.test(password))
    throw new Error('INVALID_LOCAL_CONFIG');
  const existing = spawnSync(
    'docker',
    [
      'container',
      'inspect',
      '--format',
      '{{ index .Config.Labels "nexo.purpose" }}',
      name,
    ],
    { encoding: 'utf8' },
  );
  if (existing.status !== 0) {
    if (command !== 'setup') throw new Error('RUN_SETUP_FIRST');
    run(
      'docker',
      [
        'run',
        '--detach',
        '--name',
        name,
        '--label',
        'nexo.purpose=d13-benchmark',
        '--restart',
        'no',
        '-e',
        'POSTGRES_PASSWORD',
        '-e',
        'POSTGRES_DB=nexo_benchmark_local',
        '-p',
        '127.0.0.1::5432',
        '-v',
        `${name}:/var/lib/postgresql/data`,
        'postgres:17-alpine',
      ],
      { ...process.env, POSTGRES_PASSWORD: password },
    );
  } else if (existing.stdout.trim() !== 'd13-benchmark')
    throw new Error('CONTAINER_OWNERSHIP_MISMATCH');
  run('docker', ['start', name]);
  let ready = false;
  for (let i = 0; i < 30; i++) {
    if (
      spawnSync('docker', ['exec', name, 'pg_isready', '-U', 'postgres'], {
        stdio: 'ignore',
      }).status === 0
    ) {
      ready = true;
      break;
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  if (!ready) throw new Error('LOCAL_DATABASE_NOT_READY');
  const port = run('docker', ['port', name, '5432/tcp']).split(':').at(-1);
  if (!/^\d+$/.test(port ?? '')) throw new Error('INVALID_LOCAL_PORT');
  const url = `postgresql://postgres:${password}@127.0.0.1:${port}/nexo_benchmark_local`;
  const env = { ...process.env, DATABASE_URL: url, DIRECT_DATABASE_URL: url };
  if (command === 'setup') {
    run('npx', ['--no-install', 'prisma', 'migrate', 'deploy'], env);
    console.log(
      'Dedicated local D13 PostgreSQL is ready. Its persistent volume retains the spend ledger. No paid calls.',
    );
  } else
    run(
      process.execPath,
      [
        '--conditions=react-server',
        '--experimental-strip-types',
        command.startsWith('generator-')
          ? 'scripts/run-generator-benchmark.ts'
          : command.startsWith('expanded-')
            ? 'scripts/run-expanded-benchmark.ts'
            : 'scripts/run-live-review-smoke.ts',
        command.replace(/^(expanded|generator)-/, ''),
      ],
      env,
      false,
    );
} catch {
  console.error(
    'Local D13 command failed. Check Docker, setup and private configuration; credentials are not printed.',
  );
  process.exitCode = 1;
}
