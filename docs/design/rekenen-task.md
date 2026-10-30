# Rekenen task — approved revision 4.1

## 26 October 2026 · D04-M3 result-scale amendment

The user requests a result out of 10 regardless of question count. Completed tasks now display `10 × existing weighted points / original question count`, rounded to at most one decimal with Dutch formatting. Eight first-attempt successes therefore display 10/10; seven first-attempt successes and one retry success display 9,4/10. Stored points remain 1 / 0.5 / 0; solved-question counts remain separate and visible. This supersedes earlier child-facing solved-count-only presentation, not retry policy, question selection, task size, assessment evidence or progression thresholds. The same shared formatter serves student and guardian results. Unfinished or withdrawn work retains its existing result withholding. This is a practice result, not a mastery estimate. Implemented presentation remains In Review.

**Approved, 19 October 2026.** The user said: “Looks good, approve this version of the rekenen page. and put it in our shared libraries and systems”. This supersedes the earlier In Review status for the complete revision 4.1 page, including its exercise-state pose assignments and deterministic approved-message variation. The source fingerprint was verified before recording approval: `3cc8a9fe2bbb0f5257fc1cefff89a0703bb7aac28f6f1d1e61bb6e8b60ab3055`.

## Approved pattern and reuse

The canonical shared workbench entry is **Practice → Rekenen**, with `practice-rekenen--review-page` for the combined composition and `practice-rekenen--screen` for the reusable screen. Existing mistake, retry, explanation and result stories retain the same implementations. Approval labels and Storybook metadata now identify this accepted revision; screen styling and interaction code are unchanged by registration.

| Library responsibility                                | Canonical implementation / contract                                                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete practice-page composition                    | `src/modules/practice/exercise/exercise-screen.tsx`; `rekenen/rekenen-screen.tsx` supplies subject content and preserves `RekenenScreen` preview props                                                  |
| Page layout, compact feedback panels and paw progress | `exercise-screen.module.css` and `exercise.tokens.css` in the shared practice exercise directory; shared semantic colors in `src/styles/tokens.css`                                                     |
| Answer entry and primary actions                      | Shared `TextField` (`appearance="answer"`) and `Button`; [input contract](text-field.md), [button contract](button.md)                                                                                  |
| Full-body companion and localized animation           | Shared `NexaiCompanion`; [approved library](nexai-library.md)                                                                                                                                           |
| Short approved messages and pose assignments          | `src/components/nexai/nexai-message-candidates.ts` and `nexai-situations.ts`; practice-local `exercise/exercise-companion.ts` selects factual exercise events; `rekenen-companion.ts` preserves its API |
| Synthetic exercise state and results                  | `rekenen-preview.ts`, `exercise-preview.ts` and `exercise-summary.tsx` stay in the practice module; they are not shared UI primitives or a production grading API                                       |

Reuse this composition for subsequent practice-page work instead of copying markup, tokens, messages or motion. Keep arithmetic/state rules feature-owned. Extract additional shared primitives when another concrete consumer needs them, preserving this approved contract and relevant stories.

The approved experience is one question at a time, a labelled answer field, compact green/red feedback surfaces, ten visible paws with an accessible progress description, direct deferred retries, explanations only after a second miss, and child-friendly final counts. Nexai uses the approved contextual messages and full-body poses, with pause/reduced-motion support and stable messages while typing. No visible “Vraag … van 10” or “… van 10 afgerond” counters appear above the paws. Revision 4 and 4.1 below supply the exact selection and feedback details.

Approval covers the presented page and synthetic journey. Separate guardian/attention/planning specimens remain illustrative contexts; automatic detection, sanctions, production routes, real learner data, persistence and live AI are not implemented by this registration. Physical-device, software-keyboard and manual screen-reader limitations remain as recorded below. Material future contract changes require a new review; routine internal work preserves this revision's approval.

## Approval registration evidence

