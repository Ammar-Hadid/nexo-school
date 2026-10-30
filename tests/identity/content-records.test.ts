import { afterAll, beforeEach, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
vi.mock('server-only', () => ({}));
import { db, config, provision, type Browser } from './helpers';
import { contentCommand } from '../../src/server/content/records';
import coverage from '../../src/modules/curriculum/required-coverage.json';

beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit", "CoverageObjective", "ContentRubricVersion", "ArithmeticQuestionVersion" CASCADE',
  );
});
afterAll(() => db.$disconnect());
function headers(browser: Browser) {
  return new Headers({
    origin: config.origin,
    cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  });
}
const rubric = {
  criteria: ['Exact mathematical answer'],
  responsePolicy: 'integer grammar',
  evaluatorVersion: 'synthetic-integer-v1',
};
const payload = {
  prompt: '1 + 1 =',
  responseSpecification: { type: 'integer' },
  evaluationSpecification: { answer: '2' },
  explanation: 'One and one make two.',
  rights: 'project-authored',
  provenance: 'synthetic-fixture',
};
async function setup() {
  const { browser } = await provision();
  const call = (command: unknown) =>
    contentCommand(db, config, headers(browser), command);
  expect((await call({ action: 'register-coverage' })).status).toBe(200);
  const rubricId = randomUUID();
  const r = await call({
    action: 'create-rubric',
    rubricId,
    revision: 1,
    payload: rubric,
  });
  expect(r.status).toBe(201);
  const rubricRecord = await r.json();
  const draft = {
    action: 'create-content',
    contentId: randomUUID(),
    revision: 1,
    coverageId: coverage.find((row) => row.category === 'Optellen')!.id,
    rubricVersionId: rubricRecord.id,
    payload,
  };
  const result = await call(draft);
  expect(result.status).toBe(201);
  const content = await result.json();
  const review = {
    action: 'review',
    contentVersionId: content.id,
    contentHash: content.contentHash,
    decision: 'approved',
    notes: 'Synthetic test review only; not actual educational certification.',
  };
  const publish = {
    action: 'publish',
    contentVersionId: content.id,
    contentHash: content.contentHash,
  };
  return {
    browser,
    call,
    rubricId,
    rubricRecord,
    draft,
    content,
    review,
    publish,
  };
}
it('persists full coverage, exact rubric/content versions and idempotent human-hash publication', async () => {
  const { call, draft, content, review, publish } = await setup();
  expect(await db.coverageObjective.count()).toBe(210);
  expect((await call({ action: 'register-coverage' })).status).toBe(200);
  expect(await db.coverageObjective.count()).toBe(210);
  expect((await call(draft)).status).toBe(200);
  expect(
    (await call({ ...draft, payload: { ...payload, explanation: 'Changed' } }))
      .status,
  ).toBe(409);
  expect((await call(publish)).status).toBe(409);
  expect((await call(review)).status).toBe(201);
  const concurrent = await Promise.all([call(publish), call(publish)]);
  expect(concurrent.map((r) => r.status).sort()).toEqual([200, 201]);
  expect(await concurrent[0]!.json()).toEqual(await concurrent[1]!.json());
  expect(await db.contentPublication.count()).toBe(1);
  expect(
    await db.identityAudit.count({
      where: { event: 'content-published-local-synthetic' },
    }),
  ).toBe(1);
  expect(
    (await db.contentVersion.findUniqueOrThrow({ where: { id: content.id } }))
      .contentHash,
  ).toBe(content.contentHash);
  expect(await db.arithmeticQuestionVersion.count()).toBe(0);
  expect(await db.assignment.count()).toBe(0);
});
it('rejects missing content, unreviewed/rejected versions, stale hashes and automated authority', async () => {
  const { call, draft, review, publish } = await setup();
  expect(
    (await call({ ...publish, contentVersionId: randomUUID() })).status,
  ).toBe(409);
  expect((await call({ ...review, contentHash: '0'.repeat(64) })).status).toBe(
    409,
  );
  expect((await call({ ...review, authority: 'ai-review' })).status).toBe(400);
  expect((await call({ ...review, decision: 'rejected' })).status).toBe(201);
  expect((await call(review)).status).toBe(409);
  expect((await call(publish)).status).toBe(409);
  const rejected = await db.contentReview.findFirstOrThrow();
  await expect(
    db.contentPublication.create({
      data: {
        id: randomUUID(),
        contentVersionId: rejected.contentVersionId,
        contentHash: rejected.contentHash,
        reviewId: rejected.id,
      },
    }),
  ).rejects.toThrow();
  const next = await (
    await call({
      ...draft,
      revision: 2,
      payload: { ...payload, prompt: '2 + 2 =' },
    })
  ).json();
  expect(
    (
      await call({
        action: 'publish',
        contentVersionId: next.id,
        contentHash: next.contentHash,
      })
    ).status,
  ).toBe(409);
  expect(await db.contentPublication.count()).toBe(0);
});
it('new rubric revisions change content fingerprints and never inherit prior approval', async () => {
  const { call, draft, rubricId, content, review, publish } = await setup();
  await call(review);
  await call(publish);
  const nextRubric = await (
    await call({
      action: 'create-rubric',
      rubricId,
      revision: 2,
      payload: { ...rubric, responsePolicy: 'different policy' },
    })
  ).json();
  const next = await (
    await call({ ...draft, revision: 2, rubricVersionId: nextRubric.id })
  ).json();
  expect(next.contentHash).not.toBe(content.contentHash);
  expect((await call({ ...review, contentVersionId: next.id })).status).toBe(
    409,
  );
  expect(
    (
      await call({
        ...publish,
        contentVersionId: next.id,
        contentHash: next.contentHash,
      })
    ).status,
  ).toBe(409);
  expect(await db.contentPublication.count()).toBe(1);
});
it('database guards immutable records, forged hashes, rejected-review publication and mismatched version links', async () => {
  const { call, content, rubricRecord, review, publish } = await setup();
  await call(review);
  await call(publish);
  const published = await db.contentPublication.findFirstOrThrow();
  const reviewed = await db.contentReview.findFirstOrThrow();
  await expect(
    db.contentVersion.update({
      where: { id: content.id },
      data: { snapshot: '{}' },
    }),
  ).rejects.toThrow();
  await expect(
    db.contentRubricVersion.delete({ where: { id: rubricRecord.id } }),
  ).rejects.toThrow();
  await expect(
    db.coverageObjective.update({
      where: { id: coverage[0]!.id },
      data: { label: 'changed' },
    }),
  ).rejects.toThrow();
  await expect(
    db.contentReview.update({
      where: { id: reviewed.id },
      data: { decision: 'rejected' },
    }),
  ).rejects.toThrow();
  await expect(
    db.contentPublication.delete({ where: { id: published.id } }),
  ).rejects.toThrow();
  await expect(
    db.contentRubricVersion.create({
      data: {
        id: randomUUID(),
        rubricId: randomUUID(),
        revision: 1,
        snapshot: '{}',
        contentHash: '0'.repeat(64),
      },
    }),
  ).rejects.toThrow();
  await expect(
    db.contentPublication.create({
      data: {
        id: randomUUID(),
        contentVersionId: randomUUID(),
        contentHash: content.contentHash,
        reviewId: reviewed.id,
      },
    }),
  ).rejects.toThrow();
  await expect(
    db.contentPublication.create({
      data: {
        id: randomUUID(),
        contentVersionId: content.id,
        contentHash: content.contentHash,
        reviewId: reviewed.id,
        decision: 'rejected',
      },
    }),
  ).rejects.toThrow();
});
it('requires authenticated bootstrap operator and fresh MFA, ignores claimed reviewer IDs', async () => {
  const { browser, call, review } = await setup();
  expect(
    (
      await contentCommand(
        db,
        config,
        new Headers({ origin: config.origin }),
        review,
      )
    ).status,
  ).toBe(401);
  expect((await contentCommand(db, config, new Headers(), review)).status).toBe(
    403,
  );
  expect((await call({ ...review, reviewerId: randomUUID() })).status).toBe(
    400,
  );
  await db.session.updateMany({
    data: { mfaVerifiedAt: new Date(Date.now() - 6 * 60_000) },
  });
  expect((await call(review)).status).toBe(403);
  await db.session.updateMany({ data: { mfaVerifiedAt: new Date() } });
  await db.identityBootstrap.updateMany({ data: { userId: randomUUID() } });
  expect(
    (await contentCommand(db, config, headers(browser), review)).status,
  ).toBe(403);
  expect(await db.contentReview.count()).toBe(0);
});
it('rolls back publication and audit together, then allows exact retry after failure', async () => {
  const { call, review, publish } = await setup();
  await call(review);
  await db.$executeRawUnsafe(
    `CREATE FUNCTION fail_d10_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.event = 'content-published-local-synthetic' THEN RAISE EXCEPTION 'test failure'; END IF; RETURN NEW; END $$`,
  );
  await db.$executeRawUnsafe(
    'CREATE TRIGGER fail_d10_audit BEFORE INSERT ON "IdentityAudit" FOR EACH ROW EXECUTE FUNCTION fail_d10_audit()',
  );
  try {
    expect((await call(publish)).status).toBe(409);
    expect(await db.contentPublication.count()).toBe(0);
  } finally {
    await db.$executeRawUnsafe(
      'DROP TRIGGER fail_d10_audit ON "IdentityAudit"',
    );
    await db.$executeRawUnsafe('DROP FUNCTION fail_d10_audit()');
  }
  expect((await call(publish)).status).toBe(201);
});

