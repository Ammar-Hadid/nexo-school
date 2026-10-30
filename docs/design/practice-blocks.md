# Practice-block cards — revision 3

Status: **Approved**, 18 October 2026. The user explicitly approved the current cards and task page before starting Nexai: “for now approve all of this, but I will come back to the taken list, I want to make it better”. Approval covers revision 3, fingerprint `51480acb2a077a547b87e755702e787da410053d6a45d4c4a992e9d6e0afa95b`; the task-list composition has a recorded future redesign follow-up. The separate page opened by **Bekijk taken**, and **taak/taken** terminology, supersede revision 2's student inline disclosure.

## Purpose and ownership

One presentation component supports Adam and Ammar with audience-appropriate language. It lives in `src/modules/practice/practice-block/`, moved from the guardian module because both audiences now use it. The approved Button and GuardianNavigation components are reused unchanged. No dependencies, production routes, AI, or educational logic were added.

## Contract

`PracticeBlockCard` accepts a supplied `PracticeBlockView`, optional `headingLevel` (3 or 4), and `audience` (`student`, the default, or `guardian`). The view includes sessions, state, pass minutes and distinct student/guardian availability messages. Student cards require a `tasksHref` and render a native link using the approved Button styles. Guardian cards retain the local disclosure; its labels also use taken. Its finished count includes answered sessions awaiting review; it does not determine eligibility or award a pass.

| State     | Adam                                                   | Ammar                               | Pass                             |
| --------- | ------------------------------------------------------ | ----------------------------------- | -------------------------------- |
| Planned   | Straks beginnen; simple block-order wording            | Nog niet gestart                    | Not earned                       |
| Active    | Goed bezig!; choose a session, visible session markers | Bezig; finished-session count       | Not earned                       |
| Review    | Even samen kijken; ask Ammar, neutral blue treatment   | Wacht op beoordeling; red treatment | Not earned, even at 5/5 answered |
| Completed | Goed gedaan!; green completion and earned-pass message | Afgerond; green completion          | Earned, usable today             |

The student treatment uses gentle cornflower-tinted surfaces, a numbered block badge, more rounded card corners, larger approved buttons and a marker for each session. Completed markers have a check; the current one has an outlined number. These are decorative complements to the accessible native progress element and named session list. Review details stay neutral for Adam, consistent with the earlier interview decision to keep concerns in the guardian portal. No conclusion about effort or behavior is inferred.

Five sessions and twenty gaming minutes are fixture choices, not quotas. Reading keeps one text with its variable question count. The next block's availability respects the illustrated block order. Unfinished-question carryover remains a product requirement, not logic implemented by this card.

## Gamepas: later design step

The user explicitly chose a **Blender-authored 3D gamepas rendered with Three.js**, not a simple ticket icon. The icon has been removed. The current bordered text area is temporary reward/status information, not the proposed final pass artwork. The review page labels this limitation outside Adam's product composition.

The later gamepas design review should address the pass's appearance and earned, ready-to-use, active and expired presentation. The user has now prioritized [Nexai](nexai.md) first. Activation/timer behavior, reduced-motion/static fallback and device performance need implementation and verification in that later scope. No Blender model, Three.js dependency, renderer, timer or pass issuance has been added in this revision.

## Review page and interactions

The page shows all four student states, a small tablet-oriented composition, and the guardian variant inside the approved desktop and iPhone option-A shells. The tablet composition does not propose or approve a full student navigation system. Guardian scenario selectors also cover empty, loading and retrieval-error states. Retry and navigation are local demonstration interactions.

Guardian details retain unique `aria-controls` and `aria-expanded`; student cards navigate with a normal link to a separate page instead. Color is accompanied by words and symbols. Native progress has a name, value and maximum; forced-colors retains native rendering. No added animation. The student uses a medium (52px) navigation link styled with the approved Button CSS; the active block uses primary styling. There is no fake session-start control.

## Tokens and evidence

Component variables live in `practice-block.tokens.css`; colors reference approved shared semantic tokens. The 16px card radius, badge/marker sizes and thicker progress bar are revision-2 proposals, not global token or Button changes.

Story IDs remain `components-practice-blocks--review-page`, `--keyboard-details`, `--recovery`, `--loading`, `--desktop`, `--iphone`. Revision 1 had 27 passing Chromium story checks plus lint, typecheck and Storybook build. Revision 2 verification is recorded below after execution. Approval fingerprints cover all files in the component directory (sorted path, NUL, bytes, NUL).

Implemented and **Approved** at revision 3. Production scheduling, scoring, review decisions, AI, full student portal and gamepas functionality are not implemented here.

## Revision 2 verification — 18 October 2026

- `npm run lint`, `npm run typecheck`: passed.
- `npm run test:stories`: all 27 Chromium stories and interaction/axe checks passed. The student review assertion checks the personal Ammar message and absence of guardian review wording; guardian scenarios still check that pending review does not earn a pass.
- `npm run storybook:build`: passed, with the existing module-directive bundler warnings.
- Inspected actual browser widths 320, 768, 1024 and 1440px: no horizontal document overflow; student wrapping/progress and guardian composition checked. No motion added.
- App build, full E2E, physical device/Safari and visual baseline comparisons were not run. No real learner data, AI or gamepas implementation was exercised.

