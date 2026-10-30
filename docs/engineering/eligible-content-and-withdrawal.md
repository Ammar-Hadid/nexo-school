# Saved eligible content and withdrawal — D14-S4 / D15

**25 October D04-M1 follow-up:** the saved workflow can now be tested from ordinary browsers with retained local accounts. Use the [portal setup and rehearsal](local-portal-access.md); the temporary automated rehearsal below is historical evidence, not the user access path.

24 October 2026. User-authorized local engineering assignment following acceptance of D21-P1 as a tested technical milestone. **Implemented and Tested; verification below. New delivery/withdrawal presentation and policy are In Review.** Existing exercise, sign-in and guardian presentation approvals remain intact. Synthetic test approvals do not certify educational content.

## What is connected

The existing D10 immutable content/rubric/review/publication records now feed the existing D05 `Assignment` / `AssignmentItem` mechanism. There is no second assignment store, review engine or scorer. Subject-owned delivery adapters currently recognize the existing D14-S1 arithmetic stock and D21-P1 closed Spelling bank. Other content can be stored/reviewed as before but remains unavailable for saved delivery until its bounded presentation/evaluation/metadata adapter exists.

`src/server/content/eligibility.ts` is the shared current eligibility projection. It checks exact content/rubric/coverage hashes, latest content and rubric revisions, exact human review and local-practice publication, withdrawal, deterministic blockers and a supported subject descriptor. Individual local practice review is sufficient for this **synthetic manual-practice lane**; no family educator certificate is inferred. Unknown/missing source metadata, unsupported evaluators, drafts, rejected/unpublished records, stale versions and withdrawals fail closed. Existing unchanged published stock needs no repeat approval. Automatic certified-family publication and production educational eligibility remain open D14 work.

`delivery-adapters.ts` resolves family, exposure identity, supported evaluator, response format and practice purpose from the existing subject-owned contracts, not caller claims or model confidence. The arithmetic catalogue was extracted unchanged from the existing supply adapter. Spelling uses its original exact bank/rubric checks. Frozen D11/addition/Spelling packages and source attestations are unchanged. New teaching-addition packages are still separate review packages; this task does not manufacture ContentVersion rows or certificates for them.

`AssignmentItem` has mutually exclusive immutable references to either a legacy D05 synthetic question or an exact D10 content version/hash. The latter already pins the exact rubric ID/hash through restrictive foreign keys. Each new item also freezes family, exposure and purpose. Learner DTOs whitelist the prompt/response shape and never include the private payload, keys, grading rules or review notes. The same source resolver serves submission, guardian results and shadow reads. The server uses the existing deferred-retry lifecycle, integer parser and scoring policy; the Spelling adapter preserves case/surrounding-space normalization while counting spelling, accent, punctuation and internal-space errors. Teaching explanations remain second-miss-only.

The existing explicit D05 seed request is retained for synthetic regression compatibility. The new guardian workflow always requests `source: published-practice`; no public production source, fallback to the seed, or new startup publication is enabled.

## Selection, shortages and workload

`POST /api/practice/assignments` additionally accepts the exact object `{studentId, requestId, source: 'published-practice', coverageId, count}` with 1–10 items. D03 assign permission and the existing authenticated transaction remain authoritative. The server selects exact eligible versions, groups correlated exposures and excludes those assigned to this pupil within the existing provisional 14-day practice cooldown. Legacy D05 pairs count too. Assignment is conservatively treated as exposure even before an answer. This is a practice reuse limit, not an evidence-validity or mastery threshold.

Selection is all-or-nothing. A shortage returns requested, available and missing counts without creating an assignment or silently substituting content. No client can request confirmation/retention purpose or override certification. Repeated actor/request IDs return the same pinned task; changed inputs conflict. After withdrawal a retry may return that existing, now-paused task ID; it creates no new assignment. The guardian browser retains an uncertain request and its form fields across reload in session storage until the server acknowledges it.

