# Reusable addition families and saved-evidence preparation

**24 October integration follow-up:** D14-S4/D15 now supplies current withdrawal state to the existing shadow reader. The teaching-family packages remain separate review packages; this integration reuses the existing individually published D14-S1 bank and creates no family certificate. [Current contract and local rehearsal](eligible-content-and-withdrawal.md).

**24 October 2026 user acceptance:** reusable addition families and the separate Phase D shadow integration are accepted as a tested technical milestone. New educational content and automatic mastery decisions remain unapproved. Preserve the implementation/tests; continue Optellen only for a genuine defect or necessary integration. The next cross-subject proof and broader delivery sequence are [Spelling D21-P1](reusable-spelling-family.md) and the [existing roadmap](../../tasks/delivery-roadmap.md). Historical In Review wording below describes the original handoff.

23 October 2026. User-assigned Phases A–C **Implemented/Tested, In Review**; Phase D's dependency-safe server shadow slice **Implemented/Tested, In Review**. No educational certificate, new production assignment or advancement is activated. This is D14-S3a/S3b, the first bounded D16 slice, and D30 preparation; D25 remains the future daily integration owner.

## What is usable

The existing saved family review now resolves versioned packages through one server boundary. It uses the same authorization, PostgreSQL records, optimistic revisions, immutable decisions, audit, timer and guardian screen. Examples, criteria, scope, prerequisites, validation requirements and provenance come from the package. A synthetic language descriptor tests different criteria without pretending that a language generator or curriculum was implemented. Unknown/retired package IDs, malformed descriptors, foreign package hashes, changed source, changed inventories and stale draft revisions are refused.

The two new immutable review packages are:

| Package                       | Technical inventory                                                  | Representative review                                                                                | Status                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `addition-digits-teaching-v2` | 100 ordered pairs, 55 commutative exposure groups                    | Nine examples: zero in both positions, small/larger doubles, counting on, exact ten and crossing ten | Earlier question format/bounded practice scope approved; changed teaching methods and educational certificate pending |
| `addition-two-digits-v1`      | 3,321 ordered pairs, 1,681 exposure groups; operands 10–99, sum ≤100 | Eight examples including `24 + 18`, `36 + 27`, `45 + 38`, non-carrying and exact 100                 | Implementation range explicitly assigned; educational content and new review revision In Review                       |

`src/modules/practice/rekenen/addition-strategies.ts` owns the deterministic subject logic. Precedence is zero → doubles → make ten → count on. Small doubles count a second equal group; larger doubles build from `5 + 5`. Other small sums start with the larger operand. Two-digit explanations adapt the existing authored tens/units decomposition, then use the existing path's make-ten approach when units reach/cross a ten. All steps show actual intermediate quantities.

The server's `teaching-addition-family.ts` adds exact version/instance/content identities, exhaustive reports and exact-instance validation. Its independent oracle parses and counts every displayed equation and split. Unit tests separately recompute answers across the complete finite domains, including the three prior authored examples. Answer entry uses the existing `integer-exact-v1` parser, deferred retries, weighted scoring, shared exercise presentation and exact approved Nexai selection. No approved existing question, screen, message or scoring source was rewritten.

The finite selection rehearsal partitions commutative groups into 60% practice, 20% check and 20% retention, alternates carrying/non-carrying while stock remains, excludes supplied prior exposure keys and reports shortages. This is a deterministic inventory allocation contract, **not a validated educational workload ratio or durable learner exposure history**. Digit pools contain 33/11/11 groups; two-digit pools contain 1009/336/336. Different operands, wording or explanation revisions never make independent families. Each arithmetic family still contributes at most one family observation under the existing assessment policy. D25 must use persisted learner exposure and D15 eligibility at actual allocation.

## History and approval authority

The original `optellen-review-package.json`, D11 generator, D11 tests and their fingerprints remain unchanged. The old package is historical: the new resolver refuses to record fresh decisions against its retired version using changed review code. Existing database decisions remain under their original package hash and full package snapshot; no migration or history update was needed. The build preflight pins the historical JSON bytes and checks source attestations for both active packages. Changed sources require a new review package; `prepare-teaching-families.ts` refuses existing output files. Source hashes were finalized during this task before any real review.

The shared family workflow records actual authenticated judgments; it does not auto-publish. Earlier format approval is explained in the single-digit scope/change note and is not turned into an invented database educator decision. The complete certificate still asks the reviewer to assess their own criteria/basis. UI acceptance, guardian feedback, independent educational certification, exact content publication and assessment authority remain distinct.

D10 publication and D14-S1's existing manually reviewed bank remain available under their existing contracts. The new packages do not automatically replace D05 saved questions or S1's old supply versions. D15 and daily allocation gates remain ahead of activating these new families as routine saved assignments. This does not prohibit the existing ordinary-practice/manual publication lane while stronger assessment prerequisites are incomplete.

## Interactive previews

With the root Storybook server running on port 6006:

- [Single-digit practice](http://127.0.0.1:6006/?path=/story/practice-addition-families--single-digit)
- [Two-digit practice](http://127.0.0.1:6006/?path=/story/practice-addition-families--double-digit)
- [Single-digit worked explanation](http://127.0.0.1:6006/?path=/story/practice-addition-families--single-explanation)
- [Two-digit worked explanation](http://127.0.0.1:6006/?path=/story/practice-addition-families--double-explanation)
- [Single-digit family review](http://127.0.0.1:6006/?path=/story/content-family-certification--review-family)
- [Two-digit family review](http://127.0.0.1:6006/?path=/story/content-family-certification--two-digit-family)

Try a wrong answer, continue through the ten originals, then answer that same question incorrectly again: only the second miss reveals the steps. Leading zeros and surrounding spaces normalize normally. The explicit explanation stories open at that second-miss state. These previews use real generator code with ten representative pairs; they are in-memory and reset on reload, with the existing preview notice. They do not save learner results or record actual educational approval.

The protected saved review uses `/guardian/content/supply/family?package=addition-digits-teaching-v2` or `?package=addition-two-digits-v1`, with an “Andere familie beoordelen” switch. It requires the existing local synthetic operator and recent MFA; saves, decisions and timers are isolated by exact package hash. It uses the existing configured local database only; no remote environment was touched. Automated tests use disposable PostgreSQL and synthetic identities.

## Phase D: separate, disabled shadow integration

`src/server/practice/saved-evidence.ts` is a server-only use case called inside the existing authenticated transaction. It checks student/guardian ownership through `authorizedStudent`, reads actual immutable assignments/questions/attempts up to a fixed cutoff, verifies the known D05 question payload/hash and recorded answer, and replays completion with the existing submission lifecycle. Callers supply student identity/cutoff, never attempts, correctness, an approval flag or prerequisite overrides. There is no new public route, job or activation switch.

The report retains exact content and evaluator versions, source attempt/item/assignment IDs, family/exposure identity, attempt number, completion and observation date. Assignment is conservatively treated as exposure even without an answer. First exposure is **unknown**, because D05 has no complete historical exposure store; assistance likewise remains unknown. The known D05 source is synthetic ordinary practice, not independently reviewed assessment. Unknown sources fail closed.

The pure `saved-evidence-shadow.ts` projection feeds eligible observations into the existing `assessCategory` evaluator, unchanged (`synthetic-assessment-v1`). It excludes unreviewed, defective, rejected or withdrawn material, unknown/assisted attempts, retries, unfinished work, ordinary practice, repeated exposure, duplicate source IDs, missing mappings and incompatible/date-invalid evidence. Excluded mistakes create no learner conflict. Every result carries adapter/policy/blueprint provenance, a fixed cutoff and exact source/report fingerprint; the reader writes nothing. Repeating the read after reconnecting reproduces the same report.

**All current D05 saved attempts remain ineligible**. The output is useful as a saved-source readiness audit and a tested integration seam; it does not establish that D30 is complete. Synthetic pure-adapter scenarios additionally show that eligible variants in one family still leave insufficient diversity and prerequisites. The existing adverse-case and hidden-answer-key controls remain intact. These are software checks, not real learner shadow trials or educational validation.

Remaining gates: D15 current withdrawal/quarantine and append-only corrections; D24/D25 intended purpose, daily assignment and authoritative exposure; D29 reviewed objective/level/facet/prerequisite/family mappings; full D30 versioned persistent evidence/correction integration; D31 separately approved decision use. No production mastery, category skipping, learner advancement, penalty, held-out accuracy claim or empirical calibration was enabled. Real external help cannot be inferred from recorded answers.

## Executed evidence

Node 24.22.0, 23 October 2026:

- Root unit suite: **208 tests / 49 files passed**. Includes exhaustive 100 + 3,321 arithmetic checks, intermediate equations/splits, response normalization, finite pool exclusions, malformed/stale packages and separate shadow-adapter adverse cases.
- `npm run test:saved`: standalone production build plus **101 PostgreSQL/built tests / 11 files passed**; all 15 existing migrations installed and replayed. Includes saved browser auth/results, review save/resume, package hash isolation, immutable decisions, source denials and real committed-attempt shadow replay/cross-student denial. No new schema was needed.
- Focused Storybook interaction/axe suite: **58 tests / 9 files passed**, covering family/batch/supply review, new and existing Rekenen, saved/guardian results and the learning path.
- Learning-path built E2E: **10 tests passed**. Assessment rules, scenario matrix and known residual hidden-key limitation remain unchanged.
- Next standalone and Storybook production builds, root lint/typecheck/formatting, source-fingerprint preflight, scoped local documentation targets and Git whitespace checks passed.
- Additional Chromium inspection: five new story states at 320/768/1440px (**15 combinations**) had zero page errors, horizontal overflow or axe violations. Desktop and narrow worked explanations and family review screenshots were inspected under `.artifacts/addition-families/`; no baseline was updated.

Initial missing-module/old fixed-resolver RED cases, a descriptor TypeScript narrowing error, JSON formatting, and standalone screenshot-harness locator/context errors were corrected before passing checks. Existing pg client deprecation and Storybook module/chunk warnings remain. Full unrelated Storybook/E2E suites, visual baselines, physical devices/Safari, manual screen readers, populated production upgrades, remote CI, real learner trials, educator review and deployment were not performed. No paid AI call or remote database change occurred; budget records were untouched.

## Next reusable batches

Keep one package resolver, review workspace and immutable decision/timing infrastructure. Future arithmetic ranges bring new bounded generators and examples; constrained Taal/Spelling require verified versioned banks and subject rule validators; semantic content needs exact batch review; reading requires passage/question-bundle checks and shared passage exposure. They can be developed in coherent category batches without rebuilding authentication, review or publication. Minor variants within an actually certified unchanged contract need not reopen its review; changed templates, rules, banks, difficulty or evidence claims require a new version. The 50–200 daily capacity and 15–30 weekly review-minute targets remain unproven until eligible inventory, D15/D25 integration and measured review throughput exist.
