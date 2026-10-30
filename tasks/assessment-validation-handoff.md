# Next agent prompt for bounded assessment validation

Prepared 20 October 2026. This is a proposed assignment for the user to give to a new agent. It does not itself approve the current prototype or authorize a real-child study. The instructions below become the bounded task when assigned.

## Task

Continue nexo School in `/Users/elpridro/Documents/localDev/AI/nexo-school`. Communicate with me in English; preserve Dutch learner-facing copy. You have no previous chat context, so inspect the repository before changing anything.

Prepare the next concrete step toward trustworthy automatic progression: **one complete, explicitly bounded Rekenen assessment blueprint, draft content for independent educator review, and a reproducible synthetic validation package**. Implement the small validation tooling needed to make the package testable and reviewable. Complete this preparation autonomously; actual independent educator review and any real-learner study remain separate gates.

Do not expand the whole curriculum, redesign the approved practice screens, or substitute a new learning application. Keep the existing explainable policy fixed for this validation package. Record any proposed policy changes separately with their rationale; do not tune the gate to make the package pass.

## Required context

Read these in order, then inspect their linked sources where relevant:

1. `AGENTS.md`, `docs/engineering/development-protocol.md`, `docs/engineering/verification.md`, `tasks/plan.md` and `tasks/todo.md`.
2. `docs/product/assessment-policy.md`, especially its mandatory agent workflow; `docs/research/2026-10-20-assessment-architecture.md`; `docs/design/automatic-learning-path.md`.
3. `docs/architecture/decisions.md`, particularly ADR-004, ADR-005, ADR-006 and ADR-012; the curriculum, evidence, evaluation and content-review sections of `docs/architecture/initial-architecture.md`; `docs/product/mvp-scope.md`.
4. `src/modules/practice/assessment/assessment-policy.ts` and its tests; `src/modules/practice/learning-path/path-assessment.ts`, `path-content.ts`, `path-model.ts` and all learning-path tests.
5. Inspect `package.json`, `.nvmrc`, `vitest.config.ts` and `.github/workflows/quality.yml` for the actual verification commands and runtime. Before touching UI, read the relevant approved design contracts and `docs/design/component-approvals.md`; before exercise or resume changes, read the exercise and connected-journey contracts linked from `AGENTS.md`.

The repository may contain substantial uncommitted work from earlier milestones. Inspect `git status`; preserve it and keep your changes scoped. Do not infer that untracked files are disposable. Re-read current files rather than assuming this dated brief describes their latest state.

## What exists now

The approved architecture is a Next.js/React/TypeScript modular monolith, with planned Prisma/self-hosted PostgreSQL persistence, Better Auth/passkeys and existing VPS/Docker/Caddy infrastructure. The synthetic practice preview uses in-memory state. Architecture plans are not evidence that production persistence or learning services exist.

There are four curriculum subjects: Rekenen, Taal, Spelling and Begrijpend Lezen. Redactiesommen belongs to Rekenen and is a daily parallel practice track, including weekends. Each main subject follows its own ordered category path. Adam sees today's assigned blocks. Preserve task snapshots, drafts, exact submitted answers, approved deferred retries and independent subject state.

Automatic learning-path **revision 3 is In Review**, with policy `synthetic-assessment-v1` and curriculum fixture `synthetic-curriculum-v3`. It separates scoring from evidence and permits provisional advancement only when every mandatory example skill and prerequisite meets the shared gate. Retention and focused recovery are separate; guardian holds affect scheduling and never prove learning. The exact eligibility, family/diversity, workload and retention rules live in the canonical policy. They are unvalidated heuristics, not scientifically calibrated thresholds.

Getalbegrip currently covers only two specimen objectives, place value and ordering; Optellen has two specimen objectives. These are not complete categories. Current `demo:<category>:<objective>` identifiers are synthetic, not production canonical SkillRevision IDs. Taal recognition items lack concept/application coverage, so advancement is deliberately blocked. Spelling and reading automatic routes are not implemented; generic reading policy tests do not constitute a reading curriculum.

The previous recorded checks were 101 unit tests, 137 Storybook checks, 26 E2E tests and 2,944 independently recomputed numerical cases. These are historical outcomes, not results you have run. Repository-wide formatting reported two untouched plugin metadata failures: `.impeccable/config.json` and `.impeccable/hook.cache.json`; aggregate `npm run check` was not claimed green. Confirm the current situation yourself.

The 64-state synthetic matrix had no false advancements or missed weaknesses under its stipulated model. A separate hidden-answer-key negative control produced **one residual false provisional advancement**. Preserve both findings. No real-child accuracy, complete category validity or independent educator certification has been established.

## Deliver the bounded package

### 1. Establish the assessment claim

Use Getalbegrip as the starting point. Propose a precise bounded subset and level appropriate to the intended groep-5 context, supported by the existing curriculum model and primary Dutch educational sources. Define the number domain, required objectives, prerequisites, exclusions, acceptable responses and what successful performance would and would not establish.

