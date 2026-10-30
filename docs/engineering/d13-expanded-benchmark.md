# D13 expanded reviewer screen

Status: implemented and tested; all seven models completed the authorized provisional live screen. Human adjudication and educational approval remain pending. The user authorized this seven-model run on 22 October 2026, within the existing €10/month allowance and excluding Mistral.

## Frozen experiment

- 40 screening exercises, two independent stages per exercise, seven models: at most 560 calls. Each model gets exactly the same candidate content and stage instructions, with its own native strict-JSON adapter.
- Five strata: arithmetic, word problems, Taal, Spelling and reading. Each has four nominally clean and four deliberately defective items. Seventeen blocking defect labels and four attention labels occur across 20 defective items (s40 has two blocking labels).
- Another 40 authored validation items are excluded from the request allowlist. They are reserved for a later frozen evaluation; no results from them have informed tuning.
- Original 12 fixtures, proposed-review metadata and pending human decisions remain separate. New references are agent-authored proposals. The user decision to separate c10 leakage and missing evidence is a scope decision, not blanket human review.
- Reference hash: `07139051117ad4303b1c85afea6cd7438ed0d4624255e0785d0cfa31f7ec6346`. Any content or label change requires a new version. The runner also records a hash of all exact requests.

Models: `gpt-6.1-sol`, `claude-opus-5-5`, `gemini-4-argon`, `claude-sonnet-5-5`, `gemini-3.8-flash`, `claude-haiku-5-5`, `gpt-6-luna`. Largest reservation first, serial execution, 2,048 combined output/thinking tokens, low reasoning where supported, 60-second timeout, no tools, continuations or automatic retries. This comparison applies to these settings, not each model's maximum capability.

## Evidence and scoring

`expanded-fixtures.ts` separates learner-visible content, proposed labels, accepted answer variants and reference provenance. Solve requests omit supplied keys/explanations and all reference labels. Semantic requests include the defective key/explanation. Both stages are independent requests; semantic review never receives the model's solve answer.

`expanded.ts` validates hashes, stage fields, exact literal quotations, status consistency and strict response shape. Version 2 adds rubric/objective evidence and codes for rubric mismatch, instruction contamination and explanation errors. Version 1 behavior remains intact.

The report separates 24 factual/arithmetic answer checks from 16 provisional linguistic checks. A matched reference is not educational approval. Answers outside the frozen variants are “unmatched-needs-review”, not automatically incorrect. Insufficient-evidence cases expect abstention. Missing/malformed outputs stay unresolved and retain costs. Semantic abstentions are unresolved, not passes. Blocking misses require exact code/severity matches, so a differently named but substantive finding needs qualitative inspection before calling it a true miss. Clean-item flags are provisional false alarms until reference inspection. There is no aggregate winner score that masks these distinctions.

Limitations: one sample per stage; short synthetic texts; no age/reading-level calibration; shared concepts across separate family identifiers; no real learner evidence; no external independent reference reviewer. Case/whitespace/punctuation normalization and enumerated answer alternatives are reporting aids, not a production Dutch spelling evaluator. This is a reviewer screen, not a task-creation benchmark. Long passage and creative generation quality remain untested.

## Budget and recovery

All attempts use the existing D12 PostgreSQL ledger in the dedicated local `nexo-school-d13-benchmark` Docker container/volume. The new additive migration admits only the exact expanded review policy and still limits live jobs to one attempt. The €10 monthly cap includes the earlier €0.056702 smoke usage. The expanded run's cumulative live ceiling is €10; the historical smoke command retains its €8 ceiling. Neither limit is reset. Full-context reservations are released only against validated usage receipts; cost uses conservative token rates and an FX/tax margin, not invoice amounts. Provider billing reconciliation remains pending.

Fixed request IDs prevent replaying successful or failed calls. Unknown usage stops all live lanes and preserves the full reservation. No uncertain new-run attempt is automatically reconciled to zero. The historical Gemini-specific recovery command cannot be used for these jobs. No remote environment or public deployment is involved.

## Commands and artifacts

Use Node 24.22.0 and Docker. Commands run from the repository root:

