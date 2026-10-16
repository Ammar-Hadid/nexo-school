# nexo School — MVP scope and delivery plan

Date: 16 October 2026 · Revision 5 · **Auth spike accepted; foundation milestone authorized**

Read with the [architecture](../architecture/initial-architecture.md) and [decision register](../architecture/decisions.md). This replaces the original four-category, post-MVP-AI roadmap. Only the isolated authentication spike has begun. Its automated checks pass; physical-device acceptance remains open.

## Product outcome and confirmed scope

A child independently signs in on an approved device, starts assigned or guardian-approved practice, receives reliable feedback and accumulates reproducible learning evidence. A guardian controls devices/plans and sees explainable progress. **AI-powered exercise generation is an essential MVP capability across all five categories: Rekenen, Redactiesommen, Taal, Spelling and Begrijpend Lezen.** Live tutoring is optional later.

Retain the approved modular monolith, canonical curriculum, publisher/version mappings, immutable learning history, derived mastery, provider independence, resource authorization and ambitious expansion path. Introduce the architecture incrementally; do not collapse it into unrelated subject-specific features or implement all future modules in the first phase.

The initial learner is eight, groep 5, using a **Samsung Tab S9 Ultra with Chrome**. Guardian/admin uses a **16-inch M4 Pro MacBook**. Responsive desktop/tablet/mobile behavior and Chrome/Safari compatibility are required. The 80–120 questions/day example informs throughput and inventory, never a compulsory learning target. Actual topic coverage remains bounded and visible.

## Existing infrastructure baseline

Use the user's **Hetzner CPX22 (`nexo-vps`)**, existing **Docker and Caddy**, and available subdomain. Reported on 13 October: 2 vCPU, 4 GB RAM, approximately 2.5 GiB available; 80 GB SSD, approximately 51 GB free (30% used); Ubuntu 26.04 LTS; CPU approximately 1–4%; nine containers approximately 177 MiB combined memory; 2 GiB swap with approximately 368 MiB used. Other workloads: Auctus frontend/backend, Minecraft relay, Student Planner, Word Atlas frontend/backend, Portfolio frontend/backend and Caddy.

These are accepted user-supplied measurements, not a load test performed here. Reserve bounded nexo app/job resources and test contention with those applications. Use external AI APIs; host no large models. Neon PostgreSQL in Frankfurt starts on Free only if quota, cold-start and recovery tradeoffs are acceptable, then moves to measured usage pricing. Build off-host and reuse Caddy without replacing other sites.

Remaining operational gates are peak concurrent load, isolation/patch settings, VPS EU location, exact DNS/passkey origin, off-host backup/SMTP/independent-alert availability, and real-device passkey behavior. The VPS model/specs, proxy and device models are no longer unknown.

## Required now, designed now, and optional later

| Capability | Required MVP implementation | Design boundary retained now; implementation later | Optional post-MVP enhancement |
|---|---|---|---|
| Identity and supervision | Better Auth proposal; adult 2FA; student passkeys + guardian-approved browser grants; independent login, multiple-device enrollment, revoke/recover; no child email | Teacher relationships, organization membership and resource-scoped authority | Institutional SSO, refined recovery UX |
| Curriculum | Limited groep-5 skills for five categories; objectives, prerequisites, releases, difficulty rubrics | Version crosswalks, wider grade/publisher mappings, large-scale catalog governance | Bulk mapping/import tools |
| School Mode | Guardian-selected current skills; exact-edition verified mappings only when available | More methods/editions; alignment history | Publisher/school integrations |
| Growth Mode | Explainable evidence-driven selection, review and modest difficulty progression; guardian plan bounds | Model/policy version interfaces and richer evidence projections | Calibrated knowledge tracing after validation |
| Content/AI | Real provider adapter, structured generation, durable jobs, costs/failures, reusable published bank, template certification, human semantic review, reading-bundle generation | More certified families and validator policies; provider replaceability | Second provider, richer CMS, live tutor |
| Exercises | Numerical, choice, finite text, blanks, multi-step and passage-linked question sets; deterministic grading | Renderer/evaluator contracts for new formats | Speech, handwriting, native interactions |
| Historical records | Pinned assignments/content/passages, immutable attempts and evaluation revisions; reproducible projections | Outbox and scalable projection/read-model seams | Advanced longitudinal visualizations |
| Operations/privacy | Existing VPS Docker/Caddy, Neon, encryption, HTTPS, backup/restore, data export/deletion, access audit, quotas and resource limits | Multi-instance deployment/worker separation and institutional governance | Managed monitoring, read replicas or separate hosts when justified |

