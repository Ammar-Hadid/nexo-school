# Shared educational assessment policy

Policy `synthetic-assessment-v1` · 20 October 2026 · **In Review**. Canonical rationale and contract for the executable rules in `src/modules/practice/assessment/assessment-policy.ts`. This replaces revision 2's demonstration advancement gate only. It is authorized for synthetic, in-memory prototype validation, not decisions for a real child. [Research and alternatives](../research/2026-10-20-assessment-architecture.md) explain the evidential basis; [review and executed results](../design/automatic-learning-path.md) describe implementation.

## Invariants

Correct answers are observations, not conclusive knowledge. False mastery and unsupported skipping of foundational learning are critical defects. Every mandatory objective and relevant prerequisite must independently meet the policy; averages and weighted exercise scores cannot compensate for a missing skill. Keep scoring, evidence eligibility, provisional progression and delayed retention separate. Insufficient evidence requests information, not a diagnosis or assumed failure. Passing tests demonstrates software behavior, not educational validity.

Preserve immutable content/assignment snapshots, genuine attempts and versioned evaluations. Interpretations may change without rewriting those facts. A guardian decision is permission or scheduling context, never learning evidence. Every policy/threshold change requires a version, documented rationale, regression cases and explicit review status. No unvalidated policy may be described as production-ready or silently substituted into approved exercise/retry contracts.

## Representation and boundary

A versioned category blueprint names subject, category, level, mandatory canonical skill revisions, facets and prerequisites. The current executable `path-assessment.ts` adapter uses `demo:<category>:<objective>` IDs in `synthetic-curriculum-v3`: these are bounded specimen identifiers, not invented production canonical IDs. Replace them through an explicit reviewed mapping to the approved architecture's SkillRevision/PrerequisiteEdge model when production curriculum exists. Supporting skills receive no evidence credit. Redactiesommen remains under Rekenen, not a fifth curriculum subject.

Current numerical scope: Getalbegrip contains two specimen skills (tens/place-value and ordering); Optellen contains with/without unit carry and requires both earlier specimen skills. Neither is the entire educational category. The proposed shared facets are procedure, concept and application. Wording changes and different operands remain one family. An authored family label is an independence hypothesis requiring educational review.

Each observation carries source attempt/item, immutable content/evaluator/curriculum versions, assessed skill and level, family, representation, response type, passage where applicable, review status, first-attempt correctness, assistance, novelty, completion, purpose, session and observation day. The route projects these from the existing task snapshots. Attempt dates are captured when committed, not refreshed by finishing an old task. Exposed item IDs are never relabelled fresh. The prototype has no hint button; assistance metadata exists for synthetic histories/future adapters and is tested. External help cannot be detected automatically.

## Eligibility and provisional advancement

Only completed check/confirmation/retention tasks contribute independent first-attempt, unassisted, novel, assessed observations of compatible curriculum/level. Practice, repairs, daily applications, retries, missing review metadata and unsupported response types cannot award readiness. The existing Dutch spelling evaluator and other subject scoring remain unchanged.

For each required skill, the demo gate requires:

- At least one positive observation for each required facet, with no unresolved subsequent eligible error in that facet.
- At least three distinct families, two representations, two task sessions and two constructed responses. Repeated variants from one family contribute at most one observation; where eligible positives differ, a constructed response is preferred as that family’s representative. The reading strategy also collapses all questions on one passage to one observation.
- Eligible evidence no older than 14 preview days; future-dated/invalid observations and duplicate source IDs are excluded. Latest evidence is ordered by observation day, with input order breaking ties. A fresh eligible success in the failed facet from a later task can resolve that conflict; a later variant in the same task cannot erase the error. Prior unaffected facets remain reusable.

These numbers are transparent **engineering/pedagogical heuristics**, not calibrated confidence or research-established minimums. The 14-day window is a bounded reuse policy, not a model of forgetting. There is no scientific confidence percentage and no durable-mastery label. Evidence strength is exposed through independent counts, coverage, missing facets, exclusions and conflicts, separately from the recommended next action.

All mandatory skills and prerequisites meeting the gate permits **provisional advancement** to the next category in that subject. It does not certify understanding or long-term retention. A constrained numerical concept question is still a proxy; it cannot reveal the child's full reasoning. Lucky constructed answers, unseen external help and wrongly tagged families remain possible failure modes.

