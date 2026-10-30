# Authoritative answer submission — D06

20 October 2026. **Implemented and tested; complete for local synthetic acceptance.** Following the user's instruction to move from D05 to D06. D05 is accepted for synthetic testing; production template and skill certification remain D10/D11. Reuses [immutable assignments](immutable-assignments.md), [approved-browser authentication](student-browser-auth.md) and the [approved Rekenen exercise contract](../design/rekenen-task.md). No new educational thresholds, UI or Nexai copy.

## Behavior and ownership

`src/server/practice/submissions.ts` is the server-only command and saved-progress adapter. It loads the student's pinned assignment, verifies the active item/revision and grades against the immutable server answer. The client cannot supply correctness, score, retry number, student identity or evaluator versions.

The pure practice-owned `assignment/submission-state.ts` replays committed facts through the existing `recordPreviewAnswer`, `advancePreview` and `previewScore` transitions. It does not import specimen questions, construct fake completed scenarios or run assessment/progression. This preserves original order, deferred identical retries in original miss order, two attempts maximum and first/second/incorrect weights 1 / 0.5 / 0. Incomplete work has `result: null`; completed results distinguish solved counts from weighted score. An all-original-correct task finishes without a retry round. There is no retry announcement or extra readiness step.

`integer-exact-v1` accepts the approved trimmed ASCII digit grammar of one to six digits. Leading zeros normalize; raw input remains preserved. Empty values, signs, decimals, exponents, Unicode numerals and longer numbers are invalid, consuming no chance. HTTP raw input is bounded to 64 characters and JSON to 1 KiB. This is the synthetic whole-number contract, not a future fractions/decimal parser.

First misses and correct retries never expose the key or explanation. A second miss returns that item's correct answer and a fixed synthetic worked sum only. This is not personalized AI help or a new approved teaching explanation. Existing practice-screen explanations remain unchanged. D07 must preserve feedback presentation; D32 owns the personalized-help requirement.

## Immutable records and transactions

`202610200005_authoritative_submissions` adds `PracticeAttempt`: exact raw answer, normalized answer, correctness, score in half-point units, evaluator version, `deferred-retry-v1` policy version, received time, sequence, attempt number, request hash and exact safe response. The immutable assignment item pins the question/content/skill versions. Composite foreign keys prevent attaching an attempt to an item in another assignment. Database uniqueness covers request ID per assignment, sequence per assignment and attempt number per item; checks enforce the two-attempt bound and coherent score units. Runtime updates/deletes of attempts are denied by the existing immutable-fact trigger. Future correction/deletion workflows need separately designed append/maintenance paths; no correction API is implied.

D04 authentication, student scope, attempt and audit write share its transaction/advisory lock. An assignment row lock additionally serializes trusted in-process command calls. No provider work occurs inside the transaction. Audit/storage failure rolls back the attempt; retrying the same command after rollback is safe. No response is sent until the transaction commits.

The request ID remains with the immutable attempt. Same assignment/request ID and exact payload returns the original saved receipt, even after later progress. Different valid payload with that ID returns `409 REQUEST_CONFLICT`. A new ID with a stale revision, wrong active item, early retry or completed task returns `409 STALE_ITEM`. Malformed inputs return 400. Replays still require current approved-browser authentication and ownership; revoked access cannot replay historical feedback.

Progress is reconstructed from immutable attempts rather than a mutable score counter. Database reconnection preserves it. Each stored policy version is checked before projection; future policy changes must introduce explicit version handling rather than reinterpret old facts silently. Versioned corrections/evidence remain later roadmap tasks. Correct answers do not award mastery, advancement or a gamepas.

## API for D07

Uses the same opt-in local synthetic configuration as D05. All responses are no-store. POST requires the exact configured Origin; GET requires that Origin or same-origin Fetch Metadata. Unauthenticated adults/generic student sessions cannot use these student endpoints. Missing and unauthorized assignment IDs have the same denial. Unsupported methods, query parameters and extra body fields are rejected.

| Request                                       | Contract                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/practice/assignments/:id/attempts` | Exact JSON `{requestId, itemId, expectedRevision, answer}`. Request/item IDs are UUIDs; expected revision is the number of committed attempts (initially zero). |
| `GET /api/practice/assignments/:id/progress`  | Returns `{progress, lastSubmission}` from committed records. Empty assignment has revision zero and no last submission.                                         |

The receipt contains attempt ID, item ID, attempt number, submitted input, correctness, progress and an optional second-miss-only solution. Progress contains revision, next item/attempt number or null, per-original outcomes, and final result or null. It contains no unrevealed evaluation keys. These student projections are separate from the private database records.

D07 should generate a stable request ID before sending, retain it across network retries, show the receipt as feedback, then advance presentation on the existing Continue action. Submission commits advance the server's active question; the saved last receipt permits restoring feedback after reload. An old replay intentionally returns its original progress; fetch current progress to reconcile concurrent tabs. Assignment revision (immutable content revision, currently one) and progress revision (committed-attempt count) are different concepts. Draft saving, feedback acknowledgement state, real learner routes and client integration remain D07; this step does not claim those are implemented.

## Verification

Executed on Node 24.22.0:

- **129 root unit tests / 26 files passed**, including integer grammar, independent 8.5/10 outcome, retry order, invalid histories, sole-item retry, zero/perfect scores and existing assessment regressions. Initial red test failed before the new module existed.
- **41 PostgreSQL integration tests / 4 files passed**: existing identity/assignment cases plus five submission cases. Fresh five-migration install and replay passed. Covers exact raw/normalized attempts, key timing, 8.5 weighted versus 9 solved, immutable attempts, real virtual-passkey HTTP submission/replay/progress/revocation, invalid input, concurrency with same/different request IDs, stale revision, premature/third attempts, ownership/role denial, audit rollback and same-command recovery. Disconnect/reconnect recovered identical saved feedback and final score.
- **22 relevant Chromium Storybook interaction/accessibility checks passed** across Rekenen and automatic learning paths. Existing UI and educational decision rules are unchanged.

**29 targeted built Playwright checks passed** across local identity/API disclosure, automatic learning path and connected practice journey. Typecheck, zero-warning lint, Prisma validation, root formatting, Next standalone and Storybook builds passed; the Storybook build retains the known module-directive warnings. Local documentation links and Git whitespace checks passed. The disposable test database containers were removed. This is targeted verification, not an aggregate `npm run check` claim. No physical-device/Safari, full visual suite, remote CI, populated prior-version upgrade, VPS migration, live AI or real learner data. No new shared components or stories; no visual or educational approval claimed.

## Next handoff

D07 is next after D06 technical verification: integrate the approved screens with these protected assignment/submission/progress endpoints, implement the explicit draft and feedback/resume contract, and verify failed saves, close/reopen/server restart and concurrent tabs in the built application. Preserve exact approved Nexai wording. Do not reopen D05's synthetic acceptance or treat it as production educational certification.