## Revision 3: separate task overview

Adam follows **Bekijk taken → Jouw taken → Start taak / Ga verder**. A normal back link returns to the block review; browser Back works too. The review-only destination is a distinct Storybook URL, carrying the selected example state. `tasksPreviewHref` belongs to synthetic fixtures; the product will supply its own authorized route via `tasksHref`.

`PracticeTasksPage` lists the supplied block's tasks, question counts and states. Completed tasks have no start action. A review task asks Adam to check with Ammar; it cannot earn a pass or restart itself. The reading text and its six example questions stay one task. Start/resume opens a clearly labelled design placeholder, not a working exercise. Focus moves to its heading and returns to the triggering task button. No progress is saved or changed.

Terminology amendment applies to visible labels and accessible names, including existing attention-card and navigation example copy. English domain/type names such as `SessionView` remain technical implementation vocabulary. The singular Dutch label is **taak**, plural **taken**. This changes wording, not the ten-question unit, scoring rules or reading-bundle structure.

New stories: `components-practice-tasks--tasks-page`, `--start-and-resume`, `--awaiting-review`. The block keyboard story now verifies link destination and absence of inline student details. The start/resume story verifies task selection, heading focus, return focus and reading-bundle size; the review story ensures finished/review tasks cannot be started.

Revision 3 verification: lint/typecheck passed; all 30 Chromium Storybook interaction/axe checks passed. Storybook build passed with the existing module-directive warnings. Browser navigation from the actual card to the task page and back, start/resume focus, and responsive wrapping were inspected. No application build, full E2E, physical-device testing or approved visual-baseline updates were run. The Blender/Three.js gamepas remains the next intended design step.

## Task page revision 4 — Nexai header, 18 October 2026

**In Review.** The user requested the approved Nexai on the top card, like the provided reference, saying “Welke taak kies je?” and changing his message when every task is done. The existing approved master is reused without generation or recoloring; a static upper-body crop appears above the first task inside a single overview panel. The reference's different leaning/paws-on-edge pose was not generated or substituted for the approved master. The original practice-block cards retain revision 3 approval.

`PracticeTasksNexai` is feature-local presentation, not the planned general `NexaiCompanion`. It receives only a message, uses decorative SVG with unique clipping IDs, and preserves the master arm placement. The bubble is selectable Lexend HTML with one polite status region. This placement adds no animation or motion burden. It leaves task actions and reading content unobstructed and keeps the message readable if artwork is unavailable.

Messages use supplied task statuses, not merely the block-level label: available work → “Welke taak kies je?”; a nonempty list containing only done tasks → “Alle taken zijn klaar! Goed gedaan!”; no available work and at least one review task → “Klaar! Vraag Ammar om samen te kijken.”; empty list → “Er staan nog geen taken klaar.” This is display logic only; it does not grant completion, approvals or rewards.

The public atlas `public/nexai/master-v1-atlas.png` is byte-identical to the approved source (SHA-256 `de2b01e04c0119f8202c97e39289b42cd8f5b0b16c5d9017905517e9b19030e4`). Storybook now serves the same public directory as Next. Master sources/manifests remain unchanged.

Revision fingerprint: `0586e83c05c42ba82f02133d1f85144c047700452d1142d15c8dea24001dd40f` over sorted paths, NUL, bytes, NUL for task-page files, block tokens, Storybook main and public atlas.

Verification: lint and typecheck passed under Node 24.22.0; all 34 Chromium Storybook interaction/axe tests passed; Storybook production build passed with existing bundler warnings. Added completed, stale block-summary and empty-list message coverage. Existing start/resume and return-focus checks passed. Inspected 320, 768, 1024 and 1440px with no horizontal overflow, plus completed/review wording. Built Storybook atlas matches master bytes and all nine frozen master fingerprints still pass. Targeted formatting and Git whitespace checks passed. Full Next production build/E2E, physical device/Safari and manual screen-reader checks were not run.

## Task page revision 5 — shared margin decoration

18 October 2026. **Background decoration and placement Approved** by explicit user response; this does not broaden approval to other task-page behavior. Wraps the task-page preview in the shared [LearningBackdrop](learning-backdrop.md): static book/pencil doodles, stars and dashed trails on the left and right. The task-page width now uses the same center-width token as the decoration. The artwork hides at 1184px and below. Nexai pixels, task-status copy and task actions are unchanged. Lint/typecheck, all 36 Storybook interaction/axe checks and Storybook build passed; no horizontal overflow at 320, 768, 1024 or 1440px. No full app E2E, physical-device or visual-baseline update.

## Full-body companion amendment — 18 October 2026

The user requested that Nexai always show his complete body unless intentionally hiding behind a visible object. The task overview now reuses shared `NexaiCompanion`, with the existing task-derived messages, ambient movement and pause control. This supersedes its cropped static renderer; layout/motion remain In Review. Approved LearningBackdrop artwork is unchanged. See [motion contract](nexai-motion.md) for implementation and verification evidence.
