# UI readiness audit for the production roadmap

Date: 20 October 2026. Scope: source inspection by the UI audit sub-agent for the parent roadmap research. **This is not a new implementation milestone or product approval.**

## Conclusion

The project has a substantial, reusable presentation layer and a connected synthetic student journey. The principal remaining work is turning those reviewed interactions into secure, durable, content-backed product workflows. Another broad redesign or component catalogue is not the shortest route to Adam using the application.

Five exercise presentations exist, but they are not five product subjects or a complete curriculum. Current product taxonomy is **Rekenen (including Redactiesommen), Taal, Spelling and Begrijpend Lezen**. The subject preview files contain small, fixed example inventories. The separate automatic learning-path prototype broadens the synthetic domain; its assessment readiness is assessed by the parent research and must not be inferred from these screens.

No tests, browser sessions, physical-device checks or asset-fingerprint verifications were executed during this audit. Test source and historical verification records were read. Historical passing totals in design documents are not fresh audit results.

## Reuse without redesign

| Existing work             | Actual implemented capability                                                                                                           | Boundary for production                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared tokens and fonts   | Central purple/cornflower/status colors; self-hosted Outfit and Lexend; shared typography, spacing and component styles                 | Preserve approved values; determine outstanding responsive and accessibility evidence on real devices                                            |
| Button and TextField      | Native control semantics, variants, sizes, loading/disabled/error states, descriptions and the approved single-border focus treatment   | Connect pending/error states to actual mutations; do not replace approved styling                                                                |
| GuardianNavigation        | Collapsible desktop sidebar/header and selected iPhone bottom navigation; keyboard/focus handling                                       | Identity is currently literal Ammar/Adam; example destinations are preview content; host real routes, permission boundaries and full-page sizing |
| Attention cards           | Flagged/support/growth/blocker and empty/loading/error presentations with semantic colors                                               | Fixture statements are not detection, recommendations or decisions; supply factual evidence and real review actions                              |
| Practice blocks and tasks | Child/guardian variants, progress/state display, separate task page and synthetic start/resume affordances                              | Use authoritative assignments and pass eligibility; ensure category labels follow the corrected taxonomy                                         |
| Exercise composition      | Shared question/input/feedback/retry/results layout; full-body Nexai and stable message selection; reading-specific wide passage layout | Retain interaction contract while replacing fixture-owned state/answers with server-backed data and responses                                    |
| Guardian results          | Read-only list/detail, exact attempts, complete reading context, separate solved/weighted counts, incomplete-score withholding          | Revision 1 remains In Review. Approve/repeat actions, history, persistence and real permissions are absent                                       |
| Nexai                     | Approved master, 24 approved localized-motion poses, 240 approved Dutch messages, source manifests and review workbenches               | Keep exact approved wording/artwork; production context mapping, loading costs and device checks still matter                                    |

Current approval authority is the design contract/register and latest user instruction, not an old inline status label. The main approved exercise pattern is Rekenen 4.1, Taal 1, Spelling 1, Redactiesommen 2 and Begrijpend Lezen 3. Connected student journey 1 is Approved. Guardian result review 1 and automatic-path revision 3 remain In Review.

## Product workflow gaps found in the UI

### Guardian portal

`navigation-preview-content.tsx`, the attention context and `guardian-results.tsx` explicitly substitute preview text for Weekplanning, Instellingen and Beheer. Generic Voortgang is not a complete longitudinal progress product; the guardian result preview exposes factual task results. There is no implemented production workflow here for initial household/student setup, recurring workload controls, dated overrides, reviewing a flagged task and accepting/requesting repeat, approving a proposed difficulty change, device recovery, content publication, AI spending limits or operational health.

The original interview requirements remain valuable, but its manual-only scheduling assumptions have been superseded by the automatic-progression amendment. Build guardian controls for the eventual chosen automation boundary rather than implementing the historical weekly-planner proposal verbatim. The parent roadmap must settle that boundary explicitly.

`GuardianNavigation` embeds a 43rem preview shell and literal profile labels. The result/path host styles already adapt shell sizing. A production host should supply actual identity, routes and page sizing without creating a second navigation component. The labelled student/guardian switch in research previews is demonstration tooling, never access control.

