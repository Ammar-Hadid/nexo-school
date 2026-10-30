# Executed bounded assessment preparation report

20 October 2026 · **Preparation implemented and technically tested; tooling In Review; all content Draft/synthetic. Educational validation has not occurred.** The user explicitly activated the handoff. No user product approval or independent educator approval is inferred from these checks.

## Deliverables and implementation boundary

- [Bounded blueprint](blueprint.md): three required skills (F foundation, V positional composition, O ordering), nine skill/facet cells, proposed prerequisite edges and a precise 0–999 envelope with a 0–99 foundation. It is not full Getalbegrip or validated groep-5 attainment.
- [27-item reviewer package](reviewer-package.md): nine entry/confirmation items, nine practice/repair specimens and nine reserved delayed items; exact identities, keys/rubrics, alternate explanations, difficulty/accessibility concerns and pending reviewer decisions.
- [Future independent educational protocol](educator-protocol.md): fresh outcomes, delays, blinded adjudication, risk/uncertainty/burden decisions and proposed stop/revision rules. No study or recruitment occurred.
- Domain-owned [validation tooling](../../../src/modules/practice/assessment/validation/validation-tooling.ts) and [experiment tests](../../../src/modules/practice/assessment/validation/validation-experiment.test.ts), discovered by the existing root Vitest suite and unchanged CI configuration. They call the canonical `assessCategory` and existing `path-model.submit` numerical scorer. No second assessment engine, service, dependency, database migration or UI was added.

The validation scorer first distinguishes malformed/unscorable inputs, preserves the raw response and calls the existing numerical adapter only for a valid number. This behavior belongs to the offline preparation tooling; the approved interactive exercise/retry behavior is unchanged. Observation construction assumes completed scripted tasks; it is not a production ingestion adapter. It rejects duplicate source/item contributions and ambiguous duplicate bank identities.

No existing runtime practice/component/style/artwork file was changed. Earlier uncommitted and untracked work was preserved in the current checkout. The policy, route, scorer and draft content hashes are locked in the manifest. The new bank is absent from interactive app/story imports and selection. No approved visual baseline changed. The production roadmap's live AI, immutable learning history and richer Redactiesommen reasoning requirements remain future work.

## Frozen experiment and reproducibility

[Manifest](manifest.json): `getalbegrip-validation-manifest-v1`; [scenario specification](scenario-plan.json): `bounded-synthetic-scenarios-v1`; content: `getalbegrip-bounded-draft-v1`; policy: `synthetic-assessment-v1`.

Content/blueprint, independent oracle, policy/scorer source and scenario definitions were frozen before outcome evaluation. Every experiment run verifies their SHA-256 hashes before evaluating outcomes. Entry has three originals on day 0; two separate three-original confirmation tasks on day 1; delayed outcome tasks on day 3. These scripted task boundaries obey the follow-up cap, but do not replace the interactive route's existing four-item initial check or implement a new scheduler. Neither nine questions nor these dates are educational recommendations.

The hand-derived oracle independently recomputes the fixed numerical keys without reading stored keys or calling the scorer; this is computational independence by the same agent, not independent human review. For each of 26 numeric items, every response from 0 through 999 is compared through the existing scorer: **26,000 comparisons, zero mismatches**. Leading-zero/whitespace equivalence and stated wrong-answer contrasts are also checked. One open explanation is deliberately unscorable. These counts concern answer-key/evaluator correctness, not 26,000 independent items or proof of construct validity.

Reproduce from the repository root with Node **24.22.0**, as specified in `.nvmrc`:

```sh
npm test -- src/modules/practice/assessment/validation/
```

This writes `test-results/assessment-validation.json` (ignored), containing per-profile decisions/counts. `npm test` includes the same experiment plus the earlier policy and route regressions. New tests require no learner data, credentials, live AI or network service. Dependencies and Chromium already existed locally; no lockfile/dependency installation change was needed. A clean environment should follow the installation/setup instructions in [verification](../../engineering/verification.md).

Execution fingerprint over sorted validation `.ts` filenames + NUL + bytes + NUL: **aec8bb7a31ce25ddb97cefa6803cc8269717928bf34ddf15672b3e3eda93a53f**. Changing the frozen content/policy requires a new manifest/version with an explicit evaluation plan, never silently updating hashes to conceal a failure. Development-only duplicate-identity hardening after the first run did not tune thresholds, content or held-out outcomes.

## Outcomes with denominators

The deterministic matrix enumerates **512 states** over nine skill/facet bits. A known bit supplies the independently recomputed correct answer; an unknown bit supplies 999999. This model deliberately contains no probability of guessing, slipping, learning or covert help. Only state 511 is fully known.

