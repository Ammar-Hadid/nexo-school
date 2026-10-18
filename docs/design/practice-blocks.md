# Practice-block cards — revision 2

Status: **In Review**, 18 October 2026. Revision 1 (`432c744`) was guardian-focused. The user clarified that these cards also belong in Adam's portal and requested a more child-friendly treatment. This revision supersedes the guardian-only proposal; it is not yet approved.

## Purpose and ownership

One presentation component supports Adam and Ammar with audience-appropriate language. It lives in `src/modules/practice/practice-block/`, moved from the guardian module because both audiences now use it. The approved Button and GuardianNavigation components are reused unchanged. No dependencies, production routes, AI, or educational logic were added.

## Contract

`PracticeBlockCard` accepts a supplied `PracticeBlockView`, optional `headingLevel` (3 or 4), and `audience` (`student`, the default, or `guardian`). The view includes sessions, state, pass minutes and distinct student/guardian availability messages. The card owns only its disclosure state. Its finished count includes answered sessions awaiting review; it does not determine eligibility or award a pass.

| State     | Adam                                                   | Ammar                               | Pass                             |
| --------- | ------------------------------------------------------ | ----------------------------------- | -------------------------------- |
| Planned   | Straks beginnen; simple block-order wording            | Nog niet gestart                    | Not earned                       |
| Active    | Goed bezig!; choose a session, visible session markers | Bezig; finished-session count       | Not earned                       |
| Review    | Even samen kijken; ask Ammar, neutral blue treatment   | Wacht op beoordeling; red treatment | Not earned, even at 5/5 answered |
| Completed | Goed gedaan!; green completion and earned-pass message | Afgerond; green completion          | Earned, usable today             |

The student treatment uses gentle cornflower-tinted surfaces, a numbered block badge, more rounded card corners, larger approved buttons and a marker for each session. Completed markers have a check; the current one has an outlined number. These are decorative complements to the accessible native progress element and named session list. Review details stay neutral for Adam, consistent with the earlier interview decision to keep concerns in the guardian portal. No conclusion about effort or behavior is inferred.

Five sessions and twenty gaming minutes are fixture choices, not quotas. Reading keeps one text with its variable question count. The next block's availability respects the illustrated block order. Unfinished-question carryover remains a product requirement, not logic implemented by this card.

## Gamepas: next design step

The user explicitly chose a **Blender-authored 3D gamepas rendered with Three.js**, not a simple ticket icon. The icon has been removed. The current bordered text area is temporary reward/status information, not the proposed final pass artwork. The review page labels this limitation outside Adam's product composition.

The next design review should address the pass's appearance and earned, ready-to-use, active and expired presentation. Activation/timer behavior, reduced-motion/static fallback and device performance need implementation and verification in that later scope. No Blender model, Three.js dependency, renderer, timer or pass issuance has been added in this revision.

## Review page and interactions

The page shows all four student states, a small tablet-oriented composition, and the guardian variant inside the approved desktop and iPhone option-A shells. The tablet composition does not propose or approve a full student navigation system. Guardian scenario selectors also cover empty, loading and retrieval-error states. Retry and navigation are local demonstration interactions.

The approved Button opens/closes session details using unique `aria-controls` and `aria-expanded`; Enter and Space retain focus. Color is accompanied by words and symbols. Native progress has a name, value and maximum; forced-colors retains native rendering. No added animation. The student uses medium (52px) buttons, with the active block's disclosure styled primary. There is no fake session-start control.

## Tokens and evidence

Component variables live in `practice-block.tokens.css`; colors reference approved shared semantic tokens. The 16px card radius, badge/marker sizes and thicker progress bar are revision-2 proposals, not global token or Button changes.

Story IDs remain `components-practice-blocks--review-page`, `--keyboard-details`, `--recovery`, `--loading`, `--desktop`, `--iphone`. Revision 1 had 27 passing Chromium story checks plus lint, typecheck and Storybook build. Revision 2 verification is recorded below after execution. Approval fingerprints cover all files in the component directory (sorted path, NUL, bytes, NUL).

Implemented and **In Review**. Production scheduling, scoring, review decisions, AI, full student portal and gamepas functionality are not implemented here.

## Revision 2 verification — 18 October 2026

- `npm run lint`, `npm run typecheck`: passed.
- `npm run test:stories`: all 27 Chromium stories and interaction/axe checks passed. The student review assertion checks the personal Ammar message and absence of guardian review wording; guardian scenarios still check that pending review does not earn a pass.
- `npm run storybook:build`: passed, with the existing module-directive bundler warnings.
- Inspected actual browser widths 320, 768, 1024 and 1440px: no horizontal document overflow; student wrapping/progress and guardian composition checked. No motion added.
- App build, full E2E, physical device/Safari and visual baseline comparisons were not run. No real learner data, AI or gamepas implementation was exercised.