### Student journey and gamepas

Standalone card/task stories contain placeholders; the connected journey supplies actual in-memory transitions. Do not mistake the former for the latter or duplicate the existing connected controller. Production must preserve drafts, committed attempts, feedback, exact deferred retries, original item identity and results across refresh, interruptions and server errors. The parent audit covers the underlying state model.

Practice-block gamepas text is presentation of supplied state, not entitlement. Completed fixtures can display an earned pass; the connected journey intentionally hides the pass. No issuance/redemption/expiry timer or authoritative reward state is implemented by the card. The planned Blender/Three.js pass remains separate artwork, not a prerequisite for defining safe reward eligibility and daily expiry. Its release priority should be an explicit product choice, not silently dropped or allowed to block core practice.

### Educational format coverage

The independent subject fixtures expose exactly what their designs can currently demonstrate:

- Rekenen: ten fixed nonnegative integer arithmetic questions.
- Taal: ten fixed single-word verb-identification questions.
- Spelling: ten fixed whole-word plural examples. Submitted punctuation, accents and internal spaces are intentionally preserved as spelling evidence; only outer whitespace and letter case are ignored.
- Redactiesommen: ten fixed continuous passages with one final numeric answer and a supplied unit label. No learner operation choice, intermediate calculation or independent unit reasoning is collected.
- Begrijpend Lezen: one fixed six-paragraph passage and ten four-choice questions. The immutable bundle and full reading context are preserved, but this is not a general reading catalogue.

Numeric preview validation accepts one to six digits and excludes decimals, negatives, fractions and typed units. Broader categories will require explicit answer-format contracts, not merely new prompts. These are deliberate specimen boundaries, not defects in the approved screens. A production roadmap must map every supported category to both reviewed content and a suitable answer/evidence format. Subject-screen availability must never be reported as category/curriculum completeness.

The client-side exercise definitions include accepted answers and scoring callbacks by design. That is appropriate for synthetic previews and unsuitable as the public production question contract. The production boundary needs public question data separated from server-only keys, grading, explanation-release decisions and evidence derivation. Do not ship fixture imports into authenticated practice routes.

## Nexai and asset production readiness

The approved layered player is materially stronger than simple whole-image transforms: exact source poses, registered eye patches, localized blink/wink/peek timelines and one forepaw gesture; decode-before-play, pause/reduced motion, hidden/offscreen cancellation, HTML messages and stable event playback are implemented. Other limbs/ears/tails are not rigged. Do not promise full-character animation based on this library.

Two pipelines remain reachable in shared source. `NexaiCompanion` imports both the approved localized-pose player and the older cel artwork player. `PracticeTasksNexai` passes no `pose`, so that task-overview consumer still takes the historical cel path. Exercises select approved layered poses. Align the task overview with the selected approved production presentation as a bounded integration change; preserve its approved messages unless the user changes them.

The generated legacy sprite-bounds JSON is 1,018,045 bytes and is statically imported through the old pipeline. On-disk public assets measured during inspection were approximately 21.2 MiB for motion-v2, 21.9 MiB for rejected motion-v3 and 60.9 MiB for layered-poses-v1 (48 images). These are **repository disk sizes, not a measured initial browser download**; the layered player decodes the selected base/eye pair. Measure actual route bundles, transferred bytes, decode memory and time on the tablet before choosing optimization. Separate production exports from historical rejected public assets, preserve frozen sources/hashes, and optimize delivery without changing approved pixels or automatically deleting provenance.

The image catalogue, per-pose masks, source-generation records and frozen master establish ownership and reproducibility. `verify_master.py` and `build_reference_sheet.py` preserve that boundary. Historical in-between tooling remains an archive/workbench concern; running it is not required for production. Editorial message ratings stored in local browser storage are not a content-publication system or learner database.

## Accessibility and real-device readiness

The inspected source consistently uses native buttons, forms and labelled radios; error descriptions, live feedback, keyboard focus restoration and non-color state labels are present. Reading uses normal scrolling, full selectable passage content and a narrow-screen stacked layout. Decorative backdrop/artwork are hidden from assistive technology. Nexai provides pause/reduced-motion behavior and visible text when artwork is unavailable.

