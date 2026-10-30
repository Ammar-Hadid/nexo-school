import { afterAll, beforeEach, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
vi.mock('server-only', () => ({}));
import { db, config, provision } from './helpers';
import { studentsHandler } from '../../src/server/identity/students';
import { assignmentsHandler } from '../../src/server/practice/assignments';
import {
  submitAnswer,
  readProgress,
  type SubmitInput,
} from '../../src/server/practice/submissions';
import type { IdentityActor } from '../../src/modules/identity/authorization';

beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit", "ArithmeticQuestionVersion" CASCADE',
  );
});
afterAll(() => db.$disconnect());
async function setup() {
  const { browser } = await provision();
  const headers = {
    origin: config.origin,
    'content-type': 'application/json',
    cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  };
  const response = await studentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/identity/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ displayName: 'Synthetic submission learner' }),
    }),
  );
  const { id: studentId } = await response.json();
  const created = await assignmentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/practice/assignments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ studentId, requestId: randomUUID() }),
    }),
  );
  expect(created.status).toBe(201);
  const { id } = await created.json();
  const student = await db.student.findUniqueOrThrow({
    where: { id: studentId },
  });
  const actor: IdentityActor = { kind: 'student', userId: student.userId };
  const items = await db.assignmentItem.findMany({
    where: { assignmentId: id },
    orderBy: { position: 'asc' },
    include: { question: true },
  });
  const command = (
    index = 0,
    revision = 0,
    answer = items[index]!.question!.answer,
  ): SubmitInput => ({
    itemId: items[index]!.id,
    expectedRevision: revision,
    answer,
    requestId: randomUUID(),
  });
  const submit = (input: SubmitInput) =>
    db.$transaction((tx) => submitAnswer(tx, actor, id, input));
  return { actor, id, items, command, submit, headers, studentId };
}
it('commits exact original/retry history and reveals a solution only after the second miss', async () => {
  const { id, items, command, submit, actor } = await setup();
  for (let index = 0; index < 10; index++) {
    const response = await submit(
      command(
        index,
        index,
        index === 3 || index === 8 ? '999' : items[index]!.question!.answer,
      ),
    );
    expect(response.status).toBe(200);
    const receipt = await response.json();
    expect(receipt.solution).toBeUndefined();
    expect(receipt.progress.result).toBeNull();
    if (index === 9)
      expect(receipt.progress.next).toEqual({
        itemId: items[3]!.id,
        attemptNumber: 2,
      });
  }
  expect((await submit(command(8, 10))).status).toBe(409); // Cannot skip the first queued retry.
  const retry = await (await submit(command(3, 10, ' 000012 '))).json();
  expect(retry.correct).toBe(true); // 3 + 9, independently fixed expected value.
  expect(retry.solution).toBeUndefined();
  const final = await (await submit(command(8, 11, '999'))).json();
  expect(final.solution.answer).toBe('12'); // 8 + 4.
  expect(final.progress.result).toEqual({
    total: 10,
    firstCorrect: 8,
    secondCorrect: 1,
    missed: 1,
    solved: 9,
    weightedScore: 8.5,
  });
  expect(final.progress.next).toBeNull();
  expect((await submit(command(8, 12))).status).toBe(409);
  const saved = await db.practiceAttempt.findMany({
    where: { assignmentId: id },
    orderBy: { sequence: 'asc' },
  });
  expect(saved).toHaveLength(12);
  expect(saved[10]).toMatchObject({
    rawAnswer: ' 000012 ',
    normalizedAnswer: '12',
    attemptNumber: 2,
    scoreUnits: 1,
    policyVersion: 'deferred-retry-v1',
    evaluatorVersion: 'integer-exact-v1',
  });
  expect(saved.map((a) => a.itemId)).toEqual([
    ...items.map((i) => i.id),
    items[3]!.id,
    items[8]!.id,
  ]);
  expect(saved.reduce((n, a) => n + a.scoreUnits, 0)).toBe(17);
  // Recreate the database connection: state comes only from committed facts.
  await db.$disconnect();
  const restored = await db.$transaction((tx) => readProgress(tx, actor, id));
  expect((await restored.json()).lastSubmission).toEqual(final);
  await expect(
    db.practiceAttempt.update({
      where: { id: saved[0]!.id },
      data: { rawAnswer: 'changed' },
    }),
  ).rejects.toThrow();
  await expect(
    db.practiceAttempt.delete({ where: { id: saved[0]!.id } }),
  ).rejects.toThrow();
});
it('concurrent exact retries return one receipt; conflicting same-key and stale commands consume no chance', async () => {
  const { submit, command, id } = await setup();
  const first = command();
  const responses = await Promise.all([submit(first), submit(first)]);
  expect(responses.map((r) => r.status)).toEqual([200, 200]);
  const receipt = await responses[0]!.json();
  expect(await responses[1]!.json()).toEqual(receipt);
  expect((await submit({ ...first, answer: '1' })).status).toBe(409);
  expect((await submit(command(1, 0))).status).toBe(409);
  const next = await Promise.all([
    submit(command(1, 1)),
    submit(command(1, 1, '999')),
  ]);
  expect(next.map((r) => r.status).sort()).toEqual([200, 409]);
  expect(await db.practiceAttempt.count({ where: { assignmentId: id } })).toBe(
    2,
  );
  expect(await (await submit(first)).json()).toEqual(receipt); // Original response survives later progress.
});
it('invalid inputs, premature retries, wrong students and adults consume no attempts', async () => {
  const { submit, command, actor, id } = await setup();
  for (const answer of ['', ' ', '-1', '1.0', '1e2', '9999999'])
    expect((await submit(command(0, 0, answer))).status).toBe(400);
  expect((await submit(command(1, 0))).status).toBe(409);
  for (const other of [
    { kind: 'student', userId: randomUUID() },
    { kind: 'adult', userId: actor.userId, mfaVerifiedAt: new Date() },
  ] satisfies IdentityActor[]) {
    expect(
      (await db.$transaction((tx) => submitAnswer(tx, other, id, command())))
        .status,
    ).toBe(404);
    expect(
      (await db.$transaction((tx) => readProgress(tx, other, id))).status,
    ).toBe(404);
  }
  expect(await db.practiceAttempt.count()).toBe(0);
  await submit(command(0, 0, '999'));
  expect((await submit(command(0, 1))).status).toBe(409); // Original round must finish.
  expect(await db.practiceAttempt.count()).toBe(1);
});
it('rolls back on audit failure and permits the exact same command to retry safely', async () => {
  const { submit, command } = await setup();
  const input = command();
  await db.$executeRawUnsafe(
    `ALTER TABLE "IdentityAudit" ADD CONSTRAINT d06_fail_audit CHECK (event <> 'practice-answer-committed')`,
  );
  try {
    await expect(submit(input)).rejects.toThrow();
    expect(await db.practiceAttempt.count()).toBe(0);
  } finally {
    await db.$executeRawUnsafe(
      'ALTER TABLE "IdentityAudit" DROP CONSTRAINT d06_fail_audit',
    );
  }
  expect((await submit(input)).status).toBe(200);
  expect(await db.practiceAttempt.count()).toBe(1);
});
it('database rejects inconsistent item ownership and invalid attempt scoring', async () => {
  const { submit, command, id } = await setup();
  await submit(command());
  const saved = await db.practiceAttempt.findFirstOrThrow();
  const data = {
    ...saved,
    id: randomUUID(),
    requestId: randomUUID(),
    sequence: 2,
    attemptNumber: 2,
    response: {},
  };
  await expect(
    db.practiceAttempt.create({ data: { ...data, scoreUnits: 2 } }),
  ).rejects.toThrow();
  await expect(
    db.practiceAttempt.create({
      data: { ...data, assignmentId: randomUUID(), scoreUnits: 1 },
    }),
  ).rejects.toThrow();
  expect(await db.practiceAttempt.count({ where: { assignmentId: id } })).toBe(
    1,
  );
});

