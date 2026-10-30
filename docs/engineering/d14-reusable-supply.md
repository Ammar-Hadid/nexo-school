# D14-S1 — One-category reusable question supply

**24 October integration follow-up:** D14-S4/D15 now connects eligible published bank versions to actual saved synthetic assignments. Withdrawn versions stop contributing available stock; historical reservations cannot bypass current issuance checks. [Current contract and local rehearsal](eligible-content-and-withdrawal.md).

23 October 2026 · Policy `d14-optellen-supply-v1` · Implemented/Tested and Approved by the user for the delivered local technical/UI scope; educational acceptance remains pending.

The user assigned this slice before broader D14 review-interface expansion. It connects the existing D11 **single-digit Optellen subset** to a small, saved review queue and reusable local bank. It does not claim full Optellen coverage, a certified family, actual learner delivery or 600 fresh exercises/week.

## Operator workflow

1. Open `/guardian/content/supply` with the existing local bootstrap operator and MFA verified within five minutes. GET is read-only: no automatic draft generation, approval or paid request.
2. Choose demand (1–600) for the server-selected Amsterdam week, then prepare. Published eligible stock is selected first. The page reports requested, available, pending and missing counts separately.
3. Open the small set. Review full prompts, private keys/explanations and pinned rules in the existing D14 workspace. Deterministic checks are labelled as such; no fabricated Haiku result. Individually select exact versions, record a review note, confirm independent review, approve, then separately publish for the local synthetic trial. Storybook/test decisions are simulations, never Ammar's approval.
4. Return to the overview and prepare again to save exact-version reservations. Reload preserves the plan, queue, decisions and measured review time. Existing published stock needs no repeat approval. Empty bank means zero available stock until explicit review/publication.

The first request admits **at most eight new exercises**, retaining headroom for corrections inside the **ten-version weekly limit**. Changing a draft creates a new immutable version and consumes a slot; retrying an identical saved edit does not. Exhausted allowance refuses further edits with an explicit message. Rejecting or deleting a client selection does not refund a slot. Corrections beyond the allowance wait for a later week; an invalid version never becomes eligible merely to meet demand.

## Workload policy and limits

The planning allowance is 15 minutes at 90 seconds/version. This is a conservative implementation choice, not a measured speed or guarantee of human review time. The server uses the greater of estimated admissions and acknowledged review time, adds the reserved estimate for earlier pending work, and limits total outstanding work to ten. Existing backlog reduces new admissions; measured time exhausting the allowance stops them. Finishing/rejecting all eight drafts does not create another eight in the same week. New weeks do not clear the backlog. Review time remains self-reported activity telemetry, not quality evidence; the timer does not force the reviewer to rush or approve.

This cap is for the **Optellen supply lane**, not yet a shared workload budget across future categories. Broader weekly measurement and separate upfront certification effort remain D14 work. The global 15–30 minute target is still unproven.

## Inventory and exposure policy

The D11 enumeration provides 100 ordered instances but only **55 commutative sum groups in one family**. The catalogue takes one representative per group and interleaves them deterministically; it does not invent independent evidence from variant counts. Each rubric pins the operands; an independent solver checks the displayed sum, and the adapter blocks a changed sum or key from masquerading as that instance. Human review is still responsible for explanation and suitability. D11 hashes and its pending educational status remain unchanged.

Only admitted, exact published versions with passing mechanical/family checks enter new stock selection. A group occurs at most once per weekly plan. Prior-week synthetic reservations within the previous 14 elapsed days exclude that group. The 14-day interval is a **provisional conservative rehearsal rule**, not an educationally validated spacing/retention threshold. New requests do not fill shortages with repetitions, draft content, mirrored operands or automatic publication. Later practice reuse is allowed after that cooldown without another content review.

