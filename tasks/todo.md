# Foundation tasks

Status: foundation milestone implemented and locally verified on 16 October 2026; user authorized the next design milestone on 17 October. On 17 October the user approved the Plum & Cornflower palette/static student direction and authorized central color tokens (F7/F8 partial); broader brand guidance and F9 components remain pending. See `docs/engineering/foundation-report.md` for evidence and limitations. See [plan](plan.md) for the audit, authority and later roadmap. This is the task-status source for the foundation; do not duplicate these checkboxes in architecture documents.

## Completed audit checkpoint

- [x] Read the full user engineering protocol and preserve a repository copy.
- [x] Inspect repository implementation, documentation, UI and test definitions.
- [x] Identify Storybook policy conflict, missing systems and stale device evidence.
- [x] Record skipped Safari check without claiming it passed.
- [x] Produce phased plan and near-term reviewable tasks.

## F1 — Reconcile repository instructions

Dependencies: audit. Scope: small documentation milestone; `AGENTS.md`, existing architecture/decision register and roadmap (up to four files).

- [x] Add concise entry-point instructions linking the canonical protocol, implementation evidence and current scope.
- [x] Reconcile mandatory Storybook and latest auth evidence in existing docs; preserve prior decisions as dated history.
- [x] Distinguish skipped physical checks from verified core feasibility and production readiness.

Verification: inspect all Storybook/auth-status references and relative links; run `git diff --check`. No application runtime change.

## F2 — Define review evidence

Dependencies: F1. Scope: two documents, `docs/design/component-approvals.md` and `docs/engineering/verification.md`.

- [x] Define register fields: component, immutable revision reference, relevant stories/contracts, lifecycle status, test evidence, user approval evidence/date and superseded revision.
- [x] Define risk-based checks and reporting for logic, auth/data, shared UI and complete journeys, including visual baseline review and manual accessibility.
- [x] State that no component is Approved yet and no branding follows from spike CSS.

Verification: walk a clearly marked example through Draft/In Review/Approved without recording fictional approvals; check that internal edits do not create unnecessary approval gates.

## Checkpoint A — Governance

- [x] Rules are coherent and reference the existing architecture rather than replacing it.
- [x] A bounded production-foundation implementation milestone is authorized before F3.

## F3 — Minimal production runtime

Dependencies: checkpoint A. Scope: package boundary, lockfile, TypeScript/Next configuration and one minimal route; split configuration from route wiring if scope grows.

- [x] Explain exact maintained dependency/runtime choices and app directory layout against approved architecture before installation.
- [x] Add one runnable synthetic app route with strict TypeScript; keep spike isolated and runnable.
- [x] No fake product workflow, real data, database provisioning or unrelated service dependency.

Verification: execute typecheck and production build; inspect browser route and bundle for server-only secret boundaries. Record actual commands after scripts exist; do not invent passed commands now.

## F4 — Local quality gates

Dependencies: F3. Scope: formatter/linter/test configuration, scripts and one meaningful smoke check; no more than five principal files per subtask.

- [x] Establish formatting/linting and enforce module/server boundaries where the first modules exist.
- [x] Provide deterministic fixture/test conventions and a runnable smoke check of the actual route.
- [x] Document commands and risk-based test selection; avoid assertions that merely mirror implementation.

Verification: execute all introduced commands, confirm a representative forbidden import/configuration is caught where applicable, and build successfully.

## F5 — Storybook tool wiring

Dependencies: F3–F4. Scope: Storybook configuration/scripts and a single clearly provisional wiring story (split lockfile/setup from story if needed).

- [x] Use the same React implementations, global styles, fonts and locale conventions as the app.
- [x] Build Storybook locally; keep provisional styling explicitly unapproved.
- [x] Establish deterministic interaction/accessibility/visual testing integration without blanket baseline acceptance.

Verification: application and Storybook builds, actual story render and focused interaction/accessibility check; inspect shared style imports. This does not create a component catalogue or approve a component.

## F6 — CI for the working local checks

Dependencies: F4–F5. Scope: one workflow and associated command documentation; CI provider follows repository hosting.

- [x] Run established local quality/build/tests and Storybook checks using synthetic data, without live paid AI calls.
- [x] Avoid secrets in logs/artifacts and respect the separate spike package boundary.
- [x] Record observed CI outcomes; a workflow file alone is not a successful run.

Verification: workflow validation and local command parity; execute hosted checks when repository access/authorization supports it, otherwise report them not run.

## Checkpoint B — Runnable foundation

- [x] App, Storybook and local quality checks actually pass; hosted checks reported accurately.
- [x] No production auth/data/educational implementation claimed.
- [x] User authorized proceeding to brand exploration on 17 October 2026.

## F7 — Brand/reference direction

Dependencies: audit; can be prepared before F3, but no brand is adopted without review. Scope: one proposed brand-experience guide and a small set of reference-screen artifacts.

- [x] Propose three original palettes; refine the selected Plum & Cornflower direction and show a static student practice page.
- [ ] Use one agreed student task and one guardian task to assess composition, typography, microcopy and responsive behavior.
- [x] Record explicit palette/static student direction approval on 17 October 2026 in `docs/design/color-palette.md`. This is narrower than complete brand/journey approval.

Verification: inspect tablet/desktop/mobile compositions, readability, task hierarchy, recovery and accessibility considerations; present concrete options for user review.

## F8 — First semantic tokens

Dependencies: F7 approved direction and F5. Scope: token definitions, shared imports and design documentation (up to four files).

- [x] Define approved primitive colors and semantic color aliases in the shared token file, with a Storybook palette preview. No component tokens needed yet.
- [ ] Cover typography, spacing/layout, statuses/focus, radii/elevation and reduced-motion-aware timings; no audio dependency without a use case.
- [ ] App and Storybook consume the same source; add practical enforcement against arbitrary styling.

Verification: token usage inspection, contrast/focus/reduced-motion checks, both builds and focused styling lint rules.

Typography follow-up (17 October): Outfit/Lexend specimen is In Review in Storybook, based on the user-supplied scale. See `docs/design/typography.md`. Draft typography remains scoped to the specimen until approval.

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
