# Redactiesommen task — revision 2

**Approved · 19 October 2026.** The user rejected revision 1's short story plus separate large question, supplied two screenshot references, and requested a much longer unified text. This instruction supersedes that presentation contract. The screenshots establish approximate reading length and the integrated-question format; the existing nexo design system remains the visual reference.

The user explicitly approved this revision: “Looks good, approve this Redactiesommen version and save it in our shared systems.” The reviewed source fingerprint `152bef1f318e3f0f5f15df0664ad60c21671ce0296b48ae765f99c197cf60ee4` matched before registration. Approval covers the full synthetic page, longer continuous passages and existing Nexai assignments. Production educational content approval remains separate.

## Current contract

- All ten original examples are now **43–50 words**. Each is a single continuous paragraph, including the question as its final sentence. No separate large question, underline, or duplicated question text.
- `redactiesommen-preview.ts` owns each complete `prompt`. The arithmetic, answers, units, retry queue, explanations and result counts are unchanged. The extra narrative introduces no extra quantities or answer ambiguity; the content remains synthetic, pending educational review for production.
- `ExerciseDefinition.promptAppearance="passage"` selects a plain paragraph using the approved Lexend reading font, 22px reading-size token, learning line height, spacing and 42ch maximum measure. Text wraps naturally and is never truncated or placed in an internal scrolling area. Other subjects retain their existing question headings.
- The labelled answer field follows the passage, with the whole passage as its accessible description. Explanation uses a level-two heading in this variant, preserving the heading hierarchy after removing the question heading. Unit labels, compact feedback, deferred identical retries and full-body Nexai remain unchanged.
- The shared review accepts a revision label; only Redactiesommen selects revision 2. Its existing `practice-redactiesommen--review-page` and `--screen` URLs remain stable. `--passage-layout` tests the new reading contract separately so the Screen story can render every scenario safely.

The single-final-answer prototype boundary, approved Nexai wording/assets, production roadmap and omissions from revision 1 remain in force. Rekenen, Taal and Spelling remain Approved; Redactiesommen revision 2 is now also Approved.

## Revision 2 verification

Node 24.22.0: **46 unit/tooling tests** and **48 focused Chromium Storybook interaction/axe checks** pass across all four practice subjects. The revised checks cover the complete passage as the accessible input description, a paragraph rather than a question heading, preserved identical retries and the unchanged 9/10 journey. Root lint/typecheck, scoped formatting/whitespace and Storybook production build pass (existing bundler warnings).

Browser inspection covers question, first miss, explanation and result at 320, 390, 768, 1024, 1200 and 1440px, plus the narrow review and longer story. Final results and screenshots are under `/tmp/nexo-redactiesommen-v2/`. The initial visual pass exposed a test-story assumption when selecting other scenarios; moving that assertion into its own story fixes the issue. A later temporary inspection run was interrupted by a development-server reload during build; final inspection ran after builds. No visual baselines were updated. The accepted Spelling screenshot remains byte-identical.

Source fingerprint: `152bef1f318e3f0f5f15df0664ad60c21671ce0296b48ae765f99c197cf60ee4`, using the revision 1 path/hash method below. Full Next build/E2E, unrelated stories, physical device/software keyboard, manual screen reader and hosted CI remain unrun. No production learner data, persistence, AI or deployment.

## Historical revision 1 — superseded

**In Review · 19 October 2026.** After approving Spelling revision 1, the user requested: “Now design Redactiesommen the same way so I can review it.” This authorizes the next synthetic subject preview, preserving the approved practice composition. No production educational integration, live AI, learner data or deployment.

## Review

Open **Practice → Redactiesommen → Review Page** (`practice-redactiesommen--review-page`) or standalone **Screen** (`practice-redactiesommen--screen`). Nine starting moments, message variants and tablet/mobile frames mirror the approved Taal and Spelling reviews. Each frame has independent in-memory answers.

Ten original short stories cover addition, subtraction, multiplication and equal sharing. The opening example is “Noor heeft 24 stickers. Ze krijgt er 18 bij.” followed by “Hoeveel stickers heeft Noor nu?” and an answer field labelled “Jouw antwoord in stickers”. Answers and explanations are fixed, independently arithmetic-checked design fixtures; they are not approved/published learning content or a complete curriculum.

## Visual and interaction contract

Reuses `ExerciseScreen`, shared tokens/styles, Button, TextField, ten paws, compact feedback, results and full-body Nexai from approved [Rekenen 4.1](rekenen-task.md), [Taal 1](taal-task.md) and [Spelling 1](spelling-task.md).

- A short story paragraph precedes the question. It uses the approved Lexend reading size/line-height tokens and remains visible through feedback and retries. No operation or solution is given before the second miss.
- Each answer field names its unit. The story and question are both associated with the input through `aria-describedby`. Input requests the numeric keyboard and accepts a nonnegative whole-number answer of one to six digits; whitespace around it is ignored. Empty text, a typed unit, decimals, negative numbers or other unsupported input show validation without consuming an attempt.
- One question at a time. A first miss receives compact red feedback and queues the exact original story/question/unit for later, without revealing the answer or a hint. Queued questions return after the original ten, with no retry announcement.
- A correct retry receives no explanation. A second miss shows the submitted answer, the correct answer with its unit, and three authored steps: interpret the story, calculate, and state the answer in context. No third attempt.
- Final counts remain first-correct, retry-correct and still-to-practise. The result example is 9/10 sums correct (8 first + 1 retry + 1 missed), with the unchanged internal 8.5 weighted score never shown as child-facing fractions.
- Existing focus behavior, Enter/Tab submission, restart, task-list link, pause/reduced motion and responsive companion placement are preserved. No timers, rewards or persistence.

