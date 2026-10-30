# Runtime, identity and operations readiness audit

20 October 2026. Research for the delivery plan; no application, database, deployment or authentication policy changes. Source inspection is the primary evidence. This report is one bounded part of the repository audit, not a claim to have audited every domain or validated educational content.

## Conclusion

The repository has a useful application foundation, extensive synthetic Storybook journeys, and an accepted isolated authentication feasibility implementation. It does **not** yet have a production learning backend. The Next.js route still renders the development notice, the PostgreSQL schema has no models, and authentication is confined to a separate SQLite spike. Reusing the approved screens is sensible; connecting them securely to durable state is the main engineering bridge to daily use.

The dependency order is: establish production identity and ownership; persist immutable content and assigned work; move submissions/evaluation behind authenticated server contracts; connect existing screens and recovery; add durable replenishment/publication; then prove real-device and operational readiness. Educational content/evidence validation is an independent parallel dependency, not something a passing backend test resolves.

## Read coverage and exclusions

Read all 65 files listed in the inventory below, totaling 2,935 lines at inspection time. This includes every human-authored source, test, deployment/configuration and Markdown file in the isolated auth package, all current `src/server`, `src/app`, Prisma schema/configuration, root configuration/CI/workbench setup, non-art root scripts, tooling tests and E2E/visual tests. `next-env.d.ts` was also inspected although generated.

Additional context read: the complete development protocol, verification guide, architecture, decision register, tooling-risk record, foundation report, README, current supplied AGENTS instructions, task-status history and Impeccable configuration. Task-status prose contains chronological statements that later entries supersede; source and latest dated contracts take precedence over old checkbox wording.

Excluded intentionally: environment files and their values, `.data` including auth databases/credentials, dependency source and lockfile package metadata, build output contents, binary assets and artwork-generation scripts, application domain/shared UI code assigned to the parent audit, and remote VPS/DNS/database/GitHub account state. No existing secret or real learner record was opened. No remote status or deployment action was performed.

## What actually exists

| Area                | Implemented evidence                                                                                                                                                                                                                                                          | Delivery implication                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Application entry   | [`src/app/page.tsx`](../../src/app/page.tsx) renders `FoundationNotice`; layout sets Dutch language, no-index metadata and shared styles                                                                                                                                      | Approved practice/guardian journeys still need real routes. A Storybook URL is not a deployed student application.                                     |
| PostgreSQL boundary | [`src/server/db/client.ts`](../../src/server/db/client.ts) lazily constructs Prisma with `pg`, max three connections and bounded connect/idle timeouts; [`connection-string.ts`](../../src/server/db/connection-string.ts) requires certificate verification for remote hosts | Reuse this adapter. It is prepared infrastructure, not proof of live PostgreSQL connectivity or transactional behavior.                                |
| Schema              | [`prisma/schema.prisma`](../../prisma/schema.prisma) contains only generator and PostgreSQL datasource; [`prisma.config.ts`](../../prisma.config.ts) names a future migrations directory and direct-credential variable                                                       | No production identity, supervision, content, assignments, attempts, jobs or audit tables; no migrations exist in this scope.                          |
| Auth                | Better Auth/passkey dependencies installed at root, but no root auth handler or production auth composition                                                                                                                                                                   | Port policy and tests from the accepted spike through supported Prisma/PostgreSQL adapters; do not import the spike into the app.                      |
| Runtime/package     | Next standalone build, pinned Node 24 image, non-root runtime, exact direct package versions                                                                                                                                                                                  | Good base for immutable releases. Root Dockerfile is not a complete deployment/operations setup.                                                       |
| Quality             | Root lint/types/unit/stories/build/E2E scripts and separate spike CI job; synthetic fixtures                                                                                                                                                                                  | Maintain gates while adding real server/DB integration coverage. Configuration alone does not establish a passing remote CI run.                       |
| Browsers            | E2E suite runs Chromium, Dutch locale, Amsterdam timezone and reduced motion; various story layouts test 320–1440px                                                                                                                                                           | Browser viewport checks are useful but do not establish physical tablet keyboard/performance, Safari, screen-reader or default-motion readiness.       |
| Visual regression   | Explicit Playwright screenshot comparison with snapshot updates disabled; not part of `check`                                                                                                                                                                                 | Reviewed baselines are still absent according to verification policy; screenshots from E2E are inspection evidence, not accepted regression baselines. |

