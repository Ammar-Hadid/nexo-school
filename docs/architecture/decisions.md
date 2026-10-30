# nexo School — architecture decision register

Date: 20 October 2026 · Revision 6 · **Self-hosted PostgreSQL amendment approved; earlier milestone history retained**

The user approved the modular monolith, educational domain boundaries, versioned records, mastery architecture and explainable adaptivity. The user also explicitly requires MVP AI generation, independent child access, five categories and reuse of the existing VPS with self-hosted PostgreSQL. These are confirmed decisions, not open questions. On 15 October the user approved the revised architecture and authorized only the isolated synthetic-data authentication feasibility spike. At that time broader application implementation remained out of scope. On 16 October the user accepted the auth spike and authorized repository instructions, the approved stack, quality checks and Storybook; educational features and production deployment remain outside this milestone. The user subsequently authorized the `auth-test.ammarhadid.com` trial on `nexo-vps`.

Read with the [architecture](initial-architecture.md) and [MVP roadmap](../product/mvp-scope.md). Historical alternatives below preserve why earlier choices were made and why they changed; they are not current recommendations.

## Decision status and remaining verification

| ID                           | Confirmed direction                                                                                                                                        | Verification / concrete operational decisions                                                                                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01 — Product/architecture   | Maintain the ambitious modular/domain/versioning/mastery architecture; implement incrementally toward future thousands of students and schools             | Use private-family pilot release gates; name accountable operator/privacy and educational reviewers before live data. Institutional rollout remains separate.                                                                   |
| D02 — Infrastructure         | Existing Hetzner CPX22 + Docker + Caddy/domain; self-hosted PostgreSQL; no Vercel/Supabase or €60 fixed budget                                             | Validate the approved deployment/database approach; settle concrete backup/email services, spending caps and recovery operations before those slices. Verify contention/isolation, not already supplied machine specifications. |
| D03 — Student authentication | Independent daily access, strong authentication, guardian oversight, multiple devices, revoke/recover; no standalone four-digit PIN                        | **Approved: self-hosted Better Auth, passkeys + guardian-approved browser registration**, adult 2FA and scoped DB sessions. Validate durations/fallback through known-device tests; see the spike findings.                     |
| D04 — Educational scope      | Five categories, including versioned reading passages and comprehension questions; canonical Nederlands/math skills remain distinct from navigation        | Agree initial topics/reading rubric, reviewer and School Mode's guardian-described alignment until exact Malmberg editions are verified.                                                                                        |
| D05 — AI and evidence        | AI-powered exercise generation is required in MVP, early in roadmap; submissions stay AI-independent; preserve deterministic checking and historical facts | The certified-template versus human semantic/bundle lanes are approved. Validate sampling/kill switches and educational thresholds; establish concrete seed/monthly caps before AI execution.                                   |

Do not re-request approval for the already confirmed five-category/AI/VPS direction. The revised architecture is approved. The foundation milestone is now authorized; other purchases/deployments and educational feature work require their own scope.

## ADR-001 — One modular monolith with an incremental expansion path

**Status:** Revised architecture accepted by user on 15 October 2026; foundation execution authorized on 16 October 2026.

**Decision retained:** TypeScript/Next.js application, domain-owned use cases and adapter boundaries, PostgreSQL source of truth, pure evaluation/mastery and shared transactions where needed. Canonical modules remain Identity/Access, Students/Guardians, Curriculum, Methods, Content, Learning, Evaluation, Progress, Adaptive, AI Content and Reporting. A bounded job process uses the same application image; it is not a microservice.

**Original reasoning retained:** separate Fastify/Nest deployment and microservices add coordination/operational overhead; Django remains credible but introduces another language relative to the recommended React client. The original goal was maintainability, not eliminating useful domain abstractions.

**Consequences:** add schemas/routes only as a slice needs them; preserve interfaces for teacher/organization relationships, curriculum crosswalks, richer mastery strategies, scalable projections and worker separation. Thousands of students require measured scaling and governance, not a rewrite of educational logic. **Revisit deployment topology when:** concurrency, reliability or team ownership justifies it.

## ADR-002 — Self-hosted PostgreSQL and Prisma

**Status:** user-amended and approved on 20 October 2026. PostgreSQL runs on the existing `nexo-vps`; the former managed-database direction is superseded. The user authorized SSH inspection and continuing D02 against this arrangement. Keep the VPS clean and organized, following its existing application/data/backup separation.

**Decision:** dedicated PostgreSQL 17 Compose service for nexo; source/manifests in `/srv/apps/nexo-school`, private configuration and database files in `/srv/data/nexo-school/current`, backups in `/srv/backups/nexo-school/postgresql`. Mirror Auctus's organization, not its SQLite engine or credentials. Existing applications, networks, data and Caddy configuration remain isolated.

