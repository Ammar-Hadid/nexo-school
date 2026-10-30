# Optellen: one-time family review

Package **d14-optellen-certification-v1** · **Partial user feedback recorded; explanation changes required; no educator certificate** · 23 October 2026.

**Chat follow-up:** the user explicitly approved the single-digit question format and bounded procedural-practice scope and requested useful teaching explanations for crossing ten, doubles and zero. Other criteria/example inspection and independent educator status were not inferred. This feedback is documented here; no authenticated database decision was created. The exact original examples/package below remain unchanged. [Reuse audit and next revision](d14-addition-reuse-handoff.md).

This is a review of one reusable pattern, not 100 separate questions. Allow roughly **15 minutes once**; this estimate is unmeasured. Save and resume as needed. If a problem is already clear, stop and report it rather than finishing every example.

## 1. Read the scope

- Two integers from **0 through 9**, with answers **0 through 18**, including crossing ten.
- Proposed prerequisites: counting through 18, recognizing digits and `+`/`=`, and entering an integer.
- Intended use: **procedural practice only**. It is a small part of Optellen, not full “Optellen tot 100”, conceptual understanding, word problems or a mastery/skip decision.
- All 100 ordered sums use one symbolic question pattern and one fixed short explanation pattern. Commuted pairs give **55 groups in one family**, not independent assessment evidence.
- Reading numbers and keyboard entry are supporting demands. This family does not supply alternative visual/audio representations.

## 2. Inspect these seven examples

Check whether the question and feedback are useful and understandable within the scope. You do **not** need to verify our algorithm or manually recalculate all 100 sums.

| #   | Why this example                                  | Question and key | Exact Dutch explanation     |
| --- | ------------------------------------------------- | ---------------- | --------------------------- |
| 1   | Ondergrens: beide getallen nul                    | 0 + 0 = 0        | Tel 0 op bij 0. 0 + 0 = 0.  |
| 2   | Nul als eerste getal                              | 0 + 9 = 9        | Tel 9 op bij 0. 0 + 9 = 9.  |
| 3   | Nul als tweede getal; dezelfde somgroep als 0 + 9 | 9 + 0 = 9        | Tel 0 op bij 9. 9 + 0 = 9.  |
| 4   | Uitkomst onder tien                               | 4 + 5 = 9        | Tel 5 op bij 4. 4 + 5 = 9.  |
| 5   | Precies tien; gelijke getallen                    | 5 + 5 = 10       | Tel 5 op bij 5. 5 + 5 = 10. |
| 6   | Over het tiental                                  | 7 + 9 = 16       | Tel 9 op bij 7. 7 + 9 = 16. |
| 7   | Bovengrens: hoogste uitkomst                      | 9 + 9 = 18       | Tel 9 op bij 9. 9 + 9 = 18. |

The explanation is intentionally shown exactly as generated. It is a short counting instruction followed by the result, **not a worked teaching strategy**. If that is insufficient, select **needs changes**; do not assume the automated arithmetic pass approves the explanation.

## 3. Give four judgments

Use **accept within this scope / needs changes / unsure** for each:

1. **Scope and prerequisites:** suitable for the bounded procedural practice described above? Any prerequisite or excluded skill missing?
2. **Wording and accessibility:** is the symbolic prompt clear, with suitable reading/input demands?
3. **Explanation:** is the short counting instruction/result enough for the intended practice, or should the template change?
4. **Response and evidence limits:** for answer 5, `5`, `05` and surrounding whitespace are accepted; `+5`, `5.0`, `5,0`, `5e0`, empty input and more than six digits are rejected. Are those rules suitable? Mirrored/repeated variants do not establish independent mastery. The 14-day stock cooldown is **not** being certified here.

Add a short reason, especially for a change or uncertainty. An early negative/uncertain judgment leaves uninspected examples and other criteria explicitly unanswered. Positive approval requires all seven examples and all four judgments.

## 4. State the review basis

- **Role:** parent/guardian, or educator with relevant mathematics/educational expertise. If educator, describe your own relevant experience or qualification; the app records this declaration but does not independently verify credentials.
- **Basis:** your own independent human judgment, or an AI-assisted preliminary assessment. Using AI to supply the judgment is not independent human educational approval.

Parent feedback is useful and remains separate from an educator certificate. The existing [assessment policy](../docs/product/assessment-policy.md#mandatory-agent-workflow) requires an actual independent educator for educational sign-off. Do not claim that role unless it applies. “Unsure” is a valid result.

If you use the Storybook preview, its clicks are demonstrations only. Send your actual judgments in this chat, referencing this package, or record them through the authenticated local review route. No actual review has been inferred from your approval of D14-S1.

Copyable response:

```text
Package: d14-optellen-certification-v1
Examples inspected: [numbers, or all seven]
Scope/prerequisites: accept / change / unsure — reason
Wording/accessibility: accept / change / unsure — reason
Explanation: accept / change / unsure — reason
Response/evidence rules: accept / change / unsure — reason
My role: guardian / educator [relevant expertise if educator]
My review basis: independent human / AI-assisted preliminary
```

## Technical evidence and boundaries

The server independently regenerates and checks all 100 sum/key pairs against this immutable inventory. Unit checks use a third array-count formulation and the existing integer parser. Source fingerprints must match before a build; a source change requires a new review package. These are technical facts, not educational judgments. No model call is required.

- Package SHA-256: `ecc2b2df57d46975d6cea0559893515aca5eb6ba5758cf69f5eeac5592c824bd`
- Contract: `a4314053a7c66c3dbcbe284be9e1bfd587d435af4826b94c1cc85d9c5701098b`
- Inventory: `a7c5d517e9ceb0a30b21cab12b916bc0366cb4daed6a53a6881368ee31d34e5c`
- [Complete package, source fingerprints and all 100 variants](../src/modules/content/family-review/optellen-review-package.json)

Even an independent educator approval in this workflow **does not activate publication, issue tasks, alter learner scores or certify the whole Optellen category**. Withdrawal/quarantine (D15), actual assignment/exposure (D25) and the explicit certified-supply connection still need their own implementation/release gates. Upfront review time is separate from the weekly item-review allowance.
