import { afterAll, expect, it, vi } from 'vitest';
import { chromium, expect as browserExpect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { mkdir } from 'node:fs/promises';
import { spawn, type ChildProcess } from 'node:child_process';
vi.mock('server-only', () => ({}));
import { db, config, adult, Browser, totp } from './helpers';
import { bootstrapAdult } from '../../src/server/auth/service';
afterAll(async () => {
  await db.$disconnect();
});
it.runIf(process.env.NEXO_TEST_BUILT === '1')(
  'D04-M1 ordinary guardian/student UI: setup, enrollment, re-login, saved work, verification and recovery',
  async () => {
    await db.$executeRawUnsafe(
      'TRUNCATE "User", "IdentityBootstrap", "IdentityAudit", "LocalAuthMessage", "Verification", "RateLimit", "CoverageObjective", "ContentRubricVersion" CASCADE',
    );
    const probe = createServer();
    await new Promise<void>((r) => probe.listen(0, '127.0.0.1', r));
    const address = probe.address();
    if (!address || typeof address === 'string') throw Error();
    const port = address.port;
    await new Promise<void>((r) => probe.close(() => r()));
    const original = config.origin;
    config.origin = `http://localhost:${port}`;
    let child: ChildProcess | undefined;
    async function stop() {
      if (child) {
        const exited = new Promise<void>((r) => child!.once('exit', () => r()));
        child.kill();
        await exited;
        child = undefined;
      }
    }
    async function start() {
      child = spawn(process.execPath, ['.next/standalone/server.js'], {
        env: {
          ...process.env,
          PORT: String(port),
          HOSTNAME: '127.0.0.1',
          BETTER_AUTH_URL: config.origin,
        },
        stdio: 'ignore',
      });
      let ready = false;
      for (let i = 0; i < 100; i++) {
        try {
          if ((await fetch(config.origin)).ok) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!ready) throw Error('Built app did not start');
    }
    const browser = await chromium.launch();
    const guardian = await browser.newContext(),
      student = await browser.newContext();
    const gp = await guardian.newPage(),
      sp = await student.newPage();
    gp.setDefaultTimeout(10000);
    sp.setDefaultTimeout(10000);
    const errors: string[] = [];
    gp.on('pageerror', (e) => errors.push(e.message));
    sp.on('pageerror', (e) => errors.push(e.message));
    async function inspectJourneyScreen(name: string) {
      await mkdir('.artifacts/d04-m2', { recursive: true });
      for (const width of [320, 768, 1024, 1440]) {
        await gp.setViewportSize({ width, height: 1000 });
        expect(
          (await new AxeBuilder({ page: gp }).analyze()).violations,
        ).toEqual([]);
        expect(
          await gp
            .getByRole('main')
            .evaluate((el) => el.scrollWidth <= el.clientWidth),
        ).toBe(true);
        await gp.getByRole('main').evaluate((el) => {
          el.scrollTop = 0;
        });
        await gp.screenshot({ path: `.artifacts/d04-m2/${name}-${width}.png` });
      }
    }
    async function guardianLogin(page: Page, secret: string) {
      await page.getByLabel('E-mailadres', { exact: false }).fill(adult.email);
      await page
        .getByLabel('Wachtwoord', { exact: false })
        .fill(adult.password);
      await page.getByRole('button', { name: 'Aanmelden als ouder' }).click();
      await page
        .getByLabel('Authenticatorcode', { exact: false })
        .fill(totp(secret));
      await page.getByRole('button', { name: 'Code bevestigen' }).click();
    }
    try {
      await start();
      await bootstrapAdult(db, config, adult);
      const outbox = new Browser();
      await outbox.call('/send-verification-email', {
        email: adult.email,
        callbackURL: `${config.origin}/guardian`,
      });
      const verification = await db.localAuthMessage.findFirstOrThrow({
        where: { kind: 'verify-email' },
      });
      await gp.goto(verification.url);
      await gp.goto(`${config.origin}/guardian/content/assignments`);
      await browserExpect(
        gp.getByLabel('E-mailadres', { exact: false }),
      ).toBeVisible();
      await browserExpect(gp.getByRole('navigation')).toHaveCount(0);
      await browserExpect(gp.getByText('Ammar', { exact: true })).toHaveCount(
        0,
      );
      await gp.getByLabel('E-mailadres', { exact: false }).fill(adult.email);
      await gp
        .getByLabel('Wachtwoord', { exact: false })
        .fill('wrong-but-long-password');
      await gp.getByRole('button', { name: 'Aanmelden als ouder' }).click();
      await browserExpect(gp.getByRole('alert')).toBeVisible();
      await gp.getByLabel('Wachtwoord', { exact: false }).fill(adult.password);
      await gp.getByRole('button', { name: 'Aanmelden als ouder' }).click();
      await browserExpect(
        gp.getByRole('button', { name: 'Authenticator instellen' }),
      ).toBeVisible();
      await gp.getByLabel('Wachtwoord', { exact: false }).fill(adult.password);
      await gp.getByRole('button', { name: 'Authenticator instellen' }).click();
      const secret = await gp
        .getByLabel('Authenticator-sleutel', { exact: true })
        .inputValue();
      const recovery = (await gp.locator('pre').textContent())!
        .trim()
        .split('\n');
      await gp
        .getByRole('checkbox', { name: /Ik heb mijn herstelcodes/ })
        .check();
      await gp
        .getByLabel('Authenticatorcode', { exact: false })
        .fill(String((Number(totp(secret)) + 1) % 1000000).padStart(6, '0'));
      await gp.getByRole('button', { name: 'Code bevestigen' }).click();
      await browserExpect(gp.getByRole('alert')).toBeVisible();
      await gp
        .getByLabel('Authenticatorcode', { exact: false })
        .fill(totp(secret));
      await gp.getByRole('button', { name: 'Code bevestigen' }).click();
      await browserExpect(
        gp.getByRole('heading', { name: 'Een oefensessie klaarzetten' }),
      ).toBeVisible();
      await gp.goto(`${config.origin}/guardian/access`);
      await gp
        .getByLabel('Naam testleerling', { exact: false })
        .fill('Zelfstandig testen');
      await gp
        .getByRole('button', { name: 'Testleerling toevoegen', exact: true })
        .click();
      await browserExpect(
        gp.getByText('Testleerling toegevoegd.', { exact: true }),
      ).toBeVisible();
      await sp.goto(`${config.origin}/student`);
      await sp.getByRole('link', { name: 'Nieuwe browser aanmelden' }).click();
      await sp
        .getByLabel('Naam van deze browser', { exact: false })
        .fill('Eigen leerlingprofiel');
      await sp.getByRole('button', { name: 'Goedkeuring aanvragen' }).click();
      const code = await sp
        .getByLabel('Aanmeldcode', { exact: true })
        .inputValue();
      await gp
        .getByLabel('Aanmeldcode van leerlingbrowser', { exact: false })
        .fill(code);
      await gp
        .getByRole('button', { name: 'Browser goedkeuren', exact: true })
        .click();
      await browserExpect(gp.getByRole('status')).toContainText(
        'Browser goedgekeurd.',
      );
      const cdp = await student.newCDPSession(sp);
      await cdp.send('WebAuthn.enable');
      await cdp.send('WebAuthn.addVirtualAuthenticator', {
        options: {
          protocol: 'ctap2',
          transport: 'internal',
          hasResidentKey: true,
          hasUserVerification: true,
          isUserVerified: true,
          automaticPresenceSimulation: true,
        },
      });
      await sp.getByRole('button', { name: 'Goedkeuring controleren' }).click();
      await sp.getByRole('button', { name: 'Passkey aanmaken' }).click();
      await sp
        .getByRole('link', {
          name: 'Verder naar leerlingaanmelding',
          exact: true,
        })
        .click();
      await sp.getByRole('button', { name: 'Aanmelden', exact: true }).click();
      await browserExpect(
        sp.getByRole('heading', { name: 'Jouw taken' }),
      ).toBeVisible();
      await gp.goto(`${config.origin}/guardian`);
      await browserExpect(
        gp.getByRole('link', { name: 'Oefeningen voorbereiden', exact: true }),
      ).toBeVisible();
      await inspectJourneyScreen('home');
      await gp
        .getByRole('link', { name: 'Oefeningen voorbereiden', exact: true })
        .click();
      await gp.getByRole('spinbutton').fill('2');
      await gp.getByRole('button', { name: 'Kleine set voorbereiden' }).click();
      await browserExpect(
        gp.getByText('Weekvoorraad opgeslagen.', { exact: false }),
      ).toBeVisible();
      // The submit button changes from primary to outline after preparation.
      // Inspect its settled colors, not an intermediate CSS transition frame.
      await gp
        .getByRole('button', { name: 'Voorraad opnieuw plannen' })
        .evaluate((el) =>
          Promise.all(
            el.getAnimations().map((animation) => animation.finished),
          ),
        );
      await inspectJourneyScreen('prepared');
      await gp
        .getByRole('link', { name: 'Beoordeel de kleine set', exact: true })
        .click();
      for (const action of ['approve', 'publish']) {
        if (action === 'publish') {
          await gp
            .getByRole('button', { name: 'Verder naar publiceren (2)' })
            .click();
          await browserExpect(
            gp.getByRole('button', {
              name: 'Goedgekeurde selectie publiceren',
            }),
          ).toBeDisabled();
        } else {
          for (let i = 0; i < 2; i++) {
            if (
              i === 0 &&
              (await gp
                .getByRole('button', { name: 'Vorige', exact: true })
                .isEnabled())
            )
              await gp
                .getByRole('button', { name: 'Vorige', exact: true })
                .click();
            await gp.getByRole('checkbox', { name: /^Selecteer / }).check();
            if (i === 0)
              await gp
                .getByRole('button', { name: 'Volgende oefening', exact: true })
                .click();
          }
          await gp
            .getByRole('button', { name: /Beslis over selectie \(2\)/ })
            .click();
        }
        if (action === 'approve')
          await browserExpect(
            gp.getByLabel('Beoordelingsnotitie (optioneel)'),
          ).toHaveValue('');
        await gp
          .getByRole('checkbox', {
            name: 'Ik heb de volledige geselecteerde versies zelf beoordeeld.',
          })
          .check();
        await gp
          .getByRole('button', {
            name:
              action === 'approve'
                ? 'Selectie goedkeuren'
                : 'Goedgekeurde selectie publiceren',
            exact: true,
          })
          .click();
        await browserExpect(
          gp.getByText(
            action === 'approve'
              ? 'Versie 1 · Goedgekeurd'
              : 'Versie 1 · Gepubliceerd voor lokale proef',
            { exact: true },
          ),
        ).toBeVisible();
      }
      await inspectJourneyScreen('published');
      await gp
        .getByRole('link', { name: 'Een sessie klaarzetten', exact: true })
        .click();
      await browserExpect(gp.getByRole('spinbutton')).toHaveValue('2');
      await gp
        .getByRole('button', { name: 'Sessie klaarzetten', exact: true })
        .click();
      await browserExpect(gp.getByRole('status')).toContainText(
        'Sessie opgeslagen.',
      );
      await browserExpect(
        gp.getByRole('heading', {
          name: 'De sessie staat klaar. Nu is de leerling aan de beurt.',
        }),
      ).toBeVisible();
      const assignment = await db.assignment.findFirstOrThrow({
        include: {
          items: { orderBy: { position: 'asc' }, include: { content: true } },
        },
      });
      const answer = (i: number) =>
        JSON.parse(assignment.items[i]!.content!.snapshot).payload
          .privateEvaluation.acceptedAnswers[0];
      await gp.goto(`${config.origin}/guardian`);
      await browserExpect(
        gp.getByRole('heading', {
          name: 'Er staat een sessie klaar voor je leerling',
        }),
      ).toBeVisible();
      await sp.bringToFront();
      await sp.reload();
      await sp.getByRole('button', { name: /^Start taak:/ }).click();
      await sp.getByRole('textbox').fill(answer(0));
      await sp.getByRole('button', { name: 'Bewaar concept' }).click();
      await browserExpect(
        sp.getByText('Concept opgeslagen.', { exact: false }),
      ).toBeVisible();
      const taskUrl = sp.url();
      await sp.goto('about:blank');
      await stop();
      await start();
      await sp.goto(taskUrl);
      await browserExpect(sp.getByRole('textbox')).toHaveValue(answer(0));
      for (let i = 0; i < 2; i++) {
        await sp.getByRole('textbox').fill(answer(i));
        await sp.getByRole('button', { name: 'Controleer antwoord' }).click();
        await browserExpect(
          sp.getByText('✓ Goed!', { exact: true }),
        ).toBeVisible();
        await sp.getByRole('button', { name: 'Verder', exact: true }).click();
      }
      await browserExpect(
        sp.getByLabel('Resultaat: 10 van de 10'),
      ).toBeVisible();
      await gp.bringToFront();
      // Separate headless browser contexts do not reliably emit native window focus.
      // Exercise the same return-to-window event used by the real portal guard.
      await gp.evaluate(() => window.dispatchEvent(new Event('focus')));
      await browserExpect(
        gp.getByRole('heading', { name: 'Bekijk het resultaat' }),
      ).toBeVisible();
      await gp
        .getByRole('link', { name: 'Resultaten bekijken', exact: true })
        .click();
      await gp.getByRole('button', { name: /^Bekijk sessie:/ }).click();
      await browserExpect(
        gp.getByText('2 / 2', { exact: true }).first(),
      ).toBeVisible();
      await browserExpect(
        gp.getByText('10 / 10', { exact: true }),
      ).toBeVisible();
      await db.session.updateMany({
        where: { user: { principalKind: 'adult' } },
        data: { mfaVerifiedAt: new Date(Date.now() - 360000) },
      });
      await gp.goto(`${config.origin}/guardian/content/assignments`);
      await browserExpect(
        gp.getByText(/Bevestig je aanmelding opnieuw/),
      ).toBeVisible();
      await gp
        .getByLabel('Authenticatorcode', { exact: false })
        .fill(totp(secret));
      await gp.getByRole('button', { name: 'Code bevestigen' }).click();
      await browserExpect(
        gp.getByRole('heading', { name: 'Een oefensessie klaarzetten' }),
      ).toBeVisible();
      for (const width of [320, 768, 1440]) {
        await gp.setViewportSize({ width, height: 1000 });
        expect(
          (await new AxeBuilder({ page: gp }).analyze()).violations,
        ).toEqual([]);
        expect(
          await gp.evaluate(() =>
            [...document.querySelectorAll('[role="main"],main')].every(
              (e) => e.scrollWidth <= e.clientWidth,
            ),
          ),
        ).toBe(true);
        await gp.screenshot({
          path: `.artifacts/d04-m1/delivery-${width}.png`,
        });
      }
      await gp.getByRole('button', { name: 'Afmelden', exact: true }).click();
      await browserExpect(
        gp.getByLabel('E-mailadres', { exact: false }),
      ).toBeVisible();
      await browserExpect(gp.getByRole('navigation')).toHaveCount(0);
      // Separate return visits: keep the real library's 3-per-10-second TOTP throttle enabled.
      await new Promise((resolve) => setTimeout(resolve, 10_100));
      await guardianLogin(gp, secret);
      await browserExpect(
        gp.getByRole('heading', { name: 'Een oefensessie klaarzetten' }),
      ).toBeVisible();
      await sp.goto(`${config.origin}/guardian`);
      await browserExpect(
        sp.getByText(/Deze browser is aangemeld voor het leerlingportaal/),
      ).toBeVisible();
      await sp.getByRole('button', { name: 'Afmelden', exact: true }).click();
      await sp.goto(`${config.origin}/student`);
      await sp.getByRole('button', { name: 'Aanmelden', exact: true }).click();
      await browserExpect(
        sp.getByRole('heading', { name: 'Jouw taken' }),
      ).toBeVisible();
      await gp.goto(`${config.origin}/guardian/access`);
      gp.on('dialog', (d) => void d.accept());
      await gp.getByRole('button', { name: 'Browser intrekken' }).click();
      await browserExpect(gp.getByRole('status')).toContainText(
        'Browsertoegang ingetrokken.',
      );
      await sp.reload();
      await browserExpect(
        sp.getByRole('button', { name: 'Aanmelden', exact: true }),
      ).toBeVisible();
      expect(await db.practiceAttempt.count()).toBe(2);
      await gp.getByRole('button', { name: 'Afmelden', exact: true }).click();
      await gp.getByLabel('E-mailadres', { exact: false }).fill(adult.email);
      await gp.getByLabel('Wachtwoord', { exact: false }).fill(adult.password);
      await gp.getByRole('button', { name: 'Aanmelden als ouder' }).click();
      await gp.getByRole('button', { name: 'Gebruik een herstelcode' }).click();
      await gp.getByLabel('Herstelcode', { exact: false }).fill(recovery[0]!);
      await gp.getByRole('button', { name: 'Code bevestigen' }).click();
      await browserExpect(
        gp.getByText(/Je herstelcode is geaccepteerd/),
      ).toBeVisible();
      await gp.getByLabel('Wachtwoord', { exact: false }).fill(adult.password);
      await gp.getByRole('button', { name: 'Authenticator instellen' }).click();
      const replacementSecret = await gp
        .getByLabel('Authenticator-sleutel', { exact: true })
        .inputValue();
      expect(replacementSecret).not.toBe(secret);
      await gp
        .getByRole('checkbox', { name: /Ik heb mijn herstelcodes/ })
        .check();
      await gp
        .getByLabel('Authenticatorcode', { exact: false })
        .fill(totp(replacementSecret));
      await gp.getByRole('button', { name: 'Code bevestigen' }).click();
      await browserExpect(
        gp.getByRole('heading', { name: 'Accounts en browsers' }),
      ).toBeVisible();
      await gp.getByRole('button', { name: 'Afmelden', exact: true }).click();
      await gp.getByRole('button', { name: 'Wachtwoord vergeten' }).click();
      await gp.getByLabel('E-mailadres', { exact: false }).fill(adult.email);
      await gp.getByRole('button', { name: 'Herstelmail aanvragen' }).click();
      await browserExpect(gp.getByRole('status')).toContainText(
        'privé lokale testmailbox',
      );
      const resetMail = await db.localAuthMessage.findFirstOrThrow({
        where: { kind: 'reset-password' },
        orderBy: { createdAt: 'desc' },
      });
      await gp.goto(resetMail.url);
      const replacementPassword = 'Synthetic-recovered-password-2026!';
      await gp.getByLabel(/^Nieuw wachtwoord/).fill(replacementPassword);
      await gp
        .getByLabel(/^Herhaal nieuw wachtwoord/)
        .fill(replacementPassword);
      await gp.getByRole('button', { name: 'Wachtwoord opslaan' }).click();
      await browserExpect(
        gp.getByText('Wachtwoord gewijzigd. Meld je opnieuw aan.'),
      ).toBeVisible();
      await gp.goto(`${config.origin}/guardian/results`);
      await gp.getByLabel('E-mailadres', { exact: false }).fill(adult.email);
      await gp
        .getByLabel('Wachtwoord', { exact: false })
        .fill(replacementPassword);
      await gp.getByRole('button', { name: 'Aanmelden als ouder' }).click();
      await gp
        .getByLabel('Authenticatorcode', { exact: false })
        .fill(totp(replacementSecret));
      await gp.getByRole('button', { name: 'Code bevestigen' }).click();
      await browserExpect(
        gp.getByRole('button', { name: /^Bekijk sessie:/ }),
      ).toBeVisible();
      expect(await db.practiceAttempt.count()).toBe(2);
      expect(errors).toEqual([]);
    } catch (error) {
      await gp
        .screenshot({
          path: '.artifacts/d04-m1/guardian-failure.png',
          fullPage: true,
        })
        .catch(() => {});
      await sp
        .screenshot({
          path: '.artifacts/d04-m1/student-failure.png',
          fullPage: true,
        })
        .catch(() => {});
      throw error;
    } finally {
      await browser.close();
      await stop();
      config.origin = original;
    }
  },
  120000,
);