Sources: [verification contract](../engineering/verification.md), [foundation report](../engineering/foundation-report.md), [architecture](../architecture/initial-architecture.md), [ADRs](../architecture/decisions.md), and files linked above.

## Authentication reuse and production gaps

The spike implements real library ceremonies rather than a fake sign-in screen. Its [`auth.mjs`](../../spikes/auth-feasibility/auth.mjs), [`policy.mjs`](../../spikes/auth-feasibility/policy.mjs) and [`server.mjs`](../../spikes/auth-feasibility/server.mjs) provide:

- Guardian password/TOTP with a fresh five-minute MFA window for approval and revocation; no remembered-device bypass.
- Browser-bound, hashed opaque authorization cookie, ten-minute one-use enrollment, explicit guardian code/label review and 90-day browser grant.
- Required WebAuthn user verification enforced server-side, including the library-version-specific authentication-options correction.
- Explicit auth endpoint/method allowlist, blocked generic signup/account-management routes and no preexisting session during passkey ceremonies.
- Database-backed session checks, principal separation, grant/credential binding, 12-hour absolute expiry and 30-minute student inactivity lock.
- Browser-only, credential-wide and all-student revocation, with sessions removed transactionally in the spike.
- Exact origin/Host controls, JSON/body limits, restrictive CSP, host-only secure cookies on HTTPS and no authentication payload logs.

Retain these invariants and negative tests. Do not copy synthetic principal lookup or SQLite transaction assumptions into production unchanged.

Important seams before real use:

1. **Real account and resource scope.** The spike has one seeded guardian and one student, looks up the fixed student once at startup, and lists browser grants globally. This is intentional for a synthetic one-family tool. Production needs explicit guardian/student relationships and capabilities, deny-by-default resource access, distinct adult/student principals, and synthetic two-family negative tests even if Adam is the only initial real learner. Content administrator status must not automatically expose learner history.
2. **Prisma/PostgreSQL transactions.** Registration deliberately consumes an enrollment before library persistence and fails closed if finalization fails. This can leave an unusable grant/orphan credential. Production must test crash/retry and concurrent ceremonies across the selected adapter, including binding a newly issued session before returning access. SQLite `BEGIN IMMEDIATE` behavior is not evidence for PostgreSQL behavior.
3. **Adult bootstrap and recovery.** Spike seeding uses Better Auth setup internals and a synthetic `.invalid` email; it is not an invitation, email-verification, recovery-code or lost-factor product workflow. Specify a tightly bounded bootstrap and adult recovery process, test step-up expiry, and never downgrade student access to a website PIN.
4. **Rates and availability.** Spike throttles are global in-memory counters by route, suitable only for the trial. Production needs deliberate abuse limits with appropriate actor/browser/IP scope and bounded storage, proxy-trust rules and lockout behavior. Do not blindly inherit a global limit that one browser can exhaust for everyone.
5. **Final HTTPS origin.** Trial passkeys belong to `auth-test.ammarhadid.com`. Choose the stable production origin before real enrollment, then re-enroll there; do not promise credential migration between relying-party IDs.
6. **Integration retest, not reopening the accepted spike.** User-reported MacBook Chrome guardian and Tab S9 Ultra Chrome student PIN/passkey flows are accepted. Safari was explicitly skipped; preserve that status. Test the final integrated origin and real learning journey on supported devices without claiming all historical physical cases passed.