Coverage must be complete relative to the explicitly declared subset, not labelled “all Getalbegrip” by default. Identify every gap between that blueprint and the existing two objectives. Where educational judgment is unresolved, mark the proposed decision for the educator rather than inventing approval.

Map proposed skills and prerequisite edges to the architecture's canonical concepts. Reuse existing identifiers when their meaning matches; label any new IDs as proposed/versioned. Keep assessed and supporting skills separate. Do not create a production curriculum or database migration.

### 2. Author a reviewable content package

For every required objective, draft items covering procedure, concept and application with genuinely different task demands and representations. Document each item's intended evidence, possible alternative explanation of a correct response, difficulty assumptions, family relationship, deterministic answer/rubric, acceptable and rejected answers, and ambiguity/accessibility concerns.

Keep independent entry/confirmation, practice/repair and held-out/delayed evaluation material separated. Operand or wording changes alone do not create a new independent family. If sufficient independent content cannot be supported, report the inventory/coverage gap instead of weakening the gate.

Provide a human-readable review sheet with exact version or content identity, objective coverage, answer keys, family independence, reviewer decision/reason and unresolved questions. All newly authored content remains draft/synthetic until actual review. Existing `review: 'synthetic'` metadata is not educator approval. Do not publish this content into the live automatic route as reviewed.

### 3. Build and run synthetic validation tooling

Use the current assessment module and root test runner; add no separate service or assessment engine. Reserve the held-out material outside the interactive selector and practice bank. Record policy/content versions and a reproducible manifest before evaluating it. Development/adversarial fixtures may guide fixes; results used for tuning cannot remain a claimed holdout.

Verify complete declared objective/facet coverage, family/passages separation where relevant, deterministic scoring against an independently computed oracle, invalid/ambiguous response handling, duplicate/source protection, assistance/retry exclusion, inventory exhaustion and subject/prerequisite isolation. Unsupported semantic scoring must remain explicit; unconstrained AI judgment cannot become advancement truth.

Exercise synthetic profiles for full demonstrated coverage, one foundational gap, procedural success with conceptual/application weakness, guesses, known and hidden memorization, assistance, conflicting/stale evidence and delayed forgetting. Include slips/noise only with explicit simulated assumptions; never present invented probabilities as measured child behavior.

Report false advancements, missed weaknesses, additional questions/practice, abstention/content gaps, coverage and reversals with scenario counts and definitions. Compare burdens as well as failure counts. Keep the hidden-answer-key negative control visible. A good synthetic result demonstrates software behavior under its assumptions, not educational accuracy.

Test any changed logic with a failing regression first. Own the technical testing and fix in-scope defects. Do not ask me to determine whether the algorithm works.

### 4. Prepare independent educational validation

Produce a concrete protocol for a future independent Dutch primary educator: educational coverage and task review, fresh held-out outcomes, delayed confirmation, blinded adjudication of disagreements, risk/burden metrics, and proposed stopping and revision rules. Mark sample size, acceptable false-advancement risk, delay choices and uncertainty requirements as decisions requiring qualified review.

Separate user approval of the product from educator approval of assessment content and from empirical validation. Another agent's critique can improve preparation but cannot stand in for a human educator or observed learner data. Prepare the materials now; do not fabricate a reviewer, conduct a real-child pilot, or collect real learner records.

### 5. Integrate and report

Save the review package in the existing repository documentation structure and keep executable fixtures/tests with their owning domain. Update `tasks/plan.md`, `tasks/todo.md` and the applicable research/design evidence links. Preserve one canonical policy; use the existing ADR register if a real architectural decision is needed. Leave changed behavior In Review and authored content explicitly draft/synthetic.

Run the appropriate root verification commands from `docs/engineering/verification.md`. Run broader stories/browser/build checks if their behavior or dependencies changed; document the reason for any omission. Report new results separately from earlier evidence and disclose unrelated pre-existing failures. No visual-baseline updates just to obtain a pass.

The existing review story is `practice-automatic-learning-path--review-page` at `http://127.0.0.1:6006/?path=/story/practice-automatic-learning-path--review-page`. Verify availability before calling it working; start the existing Storybook script if needed. Do not imply the new draft content is integrated there when it is not.

Finish with links to the blueprint, item/reviewer package, validation protocol and executed test report; describe the precise bounded claim, coverage gaps, observed false-advancement/burden results and outstanding educator decisions. Completion means the synthetic preparation is concrete and technically checked. It does not mean educational validation has occurred.

## Boundaries throughout

Keep all learner histories synthetic and practice state in memory. Preserve approved UI, exact Nexai copy, shared tokens/components, exercise/retry contracts, sequential routes and daily Redactiesommen. No production auth, real learner data, remote database changes, live AI, paid services or deployment. Preserve required future MVP AI and richer Redactiesommen reasoning requirements in the roadmap without implementing them here.

Correct answers are evidence, not certainty. False mastery and unsupported foundational skipping remain critical defects. Missing evidence calls for appropriate further evidence; missing content calls for an honest content block. Seek sufficient evidence with minimal unnecessary burden, and never present tests or user approval as educational validation.
