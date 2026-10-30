# Nexai message review — catalogue 2

19 October 2026 · **Approved by the user**. After catalogue 1, the user requested research first, a stronger curious cartoon-cat companion personality and a rewrite of all 240 messages at the same short length. Catalogue 2 replaces every candidate's wording while retaining all 12 categories, 20 IDs per category and the proposed pose assignments. The user subsequently approved all messages and authorized their use in the current Rekenen page. The combined page is now revision 4 and remains **In Review**.

[Primary-source research](../research/2026-10-19-nexai-companion-voice.md) distinguishes feline inspiration, educational-feedback evidence, accessibility guidance and creative inference. No source establishes that these particular messages improve learning. No live AI, procedural word mixing, new art/motion or generated runtime dialogue.

## Approval and adoption — 19 October 2026

Explicit user instruction: “Approve the messages and use them in the current rekenen page so I can review everything together.” This approves all **240 catalogue 2 messages** and authorizes the current synthetic page integration. It supersedes the earlier hold on replacing Rekenen copy. It does not approve the complete page, new learning/behavior detectors, production integration or new artwork/motion.

The reviewed catalogue/workbench fingerprint was `1345d0311412e8599622c93344d3ed64d36268f2bdbfbd36fb72c61dfc0d13b8`. Approved message-content fingerprint: `6e7512520d0bac81ef250ff2f52aaa052ed74ab2e0fc9e4788484f45b8324e9a` (in catalogue order: ID + NUL + pose + NUL + exact text + NUL, UTF-8). All wording/IDs/poses were verified unchanged during adoption; source comments and workbench status labels may change independently. The v2 storage/version remains stable because the approved text is unchanged.