## Decisions and adaptive workflow

| Decision                            | Trigger                                                                                       | Action                                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| More evidence                       | Missing eligible facets/diversity, stale/assisted/repeated observations, missing prerequisite | Select fresh questions for unresolved facets; reuse valid earlier evidence                                                     |
| Targeted practice                   | Unresolved eligible error in an objective                                                     | Existing ten-original practice task for that objective; preserve deferred identical retries                                    |
| Targeted instruction                | Unresolved failures across three eligible sessions, or two unsuccessful follow-up checks      | Stop the automatic main route for appropriate explanation; no endless drill loop or claimed diagnosis                          |
| Ready provisionally                 | Every mandatory skill and prerequisite passes the demo gate                                   | Advance once, record decision/version, schedule delayed check                                                                  |
| Retention verification due          | Previous provisional advancement, due date reached                                            | Bounded secondary check; awaiting evidence is visible                                                                          |
| No longer sufficiently demonstrated | Failed delayed check                                                                          | Focused repair of affected objectives; preserve other achievements, suspend dependent advancement and recheck the failed facet |

The selector is deterministic: unresolved conflicts first, then missing facets in blueprint order, at most four questions per follow-up task. If the gate is met, no extra confirmation task is needed. It adapts **between completed tasks**, not by silently changing an issued exercise midway; this preserves the approved snapshot/retry contract. The initial specimen check still has four originals, including correlated procedural variants. The all-known numerical path uses eight originals total, six independent observations; further reduction is a future reviewed optimization, not proof that eight is educationally minimal.

Missing appropriate content or true inventory exhaustion produces an explicit waiting notice. No fallback to a familiar item, easier level, unrelated category or fabricated success is allowed. Practice and checks retain disjoint semantic pools. Numerical concept/application probes have separate bounded pools; changing numbers does not increase family count. Full coverage is required before issuing a selected follow-up batch; incomplete inventory stays visibly blocked.

## Retention, workload and reversibility

First check is due two preview days after advancement, subsequent successful checks three days later; unsuccessful/excluded checks or completed repair are reconsidered the next day. These are unvalidated demo schedules. Retention samples one fresh probe per objective and is a signal, never durable mastery proof. Recovery selects the failed facet even if a delayed repair changes the calendar. Repair has four originals. At most one retention/repair task joins the main routes each day; oldest due first. Repeated failures request explanation.

A failed prerequisite blocks new dependent work/advancement; already issued tasks retain drafts and can finish, but cannot advance without the prerequisite. No subject-wide reset. Guardian review can hold/resume future daily issuance for either main route, with an in-memory reason/day history. It leaves attempts, estimates and already-issued tasks intact. It cannot force a mastery claim. Production authenticated overrides, arbitrary reordering and durable correction/rebuild workflows are design scope only.

There are at most four daily tasks: daily Redactiesommen, one per supported main subject and one retention/repair task. Unfinished compatible work carries without erasing progress. Redactiesommen remains available every calendar day including weekends, even when a main route is held. Addition contexts require current provisional addition evidence; otherwise contexts use encountered comparison. These tasks do not award broad reading or arithmetic mastery. Guardian-configurable time/count bounds, a production scheduler and empirically tuned workload remain future work; four slots is the existing demo cap.

## Subject strategies and honest coverage

- **Rekenen:** numerical decomposition, number-line and short-context probes supplement existing procedures. Deterministic scoring remains separate. The finite specimens are authored synthetic material awaiting independent educational review.
- **Taal:** observed vocabulary recognition can identify a gap; the existing bank has no adequate concept/application probes. Correct choices therefore cannot advance it. Wordsoorten stays behind its ordered category; missing content is visible. This intentionally replaces revision 2's unjustified Taal advancement.
- **Spelling:** shared eligibility rules apply to future authored blueprints, with rule-specific acceptable-response/evaluator versions. Current approved practice preserves spelling errors; it is not wired into automatic advancement.
- **Begrijpend Lezen:** policy tests enforce passage clustering and supporting-skill exclusion. Actual automatic assessment requires reviewed objectives, multiple immutable passages, question/evidence anchors, appropriate rubrics and reveal-dependency handling. Approved reading screens are reused unchanged by the separate connected journey; no new reading bank or automatic reading route is claimed here.
- **Redactiesommen:** daily practice remains in Rekenen. Current final answers do not establish operation selection, reasoning, units or reading mastery. The approved production roadmap still requires those richer steps.

