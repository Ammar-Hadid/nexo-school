import { afterAll, beforeEach, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
vi.mock('server-only', () => ({}));
import { db, config, provision } from './helpers';
import { contentReviewHandler } from '../../src/server/content/review';
import { studentsHandler } from '../../src/server/identity/students';
import {
  assignmentsHandler,
  readAssignment,
} from '../../src/server/practice/assignments';
import {
  submitAnswer,
  readProgress,
} from '../../src/server/practice/submissions';
import { contentCommand } from '../../src/server/content/records';
import { contentDeliveryHandler } from '../../src/server/content/delivery';
import { savedEvidenceShadow } from '../../src/server/practice/saved-evidence';
import { guardianResultsHandler } from '../../src/server/practice/guardian-results';
import type { ReviewBatch } from '../../src/modules/content/review/review-contract';
beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit", "CoverageObjective", "ContentRubricVersion", "ArithmeticQuestionVersion" CASCADE',
  );
});
afterAll(() => db.$disconnect());
async function setup(publish = true) {
  const { browser } = await provision();
  const headers = new Headers({
    origin: config.origin,
    'content-type': 'application/json',
    cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  });
  const request = (path: string, body?: unknown) =>
    new Request(`${config.origin}${path}`, {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  const review = (body?: unknown) =>
    contentReviewHandler(
      db,
      config,
      request('/api/guardian/content-review?batch=optellen', body),
    );
  expect(
    (
      await contentReviewHandler(
        db,
        config,
        request('/api/guardian/content-supply', {
          action: 'prepare',
          demand: 2,
        }),
      )
    ).status,
  ).toBe(200);
  const batch: ReviewBatch = await (await review()).json();
  const refs = batch.items.map(({ id, contentHash }) => ({ id, contentHash }));
  if (publish) {
    expect(
      (
        await review({
          action: 'approve',
          refs,
          notes:
            'Simulated technical review in disposable synthetic test; not educational approval.',
        })
      ).status,
    ).toBe(200);
    expect((await review({ action: 'publish', refs })).status).toBe(200);
  }
  const studentResponse = await studentsHandler(
    db,
    config,
    request('/api/identity/students', {
      displayName: 'Synthetic content learner',
    }),
  );
  const { id: studentId } = await studentResponse.json();
  const student = await db.student.findUniqueOrThrow({
    where: { id: studentId },
  });
  const actor = { kind: 'student' as const, userId: student.userId };
  const coverageId = (
    await db.contentVersion.findUniqueOrThrow({ where: { id: refs[0]!.id } })
  ).coverageId;
  const assignmentBody = {
    studentId,
    requestId: randomUUID(),
    source: 'published-practice',
    coverageId,
    count: 2,
  };
  const assign = (body: unknown = assignmentBody) =>
    assignmentsHandler(db, config, request('/api/practice/assignments', body));
  const delivery = (body?: unknown) =>
    contentDeliveryHandler(
      db,
      config,
      request('/api/guardian/content-delivery', body),
    );
  return {
    headers,
    request,
    review,
    refs,
    studentId,
    actor,
    coverageId,
    assignmentBody,
    assign,
    delivery,
  };
}
it('reuses published stock in D05; private exact versions, bounded exposure, shortage and replay survive reconnect', async () => {
  const s = await setup();
  const responses = await Promise.all([s.assign(), s.assign()]);
  expect(responses.map((r) => r.status).sort()).toEqual([200, 201]);
  const { id } = await responses[0]!.json();
  const items = await db.assignmentItem.findMany({
    where: { assignmentId: id },
    orderBy: { position: 'asc' },
    include: { content: { include: { rubric: true } } },
  });
  expect(items).toHaveLength(2);
  expect(
    items.every(
      (i) =>
        i.contentVersionId &&
        i.contentHash &&
        i.exposureKey &&
        i.familyId &&
        i.purpose === 'practice' &&
        i.questionVersionId === null,
    ),
  ).toBe(true);
  const visible = await db.$transaction((tx) =>
    readAssignment(tx, s.actor, id),
  );
  expect(JSON.stringify(visible)).not.toMatch(
    /acceptedAnswers|privateEvaluation|rubricHash|familyId|contentHash/,
  );
  const key = JSON.parse(items[0]!.content!.snapshot).payload.privateEvaluation
    .acceptedAnswers[0];
  const command = {
    requestId: randomUUID(),
    itemId: items[0]!.id,
    expectedRevision: 0,
    answer: key,
  };
  expect(
    (await db.$transaction((tx) => submitAnswer(tx, s.actor, id, command)))
      .status,
  ).toBe(200);
  await db.$disconnect();
  expect(
    await (await db.$transaction((tx) => readProgress(tx, s.actor, id))).json(),
  ).toMatchObject({
    progress: { revision: 1 },
    lastSubmission: { correct: true },
  });
  const shortage = await s.assign({
    ...s.assignmentBody,
    requestId: randomUUID(),
  });
  expect(shortage.status).toBe(409);
  expect(await shortage.json()).toMatchObject({
    error: 'CONTENT_SHORTAGE',
    requested: 2,
    available: 0,
    shortage: 2,
  });
  expect(await db.assignment.count()).toBe(1);
  expect((await s.assign({ ...s.assignmentBody, count: 1 })).status).toBe(409);
});
it('draft, stale, unsupported purpose and missing authority cannot become assignments', async () => {
  const s = await setup(false);
  expect((await s.assign()).status).toBe(409);
  expect(
    (await s.assign({ ...s.assignmentBody, purpose: 'retention' })).status,
  ).toBe(400);
  await s.review({
    action: 'approve',
    refs: s.refs,
    notes: 'Synthetic review only.',
  });
  await s.review({ action: 'publish', refs: s.refs });
  const row = await db.contentVersion.findUniqueOrThrow({
    where: { id: s.refs[0]!.id },
  });
  expect(
    (
      await contentCommand(db, config, s.headers, {
        action: 'create-content',
        contentId: row.contentId,
        revision: 2,
        coverageId: row.coverageId,
        rubricVersionId: row.rubricVersionId,
        payload: JSON.parse(row.snapshot).payload,
      })
    ).status,
  ).toBe(201);
  expect((await s.assign()).status).toBe(409);
  await db.guardianStudent.updateMany({ data: { canAssign: false } });
  expect((await s.assign({ ...s.assignmentBody, count: 1 })).status).toBe(404);
});
it('withdrawal pauses unfinished work, preserves attempts, blocks replay feedback and excludes evidence', async () => {
  const s = await setup();
  const { id } = await (await s.assign()).json();
  const items = await db.assignmentItem.findMany({
    where: { assignmentId: id },
    orderBy: { position: 'asc' },
  });
  const command = {
    requestId: randomUUID(),
    itemId: items[0]!.id,
    expectedRevision: 0,
    answer: '999',
  };
  await db.$transaction((tx) => submitAnswer(tx, s.actor, id, command));
  const before = await db.practiceAttempt.findMany({
    where: { assignmentId: id },
  });
  const input = {
    action: 'withdraw',
    contentVersionId: items[0]!.contentVersionId,
    contentHash: items[0]!.contentHash,
    reason: 'incorrect-answer',
    note: 'Synthetic defect rehearsal; do not use this result.',
  };
  expect((await s.delivery(input)).status).toBe(201);
  expect((await s.delivery(input)).status).toBe(200);
  expect((await s.delivery({ ...input, note: 'changed retry' })).status).toBe(
    409,
  );
  expect(
    (await s.assign({ ...s.assignmentBody, requestId: randomUUID() })).status,
  ).toBe(409);
  expect(
    (await db.$transaction((tx) => submitAnswer(tx, s.actor, id, command)))
      .status,
  ).toBe(409);
  const progress = await (
    await db.$transaction((tx) => readProgress(tx, s.actor, id))
  ).json();
  expect(progress).toMatchObject({
    withdrawn: true,
    lastSubmission: null,
    progress: { next: null, result: null, revision: 1 },
  });
  expect(
    await db.practiceAttempt.findMany({ where: { assignmentId: id } }),
  ).toEqual(before);
  const guardian = await (
    await guardianResultsHandler(
      db,
      config,
      s.request(`/api/guardian/results/${id}`),
    )
  ).json();
  expect(guardian.corrections[0].note).toBe(input.note);
  expect(guardian.result.score).toBeUndefined();
  const shadow = await db.$transaction((tx) =>
    savedEvidenceShadow(tx, s.actor, s.studentId, new Date()),
  );
  expect(shadow.exclusions[0]!.reasons).toContain('content-withdrawn');
  expect(shadow.activation).toBe('disabled');
  await expect(
    db.contentWithdrawal.updateMany({ data: { note: 'rewrite' } }),
  ).rejects.toThrow();
});
it('completed results keep original facts; correction needs a separately reviewed version and never unpauses old work', async () => {
  const s = await setup();
  const { id } = await (await s.assign()).json();
  const items = await db.assignmentItem.findMany({
    where: { assignmentId: id },
    orderBy: { position: 'asc' },
    include: { content: true },
  });
  for (const [index, item] of items.entries())
    expect(
      (
        await db.$transaction((tx) =>
          submitAnswer(tx, s.actor, id, {
            itemId: item.id,
            requestId: randomUUID(),
            expectedRevision: index,
            answer: JSON.parse(item.content!.snapshot).payload.privateEvaluation
              .acceptedAnswers[0],
          }),
        )
      ).status,
    ).toBe(200);
  const original = await db.practiceAttempt.findMany({
    where: { assignmentId: id },
    orderBy: { sequence: 'asc' },
  });
  const item = items[0]!,
    row = item.content!;
  const withdrew = await s.delivery({
    action: 'withdraw',
    contentVersionId: row.id,
    contentHash: row.contentHash,
    reason: 'misleading-explanation',
    note: 'Synthetic explanation correction.',
  });
  const withdrawalId = (await withdrew.json()).id;
  const payload = JSON.parse(row.snapshot).payload;
  payload.privateEvaluation.explanation += ' Controleer de som.';
  const created = await contentCommand(db, config, s.headers, {
    action: 'create-content',
    contentId: row.contentId,
    revision: row.revision + 1,
    coverageId: row.coverageId,
    rubricVersionId: row.rubricVersionId,
    payload,
  });
  const replacement = await created.json();
  const correction = {
    action: 'correct',
    withdrawalId,
    replacementVersionId: replacement.id,
    replacementHash: replacement.contentHash,
    note: 'New explanation reviewed in this synthetic test.',
  };
  expect((await s.delivery(correction)).status).toBe(409);
  expect(
    (
      await contentCommand(db, config, s.headers, {
        action: 'review',
        contentVersionId: replacement.id,
        contentHash: replacement.contentHash,
        decision: 'approved',
        notes: 'Synthetic separate correction review.',
      })
    ).status,
  ).toBe(201);
  expect(
    (
      await contentCommand(db, config, s.headers, {
        action: 'publish',
        contentVersionId: replacement.id,
        contentHash: replacement.contentHash,
      })
    ).status,
  ).toBe(201);
  expect((await s.delivery(correction)).status).toBe(201);
  expect((await s.delivery(correction)).status).toBe(200);
  expect(
    await db.practiceAttempt.findMany({
      where: { assignmentId: id },
      orderBy: { sequence: 'asc' },
    }),
  ).toEqual(original);
  const result = await (
    await guardianResultsHandler(
      db,
      config,
      s.request(`/api/guardian/results/${id}`),
    )
  ).json();
  expect(result.result).toMatchObject({
    complete: true,
    status: 'Afgerond · inhoud ingetrokken',
  });
  expect(result.result.score).toBeUndefined();
  expect(result.result.questions[0].answerModel).toBeUndefined();
  expect(result.corrections[0].replacementVersionId).toBe(replacement.id);
  expect(
    (await s.assign({ ...s.assignmentBody, requestId: randomUUID(), count: 1 }))
      .status,
  ).toBe(409); // corrected wording is the same exposure
  await expect(db.contentCorrection.deleteMany()).rejects.toThrow();
  expect(
    await (
      await s.delivery({ action: 'impact', contentVersionId: row.id })
    ).json(),
  ).toMatchObject({
    items: [{ assignmentId: id, attempts: [{ attemptNumber: 1 }] }],
  });
});
it('withdrawal and assignment/answer writes serialize; audit failure rolls back, and retry recovers', async () => {
  const s = await setup();
  const item = s.refs[0]!;
  const input = {
    action: 'withdraw',
    contentVersionId: item.id,
    contentHash: item.contentHash,
    reason: 'other-defect',
    note: 'Synthetic concurrent withdrawal.',
  };
  const [issued, withdrawn] = await Promise.all([
    s.assign(),
    s.delivery(input),
  ]);
  expect(withdrawn.status).toBe(201);
  expect([201, 409]).toContain(issued.status);
  if (issued.ok) {
    const { id } = await issued.json();
    const saved = await (
      await db.$transaction((tx) => readProgress(tx, s.actor, id))
    ).json();
    expect(saved.withdrawn).toBe(true);
  }
  const next = s.refs[1]!;
  await db.$executeRawUnsafe(
    `CREATE FUNCTION test_reject_withdrawal_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.event = 'content-withdrawn' THEN RAISE EXCEPTION 'synthetic rollback'; END IF; RETURN NEW; END $$`,
  );
  await db.$executeRawUnsafe(
    'CREATE TRIGGER test_reject_withdrawal BEFORE INSERT ON "IdentityAudit" FOR EACH ROW EXECUTE FUNCTION test_reject_withdrawal_audit()',
  );
  try {
    expect(
      (
        await s.delivery({
          ...input,
          contentVersionId: next.id,
          contentHash: next.contentHash,
        })
      ).status,
    ).toBe(409);
    expect(
      await db.contentWithdrawal.findUnique({
        where: { contentVersionId: next.id },
      }),
    ).toBeNull();
  } finally {
    await db.$executeRawUnsafe(
      'DROP TRIGGER test_reject_withdrawal ON "IdentityAudit"',
    );
    await db.$executeRawUnsafe('DROP FUNCTION test_reject_withdrawal_audit()');
  }
  expect(
    (
      await s.delivery({
        ...input,
        contentVersionId: next.id,
        contentHash: next.contentHash,
      })
    ).status,
  ).toBe(201);
});
it('withdrawal requires the current operator, exact hash, fresh MFA, origin and bounded fields', async () => {
  const s = await setup();
  const ref = s.refs[0]!;
  const body = {
    action: 'withdraw',
    contentVersionId: ref.id,
    contentHash: ref.contentHash,
    reason: 'incorrect-answer',
    note: 'Synthetic defect.',
  };
  const call = (headers: Headers) =>
    contentDeliveryHandler(
      db,
      config,
      new Request(`${config.origin}/api/guardian/content-delivery`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }),
    );
  expect(
    await call(
      new Headers({
        origin: config.origin,
        'content-type': 'application/json',
      }),
    ),
  ).toHaveProperty('status', 401);
  expect(
    (
      await call(
        new Headers({
          ...Object.fromEntries(s.headers),
          origin: 'https://hostile.invalid',
        }),
      )
    ).status,
  ).toBe(403);
  expect((await s.delivery({ ...body, contentHash: 'wrong' })).status).toBe(
    409,
  );
  expect((await s.delivery({ ...body, actorId: randomUUID() })).status).toBe(
    400,
  );
  expect((await s.delivery({ ...body, note: ' '.repeat(5) })).status).toBe(400);
  await db.session.updateMany({
    data: { mfaVerifiedAt: new Date(Date.now() - 360000) },
  });
  expect((await s.delivery(body)).status).toBe(403);
  expect(await db.contentWithdrawal.count()).toBe(0);
});
it('a second subject uses the same publication/assignment boundary and exact spelling errors survive grading', async () => {
  const s = await setup(false);
  const review = (body?: unknown) =>
    contentReviewHandler(
      db,
      config,
      s.request('/api/guardian/content-review?batch=spelling-doubling', body),
    );
  expect((await review({ action: 'initialize' })).status).toBe(200);
  const batch: ReviewBatch = await (await review()).json();
  const refs = batch.items.map(({ id, contentHash }) => ({ id, contentHash }));
  expect(
    (
      await review({
        action: 'approve',
        refs,
        notes: 'Simulated spelling review, not real approval.',
      })
    ).status,
  ).toBe(200);
  expect((await review({ action: 'publish', refs })).status).toBe(200);
  const coverageId = (
    await db.contentVersion.findUniqueOrThrow({ where: { id: refs[0]!.id } })
  ).coverageId;
  const issued = await s.assign({ ...s.assignmentBody, coverageId, count: 1 });
  expect(issued.status).toBe(201);
  const { id } = await issued.json();
  const item = await db.assignmentItem.findFirstOrThrow({
    where: { assignmentId: id },
    include: { content: true },
  });
  const answer = JSON.parse(item.content!.snapshot).payload.privateEvaluation
    .acceptedAnswers[0];
  const first = await (
    await db.$transaction((tx) =>
      submitAnswer(tx, s.actor, id, {
        itemId: item.id,
        requestId: randomUUID(),
        expectedRevision: 0,
        answer: `${answer}!`,
      }),
    )
  ).json();
  expect(first.correct).toBe(false);
  expect(first.solution).toBeUndefined();
  const retry = await (
    await db.$transaction((tx) =>
      submitAnswer(tx, s.actor, id, {
        itemId: item.id,
        requestId: randomUUID(),
        expectedRevision: 1,
        answer: ` ${answer.toUpperCase()} `,
      }),
    )
  ).json();
  expect(retry.correct).toBe(true);
  expect(retry.solution).toBeUndefined();
  expect(retry.progress.result.weightedScore).toBe(0.5);
});
it('stale rubrics and published content without a delivery adapter stay unavailable; historical assignment pins still load', async () => {
  const s = await setup();
  const issued = await s.assign();
  const { id } = await issued.json();
  const row = await db.contentVersion.findUniqueOrThrow({
    where: { id: s.refs[0]!.id },
    include: { rubric: true },
  });
  const payload = JSON.parse(row.rubric.snapshot).payload;
  expect(
    (
      await contentCommand(db, config, s.headers, {
        action: 'create-rubric',
        rubricId: row.rubric.rubricId,
        revision: row.rubric.revision + 1,
        payload,
      })
    ).status,
  ).toBe(201);
  const overview = await (await s.delivery()).json();
  expect(
    overview.items.find((i: { id: string }) => i.id === row.id),
  ).toMatchObject({ eligible: false, reason: 'stale-rubric' });
  expect(
    await db.$transaction((tx) => readAssignment(tx, s.actor, id)),
  ).not.toBeNull();
  const review = (body?: unknown) =>
    contentReviewHandler(
      db,
      config,
      s.request('/api/guardian/content-review', body),
    );
  await review({ action: 'initialize' });
  const batch: ReviewBatch = await (await review()).json();
  const ref = batch.items[0]!;
  await review({
    action: 'approve',
    refs: [{ id: ref.id, contentHash: ref.contentHash }],
    notes: 'Synthetic review without any saved adapter authority.',
  });
  await review({
    action: 'publish',
    refs: [{ id: ref.id, contentHash: ref.contentHash }],
  });
  const unknown = await db.contentVersion.findUniqueOrThrow({
    where: { id: ref.id },
  });
  const result = await s.assign({
    ...s.assignmentBody,
    coverageId: unknown.coverageId,
    requestId: randomUUID(),
    count: 1,
  });
  expect(result.status).toBe(409);
  expect(await result.json()).toMatchObject({
    error: 'CONTENT_SHORTAGE',
    available: 0,
  });
});
it('submission and withdrawal race leaves either one historical attempt or none, with no writes permitted afterward', async () => {
  const s = await setup();
  const { id } = await (await s.assign()).json();
  const item = await db.assignmentItem.findFirstOrThrow({
    where: { assignmentId: id },
    orderBy: { position: 'asc' },
  });
  const input = {
    itemId: item.id,
    requestId: randomUUID(),
    expectedRevision: 0,
    answer: '999',
  };
  const [submitted, withdrawn] = await Promise.all([
    db.$transaction((tx) => submitAnswer(tx, s.actor, id, input)),
    s.delivery({
      action: 'withdraw',
      contentVersionId: item.contentVersionId,
      contentHash: item.contentHash,
      reason: 'incorrect-answer',
      note: 'Synthetic answer-withdrawal race.',
    }),
  ]);
  expect([200, 409]).toContain(submitted.status);
  expect(withdrawn.status).toBe(201);
  const count = await db.practiceAttempt.count({ where: { assignmentId: id } });
  expect(count).toBe(submitted.status === 200 ? 1 : 0);
  expect(
    (await db.$transaction((tx) => submitAnswer(tx, s.actor, id, input)))
      .status,
  ).toBe(409);
  expect(await db.practiceAttempt.count({ where: { assignmentId: id } })).toBe(
    count,
  );
});

it.each(['taal', 'redactiesommen', 'reading'])(
  'D14-S5 %s: reviewed source pins, authoritative retries, saved context and withdrawal',
  async (kind) => {
    const { rehearsalSpecs } =
      await import('../../src/server/content/rehearsal-batches');
    const spec = rehearsalSpecs.find((s) => s.key === kind)!;
    const s = await setup();
    const review = (body?: unknown) =>
      contentReviewHandler(
        db,
        config,
        s.request(`/api/guardian/content-review?batch=${spec.id}`, body),
      );
    expect((await review({ action: 'initialize' })).status).toBe(200);
    expect((await review({ action: 'initialize' })).status).toBe(200);
    const batch: ReviewBatch = await (await review()).json();
    expect(batch.items).toHaveLength(spec.seeds.length);
    const refs = batch.items.map(({ id, contentHash }) => ({
      id,
      contentHash,
    }));
    const input = {
      ...s.assignmentBody,
      requestId: randomUUID(),
      coverageId: spec.requirement.id,
      count: spec.seeds.length,
    };
    expect((await s.assign(input)).status).toBe(409);
    expect((await review({ action: 'publish', refs })).status).toBe(409);
    expect(
      (
        await review({
          action: 'approve',
          refs,
          notes: 'Synthetic technical test only, not educational approval.',
        })
      ).status,
    ).toBe(200);
    expect((await review({ action: 'publish', refs })).status).toBe(200);
    const issued = await s.assign(input);
    expect(issued.status).toBe(201);
    const { id } = await issued.json();
    expect((await s.assign(input)).status).toBe(200);
    expect((await s.assign({ ...input, requestId: randomUUID() })).status).toBe(
      409,
    );
    const read = () => db.$transaction((tx) => readAssignment(tx, s.actor, id));
    const task = (await read())!;
    expect(task.subject).toBe(spec.requirement.subject);
    expect(task.category).toBe(spec.requirement.category);
    expect(JSON.stringify(task)).not.toMatch(
      /privateEvaluation|acceptedAnswers|gradingRules|evaluatorVersion/,
    );
    if (kind === 'reading') {
      expect(task.items[0]!.readingText?.paragraphs).toHaveLength(6);
      expect(task.items[0]!.options).toHaveLength(4);
      expect(
        (await s.assign({ ...input, requestId: randomUUID(), count: 2 }))
          .status,
      ).toBe(409);
    }
    const submit = (
      revision: number,
      index: number,
      answer: string,
      requestId = randomUUID(),
    ) =>
      db.$transaction((tx) =>
        submitAnswer(tx, s.actor, id, {
          requestId,
          itemId: task.items[index]!.id,
          expectedRevision: revision,
          answer,
        }),
      );
    expect(
      (
        await submit(
          0,
          0,
          kind === 'reading' ? 'z' : kind === 'taal' ? 'two words' : '1e2',
        )
      ).status,
    ).toBe(400);
    expect(
      await db.practiceAttempt.count({ where: { assignmentId: id } }),
    ).toBe(0);
    const wrong = kind === 'reading' ? 'a' : kind === 'taal' ? 'kat' : '999';
    const first = await (await submit(0, 0, wrong)).json();
    expect(first.correct).toBe(false);
    expect(first.solution).toBeUndefined();
    const guardian = () =>
      guardianResultsHandler(
        db,
        config,
        s.request(`/api/guardian/results/${id}`),
      );
    expect(
      (await (await guardian()).json()).result.questions[0].answerModel,
    ).toBeUndefined();
    for (let i = 1; i < task.items.length; i++)
      expect(
        (
          await (
            await submit(
              i,
              i,
              spec.seeds[i]!.payload.privateEvaluation.acceptedAnswers[0]!,
            )
          ).json()
        ).correct,
      ).toBe(true);
    const requestId = randomUUID();
    const final = await (
      await submit(task.items.length, 0, wrong, requestId)
    ).json();
    expect(final.solution.answer).toBe(
      spec.seeds[0]!.payload.privateEvaluation.acceptedAnswers[0],
    );
    expect(
      await (await submit(task.items.length, 0, wrong, requestId)).json(),
    ).toEqual(final);
    await db.$disconnect();
    expect(await read()).toEqual(task);
    const result = await (await guardian()).json();
    expect(result.result.complete).toBe(true);
    expect(
      result.result.questions[0].attempts.map(
        (a: { answer: string }) => a.answer,
      ),
    ).toEqual([wrong, wrong]);
    if (kind === 'reading') {
      expect(result.readingText).toEqual(task.items[0]!.readingText);
      expect(result.result.questions[0].attempts[0].label).toBe(
        task.items[0]!.options![0]!.label,
      );
    }
    const before = await db.practiceAttempt.findMany({
      where: { assignmentId: id },
      orderBy: { sequence: 'asc' },
    });
    const item = await db.assignmentItem.findFirstOrThrow({
      where: { assignmentId: id },
      orderBy: { position: 'asc' },
    });
    expect(
      (
        await s.delivery({
          action: 'withdraw',
          contentVersionId: item.contentVersionId,
          contentHash: item.contentHash,
          reason: 'incorrect-answer',
          note: 'Synthetic withdrawal check.',
        })
      ).status,
    ).toBe(201);
    expect(
      (await (await guardian()).json()).result.questions[0].answerModel,
    ).toBeUndefined();
    expect(
      await db.practiceAttempt.findMany({
        where: { assignmentId: id },
        orderBy: { sequence: 'asc' },
      }),
    ).toEqual(before);
  },
);