These strengths do not complete product accessibility verification. Remaining release checks include Tab S9 Ultra Chrome with the actual software keyboard and portrait/landscape changes; guardian iPhone Safari/Chrome and MacBook workflows; manual VoiceOver/TalkBack announcements and focus; zoom/text enlargement; actual reduced-motion and forced-color behavior; touch targets and reading comfort; slow-network, failed-image and failed-save recovery. In particular, verify spelling autocorrection suppression on the real keyboard rather than trusting HTML attributes. Respect the user-approved single-border input focus style while measuring its visibility. The skipped Safari auth-spike check must remain recorded as skipped; do not invent a pass or demand repeating the spike without a new relevant reason.

## Documentation reconciliation needed

The repository intentionally preserves history, but scattered old state labels can mislead a new agent: practice-block review text/tokens still contain older In Review/proposal wording; some backdrop comments remain In Review; the font README describes preview-only adoption although global styles and current typography docs adopt the fonts. The task ledger includes old unchecked gates followed by later approval records. Nexai and subject contracts retain superseded sections for evidence.

Use one current milestone/status index pointing to the canonical latest contracts, and mark superseded material clearly. Do not erase historical evidence, reinterpret old statuses as regressions, or change approved UI just to reconcile prose. This cleanup is small compared with the missing product integration.

## Recommended UI delivery order

1. Reuse the approved student composition in one complete authenticated, durable daily-practice slice with real content identity and server responses. Include reload/resume and failed-save recovery from the first slice.
2. Pair it with factual guardian today/results views and the smallest real accept/repeat/support controls required by the agreed release rules. Keep uncertain engagement evidence distinct from accusations about effort.
3. Integrate initial assessment and daily category assignment only under the parent audit's evidence/content gates. Extend answer formats only when a concrete supported category needs them.
4. Add guardian workload/automation controls, dated exceptions and history; admin content review/publication and AI budget/health views must make operating the first real release sustainable.
5. Connect gamepas eligibility/redemption/expiry and the chosen pass presentation; verify rewards against completion/review state instead of deriving them in a card.
6. Finish physical-device, accessibility, performance and interruption validation across the real end-to-end routes. Keep Storybook as reusable contract evidence, not the production application.

## Inspection inventory and limits

The following source files were read completely as text in this sub-audit, including the listed tests/stories. The domain/runtime audit owned by the parent and infrastructure audit are complementary; this report does not claim to have read every file in the repository. Binary artwork, font binaries, generated geometry, dependency code and build outputs are not equivalent to authored code and were not exhaustively read or visually certified.

### Shared components (all TypeScript/TSX/CSS, including stories and unit tests)