it('D07 saves drafts and acknowledgements with ownership, stale-tab and rollback protection', async () => {
  const { savePresentation } =
    await import('../../src/server/practice/presentation');
  const { actor, id, command, submit } = await setup();
  const save = (
    expectedVersion: number,
    expectedRevision: number,
    action: 'draft' | 'continue',
    answer = '',
  ) =>
    db.$transaction((tx) =>
      savePresentation(tx, actor, id, {
        expectedVersion,
        expectedRevision,
        action,
        answer,
      }),
    );
  expect((await save(0, 0, 'draft', '001')).status).toBe(200);
  expect((await save(0, 0, 'draft', '999')).status).toBe(409);
  const read = () =>
    db.$transaction((tx) => readProgress(tx, actor, id)).then((r) => r.json());
  expect((await read()).presentation.answer).toBe('001');
  const other: IdentityActor = { kind: 'student', userId: randomUUID() };
  expect(
    (
      await db.$transaction((tx) =>
        savePresentation(tx, other, id, {
          expectedVersion: 1,
          expectedRevision: 0,
          action: 'draft',
          answer: '4',
        }),
      )
    ).status,
  ).toBe(404);
  await expect(
    db.$transaction(async (tx) => {
      await savePresentation(tx, actor, id, {
        expectedVersion: 1,
        expectedRevision: 0,
        action: 'draft',
        answer: '4',
      });
      throw new Error('rollback');
    }),
  ).rejects.toThrow('rollback');
  expect((await read()).presentation.answer).toBe('001');
  await submit(command());
  expect((await save(1, 0, 'draft', '5')).status).toBe(409);
  expect((await save(1, 1, 'draft', '5')).status).toBe(409);
  expect((await read()).presentation.acknowledgedRevision).toBe(0);
  expect((await save(1, 1, 'continue')).status).toBe(200);
  await db.$disconnect();
  expect((await read()).presentation).toMatchObject({
    version: 2,
    answer: '',
    acknowledgedRevision: 1,
  });
  const raced = await Promise.all([
    save(2, 1, 'draft', '7'),
    save(2, 1, 'draft', '8'),
  ]);
  expect(raced.map((r) => r.status).sort()).toEqual([200, 409]);
});

