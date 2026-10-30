# Taal task — approved revision 1

**Approved · 19 October 2026.** The user requested a Taal design as close as possible to the approved Rekenen page, changing only the subject context, to inspect before approval and proceeding to another subject. This authorizes a synthetic design preview; it amends the earlier restriction on further subject UI but does not authorize production educational functionality. The user subsequently approved this exact version: “Looks good, approve this Taal version and save it in our shared systems. Now design Spelling the same way so I can review it.” The reviewed fingerprint `301fc22140867b9f2e72310a92694a1edd8b311043383e65b4e50fea06e31cd0` matched before registration. Approval covers the complete synthetic page, its subject-specific input/feedback, Nexai assignments and message variation.

## Review

Storybook **Practice → Taal → Review Page** (`practice-taal--review-page`) presents the full task, nine selectable moments, exact-message variants, and tablet/phone frames. **Screen** (`practice-taal--screen`) opens the standalone exercise. Choose a moment to inspect first-correct, first-miss, retry, retry-correct, second-miss explanation, ordinary result, perfect result or support result. The frames share the selected starting moment but keep independent in-memory answers.

The chosen context is **finding the verb in a short sentence**. Ten original, fixed examples each contain one simple action verb. The first is “De kat slaapt op de bank.” → “slaapt”. These are design fixtures, not approved curriculum, certified educational content or a complete Taal catalogue. The explanation describes these particular sentences; it does not claim that all Dutch verbs describe actions.

## Preserved contract

The page uses the exact approved [Rekenen revision 4.1](rekenen-task.md) composition: header, labelled pencil answer field, primary Button, ten paw prints, compact green/red feedback, blue explanation panel, full-body Nexai, and final child-friendly counts. Colors, fonts, spacing, card shapes, motion and responsive placement are unchanged. One question at a time; no visible numeric progress counter above the paws. The accessible progress description remains available.

- A letter keyboard replaces numeric input. Empty answers or entries containing nonletters/multiple words show validation without consuming a chance. The fixture accepts one word of up to 40 letters.
- Word identification ignores surrounding whitespace and letter case. It does not remove accents, fix spelling, accept synonyms, or use AI to grade free text. The accepted answer is the exact inflected verb from the sentence.
- A first miss reveals no answer or hint. The identical sentence returns after all original questions, without a retry announcement. A correct retry receives no explanation; a second miss reveals the submitted answer, correct word and two fixed explanation steps. No third chance.
- Results retain first-correct, retry-correct and still-to-practise counts. The example result is 9/10 questions correct (8 first + 1 retry + 1 missed), with 8.5 internal weighted points, never displayed as child-facing fractions.
- The entire preview remains local and resets on reload, scenario change or restart. The task-list link uses the existing synthetic Storybook task page. Its existing start/resume placeholders are unchanged.

## Reuse and ownership

The second real consumer justifies extracting the established composition to `src/modules/practice/exercise/`. It stays inside the owning practice module, not in generic UI:

- `exercise-screen.tsx`, `exercise-summary.tsx`, `exercise-screen.module.css` and `exercise.tokens.css`: one composition and visual source for the practice subjects. Styles were moved without changing declarations.
- `exercise-preview.ts`: existing ten-question synthetic lifecycle, deferred retry queue and summary scoring; no production evaluator interface.
- `exercise-companion.ts`: existing factual situation selection and stable approved-message selection.
- `exercise-definition.ts`: small internal adapter for the concrete preview consumers. Subject-specific questions, answer validation/correctness and copy stay in `rekenen/` and `taal/`.
- `exercise-review.module.css`: shared workbench frame styles. `exercise-review.tsx` now supplies the common language review controls/frames; each subject retains its own wrapper and story IDs.

Shared `Button`, `TextField` and `NexaiCompanion` are reused unchanged. No new generic component, dependency, service, route or architecture decision. Rekenen's public screen props and story IDs are preserved. This extraction does not withdraw its revision 4.1 approval.

## Approved Nexai assignments for Taal

| Situation                      | Pose          | Playback                                           |
| ------------------------------ | ------------- | -------------------------------------------------- |
| Original or returning question | `calm-1`      | Approved ambient eye motion with five-second rests |
| First correct                  | `happy-2`     | Once per feedback event                            |
| First miss                     | `encourage-2` | Once per feedback event                            |
| Correct retry                  | `proud-1`     | Once per feedback event                            |
| Second miss / explanation      | `curious-2`   | Once per feedback event                            |
| Ordinary completion            | `proud-2`     | Once per result                                    |
| All first answers correct      | `celebrate-2` | Once per result                                    |
| No solved answers              | `encourage-3` | Once per result                                    |