```sh
# Read results without paid requests:
npm run content:smoke-live -- expanded-report
# Resume only still-pending requests within the authorized manifest/cap:
npm run content:smoke-live -- expanded-run
# Offline tests; no provider calls:
npm test -- src/modules/content/review-benchmark/expanded.test.ts src/server/content/live-review-provider.test.ts
```

The private machine-local `.artifacts/d13/expanded-report.json` contains all observations, receipt metadata, costs, hashes, per-model metrics and per-item references. It is written atomically with mode 0600 and is Git-ignored. The dedicated database is the durable attempt/spend authority. Never delete its volume to regain budget. Keep `.env.d13.local` private and do not paste its contents into reports.

## Executed evidence

Passing technical tests never changes pending human review. The completed run is recorded below.

## Completed run — 22 October 2026

All **560 / 560 requests** completed (80 per model), with **554 valid parsed reviews** and **six unresolved parser failures**. No automatic retries or unknown-cost holds. Run commitment **€3.347561**; earlier smoke **€0.056702**; total October commitment **€3.404263**, leaving **€6.595737** under the €10 cap. These are conservative usage charges, not reconciled invoices. Re-running the exact command returned idle with 560 attempts and unchanged charges; it made no extra paid call.

The provider-request hash, including native request bodies/settings/instructions, is `0903e5bc375b031b531092a0315a8bb9ff2a418b256bea1e58f745f8a6bf14d2`. The final report records the canonical request-set hash separately. The first launch stopped before enqueue/dispatch because dotted model names were invalid request IDs; all 560 IDs were normalized and validated by a regression test before execution. No requests, fixtures, prompts or scoring labels changed during the run.

### Frozen raw results

These are exact-reference/taxonomy matches, **not correctness percentages or a quality ranking**. Answer variants, withheld answers, alternative defect codes and reference concerns are interpreted below. All counts retain their full denominators. There are 17 proposed blocking labels per model; unresolved labels are separate from missed labels. A false-alarm item means a flag on a nominally clean reference, still subject to reference review.

| Model             | Valid responses | Factual answer matches | Linguistic matches | Blocking code/severity misses | Unresolved blocking labels | Nominal clean-item flags | Conservative run cost |
| ----------------- | --------------: | ---------------------: | -----------------: | ----------------------------: | -------------------------: | -----------------------: | --------------------: |
| gpt-6.1-sol       |         78 / 80 |                19 / 24 |            15 / 16 |                             1 |                          1 |                        0 |             €0.613549 |
| claude-opus-5-5   |         80 / 80 |                20 / 24 |            14 / 16 |                             1 |                          0 |                        1 |             €1.005162 |
| gemini-4-argon    |         80 / 80 |                20 / 24 |            15 / 16 |                             1 |                          0 |                        3 |             €0.787782 |
| claude-sonnet-5-5 |         80 / 80 |                19 / 24 |            14 / 16 |                             4 |                          0 |                        1 |             €0.493146 |
| gemini-3.8-flash  |         79 / 80 |                20 / 24 |            15 / 16 |                             3 |                          1 |                        2 |             €0.241522 |
| claude-haiku-5-5  |         80 / 80 |                19 / 24 |            13 / 16 |                             3 |                          0 |                        2 |             €0.169155 |
| gpt-6-luna        |         77 / 80 |                18 / 24 |            14 / 16 |                             3 |                          2 |                        3 |             €0.037245 |

Unparsed outputs: Sol s21 solve/semantic; Flash s21 semantic; Luna s05 semantic, s16 solve, s21 semantic. All reported complete responses with known token usage; the strict content/hash/quote/shape parser rejected them. Invalid raw provider bodies were not retained by the adapter, so the exact failed rule cannot be reconstructed. They are not silently repaired or re-called. This limits diagnosis and is a future instrumentation improvement, not evidence that each failure was a wrong educational judgment.

### Separate post-run interpretation

[Interpretation metadata](../../tasks/d13-expanded-analysis.json) records 72 AI-assisted notes, bound to the frozen reference/request hashes. It changes neither the raw scores nor human approval.