[Rekenen revision 4](rekenen-task.md#revision-4--approved-messages-in-context-19-october-2026) consumes the canonical catalogue through the shared situation register. Its feature-local selector rotates predictably by question/retry turn, stays stable during typing/rerenders and supports an explicit review variant. The 20 welcome lines remain available for their own task-overview context; no welcome is inserted into an active arithmetic question. Three explanation messages (`explanation-08`, `-12`, `-19`) require explanation below the bubble, so this beside/above layout uses the other 17 without editing any approved wording. All other relevant categories retain 20 variants. Guardian/attention/planning examples remain separate from automatic exercise events.

## Review

Open `components-nexai-messages--review-page` in Storybook. The Rekenen review links here as the approved catalogue. Ratings remain available for later editorial feedback; they are not the source of this explicit approval. Use the category selector (including all 240), search by text/ID, and filter by Goed, Aanpassen, Weg or unreviewed. Each card has a stable ID. Selecting the same rating again removes it. Aanpassen exposes a 500-character optional note. Bekijk met Nexai shows that candidate in the existing HTML bubble with the category's proposed approved pose; only one artwork preview opens at a time.

Ratings persist locally in this browser/origin under `nexai-messages-v2:reviews`. They are editorial preferences, not learner records, backend saves or published approvals. Storage failures leave the current in-memory choices usable and report an export warning. Clearing browser/site data removes local ratings. No cross-device synchronization is promised. The workbench is client-only Storybook tooling, not a server-rendered application page.

Catalogue 1 ratings remain untouched under `nexai-messages-v1:reviews`; they are not loaded or counted for different wording. The new review starts unrated. Existing exported v1 files remain historical evidence; v2 rejects them. There is no automatic migration or v1 viewer/import UI.

**Exporteer beoordelingen** downloads `nexai-berichten-beoordeling-v2.json` containing the catalogue version, exact candidate texts/IDs, ratings and notes. Preserve this file to share decisions or keep a backup. Export includes every candidate; unreviewed entries are explicitly null. The parser rejects another version, unknown IDs and invalid ratings and bounds note lengths. An imported/exported rating does not automatically modify application copy or the approval register. No import UI is supplied in this milestone.

## Catalogue and source of truth

`src/components/nexai/nexai-message-candidates.ts` owns the exact text, IDs, category labels, context notes and suggested pose. The workbench consumes it directly. IDs stay stable for this revision; future material copy changes require a new catalogue version/review so ratings cannot silently move onto different wording.

| Category                      | Count | Proposed pose |
| ----------------------------- | ----- | ------------- |
| Welkom & taken kiezen         | 20    | curious-1     |
| Klaar voor een som            | 20    | calm-1        |
| Goed in één keer              | 20    | happy-2       |
| Eerste antwoord onjuist       | 20    | encourage-2   |
| Goed bij opnieuw proberen     | 20    | proud-1       |
| Tweede fout · uitleg bekijken | 20    | curious-2     |
| Taak afgerond                 | 20    | proud-2       |
| Alles in één keer goed        | 20    | celebrate-2   |
| Taak klaar · samen oefenen    | 20    | encourage-3   |
| Ammar moet de taak bekijken   | 20    | calm-2        |
| Stevig aanspreken · aandacht  | 20    | angry-1       |
| Gepland oefenblok nog open    | 20    | angry-2       |

The text is Approved; Rekenen revision 4.1 pairings and variation are now approved in [the page contract](rekenen-task.md#approved-pattern-and-reuse). Other screens require their own review. These are not 240 new animations. No sad-pose situation has been added. `nexai-situations.ts` now references these exact messages instead of duplicating earlier one-off copy. Adoption is limited to the synthetic Rekenen preview; no production learner runtime is implemented.

## Voice and writing rules — catalogue 2

The [character bible](nexai-character-bible.md#personality-and-language) owns Nexai's personality. Apply these rules when authoring or selecting messages:

1. **A message, not a paragraph.** Keep each candidate at most **13 words and 62 characters**, including punctuation and spaces. These limits preserve catalogue 1's measured envelope, not a scientifically validated reading threshold. Aim for its typical eight-word size; compare each category's lengths as well as the total. Rewrite the whole line instead of attaching a joke to existing copy.
2. **One character beat.** Use curiosity, noticing, comfortable company or a small cat detail. Vary phrasing and sentence rhythm. The plain result/action must still be clear if the decorative detail is removed. Familiar Dutch, taak/taken, no forced rhyme, baby talk, invented instructional words or paragraphs of stage directions.
3. **Proportionate emotion.** Curious at arrival, quiet while thinking, briefly pleased at a correct answer, warmer at completion. Cat jokes concern Nexai himself and belong in welcome/completion/celebration. After mistakes, quiet presence replaces jokes. Encouraging company remains available regardless of performance.
4. **Facts before praise.** Confirm the actual answer or task completion. Do not infer intelligence, effort, strategy, feelings, improvement, mastery, speed or an unmeasured streak. Never imply the learner owes Nexai success, attention or continued play.
5. **Preserve the learning contract.** First miss: explicit incorrectness, no answer/hint, no immediate retry instruction. Ready messages also serve returning questions without a retry introduction. Correct retry: confirmation only, no explanation. Second miss: direct attention to the actual worked explanation; “hieronder” only when it is below the bubble. Generic curiosity is not an educational explanation.
6. **Preserve result distinctions.** Ordinary completion says the task is done, not that all answers were correct. Perfect messages require every first attempt correct. Support suggests looking with Ammar without diagnosing a cause. Guardian-review copy requires a real pending review; no invented approval or gamepas entitlement.
7. **Keep firm reminders bounded.** Attention and open-block categories remain isolated proposals using the previously requested angry poses. Give a concrete next action, never accuse Adam of laziness, knowingly wrong answers or broken promises. Wrong answers, a low score or elapsed time alone do not activate them. Detection, scheduling exceptions and guardian workflow remain unimplemented.
8. **Review before adoption.** Read all lines for natural Dutch and event accuracy; inspect selected bubbles with their approved poses. Cat imagery in speech is not new animation. A material wording change needs a new catalogue version so previous ratings cannot silently transfer. Only the user's explicit selection/approval can promote text into a page.

Examples from this revision: “Ik kies meestal een doos. Jij een taak?” (welcome), “Ik kijk mee. Neem je tijd.” (ready), “Nog niet goed. Ik blijf naast je zitten.” (first miss), “Taak klaar! Even mijn poten strekken.” (complete). These texts are Approved.

## Rewrite verification — catalogue 2, before approval

All **240/240** candidates have different text from catalogue 1, with 240 unique texts and unchanged category/ID/pose structure. Editorial pass checked each group for factual fit, natural short Dutch, self-directed humor and calm mistakes. Average length is **39.7 characters / 7.5 words**, versus **39.9 / 7.6** before; the new maximum is **55 characters / 12 words**, within the preserved 62/13 ceiling. Median length is 42 characters versus 40. These measurements establish brevity, not reading-level certification.

Node **24.22.0**: four catalogue/export/version-isolation unit tests and six Rekenen unit tests passed; two message-review and nine Rekenen Chromium Storybook interaction/axe checks passed. Root lint and strict typecheck passed. Storybook production build passed with existing bundler/module-directive warnings. Scoped formatting and Git whitespace checks passed. Final rerun passed after adding the keyed workbench remount that prevents old in-memory ratings surviving a live catalogue-version update.

Live browser inspection at 1280px confirmed proposal 2, 20-card category switching, readable welcome and first-miss bubbles with the existing full-body poses, and no horizontal overflow in the inspected view. No ratings were changed during inspection. The existing Rekenen review remains served at `practice-rekenen--review-page`; all 12 Rekenen/situation source files are byte-identical to the pre-task capture. All nine frozen-master source/export fingerprints match. Local ignored evidence lives under `.artifacts/nexai-voice-v2/`.

Not rerun: narrow-viewport/device checks, manual screen reader, cross-browser storage/download behavior, full Next build/E2E, visual baselines or deployment. No new image/motion, production catalogue integration, detection or learner data. At that checkpoint voice wording and page mappings were **In Review**; the subsequent message approval is recorded above. Existing artwork/motion approvals are unchanged.

Catalogue 2 source fingerprint: `1345d0311412e8599622c93344d3ed64d36268f2bdbfbd36fb72c61dfc0d13b8` over sorted `src/components/nexai/nexai-message*` paths + NUL + bytes + NUL.

## Historical verification — catalogue 1

Three unit tests passed: exactly 240 unique IDs/texts in 12 × 20 groups using known poses; export/ratings round-trip; malformed/versioned/unknown rating handling. Two Storybook interaction/axe checks passed: rating changes, optional notes retained across filters, unreviewed/revise filters, pose preview and ID search. Tests use an in-memory review so they do not rate the user's real catalogue.

Scoped lint, formatting and strict type checking passed. Storybook build passed with existing module-directive warnings before a story-only TypeScript option correction; the corrected story then passed its interaction tests and type checking. Browser inspection covered the 1440px layout, 390px phone layout and 320px cards/controls with no horizontal overflow. User ratings were not changed during inspection. Manual full copy review is intentionally the next step. Physical-device, screen-reader and cross-browser storage/download behavior are not certified. No full Next build/E2E, production UI integration, baseline updates or deployment.

Catalogue/workbench revision fingerprint: `84e0a90c666362bae41069be6e0b9f8e91c98313b2dd5ce72e7acf437cc3c0cb` over sorted `src/components/nexai/nexai-message*` paths + NUL + bytes + NUL.

## Word-based practice adoption — 19 October 2026

[Taal revision 1](taal-task.md) is now explicitly Approved, including its exercise-event assignments and deterministic neutral-message selection. The selector lives in `src/modules/practice/exercise/word-companion.ts`, with Taal's previous exports retained. [Spelling revision 1](spelling-task.md) reuses those exact approved messages/artwork; its screen/context assignments remain In Review. No catalogue text, IDs, ratings version or pose assets changed. Arithmetic-only messages and spatially incompatible “hieronder” lines remain excluded for these layouts.

## Spelling approval / story-problem proposal — 19 October 2026

[Spelling revision 1](spelling-task.md) is now explicitly Approved, including its exercise-state mappings and neutral-message selection. [Redactiesommen revision 1](redactiesommen-task.md) reuses the existing approved arithmetic-context messages and poses through `exerciseCompanion`; its full page and context assignments are In Review. No catalogue wording, IDs, rating version, approved artwork or motion changed.

## Redactiesommen approval / reading placement proposal — 19 October 2026

[Redactiesommen revision 2](redactiesommen-task.md) is now explicitly **Approved**, including the existing arithmetic-context exercise mappings. [Begrijpend Lezen revision 1](begrijpend-lezen-task.md) proposes the existing neutral `wordCompanion` selection and unchanged approved poses in a compact beside-message placement below the answer choices. Its reading-specific assignments and `NexaiCompanion.layout="beside"` variant are **In Review**. Default stacked placement remains unchanged; no catalogue wording, IDs, rating version, artwork or motion assets changed.

Begrijpend Lezen revision 3 supersedes the compact reading placement at the user’s request: standard full-size stacked Nexai below the answer panel, matching Rekenen/Taal/Spelling. The beside-message variant remains an unapproved comparison and is unused by the reading page. Exact catalogue wording, artwork and motion remain unchanged; the user explicitly approved the full revision 3 reading page on 19 October 2026, including these placements and exercise-state mappings.
