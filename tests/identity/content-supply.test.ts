import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db, config, provision } from './helpers';
import { contentReviewHandler } from '../../src/server/content/review';
import { prepareSupply, supplyOverview } from '../../src/server/content/supply';
import type { ReviewBatch } from '../../src/modules/content/review/review-contract';
import type { SupplyOverview } from '../../src/modules/content/supply/supply-contract';
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
  const call = (body?: unknown, lane = 'supply', h = headers) =>
    contentReviewHandler(
      db,
      config,
      new Request(
        `${config.origin}/api/guardian/content-${lane === 'supply' ? 'supply' : 'review?batch=optellen'}`,
        {
          method: body ? 'POST' : 'GET',
          headers: h,
          body: body ? JSON.stringify(body) : undefined,
        },
      ),
    );
  const overview = async (): Promise<SupplyOverview> => (await call()).json();
  const batch = async (): Promise<ReviewBatch> =>
    (await call(undefined, 'review')).json();
  return { call, overview, batch, headers };
}
it('GET does not seed; auth, origins, purpose and demand fail closed', async () => {
  const { call, overview, headers } = await setup();
  expect((await overview()).planned).toBe(false);
  expect(await db.contentVersion.count()).toBe(0);
  expect(
    (await call(undefined, 'supply', new Headers({ origin: config.origin })))
      .status,
  ).toBe(401);
  expect(
    (
      await call(
        { action: 'prepare', demand: 20 },
        'supply',
        new Headers({
          ...Object.fromEntries(headers),
          origin: 'https://hostile.invalid',
        }),
      )
    ).status,
  ).toBe(403);
  for (const body of [
    { action: 'prepare', demand: 0 },
    { action: 'prepare', demand: 601 },
    { action: 'prepare', demand: 2, purpose: 'assessment' },
    { action: 'certify' },
    { action: 'prepare', demand: 2, week: '2020-01-01' },
  ])
    expect((await call(body)).ok).toBe(false);
  expect(await db.contentVersion.count()).toBe(0);
  await db.session.updateMany({
    data: { mfaVerifiedAt: new Date(Date.now() - 360000) },
  });
  expect((await call()).status).toBe(403);
});
it('600-demand concurrent retries create only eight drafts, no approvals, publication or ready stock', async () => {
  const { call, overview, batch } = await setup();
  const responses = await Promise.all(
    Array.from({ length: 3 }, () => call({ action: 'prepare', demand: 600 })),
  );
  expect(responses.map((r) => r.status)).toEqual([200, 200, 200]);
  const view = await overview();
  expect(view).toMatchObject({
    demand: 600,
    ready: 0,
    shortage: 600,
    pending: 8,
    admitted: 8,
    capacity: 2,
    automaticPublication: false,
  });
  expect(await db.contentVersion.count()).toBe(8);
  expect(await db.contentReview.count()).toBe(0);
  expect(await db.contentPublication.count()).toBe(0);
  expect(
    (await batch()).items.every(
      (i) =>
        i.checks.length === 0 &&
        i.advisory.provenance === 'deterministic-check',
    ),
  ).toBe(true);
});
it('reuses exact published versions, preserves reservations and blocks recent groups next week', async () => {
  const { call, batch, overview } = await setup();
  await call({ action: 'prepare', demand: 20 });
  const items = (await batch()).items;
  const refs = items.map(({ id, contentHash }) => ({ id, contentHash }));
  expect((await call({ action: 'publish', refs }, 'review')).status).toBe(409);
  expect(
    (
      await call(
        {
          action: 'approve',
          refs,
          notes: 'Synthetic test only; not actual educational approval.',
        },
        'review',
      )
    ).status,
  ).toBe(200);
  expect((await call({ action: 'publish', refs }, 'review')).status).toBe(200);
  expect((await call({ action: 'prepare', demand: 20 })).status).toBe(200);
  const view = await overview();
  expect(view).toMatchObject({
    ready: 8,
    shortage: 12,
    pending: 0,
    admitted: 8,
  });
  expect(await db.contentSupplyReservation.count()).toBe(8);
  await call({ action: 'prepare', demand: 20 });
  expect(await db.contentSupplyReservation.count()).toBe(8);
  await expect(
    db.contentSupplyReservation.updateMany({ data: { exposureKey: 'tamper' } }),
  ).rejects.toThrow();
  const userId = (await db.identityBootstrap.findFirstOrThrow()).userId;
  const next = new Date(Date.now() + 7 * 86400000);
  const following = await db.$transaction((tx) =>
    prepareSupply(tx, userId, 20, next),
  );
  expect(following).toMatchObject({
    ready: 0,
    shortage: 20,
    recentGroups: 8,
    pending: 8,
  });
  const later = await db.$transaction((tx) =>
    supplyOverview(tx, userId, new Date(Date.now() + 21 * 86400000)),
  );
  expect(later.ready).toBe(8); // Reuse after the cooldown, without a new review.
  expect(await db.contentReview.count()).toBe(8);
});
it('edits consume reserved allowance; wrong displayed sum blocks approval, replay does not charge twice', async () => {
  const { call, batch, overview } = await setup();
  await call({ action: 'prepare', demand: 20 });
  const first = (await batch()).items[0]!;
  const changed = structuredClone(first.payload);
  changed.learner.prompt = '9 + 9 =';
  const edit = {
    action: 'edit',
    id: first.id,
    contentHash: first.contentHash,
    payload: changed,
  };
  expect((await call(edit, 'review')).status).toBe(200);
  expect((await call(edit, 'review')).status).toBe(200);
  const updated = (await batch()).items.find(
    (i) => i.contentId === first.contentId,
  )!;
  expect(updated.checks.some((c) => c.code === 'family-mismatch')).toBe(true);
  expect(
    (
      await call(
        {
          action: 'approve',
          refs: [{ id: updated.id, contentHash: updated.contentHash }],
          notes: 'Synthetic test approval attempt.',
        },
        'review',
      )
    ).status,
  ).toBe(409);
  expect(
    (
      await call(
        {
          action: 'edit',
          id: updated.id,
          contentHash: updated.contentHash,
          payload: first.payload,
        },
        'review',
      )
    ).status,
  ).toBe(200);
  expect((await overview()).admitted).toBe(10);
  const latest = (await batch()).items.find(
    (i) => i.contentId === first.contentId,
  )!;
  const another = structuredClone(latest.payload);
  another.privateEvaluation.explanation += ' Controleer je antwoord.';
  expect(
    (
      await call(
        {
          action: 'edit',
          id: latest.id,
          contentHash: latest.contentHash,
          payload: another,
        },
        'review',
      )
    ).status,
  ).toBe(409);
  expect(await db.contentSupplyAdmission.count()).toBe(10);
});
it('pending backlog, measured time and rejected work never reset the weekly budget', async () => {
  const { call, batch, overview } = await setup();
  await call({ action: 'prepare', demand: 20 });
  const items = (await batch()).items;
  const refs = items.map(({ id, contentHash }) => ({ id, contentHash }));
  expect(
    (
      await call(
        {
          action: 'reject',
          refs,
          notes: 'Synthetic rejection to exercise the workload cap.',
        },
        'review',
      )
    ).status,
  ).toBe(200);
  await call({ action: 'prepare', demand: 600 });
  expect((await overview()).admitted).toBe(8);
  const userId = (await db.identityBootstrap.findFirstOrThrow()).userId;
  const { id } = await batch();
  await db.contentReviewProgress.create({
    data: { reviewerId: userId, batchId: id, totalMs: 900000 },
  });
  expect((await overview()).capacity).toBe(0);
  await call({ action: 'prepare', demand: 600 });
  expect(await db.contentSupplyAdmission.count()).toBe(8);
});

