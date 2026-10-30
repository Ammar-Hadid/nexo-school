# Getalbegrip item and independent reviewer package

20 October 2026 · **All 27 items are draft/synthetic, original agent-authored content. No educator has reviewed them.** No publisher exercise was copied and no rights certification is claimed. This sheet is reviewer material with visible keys, never learner-facing content.

Read the [bounded claim](blueprint.md), [protocol](educator-protocol.md), [executed results](executed-report.md) and [frozen manifest](manifest.json). Exact identity is item ID/version plus the containing bank SHA-256 below. Each item inherits package `getalbegrip-bounded-draft-v1`, locale nl-NL, proposed groep-5 context, and `review: synthetic`. Only its primary skill receives evidence. Reading/arithmetic/access demands are supporting, not credited.

## Reviewer cover sheet

Reviewer name / qualifications / independence: **Pending — not appointed**. Review date: **Pending**. Manifest verified: **Pending**. Framework and school/method alignment checked: **Pending**. Overall decision (accept/revise/reject) and rationale: **Pending**. Product user approval and independent content approval must be recorded separately.

For each item independently solve before consulting the key. Record decisions for wording, key/rubric, skill/facet, family, difficulty/accessibility and rights. Accepting a numerical key alone does not accept its educational inference. Any edit requires a new revision and hash; do not alter this frozen evaluated content.

## Coverage and known limitations

| Skill                     | Entry/confirmation  | Practice/repair     | Held-out/delayed    |
| ------------------------- | ------------------- | ------------------- | ------------------- |
| F: base-ten foundation    | E-F-P, E-F-C, E-F-A | P-F-P, P-F-C, P-F-A | H-F-P, H-F-C, H-F-A |
| V: positional composition | E-V-P, E-V-C, E-V-A | P-V-P, P-V-C, P-V-A | H-V-P, H-V-C, H-V-A |
| O: ordering               | E-O-P, E-O-C, E-O-A | P-O-P, P-O-C, P-O-A | H-O-P, H-O-C, H-O-A |

P/C/A suffixes denote procedure/concept/application. Nine of nine cells have drafts in each pool; delayed automatic scoring covers only eight because H-F-C is open reasoning. Delayed O has two choice responses and only one constructed response, so cannot independently meet the canonical constructed-response requirement. H-V-C may be answered by counting the stated allowed digits; H-V-A may be answered entirely by ordering. Both need educator review/replacement before they can be trusted as place-value evidence.

Three practice specimens per skill cannot supply an approved ten-original task. The entry pool has no fresh replacement for any cell after its nine originals are consumed. These are explicit inventory gaps, not permission to issue shorter ordinary practice, recycle familiar checks, or take from the reserved bank.

## Family review

The family field describes the proposed solution demand, not an independently verified statistical cluster. Entry and confirmation use three different demands per skill across procedure, concept and application. Practice deliberately shares seven entry families: a different number/context has not been counted as a new family. The two additional practice families are `digit-value` and `expanded-to-numeral`.

The nine delayed families are reserved outside the interactive selector and practice bank: equal-jump counting, conservation explanation, minimum capacity, digit permutation, free-place enumeration, damaged display reconstruction, rank position, constrained extreme construction and service-order interpretation. Their IDs and declared families are disjoint mechanically. **Educational independence is pending.** For example, full groups versus minimum capacity differ in the treatment of a remainder, but an educator may still cluster them. Rank/extrema and damaged-display/adjacent-gap relationships also deserve cross-pool review. Collapsing them reduces available independent evidence; never relabel them just to pass the gate.

All prompts are plain Dutch text; there are no image-only/color-dependent tasks or shared reading passages. Words such as tientallen, honderdtallen, maximaal and opeenvolgende, working memory, and strictly bounded questions may introduce access demands. Agree accommodations before use; adult mathematical prompting must be recorded as assistance. No screen/device/accessibility validation of these draft items is claimed.