Use Prisma with the existing standard `pg` adapter, bounded connection pools, reviewed migrations, a non-owner runtime role and separate migration/backup roles. No public database port: loopback `127.0.0.1:15432` with SSH for administrative access; future application containers use a dedicated database network under a reviewed connection policy. Keep TLS verification for direct remote connections; do not relax the validator to permit arbitrary unencrypted remote hosts. D02's loopback synthetic API can use an explicitly authorized SSH tunnel without rewriting auth or scoring logic.

**Consequences:** the operator owns PostgreSQL patching, capacity, backups, restore and alerts. Daily same-host dumps are useful recovery points but do not protect against VPS loss; off-host encrypted recovery remains a launch gate. No managed-provider pricing, scale-to-zero or automatic recovery promise applies. Full hosted authentication and real-learner use still require their own gates. See the [VPS database runbook](../engineering/vps-postgresql.md).

**Alternatives retained:** changing the database host does not justify replacing Prisma, Better Auth or the modular monolith. SQLite remains the isolated authentication spike's engine; Auctus remains untouched.

## ADR-003 — Guardian-approved enrollment, independent passkey login

**Status:** Mechanism retained; user accepted the feasibility spike on 16 October 2026 based on the successful core tablet/guardian flow. Outstanding device evidence remains recorded.

**Previous proposal:** guardian launched every child session, with adult reauthentication after switching back. It minimized child credential management and shared-device escalation but imposed repeated daily friction. **Superseded as the ordinary login workflow.** Its separation of child/adult authority remains required.

**Recommended solution:** self-hosted Better Auth using its supported Prisma/passkey/2FA/session facilities. A guardian with recent MFA approves a short-lived enrollment for a specific student/browser; the child registers a passkey. Daily login requires both a valid passkey assertion with user verification and an active guardian-approved browser grant. Adults retain normal sessions on their own MacBook. The child neither needs a personal email nor guardian involvement each day.

**Suitable alternatives and tradeoffs:** platform passkeys are easiest on the known tablet if its OS/account supports them; a registered hardware WebAuthn key is a supported fallback if usable; remembered-browser/PIN-only login has unacceptable bearer/weak-secret risks as an independent credential; per-session guardian email links remain recovery/bootstrap only. See the architecture comparison and protocol for exact boundaries.

**Device distinction:** passkeys may sync across devices; they are not automatically hardware-bound. A new browser still requires guardian authorization. Browser-grant cookies are not remote attestation, and cookie theft is a residual risk. Revoke device registrations, credentials and active sessions explicitly, with no stale cookie-cache bypass. Credentials associated with student identities cannot be used for adult role elevation or account linking.

**Library alternatives:** retain self-hosted Better Auth and its supported Prisma/passkey/2FA/session integrations. A provider-managed auth service is not part of the self-hosting decision. Keycloak would add an unnecessary service; Auth.js would require a more assembled flow. No custom password store, WebAuthn cryptography or homegrown auth protocol.

**Feasibility gate before broader production implementation:** a disposable synthetic-data HTTPS spike must verify the complete Better Auth + guardian enrollment + browser grant + passkey + revoke/recover path on actual hardware. Mock tests are insufficient. Record failures and revisit D03 if supported integration points or usability fail; no PIN-only downgrade. The user has authorized this slice. The prototype, virtual-authenticator regression suite and public HTTPS smoke checks pass; the physical core Tab S9 Ultra/Chrome passkey flow and MacBook Chrome guardian flow succeeded as reported. The user accepted feasibility and skipped further Safari spike testing; unrun variants are not claimed as passed. See [findings](../../spikes/auth-feasibility/FINDINGS.md).

**Known-device gate:** Adam’s Samsung Tab S9 Ultra/Chrome for student; 16-inch M4 Pro MacBook with Chrome/Safari for guardian/admin. Verify OS/browser versions, lock/sync/shared-account settings, user verification, independent login, second-device enrollment, loss/recovery and revocation. The device models are confirmed, not remaining questions. Proposed defaults: child session max 12 hours, inactivity lock 30 minutes, browser registration 90 days, enrollment 10 minutes; guardian renewal/recovery never falls back to a child PIN. **Revisit when:** actual-device tests or supported-library capabilities require an equally secure alternative.

**20 October D02 local implementation:** the [local identity contract](../engineering/local-identity.md) applies the accepted mechanism to synthetic loopback PostgreSQL. One operator bootstrap, verified email, TOTP, single-use backup recovery, atomic revocation/audit and password reset preserving MFA use the pinned library. Local auth operations are serialized with a PostgreSQL advisory transaction lock; no service/stack change. Production delivery, owner recovery and hosting configuration remain gated; D03/D04 still own family authorization and supervised student passkeys.

