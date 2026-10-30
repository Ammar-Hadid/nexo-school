# D14 first slice — reusable batch review

**26 October D04-M3 user amendment:** the ordinary approval/rejection note is optional, including blank and short notes; absent input is stored as an empty string. The 16,000-character bound, confirmed human review, exact-version blockers and separate publication are unchanged. Family certification judgments and withdrawal/correction reasons retain their contracts. See [workflow scope](../design/guided-local-workflow.md).

23 October 2026 · **Revision 2 Implemented/Tested; UI and workflow In Review.** The user explicitly approved the preceding D13 v2 content-contract slice and assigned this first D14 step. This approves that technical contract only, not D13 reference labels, exercise content or independent educational validity. Full D13 adjudication and D11 certification remain open. The specific D14 assignment authorizes this bounded technical UI slice while those educational gates remain pending.

## Revision 2 — focused review and live time

The user rejected revision 1’s text-heavy hierarchy and reported that the timer did not update live. This maintenance slice stays within the first D14 batch workflow; it does not advance general intake or waive approval gates.

The screen now has two explicit stages: **Oefeningen bekijken** and **Beslis over selectie**. A compact desktop exercise list (native picker on phones) opens one complete exercise at a time. Question and answer/explanation sit side by side on desktop and stack on phones. Mechanical blockers remain expanded; flagged or stale AI advice is expanded, while clear advice, marking rules and technical provenance are disclosed on demand. Exact current versions remain fully inspectable. The selection page lists the chosen titles/versions before the explicit note and human confirmation; publishing remains a separate action after approval.

Navigation is disabled while an editor has unsaved work, and failed saves retain the draft. Changing the selection clears its confirmation. Selecting an exercise is not approval. The saved cursor restores the focused exercise on reload; cursor writes are serialized to preserve navigation order. The approved guardian shell, colors and Button contracts remain unchanged. No new shared component or dependency was introduced.

The compact timer shows **live elapsed time** and a separate **Opgeslagen** value. A local display tick updates the visible seconds without adding requests; the existing ten-second heartbeat and pause flush still persist time. Acknowledgments never add elapsed time twice. On save failure it stops, shows an error and returns to the last acknowledged total. Background/blur/idle pause and cross-tab server fencing remain. Time is workload telemetry, never evidence of approval.

## Delivered boundary

`/guardian/content/review` composes the existing approved guardian navigation and Button with content-owned review components. `/api/guardian/content-review` uses the existing local synthetic identity configuration, bootstrap operator and MFA no older than five minutes. Same-origin checks, bounded request bodies and no-store responses protect full questions, private answers, explanations and review state. Ordinary guardians, student principals and anonymous callers have no content-author capability. There is no new sign-in method or general author-role system.

One deliberately fixed, reusable **three-item Taal / werkwoordsvormen demonstration batch** exercises the workflow. The authenticated operator explicitly initializes it; GET and migrations never seed or approve content. It includes a clean sentence, an ambiguous “zij” sentence and missing-context/markup defects. The catalogue row is a coverage reference, not a certified skill mapping. Nothing is assigned to Adam. It does not import or alter historical D13 fixtures or human decisions.

Every exercise remains available through the list/picker with its full question, passage where present, options, accepted answers, explanation and expandable marking rules. Mechanical findings are freshly computed from the pinned v2 rubric. The example Haiku findings are explicitly **synthetic**, bound to original exact content hashes, and become stale after edits. They are neither real model outputs nor approval authority. A human may resolve an advisory concern with an explicit judgment/note; mechanical blockers must be repaired first. No paid call or new generator/reviewer dispatch is wired.

Edits save a new immutable version and rerun checks. Prior content, reviews and publications remain intact. A corrected version does not inherit approval. Saving an identical edit is safe to retry; conflicting edits require reloading. Unsaved editor contents remain after a failed save, block selection approval and warn before leaving. Saved versions and the last-reviewed item survive reload; unsaved typing and selection checkboxes do not claim durable persistence.