On 19 October 2026, the reviewed revision fingerprint matched before registration. Only workbench status text, Storybook approval metadata and the situation-register comment changed; all other fingerprinted source files remain byte-identical. Registration fingerprint: `1e5f8943af8e9af2fc9686cd82911cdb8b2bc113c610110e75ced37e6fb4986d` (revision 4 method).

Fresh checks: **10 Rekenen Chromium Storybook interaction/axe tests**, root lint and strict typecheck passed on Node 24.22.0; scoped formatting and whitespace checks passed. Browser inspection confirmed “rekenen revisie 4.1 · goedgekeurd”; evidence is local under `.artifacts/rekenen-approval/`. No new unit suite, production builds, full Next E2E, physical-device/software-keyboard/manual screen-reader testing or visual-baseline updates were performed for this status-only registration. Prior implementation verification remains recorded below.

## Historical revision 1

**In Review**, 18 October 2026. User-authorized design review for the question, answer states, delayed retries, final score and Nexai on tablet/mobile. This is a synthetic Storybook flow, not production educational functionality.

## Review and scope

Open `practice-rekenen--review-page`. Choose one of eight moments, or play through ten fixed questions. The tablet and phone iframes use the same responsive screen and selected initial moment; their interactions are independent. `practice-rekenen--screen` opens the standalone preview. Reloading, changing scenario or leaving resets this in-memory example. The existing taken page and its start/resume placeholders are unchanged.

Feature-local implementation lives in `src/modules/practice/rekenen/`. Reuses the approved Button, shared colors and Outfit/Lexend typography, and the existing static Nexai master composition through `PracticeTasksNexai`. Exercise dimensions and surface treatments are centralized in `rekenen.tokens.css`. No new services, dependencies, routing, AI calls, persistence or learner data.

## Visual and interaction contract

- One question per screen, a labelled numeric-keyboard input, and one main action: **Controleer antwoord**, then **Verder**. Enter works through the native form. Empty or invalid input receives a visible error without consuming a chance. This fixture accepts nonnegative whole numbers only, matching its ten questions; it is not a general arithmetic input/parser.
- Header shows the current original question and number of resolved original questions. Ten segments never become twelve questions during retries. Color supports the visible text, rather than replacing it.
- First correct: green feedback, one point. First incorrect: calm red feedback, no answer or method revealed; the exact original question goes into the retry queue. No effort inference or shaming.
- After all original questions, a deliberate **Nog een kans** screen invites a short pause. **Ik ben er klaar voor** starts the retry round. This also applies when the last original question is the only miss; it is a proposed transition for review, not a proven optimal learning delay.
- Queued questions return in their original miss order, with exactly the same values/wording. A correct retry awards half a point and no explanation. An incorrect retry awards zero and shows the submitted answer, correct answer and a fixed, mathematically checked worked example. No third attempt.
- Final score is out of ten, with separate counts for first-try correct, second-try correct and still-to-practise. The review result fixture is **8,5 / 10**, from 8 + 0,5 + 0. No mastery or gaming-pass entitlement is inferred.
- Example explanations are deterministic author-written content. They do not implement the planned personalized AI explanations or diagnose why Adam chose his answer.

## Nexai and responsive behavior

Nexai remains one static approved master per exercise composition, with selectable Dutch HTML above his head. The existing polite live region announces feedback; adjacent visual feedback has no second live region. He sits beside the exercise on wider screens and below it at 640px and below, keeping the answer/action nearer the top on phones. The smaller placement constrains the existing master wrapper without changing its pixels.

No new poses, per-answer animation or animation engine are delivered here. Static artwork naturally respects reduced motion. The previously approved greeting and future answer-reaction catalogue remain separate work. Missing artwork leaves the message, question and actions readable. The decorative LearningBackdrop is deliberately absent from focused exercises under its approved reuse contract.

The review includes a landscape tablet frame up to 1200 CSS pixels and a 390px phone frame, both able to shrink within their host. These are layout previews, not claims about Adam's physical tablet viewport or software keyboard. Tablet keyboard visibility, portrait/landscape rotation and comfort still need checking on the device.

