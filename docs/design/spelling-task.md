# Spelling task — approved revision 1

**Approved · 19 October 2026.** After approving Taal revision 1, the user requested: “Now design Spelling the same way so I can review it.” This authorizes the next synthetic subject preview. Production education, live AI, storage, deployment and further subjects are not added by this request.

The user subsequently approved this exact version: “Looks good, approve this Spelling version and save it in our shared systems. Now design Redactiesommen the same way so I can review it.” The accepted source fingerprint `4de6cbb11be3dc1d840f138f925c91f0fa7d7cba8bbfb1bad0fb5cb8f4ef125b` matched before registration. Approval covers the presented synthetic page and its input, feedback, retry, result and Nexai contract; production content approval remains separate.

## Review and scope

Open **Practice → Spelling → Review Page** (`practice-spelling--review-page`) or the standalone **Screen** (`practice-spelling--screen`). Nine starting moments cover question, first correct/miss, retry, correct retry, second-miss explanation and three result states. Message variants and tablet/mobile frames work like the approved Taal review. Frames start in the selected moment but keep independent in-memory answers.

The proposed context is **spelling the whole plural word**: “één kat → twee …” → “katten”. Ten original fixed examples cover katten, honden, bomen, kippen, ramen, boeken, pennen, boten, vissen and tenten. They are design specimens, not a published/approved curriculum, comprehensive Spelling catalogue or dictation flow. No audio generation or listening control is introduced.

## Shared visual and interaction contract

Uses the same `ExerciseScreen`, summary, tokens, CSS, Button, TextField, full-body Nexai and responsive placement as approved [Rekenen 4.1](rekenen-task.md) and [Taal 1](taal-task.md). No new colors, typography, dimensions, illustrations or animations. The question is now a singular-to-plural prompt; the instruction is “Schrijf het meervoud”. Results count **woorden**.

- One labelled text answer field. Empty input shows an error without consuming a chance. Entries are bounded to 40 characters.
- This standalone plural-word fixture ignores only letter case and surrounding whitespace. It preserves submitted spelling, accents, punctuation and internal spaces; `katen`, `kátten`, `kat ten` and `katten!` are incorrect attempts, not silently corrected or dismissed as formatting errors. This is a bounded preview policy, not a universal Spelling evaluator.
- Autocomplete, spellcheck and automatic capitalization are off as in the language input; Spelling additionally requests `autoCorrect="off"`. Browser attributes do not prove that every mobile keyboard honors them. Actual tablet/iPhone software-keyboard behavior remains unverified.
- First miss: compact red panel, no answer or rule revealed. The identical original word returns after the ten original questions, with no retry announcement. Correct retry: compact green feedback, no explanation. Second miss: submitted spelling, correct word and two fixed explanation steps; no third attempt.
- Ten paws and accessible progress, keyboard Enter/Tab behavior, input focus on advance, result focus, restart and the existing task-list link follow the approved pattern. Example result: 8 first correct + 1 retry correct + 1 missed = 9 of 10 words correct; internal weighted score remains 8.5 and is not exposed as child-facing fractions.
- The preview resets on reload, scenario change or restart. No server, learner records, saved progress or live grading API.

## Ownership and Nexai

`src/modules/practice/spelling/` owns the ten examples, accepted-answer policy, copy, screen adapter, review wrapper and stories. All exercise state stays inside the practice module. No stack or architectural decision changed.

The existing Taal neutral-message selector now lives in `exercise/word-companion.ts`, with the Taal exports retained as aliases. Taal and Spelling select exact unchanged approved catalogue 2 lines; arithmetic-only text and spatially incompatible “hieronder” messages remain excluded. Selection is deterministic by original/retry turn and stable while typing. The existing neutral-word review controls/frames are shared through `exercise/exercise-review.tsx`; each subject supplies its own content and approval status.

| Spelling moment              | Pose          | Playback                                           |
| ---------------------------- | ------------- | -------------------------------------------------- |
| Original/returning question  | `calm-1`      | Approved ambient eye motion with five-second rests |
| First correct                | `happy-2`     | Once per feedback event                            |
| First miss                   | `encourage-2` | Once per feedback event                            |
| Correct retry                | `proud-1`     | Once per feedback event                            |
| Second miss with explanation | `curious-2`   | Once per feedback event                            |
| Ordinary result              | `proud-2`     | Once per result                                    |
| All first attempts correct   | `celebrate-2` | Once per result                                    |
| No solved words              | `encourage-3` | Once per result                                    |