it('rejects incomplete envelopes and missing rubric/coverage before storing anything', async () => {
  const { call, draft, rubricId } = await setup();
  expect(
    (
      await call({
        ...draft,
        contentId: randomUUID(),
        coverageId: randomUUID(),
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await call({
        ...draft,
        contentId: randomUUID(),
        rubricVersionId: randomUUID(),
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await call({
        ...draft,
        contentId: randomUUID(),
        payload: { ...payload, explanation: '' },
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await call({
        action: 'create-rubric',
        rubricId,
        revision: 2,
        payload: { ...rubric, criteria: [] },
      })
    ).status,
  ).toBe(400);
  expect(await db.contentVersion.count()).toBe(1);
  expect(await db.contentRubricVersion.count()).toBe(1);
  expect(await db.contentPublication.count()).toBe(0);
});

it('pins v2 mechanical rules, retains defective drafts, and requires a corrected new version before human approval', async () => {
  const { call, draft } = await setup();
  const exerciseContract = {
    version: 'exercise-checks-v1',
    response: 'open',
    optionCount: 0,
    context: 'gap-sentence',
    passageWords: null,
    requiredPromptTerms: ['hebben'],
    calculation: null,
  };
  const rules = await (
    await call({
      action: 'create-rubric',
      rubricId: randomUUID(),
      revision: 1,
      payload: { ...rubric, exerciseContract },
    })
  ).json();
  const bad = {
    schemaVersion: 'exercise-v2',
    learner: {
      prompt: 'Welke vorm van hebben past in de zin?',
      passage: '',
      options: [],
    },
    privateEvaluation: {
      acceptedAnswers: ['heeft'],
      gradingRules: ['Exacte persoonsvorm.'],
      explanation: 'Hij heeft een boek.',
    },
    rights: 'project-authored',
    provenance: 'synthetic regression only',
  };
  const request = {
    ...draft,
    contentId: randomUUID(),
    rubricVersionId: rules.id,
    payload: bad,
  };
  expect(
    (await call({ ...request, rubricVersionId: draft.rubricVersionId })).status,
  ).toBe(409);
  expect((await call({ ...request, payload })).status).toBe(409);
  const created = await call(request);
  expect(created.status).toBe(201);
  const badRecord = await created.json();
  expect(badRecord.checks).toContainEqual({
    code: 'missing-context',
    field: 'learner.prompt',
  });
  const approve = {
    action: 'review',
    contentVersionId: badRecord.id,
    contentHash: badRecord.contentHash,
    decision: 'approved',
    notes: 'Simulated human action only.',
  };
  expect((await call(approve)).status).toBe(409);
  expect((await call({ ...approve, decision: 'rejected' })).status).toBe(201);
  const corrected = await (
    await call({
      ...request,
      revision: 2,
      payload: {
        ...bad,
        learner: { ...bad.learner, prompt: 'Hij __ (hebben) een boek.' },
      },
    })
  ).json();
  expect(corrected.checks).toEqual([]);
  expect(corrected.contentHash).not.toBe(badRecord.contentHash);
  const publish = {
    action: 'publish',
    contentVersionId: corrected.id,
    contentHash: corrected.contentHash,
  };
  expect((await call(publish)).status).toBe(409);
  expect(
    (
      await call({
        ...approve,
        contentVersionId: corrected.id,
        contentHash: corrected.contentHash,
        authority: 'haiku-clear',
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await call({
        ...approve,
        contentVersionId: corrected.id,
        contentHash: corrected.contentHash,
      })
    ).status,
  ).toBe(201);
  expect((await call(publish)).status).toBe(201);
  expect(
    JSON.parse(
      (
        await db.contentVersion.findUniqueOrThrow({
          where: { id: badRecord.id },
        })
      ).snapshot,
    ).payload,
  ).toEqual(bad);
});

it('rechecks v2 defects at publication even if an approved review record already exists', async () => {
  const { call, draft } = await setup();
  const rules = await (
    await call({
      action: 'create-rubric',
      rubricId: randomUUID(),
      revision: 1,
      payload: {
        ...rubric,
        exerciseContract: {
          version: 'exercise-checks-v1',
          response: 'open',
          optionCount: 0,
          context: 'none',
          passageWords: null,
          requiredPromptTerms: [],
          calculation: null,
        },
      },
    })
  ).json();
  const created = await (
    await call({
      ...draft,
      contentId: randomUUID(),
      rubricVersionId: rules.id,
      payload: {
        schemaVersion: 'exercise-v2',
        learner: {
          prompt: 'Wat is 1 + 1? Het antwoord is: 2.',
          passage: '',
          options: [],
        },
        privateEvaluation: {
          acceptedAnswers: ['2'],
          explanation: 'Samen twee.</br>',
          gradingRules: ['Exact getal.'],
        },
        rights: 'project-authored',
        provenance: 'synthetic only',
      },
    })
  ).json();
  const operator = await db.identityBootstrap.findFirstOrThrow();
  await db.contentReview.create({
    data: {
      id: randomUUID(),
      contentVersionId: created.id,
      contentHash: created.contentHash,
      decision: 'approved',
      notes: 'Injected test record, never human approval',
      reviewerId: operator.userId,
    },
  });
  expect(
    (
      await call({
        action: 'publish',
        contentVersionId: created.id,
        contentHash: created.contentHash,
      })
    ).status,
  ).toBe(409);
  expect(await db.contentPublication.count()).toBe(0);
});