Native input has a visible label and an accessible description containing the current sum. Feedback retains button focus; advancing to a new question focuses its input. Retry/result transitions receive focus on their content region. Screen-reader behavior still needs manual testing. No custom keypad, timer pressure or sounds.

## Verification

See the revision-specific approval register and delivery evidence below. Tests use synthetic data and no external AI. This screen and its new input, feedback, retry transition and score treatments remain **In Review** until explicitly approved.

### Executed evidence — 18 October 2026

- Node 24.22.0: lint and strict typecheck passed. All **43** Chromium Storybook interaction/axe tests passed; all **9** unit/tooling tests passed. Storybook production build passed with existing bundler warnings.
- Full ten-question interaction test verifies empty-input rejection, deferred identical retries, no explanation after a correct retry, explanation after a second miss, and the independent expected 8.5/10 breakdown. Additional unit checks cover a lone final-question miss with a deliberate transition, all-correct completion, and duplicate submission guards.
- Browser inspection at 320, 390, 768, 1024 and 1200px showed no horizontal overflow in the inspected states. Wide review composition inspected at 1440px. Mobile first-miss feedback retained the Continue button focus. Approved Nexai sources: all nine fingerprints still match.
- Targeted formatting and Git whitespace checks passed. Full Next build/E2E, physical Tab S9 Ultra/iPhone/Safari, actual software-keyboard testing, manual screen-reader testing and visual-baseline approval were not performed.
- Immutable revision fingerprint (sorted module paths + NUL + bytes + NUL): `7609355c5f3904cd55de7cd4c41ac359b81ca905c050f763404437b7571c1488`. Review snapshots are local ignored evidence under `.artifacts/rekenen/`.

## Revision 2 — 18 October 2026

The user accepted the overall journey but requested revisions. **In Review**, superseding revision 1's visual/interaction proposal:

- Shared TextField replaces the one-off input. Short plain-text answer feedback replaces large filled boxes and point-award messages.
- Full-body, animated shared Nexai replaces the cut-off image. A calm cornflower companion spot, purple top edge, pencil input and paw-print progress trail reinforce the existing brand. The ten paws still correspond to the ten original questions; text remains authoritative for progress.
- Retries follow directly after the original sequence, with no announcement, readiness button or “second chance” label. This includes the final-question-only miss. Correct retry still has no explanation; a second miss still shows the fixed example explanation.
- Adam sees **9 van de 10 sommen goed** in the result example, with simple first-try/retry/still-to-practise counts. Weighted score remains 8.5 internally. Point fractions and multiplication formulas are removed from child feedback.
- Separate input and motion review links appear before the task review. New artwork/motion/input/placement remain In Review. The task overview also adopts the full-body companion under the user's universal full-body instruction.

Revision 1 evidence above remains historical. Physical-device/keyboard tests, production learning behavior, AI and progress persistence remain outside this implementation.

## Revision evidence — 18 October 2026

Node 24: lint, strict typecheck, all **52 Storybook interaction/accessibility tests**, all **13 unit/tooling tests**, and the Storybook production build passed. Master verification passed all nine original fingerprints. Git whitespace checks passed. Local ignored screenshots/logs are under `.artifacts/revision2/` and `.artifacts/revision2-*.log`.

Browser inspection covered input and motion reviews at 320px and wide desktop, and Rekenen at 320, 390, 768 and 1200px. Inspected layouts had no horizontal overflow. Keyboard timeline inspection confirmed the closed-eye/open-mouth yawn frame; pause reset the artwork and stopped playback. The input validation, direct identical retries, explanation timing and child-friendly result counts are covered by interaction tests.

Not performed: physical Tab S9 Ultra/iPhone/Safari validation, actual software-keyboard comfort, manual screen-reader testing, real OS reduced-motion switching, full Next build/E2E or visual-baseline approval. All new revisions remain **In Review**.

## Companion revision 2 follow-up

The rejected transform-based motion set is replaced by the shared cel-animation component. Idle paws are down; a correct answer uses brief two-paw applause. Completion copy now says “Taak klaar! Dat verdient applaus.” No question, retry, input, explanation or score behavior changed. New character artwork remains In Review; see [current motion contract](nexai-motion.md).

