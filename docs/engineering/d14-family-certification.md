# D14-S2 — Optellen family-certification workflow

23 October 2026 · Implementation user-authorized after approval of D14-S1. **Implemented/Tested; workflow In Review. Partial user format/scope approval recorded; explanation changes required; educational certification pending.**

The user's subsequent chat feedback approves the single-digit format and bounded procedural-practice scope and requests teaching explanations. It does not declare independent educator review or approve every criterion. The original package and database history are unchanged. [Inspection and incremental reuse handoff](../../tasks/d14-addition-reuse-handoff.md) records the required shared lifecycle and existing larger-addition code before further implementation.

## Bounded review and workload

The [review sheet](../../tasks/d14-optellen-family-review.md) and authenticated `/guardian/content/supply/family` route present the same proposed `d14-optellen-certification-v1` package. It contains the immutable D11 contract, all 100 generated variants, seven selected boundary examples, four educational criteria and exact source fingerprints. The package SHA-256 binds all those bytes. The original D11/D13 fixtures and reference decisions are unchanged.

The guided flow has three steps: scope, seven examples, four judgments. It uses the approved guardian shell and existing live/saved review timer, with optional technical details. The seven examples cover both-zero, zero on either side, below ten, exactly ten, crossing ten and the maximum. The four judgments cover scope/prerequisites, wording/accessibility, explanation, and response/evidence limits. Technical checks cover every sum; the human is not asked to certify the implementation or independently recalculate all 100.

The one-time estimate is about 15 minutes, **unmeasured**. Save and resume includes marked examples, all judgments, reviewer declarations and notes. A change/uncertainty can be recorded immediately without inspecting everything else; unanswered criteria remain unanswered. Positive approval requires all seven examples and all four accepts. Upfront family-review time uses its own package-specific progress record and does not consume or masquerade as the weekly Optellen item-review allowance. This is not proof of the global weekly workload target.

## Human authority and outcomes

D14-S1's delivery approval is now recorded separately; it does not certify this family. The [shared assessment policy](../product/assessment-policy.md#mandatory-agent-workflow) requires an actual independent educator for educational sign-off. The reviewer explicitly chooses role and basis and supplies notes. Educators also describe their own relevant qualification/experience. This is a **self-declaration**, not a credential-verification service, nor permission to invent an educator identity.

| Submitted judgment                                                           | Stored outcome                                      | Publication authority |
| ---------------------------------------------------------------------------- | --------------------------------------------------- | --------------------- |
| Partial positive draft                                                       | No final decision                                   | None                  |
| One or more changes required                                                 | `changes-required`; unanswered fields preserved     | None                  |
| Uncertainty without a required change                                        | `unresolved`; unanswered fields preserved           | None                  |
| Complete positive AI-assisted assessment                                     | `provisional`                                       | None                  |
| Complete positive independent guardian assessment                            | `guardian-feedback`                                 | None                  |
| Complete positive independent educator assessment with expertise declaration | `educator-approved` for this exact practice package | None in this slice    |

An explicit confirmation is required for recording; editing any field resets it. The saved actor comes from the authenticated session, not a supplied reviewer ID. No default judgment is accepted/approved. Storybook and test decisions use synthetic identities/data and never count as actual human evidence. If Ammar reviews as a parent, those findings remain useful guardian feedback; they do not silently become an educator certificate. UI approval is separate again.

An educator's positive decision records educational suitability only for this bounded procedural practice package. It does not approve full Optellen coverage, conceptual/mastery evidence, the provisional 14-day cooldown, assessment/retention stock or real learner use. The D11 manifest remains immutable with its original pending status; this workflow stores a separate exact-package judgment. The D14-S1 supplier **does not consume these decisions yet** and still requires exact item publication. A certified-supply adapter, D15 revocation/quarantine at issuance, and D25 actual assignment/exposure integration remain prerequisites. No automatic publication flag can be supplied to this API.

## Saved implementation

