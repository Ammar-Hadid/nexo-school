# Saved multi-subject rehearsal — D14-S5

29 October 2026 · User-assigned local synthetic implementation. Verification and completion status are recorded in the [task ledger](../../tasks/todo.md#current-position-and-handoff). The existing Guardian R3 visual language and question/answer detail pattern remain Approved; this integration does not confer educational certification or enable scheduling/mastery.

## Scope and reuse

The saved journey now composes all four subjects through the existing content review/publication, eligible-stock selection, immutable assignment, authoritative submission, draft/feedback acknowledgement and Guardian result boundaries. Redactiesommen is a category of Rekenen. No alternate account system, storage service or publication lane is introduced.

| Format                               | Rehearsal stock                                                                 | Response and limits                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Rekenen · Optellen                   | Existing eligible arithmetic supply                                             | Existing exact integer grading                                                                                               |
| Spelling · Regelwoorden              | Existing ten-word doubling bank                                                 | Existing case/outer-space normalization; spelling errors remain errors                                                       |
| Taal · Woordsoorten                  | Two original verb-identification design specimens                               | One inflected word from the sentence; ignore case/outer spaces only; invalid multiword/punctuation input consumes no attempt |
| Rekenen · Redactiesommen             | Two original addition stories, including the question in one continuous passage | Exact integer final answer; unit shown with the field; no operation/calculation/independent-unit assessment claim            |
| Begrijpend Lezen · Informatie vinden | One question from the original six-paragraph “Een tuin voor iedereen” passage   | Four original options with stable choice IDs; full immutable passage retained; one question per passage exposure             |

These are small synthetic technical fixtures, not full category coverage, placement at Adam's level, independent assessment stock or proof of suitable daily supply. D19 reasoning, D20 broader formats and D22 varied passage/rubric/reveal requirements remain open. The reading adapter deliberately admits one question for this passage; its exposure group prevents a second assignment during the existing stock cooldown. Consequently an explanation cannot supply an answer to another question in this rehearsal. This does not claim a general multi-question reveal-dependency engine, and stock cooldown never establishes independent learning evidence.

New review batches use `exercise-v2`, exact source/rubric matching and shared mechanical blockers at draft/review/publication. Changed prompts, keys, explanations, passages, options or provenance cannot inherit eligibility. New content needs a deliberately versioned source and its own review. Publication remains a separate explicit action with the existing actor, origin and recent-MFA checks. No content is automatically inserted, reviewed, published or assigned in the retained app during delivery.

## Try it with the retained accounts

Use the existing [local portal setup](local-portal-access.md) and ordinary sign-in at localhost:3060. Do not reset or rebootstrap the accounts.

1. Open **Oefenvoorraad**. Existing arithmetic and Spelling links remain. New links open **Taalproefset beoordelen**, **Redactiesommen beoordelen** and **Leesproefset beoordelen**.
2. On each new review page, use **Proefset klaarzetten**, inspect the full question, private model and explanation, select the intended version and record your review. Then publish the approved selection separately. Initializing/retrying creates no duplicate versions and grants no approval.
3. Follow **Een sessie klaarzetten**, choose the existing synthetic learner/category and one or two exercises. Choose **one** for the reading rehearsal. Already exposed, unpublished or withdrawn stock produces a visible shortage, not substituted content.
4. Sign in through the existing approved student browser. Open each task from **Mijn taken**, save a draft or radio choice with **Bewaar concept**, close/reopen, submit and continue through any deferred retry. Confirmed submissions and feedback acknowledgements survive reload/restart. Unsaved typing still has no persistence promise.
5. Open Guardian **Resultaten**. Inspect exact attempts in the approved shared cards, the original options, full reading passage and word-problem unit. Incomplete scores and unresolved answer models remain withheld. Withdrawal still pauses the task without erasing its history.

Routes: `/guardian/content/rehearsal/taal`, `/guardian/content/rehearsal/redactiesommen`, `/guardian/content/rehearsal/reading`. The existing `/guardian/content/review` remains its historical nonassignable review demonstration.

## Technical boundaries

- `src/server/content/rehearsal-batches.ts` registers the five bounded specimens against real coverage requirements, without claiming category completion. Existing eligible-stock and withdrawal transactions own delivery authority.
- New versioned finite graders are `taal-word-exact-v1`, `redactiesommen-integer-v1` and `reading-choice-exact-v1`. Invalid response syntax never consumes a chance. Unknown evaluators fail closed. Attempts preserve raw input and existing 1/0.5/0 weighted scoring and deferred identical retries.
- Public assignment items explicitly project only prompt, response type, optional unit, choices and reading context. The learner route imports key-free subject presentations. Private grading rules, keys and source catalogues stay on the server. First misses and correct retries reveal no model; second misses receive only that item's authorized explanation.
- Guardian results reuse `GuardianResultBrowser`, exact committed attempts, original options/context and existing score/model withholding. No rendering-owned grader or mastery rule is added.
- Migration `20261029000000_saved_multisubject` extends the existing evaluator constraint. It changes no account, content, assignment or attempt row. The prior integer/Spelling clauses remain. Roll forward; never drop new attempts or tighten the old constraint over incompatible new history.
- The source-bound Spelling family review gains immutable workflow package v3 because shared review/validation source changed. v1/v2 files and stored decisions remain intact; decisions are not transferred. Content, inventory, educational criteria and certification status are unchanged. Exact addition registry compatibility records cover only the known registry change, never arbitrary drift.

## Verification and next step

Run root `npm test`, `npm run test:saved`, affected subject/saved/Guardian/content/learning-path stories, lint/typecheck, application/Storybook builds and relevant built E2E regressions. Saved tests create disposable PostgreSQL instances and never target the retained database. The new built rehearsal uses real MFA/passkey-backed test identities across all five formats, saves/reopens every format and closes the browser context/restarts the application for reading. The existing ordinary-UI account journey remains a separate regression.

The ledger records executed results and omissions, including retained-data preservation. Full physical-device/Safari/manual screen-reader and educational qualification remain separate. No paid AI, remote operation, real learner data or deployment is part of D14-S5.

Next functional work: **D24 recurring Guardian limits/exceptions**, then **D25 daily assignment/carryover**. D14-S5 does not implement daily scheduling or guarantee daily Redactiesommen automatically.
