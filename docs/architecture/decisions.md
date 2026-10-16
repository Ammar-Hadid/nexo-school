# nexo School — architecture decision register

Date: 16 October 2026 · Revision 5 · **Auth feasibility accepted; foundation milestone authorized**

The user approved the modular monolith, educational domain boundaries, versioned records, mastery architecture and explainable adaptivity. The user also explicitly requires MVP AI generation, independent child access, five categories and reuse of the existing VPS with Neon. These are confirmed decisions, not open questions. On 15 October the user approved the revised architecture and authorized only the isolated synthetic-data authentication feasibility spike. At that time broader application implementation remained out of scope. On 16 October the user accepted the auth spike and authorized repository instructions, the approved stack, quality checks and Storybook; educational features and production deployment remain outside this milestone. The user subsequently authorized the `auth-test.ammarhadid.com` trial on `nexo-vps`.

Read with the [architecture](initial-architecture.md) and [MVP roadmap](../product/mvp-scope.md). Historical alternatives below preserve why earlier choices were made and why they changed; they are not current recommendations.

## Decision status and remaining verification

| ID | Confirmed direction | Verification / concrete operational decisions |
|---|---|---|
| D01 — Product/architecture | Maintain the ambitious modular/domain/versioning/mastery architecture; implement incrementally toward future thousands of students and schools | Use private-family pilot release gates; name accountable operator/privacy and educational reviewers before live data. Institutional rollout remains separate. |
| D02 — Infrastructure | Existing Hetzner CPX22 + Docker + Caddy/domain; Neon PostgreSQL; no Vercel/Supabase or €60 fixed budget | Validate the approved deployment/database approach; settle concrete backup/email services, spending caps and recovery operations before those slices. Verify contention/isolation, not already supplied machine specifications. |
| D03 — Student authentication | Independent daily access, strong authentication, guardian oversight, multiple devices, revoke/recover; no standalone four-digit PIN | **Approved: self-hosted Better Auth, passkeys + guardian-approved browser registration**, adult 2FA and scoped DB sessions. Validate durations/fallback through known-device tests; see the spike findings. |
| D04 — Educational scope | Five categories, including versioned reading passages and comprehension questions; canonical Nederlands/math skills remain distinct from navigation | Agree initial topics/reading rubric, reviewer and School Mode's guardian-described alignment until exact Malmberg editions are verified. |
| D05 — AI and evidence | AI-powered exercise generation is required in MVP, early in roadmap; submissions stay AI-independent; preserve deterministic checking and historical facts | The certified-template versus human semantic/bundle lanes are approved. Validate sampling/kill switches and educational thresholds; establish concrete seed/monthly caps before AI execution. |

Do not re-request approval for the already confirmed five-category/AI/VPS direction. The revised architecture is approved. The foundation milestone is now authorized; other purchases/deployments and educational feature work require their own scope.

## ADR-001 — One modular monolith with an incremental expansion path

**Status:** Revised architecture accepted by user on 15 October 2026; foundation execution authorized on 16 October 2026.

**Decision retained:** TypeScript/Next.js application, domain-owned use cases and adapter boundaries, PostgreSQL source of truth, pure evaluation/mastery and shared transactions where needed. Canonical modules remain Identity/Access, Students/Guardians, Curriculum, Methods, Content, Learning, Evaluation, Progress, Adaptive, AI Content and Reporting. A bounded job process uses the same application image; it is not a microservice.

**Original reasoning retained:** separate Fastify/Nest deployment and microservices add coordination/operational overhead; Django remains credible but introduces another language relative to the recommended React client. The original goal was maintainability, not eliminating useful domain abstractions.

**Consequences:** add schemas/routes only as a slice needs them; preserve interfaces for teacher/organization relationships, curriculum crosswalks, richer mastery strategies, scalable projections and worker separation. Thousands of students require measured scaling and governance, not a rewrite of educational logic. **Revisit deployment topology when:** concurrency, reliability or team ownership justifies it.

## ADR-002 — Neon PostgreSQL and Prisma replace Supabase

**Status:** Neon direction accepted by user; connection/operations details proposed.

**Previous proposal:** Supabase PostgreSQL plus Prisma offered managed relational storage and bundled adult auth. That bundle suited an initially unspecified hosting environment. It is superseded by the user's infrastructure preference.

