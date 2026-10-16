# Authentication feasibility findings

Updated: **16 October 2026**. Conclusion: **library/HTTPS checks pass; the core Tab S9 Ultra/Chrome student and MacBook Chrome guardian flow is demonstrated through user-reported physical testing. Full compatibility and edge-case testing remains incomplete.**

The user approved the revised architecture and authorized only an isolated synthetic-data spike. All implementation is under `spikes/auth-feasibility/` on branch `codex/auth-feasibility`. The deployed trial is https://auth-test.ammarhadid.com. No wider learning application has begun.

## Evidence obtained

| Check | Evidence / result |
|---|---|
| Dependencies | Better Auth **1.7.10**, `@better-auth/passkey` **1.7.10**, Playwright **1.64.1**, esbuild **0.28.2**, test OTP utility **0.5.0**; exact lockfile |
| Runtime | Local Node **25.9.0**; official pinned Debian slim Docker image reports Node **24.22.0**, linux/amd64 |
| Automated policy tests | **4 passed**: verified UV required; grant cookie/expiry/revocation/deleted-key denial; enrollment binding/expiry/consumption; CSRF/origin policy |
| Browser integration | **Passed**, actual Better Auth handlers + database + Chromium/CDP virtual authenticator; nine scenario steps below |
| Responsive browser test | **Passed**, 1440×900, 1280×800, 390×844; no horizontal overflow. These viewport sizes do not establish Android or Safari compatibility |
| Dependencies audit | `npm audit` and production-only audit reported **0 vulnerabilities** at execution time; not a guarantee against undisclosed flaws |
| Reproducible installation | `npm ci --ignore-scripts` and build succeeded inside the pinned image; no lifecycle scripts enabled |
| Public HTTPS | `/health` returned 200 through Cloudflare and directly through Caddy using hostname/SNI with certificate verification enabled |
| Deployment cookie smoke | Actual guardian login emitted a **__Host-**, Secure, HttpOnly, SameSite=Strict, Path=/ session cookie with no Domain; password-only guardian approval denied; sign-out succeeded |
| Physical guided testing (16 October) | Guardian MacBook Chrome password/TOTP and approval succeeded; tablet passkey registration, protected access, browser persistence, browser/credential revocation and recovery succeeded as reported. Adam subsequently signed in using his PIN without guardian fingerprint assistance. See the detailed record for partial checks and unknown provider details. |
| VPS isolation | One non-root read-only container, 256 MiB RAM / 0.5 CPU cap, no host application port, separate internal Docker network, existing Caddy used |
| Resource sample | Approximately **45–49 MiB** container memory in idle samples, before physical testing. VPS available RAM was approximately **2.5 GiB**. This is not a concurrent-load capacity result |
| Existing hosting | Pre-existing Caddyfile bytes verified unchanged; one marked auth-test block appended and gracefully reloaded. No other DNS record/domain modified |

The nine-step browser scenario covers:

1. Password-only guardian denial, actual TOTP setup/verification, guardian review/approval and duplicate-approval denial.
2. Another browser cannot reuse the approval context; **UV=false registration is denied** through the server hook; valid registration and login succeed; no pre-login student access; child-to-guardian and generic auth endpoint bypass attempts fail.
3. A copied virtual credential alone is denied on another browser; fresh guardian approval then allows it.
4. Browser-only revocation removes the affected session while another approved browser remains usable.
5. Expired guardian MFA blocks management; stale student activity locks access; fresh verification/sign-in restores access.
6. A signed **UV=false authentication assertion is denied**, and replay / wrong HTTP Origin requests are denied.
7. Credential revocation invalidates the active session and its copied credential; a new approved passkey restores access. Session cookies without the approved-browser cookie are insufficient. Revoke-all denies the recovered session.
8. Expired enrollment is denied; restrictive headers are present; public page navigation from another site is allowed while cross-site API calls are denied.
9. A returning guardian must complete TOTP after the password step before management access is granted.

## Integration findings that affect D03

### The browser prompt is not the server's UV policy

The installed passkey plugin passes `requireUserVerification: false` to SimpleWebAuthn for both verification operations. Registration options can request required UV, while authentication options are hardcoded to preferred in this version. A required-looking prompt alone is therefore not enough.

The spike uses the documented `registration.afterVerification` and `authentication.afterVerification` hooks to reject any verified result lacking `userVerified === true`. Registration requests required UV/resident keys. The gateway also changes returned authentication options to required UV and narrows allowed credential IDs; the server hook remains the security check. Negative browser tests deliberately request/return missing UV and confirm denial. Keep these regression tests across version upgrades.