- `src/components/attention-card/attention-card.module.css`
- `src/components/attention-card/attention-card.stories.tsx`
- `src/components/attention-card/attention-card.tsx`
- `src/components/attention-card/attention-context.tsx`
- `src/components/attention-card/attention-examples.tsx`
- `src/components/attention-card/attention-review.module.css`
- `src/components/attention-card/attention-review.tsx`
- `src/components/attention-card/attention.tokens.css`
- `src/components/button/button-review.module.css`
- `src/components/button/button-review.tsx`
- `src/components/button/button.module.css`
- `src/components/button/button.stories.tsx`
- `src/components/button/button.tsx`
- `src/components/guardian-navigation/guardian-navigation.module.css`
- `src/components/guardian-navigation/guardian-navigation.stories.tsx`
- `src/components/guardian-navigation/guardian-navigation.tsx`
- `src/components/guardian-navigation/navigation-icon.tsx`
- `src/components/guardian-navigation/navigation-preview-content.tsx`
- `src/components/guardian-navigation/navigation-review.module.css`
- `src/components/guardian-navigation/navigation-review.tsx`
- `src/components/guardian-navigation/navigation.tokens.css`
- `src/components/learning-backdrop/learning-backdrop-review.module.css`
- `src/components/learning-backdrop/learning-backdrop.module.css`
- `src/components/learning-backdrop/learning-backdrop.stories.tsx`
- `src/components/learning-backdrop/learning-backdrop.tokens.css`
- `src/components/learning-backdrop/learning-backdrop.tsx`
- `src/components/nexai/nexai-animated-pose.tsx`
- `src/components/nexai/nexai-artwork.tsx`
- `src/components/nexai/nexai-layered-timeline.ts`
- `src/components/nexai/nexai-library.module.css`
- `src/components/nexai/nexai-library.stories.tsx`
- `src/components/nexai/nexai-library.ts`
- `src/components/nexai/nexai-message-candidates.test.ts`
- `src/components/nexai/nexai-message-candidates.ts`
- `src/components/nexai/nexai-message-ratings.ts`
- `src/components/nexai/nexai-message-review.module.css`
- `src/components/nexai/nexai-message-review.tsx`
- `src/components/nexai/nexai-messages.stories.tsx`
- `src/components/nexai/nexai-motion.test.ts`
- `src/components/nexai/nexai-motion.ts`
- `src/components/nexai/nexai-pose.tsx`
- `src/components/nexai/nexai-review.module.css`
- `src/components/nexai/nexai-review.tsx`
- `src/components/nexai/nexai-situations.ts`
- `src/components/nexai/nexai.module.css`
- `src/components/nexai/nexai.stories.tsx`
- `src/components/nexai/nexai.tokens.css`
- `src/components/nexai/nexai.tsx`
- `src/components/text-field/text-field-review.module.css`
- `src/components/text-field/text-field-review.tsx`
- `src/components/text-field/text-field.module.css`
- `src/components/text-field/text-field.stories.tsx`
- `src/components/text-field/text-field.tokens.css`
- `src/components/text-field/text-field.tsx`

### Shared styles (all CSS/TSX and font README)

- `src/styles/fonts/README.md`
- `src/styles/fonts.css`
- `src/styles/globals.css`
- `src/styles/palette.module.css`
- `src/styles/palette.stories.tsx`
- `src/styles/tokens.css`
- `src/styles/typography.module.css`
- `src/styles/typography.stories.tsx`

### Practice blocks and task overview (all source files)

- `src/modules/practice/practice-block/practice-block-card.tsx`
- `src/modules/practice/practice-block/practice-block-context.tsx`
- `src/modules/practice/practice-block/practice-block-review.module.css`
- `src/modules/practice/practice-block/practice-block-review.tsx`
- `src/modules/practice/practice-block/practice-block.fixtures.ts`
- `src/modules/practice/practice-block/practice-block.module.css`
- `src/modules/practice/practice-block/practice-block.stories.tsx`
- `src/modules/practice/practice-block/practice-block.tokens.css`
- `src/modules/practice/practice-block/practice-block.types.ts`
- `src/modules/practice/practice-block/practice-tasks-nexai.tsx`
- `src/modules/practice/practice-block/practice-tasks-page.tsx`
- `src/modules/practice/practice-block/practice-tasks.module.css`
- `src/modules/practice/practice-block/practice-tasks.stories.tsx`

### All five subject presentation directories (all source files, fixtures, tests and stories)

- `src/modules/practice/begrijpend-lezen/begrijpend-lezen-preview.test.ts`
- `src/modules/practice/begrijpend-lezen/begrijpend-lezen-preview.ts`
- `src/modules/practice/begrijpend-lezen/begrijpend-lezen-review.tsx`
- `src/modules/practice/begrijpend-lezen/begrijpend-lezen-screen.tsx`
- `src/modules/practice/begrijpend-lezen/begrijpend-lezen.stories.tsx`
- `src/modules/practice/redactiesommen/redactiesommen-preview.test.ts`
- `src/modules/practice/redactiesommen/redactiesommen-preview.ts`
- `src/modules/practice/redactiesommen/redactiesommen-review.tsx`
- `src/modules/practice/redactiesommen/redactiesommen-screen.tsx`
- `src/modules/practice/redactiesommen/redactiesommen.stories.tsx`
- `src/modules/practice/rekenen/rekenen-companion.test.ts`
- `src/modules/practice/rekenen/rekenen-companion.ts`
- `src/modules/practice/rekenen/rekenen-preview.test.ts`
- `src/modules/practice/rekenen/rekenen-preview.ts`
- `src/modules/practice/rekenen/rekenen-review.tsx`
- `src/modules/practice/rekenen/rekenen-screen.tsx`
- `src/modules/practice/rekenen/rekenen.stories.tsx`
- `src/modules/practice/spelling/spelling-preview.test.ts`
- `src/modules/practice/spelling/spelling-preview.ts`
- `src/modules/practice/spelling/spelling-review.tsx`
- `src/modules/practice/spelling/spelling-screen.tsx`
- `src/modules/practice/spelling/spelling.stories.tsx`
- `src/modules/practice/taal/taal-companion.ts`
- `src/modules/practice/taal/taal-preview.test.ts`
- `src/modules/practice/taal/taal-preview.ts`
- `src/modules/practice/taal/taal-review.tsx`
- `src/modules/practice/taal/taal-screen.tsx`
- `src/modules/practice/taal/taal.stories.tsx`