| Matrix measure                                    | Result                             | Interpretation                                                                                |
| ------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| False advancements                                | 0 / 512 states; only 1 state ready | Correct under stipulated answers, not a real-world risk estimate                              |
| Missed weak facets                                | 0 / 2,304 stipulated weak cells    | Every such cell remains visible as a conflict in its skill result, including the prerequisite |
| Initial originals                                 | 4,608 = 512 × 9                    | Scripted observations, not child workload measurements                                        |
| Additional unresolved facet requests              | 2,304 across 511 states            | Requests for information, not questions actually issued                                       |
| Content-blocked states                            | 511 / 512                          | No unused entry checks remain; reserved delayed items are never substituted                   |
| Unnecessary further requests in fully known state | 0 / 1 fully known state            | A single idealized state does not establish optimal burden                                    |

The **13 named profiles below are separate from the matrix**. They include hidden memorization, explicitly lucky guesses, assistance/retries, stale evidence and one stipulated slip. No invented probability is assigned to any scenario.

| Profile             | Initial decision     | Ready skills / 3 | Additional facet requests | Practice specimens available | Delayed wrong / scorable | False advancement | Reversal |
| ------------------- | -------------------- | ---------------- | ------------------------- | ---------------------------- | ------------------------ | ----------------- | -------- |
| full                | ready-provisional    | 3                | 0                         | 0                            | 0 / 8                    | No                | No       |
| foundational-gap    | more-evidence        | 2                | 1                         | 3                            | 0 / 8                    | No                | No       |
| procedure-only      | targeted-practice    | 0                | 6                         | 9                            | 5 / 8                    | No                | No       |
| constant-zero-guess | targeted-instruction | 0                | 8                         | 9                            | 8 / 8                    | No                | No       |
| lucky-all-correct   | ready-provisional    | 3                | 0                         | 0                            | 8 / 8                    | Yes               | Yes      |
| known-memorization  | more-evidence        | 0                | 9                         | 0                            | 8 / 8                    | No                | No       |
| hidden-memorization | ready-provisional    | 3                | 0                         | 0                            | 8 / 8                    | Yes               | Yes      |
| assisted            | more-evidence        | 0                | 9                         | 0                            | 8 / 8                    | No                | No       |
| retry-only          | more-evidence        | 0                | 9                         | 0                            | 8 / 8                    | No                | No       |
| stale               | more-evidence        | 0                | 9                         | 0                            | 0 / 8                    | No                | No       |
| conflicting         | targeted-practice    | 2                | 1                         | 3                            | 1 / 8                    | No                | No       |
| delayed-forgetting  | ready-provisional    | 3                | 0                         | 0                            | 1 / 8                    | No                | Yes      |
| single-slip         | targeted-practice    | 2                | 1                         | 3                            | 0 / 8                    | No                | No       |

Every profile contains nine entry originals and nine delayed outcome prompts; one delayed prompt is unscorable in every profile. The conflicting profile also injects one clearly labelled synthetic evidence record (10 initial evidence records, not a tenth authored question). It tests conflict handling, not another content family or observed child attempt.

**Two false provisional advancements in 13 profiles:** hidden memorization (1/1 control) and lucky-all-correct guesses (1/1 control). Both record correct, apparently novel/unassisted entry responses despite stipulated lack of knowledge. The fixed policy cannot identify that hidden cause from identical observations. Truthfully recorded familiarity blocks advancement. The earlier shared-policy hidden-answer-key regression also still passes by preserving its one residual false advancement; it has not been removed or relabelled as success. Do not pool the matrix zero with these controls to advertise an accuracy rate.

**Three reversals:** both false-ready controls and the delayed-forgetting profile. A reversal means initial `ready-provisional` followed by a non-ready projection after day-3 evidence. The full profile remains provisional; successful numerical outcomes cannot grade the missing open explanation. The standalone delayed bank also fails F conceptual coverage and O's constructed-response requirement. `retentionSignal` in the machine report uses the unchanged due/conflict helper at day 3; it is not a completed or rescheduled production retention cycle.

**Two cases of unnecessary withholding relative to stipulated knowledge:** stale evidence and the single-slip profile. Stale evidence is correctly excluded by the fixed reuse window even though the simulator stipulates continued knowledge. One slip produces targeted-practice advice despite stipulated understanding; later numerical concept success removes that conflict. These are burden tradeoffs of the fixed rule, not evidence of measured child forgetting or a reason to tune this gate on the outcome set.

## Burden and inventory comparison

