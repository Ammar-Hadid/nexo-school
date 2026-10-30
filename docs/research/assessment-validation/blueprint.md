# Bounded Getalbegrip blueprint for independent review

20 October 2026 · `getalbegrip-bounded-draft-v1` · **Draft/synthetic content; preparation tooling In Review**. The user activated [the handoff](../../../tasks/assessment-validation-handoff.md). No educator has reviewed or certified this package. Automatic-path revision 3 remains In Review.

The proposed claim is **provisional evidence for base-ten grouping, positional composition and relative whole-number order within the declared bounds**, suitable for discussing a small groep-5 preparation slice. It is not “all Getalbegrip”, readiness for every addition objective, or permission to skip a school unit. The fixed [shared policy](../../product/assessment-policy.md) is evaluated unchanged. Success under that policy is a software projection over unvalidated item/family annotations.

Start with the [item and reviewer sheet](reviewer-package.md), [independent-validation protocol](educator-protocol.md), [executed report](executed-report.md), [frozen manifest](manifest.json) and [scenario plan](scenario-plan.json).

## Source argument and limits

Sources checked on 20 October 2026. These are curriculum/assessment references, not validation of this package.

- SLO's [Tussendoelen rekenen-wiskunde, version 2017](https://www.slo.nl/publish/pages/3176/tussendoelen-rekenen-wiskunde-po-2017_1.pdf), printed pages 89 and 97 (PDF indices 90 and 98, visually inspected), places decimal grouping, positional structure and comparison within the progression toward groep 5. Its groep-5 scope reaches at least 1,000 and includes considerably more than this package. The introduction describes the progressions as nonmandatory example elaborations. **Our choice:** restrict operands to 0–999, with a 0–99 foundation. This deliberately excludes 1,000 and is not full attainment of that source's goals.
- SLO's [TULE groep-5/6 classroom illustration](https://www.slo.nl/thema/meer/tule/rekenen-wiskunde/kerndoel-26?mode=groepen-56-doorkijkje) connects ordering with the structure of numbers and discussions about their position. **Our inference:** use more than finding the largest numeral; include constrained comparisons and short contextual applications. It does not establish independent item families or this assessment's thresholds.
- SLO's [learning-progressions overview](https://www.slo.nl/thema/vakspecifieke-thema/rekenen-wiskunde/leerlijnen/) distinguishes learning sequences and their development. SLO's [formative-evaluation cycle](https://www.slo.nl/thema/meer/10-14-onderwijs/werken-leerdoelen/slag-formatief-evalueren/) connects goals, elicitation, interpretation and adaptation. **Our inference:** disclose uncertainty and choose further evidence or support from the unmet claim, without labelling the learner.

The 2017 progression and TULE are explicitly historical curricular references. This package makes no legal/current-standards or exact Malmberg alignment claim. The school's framework/version and method edition must be checked by the educator. The architecture's standards-version boundary remains intact.

## Declared objectives

All three facets—procedure, concept and application—are required for each row. “Concept” identifies intended evidence, not proof that a constrained answer reveals reasoning. Full objective/facet coverage means nine declared cells have draft items; it does not mean the samples exhaust the number domain or are valid measures.

| Code | Required objective and bounds                                                                                                                                         | Intended observations                                                                             | Exclusions from this objective                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| F    | Relate tens and ones for quantities 0–99: identify the tens digit, preserve quantity when exchanging one ten, and interpret complete groups of ten in a short context | Digit identification; noncanonical equality after a ten exchange; number of full groups           | Fluent counting, oral number naming, all division facts, general remainder reasoning            |
| V    | Compose and interpret hundreds/tens/ones for whole numbers 0–999, including an absent place and exchanging one hundred for tens                                       | Missing place contribution; noncanonical hundred/tens equality; reconstruction from stated groups | General addition/subtraction algorithms, regrouping chains, decimal fractions, number dictation |
| O    | Compare/order at most three whole numbers 0–999 and determine a missing digit or adjacent whole number under explicit bounds                                          | Extrema; strict comparison with an equality trap; an adjacent ordinal gap                         | Approximate placement, scaled number lines, distance/rounding, arbitrary long sequences         |

F is an explicitly assessed prerequisite to both V and O. The proposed prerequisite edge to O is conservative and needs review: some children can compare without fluent regrouping. It may create unnecessary withholding. F is assessed through its own three cells using the same policy; it is never inferred from V/O success or a guardian permission.

Operational entry assumptions are recognition of Arabic digits, ability to give a response, and access to the short Dutch instructions. These are not certified prerequisite achievements. If access/understanding of instructions is uncertain, an educator should investigate or adapt access; no mathematics deficit or mastery follows automatically.

Supporting demands include reading, working memory, simple arithmetic, understanding a package/context, and following positional language. They receive **zero additional skill credit**. An answer is credited to one primary assessed skill only. The explicit H-V-A ordering shortcut is a content concern, not a second assessed skill.

## Architecture mapping and migration boundary

| Package identity                          | Architecture concept and relationship                                     | Existing implementation / transfer                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `getalbegrip-bounded-draft-v1`            | Proposed draft CurriculumRelease, locale nl-NL, groep-5 context metadata  | Separate from `synthetic-curriculum-v3`; no database records or published release                                  |
| `proposed:base-ten-exchange-99:v1` (F)    | Proposed SkillRevision under Rekenen/wiskunde → Getallen → Getalbegrip    | New, not a production UUID; no equivalent independent prerequisite in current route                                |
| `proposed:place-value-999:v1` (V)         | Proposed SkillRevision with observable positional objectives              | Broader than `demo:getalbegrip:0` (“tens place”); new identity avoids silently widening old evidence               |
| `demo:getalbegrip:1` (O)                  | Reuses the current ordering skill identity in this proposed release/level | Same ordering construct; existing route evidence has incompatible release/level and cannot transfer                |
| F → V and F → O                           | Proposed PrerequisiteEdge DAG, both edges explicit                        | `assessPackage` derives F readiness through `assessCategory`, then passes its ID to the unchanged target evaluator |
| Each item ID plus version `1`             | Draft QuestionVersion/EvaluationSpec/assessed QuestionSkill               | Exact source bytes identified by manifest; original agent-authored content, not licensed publisher content         |
| Raw simulated response/source/day/session | Attempt facts, then replaceable evaluation/evidence projection            | Local test records only; raw string retained by validation scoring; no production persistence                      |
| Per-item pending reviewer decision        | Future exact-content ApprovalRecord/StandardAlignment                     | No reviewer identity, approval or school mapping invented                                                          |

This follows [ADR-004/005/006/012](../../architecture/decisions.md) and [the canonical curriculum architecture](../../architecture/initial-architecture.md#4-canonical-curriculum-and-educational-content). It needs no new ADR, service, schema, production skill tree or parallel assessment policy.

## Difference from the inspected route

The inspected `path-content.ts` labels two Getalbegrip specimens: tens-place value and ordering. Its numerical generators sample 123 + 10n, and its supplemental probes use total tens, grouped contexts, predecessor and consecutive-number tasks. This is implementation evidence, not a complete curriculum.

| Gap                               | What this preparation supplies                                                 | What remains unresolved                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Independently assessed foundation | Three F facets and explicit prerequisite edges                                 | Educational necessity of both edges and access assumptions                                                            |
| Broader positional objective      | Separate V identity; absent place, hundred exchange, grouped reconstruction    | Educational validity; examples do not exhaust 0–999 or all zero/boundary cases                                        |
| Ordering beyond extrema           | Strict-bound digit construction, ordinal gap, delayed rank/constrained maximum | Whether these facets are appropriate and genuinely distinct                                                           |
| Facet/representation inventory    | Nine cells per pool, 27 original drafts with declared family relationships     | Nine entry items is a minimum specimen inventory, not a replenishable route                                           |
| Independent outcomes              | Nine reserved delayed candidates with disjoint IDs/authored families           | H-F-C needs a human; H-V-C and H-V-A may fail construct validity; O has only one constructed delayed response         |
| Review provenance                 | Exact versions/hashes, keys, concerns and blank decisions for every item       | Zero educator approvals; `review: synthetic` remains synthetic                                                        |
| Repair and recheck supply         | Three practice specimens per skill; explicit exhaustion tests                  | Seven more originals per skill for a ten-item task, plus new unseen check families; no routine repair path is claimed |

The preview remains on its original two objectives and original content. No draft here is published into the automatic route. Approved practice screens, retries, Dutch Nexai wording, independent subject state and daily Redactiesommen are unchanged.

## Response and interpretation contract

Numeric items expect one whole-number token: 1–6 ASCII digits, optional surrounding whitespace and leading zeros; exact numeric equality, no partial credit or tolerance. Empty input, signs, grouping punctuation, decimals, exponents, labels/units, words and non-ASCII digits are invalid for this **test package**, not wrong mathematical reasoning. Valid other whole numbers are incorrect. Raw input remains available. These restrictions reuse the current route's numerical scorer after a validation-only syntax check; they do not change the learner input contract or production normalization roadmap.

Explicitly selecting from displayed alternatives stays `choice` evidence even when typed. The open explanation H-F-C is `unsupported` for automatic grading; all responses remain unscorable until a qualified reviewer defines and applies the human rubric. Invalid/unscorable responses produce no eligibility observation in the preparation adapter.

Successful eligible observations would support a **provisional, narrow next-practice recommendation under this fixed synthetic rule**. They would not certify reasoning, long-term retention, complete Getalbegrip, groep-5 attainment, ability to skip foundational instruction, reading mastery, or readiness for all Optellen. With the identified content concerns and absent human review, the package currently supports **no real-learner decision**.

## Decisions reserved for the educator

Review the subset/grade fit and both prerequisite edges; choose which task demands actually expose each facet; collapse families where differences are superficial; assess lexical/accessibility burden and acceptable non-typed responses; reject or replace cue-driven items; complete fresh check/practice/delayed inventory; set empirical risk/burden/uncertainty requirements. Policy proposals, including possible burden reductions or different retention intervals, must be recorded separately and versioned before testing. No threshold change is proposed or implemented in this package.