it('D08 guardian projection equals committed attempts, withholds unfinished scores/keys and excludes drafts', async () => {
  const { guardianResultsHandler } =
    await import('../../src/server/practice/guardian-results');
  const { savePresentation } =
    await import('../../src/server/practice/presentation');
  const { actor, id, command, submit, headers, items } = await setup();
  const get = async () =>
    guardianResultsHandler(
      db,
      config,
      new Request(`${config.origin}/api/guardian/results/${id}`, { headers }),
    );
  await db.$transaction((tx) =>
    savePresentation(tx, actor, id, {
      action: 'draft',
      answer: 'private-draft',
      expectedVersion: 0,
      expectedRevision: 0,
    }),
  );
  const response = await get();
  expect(response.headers.get('cache-control')).toBe('no-store');
  let task = await response.json();
  expect(task.result.status).toBe('Nog niet gestart');
  expect(task.result.score).toBeUndefined();
  expect(JSON.stringify(task)).not.toMatch(
    /private-draft|answerModel|normalizedAnswer|policyVersion|requestId|evaluator/,
  );
  for (let index = 0; index < 10; index++)
    await submit(
      command(
        index,
        index,
        index === 3 || index === 8 ? '999' : items[index]!.question!.answer,
      ),
    );
  task = await (await get()).json();
  expect(task.result).toMatchObject({
    complete: false,
    answered: 10,
    pendingRetries: 2,
  });
  expect(task.result.score).toBeUndefined();
  expect(
    task.result.questions.every(
      (q: { answerModel?: unknown }) => q.answerModel === undefined,
    ),
  ).toBe(true);
  await submit(command(3, 10, ' 000012 '));
  await submit(command(8, 11, '999'));
  await db.$disconnect();
  task = await (await get()).json();
  expect(task.result).toMatchObject({
    complete: true,
    first: 8,
    second: 1,
    solved: 9,
    score: 8.5,
    total: 10,
  });
  const saved = await db.practiceAttempt.findMany({
    where: { assignmentId: id },
    orderBy: { sequence: 'asc' },
  });
  for (const [index, question] of task.result.questions.entries()) {
    expect(question.prompt).toBe(items[index]!.question!.prompt);
    expect(
      question.attempts.map(
        (a: { answer: string; correct: boolean; retry: boolean }) => [
          a.answer,
          a.correct,
          a.retry,
        ],
      ),
    ).toEqual(
      saved
        .filter((a) => a.itemId === items[index]!.id)
        .map((a) => [a.rawAnswer, a.correct, a.attemptNumber === 2]),
    );
  }
  expect(task.result.questions[3].attempts[1].label).toBe(' 000012 ');
  expect(task.result.questions[8].answerModel.answer).toBe('12');
});