## Revision 3 — approved pose assignments, 19 October 2026

**In Review.** The user authorized a fresh proposal of the entire Rekenen page using the newly approved 24-pose animation library, and a report of situation assignments. Shared artwork/motion is Approved; these event mappings/messages and page compositions are proposed.

The canonical presentation register is `src/components/nexai/nexai-situations.ts`; the review renders that register under **Nexai per moment**. `rekenen-companion.ts` selects only from known synthetic exercise states.

- Ready/original/retry question: `calm-1`; no retry announcement.
- First correct: `happy-2`. Correct retry: `proud-1`, no explanation.
- First miss: `encourage-2` (wink + paw), no solution. Second miss/explanation: `curious-2`.
- Ordinary completion: `proud-2`. All first-attempt answers correct: `celebrate-2`. No solved answers: `encourage-3`, inviting practice with Ammar without inferring effort.
- Separate context examples: guardian review `calm-2`; practice-quality concern `angry-1`; missed planned block `angry-2`. The latter two are reserved at the user's request; wording/conditions are proposals. They are not attached to an implemented detector or scheduling behavior. Sad expressions remain unassigned.

All answer/result reactions play once per event. While answering, the same calm pose repeats its approved eye motion with five-second rests; pause/reduced-motion/hidden/offscreen rules remain shared. No old cel animation is used on this screen. The completed-task scoring, exact deferred retries, two chances, child-facing summary and fixed explanations are unchanged. No gamepas decision, AI inference, persistence or production learner integration.

The user suggested asserting lack of seriousness; the proposed copy instead makes a firm request to take time and check with Ammar. Scores/missed blocks alone do not establish intent. Concrete detection research, exception handling and guardian review belong to their own later milestone. Approval of the angry artwork is separate from approving automated accusations.

Verification: six focused Rekenen unit tests and nine Storybook interaction/axe checks pass, including the full ten-question/two-retry journey, unchanged score and proposed pose assignments. Scoped lint and type checking pass. Storybook build passed with existing module-directive warnings. Desktop first-miss and 390px explanation were visually inspected; mobile had no horizontal overflow and preserved the full figure. Both isolated angry examples selected the expected pose. Full Next build/E2E and visual baselines were not rerun. Physical tablet, software keyboard, screen reader, and actual behavior/attendance detection remain unverified/unimplemented.

## Revision 4 — approved messages in context, 19 October 2026

**In Review.** The user explicitly approved all 240 catalogue 2 messages and requested their adoption in the current page to review everything together. This supersedes revision 3's one-off message strings and the earlier instruction to hold catalogue adoption. Approval of the wording does not approve the whole page or event mappings.

- The shared situation register references the exact approved catalogue instead of copying text. `rekenen-companion.ts` selects from known exercise states; the learner flow cannot select guardian, attention or overdue-block situations.
- Default variation is deterministic: original question index 0–9, then retry turn 10–19, modulo the available category length. Result messages begin at variant 1. A new question/result may change text; typing, validation, pausing or an unrelated rerender does not. Restarting the synthetic example restarts the sequence. No random selection, persistence, timers or inference.
- **Berichtvariant** in the review lets the user inspect a fixed variation across the exercise and both responsive frames. The options identify the actual approved message IDs. Changing the example moment resets automatic selection; changing only the variation preserves the main exercise's answer/progress. The iframe previews reload on source changes and remain independent examples.
- All relevant categories offer 20 messages except explanation: this layout places the worked example beside/above Nexai, so the three approved messages saying “hieronder” (`explanation-08`, `-12`, `-19`) are reserved for a compatible placement. The other 17 rotate here. Explicit indices wrap within each situation's available list. The welcome catalogue remains for task-overview use, not injected during arithmetic.
- Existing guardian/attention/planning examples use approved wording through the same selector. They remain manually selected context examples; no misconduct/attendance detector or automatic sanction is implemented.
- The approved message workbench is retained and relabelled. Local ratings/notes remain optional editorial feedback and do not rewrite approval or learner data.

