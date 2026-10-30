import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db, config, provision } from './helpers';
import { contentReviewHandler } from '../../src/server/content/review';
import {
  emptyFamilyDraft,
  type FamilyReviewState,
} from '../../src/modules/content/family-review/family-review-contract';
import { familyProgressId } from '../../src/server/content/family-review';
import { prepareSupply } from '../../src/server/content/supply';
beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit", "CoverageObjective", "ContentRubricVersion" CASCADE',
  );
});
afterAll(() => db.$disconnect());
async function setup() {
  const { browser } = await provision();
  const headers = new Headers({
    origin: config.origin,
    cookie: [...browser.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
  });
  const call = (body?: unknown, h = headers) =>
    contentReviewHandler(
      db,
      config,
      new Request(`${config.origin}/api/guardian/family-review`, {
        method: body ? 'POST' : 'GET',
        headers: h,
        body: body ? JSON.stringify(body) : undefined,
      }),
    );
  const read = async (): Promise<FamilyReviewState> => (await call()).json();
  const state = await read();
  return { call, read, state, headers };
}
const complete = () => ({
  ...emptyFamilyDraft(),
  examples: [0, 9, 90, 45, 55, 79, 99, 22, 19],
  judgments: {
    scope: 'accept',
    wording: 'accept',
    explanation: 'accept',
    response: 'accept',
  },
  basis: 'independent-human',
  notes: 'Synthetic test judgment, not a real human educational review.',
});
it('protects the full package with origin, bootstrap authority and recent MFA; GET records nothing', async () => {
  const { call, state, headers } = await setup();
  expect(state.package.technical.checkedInstances).toBe(100);
  expect(state.history).toEqual([]);
  expect(await db.familyReviewDraft.count()).toBe(0);
  expect(
    (await call(undefined, new Headers({ origin: config.origin }))).status,
  ).toBe(401);
  expect(
    (
      await call(
        undefined,
        new Headers({
          ...Object.fromEntries(headers),
          origin: 'https://hostile.invalid',
        }),
      )
    ).status,
  ).toBe(403);
  await db.session.updateMany({
    data: { mfaVerifiedAt: new Date(Date.now() - 360000) },
  });
  expect((await call()).status).toBe(403);
  await db.identityBootstrap.deleteMany();
  await db.session.updateMany({ data: { mfaVerifiedAt: new Date() } });
  expect((await call()).status).toBe(403);
});
it('saves partial drafts, resumes exactly, fences stale tabs and makes identical concurrent retries idempotent', async () => {
  const { call, read, state } = await setup();
  const draft = {
    ...emptyFamilyDraft(),
    examples: [0, 9],
    notes: 'Partial review to resume.',
  };
  const save = {
    action: 'save',
    packageHash: state.packageHash,
    revision: 0,
    draft,
  };
  expect(
    (await Promise.all([call(save), call(save)])).map((r) => r.status),
  ).toEqual([200, 200]);
  expect(await read()).toMatchObject({ revision: 1, draft });
  expect(await db.familyReviewDecision.count()).toBe(0);
  expect(
    (
      await call({
        ...save,
        draft: { ...draft, notes: 'Conflicting other-tab save.' },
      })
    ).status,
  ).toBe(409);
  expect(
    (await call({ ...save, revision: 1, packageHash: '0'.repeat(64) })).status,
  ).toBe(409);
  expect(
    (
      await call({
        ...save,
        revision: 1,
        draft: { ...draft, reviewerId: 'fabricated' },
      })
    ).status,
  ).toBe(409);
});
it('records guardian, AI-assisted and educator decisions separately without activating supply', async () => {
  const { call, read, state } = await setup();
  const base = {
    action: 'record',
    packageHash: state.packageHash,
    revision: 0,
    draft: complete(),
    confirmed: true,
  };
  expect((await call(base)).status).toBe(200);
  expect((await call(base)).status).toBe(200);
  expect((await read()).history[0]!.outcome).toBe('guardian-feedback');
  const ai = {
    ...base,
    revision: 1,
    draft: {
      ...complete(),
      role: 'educator',
      qualification: 'Synthetic educator declaration for test.',
      basis: 'ai-assisted',
    },
  };
  expect((await call(ai)).status).toBe(200);
  expect((await read()).history[0]!.outcome).toBe('provisional');
  const independent = {
    ...ai,
    revision: 2,
    draft: { ...ai.draft, basis: 'independent-human' },
  };
  expect((await call(independent)).status).toBe(200);
  const approved = await read();
  expect(approved.history[0]!.outcome).toBe('educator-approved');
  expect(approved.automaticPublication).toBe(false);
  expect(approved.history).toHaveLength(3);
  expect(await db.contentPublication.count()).toBe(0);
  const userId = (await db.identityBootstrap.findFirstOrThrow()).userId;
  const supply = await db.$transaction((tx) => prepareSupply(tx, userId, 600));
  expect(supply).toMatchObject({
    ready: 0,
    pending: 8,
    automaticPublication: false,
  });
  const row = await db.familyReviewDecision.findFirstOrThrow();
  expect(JSON.parse(row.packageSnapshot).contractHash).toBe(
    state.package.contractHash,
  );
  await expect(
    db.familyReviewDecision.updateMany({
      data: { outcome: 'educator-approved' },
    }),
  ).rejects.toThrow();
  await expect(db.familyReviewDecision.deleteMany()).rejects.toThrow();
  expect(
    await db.identityAudit.count({
      where: { event: 'family-review-decision-recorded' },
    }),
  ).toBe(3);
});
it('refuses incomplete or unconfirmed recording and preserves unresolved/change decisions', async () => {
  const { call, read, state } = await setup();
  const base = {
    action: 'record',
    packageHash: state.packageHash,
    revision: 0,
    draft: complete(),
    confirmed: true,
  };
  for (const bad of [
    { ...base, confirmed: false },
    { ...base, draft: emptyFamilyDraft() },
    { ...base, draft: { ...base.draft, role: 'educator' } },
    { ...base, draft: { ...base.draft, examples: [0, 0, 0, 0, 0, 0, 0] } },
    { ...base, automaticPublication: true },
  ])
    expect((await call(bad)).status).toBe(409);
  expect(await db.familyReviewDecision.count()).toBe(0);
  expect(
    (
      await call({
        ...base,
        draft: {
          ...base.draft,
          judgments: { ...base.draft.judgments, scope: 'unsure' },
        },
      })
    ).status,
  ).toBe(200);
  expect((await read()).history[0]!.outcome).toBe('unresolved');
  expect(
    (
      await call({
        ...base,
        revision: 1,
        draft: {
          ...base.draft,
          judgments: { ...base.draft.judgments, explanation: 'change' },
        },
      })
    ).status,
  ).toBe(200);
  expect((await read()).history[0]!.outcome).toBe('changes-required');
});
it('keeps up-front family time separate from weekly item review and rejects replay inflation', async () => {
  const { call, read } = await setup();
  const start = await (await call({ action: 'start-time' })).json();
  await db.contentReviewProgress.updateMany({
    where: { batchId: familyProgressId },
    data: {
      startedAt: new Date(Date.now() - 5000),
      lastPulseAt: new Date(Date.now() - 5000),
    },
  });
  const tick = {
    action: 'time',
    sessionId: start.sessionId,
    sequence: 1,
    sessionMs: 2000,
  };
  expect((await call(tick)).status).toBe(200);
  expect((await call(tick)).status).toBe(200);
  expect((await read()).activeMs).toBe(2000);
  expect(await db.contentReviewProgress.count()).toBe(1);
  expect(await db.contentSupplyAdmission.count()).toBe(0);
});

it('allows an early concern without making uninspected examples or unanswered criteria approved', async () => {
  const { call, read, state } = await setup();
  const draft = {
    ...emptyFamilyDraft(),
    basis: 'independent-human',
    notes: 'Need clarification of the intended prerequisite.',
    judgments: { ...emptyFamilyDraft().judgments, scope: 'unsure' },
  };
  expect(
    (
      await call({
        action: 'record',
        packageHash: state.packageHash,
        revision: 0,
        draft,
        confirmed: true,
      })
    ).status,
  ).toBe(200);
  const result = await read();
  expect(result.history[0]!.outcome).toBe('unresolved');
  expect(result.draft.examples).toEqual([]);
  expect(result.draft.judgments.response).toBe('');
  expect(result.automaticPublication).toBe(false);
});

if (process.env.NEXO_TEST_BUILT === '1')
  it('built D14-S2: partial resume, explicit guardian decision, private package and responsive review', async () => {
    const { chromium, expect: browserExpect } =
      await import('@playwright/test');
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    const { spawn } = await import('node:child_process');
    const { mkdir } = await import('node:fs/promises');
    const { createServer } = await import('node:net');
    const reservation = createServer();
    await new Promise<void>((r) => reservation.listen(0, '127.0.0.1', r));
    const address = reservation.address();
    if (!address || typeof address === 'string') throw new Error('NO_PORT');
    const port = address.port;
    await new Promise<void>((r) => reservation.close(() => r()));
    const originalOrigin = config.origin;
    config.origin = `http://localhost:${port}`;
    const { browser: operator } = await provision();
    const child = spawn(process.execPath, ['.next/standalone/server.js'], {
      env: {
        ...process.env,
        PORT: new URL(config.origin).port,
        BETTER_AUTH_URL: config.origin,
        HOSTNAME: '127.0.0.1',
      },
      stdio: 'ignore',
    });
    const browser = await chromium.launch();
    try {
      let ready = false;
      for (let n = 0; n < 100; n++) {
        try {
          if (
            (await fetch(config.origin, { signal: AbortSignal.timeout(1000) }))
              .ok
          ) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      expect(ready).toBe(true);
      const context = await browser.newContext();
      await context.addCookies(
        [...operator.cookies].map(([name, value]) => ({
          name,
          value,
          url: config.origin,
        })),
      );
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`${config.origin}/guardian/content/supply/family`, {
        waitUntil: 'domcontentloaded',
      });
      await browserExpect(
        page.getByRole('heading', {
          name: 'Optellen · cijfers 0–9 · nieuwe uitleg',
        }),
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Bekijk de 9 voorbeelden' })
        .press('Enter');
      for (let n = 0; n < 2; n++)
        await page
          .getByRole('button', { name: 'Bekeken · volgend voorbeeld' })
          .press('Enter');
      await page
        .getByRole('button', { name: 'Voortgang opslaan' })
        .press('Enter');
      await browserExpect(
        page
          .getByRole('status')
          .filter({ hasText: 'Voortgang opgeslagen. Je kunt later verder.' }),
      ).toBeVisible();
      await page.reload();
      await browserExpect(
        page.getByRole('article', { name: 'Voorbeeld 3' }),
      ).toBeVisible();
      for (let n = 2; n < 9; n++)
        await page
          .getByRole('button', {
            name:
              n === 8
                ? 'Bekeken · naar mijn oordeel'
                : 'Bekeken · volgend voorbeeld',
          })
          .press('Enter');
      for (const title of [
        'Bereik en voorkennis',
        'Vraag en toegankelijkheid',
        'Uitleg en terugkoppeling',
        'Antwoordregels en herhaling',
      ])
        await page
          .getByLabel(`Oordeel: ${title}`, { exact: true })
          .selectOption('accept');
      await page
        .getByRole('combobox', { name: 'Basis van mijn oordeel', exact: true })
        .selectOption('independent-human');
      await page
        .getByRole('textbox', { name: /Toelichting bij mijn oordeel/ })
        .fill(
          'Synthetische browsertest; geen daadwerkelijke menselijke beoordeling.',
        );
      await browserExpect(
        page.getByRole('button', { name: 'Beoordeling vastleggen' }),
      ).toBeDisabled();
      await page.getByRole('checkbox').check();
      await page
        .getByRole('button', { name: 'Beoordeling vastleggen' })
        .press('Enter');
      await browserExpect(
        page.getByRole('heading', {
          name: 'Ouderfeedback vastgelegd · certificering blijft open',
        }),
      ).toBeVisible();
      await page.reload();
      await browserExpect(
        page.getByRole('heading', {
          name: 'Ouderfeedback vastgelegd · certificering blijft open',
        }),
      ).toBeVisible();
      expect(await db.familyReviewDecision.count()).toBe(1);
      expect(await db.contentPublication.count()).toBe(0);
      const record = await db.familyReviewDecision.findFirstOrThrow();
      expect(record.outcome).toBe('guardian-feedback');
      await page.getByRole('button', { name: 'Start tijdmeting' }).click();
      await browserExpect(
        page.getByRole('timer', { name: 'Actieve beoordelingstijd' }),
      ).not.toHaveText('0:00');
      await page.getByRole('button', { name: 'Pauzeer tijdmeting' }).click();
      await browserExpect
        .poll(
          async () =>
            (await db.contentReviewProgress.findFirstOrThrow()).totalMs,
        )
        .toBeGreaterThan(500);
      await mkdir('.artifacts/d14-family', { recursive: true });
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const [step, name] of [
          [0, '1. Afbakening'],
          [1, '2. Voorbeelden'],
          [2, '3. Mijn oordeel'],
        ] as const) {
          await page.getByRole('button', { name, exact: true }).click();
          await page.getByRole('main').evaluate((el) => {
            el.scrollTop = 0;
          });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
            [],
          );
          await page.screenshot({
            path: `.artifacts/d14-family/family-${step}-${width}.png`,
          });
        }
      }
      expect(errors).toEqual([]);
      await context.clearCookies();
      await page.reload();
      await browserExpect(page.getByRole('navigation')).toHaveCount(0);
      await browserExpect(
        page.getByRole('button', { name: 'Aanmelden als ouder', exact: true }),
      ).toBeVisible();
      await browserExpect(
        page.getByText(
          'Maak eerst 10. Splits 9 in 3 en 6. 7 + 3 = 10. Daarna 10 + 6 = 16.',
        ),
      ).toHaveCount(0);
    } finally {
      await Promise.race([
        browser.close(),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
      const exited = new Promise<void>((r) => child.once('exit', () => r()));
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        const force = setTimeout(() => child.kill('SIGKILL'), 2000);
        await exited;
        clearTimeout(force);
      }
      config.origin = originalOrigin;
    }
  }, 60000);

it('isolates package drafts, decisions and upfront timers through the same authenticated workflow', async () => {
  const { call, state, headers } = await setup();
  const secondCall = (body?: unknown) =>
    contentReviewHandler(
      db,
      config,
      new Request(
        `${config.origin}/api/guardian/family-review?package=addition-two-digits-v1`,
        {
          method: body ? 'POST' : 'GET',
          headers,
          body: body ? JSON.stringify(body) : undefined,
        },
      ),
    );
  const second: FamilyReviewState = await (await secondCall()).json();
  expect(second.package.technical.checkedInstances).toBe(3321);
  expect(second.packageHash).not.toBe(state.packageHash);
  const bad = await secondCall({
    action: 'save',
    packageHash: state.packageHash,
    revision: 0,
    draft: emptyFamilyDraft(),
  });
  expect(bad.status).not.toBe(200);
  const draft = {
    ...complete(),
    examples: second.package.examples.map((e) => e.index),
  };
  expect(
    (
      await secondCall({
        action: 'record',
        packageHash: second.packageHash,
        revision: 0,
        draft,
        confirmed: true,
      })
    ).status,
  ).toBe(200);
  const firstSaved: FamilyReviewState = await (await call()).json();
  expect(firstSaved.revision).toBe(0);
  expect(firstSaved.history).toEqual([]);
  const secondSaved: FamilyReviewState = await (await secondCall()).json();
  expect(secondSaved.history).toHaveLength(1);
  const decision = await db.familyReviewDecision.findFirstOrThrow({
    where: { packageHash: second.packageHash },
  });
  expect(JSON.parse(decision.packageSnapshot).version).toBe(
    'addition-two-digits-v1',
  );
  await secondCall({ action: 'start-time' });
  expect(
    await db.contentReviewProgress.findFirst({
      where: { batchId: `family-certification:${second.packageHash}` },
    }),
  ).not.toBeNull();
  expect(
    await db.contentReviewProgress.findFirst({
      where: { batchId: familyProgressId },
    }),
  ).toBeNull();
  for (const version of ['unknown', 'd14-optellen-certification-v1']) {
    const res = await contentReviewHandler(
      db,
      config,
      new Request(
        `${config.origin}/api/guardian/family-review?package=${version}`,
        { headers },
      ),
    );
    expect(res.status).not.toBe(200);
  }
});
