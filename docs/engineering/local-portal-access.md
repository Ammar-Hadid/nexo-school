# D04-M1 — Usable local portal access

25 October 2026. User-authorized completion of the D02–D04/D07/D08 access journey, before D14-S5. Implemented for retained **local synthetic** use. New controls are **In Review**; approved sign-in revision 2, guardian navigation, Button and TextField are reused. No new provider, schema, session bypass or educational approval.

## Start and sign in

Use Node 24.22.0 and running Docker Desktop from the repository:

```sh
npm run portal:setup
npm run portal:start
```

`setup` is repeatable. `start` also prepares the environment and builds the application, then stays running in the terminal. The stable addresses are [guardian](http://localhost:3060/guardian) and [student](http://localhost:3060/student). Use **localhost**, consistently, for passkey relying-party identity.

The private `.local/portals/START-HERE.md` contains the synthetic guardian email, random initial password and first email-verification link. Open that file locally; do not commit or share it. Follow the verification link while the app is running, sign in, enter the password again to provision an authenticator, add the displayed secret as a time-based account in your authenticator, save the one-time recovery codes privately, and verify the current six-digit code. This is the real Better Auth flow. No TOTP seed is preselected for you and no browser session is injected. If the email link expires, rerun setup to refresh it.

The guardian home links to **Accounts en browsers**, content preparation/review, assignment and saved results. Its account name comes from the authenticated session. Signed-out guardian routes show the sign-in screen without sidebar or fixture identities. Sensitive content/account routes ask for a current authenticator code when the existing five-minute MFA freshness window expires, returning to the same route after verification. Ordinary sessions retain the existing 12-hour maximum; expiration requires normal sign-in and does not delete saved work.

## Enroll the student browser

1. In the guardian portal, open **Accounts en browsers** and add a synthetic test learner.
2. Open the student portal in a **separate normal browser profile** (or another browser). Two tabs in one profile share authentication cookies; they cannot represent independent guardian/student accounts.
3. Choose **Nieuwe browser aanmelden**, label the browser and request approval. Copy its full enrollment code into the guardian's approval form for the intended learner.
4. In the student browser, select **Goedkeuring controleren**, then **Passkey aanmaken**. Complete the browser/platform passkey prompt, continue to learner sign-in and select **Aanmelden**.

Use a normal profile with retained cookies and passkeys for repeated testing. Private browsing deliberately discards browser identity. Existing server enrollment expiry, browser-binding, session expiry and revocation rules remain authoritative. Losing a browser or passkey is handled from guardian **Accounts en browsers**: revoke the old browser or credential, enroll a replacement for the **same learner**, and sign in again. Saved tasks/answers stay attached to that learner. Do not create a replacement learner merely to recover access.

## Test the saved workflow yourself

**26 October D04-M2:** start at [the guardian home](http://localhost:3060/guardian) and follow **Jouw volgende stap**. The existing screens now guide you through preparing, reviewing/publishing, assigning, practicing in the separate student browser and viewing results. Empty stock gives a preparation link instead of an empty category selector. A first set and new assignment default to two exercises. The actions below remain available; review/publication are still separate explicit decisions. [Guidance contract](../design/guided-local-workflow.md).

The environment starts without fabricated content approvals or assignments. For a small synthetic rehearsal:

1. In the guardian home, open **Rekenvoorraad voorbereiden en beoordelen**, set the small set size to **2**, and prepare it. Open `/guardian/content/supply/review` to inspect the complete exercises. Select the two versions, review and approve them for the synthetic test, then select and publish those approved versions. These are local test decisions, not educational certification.
2. Open **Oefentaken klaarzetten en inhoud intrekken**, choose the same learner and available stock, set the size to **2**, and select **Taak klaarzetten**. Insufficient eligible stock is reported; the app does not silently invent published exercises.
3. In the student profile, reload **Jouw taken**, open the task, enter an answer and select **Bewaar concept**. Close/reopen the page or restart the app; resume the saved draft. Submit answers and continue through the task.
4. In the guardian profile, open **Opgeslagen resultaten bekijken** to inspect the actual saved answers and result.

The existing Spelling review/assignment lane is also available. The 29 October D14-S5 extension adds representative saved Taal, reading and Redactiesommen formats; see the rehearsal section below. D24/D25 settings and automatic daily assignment remain next.

## Retention, stopping and recovery

`npm run portal:stop` stops only the owned local runner and dedicated database container. `npm run portal:start` starts them again. Closing the app/terminal does not delete PostgreSQL data. `npm run portal:status` reports database availability and the canonical origin.

The dedicated container is `nexo-school-local-portals-pg`; its named volume is `nexo-school-local-portals-pgdata`, with loopback database port 15435. The app binds to loopback port 3060. Ownership labels are checked before reusing/stopping the container. No reset/delete command is provided. These resources are separate from disposable test databases and the VPS.

`.local/portals/` is ignored by Git/formatting, directory mode 0700, private files 0600. Preserve its environment and credentials files together with the volume: the retained auth secret protects encrypted factors and cookies. A missing configuration alongside existing data causes failure rather than a silent reset; an existing account with a missing credentials file is not assigned a made-up replacement password.

**Wachtwoord vergeten** requests a link in the local database outbox. Run `npm run portal:mailbox`, open the private `.local/portals/mailbox.json`, and follow the newest reset link. No actual email is sent. Password reset revokes existing sessions and still requires MFA. The initial password in START-HERE is historical after a password change. A saved recovery code can replace a lost authenticator through the sign-in form; replacement requires the password and verification of the new factor. Losing both the authenticator and recovery codes has no bypass; production owner recovery remains D33.

## Implementation and boundaries

- `src/modules/identity/portal/` owns guardian login/setup/recovery, portal presentation guard, account/browser management and the local home. New guardian/student layouts compose it; domain APIs still enforce access independently.
- `GET /api/auth/portal-session` returns only safe role/name/freshness/operator presentation data. A password-only adult session returns setup status, never authenticated guardian authority. Student projection validates the existing browser grant. Anonymous, expired and revoked sessions cannot obtain portal content authority.
- `GET /api/auth/student/enrollment` returns status for the requesting browser's HttpOnly enrollment cookie only. Owned student choices use the existing relationship/capability rules. Enrollment/approval/passkey registration/login/revocation reuse the existing D04 endpoints and Better Auth client.
- The existing Better Auth password-reset callback is narrowly allowlisted so real recovery links can reach the new reset form. Library token/origin validation and session revocation are preserved.
- `scripts/local-portals.mjs` and `scripts/portal-bootstrap.ts` provision and retain the separate local environment. Bootstrap uses the existing singleton owner operation; it does not publish content or create authenticated sessions.

No VPS operation, hosted HTTPS identity, production email, physical-device/Safari qualification, real learner use, paid AI or content/mastery approval was performed. The earlier accepted feasibility spike remains separate. Browser tests use Chromium's virtual authenticator; they prove integration, not a new hardware qualification.

## Executed verification

The new `tests/identity/portal-access.test.ts` checks safe session/enrollment projections, ownership and actual reset callbacks. `tests/identity/portal-browser.test.ts` uses real PostgreSQL and the built application, with UI password/TOTP sign-in and guardian-approved student passkey registration; no injected auth sessions. It covers wrong credentials/code, signed-out sidebar suppression, role separation, draft save/server restart, completed results, re-verification, logout/re-login, browser revocation and UI recovery. Existing saved-workflow/security regressions remain required.

Corrections found during verification: the real reset callback needed its narrow allowlist entry; the account controls needed a navigation landmark; required-field labels needed accessible-name-aware selectors; the compressed browser test needed to respect the real three-per-ten-second TOTP limit. The old built saved journey exposed a student route race after login: a previous route's signed-out result could redirect a newly authenticated learner. Redirects now wait for the current route's check, and student login/logout notify the portal projection. Existing tests now expect the real sign-in form after logout/revocation instead of the old unavailable placeholder. Security/persistence assertions were retained.

Final executed checks on Node 24.22.0:

- `npm run test:saved`: **121 passed / 15 files**, including the new ordinary-browser recovery journey and the existing saved/security/content regressions; 16 migrations applied and replayed.
- `npm test`: **214 passed / 52 files**. Focused sign-in stories: **14 passed / 2 files**. Focused built sign-in/guardian-results/disabled-identity E2E: **20 passed**.
- Root lint, strict typecheck, schema validation, Next production build, Storybook build, formatting, local document targets and whitespace checks passed. Existing pg concurrency deprecation and Storybook module-directive warnings remain.
- The persistent local setup was run, replayed, stopped and restarted: private environment/initial-credential hashes and the stored account identity were unchanged. Private permissions and Git exclusion were checked. The actual app runner was also stopped and restarted successfully. Four live signed-out checks (guardian/student at 390/1280px) passed with no navigation, axe violations, horizontal overflow or page exceptions. The app is handed off running on port 3060; stop/start instructions above remain the durable restart path.
- No full Storybook/E2E/visual-baseline suite, new physical-device/Safari/manual-screen-reader qualification, remote CI, paid AI, remote database operation or public deployment was performed. New UI remains In Review; no content or educational approval is inferred.

## 29 October: saved multi-subject rehearsal

D14-S5 adds bounded Taal, Redactiesommen and reading review links to **Oefenvoorraad**, alongside existing arithmetic and Spelling. Use the same retained accounts, normal browser login and explicit review/publication/assignment steps. [Manual steps, one-question reading limit and tested scope](saved-multisubject-rehearsal.md). No retained content is automatically approved or assigned, and this is not daily scheduling or educational qualification. The evaluator migration preserves existing rows; executed upgrade/preservation evidence is in the ledger.