## Shared response rubric

For numeric items accept the stated whole-number key, including surrounding whitespace and leading zeros within six ASCII digits. Do not accept another numeric value. Empty text, signs, decimal/grouping punctuation, exponent forms, units/words and non-ASCII numerals are invalid/unscored for this preparation interface; a mathematically sensible verbal answer is not automatically a mathematical error. Raw response remains available. No partial credit, numeric tolerance or AI semantic judgment.

Typed selections among stated options remain choice evidence. H-F-C has no machine key: retain the explanation for human adjudication and return unscorable in the tooling. Its rejected example is a proposed human-rubric contrast, not an executable semantic verdict.

## entry-confirmation

Source: [entry-items.ts](../../../src/modules/practice/assessment/validation/entry-items.ts). SHA-256: `96567488bce594de40688d2fdc551ac4298b9dcc7434861a6d4241780d5d0605`.

### E-F-P · version 1

> Welk cijfer staat op de plaats van de tientallen in 47?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **procedure**.
- Family: `digit-position`; representation: `symbolic`; response: `constructed`.
- Key: **4**. Rationale/rubric: The tens digit is 4.
- Accepted responses: `4`, `4` and zero-padded equivalents up to six digits. Rejected contrast: `40`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could apply a memorized second-digit rule.
- Difficulty assumption (unvalidated): Two digits, no zero.
- Ambiguity/accessibility/validity concern: Digit naming does not establish the value 40.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-F-C · version 1

> 3 tientallen en 4 eenheden zijn evenveel als 2 tientallen en hoeveel eenheden?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **concept**.
- Family: `regroup-equality`; representation: `equality`; response: `constructed`.
- Key: **14**. Rationale/rubric: 34 = 20 + 14.
- Accepted responses: `14`, `14` and zero-padded equivalents up to six digits. Rejected contrast: `4`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could subtract without understanding exchange.
- Difficulty assumption (unvalidated): One exchange of ten.
- Ambiguity/accessibility/validity concern: Noncanonical decomposition needs explicit wording.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-F-A · version 1

> Je hebt 68 kralen. In een vol zakje zitten 10 kralen. Hoeveel volle zakjes kun je maken?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **application**.
- Family: `full-groups`; representation: `context`; response: `constructed`.
- Key: **6**. Rationale/rubric: Six complete groups, eight left over.
- Accepted responses: `6`, `6` and zero-padded equivalents up to six digits. Rejected contrast: `7`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could apply learned division.
- Difficulty assumption (unvalidated): Familiar short context, nonzero remainder.
- Ambiguity/accessibility/validity concern: Ask for full bags, not all bags needed.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-V-P · version 1

> 406 = 400 + ? + 6. Welk getal hoort op de plaats van het vraagteken?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **procedure**.
- Family: `missing-place`; representation: `equality`; response: `constructed`.
- Key: **0**. Rationale/rubric: No tens contribution.
- Accepted responses: `0`, `0` and zero-padded equivalents up to six digits. Rejected contrast: `40`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could calculate 406 minus 400 minus 6.
- Difficulty assumption (unvalidated): Internal zero.
- Ambiguity/accessibility/validity concern: Zero must be accepted, never treated as blank.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-V-C · version 1

> 520 is evenveel als 4 honderdtallen en hoeveel tientallen?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **concept**.
- Family: `hundred-exchange`; representation: `equality`; response: `constructed`.
- Key: **12**. Rationale/rubric: 520 = 400 + 120 = 400 + 12 tens.
- Accepted responses: `12`, `12` and zero-padded equivalents up to six digits. Rejected contrast: `2`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could divide the remainder by ten.
- Difficulty assumption (unvalidated): One hundred exchanged; zero units.
- Ambiguity/accessibility/validity concern: Do not confuse tens digit with total remaining tens.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-V-A · version 1

