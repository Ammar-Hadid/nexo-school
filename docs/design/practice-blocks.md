# Guardian practice-block cards — revision 1

Status: **In Review**, 18 October 2026. The user requested the block states and a review page in the approved desktop and iPhone layouts. No approval of this revision has been received.

## Purpose and ownership

A guardian can see what Adam has finished, which block comes next and whether its gaming pass has been earned. This is presentation only, with synthetic fixtures. Domain-specific UI lives in `src/modules/guardian/practice-block/`; it reuses the approved Button and GuardianNavigation implementations. No dependencies, application routes, live data or educational logic were added.

## Contract

`PracticeBlockCard` accepts a `PracticeBlockView` and optional `headingLevel` (3 or 4). The view includes block number/title, subject summary, session rows, supplied block state, pass minutes and an availability message. Session rows carry an ID, title, question count and supplied presentation status. The card owns only its session-disclosure state. The displayed finished count includes sessions awaiting review; it does not calculate pass eligibility. Future domain code must supply consistent, authorized view data.

| State           | Appearance and message                                          | Gaming pass                          |
| --------------- | --------------------------------------------------------------- | ------------------------------------ |
| Not started     | Neutral label, 0 completed sessions, availability/order message | Not yet earned                       |
| In progress     | Blue status, purple progress, completed-session count           | Not yet earned                       |
| Awaiting review | Red label and progress, explicit review message even at 5/5     | Explicitly not earned until reviewed |
| Completed       | Green label and progress; all sessions count                    | Earned, usable today                 |

The next planned block stays neutral and names the earlier block it follows. It becomes available in the completed-block example. Five sessions and twenty minutes are fixture choices, not fixed quotas or defaults. A reading session contains the questions for one text (six in this fixture), while the other example sessions contain ten questions.

The guardian gets a compact gaming-pass summary. Student activation, countdown, expiry, 3D artwork and actual pass issuance are not implemented or represented as working actions.

Collection states distinguish an empty plan, unknown progress while loading, and a retrieval error. The retry control changes local example state only. It does not request data.

## Interactions and accessibility

- The approved outline Button opens/closes a session list in place, with unique `aria-controls` and `aria-expanded`. Focus remains on the button; Enter and Space work.
- Status labels, symbols and explicit pass wording accompany color. Color is never the only signal.
- Native progress elements expose a name, value and maximum; forced-colors mode retains native rendering. No added animation.
- Desktop uses the approved collapsible sidebar/header. iPhone uses approved option A and a single column with scrollable content above the bottom navigation.
- Review-only selectors sit outside the product shells. All seven scenarios are available in each. Navigation opens clearly labelled preview placeholders.

## Tokens and review

Component tokens are in `practice-block.tokens.css`, referencing shared semantic colors, typography, spacing and approved Button radius. Existing approved components and their tokens were not modified. Further visual changes require a new reviewed fingerprint.

Story IDs: `components-practice-blocks--review-page`, `--keyboard-details`, `--recovery`, `--loading`, `--desktop`, `--iphone`.

## Verification — 18 October 2026

- Lint and TypeScript checks passed.
- All 27 Chromium Storybook interaction/accessibility checks passed, including six new stories. Assertions cover disclosure keyboard/focus behavior, review versus earned-pass wording, variable reading question count, recovery and iPhone scenario/navigation changes.
- Storybook production build passed; the bundler emits its existing module-level `use client` directive warnings.
- Browser inspection at 320, 390, 768, 1024 and 1440 CSS-pixel widths: no document horizontal overflow; wrapping, scrollable session details and approved bottom navigation inspected. Removed duplicate content padding after the narrow-screen check.
- Screenshots are local inspection artifacts under `.artifacts/practice-block-*.png`, not approved visual baselines.
- App build, full application E2E, physical device/Safari testing and visual baseline comparisons were not run for this isolated Storybook addition. No certification or production-flow completion is implied.

Implemented and tested; **In Review**, not Approved. Flag detection, grading, weekly recurrence, carryover, review decisions, AI and gaming-pass rules remain unimplemented here.
