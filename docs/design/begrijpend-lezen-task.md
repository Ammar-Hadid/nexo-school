# Begrijpend Lezen task — approved revision 3

**Approved · 19 October 2026.** After explicitly approving Redactiesommen revision 2, the user requested a different reading composition: a long text on the left, the answer on the right, and another place for Nexai. This authorizes a synthetic Storybook design. It intentionally amends the earlier identical-composition approach for this subject; the approved palette, typography and practice feedback language remain the reference.

## Approval and shared-system registration

The user explicitly approved revision 3: “Looks good, approve this Begrijpend Lezen version and save it in our shared systems.” The reviewed source fingerprint `b403c9a73d79a9611b4a2216ca7145e9f36e9a45393c8a0a02fb38dd1babee18` matched before registration. Approval covers the complete synthetic page: wide reading layout, full passage with adjacent answer choices, no text/question jump links, full-size stacked Nexai below the answers, feedback, retries and results. Existing Storybook entries and shared practice sources are canonical; no duplicate implementation is created. The unused beside-message comparison is not approved by this decision.

## Revision 2 amendment

At the user’s explicit request, all “Naar de vraag” and “Terug naar de tekst” links are removed, including both passage links, the question link and every review/device instance. This supersedes revision 1’s jump-navigation proposal. The reading screen width increases from 82rem to 100rem, and the reading review wrapper now uses that same 100rem limit instead of the general 75rem limit. The dedicated tablet frame retains its 75rem maximum; other subjects keep their original widths. Reading line length remains capped at the approved 42ch. Normal page scrolling is used on narrow screens. Revision 2 is superseded by revision 3 below.

## Current revision 3 amendment

The user requested full-size Nexai like Rekenen, Taal and Spelling now that the reading workspace is wider. The companion remains below the answers but uses the existing stacked message-above-artwork composition, standard 18rem desktop / 14rem mobile container, normal padding and “Nexai is erbij” label. This supersedes the compact beside-message strip from revisions 1–2. The wide container and removal of jump links remain. Revision 3 is **Approved**.

## Review and design contract

Open **Practice → Begrijpend Lezen → Review Page** (`practice-begrijpend-lezen--review-page`), or `practice-begrijpend-lezen--screen` for the standalone screen. Nine review moments, message variants and independent tablet/phone frames use the same implementation.

- One original **351-word, six-paragraph** passage, “Een tuin voor iedereen”, stays complete and selectable. Ten fixed questions refer to the same passage; changing questions or retrying never substitutes or rewrites the text.
- A wider desktop workspace places the text on the left and one question with four answer choices on the right. A subtle divider separates reading and answering. The question column follows page scrolling on wide screens. The page uses normal document scrolling, with no nested reading scroll area, truncation or hidden paragraphs.
- Lexend reading remains 22px, line height 1.7 and a maximum measure of 42ch. Colors, Outfit headings, ten paws and primary Button are existing shared tokens/components. No new palette or font.
- Nexai sits **below the answers**, in the same full-size stacked composition as Rekenen, Taal and Spelling, with his HTML message above the complete pose. The exact approved pose artwork and localized motion are reused. Pause and reduced-motion behavior remain available.
- Below 59rem the full passage precedes the question, with ordinary page scrolling and no text/question jump links. There is no forced reading timer or passage collapse. Desktop/tablet use is inferred from available width, not device detection.
- Answer choices are native labelled radios, usable with touch, Tab and arrow keys. Selection alone does not grade. “Controleer antwoord” commits it; empty selection shows a visible, announced error without consuming an attempt. Choices lock during feedback and “Verder” advances. New questions/restarts focus the first choice; results focus their container.
- The existing first-correct/first-miss/deferred-identical-retry lifecycle and child-facing final counts are reused. No explanation appears on a first miss or correct retry. After a second miss, the selected answer, correct answer, a precise passage quote with paragraph number and an authored rationale appear. All ten original answers have been committed before any explanation in a complete journey. The synthetic result example is 8 first-correct + 1 retry-correct + 1 missed = 9 questions solved, with the existing internal weighted score 8.5.

## Ownership and reusable sources

`src/modules/practice/begrijpend-lezen/` owns the original passage/question bundle, answer keys, evidence quotes, validation, adapter, review and stories. `exercise/` owns the existing shared synthetic lifecycle and composition, with the concrete `ReadingPassage` and `ChoiceAnswer` radio presentation. `ExerciseDefinition.readingText` and per-question `options` select this layout/input; other subjects omit them. No domain logic moves into generic shared UI.

The reading page now uses the standard shared `NexaiCompanion` presentation. The earlier `Components/Nexai/Beside Message` remains an unapproved comparison, unused by the reading page. No new dependency, service, architecture change, production route or duplicate exercise state machine.

## Approved Nexai assignments

Reuses `exercise/word-companion.ts` with exact approved catalogue 2 messages, excluding arithmetic and incompatible “hieronder” copy. Selection is deterministic and stable while changing an answer or moving between text and question. The first line stays “Ik kijk mee. Neem je tijd.” The mappings are the existing calm-1 question, happy-2 first-correct, encourage-2 first-miss, proud-1 retry-correct, curious-2 explanation, proud-2 completion, celebrate-2 all-first-correct and encourage-3 support. No anger/sadness, new artwork, rewritten messages or behavioral inference.

