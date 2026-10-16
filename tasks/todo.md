# Foundation tasks

Status: proposed on 16 October 2026. Implementation has not started. See [plan](plan.md) for the audit, authority and later roadmap. This is the task-status source for the foundation; do not duplicate these checkboxes in architecture documents.

## Completed audit checkpoint

- [x] Read the full user engineering protocol and preserve a repository copy.
- [x] Inspect repository implementation, documentation, UI and test definitions.
- [x] Identify Storybook policy conflict, missing systems and stale device evidence.
- [x] Record skipped Safari check without claiming it passed.
- [x] Produce phased plan and near-term reviewable tasks.

## F1 — Reconcile repository instructions

Dependencies: audit. Scope: small documentation milestone; `AGENTS.md`, existing architecture/decision register and roadmap (up to four files).

- [ ] Add concise entry-point instructions linking the canonical protocol, implementation evidence and current scope.
- [ ] Reconcile mandatory Storybook and latest auth evidence in existing docs; preserve prior decisions as dated history.
- [ ] Distinguish skipped physical checks from verified core feasibility and production readiness.

Verification: inspect all Storybook/auth-status references and relative links; run `git diff --check`. No application runtime change.

## F2 — Define review evidence

Dependencies: F1. Scope: two documents, proposed `docs/design/component-approvals.md` and `docs/engineering/verification.md`.

- [ ] Define register fields: component, immutable revision reference, relevant stories/contracts, lifecycle status, test evidence, user approval evidence/date and superseded revision.
- [ ] Define risk-based checks and reporting for logic, auth/data, shared UI and complete journeys, including visual baseline review and manual accessibility.
- [ ] State that no component is Approved yet and no branding follows from spike CSS.

Verification: walk a clearly marked example through Draft/In Review/Approved without recording fictional approvals; check that internal edits do not create unnecessary approval gates.

## Checkpoint A — Governance

- [ ] Rules are coherent and reference the existing architecture rather than replacing it.
- [ ] A bounded production-foundation implementation milestone is authorized before F3.

## F3 — Minimal production runtime

Dependencies: checkpoint A. Scope: package boundary, lockfile, TypeScript/Next configuration and one minimal route; split configuration from route wiring if scope grows.

- [ ] Explain exact maintained dependency/runtime choices and app directory layout against approved architecture before installation.
- [ ] Add one runnable synthetic app route with strict TypeScript; keep spike isolated and runnable.
- [ ] No fake product workflow, real data, database provisioning or unrelated service dependency.

Verification: execute typecheck and production build; inspect browser route and bundle for server-only secret boundaries. Record actual commands after scripts exist; do not invent passed commands now.

## F4 — Local quality gates

Dependencies: F3. Scope: formatter/linter/test configuration, scripts and one meaningful smoke check; no more than five principal files per subtask.

- [ ] Establish formatting/linting and enforce module/server boundaries where the first modules exist.
- [ ] Provide deterministic fixture/test conventions and a runnable smoke check of the actual route.
- [ ] Document commands and risk-based test selection; avoid assertions that merely mirror implementation.

Verification: execute all introduced commands, confirm a representative forbidden import/configuration is caught where applicable, and build successfully.

## F5 — Storybook tool wiring

Dependencies: F3–F4. Scope: Storybook configuration/scripts and a single clearly provisional wiring story (split lockfile/setup from story if needed).

- [ ] Use the same React implementations, global styles, fonts and locale conventions as the app.
- [ ] Build Storybook locally; keep provisional styling explicitly unapproved.
- [ ] Establish deterministic interaction/accessibility/visual testing integration without blanket baseline acceptance.

Verification: application and Storybook builds, actual story render and focused interaction/accessibility check; inspect shared style imports. This does not create a component catalogue or approve a component.

## F6 — CI for the working local checks

Dependencies: F4–F5. Scope: one workflow and associated command documentation; CI provider follows repository hosting.

- [ ] Run established local quality/build/tests and Storybook checks using synthetic data, without live paid AI calls.
- [ ] Avoid secrets in logs/artifacts and respect the separate spike package boundary.
- [ ] Record observed CI outcomes; a workflow file alone is not a successful run.

Verification: workflow validation and local command parity; execute hosted checks when repository access/authorization supports it, otherwise report them not run.

## Checkpoint B — Runnable foundation

- [ ] App, Storybook and local quality checks actually pass; hosted checks reported accurately.
- [ ] No production auth/data/educational implementation claimed.
- [ ] Review the foundation before expanding into the next milestone.

## F7 — Brand/reference direction

Dependencies: audit; can be prepared before F3, but no brand is adopted without review. Scope: one proposed brand-experience guide and a small set of reference-screen artifacts.

- [ ] Propose distinct nexo directions addressing student clarity and guardian trust; no Dexiphy copying or adoption of spike styling.
- [ ] Use one agreed student task and one guardian task to assess composition, typography, microcopy and responsive behavior.
- [ ] Record explicit direction approval before canonical palette/tokens or product components depend on it.

Verification: inspect tablet/desktop/mobile compositions, readability, task hierarchy, recovery and accessibility considerations; present concrete options for user review.

## F8 — First semantic tokens

Dependencies: F7 approved direction and F5. Scope: token definitions, shared imports and design documentation (up to four files).

- [ ] Define primitive/semantic layers for the first journey, with component tokens only when justified.
- [ ] Cover typography, spacing/layout, statuses/focus, radii/elevation and reduced-motion-aware timings; no audio dependency without a use case.
- [ ] App and Storybook consume the same source; add practical enforcement against arbitrary styling.

Verification: token usage inspection, contrast/focus/reduced-motion checks, both builds and focused styling lint rules.

## F9 — First component review batch

Dependencies: F8. Scope: only components needed by the chosen journey, e.g. Button and Field; implement each component/story/test in its own small task before batching review.

- [ ] Include meaningful loading/disabled/error/keyboard/responsive states and clear APIs without feature business logic.
- [ ] Add stories, interaction/accessibility checks and deterministic visual evidence for actual implementations.
- [ ] Register In Review with revision/story evidence; mark Approved only after explicit user approval of that revision.

Verification: focused component tests, keyboard check, representative viewports, reduced motion and reviewed visual baselines. Present complete reference-page composition too; component quality alone does not prove journey quality.

## Checkpoint C — First approved UI foundation

- [ ] Brand direction and relevant component revisions explicitly approved.
- [ ] UI states and journeys reviewed with test evidence and unresolved concerns.
- [ ] Break existing roadmap 1A/1B into focused production data/auth tasks before implementing them; preserve all later educational/AI requirements.
