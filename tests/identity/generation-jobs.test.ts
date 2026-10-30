import { spawnSync } from 'node:child_process';
import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db } from './helpers';
import {
  claimGeneration,
  enqueueGeneration,
  finishGeneration,
  runGenerationOnce,
  runGenerationBurst,
  type GenerationProvider,
} from '../../src/server/content/generation-jobs';
import { fakeGenerationProvider } from '../../src/server/content/fake-generation-provider';
import { generationPolicy } from '../../src/modules/content/generation-policy';

beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "GenerationJob", "GenerationBudget" CASCADE',
  );
});
afterAll(() => db.$disconnect());
const request = (requestId = 'job-1', feature = 'generation') => ({
  requestId,
  feature,
  specification: 'synthetic fixture only',
});
const result = {
  draft: 'Synthetisch concept.',
  costMicroEur: 400,
  inputTokens: 10,
  outputTokens: 20,
};
const ready = () =>
  db.generationJob.updateMany({
    where: { state: 'queued' },
    data: { availableAt: new Date(0) },
  });
async function expire(id: string) {
  // Deliberate fixture time travel. Production cannot alter lease identity.
  await db.$executeRawUnsafe(
    'ALTER TABLE "GenerationAttempt" DISABLE TRIGGER protect_generation_attempt',
  );
  try {
    await db.generationAttempt.update({
      where: { id },
      data: { leaseUntil: new Date(0) },
    });
  } finally {
    await db.$executeRawUnsafe(
      'ALTER TABLE "GenerationAttempt" ENABLE TRIGGER protect_generation_attempt',
    );
  }
}
async function budget() {
  return db.generationBudget.findFirstOrThrow();
}

it('deduplicates concurrent enqueue and rejects changed requests under the same identity', async () => {
  const jobs = await Promise.all([
    enqueueGeneration(db, request()),
    enqueueGeneration(db, request()),
  ]);
  expect(jobs[0].id).toBe(jobs[1].id);
  await expect(
    enqueueGeneration(db, { ...request(), specification: 'changed' }),
  ).rejects.toThrow('CONFLICT');
  expect(await db.generationJob.count()).toBe(1);
  expect(await db.generationAttempt.count()).toBe(0);
});

it('leases only one job across concurrent workers and settles once without publishing', async () => {
  await enqueueGeneration(db, request());
  await enqueueGeneration(db, request('job-2', 'review'));
  const claims = await Promise.all([
    claimGeneration(db, 2000),
    claimGeneration(db, 2000),
  ]);
  expect(claims.filter(Boolean)).toHaveLength(1);
  const lease = claims.find(Boolean)!;
  expect((await budget()).committedMicroEur).toBe(1000);
  expect(await finishGeneration(db, lease.run.id, result)).toBe(true);
  expect(await finishGeneration(db, lease.run.id, result)).toBe(false);
  expect((await budget()).committedMicroEur).toBe(400);
  const job = await db.generationJob.findUniqueOrThrow({
    where: { id: lease.job.id },
  });
  expect(JSON.parse(job.result!).status).toBe('unreviewed-synthetic');
  expect(job.resultHash).toMatch(/^[a-f0-9]{64}$/);
  expect(
    (await enqueueGeneration(db, request(job.requestId, job.feature))).id,
  ).toBe(job.id);
  expect(await db.generationAttempt.count({ where: { jobId: job.id } })).toBe(
    1,
  );
  await expect(
    db.generationJob.update({
      where: { id: job.id },
      data: { result: 'changed' },
    }),
  ).rejects.toThrow();
  await expect(
    db.generationAttempt.delete({ where: { id: lease.run.id } }),
  ).rejects.toThrow();
});