- `src/modules/content/family-review/`: strict draft/outcome rules, proposed package, step UI, saved transport and synthetic stories. The full private review package is fetched only through the protected operator endpoint; the learner routes do not import it.
- `src/server/content/family-review.ts`: current-package verification, exact hash binding, resumable optimistic draft and append-only decision history, inside the existing operator lock.
- `/api/guardian/family-review`: existing exact origin/URL checks, bootstrap operator, recent MFA, 64 KB streamed request limit and no-store responses, reusing D14 timing validation.
- `FamilyReviewDraft`: mutable current state with revision/last action. Conflicting stale tabs cannot overwrite it; identical response-loss retries reuse the saved revision.
- `FamilyReviewDecision`: immutable actor, package hash/full snapshot, draft snapshot, outcome, revision and date. Correction appends a new judgment; it never rewrites old human declarations. A transaction records the audit event and draft/decision together. Viewing or saving a draft creates no decision.
- Additive migration `20261023030000_family_review` creates those two records, checks and SQL immutability trigger. Tested on disposable PostgreSQL; no VPS migration. Rollback means disabling the new routes/UI while retaining the histories, not deleting signed decisions.

The package binds generator, existing evaluator, original exhaustive tests and family decision policy/adapter source bytes. `npm run content:check-family` verifies the source fingerprints and runs before every production build. Development/test package reads and saves also recheck the raw source fingerprints, including after HMR edits. A source or package change requires a new explicit review package; earlier package hashes do not confer approval on it. `scripts/prepare-optellen-review.ts` is the original preparation recipe and refuses to overwrite an existing package. It is not a certificate/import command.

## Test or review it

Start `npm run storybook` and open **Content → Family certification → Review Family**. Follow the three steps. Use **Guardian Feedback**, **Educator Decision**, **Needs Changes**, **Stop Early**, **Resume**, and **Save Failure** to inspect distinct synthetic outcomes. Browser-preview clicks reset on refresh and are not real decisions. To give actual feedback from the preview, reply using the copyable form in the review sheet; it identifies role, review basis, examined examples and four judgments.

The saved route requires the existing local bootstrap identity and recent MFA, with the local schema migrated. Do not migrate a remote connection merely to test. After `npm run build`, `npm run test:identity -- --built tests/identity/family-review.test.ts` creates a disposable database and authenticated browser, then exercises partial review, save/reload, remaining examples, explicit guardian decision, timer and signed-out content withholding. That test produces no real educational approvals.

## Verification and next handoff

Executed on Node 24.22.0: **196 unit tests/46 files**, fresh Next standalone build plus **99 PostgreSQL/built-browser checks/11 files**, all **15 migrations** freshly installed and replayed, **35 focused Storybook interaction/axe checks/5 files**, and **10 built learning-path regressions** passed. The final development-source guard and token-color refinement passed another fresh build, all **7 family database/browser cases**, **5 focused policy/source unit cases** and **7 family stories**. Typecheck, root lint, formatting, source-package/review-sheet hash parity, document targets, whitespace and Storybook build passed. Inspected desktop and phone screenshots; built axe/no-overflow passed across all three steps at 320/768/1024/1440px. Initial missing-module and early-stop RED tests preceded the passing implementations. Existing pg deprecation and Storybook/build warnings remain.

No paid request, VPS migration, deployment, real learner operation or actual educational decision was made. Frozen D11 and D13 evidence/human-decision files remain unchanged. Full Storybook/E2E/visual-baseline/device/Safari/manual-screen-reader and remote-CI suites, plus a populated previous-version migration rehearsal, were not run. The schema was verified in disposable fresh/replayed PostgreSQL. Role/expertise remain self-declared; actual review time and educational validity are not proven by these tests. Remaining: actual independent educational judgments, user acceptance of this new workflow, certified-supply admission with revocation/quarantine, general D14 batch intake/cross-category workload measurement, D15/D25 integration and real-device/release validation. No paid model run is authorized or needed for this package.

## 23 October reusable-family implementation follow-up

The later user-assigned S3a/S3b and bounded D16 work is now implemented/tested, In Review. [Current packages, teaching strategies, previews and separate saved-evidence preparation](reusable-addition-families.md) supersede the proposed-next wording above for that delivered slice. Historical D11/v1 package bytes and review decisions remain intact; no educational certification, automatic publication, D05 source replacement or daily assignment is inferred. General D14, D15 and D25 integration remain open.
