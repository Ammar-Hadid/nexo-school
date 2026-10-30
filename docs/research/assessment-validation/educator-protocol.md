# Protocol for independent educational validation

20 October 2026 · Proposal for a future separately authorized milestone. **No educator recruited, no learner records collected, no study conducted.** Preparation completed here is not authorization to run this protocol.

Use the [bounded blueprint](blueprint.md), [exact item/reviewer package](reviewer-package.md), [manifest](manifest.json) and [technical results](executed-report.md). Preserve the canonical [assessment policy](../../product/assessment-policy.md). User product approval, independent educator content approval and empirical validation are three separate decisions.

## Roles and entry gates

Name a qualified independent Dutch primary educator with relevant groep-5 mathematics experience. Record qualifications, date, role, conflicts of interest and the exact package hashes reviewed. An agent, parent product approval, or arithmetic oracle cannot substitute for this role.

Before any real-learner stage, obtain separate scope authorization and complete the applicable privacy, consent/assent, access, retention and safeguarding arrangements. This document supplies an empty protocol, not a collection mechanism. Do not put identifiable learner records in this repository, test fixtures or source control.

| Gate                    | Required output                                                                                                                   | Owner / current status                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Content validity        | Reviewed claims, skill/prerequisite map, key/rubric, ambiguity, accessibility, family grouping and rights for every used version  | Independent educator; pending                                               |
| Technical freeze        | Reviewed content revisions, deterministic evaluator and fixed policy, family-reserved outcomes, reproducible manifest             | Engineering; this synthetic version frozen, future reviewed release pending |
| Empirical plan          | Target population, sampling/uncertainty plan, outcome definitions, delays, assistance recording, burden limits and stopping rules | Educator plus appropriately qualified evaluation adviser; pending           |
| Authorized shadow study | Learner recommendations have no automatic instructional consequence; adult oversight and approved data handling                   | Separate user/operational authorization; not authorized here                |
| Decision-use approval   | Reviewed empirical findings and explicit acceptable-risk decision, with rollback/revalidation arrangements                        | Educational and product/operational owners; pending                         |

## Phase A: review before using responses

1. Review the claim without looking at synthetic pass counts. Decide whether F, V and O are sufficiently bounded and whether F must gate both V and O. Record a reason for each retained edge.
2. For each item, independently solve it before consulting the supplied key. Record alternative correct readings, required skills and any shortcut that bypasses the assessed objective. Inspect H-V-C and H-V-A specifically; supplied correct keys do not make them valid place-value measures.
3. Decide accept/revise/reject for prompt, key, intended facet, response classification, family assignment, difficulty and accessibility. Fill every blank on the reviewer sheet. Disagreement or missing review leaves that item unavailable.
4. Compare pairs across pools for shared solution mechanisms, near-duplicate language, numerical patterns and cue leakage. Treat changes in operands, nouns or wording as the same family. Merge labels conservatively; rerun the policy and inventory audit without weakening the gate.
5. Complete practice inventory and fresh follow-up checks. Review the open H-F-C explanation rubric and permitted demonstrations. Agree how to mark “insufficient information” separately from incorrect reasoning.
6. Any edited item gets a new revision/hash. Do not overwrite the evaluated manifest or claim its test evidence applies to the new version. No certified template or automatic publication approval follows from this review sheet.

## Phase B: fresh outcomes and pre-registration

The synthetic delayed bank has now been evaluated by its author. It can demonstrate reproducibility, but it is **not a pristine human study holdout**. The educator must author/review new outcome families, inaccessible to the interactive selector, practice bank, feedback authors and policy tuning. Reserve separate immediate and delayed sets; never reuse an immediate answer at delay as a fresh observation. If true independence cannot be justified, pause and record a content gap.

Before outcomes are collected, fill and sign this decision record:

| Decision           | Required specification                                                                                                      | Current value                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Population         | Grade/context, prior instruction, inclusion/exclusion and accessibility accommodations; no generalization beyond it         | Pending qualified review                                         |
| Unit of analysis   | Learner/category recommendation and skill/facet outcomes; repeated observations clustered within learner and family         | Proposed; review required                                        |
| Sampling           | Recruitment approach, skill/gap strata, number of learners and observations, handling nonparticipation                      | Sample size pending; no convenient invented minimum              |
| Reference judgment | Observable reasoning/tasks sufficient for each claim; independent assessor rubric; treatment of uncertain judgments         | Pending                                                          |
| Risk bound         | Maximum acceptable false-advancement risk and confidence/uncertainty requirement, especially prerequisite failures          | Pending; zero synthetic errors is not a risk bound               |
| Delay              | Immediate independent confirmation timing and later confirmation interval(s), intervening instruction/re-exposure records   | Pending; demo day 3 is not validated spacing                     |
| Burden             | Maximum questions, minutes, sessions and repetitions; break/stop rules and accommodations                                   | Pending; nine-item package is not a workload recommendation      |
| Comparison         | Fixed rule against a predeclared educator-led or fixed-battery reference using the same target claim and information budget | Pending; do not compare different scope as an efficiency victory |
| Missingness        | Skips, absences, assistance, unscorable work and attrition; denominator and sensitivity analysis                            | Report separately, never silently discard                        |
| Analysis lock      | Content/policy/manifest hashes, metric definitions, adjudication process, stop/revision criteria                            | Required before collection                                       |