it('D08 rejects missing/MFA-less/student sessions, wrong family, revoked view and malformed routes', async () => {
  const { guardianResultsHandler } =
    await import('../../src/server/practice/guardian-results');
  const { hashPassword } = await import('better-auth/crypto');
  const { Browser, totp } = await import('./helpers');
  const { id, headers, studentId } = await setup();
  const request = (path = `/${id}`, customHeaders = headers, method = 'GET') =>
    guardianResultsHandler(
      db,
      config,
      new Request(`${config.origin}/api/guardian/results${path}`, {
        headers: customHeaders,
        method,
      }),
    );
  expect((await request('', { ...headers, cookie: '' })).status).toBe(401);
  expect(
    (await request('', { ...headers, origin: 'https://other.invalid' })).status,
  ).toBe(403);
  expect((await request('?studentId=anything')).status).toBe(404);
  expect((await request('', headers, 'POST')).status).toBe(405);
  const other = {
    email: 'other@example.invalid',
    name: 'Other synthetic guardian',
    password: 'another-synthetic-password-0123456789',
  };
  // A second real MFA session, with no relationship to the first family.
  await db.user.create({
    data: {
      id: 'd08-other',
      email: other.email,
      name: other.name,
      accounts: {
        create: {
          id: 'd08-credential',
          accountId: 'd08-other',
          providerId: 'credential',
          password: await hashPassword(other.password),
        },
      },
    },
  });
  const browser = new Browser();
  await browser.call('/send-verification-email', { email: other.email });
  const message = await db.localAuthMessage.findFirstOrThrow({
    where: { recipient: other.email, kind: 'verify-email' },
  });
  const url = new URL(message.url);
  await browser.call(`/verify-email?${url.searchParams}`);
  await browser.call('/sign-in/email', {
    email: other.email,
    password: other.password,
  });
  const secondHeaders = () => ({
    ...headers,
    cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  });
  expect((await request('', secondHeaders())).status).toBe(401);
  const enabled = await (
    await browser.call('/two-factor/enable', { password: other.password })
  ).json();
  await browser.call('/two-factor/verify-totp', {
    code: totp(new URL(enabled.totpURI).searchParams.get('secret')!),
  });
  expect(await (await request('', secondHeaders())).json()).toEqual([]);
  const missing = await request(`/${randomUUID()}`, secondHeaders());
  const denied = await request(`/${id}`, secondHeaders());
  expect(denied.status).toBe(404);
  expect(await denied.json()).toEqual(await missing.json());
  await db.guardianStudent.updateMany({
    where: { studentId },
    data: { canView: false },
  });
  expect((await request()).status).toBe(404);
  expect(await (await request('')).json()).toEqual([]);
  await db.guardianStudent.updateMany({
    where: { studentId },
    data: { canView: true, revokedAt: new Date() },
  });
  expect((await request()).status).toBe(404);
});

it('projects only owned server-recorded attempts into a reproducible disabled shadow audit', async () => {
  const { savedEvidenceShadow } =
    await import('../../src/server/practice/saved-evidence');
  const { actor, studentId, command, submit, headers } = await setup();
  const before = await db.practiceAttempt.count();
  await submit(command(0, 0, '999'));
  const partial = await db.$transaction((tx) =>
    savedEvidenceShadow(tx, actor, studentId, new Date()),
  );
  expect(partial.facts).toHaveLength(1);
  expect(partial.facts[0]).toMatchObject({
    integrity: 'verified',
    purpose: 'practice',
    assistance: 'unknown',
    complete: false,
    contentStatus: 'synthetic-only',
  });
  expect(partial.evidence).toHaveLength(0);
  expect(partial.assessment.decision).toBe('more-evidence');
  for (let i = 1; i < 10; i++) await submit(command(i, i));
  await submit(command(0, 10));
  // Create a later assignment of the same source stock; it is already exposed.
  const created = await assignmentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/practice/assignments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ studentId, requestId: randomUUID() }),
    }),
  );
  const second = await created.json();
  const item = await db.assignmentItem.findFirstOrThrow({
    where: { assignmentId: second.id },
    orderBy: { position: 'asc' },
  });
  await db.$transaction((tx) =>
    submitAnswer(tx, actor, second.id, {
      itemId: item.id,
      requestId: randomUUID(),
      expectedRevision: 0,
      answer: '0',
    }),
  );
  const asOf = new Date();
  const report = await db.$transaction((tx) =>
    savedEvidenceShadow(tx, actor, studentId, asOf),
  );
  expect(report.facts).toHaveLength(12);
  expect(report.facts.filter((f) => f.attemptNumber === 2)).toHaveLength(1);
  expect(report.facts.at(-1)?.priorExposure).toBe(true);
  expect(report.facts.filter((f) => f.complete)).toHaveLength(11);
  expect(report.evidence).toEqual([]);
  expect(report.activation).toBe('disabled');
  expect(report.assessment.skills[0]?.conflicts).toEqual([]);
  expect(report.sourceHash).toMatch(/^[a-f0-9]{64}$/);
  await db.$disconnect();
  expect(
    await db.$transaction((tx) =>
      savedEvidenceShadow(tx, actor, studentId, asOf),
    ),
  ).toEqual(report);
  expect(await db.practiceAttempt.count()).toBe(before + 12);
  await expect(
    db.$transaction((tx) =>
      savedEvidenceShadow(
        tx,
        { kind: 'student', userId: randomUUID() },
        studentId,
        asOf,
      ),
    ),
  ).rejects.toThrow('SHADOW_ACCESS_DENIED');
  await expect(
    db.$transaction((tx) =>
      savedEvidenceShadow(
        tx,
        { kind: 'adult', userId: randomUUID(), mfaVerifiedAt: asOf },
        studentId,
        asOf,
      ),
    ),
  ).rejects.toThrow('SHADOW_ACCESS_DENIED');
});
