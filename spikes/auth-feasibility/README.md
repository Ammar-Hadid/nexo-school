# Isolated authentication feasibility spike

**16 October 2026 — core feasibility accepted by the user; remaining physical checks are recorded individually, including Safari skipped at user direction.**

Live trial: **https://auth-test.ammarhadid.com**. Synthetic Test Guardian and Test Student only. This folder is a disposable JavaScript/Node prototype, not the beginning of the TypeScript/Next.js learning application. It has its own package boundary, lockfile, SQLite database and Docker container. No managed database project, educational modules, AI integration or production student schema has been created.

See [findings and evidence](FINDINGS.md), [device checklist](DEVICE-TESTS.md), and [deployment/cleanup](DEPLOYMENT.md).

## Start the hardware trial

1. On the MacBook, open the trial in Chrome. The synthetic password is in the ignored local file `.data/deployment/guardian-credentials.txt` (also `/srv/apps/nexo-auth-spike/data/guardian-credentials.txt` on `nexo-vps`). Do not paste it into reports or chat.
2. Sign in as **Test Guardian**. Keep the password field populated for initial setup. Expand **First run: set up a test authenticator**, then **Set up test TOTP**. Add a separate test entry to your authenticator using the displayed base32 secret: six digits, 30 seconds, SHA-1. Prefer an authenticator controlled only by the guardian. Do not enter any real account's TOTP secret into this app.
3. Enter the authenticator code and select **Verify / refresh MFA**. Save any displayed test recovery codes privately if wanted; recovery-code login is deliberately disabled in this spike. Lost guardian factors require resetting this disposable trial, not weakening authentication.
4. On the Tab S9 Ultra in normal Chrome, open the same URL. Use a label such as `Test tablet Chrome`. Select **Request enrollment**. Each code lasts ten minutes.
5. On the MacBook, enter that code, choose **Review enrollment**, compare the code and browser label, then **Approve this enrollment**. MFA must have been verified within five minutes.
6. On the tablet, choose **Refresh status**, **Create student passkey**, and complete the OS unlock prompt yourself. Then **Sign in with passkey** and **Check student access**. The result must identify only **Test Student**.
7. Work through [DEVICE-TESTS.md](DEVICE-TESTS.md), especially closing/reopening Chrome, independent sign-in, cookie loss, revocation and recovery. Use another browser/profile for student tests on the MacBook so the guardian can approve it.

If a student passkey is already synced to a new browser, request/approve enrollment there and choose **Sign in with passkey** instead of creating a duplicate. A synced key without that browser's approval must fail.

The explicit **Sign out** button leaves the browser grant intact. This small test UI requires signing out before switching identities or unlocking a stale session. It is not the final child-facing experience. There is no general public signup, password reset, account linking, student password login, factor disabling or generic passkey management endpoint.

## Run an independent local trial

Requires Node 24.15+ (deployed image: Node 24.22.0; development used Node 25.9.0).

```sh
cd spikes/auth-feasibility
npm ci --ignore-scripts
npm run setup
npm run build
npm start
```

Open `http://localhost:4317`. Localhost is an allowed WebAuthn secure context; this local HTTP mode does **not** validate deployment cookies or tablet connectivity. The setup script generates random credentials in `.data/guardian-credentials.txt`, mode 0600, inside a mode-0700 directory. It refuses to overwrite an initialized run. Use a new `SPIKE_DATA_DIR` for a fresh trial; never copy the localhost database to the deployed origin.

```sh
SPIKE_DATA_DIR=.data/another-run SPIKE_ORIGIN=http://localhost:4317 npm run setup
SPIKE_DATA_DIR=.data/another-run npm start
```

Use the exact same origin for an entire trial. Passkeys created for `auth-test.ammarhadid.com` will need re-enrollment for a different production relying-party ID.

## Verification

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run check
npm audit
```

The browser suite starts a separate server on localhost:4318 with a newly seeded disposable database under `.data/browser-test-*`. It uses actual Better Auth handlers, an actual Chromium browser and **CDP virtual authenticators**. It does not use or inspect the user's normal browser profile. Test-controlled SQL expiry changes and cloned virtual credentials exercise negative cases; they are not app endpoints.

There are four policy tests and two browser tests, including a nine-step authentication integration scenario. Trace/video capture is disabled to avoid recording test passwords and TOTP setup secrets. Failure artifacts and databases are ignored. The installed lifecycle scripts stay disabled, including esbuild's optional installer; the platform binary supplied by its package works without it. The Docker build repeats a clean lockfile install with scripts disabled.

`scripts/check-https.mjs` performs the initial public HTTPS/session-cookie smoke check using the privately copied deployed password. Run it **before** the human enrolls TOTP; after MFA enrollment its password-only success assertion is intentionally no longer applicable. It never prints credential or cookie values.

## Deliberate limits

- One fixed synthetic guardian/student relationship; no admin identity, roles editor, second household, email delivery, real learner records or school permissions.
- SQLite and direct SQL keep the spike independent of PostgreSQL/Prisma. This does not validate the production adapter or transaction semantics.
- Passkeys/TOTP are verified by maintained libraries. Browser-grant values use Node's cryptographic random bytes, with only SHA-256 hashes stored server-side. These are opaque authorization cookies, not another authentication protocol.
- Normal authenticator public keys and library session metadata are created during tests. Do not put real names or personal details in labels. Destroy the disposable data after the trial.
- No production logging/alerting, backup/restore system, guardian-factor recovery workflow or exhaustive penetration test. Global conservative request limits suit a single-family spike, not a multi-tenant deployment.
- A browser cookie is not physical-device attestation. Theft of both an approved cookie/session and credential access remains outside the assurance offered here.