> Er zijn 3 dozen met elk 100 kralen, 2 zakjes met elk 10 kralen en 7 losse kralen. Hoeveel kralen zijn er samen?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **application**.
- Family: `compose-packages`; representation: `context`; response: `constructed`.
- Key: **327**. Rationale/rubric: 300 + 20 + 7.
- Accepted responses: `327`, `327` and zero-padded equivalents up to six digits. Rejected contrast: `32`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could execute supplied multiplication/addition.
- Difficulty assumption (unvalidated): Three canonical groups.
- Ambiguity/accessibility/validity concern: Reading and arithmetic support the response but receive no evidence credit.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-O-P · version 1

> Welk getal is het kleinst: 608, 680 of 806?

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **procedure**.
- Family: `select-extreme`; representation: `symbolic`; response: `choice`.
- Key: **608**. Rationale/rubric: Compare hundreds, then tens.
- Accepted responses: `608`, `608` and zero-padded equivalents up to six digits. Rejected contrast: `680`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could guess one of three displayed numbers.
- Difficulty assumption (unvalidated): Same digits in different positions.
- Ambiguity/accessibility/validity concern: Answer is selected, even if typed.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-O-C · version 1

> In 4?2 ontbreekt één cijfer. Het getal moet groter zijn dan 472. Wat is het kleinste cijfer dat past?

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **concept**.
- Family: `missing-digit-inequality`; representation: `symbolic`; response: `constructed`.
- Key: **8**. Rationale/rubric: 472 is equal when digit is 7; 482 is first greater candidate.
- Accepted responses: `8`, `8` and zero-padded equivalents up to six digits. Rejected contrast: `7`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could enumerate all digits without a positional explanation.
- Difficulty assumption (unvalidated): Equality trap and shared hundreds.
- Ambiguity/accessibility/validity concern: Strict greater-than and digit versus number need review.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### E-O-A · version 1

> Drie kluisjes hebben opeenvolgende nummers. Het eerste nummer is 398 en het laatste is 400. Welk nummer staat op het middelste kluisje?

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **application**.
- Family: `consecutive-gap`; representation: `context`; response: `constructed`.
- Key: **399**. Rationale/rubric: 398, 399, 400.
- Accepted responses: `399`, `399` and zero-padded equivalents up to six digits. Rejected contrast: `400`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could recall the counting sequence.
- Difficulty assumption (unvalidated): Hundred boundary.
- Ambiguity/accessibility/validity concern: Ordinal labels are not quantities.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

## practice-repair

Source: [practice-items.ts](../../../src/modules/practice/assessment/validation/practice-items.ts). SHA-256: `916d9d6befd94c59f4eefada160c6f664a30ae53329d8cce54c3f552b08ff80c`.

### P-F-P · version 1

> Hoeveel is het cijfer 7 waard in 73?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **procedure**.
- Family: `digit-value`; representation: `symbolic`; response: `constructed`.
- Key: **70**. Rationale/rubric: Seven tens have value seventy.
- Accepted responses: `70`, `70` and zero-padded equivalents up to six digits. Rejected contrast: `7`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could append a zero by rote.
- Difficulty assumption (unvalidated): Two digits.
- Ambiguity/accessibility/validity concern: Distinguish digit and value.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-F-C · version 1

> 26 eenheden zijn evenveel als 1 tiental en hoeveel eenheden?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **concept**.
- Family: `regroup-equality`; representation: `equality`; response: `constructed`.
- Key: **16**. Rationale/rubric: 26 = 10 + 16.
- Accepted responses: `16`, `16` and zero-padded equivalents up to six digits. Rejected contrast: `6`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could subtract ten mechanically.
- Difficulty assumption (unvalidated): Noncanonical decomposition.
- Ambiguity/accessibility/validity concern: Same exchange family as E-F-C; not independent confirmation.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-F-A · version 1