it('shares a strict cap across generation, review and feedback; zero/changed caps fail closed', async () => {
  await enqueueGeneration(db, request('one', 'generation'));
  await enqueueGeneration(db, request('two', 'review'));
  await enqueueGeneration(db, request('three', 'feedback'));
  expect(await runGenerationBurst(db, 1400, fakeGenerationProvider)).toEqual([
    'processed',
    'processed',
    'idle',
  ]);
  expect((await budget()).committedMicroEur).toBe(800);
  expect(await db.generationJob.count({ where: { state: 'queued' } })).toBe(1);
  await expect(claimGeneration(db, 10_000_001)).rejects.toThrow();
  await expect(claimGeneration(db, 2000)).rejects.toThrow(
    'MONTHLY_CAP_CONFLICT',
  );
  expect((await budget()).committedMicroEur).toBe(800);
});

it('does not call a provider with zero budget or an unsupported provider', async () => {
  await enqueueGeneration(db, request());
  const generate = vi.fn(fakeGenerationProvider.generate);
  expect(await runGenerationOnce(db, 0, { id: 'fake-v1', generate })).toBe(
    'idle',
  );
  expect(generate).not.toHaveBeenCalled();
  await expect(
    runGenerationOnce(db, 0, { id: 'live' as 'fake-v1', generate }),
  ).rejects.toThrow('PROVIDER_NOT_ENABLED');
  expect(await db.generationAttempt.count()).toBe(0);
});

it('recovers after database-client restart, retains uncertain spend and fences the old worker', async () => {
  const job = await enqueueGeneration(db, request());
  const first = (await claimGeneration(db, 3000))!;
  await db.$disconnect();
  expect(
    (await db.generationJob.findUniqueOrThrow({ where: { id: job.id } })).state,
  ).toBe('running');
  await expire(first.run.id);
  const second = (await claimGeneration(db, 3000))!;
  expect(second.run.sequence).toBe(2);
  expect(second.run.id).not.toBe(first.run.id);
  expect((await budget()).committedMicroEur).toBe(2000);
  expect(await finishGeneration(db, first.run.id, result)).toBe(false);
  expect(await finishGeneration(db, second.run.id, result)).toBe(true);
  expect((await budget()).committedMicroEur).toBe(1400);
  expect(
    (
      await db.generationAttempt.findUniqueOrThrow({
        where: { id: first.run.id },
      })
    ).state,
  ).toBe('uncertain');
});

it('charges unknown failures conservatively, backs off and stops after three attempts', async () => {
  const job = await enqueueGeneration(db, request());
  const provider: GenerationProvider = {
    id: 'fake-v1',
    generate: async () => {
      throw new Error('sensitive provider error');
    },
  };
  for (let index = 0; index < 3; index++) {
    await ready();
    expect(await runGenerationOnce(db, 5000, provider)).toBe('processed');
    expect(await claimGeneration(db, 5000)).toBeNull();
  }
  expect((await budget()).committedMicroEur).toBe(3000);
  expect(
    (await db.generationJob.findUniqueOrThrow({ where: { id: job.id } })).state,
  ).toBe('failed');
  expect(await db.generationAttempt.count()).toBe(3);
});

it('times out a non-cooperative provider and ignores its late result', async () => {
  await enqueueGeneration(db, request());
  let release!: (value: typeof result) => void;
  let signal: AbortSignal | undefined;
  const provider: GenerationProvider = {
    id: 'fake-v1',
    generate: (input) => {
      signal = input.signal;
      return new Promise((resolve) => {
        release = resolve;
      });
    },
  };
  const started = Date.now();
  expect(await runGenerationOnce(db, 2000, provider)).toBe('processed');
  expect(Date.now() - started).toBeGreaterThanOrEqual(
    generationPolicy.timeoutMs,
  );
  expect(signal?.aborted).toBe(true);
  release(result);
  await new Promise((resolve) => setImmediate(resolve));
  expect((await budget()).committedMicroEur).toBe(1000);
  expect((await db.generationJob.findFirstOrThrow()).result).toBeNull();
});