## ADR-004 — Five categories over canonical, versioned skills

**19 October 2026 amendment — explicit user correction:** the five-peer navigation wording below is historical. Product subjects are Rekenen, Taal, Spelling and Begrijpend Lezen; Redactiesommen is a category within Rekenen. Adam's entry is today's assigned blocks, not a subject/category catalogue. Tasks must identify their category. The canonical Rekenen/wiskunde and Nederlands skill model, versioning, shared evidence and all existing exercise capabilities remain required. The category/skill/format integration in [the research note](../research/2026-10-19-curriculum-categories-and-daily-practice.md) is a proposal, not a new approved implementation.

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

**19 October synthetic implementation amendment:** occasional retention checks are accepted. The user authorized [automatic learning-path revision 1](../design/automatic-learning-path.md), implemented In Review inside the existing practice module. Pure deterministic evidence, route transition and dated assignment functions share in-memory snapshots with the approved screens; there is no service/schema/persistence change. Optional category-aware exercise titles preserve existing default contracts. The prototype's two-objective checks, workload cap and retention timings are versioned demonstration choices, not approved or calibrated production thresholds. This supersedes the implementation-pending statement below only for the bounded synthetic slice.

**19 October automatic-progression request:** automatic category assessment/assignment and ordered progression now replace the manual-only planning preference, with daily Redactiesommen as a parallel practice requirement. This does not validate a mastery threshold or convert retry scores to independent ability evidence. A deterministic, explainable route/evidence/assignment policy within guardian-set bounds is proposed in [the research note](../research/2026-10-19-automatic-progression.md); implementation and empirical calibration remain pending.

**Status:** Direction accepted; numeric thresholds/reading evidence rules await educational review.

**Decision retained:** pure versioned evaluators, explicit normalization/tolerances/partial credit, eligible first-attempt evidence, uncertainty, recency/diversity gates, deterministic next-session ranking and guardian overrides.

**17 October product refinement:** the user specified repeating weekly plans, batches of 10 (whole reading bundles for Begrijpend Lezen), deferred exact-question retries and a default session score of 1 / 0.5 / 0. This supersedes immediate hint/retry timing and resolves default session points, while retaining separate first-attempt mastery and reading assistance rules. See [weekly practice requirements](../product/weekly-practice.md). Requirements only; no educational runtime is implemented.

**18 October UI refinement:** retries now continue without an introduction or readiness screen, including a sole miss on the final question. Child results show solved-question counts without point arithmetic; weighted 1/0.5/0 scoring remains unchanged internally. See the amendments in the weekly-practice requirements. This changes the synthetic UX contract, not production data/auth or grading implementation.

**Original reasoning retained:** LLM grading is unnecessary for objective answers; raw accuracy confounds hints and repetitions; sophisticated ML is premature without calibrated items/data. Retaining a richer mastery interface does not require a complex model now.

**New implications:** bound evidence from automatically generated variants by template family. Aggregate correlated reading questions per skill/passage exposure and avoid revealing answers that leak into other first attempts. Passage reading time is counted once. These estimates remain provisional learning signals, not diagnoses or validated school grades. **Revisit when:** lawful data and calibrated items support an empirical comparison with more advanced models.

## ADR-007 — Required early AI generation with type-specific approval

**Status:** MVP inclusion and lane/certification architecture accepted; concrete certification evidence and release policy execution remain future work.

**Previous proposal:** optional post-MVP AI drafting, with human approval of every question version. This favored a tiny manual seed bank and outage isolation, but did not satisfy scalable content generation as a core product value. **Superseded:** the optional timing and blanket per-variation human-review requirement. Provider separation, validation, cost accounting and reusable content remain.

**New decision:** AI semantic generation enters milestone 1 alongside deterministic arithmetic generation. Routine numerical variations use seeded code with zero AI calls; do not spend model tokens simply to choose numbers. Lane A allows automatic publication of instances within a human-certified finite arithmetic template/renderer/validator contract after deterministic per-instance checks. Lane B requires human semantic review of language/word problems; Lane C reviews original passage/question bundles. Unsupported/unbounded output is rejected. Model-generated code or free-form wording cannot silently inherit a template certificate.

**17 October interview clarification:** use deterministic code or validated templates wherever they can produce suitable, correct educational content; use external AI only where generation needs it. AI remains required in the MVP, but not for every question. The user explicitly withdrew the temporary all-questions-via-AI request and reaffirmed this policy. Cost savings do not relax the existing validation/publication lanes. Carrying unfinished work forward must reuse the exact assigned question versions and saved progress, without regenerating them through either code or AI. Generation timing, inventory targets and replenishment budgets still need a concrete plan before implementation.