Explicit selection plus a human confirmation and decision note supports approve/reject. The server checks the exact current IDs/hashes and processes the selected versions in one authenticated transaction. A later failure rolls back earlier review/audit writes. Publication is a separate explicit action requiring approved exact versions and passing mechanical checks. It remains `local-synthetic-practice`, without assignment or mastery permission. No automatic publication is introduced. A rejected version needs a new revision before reconsideration.

The internal D10 command function was extracted for transaction composition, preserving its existing public authorization wrapper and immutable publication rules. No duplicate review/publication implementation or new service was introduced.

## Timing and resume

The new `ContentReviewProgress` record stores the operator/batch cursor and acknowledged active milliseconds. It is mutable workflow telemetry, not an educational fact or approval authority. The additive migration is `20261023010000_content_review_progress`; it has only been exercised in disposable local test databases.

Timing starts explicitly, pauses on window blur/background/page exit or after one minute without pointer, keyboard or scroll interaction, and acknowledges cumulative heartbeats every ten seconds. The server bounds increments by elapsed wall time and a maximum heartbeat gap, rejects stale sequences, and does not count exact retries twice. Starting in another tab replaces the session token so old-tab heartbeats cannot double-count. Time saved before interruption is retained. A crash can lose up to the unacknowledged interval; a lost response may have committed and is reconciled by reloading. A normal final unload flush uses keepalive but is not guaranteed by the browser.

This measures self-reported active review time for this batch/operator. It cannot prove attention, correct judgment or educational validity. The weekly 15–30-minute target is **not yet measured with the user**. Weekly aggregation, bundle-level throughput and initial certification time remain later work; the prior cost/workload table remains a scenario.

## Try it without credentials or AI charges

Run the root Storybook command with the project's Node runtime:

```sh
npm run storybook
```

Open **Content → Batch review → Review Batch**, or `http://127.0.0.1:6006/?path=/story/content-batch-review--review-batch`.

1. Choose an exercise from **In deze set**, or **Kies een oefening** on your phone. Choose “Spelen” to inspect its blockers; its simulated clear AI flag does not override them.
2. Click **Bewerk Spelen**. Set the question to `Lina __ (spelen) buiten.` and the explanation to `Bij Lina hoort speelt.` Save the new version.
3. Check that it becomes version 2, the mechanical blockers disappear and the old AI finding is stale.
4. Check **Meenemen in selectie**, then open **Beslis over selectie (1)**. Inspect the exact selection, enter a review note and check the human-review confirmation. Approve the selection.
5. Select the approved exercise again, reopen **Beslis over selectie**, confirm and choose **Goedgekeurde selectie publiceren**. Publication stays local synthetic.
6. Press **Start** on the timer: the large counter advances each second; **Opgeslagen** updates on the ten-second save or pause. Pause or switch windows to stop counting. The **Save Failure** and **Timer Save Failure** stories demonstrate failed edits and failed time saves.

Storybook uses an explicitly labelled in-memory transport: refresh resets its demonstration. It does not create human approval in PostgreSQL. The actual saved page needs the existing local synthetic database and authenticated bootstrap operator with recent MFA; there is no production guardian sign-in form yet. Do not point it at the benchmark database or a remote database. The simplest reliable test of persistence and authorization is the automated built journey below.

```sh
npm test -- src/modules/content/review/review-contract.test.ts
npm run test:stories -- src/modules/content/review/
npm run test:saved
```

For efficient debugging after an existing fresh build, the disposable database runner also accepts one or more explicit test paths:

```sh
npm run test:identity -- --built tests/identity/content-review.test.ts
```

It creates and removes its own isolated database, applies/replays migrations, provisions a synthetic operator, then tests the built browser against an ephemeral loopback port. No real identity, key or paid provider is involved.

## Remaining scope

Full D14 remains open: general batch intake beyond this fixed demonstration, real recorded advisory import, reviewed family certification and complete reading-bundle flows, weekly review-time reporting and user visual acceptance. Production generator routing, objective-based stock replenishment, independent assessment/retention stock, D15 quarantine/corrections and real-learner release remain their own roadmap dependencies. No independent human reference approval is inferred from this technical slice.