All artwork and catalogue 2 wording remain Approved and unchanged; **these Taal assignments and their context are Approved**. `exercise/word-companion.ts` (re-exported by `taal-companion.ts`) selects only subject-neutral approved lines, excluding arithmetic references such as som/getal/rekenen/uitkomst. It also preserves the existing exclusion of three “hieronder” explanation messages because the explanation sits beside/above Nexai. No new dialogue, artwork, emotional inference or angry/sad assignments.

Selection rotates deterministically by original/retry turn through the eligible lines. Typing and unrelated rerenders do not change the message. The first line remains “Ik kijk mee. Neem je tijd.” Pause, reduced motion, hidden/offscreen behavior and missing-image fallback remain provided by the shared component.

## Verification — 19 October 2026

Node **24.22.0**:

- Root unit/tooling suite: **36 tests passed**. Includes independent Taal gold answers, case/space acceptance, invalid-entry rejection, miss/retry ordering, duplicate guards, perfect/final-only-miss completion, and exact approved message references. Existing Rekenen tests passed unchanged.
- **22 Chromium Storybook interaction/axe checks passed**: 10 existing Rekenen and 12 Taal stories. Taal's complete journey exercises empty/malformed input, keyboard Enter/Tab, read-only feedback, input focus on advance, identical deferred retries, explanation timing, 9/10 result counts and restart. Review controls preserve typed input when changing message variants and propagate selections to both device frames.
- Root lint, strict typecheck and Storybook production build passed. Existing bundler module-directive warnings remain.
- Browser inspection: question, first-miss, explanation and result at **320, 390, 768, 1024, 1200 and 1440px**, no horizontal overflow. Desktop/mobile screenshots inspected for wrapping, full-body placement and readable feedback. Review scenario control and two frame URLs verified. No runtime/console errors or framework overlay in the inspected pages.
- Approved Rekenen first-question screenshot at 1200 × 950 with reduced motion is **byte-identical before/after extraction**. This is a temporary comparison, not a newly approved visual baseline.
- All **nine frozen-master fingerprints** match. Scoped formatting and Git whitespace checks passed.

Browser plugin not available; verification used the installed Playwright/Chromium tools and the repository's Storybook test script. Temporary screenshots, browser findings and build log are under `/tmp/nexo-taal-review/` and are not committed. The first temporary screenshot loop targeted an interaction story that immediately advanced; it was corrected to use the stable Screen story with scenario arguments, then all 24 viewport/state checks and the review-control check passed.

Source fingerprint: `301fc22140867b9f2e72310a92694a1edd8b311043383e65b4e50fea06e31cd0`, SHA-256 over all sorted file paths + NUL + bytes + NUL in the `exercise`, `rekenen` and `taal` directories.

**Not run:** full Next production build/E2E, full unrelated Storybook suite, physical tablet/iPhone/Safari, real software keyboard, manual screen-reader testing, hosted CI and visual-baseline approval. **Not implemented:** production learning integration, persistence, live AI, automated detection or deployment. User design approval was subsequently received; educational-content approval for production remains a separate gate.

## Approval registration and shared-system adoption — 19 October 2026

The user explicitly approved revision 1 and requested shared-system registration before a matching Spelling preview. The exact reviewed fingerprint was checked first and matched `301fc22140867b9f2e72310a92694a1edd8b311043383e65b4e50fea06e31cd0`. Storybook **Practice → Taal** now carries Approved metadata and the review displays “taal revisie 1 · goedgekeurd”. README, the component approval register and agent instructions identify this accepted pattern.

With Spelling as a concrete second word-based consumer, Taal's existing neutral-message selector and review controls/frames were moved into the shared practice exercise directory. Taal retains its public screen/companion API and story IDs. The shared screen adds an optional autocorrection attribute used only by Spelling. Taal's questions, validator, grading, adapter, styles and approved message text remain unchanged. A reduced-motion 1200 × 950 first-question capture is byte-identical to the reviewed capture.

Fresh verification: **41 unit/tooling tests**, **35 focused Chromium story/axe checks** across all three subjects, lint/typecheck, scoped formatting, Storybook build and all nine master hashes pass. The Taal approval label is browser-verified. Combined registration/extraction fingerprint `4de6cbb11be3dc1d840f138f925c91f0fa7d7cba8bbfb1bad0fb5cb8f4ef125b`; [Spelling review evidence](spelling-task.md) defines its paths/method and verification omissions. Taal revision 1 is Approved; Spelling revision 1 is In Review. Production learning integration remains separate.