**Consequences:** certify safe families once, not each numerical permutation. Independent answer verification, finite-space tests, exact hashes, sample audits, revocation/quarantine and correction workflows are mandatory. B/C still need reviewer capacity; batch/bundle review and reuse reduce authoring cost without pretending semantics are proven by another model. Inventory replenishment occurs before demand; no ordinary submission waits on AI.

**Provider choice:** retain an application-owned port and initially one Anthropic adapter, with model selected from Dutch gold-set quality, terms and cost. The model is chosen during the early AI slice, not deferred until after MVP. A second provider and live tutor are later options. **Revisit semantic auto-approval through:** subtype-specific shadow validators, expert-labelled family-separated holdouts, severity-based false-approval/confidence criteria, measured abstention/review savings/cost, then explicit narrow policy approval. Initial human semantic review is a release policy, not a permanent architecture constraint. Model confidence or agreement alone cannot authorize promotion; sampling, drift checks and rollback remain required.

**22 October provider research amendment:** the user requested a comparison across providers and models for task creation and review, including separate generators by content type. This authorizes reconsidering the initial Anthropic preference; it does not select a replacement or authorize live spending. The [D13 model research](../research/2026-10-22-d13-model-comparison.md) proposes a bounded eight-model cross-provider experiment with separate generation/review evaluation. Preserve the application-owned port, deterministic arithmetic, human semantic review and shared budget; select actual providers from measured Dutch results and applicable terms. No live adapter is implemented by this research.

**22 October reviewer selection:** after the seven-model expanded screen, the user explicitly selected **Claude Haiku (`claude-haiku-5-5`) as the AI content reviewer**. This approves the reviewer model choice; it does not turn AI-assisted reference judgments into independent human approval or authorize semantic auto-publication. The [screen results](../engineering/d13-expanded-benchmark.md) remain provisional evidence with unresolved reference interpretations. Generator selection remains separate and may vary by content type. Production workflow integration remains later implementation; frozen multi-model benchmark manifests stay unchanged.

**22 October generator-screen evidence:** the user authorized a small four-model comparison with Haiku review. [The completed screen](../engineering/d13-generator-benchmark.md) produced 31 complete drafts from 32 generation attempts, then 31 Haiku reviews, for €0.185643 conservative cost in the existing ledger. Luna is recommended provisionally for constrained Spelling, word problems and short reading; no production generator has been selected or wired. The experiment exposed instruction/private-rubric ambiguity and missed defects despite Haiku clear judgments. Preserve separate learner instructions, private keys/marking guidance, deterministic checks and human publication gates in subsequent implementation. Same-model review and post-run AI inspection are not independent human validation.

**23 October user selection and scalability amendment:** the user approves **GPT-6 Luna as provisional default generator** and **Claude Haiku 5.5 as first-pass reviewer**, with deterministic TypeScript preferred for routine/constrained variants. This supersedes the recommendation-only and initial Anthropic-only wording above. Keep the provider port; no production routing or new paid call is implied. Target 50–200 daily exercises with 15–30 minutes/week ongoing review through certified families, reviewed word banks, structured independently checked word problems and reusable semantic/reading batches. Independent practice/assessment/retention stock, exposure clustering, objective-based replenishment, measured review time and D15 quarantine remain required. Haiku clear cannot grant publication authority. The [bounded v2 contract repair and operating scenarios](../engineering/scalable-content-supply.md) separate implemented checks from planned supply automation. New v2 payloads separate learner content from private evaluation and pin mechanical rules to immutable rubrics; D10 approval/publication rechecks those rules. Original D13 benchmarks and human judgments remain unchanged. No further paid experiments without explicit authorization; €10/month includes all AI use.