The generic evaluator supports all four curriculum subjects; the interactive automatic route implements only the bounded Rekenen flow and Taal's conservative missing-content behavior. Synthetic engine tests of other subjects are not implementation of their curricula.

## Release criteria

Before changing selection, generation, scoring or mappings, run the policy/adversarial tests through the root unit suite, relevant stories/browser checks and the documented quality gates. Keep changed behavior In Review until explicit approval. Independently reviewed blueprints/items and held-out delayed validation are required before real learner decisions; see the research note's validation plan. Production auth, data/persistence, live AI, remote migrations and deployment are not authorized by this milestone.

## Mandatory agent workflow

Apply this workflow to assessment rules, content authoring/generation, grading, skill mappings, evidence adapters, selection, retention, progression and explanations of those decisions.

1. Read this policy, ADR-012, the current automatic-path contract and the QA gate. Inspect the affected implementation and regression tests before deciding what exists. Identify the bounded authorization and any conflict with earlier documentation.
2. Keep policy decisions in the shared evaluator and subject-specific mapping in its domain adapter. Components display decisions; they do not invent separate mastery rules. Preserve immutable attempts, issued tasks and versioned interpretations. Reuse approved exercise, retry, Nexai and navigation contracts.
3. Treat an objective list and family independence as claims requiring evidence. Record the intended scope, prerequisites, assessed versus supporting skills, content/evaluator versions and review provenance. Agent-authored or synthetic material stays labelled as such; an agent review is not independent educator approval. Missing reviewed content remains a content limitation, not a learner weakness.
4. For decision-rule changes, reproduce the risk in a failing regression, implement the smallest correction and verify both false advancement and unnecessary testing/practice. A threshold or eligibility change needs a new policy version, rationale, explicit comparison with prior behavior and review status. Preserve earlier observations rather than rewriting them to fit new rules.
5. Own technical QA. Follow the [assessment regression gate](../engineering/verification.md#educational-assessment-regression-gate), investigate failures and report observed outcomes. Keep scoring correctness, rule correctness, synthetic-model results and educational validity separate. Preserve negative controls and known limitations alongside successful cases.
6. Update the affected canonical policy/ADR, design review record and task evidence together. Link to these sources from handoffs instead of creating competing policy copies. Report changed behavior as In Review until the user explicitly approves that revision; product approval and independent educational validation are separate requirements.

The agent completes the technical preparation and verification it can perform without asking the user to certify algorithm correctness. An actual independent educator reviews educational coverage, task validity and acceptable advancement risk; neither a second AI nor an invented reviewer can satisfy that requirement. Prepare concrete review materials and identify the outstanding human decisions. Real-learner collection, shadow trials and production decisions require their own authorized milestone.

## Bounded preparation evidence · 20 October 2026

The user-assigned [Getalbegrip preparation package](../research/assessment-validation/blueprint.md) applies this policy unchanged to a proposed three-skill subset and 27 draft items. Its [executed report](../research/assessment-validation/executed-report.md) and [educator protocol](../research/assessment-validation/educator-protocol.md) preserve negative controls, inventory limits and human-review gates. Draft validation tooling is not a production content/evidence adapter, and its content is not integrated into the automatic route. No new threshold, approval or empirical accuracy claim is introduced.

## Saved-source shadow preparation · 23 October 2026

The user separately authorized Phase D of the reusable-family assignment. A server-only saved-attempt reader and pure shadow projection now reuse this evaluator unchanged. Existing D05 practice lacks reviewed assessment mappings, complete exposure/assistance and D15 status, so genuine saved answers remain ineligible rather than being treated as failure or mastery. Replays retain exact source/version/cutoff fingerprints; no HTTP evidence intake or learner transition is enabled. [Contract, tested exclusions, provenance and remaining D15/D24/D25/D29–D31 gates](../engineering/reusable-addition-families.md#phase-d-separate-disabled-shadow-integration). This is synthetic technical preparation, not independent educational validation or real-child shadow use.
