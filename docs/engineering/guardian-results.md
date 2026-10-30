# Saved guardian results — D08

**22 October 2026 user approval:** the user explicitly approved D07, D08 and D09 and authorized D10. Approval covers the delivered bounded local synthetic revisions, including D07 saved/error/resume presentation and D08 saved guardian presentation. It does not certify educational content, approve assessment revision 3 or authorize deployment/real learner data.

21 October 2026 · Local synthetic implementation. Visual presentation **Approved on 22 October 2026**. The user explicitly resumed D08 after reading the [D07 handoff](../../tasks/d07-handoff.md); the earlier hold is superseded for this task. The [ledger](../../tasks/todo.md#current-position-and-handoff) owns completion status.

## Contract

`/guardian/results` displays the existing guardian result composition using stored D05 assignments and D06 committed attempts. The current persisted content scope is the fixed synthetic Rekenen/Optellen family. Reading, spelling and other content remain available in the original preview only; this task does not claim their production persistence.

`GET /api/guardian/results` returns the most recent 100 authorized assignments, explicitly labelled as a bounded list. `GET /api/guardian/results/:id` returns one authorized result. The existing adult session boundary requires verified email and server-recorded MFA. Every request scopes its query to active `canView` supervision. Missing and unauthorized IDs return the same denial; students, missing sessions and MFA-less sessions cannot use this API. Exact-origin checks and `no-store` responses follow existing protected-route practice. No schema migration, new authentication method or role switch is introduced.

The response is a read-only DTO projected from ordered immutable attempts, using the existing versioned deferred-retry replay and guardian projection. Raw answer text is preserved, including spaces and leading zeros. Question order comes from the pinned assignment; second attempts remain attached to their original questions. No browser grading, draft, session secret, evaluator specification or request-id history is returned. Completed work separates solved count from weighted score (the mixed regression is 9 solved and 8.5/10). Unfinished work withholds the final score and unrevealed answer models. Completion here means all attempts are committed, independently of whether the student has acknowledged the final feedback.

Existing answer-model disclosure remains unchanged: completed work exposes its pinned models; unfinished work only exposes a model for an already-explained second miss. This is a factual exercise report, not mastery, effort detection, progression or educational validation.

## Presentation and reuse

- `src/server/practice/guardian-results.ts`: protected query and projection.
- `src/app/api/guardian/results/[[...path]]/route.ts`: fail-closed local synthetic adapter.
- `src/app/guardian/results/page.tsx`: route composition and navigation section selection.
- `src/modules/practice/guardian-results/guardian-result-contract.ts`: browser-safe DTO type.
- `guardian-results-view.tsx`: extracted shared feature renderer, retaining question disclosures, score explanation, keyboard focus and reading context for the original preview.
- `guardian-results.tsx`: original preview adapter; fixture imports stay outside the saved route.
- `saved-guardian-results.tsx`: network/session states; clears old results on refresh, retries failures and rechecks when the window regains focus.
- `saved-guardian-results.stories.tsx`: completed, unstarted and empty presentation specimens, Approved on 22 October 2026.

Guardian navigation revision 1, tokens, Button and approved shared sign-in layout are reused. Optional navigation `accountLabel`, `contextNote` and `mainContent` inputs preserve all existing preview defaults; the saved route uses neutral parent copy and makes the existing content region the page’s main landmark. Its viewport height fills the page without the preview toolbar allowance. Other navigation sections explicitly say they are unavailable and offer a return to results. There are no approve/repeat controls, student impersonation or fake working settings. The existing MFA session can access this bounded local route; the final guardian login/enrollment/recovery form remains separate. Signed-out copy states that limitation directly. Network states use the approved guardian sign-in shell without introducing a password/code/passkey decision.

Review the [completed specimen](http://127.0.0.1:6007/?path=/story/practice-saved-guardian-results--completed), [unstarted specimen](http://127.0.0.1:6007/?path=/story/practice-saved-guardian-results--unstarted) and [empty specimen](http://127.0.0.1:6007/?path=/story/practice-saved-guardian-results--empty). These are synthetic visual review stories, not evidence of persistence by themselves. Existing guardian result revision 1 remains In Review; shared navigation and sign-in approvals are unchanged.

## Verification

Executed evidence is recorded after the final run in the task ledger. The D08 PostgreSQL tests compare every projected attempt against stored rows, preserve raw retry text, check score/key withholding and exclude a saved private draft. Two genuine MFA guardian sessions verify wrong-family/list isolation, absent-resource equivalence, view denial and supervision revocation. Existing identity regressions cover expiry and session invalidation at the reused boundary.

The D07 built student journey now also opens an independent guardian browser context after student completion. It checks the actual saved 9/8.5 result, both attempts, keyboard detail focus, 390/1280px overflow and axe, student-session denial, and removal of result data after view permission is revoked. Additional built-route checks cover disabled configuration, signed-out, empty and network-failure states. The existing connected guardian/reading preview regressions protect the extracted renderer.

No full UI suite, visual baselines, physical-device/Safari checks, manual screen-reader review, populated prior-version upgrade, remote CI, VPS migration, real learner data, live AI or deployment is included. D09 still owns standalone Nexai artwork packaging. Existing Storybook module-directive and PostgreSQL client deprecation warnings remain. Technical tests do not confer visual or educational approval.

## Final executed evidence — 21 October 2026

Node 24.22.0: root unit suite **132 passed / 27 files**; final `npm run test:saved` **45 passed / 4 files**, including the built student/guardian journey and fresh/replayed six-migration install; focused guardian/navigation stories **13 passed / 3 files**; targeted saved/legacy guardian E2E **8 passed**. Typecheck, lint, application and Storybook builds, formatting, local document targets and whitespace checks passed. The earlier non-built identity run passed 44 tests; it omits the built journey and is not counted as an additional case in the final 45.

Initial built verification exposed an ambiguous disclosure selector and the missing page main landmark. A first landmark fix nested main inside the navigation region and failed axe; the final fix assigns main to the existing navigation content section. All relevant story and built checks passed after correction; no axe rule or baseline was weakened. Built desktop and phone captures were inspected at `/tmp/nexo-d08-guardian-1280.png` and `/tmp/nexo-d08-guardian-390.png`; these temporary files are not approved baselines. Existing Storybook review remains available on port 6007.

**Handoff:** technical D08 acceptance is complete; presentation was subsequently Approved on 22 October 2026. D09 packaging is the next dependency-ready roadmap task. No D09 implementation was performed here. Keep the existing dirty working tree intact; this chat did not commit or push it.