**23 October D14 assignment:** the user approved the v2 content-contract slice and assigned the first local synthetic batch-review UI. [D14's bounded implementation](../engineering/d14-batch-review.md) reuses the D10 transaction, fresh-MFA operator authority and immutable version checks, adding exact-current selection, saved cursor and active-time telemetry. Its example advisory findings are synthetic and become stale on edits; no provider call or independent human reference certification is implied. UI/workflow acceptance remains separate from the approved prerequisite contract.

**22 October D10 implementation note:** local synthetic [coverage/publication records](../engineering/content-records.md) implement immutable rubric/content versions and exact-hash human review/publication with transactional audit. The bootstrap operator's fresh MFA is the bounded local authority; no public authoring route or general guardian permission is introduced. Requirements rows remain unmapped coverage, not approved SkillRevisions. D05's existing seed stays separate; deterministic certification, semantic review UI, withdrawal and production educational decision use remain later gates. No automatic lane or live provider is enabled.

**22 October D11 preparation note:** the [bounded digit-addition package](../engineering/deterministic-addition-family.md) verifies all 100 instances with an independent solver and pins specification/inventory hashes. All variants remain one family, with commuted-pair exposure grouping. Educational certification is pending and automatic publication stays disabled. This is technical preparation for ADR-007's certified lane, not an authority bypass or an approved production skill mapping.

**22 October D13 preparation note:** the [review benchmark](../engineering/review-benchmark.md) adds concealed-key solve and semantic-review stages using D12 review jobs, exact-content responses and per-profile all-attempt accounting. Agent-labelled development fixtures and deliberately imperfect fake controls validate plumbing only. Human reference adjudication, unseen holdout and separately authorized real-model/pricing verification remain required; no publication or assessment authority changes.

## ADR-008 — Required durable jobs, bounded execution and simple reporting

**Status:** Incremental architecture accepted; the foundation milestone is authorized; AI job implementation remains a later slice.

**Previous proposal:** add jobs only if optional AI arrived. **Revised:** durable generation jobs are required from the first AI slice. Short learning transactions still update small mastery projections synchronously.

**Decision:** PostgreSQL leases/idempotency and bounded same-image job execution scheduled on the existing VPS. No constant queue polling, Redis or broker. Provider calls occur outside database transactions. Exit when the burst is finished; retry abandoned leases at the next scheduled window. Track failures and conservative spend reservations.

**Consequences:** visible batching delay is acceptable for stock replenishment; bounded execution controls shared-VPS resource use. One job at a time limits resource contention with learning/other apps. Worker separation/outbox/read-model interfaces remain designed for later scaling. **Revisit when:** measured job volume/latency requires a dedicated worker or projections become expensive.

**22 October D12 implementation note:** [durable generation and spend ledger](../engineering/generation-jobs.md) implements local synthetic PostgreSQL leases, idempotent requests, three-attempt retries and a bounded same-image burst using a fake-only provider port. Short transactions reserve integer micro-euros across generation/review/feedback under one UTC-month cap (maximum €10); uncertain calls retain their reservation. Provider calls stay outside transactions and stale completion is fenced. No live pricing, provider spend, publication, installed scheduler or VPS migration is enabled. Initial monthly cap configuration is immutable; production pricing/FX bounds and uncertain-cost reconciliation remain live-adapter gates.

## ADR-009 — Shared, responsive frontend foundations

**Status:** Architectural direction retained; responsive devices clarified by user.

**Decision:** design tokens, accessible primitives, typed question renderers and local exercise reducer; server data stays authoritative. Reading-set presentation is a composition of shared exercise components. Responsive desktop/tablet/mobile; prioritize Tab S9 Ultra/Chrome and MacBook Chrome/Safari tests.

**Reasoning retained:** separate subject apps duplicate educational/accessibility rules; Redux/design-system package is unnecessary without a real coordination need. The previous optional Storybook decision is superseded by the user's 16 October engineering protocol: Storybook is mandatory for meaningful shared UI, with revision-specific component approval and shared application styles. Product branding still needs explicit review. No final screens or components are created in this planning phase.

## ADR-010 — Reuse existing Hetzner Docker/Caddy with verified capacity

**Status:** Infrastructure reuse accepted; detailed resource/isolation and recovery plan proposed.

**Previous proposal:** Vercel + Supabase and a €60/month infrastructure allowance traded money for managed operations. The user already owns suitable candidate infrastructure and explicitly rejected that plan. **Superseded.**

**Known facts supplied by user:** CPX22 `nexo-vps`, 2 vCPU/4 GB RAM, approximately 2.5 GiB available; 80 GB SSD/approximately 51 GB free (30% used); Ubuntu 26.04 LTS; Docker/Caddy; nine containers approximately 177 MiB combined, sampled CPU 1–4%; swap 2 GiB/368 MiB used. Auctus, Minecraft relay, Student Planner, Word Atlas and Portfolio share the host. These 13 October measurements support a pilot recommendation, not a concurrency guarantee.

**Decision:** dedicated Compose app/network/credentials with non-root execution and resource limits; reuse Caddy vhost/certificates, build images off-host, external AI APIs, dedicated self-hosted PostgreSQL. A systemd-managed Node process is viable but less aligned with the already established Docker host. Do not introduce another deployment platform/proxy or host models locally.

**Consequences:** protect existing workloads, measure simultaneous learning/job/backup load, check swap/OOM/latency, maintain kernel/container dependencies and restrict Docker access. Shared kernel/root compromise remains a risk; use a separate host if current co-hosts cannot be trusted or isolated. Runtime statelessness and durable DB jobs permit later separation without redesigning domains.

**Recovery proposal:** daily encrypted PostgreSQL logical dumps plus app/config/secrets recovery material off-host; 30-day maximum backup retention, independently held recovery keys and deletion/revocation ledger; private-pilot RPO 24 hours/RTO one working day subject to approval. A same-host dump or VPS snapshot alone is insufficient. Restore before real data and quarterly, invalidating stale auth state. **Revisit when:** recovery objectives or workload exceed this shared-host approach.

## Cost decisions

The original fixed €60 infrastructure allocation is withdrawn. Existing VPS/domain reuse adds no new rental if measured capacity suffices. Self-hosting removes a separate managed-database bill but consumes shared disk/RAM/CPU and operator time. Backup destinations, email and monitoring need explicit choices/spend authorization; no replacement vendor price is invented. The current approved AI planning ceiling is €10/month maximum across features, preferably lower; paid evaluation/seeding still requires separate authorization.

User approval is still needed for concrete spending limits, backup destination, AI seed cap and recovery/retention expectations. Do not cut backups or access controls to hit zero cost. For thousands of learners, approve a measured capacity/database/storage and operational model rather than extrapolating the private-pilot envelope.

## Remaining risks and owners

| Risk                                            | Mitigation / owner                                                                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invalid automated publication                   | Technical owner certifies finite template/independent solver; educational reviewer approves wording/skills; operator can revoke whole family immediately.                                          |
| Semantic/reading review bottleneck              | Measure review time and demand; use deterministic generation for numerical variants, batch/bundle reuse and a held-out-evaluated shadow-validation path toward narrow automated semantic approval. |
| Passkey/browser mismatch                        | Test known Android/Mac hardware and real OS/account configuration; approved hardware-key fallback; never downgrade to PIN-only auth.                                                               |
| Synced credential mistaken for device binding   | Browser grant plus credential checks; guardian revocation; communicate limits and maintain XSS/session protections.                                                                                |
| Shared VPS contention or compromise             | Resource limits, maintained co-hosts, restricted credentials, off-host builds and realistic load test; operator owns patching/recovery.                                                            |
| Self-hosted database capacity/recovery          | Bound CPU/RAM/connections, monitor disk, patch deliberately, verify off-host restore and alert before exhaustion.                                                                                  |
| Restored data reactivates revoked access        | External revocation/deletion ledger and mandatory session/token invalidation during restore.                                                                                                       |
| Unknown publisher alignment                     | Guardian supplies exact editions/current units; reviewer verifies; until then labels stay guardian-described.                                                                                      |
| Misleading reading or template mastery          | Family clustering, diversity/date gates, assistance and version tracking; educator validates thresholds.                                                                                           |
| School expansion inherits household assumptions | Separate institutional access/privacy/contract milestone; preserve organization/module seams now.                                                                                                  |

## Current implementation boundary

The revised architecture is approved. On 16 October the user accepted the isolated authentication spike and authorized the foundation milestone: repository instructions, approved stack setup, quality checks and Storybook. Preserve the spike and its test evidence; this acceptance does not claim all device checks passed. Production auth/supervision, educational domains, live AI calls, database provisioning and new deployment are later slices. See the [spike findings](../../spikes/auth-feasibility/FINDINGS.md) and [physical-device checklist](../../spikes/auth-feasibility/DEVICE-TESTS.md).

## ADR-011 — Foundation toolchain and review workflow

**Status:** Implemented within the foundation milestone authorized on 16 October 2026; product brand and shared-component contracts remain unapproved.

**Decision:** one root npm package with pinned Node 24 LTS, Next.js/React/TypeScript and standalone container output. Preserve the auth spike's separate package boundary. Prepare Prisma/PostgreSQL using the standard `pg` adapter (bounded application pools at runtime, separate migration credentials); generation/build does not need live credentials or create domain tables. Better Auth/passkey packages remain pinned to the spike-tested release; production auth endpoints and schema are deliberately not exposed by this foundation.

**Tooling:** ESLint/Prettier, Vitest, Playwright and mandatory Storybook Next.js/Vite with axe and interaction tests. Prefer familiar maintained tools over custom test frameworks or a monorepo task runner. No Tailwind/component framework, separate service, paid visual-test service or component catalogue is introduced. Provisional system-color styles allow verification while brand direction remains undecided.

**Consequences:** add quality checks to local scripts and GitHub Actions, keep production dependencies subject to audit, explicitly triage development findings, and review visual baselines before enabling image comparisons in CI. Component approval records name immutable revisions and actual user approval. See [tooling risk record](../engineering/tooling-risks.md) for the version-checked upstream Storybook backport, ESLint peer constraints and unpatched development advisory. Revisit those exceptions on dependency updates, not by changing the approved stack.

**Primary references inspected:** [Next installation](https://nextjs.org/docs/app/getting-started/installation), [server/client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Storybook Next.js/Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite), [Storybook browser testing](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index), [Prisma generation](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client), [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma). Registry peer ranges and installed code were checked on 16 October; pinned versions and lockfile are the executable source.

## ADR-012 — Versioned evidence policy and provisional advancement

**Status:** 20 October 2026 synthetic implementation authorized, **In Review**. Extends ADR-004/005/006, preserving their canonical curriculum, immutable facts and replaceable projection boundaries. [Policy v1](../product/assessment-policy.md) is the single assessment contract; [research/alternatives](../research/2026-10-20-assessment-architecture.md) records the decision rationale.

Use a pure practice-owned evaluator over versioned evidence and mandatory skill blueprints. Scoring remains in its existing subject adapter. The route owns task snapshots and recorded decision projections; generic shared components own no educational rules. The adapter uses explicit synthetic skill/release IDs until a reviewed production catalogue exists. A future model can replace the projection while retaining source attempts/content/evaluation versions; corrections append revisions and invalidate/rebuild dependent projections in the future production model.

The rule strategy is chosen over uncalibrated BKT/IRT because its exclusions, coverage and missing facets are inspectable without invented probabilities. It requires distinct evidence types per mandatory skill, treats repeated templates/passage clusters conservatively, separates missing evidence from errors, and allows only provisional progression. Unavailable content blocks the affected route. Retention and focused recovery coexist with ordered per-subject routes and daily Redactiesommen. Guardian holds/resumes alter future issuance, never evidence. See the policy for state transitions and all numeric heuristics; no duplicate threshold table is maintained here.

**Consequences:** current Taal recognition content can no longer advance a category. This is a deliberate safety correction to unapproved revision 2, not a regression to conceal. Full educational validity, independent content review, real-data calibration, production persistence and the remaining subject routes are not delivered. Existing approved screens, retries, exact Nexai content, tokens, stack and infrastructure remain in force.

**20 October preparation evidence:** the assigned [bounded blueprint/reviewer package](../research/assessment-validation/blueprint.md) reuses this evaluator and the existing numerical scorer in offline synthetic tooling. Proposed skill/release mappings and prerequisite edges stay draft; no production IDs, migration, new assessment engine or architectural decision is introduced. [Executed outcomes](../research/assessment-validation/executed-report.md) retain false-advancement controls, content gaps and separate educational validation.

## ADR-013 — Bounded reusable inventory before broad review expansion

**23 October 2026 — user-authorized implementation direction; D14-S1 delivered technical/UI scope subsequently approved.** The user rejects reviewing hundreds of questions weekly and assigned one-category reusable supply first. Keep this inside the existing content module and PostgreSQL transaction boundary: finite deterministic catalogue, exact published-bank reuse, versioned weekly workload policy, immutable admission/reservation history and visible shortages. Reuse the D14 exact-version human-review controls; introduce no service, provider call or family auto-approval.

The first slice handles only D11 digit-addition Optellen: eight initial drafts plus correction headroom inside ten new versions/15 estimated minutes per Amsterdam week. Earlier pending work and measured activity reduce admission capacity. Commuted operands share a group; 14-day synthetic reservation exclusion is a provisional rehearsal rule, not validated learning evidence. Reused bank versions require no repeated content approval. Current-week reservations remain pinned through later edits; future weeks use the latest eligible reviewed version.

This trades automatic volume for bounded work and explicit shortages. It cannot yet satisfy full-category or 600/week demand, certify a family, prove the global review-time target or allocate to a real child. D15 quarantine, D25 actual learner exposure/assignment and independent educational certification remain release dependencies. [Contract, testing and handoff](../engineering/d14-reusable-supply.md).

### ADR-013 extension — D14-S2 exact-package family judgments

23 October 2026: the user approved D14-S1's delivered workflow and assigned Optellen family certification next. Use a bounded seven-example/four-criterion package, resumable optimistic drafts and immutable decisions with exact contract/inventory/source/package fingerprints. Keep guardian feedback and AI-assisted assessments distinct from independent educator sign-off; role/expertise are explicit self-declarations, not verified credentials. A negative/uncertain finding may stop review early; positive certification requires the full bounded review. Reuse the existing authenticated operator and timing controls, with upfront family effort separate from weekly admissions. This records judgments without granting publication authority; D15 quarantine and the certified-supply/assignment adapters remain open. [Contract and review sheet](../engineering/d14-family-certification.md).

### ADR-013 extension — Shared content lifecycle

**23 October 2026 — principle explicitly required by the user; incremental implementation pending.** Generation, validation, certification, review and publication share infrastructure across every category and subject. The content module owns immutable versions, job/spend accounting, mechanical validation orchestration, review provenance and drafts, certification records, publication eligibility, audit and workload measurement. Subject-owned extensions supply generators, templates, word banks, question families, response evaluators, educational rules and review examples. Shared lifecycle does not mean identical subject rules or automatic approval.

Reuse the existing records, review UI, authorization, timer and publication boundary. Make the current fixed Optellen package a versioned descriptor resolved and validated by a server-side adapter. Criteria/examples and source/inventory evidence belong to that package; authenticated decision authority and immutable history stay common. Extend validators for each concrete content type without weakening earlier blockers. Introduce only the abstractions needed by the next real family; keep the modular monolith and current tables where their contracts fit. Do not fork a certification/review/publication system per category.

Inspect existing generators, authored examples, representations and tests before adding a family. Preserve approved presentation and historical content; changes create new versions and review packages. Reuse previous decisions only within their exact unchanged scope, displaying changes and remaining judgments explicitly. Ordinary-practice approval remains separate from independent educational certification and from the stronger evidence policy for advancement/skipping in ADR-012. A stock cooldown is never an evidence-validity rule.

**Immediate consequence:** the user approved the single-digit format/practice scope, requested better explanations, and asked for an inspection before larger-addition implementation. The existing synthetic numerical bank and Rekenen worked steps are reusable, but their coverage is not a certified two-digit family. [Source audit, proposed extensions and review workload](../../tasks/d14-addition-reuse-handoff.md). D14 shared workflow work, D16 bounded arithmetic coverage, D15 correction and D25 actual allocation retain their roadmap responsibilities.

### ADR-013 implementation — versioned reusable families

23 October 2026: the user's four-phase assignment delivers the small shared descriptor/resolver in the existing family workflow, with actual single-digit teaching and bounded two-digit adapters. Package-owned examples/criteria/source attestations reuse existing draft/decision/timer/auth records. The v1 package is retained as historical evidence; new packages receive distinct hashes and no inherited certification. No plugin framework, service, schema or publication authority was added. [Implementation and evidence](../engineering/reusable-addition-families.md).

ADR-012's evaluator remains unchanged. Separate D30 preparation reads authenticated persisted attempts into a reproducible server-only shadow report; missing purpose/assistance/exposure/review state excludes current D05 practice. It performs no progression writes or real learner trial, and keeps D15/D24/D25/D29–D31 activation gates.

### ADR-013 implementation — bounded non-arithmetic bank

24 October 2026: D21-P1 adds a closed, source-checked Spelling bank through the same family descriptor, content payload/rubric, authenticated review commands, immutable decisions and explicit local publication. Subject rules run at the shared records boundary; edited bank content cannot bypass mechanical blockers through another endpoint. Existing Spelling UI/retry/Nexai is reused. No new service or schema. Frozen addition packages remain byte-for-byte intact; an exact package/source-hash compatibility record attests only the shared resolver registration change. It neither transfers educational approval nor permits future drift. [Implementation, sources, review and limitations](../engineering/reusable-spelling-family.md). Larger autonomous batches and the daily-practice dependency sequence are recorded in the existing roadmap; D15/D24/D25 and D29–D31 gates remain.

### ADR-013 implementation — saved eligible stock and withdrawal

24 October 2026, user-authorized D14-S4/D15 local synthetic assignment. One content-owned eligibility projection connects exact D10 publications to existing D05 immutable membership; subject adapters own metadata/evaluation formats, and missing metadata blocks delivery. Assignment stores the exact content/hash reference plus family/exposure/practice purpose, reusing pinned rubric versions and the existing scorer/presentation. No second assignment database or educational approval lane is introduced.

Append-only withdrawal/correction records invalidate future issuance and current use without rewriting attempts or scores. Affected unfinished tasks pause; completed results are visibly affected and unusable as evidence. PostgreSQL locks/guards serialize issuance, submissions and withdrawal, with atomic audit and retry identity. A separately reviewed replacement can be linked but cannot silently replace historical work. The existing shadow evaluator remains disabled and unchanged; its source reader applies current withdrawal to historical cutoffs. [Policy, source paths, rehearsal and limits](../engineering/eligible-content-and-withdrawal.md). Full D14 certification/supply, D24/D25 scheduling and D29–D31 decision use remain separate.

### ADR-013 implementation — D14-S5 finite saved formats

29 October 2026, user-assigned local synthetic rehearsal. Reuse the shared content lifecycle for two fixed Taal words, two original addition word problems and one original reading question/passage. Exact subject adapters, public context projection and finite server graders extend existing assignment/submission/results, with no new service or assessment policy. Reading allows one question per passage exposure in this slice; it does not claim a general reveal-dependency engine. A non-destructive migration extends the existing attempt evaluator constraint. Source-bound Spelling workflow package v3 records the shared workflow extension without inheriting earlier family judgments or changing the Spelling inventory. [Contract and verification limits](../engineering/saved-multisubject-rehearsal.md).