An appropriate statistical adviser should select sample size and uncertainty methods for the chosen risk target and clustered/repeated design. One learner cannot calibrate a general system. With zero observed errors, report an uncertainty bound appropriate to the design rather than claiming zero risk. No numeric safety threshold or study size has been approved here.

## Phase C: shadow procedure

1. Record only the authorized, pseudonymous study information in an approved system outside Git. Assign immutable content and policy versions. Keep the educator outcome assessor blind to the algorithm's recommendation, its confidence-like labels and entry correctness.
2. Capture the initial response exactly, plus assistance, prior exposure, interruptions and agreed access adaptations. Do not infer covert help from speed or a correct answer. Record explanation rubrics separately from deterministic numerical scoring.
3. Generate a shadow recommendation with reasons and evidence exclusions. Continue the educator's normal teaching decision; the engine must not skip instruction or advance the real learner.
4. Administer the fresh outcome set under the predeclared information/burden budget. Do not leak keys or corrective feedback into dependent outcome items. Mark any leakage assisted. No automatic claim of learning from the practice block itself.
5. At the agreed later interval administer a different reserved set. Record time since entry and intervening instruction/practice. A delayed failure may require support; it does not diagnose the child or prove that the earlier recommendation caused the failure.
6. Preserve all attempts and versions. Corrections create new evaluation revisions; retain the original disagreement and regenerate the derived report.

## Blinded disagreements

The first educator records per-objective findings and uncertainty before seeing the engine label. Route every potential false advancement, prerequisite gap and unexplained withholding to a second qualified adjudicator who initially sees the task, raw response, context/accommodations and rubric, but neither engine label nor first assessor decision. Resolve rubric/content disagreements by documented discussion after both independent decisions are locked. Record initial agreement, final adjudication, reason and unresolved uncertainty; do not treat consensus as direct access to latent knowledge.

## Metrics and denominators

Report both numerator and denominator, with uncertainty appropriate to the design and breakdowns by objective/facet, family, response format, access need, assistance and time interval.

| Measure                          | Definition                                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| False advancement                | Engine says ready while blinded independent evidence judges at least one required objective/prerequisite insufficient; denominator all ready recommendations, and separately all evaluated recommendations |
| Missed foundational weakness     | Independently identified required foundation gap absent from the engine's reasons/support recommendation; denominator all independently identified foundation gaps                                         |
| Unnecessary withholding/practice | Independently sufficient performance but further checks/drill requested; denominator independently sufficient cases; distinguish missing/stale evidence from a software defect                             |
| Burden                           | Originals, retries, additional checks, practice questions, sessions and observed minutes per recommendation; median/range and distribution by outcome; report refused/unissued requests separately         |
| Content abstention               | Recommendation cannot be resolved because reviewed appropriate content is unavailable; denominator all recommendations needing such content                                                                |
| Evidence abstention              | Assistance, unscorable, invalid, incomplete or stale observations prevent inference; report each reason and denominator separately                                                                         |
| Coverage                         | Reviewed and eligible skill/facet cells and distinct reviewed families/representations, plus missing cells; counts alone do not establish validity                                                         |
| Reversal                         | Initially ready, later insufficient under fresh delayed evidence; denominator initially ready cases with delayed outcomes; disclose missing delayed follow-ups                                             |
| Adjudication uncertainty         | Disagreements, unresolved cases and excluded outcomes by reason, including sensitivity bounds when conclusions differ                                                                                      |

The synthetic report uses stipulated knowledge and deterministic responses, not these independent human judgments. Its question counts are not observed child time or fatigue.

## Proposed stopping and revision rules

Immediately pause the affected content family and investigate a wrong key, ambiguous answer with advancement consequences, assistance/exposure leakage, prerequisite bypass, mistaken skill mapping or unreviewed material served. Preserve history and arrange appropriate adult support. Do not let a reassuring average offset a critical foundational false advancement.

Predeclare burden and participant stop criteria with the educator; stop when a child wants to stop or needs support. The study should never turn an unresolved gap into unlimited drill. Missing suitable content pauses that branch, without substituting unrelated or easier tasks.

An empirical false advancement triggers blinded review and an explicit risk decision before proceeding; the acceptable count/rate and uncertainty-based stop boundary remain qualified-review decisions. Changes motivated by outcomes create a new policy/content version, re-run technical regressions and consume those outcomes as development data. Reserve fresh families for the next evaluation. Keep old failures, burdens and reversals visible.

Completion of this protocol would still require an explicit decision-use gate. It would not itself authorize production auth, persistence, live AI, a deployment, broader curriculum coverage or an unattended real-child pilot.