### Product-plan boundary

The [approved product roadmap](../product/mvp-scope.md#4-redactiesommen-compose-observable-reasoning-steps) requires operation/calculation/unit steps and observable evidence in the eventual production flow. This matching visual preview deliberately collects **one final numerical answer**, like the approved Rekenen composition. It does not assess which operation the learner chose, independent unit choice, intermediate reasoning or reading mastery. The roadmap is retained; those capabilities require their own implementation/review. Explanations are not collected learner evidence.

## Shared ownership and reuse

`src/modules/practice/redactiesommen/` owns story fixtures, numeric validation/correctness, copy, screen adapter and stories. The existing practice-module lifecycle owns the synthetic retry state. No business logic moves into generic shared UI.

`ExerciseDefinition` adds optional `context` and `answerUnit` fields. `exercise-screen.tsx` renders these only when supplied. The new `.context` rule consumes existing typography/spacing tokens; no existing style declaration or palette value changes. Other subjects omit both fields and retain their previous markup/appearance.

The existing language review shell is now named `exercise/exercise-review.tsx`. It takes the appropriate message selector and keyboard description for each concrete subject. Taal and Spelling keep their previous defaults, public screen props and story IDs; their wrappers use the new shared path. No new library, service, dependency, architecture decision or production route.

## Nexai assignments proposed for Redactiesommen

Uses the unchanged approved arithmetic-context selector `exerciseCompanion`, including the exact catalogue 2 wording, deterministic turn-based variation and existing exclusions for “hieronder” messages. Typing does not change the message. The first line is “Ik kijk mee. Neem je tijd.”

| Moment                         | Pose          | Playback                                 |
| ------------------------------ | ------------- | ---------------------------------------- |
| Original or returning question | `calm-1`      | Approved ambient eyes, five-second rests |
| First correct                  | `happy-2`     | Once per feedback event                  |
| First miss                     | `encourage-2` | Once per feedback event                  |
| Correct retry                  | `proud-1`     | Once per feedback event                  |
| Second miss with explanation   | `curious-2`   | Once per feedback event                  |
| Ordinary result                | `proud-2`     | Once per result                          |
| All first attempts correct     | `celebrate-2` | Once per result                          |
| No solved answers              | `encourage-3` | Once per result                          |

Artwork and messages are Approved. **These Redactiesommen assignments and the complete page remain In Review.** No new artwork, message rewriting, angry/sad assignment, behavior detection or implied learner motivation.

## Verification — 19 October 2026

Node **24.22.0**:

- **46 root unit/tooling tests passed**, including five new Redactiesommen tests: independent arithmetic/units, exact fixed equal-sharing wording, numeric validation, deferred identical question/unit, result counts, duplicate guards, perfect/final-only-miss completion and approved factual companion selection.
- **47 focused Chromium Storybook interaction/axe checks passed** across Rekenen (10), Taal (12), Spelling (13) and Redactiesommen (12). The new complete journey checks numeric keyboard intent, story/question accessible description, unit labels, invalid/empty input, keyboard Enter/Tab, focus, read-only feedback, exact retries, explanation timing, correct answer with unit, 9/10 result and restart. Review controls retain typed input and propagate selections into both frame URLs.
- Root lint, strict typecheck, scoped formatting, Git whitespace checks and Storybook production build passed. Existing bundler module-directive warnings remain.
- Browser inspection covered question, first miss, second-miss explanation and result at **320, 390, 768, 1024, 1200 and 1440px**, plus the narrow review controls, longer equal-sharing story and Spelling approved status. No observed horizontal overflow or runtime/console errors. Desktop/mobile screenshots visually checked for wrapping, readable story/question hierarchy and full-body Nexai.
- The Spelling first-question screenshot at 1200 × 950 with reduced motion is **byte-identical** to its accepted review capture. Spelling fixture/validation/screen data and all Rekenen sources remain unchanged. No visual baselines written or updated.
- All **nine frozen Nexai master fingerprints** match. Approved catalogue text/assets are unchanged.

Browser plugin not available; verification used installed Playwright/Chromium and root Storybook scripts. Temporary evidence and 28 browser-check records are under `/tmp/nexo-redactiesommen-review/`, outside committed source.

Combined source fingerprint: `f224f528d0f6bc8ad1d2635545f337a81c218f2789063b9fc2b2b1f8d4196461`, SHA-256 over sorted paths + NUL + bytes + NUL for all files in `src/modules/practice/{exercise,rekenen,taal,spelling,redactiesommen}/`.

**Not run:** full Next production build/E2E, unrelated Storybook suite, physical tablet/iPhone/Safari, real software keyboard, manual screen-reader testing, hosted CI and visual-baseline approval. **Not implemented:** production grading/persistence, multi-step learner reasoning capture, semantic-content publication, live AI, behavior detection or deployment. User visual approval and production educational-content approval remain separate gates.
