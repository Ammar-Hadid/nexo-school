# Scalable content supply — 23 October 2026

The user approved **GPT-6 Luna** as provisional default AI generator, **Claude Haiku 5.5** as first-pass reviewer, and deterministic TypeScript for routine arithmetic/safely constrained variations. Keep both models replaceable behind the existing application-owned port. Selection is approved; production routing is not yet implemented. Frozen benchmark models, prompts, outcomes and pending human reference judgments remain historical evidence.

This amendment targets **50–200 exercises/day** with **15–30 minutes/week of ongoing human content review**, excluding separately measured initial catalogue certification. It authorizes the next bounded D13 contract repair before D14, not an entire curriculum/scheduler rewrite. **No further paid experiments without explicit authorization.** The €10/month ceiling includes generation, review, retries, uncertain calls and future explanations. Recorded October expenditure remains €3.589906, leaving €6.410094; provider invoice reconciliation remains pending.

**23 October approval:** the user explicitly approved this bounded contract slice and assigned the first D14 batch-review workflow. Approval covers technical behavior, not content certification or independent reference adjudication. [D14 implementation/handoff](d14-batch-review.md).

## Implemented contract slice

`src/modules/content/exercise-contract.ts` defines `exercise-v2` and `exercise-checks-v1`. A draft has learner prompt/passage/options, separate private accepted answers/grading rules/explanation, and rights/provenance. Response instructions are application-owned Dutch copy derived from the pinned response kind, not a model-authored rubric. The learner projection explicitly selects public fields and refuses structurally/mechanically invalid content. It is a DTO builder, not an authorization or publication check; the future assignment boundary must also enforce authorized, published, eligible versions. No existing learner route consumes v2 yet.

Rules live in the immutable rubric version and participate in the existing content fingerprint. The authenticated D10 server use case accepts v2 drafts only with v2 rules. It stores defective but structurally valid drafts for correction, reports field-level findings, and blocks approval/publication while deterministic blockers remain. A corrected draft/rubric requires a new exact version and fresh human approval. Rejection is still available for defective drafts. Legacy D10 synthetic records remain readable/usable under their historical local-synthetic contract; the new D14 intake must use v2, never downgrade to legacy to avoid checks. No database migration is necessary because immutable snapshots already carry the versioned envelope.

Checks cover strict field/key sets, nonempty required fields, bounded arrays/text, simple plain-text formatting, option cardinality/normalized uniqueness, single-choice key membership, obvious response-instruction mismatch, required gap markers/passage, pinned passage word bounds, required objective terms, explicit answer-disclosure cues and literal copied explanations. A pinned bounded integer calculation independently checks its answer/unit without trusting a model's calculation. These rules are constraints on this finite text contract; other representations need separately reviewed extensions.

Passing means **no implemented mechanical blocker found**, not semantic truth. Objective terms do not prove objective alignment. A gap marker does not prove a meaningful sentence. Disclosure cues cannot detect every paraphrase or cross-question reveal. Arithmetic verifies declared quantities, not their interpretation from prose; explanation reasoning still needs review. Reading evidence may legitimately contain answer words. No grade-level/AVI, coverage, family-independence or educational-validity claim follows.

No automatic semantic approval/publication is enabled. Haiku clear is advisory. Authenticated exact-version human review remains necessary. The forthcoming AI-review integration must preserve exact-hash pending/flagged/disputed outcomes and block automatic promotion when any layer abstains or disagrees. AI-assisted D13 proposals stay separate from independent human reference adjudication. This slice does not claim to implement that full evidence workflow.

## Supply lanes and delivery order

| Supply lane                   | Approval unit and automatic work                                                                                                                   | Status / next owner                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Finite arithmetic             | Certify exact template, bounds, renderer, verifier and explanation once; deterministic per-instance checks permit variants inside that certificate | D11 has one technically verified family, educational certificate pending; no automatic publication today. Expand one family at a time in D16. |
| Constrained language/spelling | Review word-bank version and allowed transformations with independent rule checks; certify only enumerated combinations                            | Planned subject-family slices. AI free wording cannot inherit a certificate.                                                                  |
| Structured word problems      | Review scenario template and meaning of quantities/units; independently compute every instance                                                     | v2 supports pinned calculation checks; generator/certificate and reasoning formats remain planned.                                            |
| Unrestricted semantic items   | Luna draft → schema/mechanical checks → Haiku findings → full-content human approval of exact reusable batch                                       | D14 workflow pending; no semantic auto-publication.                                                                                           |
| Reading                       | Approve passage plus all linked questions/keys/explanations together; edit invalidates affected bundle approval                                    | D14 bundle workflow and later reading adapters pending. Passage siblings remain correlated evidence.                                          |