“Designed now” does not mean creating unused services or all tables immediately. Conversely, deferring deployment of a module is not permission to remove its public boundary or mix educational rules into UI/provider code.

## Content acceptance and validation lanes

Proposed starting curriculum envelope: **3–5 narrowly defined skills per category**, with shared canonical skills where categories overlap. The full list of comprehension skills is modelled (main idea, details, conclusions, cause/effect, interpretation, vocabulary in context, author purpose and inference); initial published coverage is explicitly selected by the reviewer. A fixed small skill scope does not imply a fixed small manually authored question bank.

- **Lane A:** humans certify a bounded arithmetic template/renderer/independent validator once. Seeded deterministic code chooses numerical parameters, renders fixed wording and automatically approves independently checked instances, with no AI calls. AI is reserved for meaningful new content/family drafting, not routine number selection. Exhaustively verify initial finite parameter domains; reject unknown templates/free text. No manual approval per numerical variation.
- **Lane B:** AI drafts language, spelling and free-form word-problem content. Automated checks reduce defects and review effort; a human approves exact question/key/rationale hashes in MVP. Numerical checking alone cannot prove story semantics.
- **Lane C:** AI drafts original passage/question bundles. A human reviews reading demand, text grounding, answerability, inference ambiguity, distractors, rights and exact bundle versions. One passage can supply several exercises without claiming those are independent demonstrations of mastery.

Maintain approved inventory by skill/band/category, replenish ahead of demand and reuse spaced content. Track review minutes and usable family diversity; 500 numerical variants are not 500 distinct concepts. A 3–7-day buffer is a proposed operating target, conditional on actual category mix and reviewer capacity. No live student request bypasses approval when inventory is low.

A school label stays guardian-described until an exact Malmberg method/edition/unit mapping is verified. No copied publisher pages, unauthorized paraphrases or invented licensed provenance. Human review of semantic content remains real work; scalable generation reduces authoring effort, not all educational accountability.

## Ordered vertical slices

Future paths name work areas only. No code, migrations, dependencies or deployment configuration are created by this plan. Each slice adds the minimum schema/API/UI/tests needed for its outcome; split an oversized slice into focused tasks before coding. Synthetic fixtures and fake-provider tests run first; real child data waits for release safeguards.

### 0. Approve the revision and prepare verification inputs

- [x] User approved the revised architecture and authorized the isolated synthetic authentication spike.
- [ ] Name the educational reviewer and settle concrete initial topics, spending caps and recovery operations before later slices.
- [ ] Record exact subdomain, SMTP/off-host backup choices and operator; schedule shared-host load and device checks using the known hardware.
- [ ] Define one original finite arithmetic family with gold cases, plus a sample semantic question and reading bundle to shape contracts early.

**Dependencies:** none. **Verification:** documented decisions and educational review, not application work. **Areas:** planning and content specifications. **Outcome:** implementation can begin against approved boundaries.

### 0A. Prove authentication on Adam’s actual devices

**Accepted by the user on 16 October 2026 after the successful core tablet/guardian flow.** Safari was explicitly skipped; see the device record for partial/unrun checks. This is acceptance to proceed, not a claim that all checklist items passed. The foundation milestone (instructions, approved stack, quality checks, mandatory Storybook) is authorized before 1A/1B. Use a small disposable HTTPS prototype, synthetic identities and the selected Better Auth release before investing in production auth schemas or extensive UI.

- [ ] Adam’s Tab S9 Ultra/Chrome registers a passkey after guardian approval from the MacBook, then signs in independently after closing/reopening the browser; verify actual user-verification, sync/account settings and grant persistence. Test MacBook Chrome/Safari too.
- [x] Prove enrollment expiry/replay protection, unapproved-browser denial with a copied virtual credential, immediate browser/credential/session revocation, child recovery and child-to-adult isolation through real library handlers in automated Chromium tests.
- [ ] Repeat the critical enrollment, revoke/recover and independent-login flows on the physical devices.
- [ ] Record results/version matrix and a pass/fail decision. If platform passkeys or supported enrollment hooks fail, test a maintained equally secure fallback and revise D03 before continuing; never silently substitute PIN-only authentication.

