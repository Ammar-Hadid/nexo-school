import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db, config, provision } from './helpers';
import { contentReviewHandler } from '../../src/server/content/review';
import type { ReviewBatch } from '../../src/modules/content/review/review-contract';
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
      new Request(`${config.origin}/api/guardian/content-review`, {
        method: body ? 'POST' : 'GET',
        headers: h,
        body: body ? JSON.stringify(body) : undefined,
      }),
    );
  expect((await call({ action: 'initialize' })).status).toBe(200);
  const batch: ReviewBatch = await (await call()).json();
  return { call, batch, headers };
}
it('protects complete private content from anonymous, hostile-origin, ordinary adult and stale-MFA access', async () => {
  const { call, headers } = await setup();
  expect(
    (await call(undefined, new Headers({ origin: config.origin }))).status,
  ).toBe(401);
  expect(
    (
      await call(
        undefined,
        new Headers({
          ...Object.fromEntries(headers),
          origin: 'https://evil.invalid',
        }),
      )
    ).status,
  ).toBe(403);
  await db.session.updateMany({
    data: { mfaVerifiedAt: new Date(Date.now() - 360000) },
  });
  expect((await call()).status).toBe(403);
  await db.user.create({
    data: {
      id: 'ordinary-review-test',
      name: 'Synthetic ordinary adult',
      email: 'ordinary-review@example.invalid',
      emailVerified: true,
      twoFactorEnabled: true,
    },
  });
  await db.session.updateMany({
    data: { userId: 'ordinary-review-test', mfaVerifiedAt: new Date() },
  });
  expect((await call()).status).toBe(403);
});
it('saves immutable edits, rejects stale/broken selections, and atomically approves and publishes explicit exact versions', async () => {
  const { call, batch } = await setup();
  expect(batch.items).toHaveLength(3);
  const refs = batch.items.map(({ id, contentHash }) => ({ id, contentHash }));
  const approve = {
    action: 'approve',
    refs,
    notes: 'Synthetic test decision; not educational approval.',
  };
  expect((await call(approve)).status).toBe(409);
  expect(await db.contentReview.count()).toBe(0);
  const first = batch.items[0]!;
  expect((await call({ ...approve, refs: [refs[0]] })).status).toBe(200);
  expect((await call({ action: 'publish', refs: [refs[0]] })).status).toBe(200);
  const third = batch.items[2]!;
  const changed = structuredClone(third.payload);
  changed.learner.prompt = 'Lina __ (spelen) buiten.';
  changed.privateEvaluation.explanation =
    'Bij Lina hoort de persoonsvorm speelt.';
  const edit = {
    action: 'edit',
    id: third.id,
    contentHash: third.contentHash,
    payload: changed,
  };
  expect((await call(edit)).status).toBe(200);
  expect((await call(edit)).status).toBe(200);
  let updated: ReviewBatch = await (await call()).json();
  expect(updated.items[2]!.revision).toBe(2);
  expect(updated.items[2]!.advisory.status).toBe('stale');
  expect(updated.items[2]!.decision).toBe('pending');
  expect((await call({ ...approve, refs: [refs[2]] })).status).toBe(409);
  expect(
    (
      await call({
        action: 'edit',
        id: first.id,
        contentHash: first.contentHash,
        payload: {
          ...first.payload,
          learner: {
            ...first.payload.learner,
            prompt: 'Hij __ (hebben) een bal.',
          },
        },
      })
    ).status,
  ).toBe(200);
  updated = await (await call()).json();
  expect(updated.items[0]!.published).toBe(false);
  expect(updated.items[0]!.decision).toBe('pending');
  expect(
    (
      await call({
        action: 'publish',
        refs: [
          {
            id: updated.items[0]!.id,
            contentHash: updated.items[0]!.contentHash,
          },
        ],
      })
    ).status,
  ).toBe(409);
  expect(await db.contentPublication.count()).toBe(1);
});
it('persists review cursor and active time without duplicate ticks or competing-tab inflation', async () => {
  const { call, batch } = await setup();
  expect(
    (await call({ action: 'cursor', contentId: batch.items[1]!.contentId }))
      .status,
  ).toBe(200);
  const start = await (await call({ action: 'start-time' })).json();
  const row = await db.contentReviewProgress.findFirstOrThrow();
  await db.contentReviewProgress.update({
    where: {
      reviewerId_batchId: { reviewerId: row.reviewerId, batchId: row.batchId },
    },
    data: {
      startedAt: new Date(Date.now() - 5000),
      lastPulseAt: new Date(Date.now() - 5000),
    },
  });
  const tick = {
    action: 'time',
    sessionId: start.sessionId,
    sequence: 1,
    sessionMs: 3000,
  };
  expect((await call(tick)).status).toBe(200);
  expect((await call(tick)).status).toBe(200);
  const read: ReviewBatch = await (await call()).json();
  expect(read.activeMs).toBe(3000);
  expect(read.cursor).toBe(batch.items[1]!.contentId);
  await call({ action: 'start-time' });
  expect((await call({ ...tick, sequence: 2, sessionMs: 4000 })).status).toBe(
    409,
  );
});