- Full coverage: **nine initial originals in three tasks, zero practice requests and zero additional facet requests**, plus nine delayed outcome prompts for this experiment. The live route's existing test independently confirms **eight originals** for its narrower two-skill specimen. These scopes differ, so the one-question difference is not an efficiency comparison for the same claim.
- Isolated foundation gap, conflict and single slip: **one unresolved facet requested**, compared with **nine** if one were to repeat this whole declared battery. That is a count comparison of requested coverage, not an executed recovery trial or validated optimal strategy; no fresh equivalent check exists in this package. The reserved outcome bank must not be consumed to make recovery appear available.
- Procedure-only success leaves six cells unresolved; constant-zero guessing leaves eight; known familiarity, assistance, retry-only and stale histories leave nine. Requests are capped to four per dry-run follow-up batch, and partial supply never creates a misleading task.
- Practice availability is **three specimens per affected skill**, with **zero complete ten-original practice tasks**. One affected skill is short seven originals; completing all three possible focused practice banks would require at least 21 further originals, plus suitable fresh follow-up checks. Variant quantity would not increase family independence.
- No practice tasks or retries were actually issued by this offline harness. Counts of available specimens and requested evidence are reported separately from the nine actual scripted entry and nine outcome prompts. Real time, fatigue and classroom opportunity cost were not measured.

## Content validity and review gaps

All 27 declared skill/facet/pool cells have drafts. This is mechanical blueprint coverage, not complete or reviewed educational coverage. There are 26 deterministic numerical keys, one unsupported explanation, and **zero educator-approved items**. Entry and delayed IDs/family labels are disjoint; no reading passages are used. Family labels remain hypotheses, and shared solution strategies may require merging them.

H-F-C needs human scoring. H-V-C may measure counting allowed digits; H-V-A may be solved by ordering alone. H-O-P and H-O-A are choices despite typed numeric responses; the delayed ordering bank therefore lacks sufficient constructed evidence. Some task types may be too language-heavy or advanced, and exact zero/range/boundary coverage is sparse. The three examples per skill cannot substantiate universal performance over 0–999. These concerns are disclosed rather than altering the policy or authoring post-result “holdouts” to obtain a pass.

The independent educator must decide scope/grade fit, prerequisite necessity, objective/facet mappings, family independence, keys/rubrics/accessibility, replacements and replenishment. A future empirical plan also needs approved sample size, acceptable false-advancement risk, uncertainty requirements, delay/burden limits and stop rules. The current outcome bank has been exposed/evaluated; a real study needs fresh independently reviewed reserved families.

## Technical verification

Executed locally using Node 24.22.0; these results are new and distinct from historical revision-3 evidence.

| Check                                                                                                   | Observed outcome                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                                                                              | **110 passed**, 22 files, including 9 new tests; the historical 64-state matrix, negative control and 2,944 numerical recomputations remain exercised     |
| `npm run test:stories`                                                                                  | **137 passed**, 21 files, including the existing automatic-path stories                                                                                   |
| `npm run lint`                                                                                          | Passed                                                                                                                                                    |
| `npm run typecheck`                                                                                     | Passed; local generated Prisma/Next types only                                                                                                            |
| `npm run db:validate`                                                                                   | Passed; no database connection or migration                                                                                                               |
| `npm run build`                                                                                         | Passed; Next standalone build                                                                                                                             |
| `npm run storybook:build`                                                                               | Passed; existing nonfatal module-directive warnings remain                                                                                                |
| `npm run test:e2e`                                                                                      | **26 passed**, including all existing learning-path browser regressions; nonfatal color-environment warnings remain                                       |
| Live Storybook availability/render                                                                      | HTTP 200, expected story ID present, “Mijn blokken voor vandaag” visible, no page runtime errors on port 6006                                             |
| Scoped formatting, local document links, frozen hashes, existing-source preservation and Git whitespace | Passed: scoped Prettier, 100 local link targets, all eight frozen hashes, unchanged earlier runtime/component/style/artwork hashes and `git diff --check` |
| Repository-wide `npm run format:check`                                                                  | **Failed** only on untouched `.impeccable/config.json` and `.impeccable/hook.cache.json`; aggregate `npm run check` is not claimed green                  |

The first new tooling run failed because the required module did not yet exist; its three initial specifications then passed. A later development/adversarial test reproduced ambiguous duplicate bank identity selection (**1 failed, 3 passed**) before the guard was added; the four tooling tests then passed. The frozen content/policy was not modified to resolve that development failure. The final full unit suite includes all nine new tests; no assertion was removed and no visual baseline was regenerated.

Full stories, builds and browser regressions were run conservatively for the assessment QA gate, despite no interactive code or dependency change. Physical-device/Safari/software-keyboard/manual-screen-reader tests, dependency audit, auth spike, Docker/remote CI and deployment were not run: no corresponding implementation or dependency changed, and those checks are not educational validation. Existing visual-baseline comparison was not run because no approved baseline is available and no UI changed. No independent educator or real-learner validation occurred.

Existing review story: [automatic learning-path review](http://127.0.0.1:6006/?path=/story/practice-automatic-learning-path--review-page), verified during this task. It remains the original revision-3 preview; this draft package is **not integrated there**.

Temporary detailed logs are `/tmp/nexo-validation-*.log`; reproducible machine metrics are written under ignored `test-results/`. This report retains the conclusions if temporary artifacts disappear. Completion here means the authorized synthetic preparation is concrete and technically checked. The next gate is independent educational review using the prepared materials, followed only under separate authorization by empirical validation.