**Evidence:** [spike findings](../../spikes/auth-feasibility/FINDINGS.md) and [device record](../../spikes/auth-feasibility/DEVICE-TESTS.md). Temporary origin: `https://auth-test.ammarhadid.com`; synthetic accounts only.

**Dependencies:** architecture approval and explicit spike authorization received; unrelated curriculum/AI preparation remains for later work. **Verification:** real-device evidence plus targeted adversarial tests; mocks alone cannot pass. **Outcome:** retain or replace the proposed auth mechanism based on evidence. Keep only a short findings record; production origin requires re-enrollment/retest if it differs from the prototype origin. No real learner records are needed.

### 1A. Guardian sees a supervised learner on the approved runtime

- [ ] Establish minimal Next.js/Prisma/Neon and Better Auth application; guardian signs in with 2FA and sees one synthetic student.
- [ ] Two unrelated-family fixtures demonstrate resource isolation; student identities cannot receive adult roles. No browser database access.
- [ ] Host the synthetic slice with existing Docker/Caddy, HTTPS and limits; build off-host, confirm other vhosts remain intact, and establish a first encrypted backup/restore check.

**Dependencies:** further user implementation authorization, plus 0A passed or an alternative approved. **Verification:** auth/API isolation and one browser flow; warm/cold Neon connection check; Caddy routing and restoration smoke test. **Areas:** identity/students, first migration/route, CI/runtime setup and tests. Split runtime setup into its own short task if necessary.

### 1B. Child signs in independently after one-time enrollment

- [ ] Guardian on MacBook approves expiring enrollment from Tab S9 Ultra/Chrome; child registers a passkey and an approved browser grant, then logs in without guardian launch.
- [ ] Second browser/device approval, missing/expired grant, replay, lost-device revocation and guardian-led recovery work; synced passkey alone cannot authorize an unapproved browser.
- [ ] Child cannot use adult roles, account linking, email/password recovery or registration bypasses; shared-browser transition clears adult authority.

**Dependencies:** 1A. **Verification:** real Android Chrome and MacBook Chrome/Safari compatibility; library-handler authorization tests; revoke active session and credential cases. **Areas:** auth adapter/enrollment policy, device management and tests. If supported library hooks cannot enforce the policy, resolve that design before expanding it.

### 1C. Generate economical arithmetic and real AI semantic content

- [ ] Generate/validate a substantial certified arithmetic batch (target 500 instances) deterministically, with zero provider calls and policy approval instead of 500 manual clicks; report duplicate/family counts.
- [ ] Introduce the real AI port/adapter and durable jobs now for a small original semantic question set, with a minimal exact-hash human review path before publication. AI generation remains essential to this milestone; deterministic arithmetic alone does not satisfy it.
- [ ] Both paths share content/version/publication contracts. Enforce certification, independent checks, provenance, AI budget reservations and failures; semantic output cannot claim automatic approval.

**Dependencies:** 1A and reviewed family/specifications from 0. **Verification:** finite-domain/gold tests; assert zero provider invocations for routine numerical variants; replay/lease/budget cases and one bounded live semantic-generation evaluation. **Areas:** generation strategies, AI adapter/jobs, validation/publisher and minimal review. Implement these as focused sub-slices; 2B expands semantic review UX and throughput reporting.

### 1D. Student completes AI-assisted work; guardian sees preserved evidence

- [ ] Guardian selects both deterministically generated arithmetic and reviewed AI-generated work or defines a constrained plan; independently signed-in child starts a short set.
- [ ] Server evaluates and commits pinned attempts atomically; duplicate/conflicting submissions preserve one factual result per genuine submission.
- [ ] Guardian sees the persisted result; keys remain protected and the flow still works while AI access is disabled after inventory creation.

**Dependencies:** 1B–1C. **Verification:** end-to-end generation → publication → assignment → independent login → answer → guardian report; concurrency and payload-leak tests. **Areas:** learning/evaluation, student runner, guardian result view and tests.

**Milestone 1 checkpoint:** a complete AI-content and learning loop exists on the intended runtime. A manually authored arithmetic demo alone does not satisfy this milestone. No need to create every future curriculum/school module yet.

