# Learning and assessment readiness audit

20 October 2026. Source research for the delivery roadmap. No educational policy, content bank, runtime or production state changed in this audit.

## Findings

The approved exercise interaction is reusable. The connected journey is a working **temporary preview**, not a persistent application. The automatic path is a bounded experiment, not coverage of the four-subject catalogue.

| Boundary          | Evidence from source                                                                                                      | Implication                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Exercise/retry    | `exercise-preview.ts` stores exact committed attempts, defers first misses and gives 1/0.5/0 credit                       | Reuse the rules under authoritative server transactions; malformed input must not consume an attempt |
| Rendering         | `exercise-definition.ts` and subject definitions provide keys, correctness callbacks and explanations to browser previews | Production needs public presentation data separated from server-only keys and disclosure policy      |
| Connected journey | `journey/` owns separate task snapshots in mounted React state                                                            | Refresh/restart persistence, concurrency and failed-save recovery do not exist                       |
| Guardian results  | Projection shows actual attempts and withholds unfinished scores; demo switch selects views                               | Useful read model, not authentication, longitudinal progress or accept/repeat actions                |
| Automatic path    | `PathState` uses seven synthetic dates, fixed banks and only Rekenen/Taal routes                                          | No production scheduler, configurable daily capacity or durable progression                          |
| Assessment        | Shared versioned evaluator checks coverage, novelty, facets, families, timing and prerequisites                           | These are testable policy rules, not validated certainty about ability                               |
| Publication       | Synthetic content can satisfy the demo's review eligibility                                                               | Production must require published, reviewed versions; do not promote synthetic metadata              |

All paths in this report are under [the practice module](../../src/modules/practice/). See the complementary [UI audit](2026-10-20-ui-readiness-audit.md) and [runtime audit](2026-10-20-runtime-readiness-audit.md).

## Actual category coverage

The path supports narrow Getalbegrip and Optellen examples, with two objectives each. Taal provides bounded Woordenschat and Woordsoorten examples but cannot legitimately advance from recognition-only evidence: missing conceptual/application content deliberately blocks it. Daily Redactiesommen is a small generated story family, not the complete ten-type word-problem catalogue.

Spelling and Begrijpend Lezen have approved exercise previews but no connected automatic category path. The generic assessment subject union includes them; that does not supply their blueprints, content or validation.

Numeric probe pools separate check/practice IDs. Practice selection can reuse a previously exposed practice item across tasks; uniqueness inside a task is not global novelty. Production must track exposure and enforce the approved fresh/targeted-review policy. New numeric parameters are not automatically independent conceptual evidence.

The broader catalogue requires representations and evaluation contracts absent from six-digit integer and finite-word inputs: fractions, decimals, units, clocks, geometry/graphs, dictation, extended writing, listening/speaking and constructed reading responses.

## Existing assessment experiment: preserve useful work and its limits

The evaluator independently checks each skill's required procedure/concept/application facets, multiple families, representations and tasks, constructed responses, recency and prerequisites. Eligible evidence is completed, first-attempt, unassisted and novel under the policy. Later supportive evidence does not simply average away a foundational gap. Guardian holds govern permission, not historical facts.

The 27-item Getalbegrip validation package contains nine entry, nine practice and nine held-out items across three draft skills. Its independent numerical oracle and frozen scenario plan are useful regression infrastructure. It remains Draft/synthetic, outside the interactive runtime and without educator-approved content.

The recorded experiment separates:

- 512 deterministic knowledge-pattern scenarios: no false provisional advancements within that controlled model.
- 13 additional learner profiles: hidden memorization and lucky correct responses can still produce two false provisional advancements; delayed evidence produces three reversals.
- Numerical response comparisons: 26,000 checks against independent gold logic, which establish numerical consistency rather than educational validity.
- Inventory: three practice items per skill cannot supply a complete ten-original-question practice task; entry exposure exhausts fresh follow-up inventory. Held-out items must not be borrowed to conceal that gap.

See the [executed report](assessment-validation/executed-report.md), [blueprint](assessment-validation/blueprint.md) and current [assessment policy](../product/assessment-policy.md). Passing the synthetic matrix is not permission to claim accurate real-child level prediction.

## Required integration decisions

1. Retain one evaluator boundary and versioned evidence; avoid building another engine for each subject.
2. Publish objective/range/format/prerequisite coverage separately from UI category headings.
3. Make server-owned assignments pin content and policy versions; submissions carry IDs/revision and original response, not client correctness.
4. Derive evidence only from eligible committed attempts. Reading disclosure, repeats, assistance and prior exposure change eligibility.
5. Keep content review assistance separate from judging Adam's open responses, educational validation and effort detection.
6. Preserve exact valid carryover and guardian capacity. Unsupported category/content states should be visible and actionable rather than silently skipped.
7. Repair stock and evidence gaps before increasing algorithm complexity. Independent educational decision-use review remains required by repository policy.

## Inspection coverage

The root audit read the exercise definition, preview state and its tests, screen, summary, companion mappings, choice input and passage renderer; all journey controller/state/task files; guardian projection, projection tests and view-switch controller; every TypeScript runtime and test in `learning-path/` and `assessment/`, including all eight validation source/test modules and their fixture banks; validation manifest and scenario plan. Shared presentation CSS/stories, subject implementations and guardian view files are covered by the UI audit inventory. Infrastructure, root tooling, E2E source and isolated auth are covered by the runtime inventory.

A final inventory comparison covered all **165 authored TypeScript/TSX/CSS files under `src/` and `tests/`** (excluding generated Prisma code) through these scopes. The root also read the two foundation notice source/story files to close the inventory gap. Runtime configuration, auth spike and art scripts have separate inventories in the complementary audits.

Relevant product, architecture, verification, interview, curriculum, assessment and design documents were consulted; reports identify current contracts and preserve superseded history. This is a human-authored-source audit across complementary scopes, **not a literal claim to read every byte of dependency code, lockfile metadata, generated geometry, binaries, ignored artifacts or credentials**. Remote deployment state and actual device behavior were not inspected.

## Fresh verification

- Root `npm test`, Node 24.22.0: **110 tests passed in 22 files**.
- Root `npm run typecheck`, Node 24.22.0: **passed**, including local generated Prisma/Next types.
- Isolated spike policy tests, Node 24.22.0, runtime auditor: **4 passed**.

No fresh full lint/build/Storybook/E2E/visual-baseline run, live AI evaluation, database migration, load test, physical-device test or educational validation is claimed. These documentation changes do not alter runtime behavior. Historical browser evidence remains in its dated contracts.