### Registration resolution alone does not guard authenticated users

The plugin's pre-auth `resolveUser` callback is bypassed when a session is already present. Every exposed registration/options route therefore first enforces the enrollment policy in the gateway and rejects existing sessions. Generic library endpoints are allowlisted; public signup, factor removal, password reset, account linking and passkey deletion are not exposed. An authenticated student cannot enroll another credential through a generic endpoint.

### Guardian approval belongs to a browser transaction

The code shown between devices is only a lookup identifier. The requesting browser holds a random 256-bit HttpOnly cookie whose hash is associated with the pending enrollment. The guardian reviews the matching code/label and approves after fresh TOTP. Registration rechecks that browser and consumes approval once. A passkey synced to another browser is denied until that browser independently gains approval. An approved browser can link a previously registered student key by completing a verified assertion.

### Revocation is checked on every protected student request

Library sessions are mapped to browser grants. Each protected request verifies the database-backed library session, principal, active grant, credential existence, session binding and inactivity limit. Cookie session caching is disabled. Revocation updates grants and deletes matching sessions; credential-wide revocation also removes the library credential. No cached or stateless student session bypass exists in this spike.

### Fail closed when a ceremony cannot finish

Registration consumes approval before credential persistence, then activates the grant only after successful library persistence. A crash/failure can leave a consumed enrollment or an orphan credential, but cannot turn it into an approved session. Restart with a new guardian enrollment if this happens. This is intentionally conservative and is **not** proof of cross-table atomicity for the future Prisma/PostgreSQL implementation. Authentication sessions are returned only after a grant binding is written; orphan sessions lack authorization.

### Deployment uncovered and corrected two practical issues

Node's fetch did not preserve the custom Host header used by the container health probe; the probe now uses `node:http`. The initial origin guard also blocked navigation to the public HTML from another site; it now applies to API routes, including challenge-generating GETs. A regression check covers public navigation and cross-site API denial. These issues were found before the trial handoff.

## Still open

- MacBook Safari guardian compatibility (not run; further spike testing skipped at user direction on 16 October) and MacBook student passkey workflows; exact OS/browser versions, final tablet PIN/passkey provider and sync/shared-account settings.
- Physical multi-browser/synced-key isolation, cookie-clearing recovery, cancellation/retry, session timeout/resumption, guardian step-up expiry and revoke-all checks; optional existing UV-capable hardware-key fallback. Core single-tablet revoke/recover has been demonstrated, not every checklist variant.
- Session durations remain unchanged (12-hour absolute / 30-minute idle). The suggested 30-day remembered login was not implemented; independent PIN-based passkey unlock removes the reported need for daily guardian fingerprint assistance.
- Realistic shared-VPS load; this small auth prototype cannot establish whole-application capacity.
- Production Next.js/Prisma/Neon adapter, multi-household supervision, admin roles, production recovery, monitoring, backups and security review.

The synthetic guardian is seeded locally with a pre-verified `.invalid` email through Better Auth setup internals. This does not prove a production invitation, email-verification or adult-recovery flow.

No physical-device result is inferred from virtual authenticators. User-reported results and outstanding checks are recorded in [DEVICE-TESTS.md](DEVICE-TESTS.md). The core usability obstacle is resolved; the user explicitly accepted gate 0A for proceeding on 16 October. The full hardware checklist is not claimed as passed.

## Primary references and source inspection

- [Better Auth passkey plugin and supported registration/verification hooks](https://better-auth.com/docs/plugins/passkey)
- [Better Auth two-factor authentication](https://better-auth.com/docs/plugins/2fa)
- [Better Auth SQLite adapter](https://better-auth.com/docs/adapters/sqlite)
- [Better Auth session management](https://better-auth.com/docs/concepts/session-management)
- Installed `@better-auth/passkey@1.7.10/dist/index.mjs`: `resolveRegistrationUser`, `verifyPasskeyRegistration`, `generatePasskeyAuthenticationOptions`, `verifyPasskeyAuthentication`. The installed, locked implementation was inspected rather than assuming doc examples enforce the full application policy.

**Acceptance — 16 October 2026:** the user stated “the auth spike succeeded as well” and authorized the foundation milestone. Core feasibility is accepted for proceeding; outstanding checks retain their recorded status. No session policy was changed.