### 2A. Student resumes work; guardian understands mastery

- [ ] Pause/resume, skips, retry/hint policy and network-safe resubmission preserve history and assistance.
- [ ] First-attempt mastery v1 shows sample/diversity/difficulty uncertainty and review-due status; repeated template variations cannot inflate mastery.
- [ ] Appended corrections rebuild projections consistently and retain original evidence.

**Dependencies:** 1D. **Verification:** fixed timelines, concurrent/resumed session cases and browser interruption tests. **Areas:** learning lifecycle, progress projection, report and tests.

### 2B. Administrator scales the semantic review workflow

- [ ] Expand the minimal exact-hash review path with batch/bundle tools and rights/provenance inspection; AI cannot choose its own automatic lane.
- [ ] Review includes prompt/key/explanation/skill/difficulty; edits invalidate approval; withdrawal identifies dependent work.
- [ ] Scheduled inventory replenishment, spend/review metrics and low-stock messages work without idle DB polling.

**Dependencies:** 1C–1D. **Verification:** lane-spoofing, changed-hash, policy-revocation and review/publication browser tests; observe DB idle behavior. **Areas:** semantic validation/review UI, inventory queries and tests.

**Checkpoint:** automated numeric and human semantic approval are both functioning before the remaining subjects are expanded. Review quality and cost per usable item, not simply generated item count.

### 3A. Taal exercises and lessons use shared contracts

- [ ] AI-generated multiple-choice/finite-text Taal sets pass semantic review, with versioned accepted-answer policies.
- [ ] An original lesson/example and ordered practice use the shared assignment/evaluation/evidence flow.
- [ ] Ambiguous unrestricted written answers receive no improvised AI grade.

**Dependencies:** 2A–2B; approved Taal skill rubric. **Verification:** Dutch gold cases, keyboard/screen-reader checks and generated-set learning flow. **Areas:** choice/text renderers/evaluators, lessons and fixtures/tests.

### 3B. Spelling exercises and blanks preserve intended errors

- [ ] AI-generated Spelling candidates pass the reviewed lane and populate approved inventory.
- [ ] Case/accents/spaces/variants follow the objective; spelling errors are not normalized away.
- [ ] Per-blank outcomes and partial credit contribute only intended skill evidence.

**Dependencies:** 3A. **Verification:** spelling gold cases and generated-set browser flow. **Areas:** blank renderer/evaluator, normalization policies and tests.

### 4. Redactiesommen compose observable reasoning steps

- [ ] AI-generated story problems receive semantic review plus independent arithmetic verification; tested fixed wording may enter Lane A only after explicit certification.
- [ ] Operation/calculation/unit steps reuse evaluators, lock submitted steps and propagate assistance.
- [ ] Supporting reading skills receive no invented mastery credit; distinct observed steps receive bounded evidence.

**Dependencies:** 2B and 3A–3B. **Verification:** story/solver mismatch cases, step ordering, retries and evidence bounds. **Areas:** composite response/renderer, rubrics, semantic fixtures and tests.

### 5A. AI generates and reviewers publish reading bundles

- [ ] Generate original passage plus related comprehension questions, evidence anchors and rationale through Lane C.
- [ ] Publish exact immutable passage/set/question versions with local reading-difficulty rubric, provenance and rights; invalid anchors or ambiguous keys prevent publication.
- [ ] Passage edits/quarantine propagate to dependent sets; no mismatched version can reach a student.

**Dependencies:** 2B and 3A; selected comprehension skills. **Verification:** golden reading bundles, version/FK checks and admin review flow. **Areas:** passage/set model, bundle validator/review view and tests.

### 5B. Student reads, answers and accumulates honest comprehension evidence

- [ ] Passage remains accessible with responsive tablet/mobile navigation; session resume preserves exact set version.
- [ ] First answers are committed before revealing answer-bearing feedback; leaked hints mark dependent evidence assisted.
- [ ] Mastery caps correlated questions per skill/passage exposure and requires diverse passages/days; passage reading time counts once.

**Dependencies:** 5A and 2A. **Verification:** Tab S9 Ultra reading flow, Chrome/Safari accessibility, reveal-dependency and correlated-evidence cases. **Areas:** passage runner, evidence aggregation/report and tests.

### 6. School/Growth selection integrates all five categories