Reuse published eligible content before new calls. Prepare against current/upcoming objective deficits; count usable stock after level, purpose, exposure, reservations, quarantine and approval filters. Maintain separate practice, independent assessment and retention allocation. Repeated numbers/wording in the same family never create new family evidence, and all questions on a passage share exposure. Familiar approved content can serve suitable practice but cannot be relabelled novel assessment/retention evidence. Scarcity remains visible; do not manufacture mastery or fill a shortage with unchecked content.

The future bounded replenisher uses D12 jobs and the shared monthly ledger. It must reserve budget across all features, stop on uncertain usage, and reuse existing jobs/stock before generating. It does not run on each learner request. Objective mappings, certified eligible inventories and daily allocation remain later roadmap dependencies; this slice implements none of those schedulers.

D15 must quarantine affected versions and linked reading sets, block new assignment, identify pinned tasks/results and append evaluation corrections with provenance. Preserve original attempts; exclude invalid evidence and recompute affected derived progression without treating a content defect as a learner failure. This remains a release dependency, not an implemented recovery claim.

## Operating estimates, not measured production throughput

Measured D13 Luna generation plus Haiku review cost **€0.021886 for eight drafts**, or **€0.00273575/draft** averaged equally across four content types. Generation alone averaged €0.000480625 and review €0.002255125. Type-specific combined means: Taal €0.001826, Spelling €0.002118, word problems €0.002411, reading €0.004588. These are conservative ledger charges from a tiny screen, not invoices, acceptance rates or future price guarantees. Longer bundles, the revised contract, rejected drafts, retries and explanations can change costs.

Use a 30-day month and seven-day week. A deliberately capped hybrid example introduces **20 new unrestricted semantic exercises/week**, including 15 short items and one five-question reading bundle. All other daily work must come from eligible certified variants or already approved stock. This is a planning scenario, not evidence that the current stock supports it.

| Daily exercises | Monthly attempts | All-new AI generation + review, before extras | Required certified/reused share with 20 new/week | Capped hybrid generation + review/month |
| --------------- | ---------------: | --------------------------------------------: | -----------------------------------------------: | --------------------------------------: |
| 50              |            1,500 |                                         €4.10 |                                            94.3% |                                   €0.23 |
| 100             |            3,000 |                                         €8.21 |                                            97.1% |                                   €0.23 |
| 200             |            6,000 |                                        €16.41 |                                            98.6% |                                   €0.23 |

Formula: all-new = daily × 30 × €0.00273575. Hybrid = 20 × 30/7 × €0.00273575 = €0.234493. This uses the per-question screen mean without assuming a bundle discount; longer bundle requests could cost more. A **2× contingency** for rejected drafts/retries gives €0.47; adding a **€2 planning reserve** for future explanation use yields about **€2.47/month** in this example. The reserve is not a measured explanation cost or permission to spend. At the 2× rate, all-new AI would cost €8.21/€16.41/€32.83 before explanations. Monthly hard accounting must still override any forecast. Existing benchmark spend is separate from this future steady-state scenario.

Illustrative review time: 15 short items × 45 seconds + one reading bundle × 5 minutes + 5 minutes of exceptions = **21.25 minutes/week** at each daily volume. These speeds are unmeasured. At 90 seconds/item and 10 minutes/bundle it becomes **37.5 minutes/week**. New-family certification, bank curation and initial stock seeding add upfront time and must be recorded separately, not hidden in the target. Reviewing every new daily question at just 45 seconds would take **262.5 / 525 / 1,050 minutes/week** at 50/100/200 per day.

The weekly target therefore depends primarily on certified/reused supply and limited genuinely new semantic material, not a faster AI model. If independent fresh assessment stock is insufficient, the system must show a shortage or budget/review exception. More exact repeats cannot silently solve that constraint. D14 must measure active review time, item/bundle count, corrections/rejections and weekly total; interrupted/background time must be distinguished from active time. These measurements, not this table, determine whether the target is achievable.

## Assigned first D14 slice