The [findings](../../spikes/auth-feasibility/FINDINGS.md) and [device record](../../spikes/auth-feasibility/DEVICE-TESTS.md) distinguish user reports, virtual authenticators and unrun physical variants. Cookie authorization is not physical device attestation and does not eliminate theft of an entire authorized browser/session context.

## Data and server integration required

The approved architecture already defines the desired invariants; implementation should deliver them in small vertical slices rather than create every proposed table at once.

| Slice                  | Minimum persistent ownership                                                                                                                                 | Required proof                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity/supervision   | Library identity/session tables, student profile, guardian relationship, browser enrollment/grant and session binding                                        | Missing/stale/revoked session denial, two-family ID substitution denial, MFA checks, valid and failed enrollment/recovery                       |
| Published content      | Immutable question/evaluation versions, initial curriculum release/skill mapping, review/publication record; passage/set version pairing when reading enters | No unpublished/quarantined content served; exact approved hashes; answer keys absent from public DTOs/HTML/RSC/bundles                          |
| Assignment/resume      | Assigned immutable item order/versions, task/session state and drafts under an explicit save contract                                                        | Reload/device reopen resumes committed state; same-category carryover retains exact questions and attempts; a failed save is not labelled saved |
| Submit answer          | Original response, normalized value, sequence/revision, idempotency key, evaluation and eligible evidence                                                    | Two concurrent requests cannot duplicate attempts or consume extra retries; conflict/rollback/retry tests against actual PostgreSQL             |
| Guardian view          | Authorized projection of committed attempts, weighted and solved counts, disclosure eligibility                                                              | Exact correspondence to saved attempts; incomplete results remain withheld; no browser-switch control used as authorization                     |
| Generation/publication | Durable bounded jobs, versioned spec/provider metadata, budget reservations, candidates, review and certificates                                             | Lease recovery, duplicate job submission, timeout/retry spending, quarantine and publication gates with fake provider tests                     |

Keep pure scoring and evidence modules reusable, but server authority must select pinned content and policy. The browser must not provide its own score, correctness, target student or unrestricted generation request. The synthetic E2E tests intentionally use visible fixture answers and demo shortcuts; those are not production anti-cheating or authorization coverage.

Reading reveal dependencies, immutable passage pairing, first-attempt evidence, and append-only evaluation corrections are explicit production contracts in architecture sections 5–8. They need their own server tests, beyond preservation of a synthetic screen.

## Packaging and deployment findings

**Concrete packaging gap:** [`scripts/package-standalone.mjs`](../../scripts/package-standalone.mjs) copies only `.next/static`; the root [`Dockerfile`](../../Dockerfile) copies only `.next/standalone` into the runtime stage. At inspection, `.next/standalone/public` did not exist. Storybook explicitly serves `public` through `staticDirs`, which can conceal this gap during UI work. Before approved screens become application routes, package required public assets and assert successful font/Nexai asset requests against the actual standalone/container image. This audit did not modify packaging or execute a new image build.

Other operational work remains proposed:

- Root application has no Compose/Caddy production configuration, liveness/readiness endpoint, resource limits, persistent job execution schedule or managed release/rollback procedure. The isolated spike provides a concrete local pattern, not permission to reuse its data/network/hostname.
- Root Next config sets nosniff, no-referrer, frame denial and camera/microphone/geolocation restrictions. It does not establish production CSP, authenticated cache policy, rate limiting or server authorization. Add/test those at their actual HTTP/proxy boundaries, preserving passkey compatibility.
- Root runtime is non-root, but read-only filesystem, capability drops, no-new-privileges, bounded logs/temp storage, CPU/memory/PIDs and private proxy networking belong to deployment configuration. The spike already demonstrates such settings within its separate resource budget.
- The spike's Caddy network was connected manually; its deployment record explicitly says a Caddy recreation needs reattachment. Production configuration must manage the required external network declaratively without rewriting unrelated domains.
- No implemented encrypted off-host backup, restoration, deletion/revocation ledger, recovery drill, migration rollback compatibility or independent failure alert exists in this audited scope.
- Existing server resource samples are historical. A realistic simultaneous learning/job/backup run is required; no need for a new service before measured capacity establishes that need. Build off-host and cap generation concurrency initially.
- Future generation should run as bounded same-image jobs with PostgreSQL leases, not a constant polling daemon or new Redis service; this follows ADR-008 and protects sleeping database economics.

