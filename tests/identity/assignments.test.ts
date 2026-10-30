import { afterAll, beforeEach, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
vi.mock('server-only', () => ({}));
import { db, config, provision, type Browser } from './helpers';
import { seedItems } from '../../src/server/content/arithmetic';
import { studentsHandler } from '../../src/server/identity/students';
import {
  assignmentsHandler,
  readAssignment,
} from '../../src/server/practice/assignments';

beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit", "ArithmeticQuestionVersion" CASCADE',
  );
});
afterAll(() => db.$disconnect());
function headers(browser: Browser) {
  return {
    origin: config.origin,
    'content-type': 'application/json',
    cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  };
}
async function setup() {
  const { browser } = await provision();
  const response = await studentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/identity/students`, {
      method: 'POST',
      headers: headers(browser),
      body: JSON.stringify({ displayName: 'Synthetic D05' }),
    }),
  );
  expect(response.status).toBe(201);
  return { browser, studentId: (await response.json()).id as string };
}
function assign(browser: Browser, studentId: string, requestId = randomUUID()) {
  return assignmentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/practice/assignments`, {
      method: 'POST',
      headers: headers(browser),
      body: JSON.stringify({ studentId, requestId }),
    }),
  );
}
it('publishes exact versions and pins immutable ordered membership with a key-free DTO', async () => {
  const { browser, studentId } = await setup();
  const response = await assign(browser, studentId);
  expect(response.status).toBe(201);
  const { id } = await response.json();
  const student = await db.student.findUniqueOrThrow({
    where: { id: studentId },
  });
  const result = await db.$transaction((tx) =>
    readAssignment(tx, { kind: 'student', userId: student.userId }, id),
  );
  expect(result?.items).toHaveLength(10);
  expect(result?.items.map((i) => i.position)).toEqual([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  ]);
  expect(Object.keys(result!.items[0]!).sort()).toEqual([
    'id',
    'position',
    'prompt',
    'responseType',
  ]);
  expect(Object.keys(result!).sort()).toEqual([
    'category',
    'id',
    'items',
    'revision',
    'studentId',
    'subject',
  ]);
  expect(await db.arithmeticQuestionVersion.count()).toBe(10);
  expect(await db.arithmeticQuestionVersion.findFirst()).toMatchObject({
    publicationPolicy: 'synthetic-addition-seed-v1',
    evaluatorVersion: 'integer-exact-v1',
  });
  const first = await db.assignmentItem.findFirstOrThrow({
    where: { assignmentId: id },
  });
  await expect(
    db.assignment.update({
      where: { id },
      data: { selectionVersion: 'changed' },
    }),
  ).rejects.toThrow();
  await expect(
    db.assignmentItem.update({
      where: { id: first.id },
      data: { position: 9 },
    }),
  ).rejects.toThrow();
  await expect(
    db.assignmentItem.delete({ where: { id: first.id } }),
  ).rejects.toThrow();
  await expect(
    db.arithmeticQuestionVersion.update({
      where: { id: first.questionVersionId! },
      data: { answer: 'wrong' },
    }),
  ).rejects.toThrow();
  await expect(
    db.arithmeticQuestionVersion.delete({
      where: { id: first.questionVersionId! },
    }),
  ).rejects.toThrow();
  expect(
    await db.$transaction((tx) =>
      readAssignment(tx, { kind: 'student', userId: student.userId }, id),
    ),
  ).toEqual(result);
});
it('concurrent retries create one assignment and conflicting payloads do not reuse it', async () => {
  const { browser, studentId } = await setup();
  const requestId = randomUUID();
  const results = await Promise.all([
    assign(browser, studentId, requestId),
    assign(browser, studentId, requestId),
  ]);
  expect(results.map((r) => r.status).sort()).toEqual([200, 201]);
  expect(await results[0]!.json()).toEqual(await results[1]!.json());
  expect(await db.assignment.count()).toBe(1);
  expect(
    await db.identityAudit.count({
      where: { event: 'synthetic-assignment-created' },
    }),
  ).toBe(1);
  const second = await studentsHandler(
    db,
    config,
    new Request(`${config.origin}/api/identity/students`, {
      method: 'POST',
      headers: headers(browser),
      body: JSON.stringify({ displayName: 'Second synthetic' }),
    }),
  );
  expect(
    (await assign(browser, (await second.json()).id, requestId)).status,
  ).toBe(409);
});
it('denies cross-family IDs, revoked assignment capability, and anonymous/student-generic sessions', async () => {
  const { browser, studentId } = await setup();
  expect((await assign(browser, randomUUID())).status).toBe(404);
  const created = await assign(browser, studentId);
  const { id } = await created.json();
  expect(
    await db.$transaction((tx) =>
      readAssignment(tx, { kind: 'student', userId: randomUUID() }, id),
    ),
  ).toBeNull();
  expect(
    await db.$transaction((tx) =>
      readAssignment(
        tx,
        { kind: 'adult', userId: randomUUID(), mfaVerifiedAt: new Date() },
        id,
      ),
    ),
  ).toBeNull();
  const get = new Request(`${config.origin}/api/practice/assignments/${id}`, {
    headers: headers(browser),
  });
  expect((await assignmentsHandler(db, config, get)).status).toBe(401);
  await db.guardianStudent.updateMany({ data: { canAssign: false } });
  expect((await assign(browser, studentId)).status).toBe(404);
});
it('audit failure rolls back publication and assignment together', async () => {
  const { browser, studentId } = await setup();
  await db.$executeRawUnsafe(
    `ALTER TABLE "IdentityAudit" ADD CONSTRAINT d05_fail_audit CHECK (event <> 'synthetic-assignment-created')`,
  );
  try {
    expect((await assign(browser, studentId)).status).toBe(503);
    expect(await db.assignment.count()).toBe(0);
    expect(await db.assignmentItem.count()).toBe(0);
    expect(await db.arithmeticQuestionVersion.count()).toBe(0);
  } finally {
    await db.$executeRawUnsafe(
      'ALTER TABLE "IdentityAudit" DROP CONSTRAINT d05_fail_audit',
    );
  }
});
it('rejects incomplete database snapshots at commit and invalid HTTP input before writes', async () => {
  const { browser, studentId } = await setup();
  const guardian = await db.guardianStudent.findFirstOrThrow();
  await expect(
    db.assignment.create({
      data: {
        id: randomUUID(),
        studentId,
        createdBy: guardian.guardianId,
        requestId: randomUUID(),
        requestHash: 'test',
        selectionVersion: 'test',
        itemCount: 1,
      },
    }),
  ).rejects.toThrow();
  for (const body of [
    { studentId },
    { studentId, requestId: randomUUID(), answer: '1' },
    { studentId, requestId: 'invalid' },
  ]) {
    expect(
      (
        await assignmentsHandler(
          db,
          config,
          new Request(`${config.origin}/api/practice/assignments`, {
            method: 'POST',
            headers: headers(browser),
            body: JSON.stringify(body),
          }),
        )
      ).status,
    ).toBe(400);
  }
  expect(
    (
      await assignmentsHandler(
        db,
        config,
        new Request(`${config.origin}/api/practice/assignments`, {
          method: 'POST',
          headers: { ...headers(browser), origin: 'https://other.invalid' },
          body: '{}',
        }),
      )
    ).status,
  ).toBe(403);
  expect(await db.assignment.count()).toBe(0);
});

it('refuses mismatched stored publication and never silently repairs immutable content', async () => {
  const { browser, studentId } = await setup();
  const item = seedItems()[0]!;
  await db.arithmeticQuestionVersion.create({
    data: { ...item, answer: 'incorrect-key' },
  });
  expect((await assign(browser, studentId)).status).toBe(503);
  expect(await db.assignment.count()).toBe(0);
  expect(await db.arithmeticQuestionVersion.count()).toBe(1);
  expect(
    (
      await db.arithmeticQuestionVersion.findUniqueOrThrow({
        where: { id: item.id },
      })
    ).answer,
  ).toBe('incorrect-key');
});