- “27 kinderen”, “24 knikkers”, “15 stickers”, “acht/8 kralen” and article-bearing “lente” answers are objectively equivalent to the corresponding numerical/literal answers. Raw mismatches remain visible. No observed non-null answer was established as incorrect in this inspection; abstentions and invalid responses are not treated as correct answers.
- All seven models detected the s06 conversion defect as `wrong-key` rather than the reference's `wrong-unit`. Several models similarly used wrong-key/explanation-error for grammar and unit problems. Their substantive reasons identify those defects. Counting these as educational misses solely because of code choice would be misleading.
- After separately inspecting those equivalent findings, Opus, Argon, Sonnet and Haiku identified all 17 proposed blocking defects at blocking severity; Sol and Flash identified 16 with one unresolved; Luna identified 14 at blocking severity, two unresolved and one underclassified. These are **post-run agent interpretations**, not independent gold scoring.
- Luna detected s38 answer leakage but marked it `attention`, failing the proposed blocking requirement. This is distinct from failing to notice the issue.
- Sonnet's s18 ambiguity flag contradicts its own reason, which says the key is the only antonym and there is no real ambiguity. This is a provisional genuine false alarm.
- Other clean-item flags expose reference questions: generic “including the requested unit” wording in s04/s09/s10/s34, and spelling recognition versus subject–verb agreement in s26. These judgments remain disputed rather than confidently counted against models. Future corrections must create new versions.
- Some models withhold solvable answers when the presentation itself is defective. Those policy/presentation abstentions are reported separately and are not asserted to be wrong answers.

**Provisional next comparison:** Haiku is a promising first reviewer finalist: lowest cost among models with all 80 responses parsed and all proposed blocking defects substantively identified. Compare it on the unused validation set with Flash and/or Sol after clarifying reference interpretations; do not select a production reviewer from this single screen. Luna is inexpensive but its parser failures and leakage underclassification need attention. No task-generation model recommendation follows from these reviewer-only results. The 40 validation items remain uncalled; no next paid run is automatically launched by this report.

## Final verification and handoff

Node 24.22.0: **173 unit tests / 40 files**, **75 built PostgreSQL/integration tests / 8 files** including eleven-migration fresh install/replay, **12 focused learning-path Storybook checks**, **10 built learning-path browser regressions**, Next standalone build, strict typecheck, lint, root/scoped formatting and whitespace checks passed. Arithmetic reference checks recompute operations and conversions independently. Original fixture file SHA256 remains `dc117d616efb3cbec7a3874ec39a36736e61641ba051df9136f710225725b489`; human-decision file SHA256 remains `c5fec932e280c11314fef41e5e06aa83331a833d01d7bbd3dd1d34660125464d`. No human decision was changed. Existing pg deprecation warnings remain.

Not run: full Storybook/E2E/visual/device/Safari/manual-screen-reader suites, remote CI, VPS migrations/deployment, provider invoice reconciliation, the unused validation set or task-generation experiments. No production learning/assessment/publication behavior changed. D13's implemented and tested expanded screen is complete, but full D13 remains open for independent reference adjudication and validated model selection; D14's full dependency is not satisfied by these provisional results.

## User reviewer selection — 22 October 2026

After reviewing the results, the user explicitly chose **Claude Haiku (`claude-haiku-5-5`) for AI content review**. This supersedes the earlier finalist-only recommendation as a model-selection decision. It does not approve reference labels, certify content, complete independent human adjudication or enable automatic publication. The existing benchmark remains frozen; production reviewer integration is not implemented by this documentation change.

The user asked whether question-generator benchmarking should happen next or later. Recommendation: a bounded follow-up within M2's early content-supply work, before relying on a generator in the review/publication workflow. D13 itself measured reviewers; D14 builds the full-content review/publication UI. Separate generator trials should compare usable-question yield, answer/explanation correctness, objective/age fit, ambiguity, diversity and total generation-plus-review cost by content type. Keep deterministic arithmetic in its existing code-generated lane. Haiku may assist review but must not be the only correctness authority, especially for its own generated candidates. A small screen followed by a selective comparison preserves the remaining €6.595737. This is a proposed next assignment, not a new paid execution or approval of a particular generator.