> Er zijn 52 kaarten. In elk vol pakje gaan 10 kaarten. Hoeveel volle pakjes kun je maken?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **application**.
- Family: `full-groups`; representation: `context`; response: `constructed`.
- Key: **5**. Rationale/rubric: Five complete groups, two left.
- Accepted responses: `5`, `5` and zero-padded equivalents up to six digits. Rejected contrast: `6`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could use E-F-A template.
- Difficulty assumption (unvalidated): Nonzero remainder.
- Ambiguity/accessibility/validity concern: Same full-groups family; explicitly practice only.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-V-P · version 1

> Welk getal is 900 + 0 + 9?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **procedure**.
- Family: `expanded-to-numeral`; representation: `symbolic`; response: `constructed`.
- Key: **909**. Rationale/rubric: Nine hundreds, zero tens, nine ones.
- Accepted responses: `909`, `909` and zero-padded equivalents up to six digits. Rejected contrast: `99`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could add without explaining positions.
- Difficulty assumption (unvalidated): Internal zero, upper domain.
- Ambiguity/accessibility/validity concern: Repeated digit and zero.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-V-C · version 1

> 630 is evenveel als 5 honderdtallen en hoeveel tientallen?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **concept**.
- Family: `hundred-exchange`; representation: `equality`; response: `constructed`.
- Key: **13**. Rationale/rubric: 630 = 500 + 130.
- Accepted responses: `13`, `13` and zero-padded equivalents up to six digits. Rejected contrast: `3`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could reuse E-V-C template.
- Difficulty assumption (unvalidated): One hundred exchanged.
- Ambiguity/accessibility/validity concern: Same exchange family, no independent credit.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-V-A · version 1

> Er zijn 8 dozen met elk 100 kaartjes en 9 losse kaartjes. Hoeveel kaartjes zijn dat samen?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **application**.
- Family: `compose-packages`; representation: `context`; response: `constructed`.
- Key: **809**. Rationale/rubric: 800 + 9.
- Accepted responses: `809`, `809` and zero-padded equivalents up to six digits. Rejected contrast: `89`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could apply supplied multiplication.
- Difficulty assumption (unvalidated): Missing middle group.
- Ambiguity/accessibility/validity concern: No tens package is present; language demand needs review.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-O-P · version 1

> Welk getal is het grootst: 99, 100 of 90?

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **procedure**.
- Family: `select-extreme`; representation: `symbolic`; response: `choice`.
- Key: **100**. Rationale/rubric: A hundred exceeds both two-digit values.
- Accepted responses: `100`, `100` and zero-padded equivalents up to six digits. Rejected contrast: `99`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could choose longest numeral.
- Difficulty assumption (unvalidated): Two-to-three-digit boundary.
- Ambiguity/accessibility/validity concern: Practice variant of extrema, not new family.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-O-C · version 1

> In 6?5 ontbreekt één cijfer. Het getal moet kleiner zijn dan 645. Wat is het grootste cijfer dat past?

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **concept**.
- Family: `missing-digit-inequality`; representation: `symbolic`; response: `constructed`.
- Key: **3**. Rationale/rubric: 635 is below 645; 645 itself is excluded.
- Accepted responses: `3`, `3` and zero-padded equivalents up to six digits. Rejected contrast: `4`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could enumerate.
- Difficulty assumption (unvalidated): Strict comparison, equality trap.
- Ambiguity/accessibility/validity concern: Same missing-digit family as entry.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### P-O-A · version 1

> Drie huizen hebben hier opeenvolgende nummers. Het eerste nummer is 699 en het laatste is 701. Welk nummer staat ertussen?

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **application**.
- Family: `consecutive-gap`; representation: `context`; response: `constructed`.
- Key: **700**. Rationale/rubric: 699, 700, 701.
- Accepted responses: `700`, `700` and zero-padded equivalents up to six digits. Rejected contrast: `702`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could use memorized counting.
- Difficulty assumption (unvalidated): Hundred boundary and zero tens/ones.
- Ambiguity/accessibility/validity concern: Explicit consecutive numbers avoids ordinary odd/even street convention.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