Artwork, messages and Taal assignments are already Approved. **The reviewed Spelling composition, synthetic examples and these context assignments are Approved.** Pause/reduced-motion/hidden/offscreen handling comes from the unchanged shared component. No angry/sad reactions, effort inference, behavior detection or rewards.

## Verification — 19 October 2026

Node **24.22.0**:

- **41 root unit/tooling tests passed**, including five new Spelling cases with independent gold answers, representative single/double-letter mistakes, preservation of spelling errors, empty-input rejection, exact deferred retries, duplicate-submission guards, final-only miss, result counts and canonical Nexai wording.
- **35 Chromium Storybook interaction/axe checks passed**: 10 Rekenen, 12 Taal and 13 Spelling. Includes keyboard Enter/Tab journey, input focus, unchanged wrong entry, correct-retry explanation suppression, second-miss explanation, 9/10 result and restart. A separate check proves an internal-space miss counts as an answer. Review/message controls propagate to both responsive frame URLs.
- Root lint, strict typecheck, scoped formatting, Git whitespace checks and Storybook production build passed. Existing bundler module-directive warnings remain.
- Browser checks covered question, first-miss, second-miss explanation and result at **320, 390, 768, 1024, 1200 and 1440px**. No horizontal overflow, runtime errors or framework overlays observed. Screenshots inspected at desktop/mobile sizes, including the longer bomen explanation at 390px. The review control/frame URLs and Taal approved status were verified.
- The Taal first-question screenshot at 1200 × 950 with reduced motion is byte-identical to both the pre-change capture and the prior reviewed capture. Existing Taal question/validation/screen data, all practice style declarations and Rekenen sources remain unchanged; common code extraction preserves behavior. No visual-baseline files were created or updated.
- All **nine Nexai frozen-master fingerprints** match; no approved artwork or catalogue wording changed.

Browser plugin not available; used the repository's installed Playwright/Chromium and Storybook test tools. Temporary logs, screenshots and 27 browser-check records are in `/tmp/nexo-spelling-review/`, outside committed source.

Combined source fingerprint: `4de6cbb11be3dc1d840f138f925c91f0fa7d7cba8bbfb1bad0fb5cb8f4ef125b`, SHA-256 over sorted paths + NUL + bytes + NUL for all files in `src/modules/practice/{exercise,rekenen,taal,spelling}/`. This identifies the Spelling review and the Taal approval-registration/shared-extraction state; it does not supersede the original accepted Taal fingerprint.

**Not run:** full Next production build/E2E, unrelated Storybook stories, physical tablet/iPhone/Safari, real software-keyboard checks, manual screen-reader testing, hosted CI or approved visual-baseline comparison. **Not implemented:** production educational/content integration, AI, persistence, automated detection, audio dictation or deployment. User visual approval and educational content review for real learner use remain separate gates.

## Approval registration — 19 October 2026

Spelling revision 1 is explicitly Approved, including the reviewed synthetic journey, answer policy, feedback/retries/results and Nexai mappings. Accepted fingerprint `4de6cbb11be3dc1d840f138f925c91f0fa7d7cba8bbfb1bad0fb5cb8f4ef125b` was checked before registration. Storybook **Practice → Spelling** now has Approved metadata and the review displays “spelling revisie 1 · goedgekeurd”. README, the component register and agent instructions identify it as reusable approved context.

The subsequent Redactiesommen consumer adds optional story/unit rendering and generalizes the existing review shell name to `exercise-review.tsx`; Spelling omits those fields and preserves its reviewed behavior. Its fixture, validation and screen adapter are unchanged, and its 1200 × 950 first-question screenshot is byte-identical to the reviewed capture. Fresh checks passed: 46 unit/tooling tests, 47 focused story/axe checks, lint/typecheck, Storybook build, scoped formatting/whitespace and nine master fingerprints. [Redactiesommen revision 1](redactiesommen-task.md) records the combined fingerprint and verification limits. Production content/learning integration remains separate.

## D21-P1 reusable bank adapter — 24 October 2026

The user authorized a bounded reusable Spelling proof. `doubling-family-preview.tsx` reuses this Approved presentation, input policy, exercise/retry engine and exact Nexai assignments with a new ten-word source-checked bank. Original design fixtures and their approval remain unchanged. **New bank, explanations and family-review presentation are In Review, not educationally approved.** Saved guardian review/publication uses the common content workflow; saved Spelling assignment is not yet implemented. [Scope, interactive previews, source provenance and verification](../engineering/reusable-spelling-family.md).