## Quality evidence and blind spots

Fresh checks in this audit:

| Command                                                                                                                | Result                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `node --test tests/policy.test.mjs` in the isolated spike using ambient Node 25.9.0                                    | 4 passed, 0 failed; repeated under required Node below |
| `/Users/elpridro/.npm/_npx/fee7060b69ab3f2d/node_modules/node/bin/node --test tests/policy.test.mjs` with Node 24.22.0 | 4 passed, 0 failed                                     |
| Filesystem presence check                                                                                              | `.next/standalone/public` absent at inspection         |

No spike browser suite, remote HTTPS smoke, dependency audit, Docker build, PostgreSQL connection/migration, load test, physical device or hosted CI run was performed by this audit. Root agent owns current root checks; do not combine historical counts with a new run. In particular, never run the deployed password-only `check-https.mjs` after human TOTP enrollment.

Source coverage limitations in existing checks:

- Foundation E2E tests run the built Next app, but only its notice. Product journey E2Es target static Storybook, where state intentionally resets on reload. Their success does not establish authenticated HTTP endpoints or durable history.
- Current E2E config sets reduced motion to `reduce`; full motion/device performance still needs separate execution.
- Root ESLint forbids infrastructure/domain imports in shared components and some feature component directories. It is a useful boundary guard, not proof that answer keys never reach browser bundles. A production payload/bundle test remains necessary.
- Dependency risk handling explicitly allows one named development-only advisory chain after blocking high/critical production findings. The historical audit is not evidence that today's advisory state is clean; rerun before release and review the pinned Storybook compatibility backport.
- Many current implementation files are untracked or modified. Preserve them, then establish reviewed commits/checkpoints and reproducible release inputs before attempting deployment. This audit made no commits and changed no unrelated files.

## Historical documentation conflicts to reconcile in the delivery plan

The original architecture is intentionally historical in places. Its stack table still says pnpm and defers Storybook, while the actual root package, ADR-011 and mandatory engineering protocol use npm and require Storybook. Its original latest-20 / 85% mastery proposal is superseded for current synthetic assessment by ADR-012 and the canonical assessment policy, not an approved production threshold. Five-peer category wording is superseded by four product subjects with Redactiesommen within Rekenen. Several sections say no application exists or that features are unimplemented; those describe the original planning date and must be read alongside later synthetic implementation evidence. Do not implement an older threshold, retry/reveal timing or manual-only planner simply because it remains in preserved history.

The parent audit reports freshly executed root unit tests (110 passed) and typecheck passed; those are parent-owned evidence, separate from the four spike policy tests above. The user has now confirmed a private first release covering all four subjects, Ammar reviewing content with limited available time, and automatic progression within guardian limits. Subsequent interview answers are recorded in the delivery roadmap: 15–30 minutes/week, the full supplied catalogue, a polished 3D gamepas at launch and a €10/month AI planning ceiling. This audit remains a source snapshot.

## Prioritized delivery dependencies