it('carries unfinished prior-week work forward without growing beyond ten outstanding versions', async () => {
  const { call } = await setup();
  await call({ action: 'prepare', demand: 600 });
  const userId = (await db.identityBootstrap.findFirstOrThrow()).userId;
  const next = new Date(Date.now() + 7 * 86400000);
  const result = await db.$transaction((tx) =>
    prepareSupply(tx, userId, 600, next),
  );
  expect(result).toMatchObject({
    pending: 10,
    admitted: 2,
    capacity: 0,
    estimatedMs: 900000,
    ready: 0,
  });
  const retry = await db.$transaction((tx) =>
    prepareSupply(tx, userId, 600, next),
  );
  expect(retry.pending).toBe(10);
  expect(await db.contentSupplyAdmission.count()).toBe(10);
});
it('an edited published item needs new approval without silently rewriting an existing reservation', async () => {
  const { call, batch, overview } = await setup();
  await call({ action: 'prepare', demand: 1 });
  const item = (await batch()).items[0]!;
  const refs = [{ id: item.id, contentHash: item.contentHash }];
  await call(
    {
      action: 'approve',
      refs,
      notes: 'Synthetic publication for immutable reservation test.',
    },
    'review',
  );
  await call({ action: 'publish', refs }, 'review');
  await call({ action: 'prepare', demand: 1 });
  const changed = structuredClone(item.payload);
  changed.privateEvaluation.explanation += ' Controleer je antwoord.';
  expect(
    (
      await call(
        {
          action: 'edit',
          id: item.id,
          contentHash: item.contentHash,
          payload: changed,
        },
        'review',
      )
    ).status,
  ).toBe(200);
  expect((await batch()).items[0]).toMatchObject({
    revision: 2,
    decision: 'pending',
    published: false,
  });
  expect((await overview()).readyIds).toEqual([item.id]);
  await call({ action: 'prepare', demand: 1 });
  expect(
    (await db.contentSupplyReservation.findFirstOrThrow()).contentVersionId,
  ).toBe(item.id);
  const userId = (await db.identityBootstrap.findFirstOrThrow()).userId;
  const later = await db.$transaction((tx) =>
    supplyOverview(tx, userId, new Date(Date.now() + 21 * 86400000)),
  );
  expect(later.ready).toBe(0); // Latest version still unapproved; prior-week pin isn't new stock.
});