### Additional connected UI, review styles and stories

- `src/modules/practice/guardian-results/guardian-results.tsx`
- `src/modules/practice/guardian-results/guardian-results.module.css`
- `src/modules/practice/guardian-results/guardian-results.fixtures.ts`
- `src/modules/practice/guardian-results/guardian-results.stories.tsx`
- `src/modules/practice/exercise/exercise-review.tsx`
- `src/modules/practice/exercise/exercise-review.module.css`
- `src/modules/practice/exercise/exercise-screen.module.css`
- `src/modules/practice/exercise/exercise.tokens.css`
- `src/modules/practice/journey/practice-journey.stories.tsx`
- `src/modules/practice/learning-path/path-preview.stories.tsx`
- `src/modules/practice/learning-path/path-preview.module.css`

### Art tooling (all six scripts)

- `scripts/art/nexai/build_reference_sheet.py`
- `scripts/art/nexai/inspect_inbetweens.mjs`
- `scripts/art/nexai/inspect_sprite_bounds.mjs`
- `scripts/art/nexai/serve_review.py`
- `scripts/art/nexai/sprite-isolation.mjs`
- `scripts/art/nexai/verify_master.py`

### Supporting documents read

Complete text: `docs/engineering/development-protocol.md`, `docs/engineering/verification.md`, `tasks/todo.md`, `docs/design/guardian-interview.md`, `guardian-navigation.md`, `practice-blocks.md`, `text-field.md`, `learning-backdrop.md`, `color-palette.md`, `typography.md`, `nexai-character-bible.md`, `nexai-library.md`, `nexai-messages.md`, `rekenen-task.md`, `taal-task.md`, `spelling-task.md`, `redactiesommen-task.md`, `begrijpend-lezen-task.md` and `guardian-task-results.md` (unqualified design filenames share `docs/design/`). The supplied current AGENTS instructions were read in conversation. The engineering-suite research skill was read.

Full asset provenance text read: `docs/design/references/nexai/master-v1/manifest.json`, `master-v1/README.md`, `layered-poses-v1/README.md` (paths relative to `docs/design/references/nexai/` after the first).

Partially read/context only, **not claimed exhaustive**: `docs/architecture/decisions.md`, `docs/product/mvp-scope.md`, `docs/design/component-approvals.md`, `docs/design/guardian-journey.md`. Combined tool output truncated portions of these documents; current statuses were cross-checked against complete per-component contracts and supplied AGENTS. The parent owns the architecture/product audit.

Metadata/structure inspected, **not every value read**: `src/components/nexai/nexai-layered-catalogue.json`, `src/components/nexai/nexai-sprite-bounds.json`, and `docs/design/references/nexai/layered-poses-v1/{manifest,motions,sources}.json`. File sizes/counts and public asset-directory sizes were inspected. Generated geometry, image pixel contents, binary font contents and font OFL license text were not part of this code-read scope. No fresh visual or license-compliance certification is implied.

### Verification of this report

Only source reads, inventory/size inspection and documentation authoring were performed. No runtime source was edited, no assets were generated, no approvals were changed, no tests were executed, and no deployment or external service mutation was performed. Findings distinguish observed source behavior, documented product intention and proposed release work.