The artwork/copy catalogue and this reading-specific full-size placement, event assignments and deterministic message selection are Approved.

## Educational boundary

This is a local design specimen, not approved learning content or a calibrated reading level. The four-choice presentation is approved for this design; it does not require the same question format for every comprehension task. Original passage, keys, explicit quotes and rationales are inspectable synthetic fixtures; question quality, difficulty, ambiguity, distractors and educational use still require human review.

The approved roadmap 5A/5B remains in force: immutable published passage/set versions, exact content approval, reveal dependencies and assisted evidence, correlated-passage mastery limits, durable assignments/resume and diverse passage exposure are **not implemented**. Later retry explanations may inform other answers in the same bundle; this preview does not classify independent/assisted evidence or infer mastery. It makes only factual local attempt counts. No real learner data, storage, AI calls or deployment.

## Historical revision 1 verification — 19 October 2026

Node 24.22.0. **50 unit/tooling tests** pass across 14 files, including four reading-bundle checks: grounded evidence quotes, independent answer keys, missing/invalid selection, committed-answer immutability and complete deferred retries. **61 practice Storybook interaction/axe checks** pass across all five subjects; **6 Nexai story/axe checks** pass, including the new beside-message placement and pause control. Root lint and strict typecheck pass; scoped formatting and Git whitespace checks pass. Storybook production build passes with existing bundler/module-directive warnings. All nine frozen-master source/export hashes match.

Initial Storybook navigation testing exposed native anchor focus/navigation behavior in the test iframe. Explicit focus-and-scroll links fixed it; the final tests pass. Browser inspection covers question, first miss, explanation and result at 320, 390, 768, 1024, 1200 and 1440px, desktop sticky positioning, mobile text/question jumps with retained selection, review controls and device frames, pause and Redactiesommen's approved label: **31 checks, no inspected console/runtime errors or horizontal overflow**. Reviewed Redactiesommen and Spelling desktop screenshots are byte-identical. Evidence is local under `/tmp/nexo-reading-review/`; these are inspection screenshots, not approved visual baselines.

Source fingerprint: `7a6ff688f805b80d1bd5f50053bef8ec3ccbfcbb0191dc66d53aa735cc834884`. SHA-256 over sorted repository-relative path + NUL + file bytes + NUL for direct files in `src/modules/practice/{exercise,rekenen,taal,spelling,redactiesommen,begrijpend-lezen}/`, plus `src/components/nexai/{nexai.tsx,nexai.module.css,nexai.tokens.css,nexai.stories.tsx}`.

Not run: full Next production build/E2E, unrelated Storybook suites, physical tablet/phone, manual screen reader, hosted CI or new visual baselines. Browser/axe results do not establish reading comfort, educational validity or full accessibility. Production content/learning integration remains separate work.

## Revision 2 verification — 19 October 2026

61 practice Storybook interaction/axe checks across all five subjects, root lint/typecheck and Storybook production build pass on Node 24.22.0 (existing build warnings). The keyboard story now checks that jump links are absent while preserving radio selection, validation, submission and next-question focus checks. Source fingerprint `8baad6ea6a6618cd0ecffbbb0cec66b25437bed35bc2f20f7818ebb25d956105` uses the revision 1 method above. Fresh unit tests, Nexai-only suites, Next build/E2E, physical devices and manual screen reader were not rerun for this presentation-only change.

Fresh browser inspection: 13 checks across 320, 390, 768, 1024, 1440 and 1920px, standalone/review pages, embedded frames and mobile explanation. No jump links, horizontal overflow or inspected runtime errors. At 1920px both reading containers reach their 1600px limit. Desktop screenshot inspected; evidence in `/tmp/nexo-reading-review/revision2-*`. Scoped formatting and Git whitespace checks pass.

## Revision 3 verification — 19 October 2026

61 practice Storybook interaction/axe checks, root lint/typecheck, scoped formatting and Git whitespace checks pass on Node 24.22.0. Eleven browser checks confirm identical artwork dimensions across Rekenen, Taal, Spelling and Begrijpend Lezen: 256px at a 1440px viewport and 192px at 390px, with the message above the artwork. Also checked 320px/1024px explanation layouts and the pause control. No inspected console/runtime errors or horizontal overflow. Desktop screenshot inspected; evidence is in `/tmp/nexo-reading-review/revision3-*`. Source fingerprint `b403c9a73d79a9611b4a2216ca7145e9f36e9a45393c8a0a02fb38dd1babee18` uses the revision 1 method.

No artwork, motion, message, question or state logic changed. Unit tests, production builds, unrelated Storybook suites, physical-device/manual screen-reader checks and visual baselines were not rerun for this presentation-only change.

## Approval registration verification — 19 October 2026

Only the reading review's approval flag and Storybook approval tag/description changed among the fingerprinted sources. All screen, style, fixture, state, scoring, artwork and message sources remain byte-identical to the reviewed revision. Registration fingerprint: `13e4a2bb54ac4dbe371691d3cf346b1c682ef81049f11b3caf6c28f1fabccf5a` using the same method. All 13 reading Chromium Storybook interaction/axe checks pass on Node 24.22.0. Browser inspection confirms both revision 3 approved labels. Scoped formatting and Git whitespace checks pass. No new unit suite, lint/typecheck, builds, unrelated stories, physical-device/manual screen-reader tests or visual baselines were run for this status-only registration; prior implementation evidence and limits remain above.