## held-out-delayed

Source: [held-out-items.ts](../../../src/modules/practice/assessment/validation/held-out-items.ts). SHA-256: `b2b6ddeb7245ac4e736e4d7aa32345f327a82964432e04e827483ff0a7fe1492`.

### H-F-P · version 1

> Je springt van 0 naar 60 op een getallenlijn. Elke sprong is 10. Hoeveel sprongen maak je?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **procedure**.
- Family: `count-ten-jumps`; representation: `sequence`; response: `constructed`.
- Key: **6**. Rationale/rubric: Count destinations 10, 20, 30, 40, 50, 60.
- Accepted responses: `6`, `6` and zero-padded equivalents up to six digits. Rejected contrast: `7`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could know multiplication fact rather than group structure.
- Difficulty assumption (unvalidated): Six equal jumps; zero origin.
- Ambiguity/accessibility/validity concern: No drawn line; mental sequence demand.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-F-C · version 1

> Mila wisselt één staaf van tien blokjes voor tien losse blokjes. Leg uit waarom het aantal blokjes gelijk blijft.

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **concept**.
- Family: `explain-conservation`; representation: `oral-explanation`; response: `unsupported`.
- Key: **Human rubric only; unscorable automatically**. Rationale/rubric: Educator: explanation must connect one ten with ten ones and conservation of quantity; gesture/material demonstration can be considered. No automatic semantic grade.
- Accepted responses: A reasoned conservation explanation; exact acceptable alternatives pending educator review. Rejected contrast: `Het wordt meer.`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could repeat the statement without understanding.
- Difficulty assumption (unvalidated): Concrete conservation explanation.
- Ambiguity/accessibility/validity concern: Open reasoning needs a human rubric and agreed accommodations.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-F-A · version 1

> Er zijn 83 kralen. In een doosje passen maximaal 10 kralen. Wat is het kleinste aantal doosjes waarin alle kralen passen?

- Primary assessed skill: `proposed:base-ten-exchange-99:v1`; intended facet: **application**.
- Family: `minimum-capacity`; representation: `context`; response: `constructed`.
- Key: **9**. Rationale/rubric: Eight boxes hold only eighty; a ninth is needed.
- Accepted responses: `9`, `9` and zero-padded equivalents up to six digits. Rejected contrast: `8`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could apply ceiling division.
- Difficulty assumption (unvalidated): Capacity, remainder, minimality.
- Ambiguity/accessibility/validity concern: Unlike full bags, partially filled last box counts. Review vocabulary maximaal.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-V-P · version 1

> Verwissel in 306 het cijfer van de honderdtallen met het cijfer van de eenheden. Welk getal krijg je?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **procedure**.
- Family: `digit-permutation`; representation: `symbolic`; response: `constructed`.
- Key: **603**. Rationale/rubric: Units and hundreds exchange positions; tens stay zero.
- Accepted responses: `603`, `603` and zero-padded equivalents up to six digits. Rejected contrast: `360`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could reverse the digit string mechanically.
- Difficulty assumption (unvalidated): Internal zero and place names.
- Ambiguity/accessibility/validity concern: Not proof of understanding their magnitudes.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-V-C · version 1

> Een getal heeft 4 honderdtallen en 0 eenheden. Het cijfer van de tientallen mag elk cijfer van 0 tot en met 9 zijn. Hoeveel verschillende getallen kun je zo maken?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **concept**.
- Family: `enumerate-free-place`; representation: `symbolic`; response: `constructed`.
- Key: **10**. Rationale/rubric: 400, 410, ..., 490 gives ten possibilities.
- Accepted responses: `10`, `10` and zero-padded equivalents up to six digits. Rejected contrast: `9`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could count allowed digits from wording.
- Difficulty assumption (unvalidated): Systematic enumeration; inclusive zero.
- Ambiguity/accessibility/validity concern: Potential cue bypass: educator must assess whether this provides place-value evidence.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-V-A · version 1