The delivery page reuses saved review-time telemetry and reports current pending work. D14-S1 retains its weekly admission limits and active-time stop. Its eligible bank counts now use the common projection and withdrawn reservations stop contributing available stock. Existing historical reservations remain immutable; an old reservation cannot bypass current issuance eligibility. The 15–30-minute weekly workload and 50–200/day capacity are still targets, not measured achievements. There is no new intake budget, AI request or scheduler.

## Withdrawal and correction policy

The local bootstrap operator with MFA verified within five minutes can withdraw an exact content version/hash with a reason and guardian note through `/api/guardian/content-delivery`. Ordinary guardians cannot gain authoring/withdrawal authority through assign/view permission. Same-origin checks, bounded input, revalidated identity and no-store responses follow the existing content workflow.

Withdrawal appends an immutable `ContentWithdrawal` and audit in one transaction. It never edits the original content, review, publication, assignment, attempts or receipt scores. The content lifecycle uses one PostgreSQL advisory transaction lock; database triggers serialize content/rubric creation, publication, assignment membership, withdrawals, correction links and attempt/presentation writes. New membership requires a current reviewed publication, and all subsequent writes to an affected task are blocked. Normal APIs cannot remove or reverse withdrawal.

- **New assignments:** withdrawn content is excluded immediately. Publication/review retries cannot reactivate it. Database guards reject fresh publication/review inserts for withdrawn versions.
- **Unfinished tasks:** the whole task is paused. Drafts and committed attempts remain stored, but Continue, draft changes, answer submissions and old receipt replay are refused. The student sees a neutral pause notice; there is no penalty, automatic replacement or forced restart.
- **Completed tasks:** original facts remain. Guardian results carry the reason and correction status, withhold the usable score and defective answer model, and clearly identify the history as affected. No silent rescoring occurs.
- **Impact:** the operator can identify affected task/item IDs and attempt IDs within current guardian view rights, including assignments without attempts. The guardian's actual result lists the affected items and notes.
- **Correction:** edit the original through the existing review workspace to create a new immutable revision, explicitly review and publish it, then link it through `ContentCorrection`. The link requires the same content identity/coverage and a newer currently eligible version. It appends actor, exact replacement hash, note and time; retries are idempotent, conflicting changes fail. It does not replace an issued question or unpause old work. Future assignments use current eligibility and still respect the original exposure group.

There is deliberately no compensating grade or automatic reassessment in this slice. The safe interpretation is invalidation/exclusion plus preserved historical facts. A later educationally authorized evaluation-revision workflow would append its own provenance, not mutate these attempts. Future learner-requested repeats or cancellation/closure of paused tasks remain D25/D26.

The existing saved-evidence shadow reader now identifies current withdrawal with source policy `saved-source-withdrawal-v2`, including for a historical attempt cutoff. This prevents replay from reviving a now-known defect; current status and source policy participate in the report fingerprint. The shared assessment evaluator/thresholds are unchanged and activation stays disabled. Synthetic practice and missing assistance/reviewed mappings still cannot establish mastery. D29–D31 remain separate gates.

## Try the real local workflow

Use Node 24.22.0 from `.nvmrc`, Docker and the repository's installed Playwright Chromium. Run:

```sh
npm run test:content-rehearsal
```

This builds the app, creates a disposable PostgreSQL container with random private credentials, applies/replays migrations and opens **two authenticated Chromium windows** using actual Better Auth/MFA and a virtual student passkey. It executes the complete synthetic review → publish → assign → lost-response retry → saved draft → browser context reopen/server restart → answer → guardian result → withdraw journey, then leaves those windows open. Console output gives the actual ephemeral localhost links. No caller database, benchmark database or VPS is migrated. The simulated review is labelled test-only throughout; it creates no actual educational approval.

In the guardian window:

1. Open `/guardian/content/assignments` and inspect the withdrawn example and affected task. `/guardian/results` shows its preserved attempts and withdrawal notice.
2. Open `/guardian/content/supply`, request more stock, then use its existing review page to inspect, approve and separately publish additional **synthetic** items. Alternatively open `/guardian/content/spelling` to initialize and review its existing closed bank.
3. Return to `/guardian/content/assignments`, choose the synthetic pupil/category and a count within available stock, then select **Taak klaarzetten**.
4. In the student window open `/student`, start the task, answer, save a draft if needed, and reopen it. Confirmed answers save automatically; unsubmitted draft text requires **Bewaar concept**, preserving the approved D07 contract.
5. Review the actual result, then expand an item in the delivery page, enter a reason/note and choose **Versie intrekken en taken pauzeren**. Reopen the student task and guardian result.

Use the authenticated windows: another browser does not inherit their sessions. The operator's five-minute recent-MFA window is intentionally retained; restart the command if it expires. Close Chromium to finish and remove the disposable database; do not use this rehearsal for real learner information. There is no new production guardian login/enrollment UI.

With an already configured and authenticated local synthetic app the same routes are available at its origin:

- `/guardian/content/supply` and `/guardian/content/spelling`: existing review/publication.
- `/guardian/content/assignments`: new issuance, impact and withdrawal/correction controls.
- `/student`: saved learner tasks.
- `/guardian/results`: actual saved results and correction notices.

## Verification and handoff

Executed results are recorded in the [task ledger](../../tasks/todo.md#current-position-and-handoff): 214 unit tests, 117 full saved-work PostgreSQL/built checks, 47 focused stories and 12 focused E2E checks passed. After the last exact-rule guard, 25 targeted PostgreSQL/built checks passed again. Next and Storybook production builds, strict typecheck, lint, formatting and family-source checks passed. After the phone select-grid width repair, a fresh standalone build and all eight saved-browser tests passed again; overflow checks include the guardian scroll container. The headed rehearsal reached its handoff screen and browser-close cleanup was verified. Its native windows could not be directly inspected while the Mac was locked; browser-rendered phone/desktop screenshots were inspected. The new unit test checks exact subject metadata and altered/unknown-source rejection. Nine new PostgreSQL scenarios cover eligible pins/private projection, exposure shortage/idempotency/reconnect, drafts/stale versions/purpose/permission denial, incomplete/completed withdrawal, separately reviewed correction, immutable history, invalid source/rubric versions, audit rollback and assignment/submission races. Existing identity, content review/supply and saved-learning tests remain intact.

The new built authenticated browser journey reviews/publishes through the existing UI, issues through the new UI, loses an assignment response and retries after reload, saves/reopens after server restart, answers and reads the real guardian result, withdraws and proves blocked reissue/current feedback suppression. It checks learner HTML/RSC/scripts for private evaluator/key markers. New delivery screens and guardian corrections have Chromium axe/no-overflow checks; screenshots are ignored under `.artifacts/d14-s4-d15/`. Four new feature stories cover published stock, shortages, withdrawn content and an empty account.

No visual baseline update, paid AI, remote migration, deployment, real learner trial or educational approval occurred. Physical tablet/iPhone/Safari, manual screen readers, full unrelated E2E/visual suites, remote CI and a populated prior-schema upgrade remain unverified. Fresh installation/replay is not a populated-upgrade claim. Existing PostgreSQL client deprecation warnings are retained in logs.

Next dependency-ready assignment: **the bounded saved multi-subject rehearsal** using the same eligibility/assignment/withdrawal boundaries. Rekenen and this one Spelling format now have saved adapters. Add representative Taal, Begrijpend Lezen (including immutable passage/reveal handling) and daily Redactiesommen (D19 reasoning requirements remain) with eligible reviewed or explicitly synthetic test fixtures; do not claim full category coverage. Then implement D24/D25 scheduling/carryover. Full D14 supply/certification, all 210 curriculum requirements and D29–D31 qualification remain open.