Next specific D14 task: generalize the reviewed v2 batch intake to an explicitly saved batch manifest and persist exact-version advisory provenance, while reusing this review UI and transaction boundary. Keep real dispatch disabled unless separately authorized. Family certification and reading-bundle composition should then be added as separate bounded slices.

## Executed verification — 23 October 2026

Node 24.22.0: **188 unit tests / 43 files**, standalone production build plus **84 PostgreSQL/built integration tests / 9 files**, **13 fresh/replayed migrations**, **20 focused Storybook interaction/axe checks / 3 files**, and **10 learning-path built browser regressions** passed. Typecheck, lint and Storybook production build passed. A final Dutch field-name copy refinement passed all five D14 stories. Formatting, local document targets, whitespace and original D13 fixture/human-decision hashes were checked.

The five D14 database/browser scenarios include anonymous, hostile-origin, ordinary-adult and stale-MFA denial; mechanical blockers; atomic rollback after a later review conflict; exact-version edit replay and stale selection rejection; preservation of prior published revisions; cursor/timer persistence and replay/cross-tab fencing; and a built keyboard edit → reload → approve → publish → reload journey. The browser checks private content is withheld after sign-out and runs axe/no-overflow checks at 320, 768, 1024 and 1440 pixels. Desktop and 320px content/editor screenshots were inspected; no baselines were changed.

Initial missing-module RED, incorrect publication-relation selection, localhost/127.0.0.1 test-origin mismatch and exact-label/async story assertion failures were corrected before the passing runs. Existing PostgreSQL client deprecation, browser color-environment and Storybook build warnings remain. No full Storybook/visual/device/Safari/manual-screen-reader suite, populated prior-version migration rehearsal or remote CI was run. No migration touched the benchmark database or VPS. No paid model request, real learner data, independent educational approval or deployment occurred. The €3.589906 October commitment and €6.410094 remaining allowance are unchanged.

## Revision 2 verification — 23 October 2026

The live-counter regression was first observed failing against revision 1. The final revision passed **188 unit tests / 43 files**, **23 focused Storybook interaction/axe checks / 3 files** (eight D14 stories), and the production build plus **84 PostgreSQL/built integration tests / 9 files**. After the final phone-picker refinement, a fresh standalone build and all **five focused D14 database/browser tests** passed again. The built journey now covers keyboard queue navigation, resume to the edited exercise, separate selection/decision stages, live seconds before the first persisted tick and the phone picker. Story coverage includes live versus saved time, pause stability, failed timer save recovery, blocked mixed selection and confirmation reset after removal. Root lint, typecheck, formatting, local document targets, whitespace and the Storybook production build passed; **10 learning-path built browser regressions** also passed. Original D13 fixture and human-decision SHA-256 hashes are unchanged.

Additional Chromium inspection checked no horizontal overflow and axe at 320/768/1024/1440px, plus phone decision/editor navigation guards. Desktop, phone, blocked, edit and selection screenshots were inspected. Initial accessible-name, test-locator and story typing failures were corrected before passing final checks. No visual baselines were changed. Full visual/Storybook suites, physical devices, Safari, manual screen readers and remote CI were not run. No backend approval rule, schema, model call, budget, benchmark fixture or independent human decision changed. Revision 2 is ready for user review, not visually approved.

## D14-S1 supply connection — 23 October 2026

The user subsequently assigned the one-category reusable-supply system before wider review expansion. [D14-S1](d14-reusable-supply.md) adds the saved weekly Optellen overview and explicit supply review lane, reusing this workspace and timer. It admits bounded new/edited versions, reuses published stock and keeps deterministic findings distinct from simulated Haiku advice. This extends the local technical workflow; neither UI acceptance nor educational certification is implied. The task ledger owns the current next action and exact verification.

The local `20261026000000_optional_content_review_notes` migration replaces the database nonempty-note check with a 16,000-character maximum. It changes no existing notes, decision records, immutable triggers or publication constraints. Ordinary API and UI allow omitted/blank/short notes; other review/correction flows keep their own required reasons. Local migration install/replay is covered by the saved runner; no remote migration is performed.
