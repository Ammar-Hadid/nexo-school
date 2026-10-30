# Saved student journey — D07

**22 October 2026 user approval:** the user explicitly approved D07, D08 and D09 and authorized D10. Approval covers the delivered bounded local synthetic revisions, including D07 saved/error/resume presentation and D08 saved guardian presentation. It does not certify educational content, approve assessment revision 3 or authorize deployment/real learner data.

20 October 2026. **Implemented and tested for local synthetic technical acceptance**; saved/error/resume presentation **Approved on 22 October 2026**; shared sign-in revision 2 was Approved on 21 October. Builds on [D04 identity](student-browser-auth.md), [D05 assignments](immutable-assignments.md) and [D06 submissions](authoritative-submissions.md). No educational policy, production content certification, VPS migration, real learner data, live AI or deployment.

## Routes and ownership

`/student` signs in with the existing library passkey client on an already guardian-approved browser. Enrollment/guardian approval/recovery still use D04's operator/test surfaces; this is not a newly completed guardian authentication UI. The approved task overview lists this student's latest 100 synthetic assignments, with category labels and factual planned/active/done status. It does not implement today's schedule or blocks (D24/D25).

`/student/assignments/:id` loads key-free question presentation and protected progress. The shared `ExerciseScreen` receives server-backed callbacks and a projected snapshot; its saved path never calls preview grading. `rekenen-presentation.ts` contains only approved presentation copy and companion selection, shared with the existing preview. The saved route does not import specimen questions or evaluator keys. First misses and correct retries reveal no solution. Second misses show only D06's authorized solution; final results reuse the approved solved-count presentation. Weighted scoring remains D06-owned.

The client initially renders a loading shell, without learner content in HTML/RSC. Every data operation revalidates the D04 session and browser grant. Denial removes learner content from the controller. No role switch, assignment creation, learning-path inference or gamepas is added.

## Explicit save/resume contract

- Typing changes only the mounted draft. The page explicitly says it is not saved. **Bewaar concept** persists the exact text; success is announced only after a confirmed write and read. Empty drafts may be saved. Invalid answers remain ungraded and consume no attempt.
- Navigating through **Mijn taken** while dirty/pending stays on the exercise and asks the learner to save. Browser unload warns where supported. Unsaved typing is not promised to survive closing, history navigation or a crash. **Laad opgeslagen werk** intentionally replaces the local draft with committed server state.
- Submission first saves the draft when needed, including a server-generated request ID. The subsequent D06 command uses that ID and the original progress revision. Uncertain network outcomes retain the command identity; retrying a committed command cannot consume another chance. Reload after an uncertain response reads actual committed facts.
- Committing an attempt advances D06's server cursor but does not dismiss its feedback. **Verder** persists acknowledgement before moving the screen. Reload, closing/reopening the browser with its cookies, and restarting the server restore unacknowledged feedback, an acknowledged next question, a saved draft or the completed result.
- UI reports **Opslaan niet bevestigd** on transport/server failure, never a successful save. A stale tab receives 409; the controller reloads current work and asks the learner to check it. If reconciliation itself fails, it shows an unavailable state instead of falsely claiming a reload succeeded.
- No localStorage, sessionStorage or URL-serialized answers. Existing authentication cookies remain library-owned. Expired/revoked sessions must sign in again; saved work stays in PostgreSQL.

## Storage and API

The additive `202610200006_saved_journey` migration adds mutable `PracticePresentation`, one row per assignment: a compare-and-set version, the progress revision the draft belongs to, acknowledged revision, exact draft and request ID. Immutable `PracticeAttempt` remains the source of score/correctness. Older assignments default to no draft and unacknowledged last feedback; no prior attempts are rewritten.

`POST /api/practice/assignments/:id/presentation` accepts exactly `{action, answer, expectedVersion, expectedRevision}`. Action is `draft` or `continue`; continue requires an empty answer. Drafts are bounded to 64 characters and the existing 1 KiB HTTP body limit. Exact origin, active student ownership, assignment row lock, revision/version checks and atomic secret-free audit apply. Draft writes cannot bypass feedback acknowledgement or reopen completed tasks. Failed transactions roll back presentation/audit together. Repeating a stale presentation mutation reconciles via 409; immutable submission idempotency remains D06's separate contract.

