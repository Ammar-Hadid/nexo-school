# Nexai shared library

19 October 2026. All 24 localized pose animations are **Approved** by the user's explicit acceptance of `layered-poses-v1`. This page records shared-library adoption. Rekenen revision 4.1 now has separately approved exercise-state assignments; future screen assignments require their own review.

Character identity follows the [definitive gender and pronoun decision](nexai-character-bible.md#definitive-gender-and-pronouns--26-october-2026), recorded on 26 October 2026 under the user's explicit delegation.

## Reuse

- `src/components/nexai/nexai-library.ts`: stable IDs, eight mood groups × three variations; approved artwork URLs and registration metadata.
- `NexaiCompanion` accepts `pose`, `message`, `eventKey` and `ambient`, with the existing pause control. When `pose` is supplied, it takes precedence over the historical `motion` prop. Screens without `pose` retain their existing behavior.
- `NexaiAnimatedPose`: decorative artwork only; caller supplies readable feedback and a pause control if repeating. Default is one 2.8-second reaction. `repeat` adds five-second rests. The `eventKey` identifies a new reaction; ordinary rerenders do not replay it.
- Exact PNG copies are under `public/nexai/layered-poses-v1/`; only the selected pose's two images are loaded. No runtime AI or new dependency.
- The [approved source revision](references/nexai/layered-poses-v1/README.md) owns masks and timing. Tests compare distributed assets and shared timing with that revision. Never regenerate approved artwork just to add a situation.

```tsx
<NexaiCompanion
  pose="encourage-2"
  message="Deze vraag komt straks terug."
  eventKey={answerEventId}
  ambient={false}
/>
```

This is a usage example, not a newly approved product assignment. `pose` changes artwork; it does not grade answers, infer effort, issue a gamepas, announce a retry phase or call an API.

Reduced motion/explicit pause show the approved static pose. Sources decode before playback. Leaving the viewport or hiding the document cancels the animation; returning does not restart an old event. Changing the pose/event or explicitly resuming starts a fresh eligible reaction. Failed eye loading retains the original body and HTML feedback. If the base image also fails, the HTML message/actions remain usable. Artwork is decorative and does not create duplicate announcements.

## Recommended situation workflow — proposal, not assignments

Do not assign all 24 poses now. Keep available artwork separate from the product events that use it. Multiple situations can share a pose, and one situation can have a small curated set of alternatives.

For each new student screen, review its meaningful moments alongside the screen. Record a row with **situation, eligible pose IDs, Dutch message, playback rule, and approval status**. The shared `src/components/nexai/nexai-situations.ts` register holds the [approved Rekenen 4.1 exercise assignments](rekenen-task.md#approved-pattern-and-reuse) and separately identified context examples, rendered directly in its workbench. Keep approved rows in this register as actual assignments are introduced; do not scatter choices across page markup. A small typed configuration/function is sufficient when implementation starts. No event bus, inference engine or new administration interface is needed.

Suggested starting families:

| Family             | Candidate collection | Example situation                            |
| ------------------ | -------------------- | -------------------------------------------- |
| Welcome / ready    | calm, curious        | Task overview                                |
| Thinking / waiting | calm, curious        | Waiting for content                          |
| Encouragement      | encourage            | First incorrect answer or difficult question |
| Success            | happy, proud         | Correct answer or task completion            |
| Celebration        | celebrate            | Gamepas earned or substantial achievement    |
| Calm support       | calm, encourage      | Technical blocker or guardian review         |

These are recommendations, not automatic assignments. On 19 October the user reserved angry expressions for practice-quality concerns and missed planned blocks. The Rekenen review now contains two isolated examples; their copy and detection/activation conditions remain proposals. Sad poses remain unassigned. Do not equate an incorrect answer with disappointing or angering Nexai. Keep uncertain/unmapped situations on a neutral approved pose (`calm-1`) or omit decorative feedback, rather than guessing an emotion.

Within an approved set, predictable rotation can add variety without abrupt random mood changes. Text and pose must agree. The underlying exercise owns correctness and retry timing; Nexai only presents its approved response. Review mappings as part of each screen, not in a speculative catalogue of every future event.

## Verification

- Five focused unit/tooling tests passed, including all 24 public asset hashes, registration parity and sampled timing parity with the approved review.
- Nine Nexai Storybook interaction/accessibility checks passed, including all 24 new selections decoded, correct base paths, two eye overlays and pause reset; historical Nexai stories still pass.
- Type checking and targeted lint/format passed. All nine master fingerprints pass. Storybook production build passed with existing Next.js module-directive bundler warnings; the later separation of the gallery from its automated test story was verified through the story tests.
- Full application build/E2E were not rerun for this additive shared-library adoption.
- Physical Tab S9 Ultra performance, manual screen-reader use and full production journeys remain unverified. No production event mapping or deployment is included.

## Message catalogue review — 19 October 2026

The user rejected the limited message selection and requested a larger rated catalogue. [Message review 1](nexai-messages.md) contains 240 candidates in 12 categories, local ratings/notes and export. Artwork remains Approved; message text and pairings are In Review. Existing active example copy is preserved pending selection.

## Word-based practice adoption — 19 October 2026

[Taal revision 1](taal-task.md) is now explicitly Approved, including its exercise-event assignments and deterministic neutral-message selection. The selector lives in `src/modules/practice/exercise/word-companion.ts`, with Taal's previous exports retained. [Spelling revision 1](spelling-task.md) reuses those exact approved messages/artwork; its screen/context assignments remain In Review. No catalogue text, IDs, ratings version or pose assets changed. Arithmetic-only messages and spatially incompatible “hieronder” lines remain excluded for these layouts.

## Spelling approval / story-problem proposal — 19 October 2026

[Spelling revision 1](spelling-task.md) is now explicitly Approved, including its exercise-state mappings and neutral-message selection. [Redactiesommen revision 1](redactiesommen-task.md) reuses the existing approved arithmetic-context messages and poses through `exerciseCompanion`; its full page and context assignments are In Review. No catalogue wording, IDs, rating version, approved artwork or motion changed.

## Redactiesommen approval / reading placement proposal — 19 October 2026

[Redactiesommen revision 2](redactiesommen-task.md) is now explicitly **Approved**, including the existing arithmetic-context exercise mappings. [Begrijpend Lezen revision 1](begrijpend-lezen-task.md) proposes the existing neutral `wordCompanion` selection and unchanged approved poses in a compact beside-message placement below the answer choices. Its reading-specific assignments and `NexaiCompanion.layout="beside"` variant are **In Review**. Default stacked placement remains unchanged; no catalogue wording, IDs, rating version, artwork or motion assets changed.

Begrijpend Lezen revision 3 supersedes the compact reading placement at the user’s request: standard full-size stacked Nexai below the answer panel, matching Rekenen/Taal/Spelling. The beside-message variant remains an unapproved comparison and is unused by the reading page. Exact catalogue wording, artwork and motion remain unchanged; the user explicitly approved the full revision 3 reading page on 19 October 2026, including these placements and exercise-state mappings.