if (process.env.NEXO_TEST_BUILT === '1')
  it('built D14-S1: saved small review, publication, reuse, bounded shortages and accessible responsive overview', async () => {
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
      await page.goto(`${config.origin}/guardian/content/supply`, {
        waitUntil: 'domcontentloaded',
      });
      await browserExpect(
        page.getByRole('heading', {
          name: 'Oefenvoorraad',
        }),
      ).toBeVisible();
      await page.getByRole('spinbutton').fill('2');
      await page
        .getByRole('button', { name: 'Kleine set voorbereiden' })
        .press('Enter');
      await browserExpect(
        page.getByRole('heading', { name: '2 oefeningen te beoordelen' }),
      ).toBeVisible();
      await page.getByRole('link', { name: 'Beoordeel de kleine set' }).click();
      await browserExpect(
        page.getByRole('heading', { name: 'Oefeningen beoordelen' }),
      ).toBeVisible();
      const headers = new Headers({
        origin: config.origin,
        cookie: [...operator.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
      });
      const read = await contentReviewHandler(
        db,
        config,
        new Request(
          `${config.origin}/api/guardian/content-review?batch=optellen`,
          { headers },
        ),
      );
      const batch: ReviewBatch = await read.json();
      expect(batch.items).toHaveLength(2);
      for (const item of batch.items) {
        await page
          .getByRole('button', {
            name: new RegExp(item.title.replace(/[+]/g, '\\+')),
          })
          .first()
          .click();
        await page
          .getByRole('checkbox', {
            name: `Selecteer ${item.title}`,
            exact: true,
          })
          .check();
      }
      await page
        .getByRole('button', { name: /Beslis over selectie \(2\)/ })
        .click();
      await page
        .getByLabel('Beoordelingsnotitie (optioneel)')
        .fill('Synthetische browsertest; geen echte educatieve goedkeuring.');
      await page
        .getByRole('checkbox', {
          name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
        })
        .check();
      await page.getByRole('button', { name: 'Selectie goedkeuren' }).click();
      await browserExpect(
        page.getByText('Versie 1 · Goedgekeurd'),
      ).toBeVisible();
      for (const item of batch.items) {
        await page
          .getByRole('button', {
            name: new RegExp(item.title.replace(/[+]/g, '\\+')),
          })
          .first()
          .click();
        await page
          .getByRole('checkbox', {
            name: `Selecteer ${item.title}`,
            exact: true,
          })
          .check();
      }
      await page
        .getByRole('button', { name: /Beslis over selectie \(2\)/ })
        .click();
      await page
        .getByRole('checkbox', {
          name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
        })
        .check();
      await page
        .getByRole('button', { name: 'Goedgekeurde selectie publiceren' })
        .click();
      await browserExpect(
        page.getByText('Versie 1 · Gepubliceerd voor lokale proef'),
      ).toBeVisible();
      await page
        .getByRole('link', { name: '← Terug naar weekvoorraad' })
        .click();
      await browserExpect(
        page.getByRole('heading', {
          name: 'Je voorraad is klaar voor de volgende stap',
        }),
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Voorraad opnieuw plannen' })
        .click();
      await browserExpect(
        page
          .getByRole('status')
          .filter({ hasText: 'Weekvoorraad opgeslagen.' }),
      ).toBeVisible();
      expect(await db.contentSupplyReservation.count()).toBe(2);
      await page.reload();
      await page
        .getByText('Voorraad, weeklimiet en reviewtijd', { exact: true })
        .click();
      await browserExpect(
        page.getByText(/2 \/ 10 nieuwe versies/),
      ).toBeVisible();
      await page
        .getByText('Voorraad, weeklimiet en reviewtijd', { exact: true })
        .click();
      await page.getByRole('spinbutton').fill('600');
      await page
        .getByRole('button', { name: 'Voorraad opnieuw plannen' })
        .click();
      await browserExpect(
        page.getByRole('heading', { name: '6 oefeningen te beoordelen' }),
      ).toBeVisible();
      await page
        .getByText('Voorraad, weeklimiet en reviewtijd', { exact: true })
        .click();
      await browserExpect(
        page.getByText(/Er ontbreken nog 598 oefeningen/),
      ).toBeVisible();
      expect(await db.contentSupplyAdmission.count()).toBe(8);
      await mkdir('.artifacts/d14-supply', { recursive: true });
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
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
          path: `.artifacts/d14-supply/supply-${width}.png`,
        });
      }
      expect(errors).toEqual([]);
      await context.clearCookies();
      await page.reload();
      await browserExpect(page.getByRole('navigation')).toHaveCount(0);
      await browserExpect(
        page.getByRole('button', { name: 'Aanmelden als ouder', exact: true }),
      ).toBeVisible();
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