Build the **authenticated, resumable full-content review queue for one reusable v2 batch**, using existing guardian controls. Show every complete exercise and its private review fields, pinned rules and deterministic findings; never hide content behind a clear flag. Integrate exact-hash Haiku findings as advisory evidence using already recorded or synthetic data (no new paid call). An edit creates a new version and reruns checks; unresolved findings stay pending. Add explicit exact-version batch approval and measured active review time, with a synthetic Storybook example and authorization/publication E2E. Family certification and reading-bundle variants follow as separate slices. Independent D13 reference adjudication and D11 educational certification remain open, not erased by model selection.

Narrow semantic automation is a later scoped policy decision: approved subtype/bounds, independently human-labelled family-separated adversarial evidence, false-approval/abstention criteria, a shadow period, measured review savings and rollback/quarantine. Model agreement or a confidence score alone cannot confer authority. No further exploratory benchmark is scheduled.

## Verification and how to exercise this slice

Executed on Node 24.22.0: initial missing-module unit failure and two failing PostgreSQL regressions; final **186 unit tests in 42 files**, **79 built PostgreSQL/integration tests in eight files** through `npm run test:saved` (standalone build plus unchanged twelve-migration fresh/replayed install), **15 focused saved/learning-path story checks**, **10 built learning-path E2E checks**, typecheck, lint, formatting, local documentation targets and whitespace. Test reviews are simulated, not human approval. The original D13 fixture and human-decision hashes remain unchanged, and the saved live report still has 63 generator/reviewer attempts with €3.589906 total monthly commitment. No provider call was made.

To test the new contract without spending money:

```sh
npm test -- src/modules/content/exercise-contract.test.ts
npm run test:saved
```

The first command exercises missing context, malformed explanation, invalid/duplicate options, explicit leakage, word limits, wrong calculation/unit and public DTO separation. The second uses a disposable local PostgreSQL database to prove a defective draft cannot be approved/published, a corrected new version still needs its own review, and the original remains intact. It also reruns existing built saved-journey checks. There is no new review screen to click yet.

Full Storybook build/suite, full E2E/visual suites, physical devices/Safari/manual screen readers, remote CI/VPS, populated production upgrades, invoices, real learner data, independent educational review and deployment were not performed. Existing pg/client and browser color warnings remain. The focused browser regression uses the existing static Storybook build. No schema migration or approved UI/Nexai change was made. Contract behavior is implemented/tested and now user-approved; model selections and the scalable direction are user-approved; educational content/certificates and reference judgments are not approved by this task.

## 23 October D14-S1 — supply-first amendment

The user explicitly assigned a reusable system for one category before more general review-interface expansion. [D14-S1](d14-reusable-supply.md) now connects the D11 digit-addition subset to published-bank reuse, saved weekly plans/reservations, a bounded review queue and visible shortages. At most eight fresh exercises leave correction headroom within ten new versions/15 estimated minutes per week; earlier pending work and measured time reduce admissions. The allowance applies only to this local Optellen proof. It is not an empirical workload result or a global cross-category cap.

Automatic family publication remains disabled pending independent educational certification; no Haiku clear result or arithmetic check grants it. The next bounded family workflow/certification package, D15 quarantine and D25 real allocation remain open. The prototype has no new AI spend and makes no full-category or 600-exercise-capacity claim. The original D13 benchmark findings and human decisions remain unchanged.

## 23 October D14-S2 — family review assignment

D14-S1's delivered local supply workflow is now user-approved. The user assigned the [Optellen family review](d14-family-certification.md) next: seven examples/four judgments, exact-package source/contract/inventory identity, saved partial progress, early concern recording and independent educator/guardian/AI-assisted provenance. Upfront effort is separate from weekly stock review. This produces a human decision record only after explicit review; it does not manufacture a certificate from earlier UI approval or automatically publish variants. Certified-supply admission, D15 revocation and D25 actual learner exposure remain separate.

## 23 October reusable-family implementation follow-up

The later user-assigned S3a/S3b and bounded D16 work is now implemented/tested, In Review. [Current packages, teaching strategies, previews and separate saved-evidence preparation](reusable-addition-families.md) supersede the proposed-next wording above for that delivered slice. Historical D11/v1 package bytes and review decisions remain intact; no educational certification, automatic publication, D05 source replacement or daily assignment is inferred. General D14, D15 and D25 integration remain open.
