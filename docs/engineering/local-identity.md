# Local synthetic identity — D02

**25 October D04-M1 follow-up:** ordinary guardian login, factor setup/recovery and a retained local environment now reuse this backend. Use the [portal runbook](local-portal-access.md); the manual/disposable setup below is historical D02 tooling.

**Hosting amendment, 20 October 2026:** the user selected self-hosted PostgreSQL on the existing VPS. D02's standard Prisma/pg implementation remains valid. The [VPS runbook](vps-postgresql.md) extends verification to a dedicated synthetic database through an SSH loopback tunnel; the public auth route remains disabled and direct remote TLS validation is unchanged. Historical local-only verification below remains dated evidence.

20 October 2026. Local implementation of the confirmed [D01 boundary](../product/d01-release-contract.md), under [ADR-003](../architecture/decisions.md#adr-003--guardian-approved-enrollment-independent-passkey-login). No real account, remote migration, email provider or deployment is enabled by this slice.

## Run and verify

Use Node 24.22.0 and the existing installed dependencies. `npm run test:identity` creates a disposable PostgreSQL 17 Docker container with random credentials and an ephemeral loopback port, generates Prisma, applies the versioned migration twice, runs real adapter/HTTP-handler tests and removes its container. It ignores caller database URLs. Docker must be running; database failures fail the command, never skip tests. `npm run check` now includes this command, so the existing CI application job includes it as well. Remote CI success is not inferred from that configuration.

For an interactive synthetic local session, provision a separate disposable PostgreSQL database named `nexo_identity_local`, bound to `127.0.0.1`. Set these server-only environment values in an ignored `.env` or your terminal:

- `NEXO_LOCAL_IDENTITY=synthetic-only`
- `DATABASE_URL`: the local PostgreSQL URL, with credentials and explicit port, no query options.
- `BETTER_AUTH_URL=http://127.0.0.1:3000` (or the explicit port used by the app).
- `BETTER_AUTH_SECRET`: a privately generated random secret of at least 32 characters, retained across local restarts. Changing it invalidates cookies and encrypted factors; do not rotate it casually.

Run `npm run identity:local -- migrate`, then pass a JSON object containing `email`, `name` and `password` on **stdin** to `npm run identity:local -- bootstrap`. Use a synthetic address ending in `@example.invalid` and a 16–128-character password. Supply input from a private file or secret manager; do not put the password in command arguments or shell history. The operator tool prints only success/failure, never credentials. There is no default password, startup seeding, public signup or remote bootstrap route. The singleton marker prevents retry/concurrent bootstrap and remains consumed after account deletion. Failed bootstrap rolls all account/marker/audit writes back.

Start the app with `npm run dev`. D02 provides API/backend behavior and operator tooling, not a newly designed login screen. Requests use `/api/auth`, exact configured `Origin`, JSON POST bodies and an HttpOnly cookie jar. First send a verification email, then follow its local verification link, sign in, enable TOTP and verify the code. Password-only sessions cannot obtain an adult session projection.

`npm run identity:local -- mailbox` writes local test messages to `.artifacts/local-identity-mailbox.json` with exclusive creation and mode `0600`. It refuses to overwrite an existing file. These URLs are credentials: inspect locally, delete the export after use and clear the disposable database when finished. The outbox is never exposed over HTTP and sends no actual email. Production delivery, retention and owner recovery are D33/environment decisions.

## Explicit HTTP surface

| Route                                                     | Purpose and boundary                                                                                                                                                                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /sign-in/email`, `POST /sign-out`                   | Library credential verification/session cookies. Only adult principals may use password login; verified email required.                                                                                                                                  |
| `GET /get-session`                                        | Minimal adult identity and MFA time; requires server-recorded MFA, active session and enabled factor. Never returns a session token.                                                                                                                     |
| `POST /send-verification-email`, `GET /verify-email`      | Library email proof delivered only to the local synthetic outbox. Verification redirects to the library's validated callback.                                                                                                                            |
| `POST /request-password-reset`, `POST /reset-password`    | Library reset token; reset revokes sessions/pending challenges and writes an audit event in the same transaction. MFA stays enabled, so email access alone does not restore adult access.                                                                |
| `POST /two-factor/enable`, `POST /two-factor/verify-totp` | Password-protected initial setup and actual TOTP verification; setup alone grants no adult access.                                                                                                                                                       |
| `POST /two-factor/verify-backup-code`                     | Password challenge or existing authenticated session plus a single-use library recovery code. Revokes other sessions and pending challenges; atomic audit.                                                                                               |
| `POST /two-factor/generate-backup-codes`                  | Requires server-recorded MFA within five minutes plus the library password check.                                                                                                                                                                        |
| `POST /recover-totp`                                      | Requires recovery-code proof on this session within five minutes and password verification. Library disable/enable operations run atomically; old codes/sessions are invalidated, and the replacement TOTP must be verified before adult access resumes. |

All other paths/methods are denied, including signup, bootstrap, account linking, public factor disabling, OTP/email second-factor downgrade and backup-code viewing. Trusted-device bypass and client-supplied principal/assurance fields are rejected. Secrets, factor material and recovery codes must never be logged. TOTP provisioning/backup codes are intentionally returned only to the authenticated setup/recovery caller for private storage.

If both the authenticator and recovery codes are lost, this local slice deliberately offers no bypass. Password reset alone cannot disable MFA. A production operator recovery process is a separate reviewed D33 decision; a disposable synthetic database can instead be discarded without touching production history.

## Implementation and trust boundaries

The Next route validates the explicit local configuration before opening the database. Config rejects remote hosts, non-synthetic database names, URL overrides and non-loopback origins. `src/server/auth/service.ts` is guarded by `server-only`; it privately composes Better Auth 1.7.10 and its Prisma adapter. Password hashing, tokens, cookies, TOTP and backup-code encryption/verification use library implementations. No spike code is imported.

Prisma owns library user/session/account/verification/factor/rate-limit tables plus the one-time bootstrap marker, secret-free identity audit and private local delivery outbox. Application assurance fields cannot be set from requests. D03 now implements [guardian/student relationships and capabilities](resource-ownership.md); an adult identity is not a blanket grant to student data or content administration.

Every local auth operation takes a PostgreSQL transaction advisory lock. This deliberately serializes this single-family synthetic surface so library writes, session revocation and audit insertion commit together. Library 5xx failures roll back the outer transaction; expected authentication failures commit rate-limit/attempt counters. This is not a throughput claim. Revisit serialization with measured needs before expanding beyond this slice.

Sessions live in PostgreSQL with cookie caching disabled, a 12-hour maximum and one-hour update interval. Cookies are HttpOnly and SameSite=Strict. Secure cookies are off **only for the explicit loopback HTTP environment**; this configuration must not be reused for hosting. Forwarded IPs are not trusted: database-backed throttling uses the library's shared per-path fallback bucket, which suits local use and survives handler recreation. Request bodies are bounded to 8 KiB while reading. JSON session tokens are stripped, and auth responses use `Cache-Control: no-store`.

The operator CLI uses native Node TypeScript stripping with the `react-server` condition so the server-only guard remains active in Next/browser builds. TypeScript permits explicit `.ts` imports for this shared runtime; no new package was added.

## Source verification and limits

The implementation was checked against the installed library source, including Prisma transaction behavior, atomic backup-code consumption, TOTP activation and password-reset hooks. Official references: [Prisma integration](https://better-auth.com/docs/adapters/prisma), [two-factor authentication](https://better-auth.com/docs/plugins/2fa), and [email/password recovery](https://better-auth.com/docs/authentication/email-password). Package behavior was tested locally rather than inferred from documentation alone.

Tests exercise real PostgreSQL, the real Better Auth adapter/handler and the operator CLI. The authenticator test computes RFC 6238 codes independently from the public provisioning URI. Database constraints deliberately inject audit failures to establish rollback. Synthetic identities only. See the [task ledger](../../tasks/todo.md#current-position-and-handoff) for executed counts, build/browser evidence and omissions.

D02 does not provide reviewed auth UI, family ownership, student passkeys, production email, remote persistence, real-device auth qualification or production recovery. Existing learner screens and educational rules remain unchanged.

## Executed verification — 20 October 2026

**Implemented and tested; D02 local acceptance complete.** No new visual/educational approval is claimed.

- Node 24.22.0; `npm run check` **passed**: formatting, zero-warning lint, strict typecheck, schema validation, **119 unit tests in 23 files**, **15 PostgreSQL identity tests**, **137 Storybook checks in 21 files**, standalone Next build, Storybook build and **27 Playwright E2E tests**. The E2E set includes the built app returning a secret-free 503 with no session cookie when local identity is not enabled. The root browser server explicitly clears the identity opt-in so tests cannot inherit an operator's database setting.
- Final targeted identity run after adding the wrong-password/TOTP assurance regression: **16 passed**. Scoped ESLint and TypeScript also passed afterward. Each identity run applied the migration to a new database, then applied it again with no pending migrations. All test containers were removed.
- Negative/transaction coverage: one-time concurrent bootstrap and account-deletion replay; audit-failure rollback; CLI/stdin/local-only guards; signup/linking/factor-disable denial; hostile origins; verified email and mandatory MFA; invalid password/TOTP; backup-code concurrency/replay and rollback; password-reset single use/revocation/rollback without disabling MFA; recent-proof authenticator replacement; expired challenges/sessions; stale assurance; 8 KiB request limit; persistent throttling despite forged forwarding headers; principal/assurance spoof denial.
- `npm run audit:dependencies` **passed its policy**: zero production vulnerabilities; five pre-existing high development-tool findings retained under the [tooling risk record](tooling-risks.md). This is not a zero-findings full audit claim.
- Local documentation targets/anchors, scoped formatting, Git whitespace and D01-baseline preservation checks **passed**. Only the explicitly listed D02 files changed from that baseline; prior artwork, learner copy, assessment and exercise sources stayed unchanged.
- Normal build output includes the existing Storybook bundler warnings; tests and builds exited successfully. No visual baselines were written.

Not run: a new auth UI/browser journey, physical-device/Safari auth checks, application Docker image build, the isolated auth-spike suite, remote CI, hosted migration or deployment. No live provider, production email or real learner data was used. The database suite tests the real HTTP handler with cookie jars; it is not a claim of physical-browser authentication qualification. Student ownership/passkeys and production recovery remain D03/D04/D33 work.

## Self-hosted verification — 20 October 2026

D02a subsequently deployed the dedicated VPS PostgreSQL service under explicit user authorization. The existing identity implementation passed all 16 integration tests through an SSH loopback tunnel against a disposable VPS database; it was removed afterward. The persistent synthetic database has the migration but no user account. Migration replay, runtime permissions, live restart and backup/full restore also passed. See the [hosting evidence](vps-postgresql.md#verification-and-current-status). The main application was not deployed, and public auth remains disabled.

## D03 follow-up — 20 October 2026

[Resource ownership](resource-ownership.md) adds constrained student profiles, explicit guardian capabilities and protected local profile APIs. D02 remains the authenticated adult/MFA boundary. Student HTTP authentication remains disabled until D04 verifies passkeys and approved-browser binding. The D03 migration is verified locally only; it has not been applied to the VPS. Historical D02 test totals above remain unchanged.

## D04 follow-up — 20 October 2026

[Approved-browser passkeys](student-browser-auth.md) add local synthetic student enrollment/login/revoke/recovery and transactional browser/session binding. Use `http://localhost:3000` for D04 because WebAuthn rejects an IP-based relying-party ID; the database remains on `127.0.0.1`. Historical D02 scope and evidence above remain unchanged. No reviewed auth UI or hosted identity release is implied.
