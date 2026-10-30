import { afterAll, beforeEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { db, config, provision } from './helpers';
import { contentReviewHandler } from '../../src/server/content/review';
import { contentCommand } from '../../src/server/content/records';
import type { ReviewBatch } from '../../src/modules/content/review/review-contract';
import {
  emptyFamilyDraft,
  type FamilyReviewState,
} from '../../src/modules/content/family-review/family-review-contract';
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
  const call = (body?: unknown, family = false, h = headers) =>
    contentReviewHandler(
      db,
      config,
      new Request(
        config.origin +
          (family
            ? '/api/guardian/family-review?package=spelling-doubling-workflow-v3'
            : '/api/guardian/content-review?batch=spelling-doubling'),
        {
          method: body ? 'POST' : 'GET',
          headers: h,
          body: body ? JSON.stringify(body) : undefined,
        },
      ),
    );
  return { call, headers };
}
it('reuses exact family decisions without granting publication, and isolates spelling from addition', async () => {
  const { call } = await setup();
  const response = await call(undefined, true);
  expect(response.status).toBe(200);
  const state: FamilyReviewState = await response.json();
  expect(state.package.inventory).toHaveLength(10);
  const draft = {
    ...emptyFamilyDraft(state.package),
    examples: state.package.examples.map((e) => e.index),
    judgments: Object.fromEntries(
      state.package.criteria.map((c) => [c.id, 'accept']),
    ),
    basis: 'independent-human',
    notes: 'Synthetic technical test only, no real educational approval.',
  };
  const save = {
    action: 'record',
    packageHash: state.packageHash,
    revision: 0,
    draft,
    confirmed: true,
  };
  expect((await call(save, true)).status).toBe(200);
  expect((await call(save, true)).status).toBe(200);
  expect(await db.familyReviewDecision.count()).toBe(1);
  expect(await db.contentPublication.count()).toBe(0);
  expect((await call({ ...save, packageHash: 'wrong' }, true)).status).toBe(
    409,
  );
});
it('initializes once, reviews and explicitly publishes exact versions through the shared lifecycle; altered bank content is blocked even through raw records', async () => {
  const { call, headers } = await setup();
  expect((await call({ action: 'initialize' })).status).toBe(200);
  expect((await call({ action: 'initialize' })).status).toBe(200);
  const batch: ReviewBatch = await (await call()).json();
  expect(batch.items).toHaveLength(10);
  expect(
    batch.items.every(
      (i) =>
        i.checks.length === 0 &&
        i.decision === 'pending' &&
        !i.published &&
        i.advisory.provenance === 'deterministic-check',
    ),
  ).toBe(true);
  const refs = batch.items.map(({ id, contentHash }) => ({ id, contentHash }));
  expect((await call({ action: 'publish', refs })).status).toBe(409);
  expect(
    (
      await call({
        action: 'approve',
        refs,
        notes: 'Synthetic test review only; not educational approval.',
      })
    ).status,
  ).toBe(200);
  expect((await call({ action: 'publish', refs })).status).toBe(200);
  expect((await call({ action: 'publish', refs })).status).toBe(200);
  expect(await db.contentPublication.count()).toBe(10);
  const old = await db.contentVersion.findUniqueOrThrow({
    where: { id: refs[0]!.id },
  });
  const payload = structuredClone(batch.items[0]!.payload);
  payload.privateEvaluation.acceptedAnswers = ['katen'];
  expect(
    (
      await call({
        action: 'edit',
        id: old.id,
        contentHash: old.contentHash,
        payload,
      })
    ).status,
  ).toBe(200);
  const edited: ReviewBatch = await (await call()).json();
  expect(edited.items[0]!.decision).toBe('pending');
  expect(edited.items[0]!.published).toBe(false);
  expect(
    edited.items[0]!.checks.some((c) => c.code === 'spelling-bank-mismatch'),
  ).toBe(true);
  const changed = edited.items[0]!;
  expect(
    (
      await call({
        action: 'approve',
        refs: [{ id: changed.id, contentHash: changed.contentHash }],
        notes: 'Must be blocked regardless of the review UI.',
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await contentCommand(db, config, headers, {
        action: 'review',
        contentVersionId: changed.id,
        contentHash: changed.contentHash,
        decision: 'approved',
        notes: 'Raw endpoint must enforce the same bank constraints.',
      })
    ).status,
  ).toBe(409);
  expect((await call({ action: 'publish', refs: [refs[0]] })).status).toBe(409);
  expect(await db.contentPublication.count()).toBe(10);
});
it('keeps private bank and decisions behind the same authentication, origin and recent-MFA boundaries', async () => {
  const { call, headers } = await setup();
  for (const family of [false, true]) {
    expect(
      (await call(undefined, family, new Headers({ origin: config.origin })))
        .status,
    ).toBe(401);
    const hostile = new Headers(headers);
    hostile.set('origin', 'https://evil.invalid');
    expect((await call(undefined, family, hostile)).status).toBe(403);
  }
  await db.session.updateMany({
    data: { mfaVerifiedAt: new Date(Date.now() - 360000) },
  });
  expect((await call()).status).toBe(403);
  expect((await call(undefined, true)).status).toBe(403);
});

if (process.env.NEXO_TEST_BUILT === '1')
  it('built Spelling review: bank publication, saved reload and shared family UI across viewport sizes', async () => {
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
      await page.goto(`${config.origin}/guardian/content/spelling`);
      await page.getByRole('button', { name: 'Proefset klaarzetten' }).click();
      await browserExpect(
        page.getByRole('heading', { name: 'kat', exact: true }),
      ).toBeVisible();
      await page.getByRole('checkbox', { name: 'Selecteer kat' }).check();
      await page
        .getByRole('button', { name: /Beslis over selectie \(1\)/ })
        .click();
      await page
        .getByLabel('Beoordelingsnotitie (optioneel)')
        .fill('Synthetische test; geen echte educatieve goedkeuring.');
      await page
        .getByRole('checkbox', {
          name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
        })
        .check();
      await page.getByRole('button', { name: 'Selectie goedkeuren' }).click();
      await browserExpect(
        page.getByText('Versie 1 · Goedgekeurd'),
      ).toBeVisible();
      await page.getByRole('checkbox', { name: 'Selecteer kat' }).check();
      await page
        .getByRole('button', { name: /Beslis over selectie \(1\)/ })
        .click();
      await page
        .getByRole('checkbox', {
          name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
        })
        .check();
      await page
        .getByRole('button', { name: 'Goedgekeurde selectie publiceren' })
        .click();
      await page.reload();
      await browserExpect(
        page.getByText('Versie 1 · Gepubliceerd voor lokale proef'),
      ).toBeVisible();
      await mkdir('.artifacts/spelling-family', { recursive: true });
      for (const path of [
        '/guardian/content/spelling',
        '/guardian/content/supply/family?package=spelling-doubling-workflow-v3',
      ]) {
        await page.goto(config.origin + path);
        await browserExpect(
          page.getByRole('heading', {
            name: path.includes('family')
              ? 'Spelling · medeklinkerverdubbeling'
              : 'kat',
            exact: true,
          }),
        ).toBeVisible();
        for (const width of [320, 768, 1024, 1440]) {
          await page.setViewportSize({ width, height: 1000 });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
            [],
          );
          await page.screenshot({
            path: `.artifacts/spelling-family/${path.includes('family') ? 'family' : 'bank'}-${width}.png`,
          });
        }
      }
      expect(errors).toEqual([]);
      expect(await db.contentPublication.count()).toBe(1);
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

it('rolls back the whole selection when a later terminal review conflicts', async () => {
  const { call } = await setup();
  expect((await call({ action: 'initialize' })).status).toBe(200);
  const batch: ReviewBatch = await (await call()).json();
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