**New decision:** Neon PostgreSQL in Frankfurt, Prisma for typed CRUD/migrations and reviewed SQL constraints. Server-only access; no browser Data API. Least-privilege runtime/auth/job roles, separate migration/backup roles, TLS verification, constrained pooling and short interactive transactions. Keep application authorization explicit; Prisma does not automatically inherit user identity for RLS.

**Alternatives retained:** SQLite/document storage remain weaker fits for the selected deployment and transactional relations; Drizzle is credible but does not justify changing the chosen ORM merely because the database host changed.

**Consequences:** use Free only with quota/cold-start/recovery acceptance and off-provider backups. Jobs/health checks must not keep compute awake by polling. Upgrade on measured usage before quota exhaustion threatens study. Paid estimates use compute/storage/history rather than an invented flat budget. **Revisit when:** workload, availability guarantees or institution-specific controls require another plan. Current facts/rates are cited in architecture section 2.

## ADR-003 — Guardian-approved enrollment, independent passkey login

**Status:** Mechanism retained; user accepted the feasibility spike on 16 October 2026 based on the successful core tablet/guardian flow. Outstanding device evidence remains recorded.

**Previous proposal:** guardian launched every child session, with adult reauthentication after switching back. It minimized child credential management and shared-device escalation but imposed repeated daily friction. **Superseded as the ordinary login workflow.** Its separation of child/adult authority remains required.

**Recommended solution:** self-hosted Better Auth using its supported Prisma/passkey/2FA/session facilities. A guardian with recent MFA approves a short-lived enrollment for a specific student/browser; the child registers a passkey. Daily login requires both a valid passkey assertion with user verification and an active guardian-approved browser grant. Adults retain normal sessions on their own MacBook. The child neither needs a personal email nor guardian involvement each day.

**Suitable alternatives and tradeoffs:** platform passkeys are easiest on the known tablet if its OS/account supports them; a registered hardware WebAuthn key is a supported fallback if usable; remembered-browser/PIN-only login has unacceptable bearer/weak-secret risks as an independent credential; per-session guardian email links remain recovery/bootstrap only. See the architecture comparison and protocol for exact boundaries.

**Device distinction:** passkeys may sync across devices; they are not automatically hardware-bound. A new browser still requires guardian authorization. Browser-grant cookies are not remote attestation, and cookie theft is a residual risk. Revoke device registrations, credentials and active sessions explicitly, with no stale cookie-cache bypass. Credentials associated with student identities cannot be used for adult role elevation or account linking.

