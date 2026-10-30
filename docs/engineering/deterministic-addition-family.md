# D11 — Bounded digit-addition family

22 October 2026. Technical preparation **Implemented/Tested, Approved by the user on 22 October 2026**. D11 is accepted for this bounded synthetic technical slice. Independent educational certification remains **pending**; user delivery approval does not claim that review. This package does not grant automatic publication authority or satisfy the entire Optellen category.

## Scope and review material

The family in `src/server/content/addition-family.ts` enumerates 100 ordered integer pairs: each operand 0–9, results 0–18, including crossing ten. It uses one fixed Dutch symbolic prompt and one fixed counting instruction/explanation. No random sampling, model output, network calls or AI tokens are needed. This is a strict proposed subset of D10 coverage `rekenen:optellen:01` (“Optellen tot 100 (herhaling)”), not completion or approval of that requirement. D10 requirements remain unmapped.

The proposed assessed skill is `demo:optellen:single-digits`, procedure facet, symbolic representation, constructed integer answer. Proposed prerequisites are counting through 18, recognizing digits and addition/equality signs, and entering an integer. Numeral reading and keyboard entry are supporting demands with no evidence credit. These are agent-authored proposals, not canonical SkillRevisions or independently reviewed prerequisite edges. A correct result does not establish conceptual understanding, application, mastery or readiness to skip foundations.

`integer-exact-v1` names the existing scorer contract: trim whitespace, accept 1–6 ASCII digits and normalize leading zeros, reject signs, decimal/comma/exponent forms and empty input. Tests verify compatibility with the existing parser without changing submissions or retries. The generated key and explanation are server-only review data. Nothing adds them to browser DTOs or changes the saved D05 task source.

## Identity, validation and certification boundary

Every instance pins the complete family contract hash, ordered operands, prompt, key and explanation in a content hash. A stable revision/index gives reproducible instances. The independent solver parses the displayed sum and counts successors; it never uses the generator's addition result. The exhaustive test uses a third counting formulation (array cardinality). Altering any item field or recomputing a hash over a wrong answer fails exact-instance validation. Snapshot tests pin contract and complete inventory bytes; deliberate changes require a new revision and review, not casual snapshot replacement.

All 100 instances belong to **one** family. Commuted pairs share an exposure key: **55** groups. Exposure keys omit revision so a wording/version change cannot reset familiarity. They are content-group identities, not learner exposure history or assignment IDs. Future adapters must scope exposure events by learner and retain these keys; existing D05 records need explicit overlap reconciliation before mixing pools. Repeated issuance, a retry or regeneration does not create fresh evidence. No assessment adapter, selection algorithm or durable exposure store is introduced here.

The manifest declares educational review pending, progression denied and automatic publication disabled. There is no caller-supplied approval flag or synthetic reviewer identity. D10's authenticated exact-version human publication path is unchanged and cannot treat this report as approval. Implementing the production automatic lane requires actual human certification, authenticated immutable certificate storage and family revocation/quarantine at issuance (D15), with assignment/evidence adapters in later work. No database migration or remote operation is part of D11 preparation.

## How to test and review

Use Node **24.22.0** from `.nvmrc`, then run from the repository root:

```sh
npm test -- src/server/content/addition-family.test.ts
npm run content:check-addition
```

The first command runs seven tests, including exhaustive enumeration, invalid bounds/input, tampering, forged hashes, evaluator compatibility and pinned fingerprints. Expected: **7 passed**, with 100 sums checked inside the exhaustive case.

The second prints a read-only JSON review report with the specification, every prompt/key/explanation, source hashes, 100 checked instances, zero mismatches, one family, 55 exposure groups, zero AI calls, `educationalReview: pending` and `automaticPublication: false`. To save it:

```sh
npm run --silent content:check-addition > /tmp/nexo-d11-addition-review.json
```

Inspect indices 0 (`0 + 0`), 9 (`0 + 9`), 55 (`5 + 5`, crossing ten), 79 (`7 + 9`) and 99 (`9 + 9`); the report contains all other cases too. Regeneration must preserve instance IDs/hashes, and index 79 must share exposure with 97. This task has no new student/guardian screen; existing previews still use their existing content.

Independent educator review must record the exact contract/inventory/source hashes, reviewer identity/date, decision and rationale for bounds, Dutch wording, explanation suitability, prerequisite and assessed/supporting mappings, response/accessibility demands and family correlation. Reject or request a new revision where needed. This is review preparation, not a request that the guardian certify algorithm accuracy. No invented reviewer or automated agreement can close that gate.

## Verification and handoff

Executed results are recorded in the task ledger. Technical answer correctness and policy regression tests do not establish educational validity. No real-child outcomes or calibrated accuracy are claimed. Assessment policy revision 3 and its thresholds are unchanged, as are approved UI, retries and Nexai wording.

D12 is independently dependency-ready from D10. D16 must not infer a human certificate from this technical report. Before broadening this family, complete the review above and retain the distinction between educational approval and production publication capability.

## 23 October reusable-family implementation follow-up

The later user-assigned S3a/S3b and bounded D16 work is now implemented/tested, In Review. [Current packages, teaching strategies, previews and separate saved-evidence preparation](reusable-addition-families.md) supersede the proposed-next wording above for that delivered slice. Historical D11/v1 package bytes and review decisions remain intact; no educational certification, automatic publication, D05 source replacement or daily assignment is inferred. General D14, D15 and D25 integration remain open.