it('rejects malformed/over-reservation provider receipts without refunding', async () => {
  for (const costMicroEur of [-1, 1001, NaN, 0.5]) {
    await enqueueGeneration(
      db,
      request(`bad-${String(costMicroEur).replace('.', '_')}`),
    );
    const lease = (await claimGeneration(db, 10000))!;
    expect(
      await finishGeneration(db, lease.run.id, { ...result, costMicroEur }),
    ).toBe(true);
  }
  expect((await budget()).committedMicroEur).toBe(4000);
  expect(await db.generationJob.count({ where: { state: 'succeeded' } })).toBe(
    0,
  );
});

it('rolls back reservation and lease together when the attempt insert fails', async () => {
  await enqueueGeneration(db, request());
  await db.$executeRawUnsafe(
    `CREATE FUNCTION fail_d12_attempt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected'; END $$`,
  );
  await db.$executeRawUnsafe(
    'CREATE TRIGGER fail_d12_attempt BEFORE INSERT ON "GenerationAttempt" FOR EACH ROW EXECUTE FUNCTION fail_d12_attempt()',
  );
  try {
    await expect(claimGeneration(db, 1000)).rejects.toThrow();
    expect(await db.generationBudget.count()).toBe(0);
    expect((await db.generationJob.findFirstOrThrow()).attempts).toBe(0);
  } finally {
    await db.$executeRawUnsafe(
      'DROP TRIGGER fail_d12_attempt ON "GenerationAttempt"',
    );
    await db.$executeRawUnsafe('DROP FUNCTION fail_d12_attempt()');
  }
  expect(await claimGeneration(db, 1000)).not.toBeNull();
});

it('rolls back result, settlement and refund together and permits exact retry', async () => {
  await enqueueGeneration(db, request());
  const lease = (await claimGeneration(db, 1000))!;
  await db.$executeRawUnsafe(
    `CREATE FUNCTION fail_d12_result() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.state = 'succeeded' THEN RAISE EXCEPTION 'injected'; END IF; RETURN NEW; END $$`,
  );
  await db.$executeRawUnsafe(
    'CREATE TRIGGER fail_d12_result BEFORE UPDATE ON "GenerationJob" FOR EACH ROW EXECUTE FUNCTION fail_d12_result()',
  );
  try {
    await expect(finishGeneration(db, lease.run.id, result)).rejects.toThrow();
    expect((await budget()).committedMicroEur).toBe(1000);
    expect((await db.generationAttempt.findFirstOrThrow()).state).toBe(
      'reserved',
    );
  } finally {
    await db.$executeRawUnsafe(
      'DROP TRIGGER fail_d12_result ON "GenerationJob"',
    );
    await db.$executeRawUnsafe('DROP FUNCTION fail_d12_result()');
  }
  expect(await finishGeneration(db, lease.run.id, result)).toBe(true);
  expect((await budget()).committedMicroEur).toBe(400);
});

it('keeps expired prior-month costs in their month and reserves retries in the current UTC month', async () => {
  await enqueueGeneration(db, request());
  const first = (await claimGeneration(db, 2000))!;
  const oldPeriod = '2000-01';
  await db.generationBudget.create({
    data: { period: oldPeriod, capMicroEur: 2000, committedMicroEur: 1000 },
  });
  await db.generationBudget.update({
    where: { period: first.run.period },
    data: { committedMicroEur: 0 },
  });
  await db.$executeRawUnsafe(
    'ALTER TABLE "GenerationAttempt" DISABLE TRIGGER protect_generation_attempt',
  );
  try {
    await db.generationAttempt.update({
      where: { id: first.run.id },
      data: { period: oldPeriod, leaseUntil: new Date(0) },
    });
  } finally {
    await db.$executeRawUnsafe(
      'ALTER TABLE "GenerationAttempt" ENABLE TRIGGER protect_generation_attempt',
    );
  }
  const next = (await claimGeneration(db, 2000))!;
  expect(next.run.period).toBe(first.run.period);
  expect(await finishGeneration(db, next.run.id, result)).toBe(true);
  const budgets = await db.generationBudget.findMany();
  for (const budget of budgets) {
    const runs = await db.generationAttempt.findMany({
      where: { period: budget.period },
    });
    expect(budget.committedMicroEur).toBe(
      runs.reduce(
        (sum, run) => sum + (run.chargedMicroEur ?? run.reservedMicroEur),
        0,
      ),
    );
  }
  expect(
    (
      await db.generationBudget.findUniqueOrThrow({
        where: { period: oldPeriod },
      })
    ).committedMicroEur,
  ).toBe(1000);
});