Reservations pin exact published versions. Editing a content item does not rewrite an existing week's reservation; a later week considers the latest admitted version and its new approval. Reducing demand does not erase earlier reservations or exposure history. These records belong to the operator's **local synthetic rehearsal**, not Adam's actual exposures. There is no scoring, mastery, retention, assessment-stock or daily-allocation adapter here. An API request for another purpose, caller-selected week or certification override is rejected.

**Release prerequisites:** D15 withdrawal/quarantine must gate new selection; D25 must bind actual learner history and assignment snapshots. Family certification and assessment/retention stock remain independent gates. This local proof deliberately cannot enable automatic family publication.

## Implementation boundaries

- `src/modules/content/supply/`: pure workload/selection rules, typed summary, weekly UI, explicit synthetic stories.
- `src/server/content/supply.ts`: finite D11 adapter, immutable admissions, bank projection, bounded prepare and reservations. Runs only within the existing authenticated operator transaction lock.
- `/api/guardian/content-supply`: exact-origin protected GET/POST; 64 KB streaming body limit, bootstrap authority and recent MFA. The explicit `?batch=optellen` review lane reuses existing D14 edit/approve/publish/timing controls.
- `ContentSupplyWeek` stores demand and policy version. `ContentSupplyAdmission` records every new/edited version; `ContentSupplyReservation` records exact content hash and group. Both histories have SQL update/delete protection and composite content foreign keys. Migration `20261023020000_content_supply` is additive and tested only in disposable local PostgreSQL, not applied to the VPS.
- No provider dispatch, added service, AI charge, real child data or deployment. No D13 fixture/reference-decision modifications.

## Try it without an account or AI spend

Start `npm run storybook`; open **Content → Question supply**:

- **First Week:** prepare (or inspect the interaction's prepared state), enter 600 and replan. The queue stays at eight; the missing count is 600 with an empty bank. The estimated queue is 12 minutes, within the 15-minute planning allowance.
- **Reused Bank:** six requested exercises are available from a simulated eight-item published bank; replan and see zero new review versions.
- **Budget Reached:** ten versions/15 measured minutes do not admit further work.
- **Review Example:** inspect complete sums, keys, explanation and rules; use existing exact-selection approval/publication controls. Each story has independent synthetic state and refresh resets it.
- **Save Failure:** the failed action never reports a saved plan.

The persisted route requires the local identity/database environment with all migrations; do not run a migration against a remote connection merely to try this screen. `npm run test:identity -- --built tests/identity/content-supply.test.ts` after a fresh `npm run build` launches and tests a temporary authenticated standalone browser environment automatically. It does not leave a running database or real approvals behind.

## Verification and handoff

Executed on Node 24.22.0: **191 unit tests/44 files**, fresh Next standalone build plus **92 PostgreSQL/built-browser checks/10 files**, all **14 migrations** installed and replayed, **28 focused Storybook interaction/axe checks/4 files**, and **10 built learning-path regressions** passed. Final heading/input-spacing refinement passed another fresh standalone build, all **8 supply database/browser cases** and **13 supply/review stories**. TypeScript, root lint, Prisma schema validation through generation/migration/build, formatting, document targets, whitespace and Storybook production build passed. Desktop/phone screenshots inspected; built axe/no-overflow at 320/768/1024/1440px. Initial missing-module test and a temporary UI variable typo were corrected before passing verification. Existing PostgreSQL deprecation and Storybook build warnings remain.

No paid request, VPS migration, real learner operation, deployment, new reference judgment or actual educational approval occurred. Frozen D13 fixture and human-decision hashes remain unchanged. Full Storybook, full E2E/visual baseline/device/Safari/manual-screen-reader/remote CI suites and a populated prior-version migration rehearsal were not run. The new migration was tested on fresh/replayed disposable PostgreSQL; review-time savings still need measurement with Ammar. The next bounded supply step is the D11 family-certification/reusable-family workflow and evidence package, with independent human educational judgment. Do not turn the clear deterministic check or UI acceptance into a certificate. General batch intake, cross-category workload measurement, D15 quarantine and D25 actual assignment remain open. No paid experiment is scheduled.