Question values, exact deferred retries, input validation, scoring, final counts and worked explanations are unchanged. Existing approved poses, motion, pause controls, single polite announcement and focus behavior are reused. No production learning backend, AI, new assets or deployment.

Verification (Node 24.22.0): **12 focused unit tests** (four catalogue, four companion, four exercise-state) and **12 Chromium Storybook interaction/axe checks** (ten Rekenen, two catalogue) passed. Checks cover exact approved-source membership, all 20 ready variants, stable selection across identical state/typing, compatible explanations, distinct ordinary/perfect/support results, review controls preserving typed input, frame source propagation, and the complete ten-question/two-retry journey with unchanged final score. Review-control automation lives in its own story; the actual review page opens without automated interactions.

Root lint, strict typecheck, scoped formatting and Git whitespace checks passed. Storybook production build passed with existing module-directive warnings. Approved catalogue text/ID/pose content matches its approval fingerprint; exercise state/scoring and result summary are byte-identical to the pre-adoption capture. All nine frozen-master fingerprints match.

Browser inspection confirmed revision 4, fixed variant selection and the correct-answer bubble in the 1280px main review, plus the matching variant in tablet/phone accessibility trees. The main review had no horizontal overflow; the 390px outer phone frame was visually inspected through the input, bubble, full character and pause control. Screenshots and build logs are local ignored evidence under `.artifacts/rekenen-v4/`.

Not run: physical Tab S9 Ultra/iPhone/Safari or software-keyboard checks, manual screen-reader validation, full Next build/E2E, or visual-baseline updates. No production deployment. The whole page remains **In Review**.

Revision 4 source fingerprint: `8cc5f09b4e44d70ecc6abc2970461cace8f567f95f3050aea9472092d79de654` over sorted Rekenen module paths, then the shared situation register and approved catalogue source; each path + NUL + bytes + NUL.

## Revision 4.1 — feedback surfaces and paw progress, 19 October 2026

**In Review.** The user requested backgrounds behind correct/incorrect feedback and removal of the visible question/completed counters. This supersedes revision 2's plain-text-only feedback treatment and visible progress-text requirement.

Feedback now uses compact rounded panels with the existing semantic positive/negative surface and text tokens. The ten paws remain the sole visible progress display. Their accessible image label retains the current question and completed count; individual decorative paws are hidden from assistive technology. Final result counts, approved messages, questions, scoring and retry behavior are unchanged.

Verification (Node 24.22.0): all **10 Rekenen Chromium Storybook interaction/axe checks**, root lint and strict typecheck passed. The complete-journey check verifies accessible progress and absence of both visible counter labels. Correct and incorrect feedback and the paw-only row were visually inspected in the narrow in-app browser. Local screenshots are under `.artifacts/rekenen-v4-1/`. Scoped formatting and Git whitespace checks passed.

Not rerun for this presentation change: unit suite, production builds, full Next E2E, physical-device/Safari/software-keyboard or manual screen-reader tests. No visual baselines updated. The whole page remains **In Review**; approved catalogue 2 and character assets retain their approvals.

Revision 4.1 source fingerprint: `3cc8a9fe2bbb0f5257fc1cefff89a0703bb7aac28f6f1d1e61bb6e8b60ab3055` using the revision 4 path/byte method.

## Shared composition extraction for Taal — 19 October 2026

The user authorized a matching Taal design. With a second concrete consumer, the approved layout/styles, synthetic lifecycle, summary and factual companion selection now live in `src/modules/practice/exercise/`. Rekenen remains a subject adapter with the same screen props, fixtures, messages, correctness rules and Storybook IDs. Its existing ten interaction/axe checks and unit tests pass; a reduced-motion 1200 × 950 first-question screenshot is byte-identical before/after extraction. Revision 4.1 remains Approved. [Taal revision 1](taal-task.md) records the extraction fingerprint, current verification and limitations; that new subject is In Review. Historical paths/fingerprints below remain evidence for their original revisions.