if (process.env.NEXO_TEST_BUILT === '1')
  it('built D14 review: protected content, keyboard editing, exact publication, reload, timing and responsive layout', async () => {
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
      const loaded = page.waitForResponse((r) =>
        r.url().endsWith('/api/guardian/content-review'),
      );
      await page.goto(`${config.origin}/guardian/content/review`, {
        waitUntil: 'domcontentloaded',
      });
      expect((await loaded).status()).toBe(200);
      await page
        .getByRole('button', { name: 'Proefset klaarzetten' })
        .press('Enter');
      await browserExpect(
        page.getByRole('heading', { name: 'Hebben', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: /^03\s*Spelen/ }).press('Enter');
      await page.getByRole('button', { name: 'Bewerk Spelen' }).press('Enter');
      await page
        .getByRole('textbox', { name: 'Vraag', exact: true })
        .fill('Lina __ (spelen) buiten.');
      await page
        .getByRole('textbox', { name: 'Uitleg', exact: true })
        .fill('Bij Lina hoort speelt.');
      await page
        .getByRole('button', { name: 'Nieuwe versie opslaan' })
        .press('Enter');
      await browserExpect(
        page.getByText('Versie 2 · Nog te beoordelen'),
      ).toBeVisible();
      await page.reload();
      await browserExpect(
        page.getByText('Versie 2 · Nog te beoordelen'),
      ).toBeVisible();
      await page.getByRole('checkbox', { name: 'Selecteer Spelen' }).check();
      await page
        .getByRole('button', { name: /Beslis over selectie \(1\)/ })
        .press('Enter');
      await page
        .getByLabel('Beoordelingsnotitie (optioneel)')
        .fill('Synthetische browsertest; geen echte educatieve goedkeuring.');
      await page
        .getByRole('checkbox', {
          name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
        })
        .check();
      await page
        .getByRole('button', { name: 'Selectie goedkeuren' })
        .press('Enter');
      await browserExpect(
        page.getByText('Versie 2 · Goedgekeurd'),
      ).toBeVisible();
      await page.getByRole('checkbox', { name: 'Selecteer Spelen' }).check();
      await page
        .getByRole('button', { name: /Beslis over selectie \(1\)/ })
        .press('Enter');
      await page
        .getByRole('checkbox', {
          name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
        })
        .check();
      await page
        .getByRole('button', { name: 'Goedgekeurde selectie publiceren' })
        .press('Enter');
      await browserExpect(
        page.getByText('Versie 2 · Gepubliceerd voor lokale proef'),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Start tijdmeting' }).click();
      await browserExpect(
        page.getByRole('timer', { name: 'Actieve beoordelingstijd' }),
      ).not.toHaveText('0:00');
      await browserExpect(page.getByText('Opgeslagen: 0:00')).toBeVisible();
      await page.getByRole('button', { name: 'Pauzeer tijdmeting' }).click();
      await browserExpect
        .poll(
          async () =>
            (await db.contentReviewProgress.findFirstOrThrow()).totalMs,
        )
        .toBeGreaterThan(500);
      await page.reload();
      await browserExpect(
        page.getByText('Versie 2 · Gepubliceerd voor lokale proef'),
      ).toBeVisible();
      await page.getByRole('main').evaluate((el) => {
        el.scrollTop = 0;
      });
      await mkdir('.artifacts/d14', { recursive: true });
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        if (width === 320) {
          const picker = page.getByRole('combobox', {
            name: 'Kies een oefening',
          });
          await picker.selectOption({ label: '1. Hebben' });
          await browserExpect(
            page.getByRole('heading', { name: 'Hebben', exact: true }),
          ).toBeVisible();
          await picker.selectOption({ label: '3. Spelen' });
          await browserExpect(
            page.getByText('Versie 2 · Gepubliceerd voor lokale proef'),
          ).toBeVisible();
        }

        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        await page.screenshot({ path: `.artifacts/d14/review-${width}.png` });
      }
      expect(errors).toEqual([]);
      expect(await db.contentPublication.count()).toBe(1);
      await context.clearCookies();
      await page.reload();
      await browserExpect(page.getByRole('navigation')).toHaveCount(0);
      await browserExpect(
        page.getByRole('button', { name: 'Aanmelden als ouder', exact: true }),
      ).toBeVisible();
      await browserExpect(page.getByText('Bij Lina hoort speelt.')).toHaveCount(
        0,
      );
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

it('rolls back the whole selection when a later terminal review conflicts', async () => {
  const { call, batch } = await setup();
  const refs = batch.items
    .slice(0, 2)
    .map(({ id, contentHash }) => ({ id, contentHash }));
  expect(
    (
      await call({
        action: 'reject',
        refs: [refs[1]],
        notes: 'Synthetic test rejection only.',
      })
    ).status,
  ).toBe(200);
  expect(
    (
      await call({
        action: 'approve',
        refs,
        notes: 'Synthetic test decision only.',
      })
    ).status,
  ).toBe(409);
  expect(await db.contentReview.count()).toBe(1);
  expect(
    await db.contentReview.findUnique({
      where: { contentVersionId: refs[0]!.id },
    }),
  ).toBeNull();
  expect(
    await db.identityAudit.count({
      where: { event: 'content-review-recorded' },
    }),
  ).toBe(1);
});

it('records blank or short optional notes while retaining blockers and explicit publication', async () => {
  const { call, batch } = await setup();
  const refs = batch.items.map(({ id, contentHash }) => ({ id, contentHash }));
  expect((await call({ action: 'approve', refs, notes: '' })).status).toBe(409);
  expect(await db.contentReview.count()).toBe(0);
  expect(
    (await call({ action: 'approve', refs: [refs[0]], notes: 42 })).status,
  ).toBe(400);
  expect(
    (
      await call({
        action: 'approve',
        refs: [refs[0]],
        notes: 'a'.repeat(16001),
      })
    ).status,
  ).toBe(400);
  expect((await call({ action: 'approve', refs: [refs[0]] })).status).toBe(200);
  expect(
    (
      await db.contentReview.findFirstOrThrow({
        where: { contentVersionId: refs[0]!.id },
      })
    ).notes,
  ).toBe('');
  expect(await db.contentPublication.count()).toBe(0);
  expect(
    (await call({ action: 'reject', refs: [refs[1]], notes: '' })).status,
  ).toBe(200);
  expect(
    (await call({ action: 'reject', refs: [refs[2]], notes: 'Nee' })).status,
  ).toBe(200);
  expect((await call({ action: 'publish', refs: [refs[1]] })).status).toBe(409);
  expect((await call({ action: 'publish', refs: [refs[0]] })).status).toBe(200);
});