**Library alternatives:** Neon Managed Better Auth is operationally attractive, but its current plugin list omits Passkey and its roadmap still lists MFA as coming; do not assume upstream feature parity. Keycloak adds a separate operational service; Auth.js would require a more assembled flow. Self-hosted Better Auth is the preferred fit if supported hooks pass enrollment/revocation tests. No custom password store, WebAuthn crypto or homegrown auth protocol. [Neon plugins](https://neon.com/docs/auth/guides/plugins), [roadmap](https://neon.com/docs/auth/roadmap).

**Feasibility gate before broader production implementation:** a disposable synthetic-data HTTPS spike must verify the complete Better Auth + guardian enrollment + browser grant + passkey + revoke/recover path on actual hardware. Mock tests are insufficient. Record failures and revisit D03 if supported integration points or usability fail; no PIN-only downgrade. The user has authorized this slice. The prototype, virtual-authenticator regression suite and public HTTPS smoke checks pass; the physical core Tab S9 Ultra/Chrome passkey flow and MacBook Chrome guardian flow succeeded as reported. The user accepted feasibility and skipped further Safari spike testing; unrun variants are not claimed as passed. See [findings](../../spikes/auth-feasibility/FINDINGS.md).

**Known-device gate:** Adam’s Samsung Tab S9 Ultra/Chrome for student; 16-inch M4 Pro MacBook with Chrome/Safari for guardian/admin. Verify OS/browser versions, lock/sync/shared-account settings, user verification, independent login, second-device enrollment, loss/recovery and revocation. The device models are confirmed, not remaining questions. Proposed defaults: child session max 12 hours, inactivity lock 30 minutes, browser registration 90 days, enrollment 10 minutes; guardian renewal/recovery never falls back to a child PIN. **Revisit when:** actual-device tests or supported-library capabilities require an equally secure alternative.

## ADR-004 — Five categories over canonical, versioned skills

**Status:** Direction accepted, including new Begrijpend Lezen category; exact content scope/reviewer pending.

**Decision retained and extended:** curriculum skills and objectives are publisher-independent and versioned, with reviewed exact-edition mappings. Navigation now exposes Rekenen, Redactiesommen, Taal, Spelling and Begrijpend Lezen. Spelling and reading comprehension belong to Nederlands; word problems can assess maths without automatically proving reading mastery.

**Previous reasoning retained:** using publisher chapters as primary skills causes lock-in; duplicating skill trees by category inflates evidence; grade alone cannot model prerequisites or individual progress. The four-category list is superseded, not the canonical model.

**New passage model:** immutable `PassageVersion` plus `ReadingSetVersion` and question links freeze text, evidence anchors, keys, reading rubric and rights. Assignment/set versions prevent passage-question mismatch. Multiple questions from one passage are clustered evidence; diverse passages/days are required for broad mastery signals. Word counts/model labels do not certify AVI levels.

**Consequences:** passage revisions trigger linked-question revalidation and can quarantine dependent sets. AI passage creation is MVP Lane C with exact-bundle human approval. School alignment remains visibly unverified until real method/edition mappings are reviewed. **Revisit when:** standards, editions or grade coverage expand; preserve history through explicit crosswalks.

## ADR-005 — Immutable learning facts, replaceable derived state

**Status:** Revised architecture accepted; detailed educational/operational parameters require validation before use.

**Decision retained:** freeze published content and assigned snapshots, append genuine attempts/evaluation corrections, derive replaceable mastery. Transactional idempotency prevents duplicate historical submissions. Privacy deletion is an explicit exception to ordinary immutability, not an afterthought.

**Alternatives retained:** latest-answer-only storage loses learning evidence; editing question rows rewrites history; full event sourcing adds unnecessary reconstruction overhead.

**Revision implications:** versions now include passages, generation/validator/certification policies and publication authority. Approval may be human or certified-policy based, but must name exact hashes. Restore must replay access revocations as well as privacy deletions, and invalidate old sessions/enrollments. **Revisit when:** measured analytics volume justifies asynchronous projections, preserving the historical source records.

## ADR-006 — Deterministic grading and explainable mastery

**Status:** Direction accepted; numeric thresholds/reading evidence rules await educational review.

**Decision retained:** pure versioned evaluators, explicit normalization/tolerances/partial credit, eligible first-attempt evidence, uncertainty, recency/diversity gates, deterministic next-session ranking and guardian overrides.

**Original reasoning retained:** LLM grading is unnecessary for objective answers; raw accuracy confounds hints and repetitions; sophisticated ML is premature without calibrated items/data. Retaining a richer mastery interface does not require a complex model now.

**New implications:** bound evidence from automatically generated variants by template family. Aggregate correlated reading questions per skill/passage exposure and avoid revealing answers that leak into other first attempts. Passage reading time is counted once. These estimates remain provisional learning signals, not diagnoses or validated school grades. **Revisit when:** lawful data and calibrated items support an empirical comparison with more advanced models.

## ADR-007 — Required early AI generation with type-specific approval

**Status:** MVP inclusion and lane/certification architecture accepted; concrete certification evidence and release policy execution remain future work.

**Previous proposal:** optional post-MVP AI drafting, with human approval of every question version. This favored a tiny manual seed bank and outage isolation, but did not satisfy scalable content generation as a core product value. **Superseded:** the optional timing and blanket per-variation human-review requirement. Provider separation, validation, cost accounting and reusable content remain.

**New decision:** AI semantic generation enters milestone 1 alongside deterministic arithmetic generation. Routine numerical variations use seeded code with zero AI calls; do not spend model tokens simply to choose numbers. Lane A allows automatic publication of instances within a human-certified finite arithmetic template/renderer/validator contract after deterministic per-instance checks. Lane B requires human semantic review of language/word problems; Lane C reviews original passage/question bundles. Unsupported/unbounded output is rejected. Model-generated code or free-form wording cannot silently inherit a template certificate.

**Consequences:** certify safe families once, not each numerical permutation. Independent answer verification, finite-space tests, exact hashes, sample audits, revocation/quarantine and correction workflows are mandatory. B/C still need reviewer capacity; batch/bundle review and reuse reduce authoring cost without pretending semantics are proven by another model. Inventory replenishment occurs before demand; no ordinary submission waits on AI.

**Provider choice:** retain an application-owned port and initially one Anthropic adapter, with model selected from Dutch gold-set quality, terms and cost. The model is chosen during the early AI slice, not deferred until after MVP. A second provider and live tutor are later options. **Revisit semantic auto-approval through:** subtype-specific shadow validators, expert-labelled family-separated holdouts, severity-based false-approval/confidence criteria, measured abstention/review savings/cost, then explicit narrow policy approval. Initial human semantic review is a release policy, not a permanent architecture constraint. Model confidence or agreement alone cannot authorize promotion; sampling, drift checks and rollback remain required.

## ADR-008 — Required durable jobs, bounded execution and simple reporting

**Status:** Incremental architecture accepted; the foundation milestone is authorized; AI job implementation remains a later slice.

**Previous proposal:** add jobs only if optional AI arrived. **Revised:** durable generation jobs are required from the first AI slice. Short learning transactions still update small mastery projections synchronously.

**Decision:** PostgreSQL leases/idempotency and bounded same-image job execution scheduled on the existing VPS. No constant queue polling, Redis or broker. Provider calls occur outside database transactions. Exit when the burst is finished; retry abandoned leases at the next scheduled window. Track failures and conservative spend reservations.

**Consequences:** visible batching delay is acceptable for stock replenishment; sleeping Neon controls pilot costs. One job at a time limits resource contention with learning/other apps. Worker separation/outbox/read-model interfaces remain designed for later scaling. **Revisit when:** measured job volume/latency requires a dedicated worker or projections become expensive.

## ADR-009 — Shared, responsive frontend foundations

**Status:** Architectural direction retained; responsive devices clarified by user.

**Decision:** design tokens, accessible primitives, typed question renderers and local exercise reducer; server data stays authoritative. Reading-set presentation is a composition of shared exercise components. Responsive desktop/tablet/mobile; prioritize Tab S9 Ultra/Chrome and MacBook Chrome/Safari tests.

**Reasoning retained:** separate subject apps duplicate educational/accessibility rules; Redux/design-system package is unnecessary without a real coordination need. The previous optional Storybook decision is superseded by the user's 16 October engineering protocol: Storybook is mandatory for meaningful shared UI, with revision-specific component approval and shared application styles. Product branding still needs explicit review. No final screens or components are created in this planning phase.

## ADR-010 — Reuse existing Hetzner Docker/Caddy with verified capacity

**Status:** Infrastructure reuse accepted; detailed resource/isolation and recovery plan proposed.

**Previous proposal:** Vercel + Supabase and a €60/month infrastructure allowance traded money for managed operations. The user already owns suitable candidate infrastructure and explicitly rejected that plan. **Superseded.**

**Known facts supplied by user:** CPX22 `nexo-vps`, 2 vCPU/4 GB RAM, approximately 2.5 GiB available; 80 GB SSD/approximately 51 GB free (30% used); Ubuntu 26.04 LTS; Docker/Caddy; nine containers approximately 177 MiB combined, sampled CPU 1–4%; swap 2 GiB/368 MiB used. Auctus, Minecraft relay, Student Planner, Word Atlas and Portfolio share the host. These 13 October measurements support a pilot recommendation, not a concurrency guarantee.

**Decision:** dedicated Compose app/network/credentials with non-root execution and resource limits; reuse Caddy vhost/certificates, build images off-host, external AI APIs, Neon Frankfurt. A systemd-managed Node process is viable but less aligned with the already established Docker host. Do not introduce another deployment platform/proxy or host models locally.

**Consequences:** protect existing workloads, measure simultaneous learning/job/backup load, check swap/OOM/latency, maintain kernel/container dependencies and restrict Docker access. Shared kernel/root compromise remains a risk; use a separate host if current co-hosts cannot be trusted or isolated. Runtime statelessness and durable DB jobs permit later separation without redesigning domains.

**Recovery proposal:** daily encrypted Neon logical dumps plus app/config/secrets recovery material off-host; 30-day maximum backup retention, independently held recovery keys and deletion/revocation ledger; private-pilot RPO 24 hours/RTO one working day subject to approval. Neon short Free restore history or a VPS snapshot alone is insufficient. Restore before real data and quarterly, invalidating stale auth state. **Revisit when:** recovery objectives or workload exceed this shared-host approach.

## Cost decisions

The original fixed €60 infrastructure allocation is withdrawn. Reuse of the existing VPS/domain is €0 **incremental rental**, not zero capacity/maintenance cost. A new off-host backup destination plus email/monitoring allowances suggests roughly **€4–13/month ordinary pilot increments on Neon Free**, potentially €0 if those services already exist appropriately. Small paid Neon usage is separately estimated at **$5–25/month** until measured. AI is a distinct proposed **$5–20/month** operating allowance plus a separately approved initial seed/evaluation budget. Prices/quotas and explicit growth calculations are in architecture section 2; these are estimates before tax/FX, not purchases or current vendor quotes for the user's account.

User approval is still needed for concrete spending limits, backup destination, AI seed cap and recovery/retention expectations. Do not cut backups or access controls to hit zero cost. For thousands of learners, approve a measured capacity/database/storage and operational model rather than extrapolating the private-pilot envelope.

## Remaining risks and owners

| Risk | Mitigation / owner |
|---|---|
| Invalid automated publication | Technical owner certifies finite template/independent solver; educational reviewer approves wording/skills; operator can revoke whole family immediately. |
| Semantic/reading review bottleneck | Measure review time and demand; use deterministic generation for numerical variants, batch/bundle reuse and a held-out-evaluated shadow-validation path toward narrow automated semantic approval. |
| Passkey/browser mismatch | Test known Android/Mac hardware and real OS/account configuration; approved hardware-key fallback; never downgrade to PIN-only auth. |
| Synced credential mistaken for device binding | Browser grant plus credential checks; guardian revocation; communicate limits and maintain XSS/session protections. |
| Shared VPS contention or compromise | Resource limits, maintained co-hosts, restricted credentials, off-host builds and realistic load test; operator owns patching/recovery. |
| Neon Free quota/cold-start surprises | No idle polling, measured compute/storage/egress, early alerts and paid upgrade before disruption. |
| Restored data reactivates revoked access | External revocation/deletion ledger and mandatory session/token invalidation during restore. |
| Unknown publisher alignment | Guardian supplies exact editions/current units; reviewer verifies; until then labels stay guardian-described. |
| Misleading reading or template mastery | Family clustering, diversity/date gates, assistance and version tracking; educator validates thresholds. |
| School expansion inherits household assumptions | Separate institutional access/privacy/contract milestone; preserve organization/module seams now. |

## Current implementation boundary

The revised architecture is approved. On 16 October the user accepted the isolated authentication spike and authorized the foundation milestone: repository instructions, approved stack setup, quality checks and Storybook. Preserve the spike and its test evidence; this acceptance does not claim all device checks passed. Production auth/supervision, educational domains, live AI calls, database provisioning and new deployment are later slices. See the [spike findings](../../spikes/auth-feasibility/FINDINGS.md) and [physical-device checklist](../../spikes/auth-feasibility/DEVICE-TESTS.md).


## ADR-011 — Foundation toolchain and review workflow

**Status:** Implemented within the foundation milestone authorized on 16 October 2026; product brand and shared-component contracts remain unapproved.

**Decision:** one root npm package with pinned Node 24 LTS, Next.js/React/TypeScript and standalone container output. Preserve the auth spike's separate package boundary. Prepare Prisma/PostgreSQL using the standard `pg` adapter (Neon pooled endpoint at runtime, separate direct migration credentials); generation/build does not need live credentials or create domain tables. Better Auth/passkey packages remain pinned to the spike-tested release; production auth endpoints and schema are deliberately not exposed by this foundation.

**Tooling:** ESLint/Prettier, Vitest, Playwright and mandatory Storybook Next.js/Vite with axe and interaction tests. Prefer familiar maintained tools over custom test frameworks or a monorepo task runner. No Tailwind/component framework, separate service, paid visual-test service or component catalogue is introduced. Provisional system-color styles allow verification while brand direction remains undecided.

**Consequences:** add quality checks to local scripts and GitHub Actions, keep production dependencies subject to audit, explicitly triage development findings, and review visual baselines before enabling image comparisons in CI. Component approval records name immutable revisions and actual user approval. See [tooling risk record](../engineering/tooling-risks.md) for the version-checked upstream Storybook backport, ESLint peer constraints and unpatched development advisory. Revisit those exceptions on dependency updates, not by changing the approved stack.

**Primary references inspected:** [Next installation](https://nextjs.org/docs/app/getting-started/installation), [server/client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Storybook Next.js/Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite), [Storybook browser testing](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index), [Prisma generation](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client), [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma). Registry peer ranges and installed code were checked on 16 October; pinned versions and lockfile are the executable source.