1. **Freeze a bounded release contract and provenance.** Keep the approved stack, exact design contracts, four product subjects with Redactiesommen inside Rekenen, and latest assessment policy. Identify committed release inputs and documented remaining educational/content limits. Do not call story approval production authorization.
2. **Build the first authenticated durable vertical slice.** Production-origin auth composition plus PostgreSQL schema/ownership, one published question family, assignment, idempotent submission, resume and guardian result. Use synthetic users until privacy/content/release gates pass.
3. **Add real inventory and replenishment early.** Deterministic certified arithmetic plus required AI semantic drafting/review, published stock and budgeted scheduled jobs. Daily preparation uses a buffer and existing bank; child submission never waits on AI.
4. **Extend the same persistence/contracts to all approved exercise formats.** Reading bundle/version/reveal logic and category-aware carryover need explicit tests. Do not rebuild approved visual components or create separate subject apps.
5. **Integrate automatic routes only at their validated scope.** Persist explainable versioned decisions; missing content remains a content block, not a diagnosis or permission to skip. Educational review is a separate release dependency.
6. **Complete guardian and operational controls.** Saved plan/bounds and changes, review/redo as approved, device recovery, generation review/budget visibility, error states, backups and deletion/export where applicable.
7. **Run pre-live rehearsal on the actual runtime.** Assets, server authorization/key secrecy, interrupted network/concurrent retries, real hardware, manual accessibility, migration/restore and representative cohosted load. Record exact omissions; get explicit release authorization before deployment/real learner use.

Concrete operational decisions still needed: stable production hostname, initial category depth/content inventory and available review time, independent educational review arrangement, AI seed/monthly ceiling, approved database/backup/email choices and incremental spending, retention/recovery objectives and rollout timing. First release is now confirmed private and all-four-subject; Ammar will review content. Known VPS and device models do not need asking again.

## Exact file inventory

All paths below are relative to the repository root. Entries are files read, not assertions that every defined test was executed.

```text
.dockerignore
.github/workflows/quality.yml
.gitignore
.npmrc
.nvmrc
.prettierignore
.prettierrc.json
.storybook/main.ts
.storybook/preview.ts
.storybook/serve.json
Dockerfile
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
playwright.config.ts
playwright.visual.config.ts
prisma.config.ts
prisma/schema.prisma
scripts/audit-dependencies.mjs
scripts/package-standalone.mjs
scripts/prepare-storybook.mjs
spikes/auth-feasibility/.dockerignore
spikes/auth-feasibility/.gitignore
spikes/auth-feasibility/.npmrc
spikes/auth-feasibility/Caddyfile.fragment
spikes/auth-feasibility/DEPLOYMENT.md
spikes/auth-feasibility/DEVICE-TESTS.md
spikes/auth-feasibility/Dockerfile
spikes/auth-feasibility/FINDINGS.md
spikes/auth-feasibility/README.md
spikes/auth-feasibility/auth.mjs
spikes/auth-feasibility/compose.yaml
spikes/auth-feasibility/config.mjs
spikes/auth-feasibility/package.json
spikes/auth-feasibility/playwright.config.mjs
spikes/auth-feasibility/policy.mjs
spikes/auth-feasibility/public/client.mjs
spikes/auth-feasibility/public/index.html
spikes/auth-feasibility/public/style.css
spikes/auth-feasibility/scripts/build.mjs
spikes/auth-feasibility/scripts/check-https.mjs
spikes/auth-feasibility/scripts/setup.mjs
spikes/auth-feasibility/server.mjs
spikes/auth-feasibility/tests/browser/auth.spec.mjs
spikes/auth-feasibility/tests/policy.test.mjs
spikes/auth-feasibility/tests/serve.mjs
src/app/icon.svg
src/app/layout.tsx
src/app/page.tsx
src/server/db/client.ts
src/server/db/connection-string.test.ts
src/server/db/connection-string.ts
tests/e2e/foundation.spec.ts
tests/e2e/guardian-results.spec.ts
tests/e2e/learning-path.spec.ts
tests/e2e/practice-journey.spec.ts
tests/tooling/boundaries.test.ts
tests/tooling/nexai-isolation.test.ts
tests/tooling/nexai-layered-poses.test.ts
tests/tooling/nexai-library.test.ts
tests/tooling/nexai-pose-motion.test.ts
tests/visual/foundation.spec.ts
tsconfig.json
vitest.config.ts
```