it('database checks reject cap inflation, changed lease identities and partial receipts', async () => {
  await enqueueGeneration(db, request());
  const lease = (await claimGeneration(db, 1000))!;
  await expect(
    db.generationBudget.update({
      where: { period: lease.run.period },
      data: { capMicroEur: 2000 },
    }),
  ).rejects.toThrow();
  await expect(
    db.generationBudget.update({
      where: { period: lease.run.period },
      data: { committedMicroEur: 1001 },
    }),
  ).rejects.toThrow();
  await expect(
    db.generationAttempt.update({
      where: { id: lease.run.id },
      data: { leaseUntil: new Date(0) },
    }),
  ).rejects.toThrow();
  await expect(
    db.generationAttempt.update({
      where: { id: lease.run.id },
      data: { state: 'settled', inputTokens: 1, outputTokens: 1 },
    }),
  ).rejects.toThrow();
  await expect(
    db.generationJob.update({
      where: { id: lease.job.id },
      data: { result: 'partial result' },
    }),
  ).rejects.toThrow();
  expect((await budget()).committedMicroEur).toBe(1000);
});

it('a fresh worker process recovers a lease left by an exited process', async () => {
  const job = await enqueueGeneration(db, request());
  const base = `
    import { PrismaClient } from './src/generated/prisma/client.ts';
    import { PrismaPg } from '@prisma/adapter-pg';
    import { claimGeneration, runGenerationOnce } from './src/server/content/generation-jobs.ts';
    import { fakeGenerationProvider } from './src/server/content/fake-generation-provider.ts';
    const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});
  `;
  function worker(code: string) {
    const child = spawnSync(
      process.execPath,
      [
        '--conditions=react-server',
        '--experimental-strip-types',
        '--input-type=module',
        '-e',
        base + code,
      ],
      { encoding: 'utf8', timeout: 10000 },
    );
    expect(child.status, child.stderr).toBe(0);
    return JSON.parse(child.stdout.trim());
  }
  const attemptId = worker(
    `const lease = await claimGeneration(db, 3000); console.log(JSON.stringify(lease.run.id)); process.exit(0);`,
  );
  await expire(attemptId);
  expect(
    worker(
      `console.log(JSON.stringify(await runGenerationOnce(db, 3000, fakeGenerationProvider))); await db.$disconnect();`,
    ),
  ).toBe('processed');
  expect(
    (await db.generationJob.findUniqueOrThrow({ where: { id: job.id } })).state,
  ).toBe('succeeded');
  expect((await budget()).committedMicroEur).toBe(1400);
  expect(await finishGeneration(db, attemptId, result)).toBe(false);
});

it('makes every newly enqueued immediate job claimable without a timer delay', async () => {
  for (let n = 0; n < 40; n++) {
    const job = await enqueueGeneration(db, request(`immediate-${n}`));
    const lease = await claimGeneration(db, 1000);
    expect(
      lease,
      `new immediate job ${job.id} available ${job.availableAt.toISOString()}`,
    ).not.toBeNull();
    if (!lease) throw new Error('IMMEDIATE_JOB_NOT_DUE');
    expect(
      await finishGeneration(db, lease.run.id, {
        draft: 'synthetic',
        costMicroEur: 0,
        inputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(true);
  }
});