> Een teller toont 6 honderdtallen en 2 tientallen. Het cijfer van de eenheden is onleesbaar. De stand is groter dan 625 en kleiner dan 627. Welke stand heeft de teller?

- Primary assessed skill: `proposed:place-value-999:v1`; intended facet: **application**.
- Family: `damaged-display`; representation: `context`; response: `constructed`.
- Key: **626**. Rationale/rubric: Only integer 626 meets both bounds and the displayed places.
- Accepted responses: `626`, `626` and zero-padded equivalents up to six digits. Rejected contrast: `625`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could solve solely by ordering, ignoring place values.
- Difficulty assumption (unvalidated): Strict neighboring bounds.
- Ambiguity/accessibility/validity concern: Known construct contamination; proposal for review, not certified evidence.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-O-P · version 1

> Zet 572, 527 en 257 in gedachten van klein naar groot. Op welke plaats staat 527? Schrijf 1, 2 of 3.

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **procedure**.
- Family: `rank-position`; representation: `symbolic`; response: `choice`.
- Key: **2**. Rationale/rubric: 257, 527, 572; middle rank is two.
- Accepted responses: `2`, `2` and zero-padded equivalents up to six digits. Rejected contrast: `1`. Shared invalid/unscorable rules above apply.
- Intended evidence: the procedure cell of this primary skill, under this task demand only. Alternative explanation of success: Could guess among three positions.
- Difficulty assumption (unvalidated): Three permuted digits.
- Ambiguity/accessibility/validity concern: Finite options make this choice evidence despite asking for a number.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-O-C · version 1

> Wat is het grootste hele getal kleiner dan 500 dat alleen de cijfers 4 en 9 bevat? Je mag een cijfer vaker gebruiken.

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **concept**.
- Family: `construct-constrained-extreme`; representation: `symbolic`; response: `constructed`.
- Key: **499**. Rationale/rubric: Under 500 the largest allowed hundreds is four, followed by two nines.
- Accepted responses: `499`, `499` and zero-padded equivalents up to six digits. Rejected contrast: `494`. Shared invalid/unscorable rules above apply.
- Intended evidence: the concept cell of this primary skill, under this task demand only. Alternative explanation of success: Could enumerate and take maximum.
- Difficulty assumption (unvalidated): Construct maximum under bound.
- Ambiguity/accessibility/validity concern: Zero-to-999 scope is implicit in blueprint; prompt bound makes larger values impossible.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.

### H-O-A · version 1

> Een loket roept nummers van klein naar groot. Jouw nummer is 250. Welk nummer komt na jou: 205, 249 of 251?

- Primary assessed skill: `demo:getalbegrip:1`; intended facet: **application**.
- Family: `relative-service-order`; representation: `context`; response: `choice`.
- Key: **251**. Rationale/rubric: Only 251 exceeds 250.
- Accepted responses: `251`, `251` and zero-padded equivalents up to six digits. Rejected contrast: `249`. Shared invalid/unscorable rules above apply.
- Intended evidence: the application cell of this primary skill, under this task demand only. Alternative explanation of success: Could guess or follow last-option habit.
- Difficulty assumption (unvalidated): Short ordinal application.
- Ambiguity/accessibility/validity concern: Position fixed in paper draft; future renderer must preserve frozen presentation and avoid cues.
- Reviewer / date: **Pending**. Decision (accept/revise/reject): **Pending**. Reason: **Pending**.
- Wording/key/rubric decision: **Pending**. Skill/facet decision: **Pending**. Family independence decision: **Pending**. Difficulty/accessibility/rights decision: **Pending**.
- Unresolved question: is this task sufficient evidence for its claimed cell, despite the stated alternative explanation and concern? Reviewer response: **Pending**.