`GET .../:id/progress` adds the minimal presentation DTO to D06's existing response. `GET /api/practice/assignments` returns only owned task IDs, titles, item counts and derived statuses, bounded to 100. Both preserve no-store and same-origin protections.

An integration fix in the existing auth handler reconstructs the size-checked POST request from URL/method/headers/body. Cloning Next.js's wrapped Request directly raised Node 24's private-state TypeError in built routes. The existing size/origin/field checks remain intact.

## Verification and handoff

Executed on Node **24.22.0** (the first exploratory typecheck/integration run used the host's Node 25; all completion evidence below was rerun on the required Node 24):

- **132 unit tests / 27 files passed**, including exact draft revision handling, restored feedback and final feedback/result acknowledgement.
- **43 PostgreSQL integration tests / 4 files passed**, including the built standalone journey using real Chromium virtual-passkey registration/sign-in. Fresh six-migration install and replay passed. Draft save failure, lost committed response/replay without an extra attempt, complete browser process close/relaunch with preserved cookies, server process restart, continued feedback acknowledgement, concurrent tab draft conflict, both deferred retries, 9 solved/8.5 weighted result, completed reload and revocation denial passed. Owned/list reads, malformed presentation payloads, cross-origin denial, transactional rollback and reconnect are covered. This uses synthetic test identities and cookie-state restoration, not physical-device qualification.
- **20 targeted Storybook interaction/axe checks** across Rekenen, connected journey and three new saved-state specimens passed. The saved specimen confirms Submit invokes the server callback without locally grading.
- **29 targeted built Playwright regressions** across identity/disclosure, connected journey and learning-path screens passed. The new built saved route additionally checked its HTML, RSC and loaded scripts for private evaluator/seed/record identifiers.
- Typecheck, zero-warning lint, Prisma validation, Next standalone build and Storybook build passed. Storybook retains known module-directive warnings; one integration run emitted a pg concurrent-query deprecation warning, without a test failure.

Desktop 1280px and mobile 390px screenshots were inspected; no horizontal overflow, meaningful page content, accessible input/controls and axe violations checked (zero violations in the saved question state). No uncaught app errors were observed. Network failures deliberately injected by tests and missing artwork requests are separate from app exceptions. Browser plugin not available; repository Playwright/Chromium was used. Inspection captures are temporary `/tmp/nexo-d07-1280.png` and `/tmp/nexo-d07-390.png`, not approved visual baselines.

**Known visual limitation:** standalone packaging currently copies `.next/static` but omits `public/nexai`. The inspected built screen shows a broken-image placeholder; the question, exact approved message, answer, feedback and actions remain usable. This is a concrete D09 packaging handoff, not a claimed visual pass or approval. Existing Storybook artwork still renders. D07 has not silently implemented or completed D09.

Initial built verification failed at the existing auth Request clone; the reconstruction fix above resolved it and the full integration run passed. Initial typecheck/lint issues were corrected. Full Storybook/E2E/visual suites, physical devices/Safari, manual screen reader, remote CI and populated prior-version upgrade were not run. No baselines were updated. Existing unrelated work remains uncommitted and preserved; no broad baseline commit was made.

The ledger remains authoritative. Root `npm run test:saved` builds the standalone app and runs the disposable PostgreSQL identity suite with the additional built Chromium/virtual-passkey journey. It must be run for changes to this integration; regular `test:identity` retains handler-level tests without claiming built UI evidence. New saved-state Storybook stories are review specimens, not mocked persistence evidence.

D08 owns guardian result integration. D09 owns standalone artwork/font packaging and delivery qualification. No migration after D02 has been applied to the VPS. These local tests do not qualify physical tablet/Safari/passkey sync, real learners, production operations or educational validity.

## 21 October sign-in presentation revision

D07-UI revision 2 replaces the bare `/student` sign-in with the [shared student/guardian sign-in composition](../design/sign-in.md), explicitly Approved by the user on 21 October 2026. Existing passkey authority and saved-task rendering remain; unavailable services now show a retry state instead of implying the browser simply needs authentication. The 43-test built saved-journey integration suite passed again. Guardian context/password/code remain design specimens, not implemented auth methods. See the design contract for current files, exact UI verification and review link. D08 remains dependency-ready but must not start until the user resumes it; D09's existing artwork packaging gap remains open. [D07 approval and next-agent handoff](../../tasks/d07-handoff.md).