- [ ] School assignments use guardian-selected skills or verified exact-edition mappings; preview pins plan, curriculum and mapping versions.
- [ ] Growth ranks weak/due/next-step work using explainable rules, prerequisites and diverse published inventory, including whole reading sets.
- [ ] Child starts practice within guardian plan bounds; shortages queue replenishment and offer safe shorter/spaced work without waiting on AI.

**Dependencies:** 2A and 3–5. **Verification:** deterministic rankings, stale previews/mappings, reading-set selection, plan-boundary denial and mode-comparison browser flows. **Areas:** curriculum/method reads, selector/recommendations and tests.

**Functional MVP checkpoint:** all five categories, both modes, independent access, scalable guarded AI generation, reuse, history and qualified progress work end to end. AI generation must be demonstrably operational; an outage test must separately show previously published work remains usable.

### 7A. Validate shared-host capacity and operational recovery

- [ ] Exercise concurrent learners, one generation job and a backup alongside the nine existing containers; bound app/job memory and CPU, monitor swap/OOM/I/O, and verify existing sites are unaffected.
- [ ] Validate Free-to-paid Neon triggers, cold starts, email delivery, independent alerts, no idle poll loop, image rollback and migration compatibility.
- [ ] Restore database/app into isolation, replay deletion/revocation ledger, invalidate stale auth material, and time the RPO/RTO drill.

**Dependencies:** 1–6; backup basics already established in 1A. **Verification:** recorded load/resource measurements and restore/rollback drill. **Areas:** runtime/backup/monitoring implementation and operations documentation. Move to more capacity only if evidence warrants it; no new infrastructure purchase is implied.

### 7B. Approve the live private pilot

- [ ] Complete privacy notice/lawful-basis/DPIA assessment, processor/data-flow review, content certification and named reviewer/operator responsibilities.
- [ ] Export/deletion and active-session/device revocation cover identities, raw responses, projections, exports and backup restoration.
- [ ] Pass critical real-device workflows, accessibility checks, educational gold cases and fault-injection tests with no unresolved correctness/isolation/data-loss issues.

**Dependencies:** 7A and educational/privacy reviewers. **Verification:** signed release acceptance and full critical regression suite. **Areas:** privacy operations, documentation and final validation. No real child data before this release gate is satisfied.

## Cost and maintenance boundary

The initial €60 fixed monthly infrastructure allowance is withdrawn. Reusing the reported VPS/domain adds €0 rental if measured capacity suffices. Plan roughly **€4–13/month ordinary incremental costs on Neon Free** when a new backup destination is needed; potentially €0 when adequate backup/email/monitoring already exist. Add paid Neon usage as needed (illustrative small-workload $5–25/month), and keep AI separately budgeted at an initial **$5–20/month** plus an approved seed/evaluation allowance. These are estimates before tax/FX and operator/reviewer labor, not purchases or guarantees. Detailed source-backed rates/scenarios and Free limits are in [architecture section 2](../architecture/initial-architecture.md#2-stack-deployment-and-operating-model).

No launch date is promised until template certification, semantic review throughput and device tests are known. Do not reduce security or recovery to claim zero cost. Capacity for thousands of students remains a future measured rollout with institution-specific access, governance and scaling work.

## Evidence-gated semantic validation follow-up

After baseline human review produces reliable labels, investigate automation in shadow mode: subtype-specific deterministic/linguistic rules, text evidence/contradiction checks and independent model critique. Evaluate on expert-labelled held-out passage/family groups, including intentionally subtle defects. Measure false approvals by severity, abstention, coverage, human minutes saved and API cost; model agreement is not proof.

Promote only narrowly scoped subtypes after pre-agreed accuracy/confidence criteria and explicit educational approval. Keep uncertainty routing, sampling, quarantine and rollback; revalidate changed prompts/models/rules. Initial MVP semantic review remains human, but the architecture must not hard-code it as a permanent per-item requirement. See the detailed progression in architecture section 9.

## Post-MVP boundaries

Live tutoring, broader grades/publishers, calibrated mastery models, teacher/classroom administration, institutional SSO, billing, native/offline apps, speech/handwriting, analytics warehouse and distributed workers are later work. Their seams remain in the design. There is no post-MVP deferral of core AI generation, independent student login or Begrijpend Lezen.
