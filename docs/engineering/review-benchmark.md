# D13 — Automated content-review benchmark

**Expanded live evaluation:** [D13 screen version 2](d13-expanded-benchmark.md) adds a frozen 40-item screen and separate unused 40-item validation set. Its authorization permits provisional measurement, not independent human approval. Original fixtures and version-1 reports remain historical and unchanged.

22 October 2026. Local fake-provider benchmark **Implemented/Tested, In Review**. Node 24.22.0 verification passed: 152 unit tests/34 files, 69 built PostgreSQL/integration tests/7 files, eight-migration install/replay, 12 learning-path story checks, 10 built browser checks, lint/typecheck/schema validation, standalone build, formatting, document links and offline report generation. Exact omissions remain in the task ledger. D12's bounded queue/spend slice was explicitly approved by the user before this work. **D13 remains open:** the reference labels await human adjudication and the user-authorized technical smoke passed across all seven models after an evidenced Gemini recovery; it is not a completed quality benchmark. See the current follow-up below.

## Current live follow-up — 22 October 2026

The user removed Mistral, supplied the other three keys and authorized efficient testing. The [live setup](d13-benchmark-setup.md) supports seven models through D12's shared durable ledger, an €8 run reservation ceiling inside €10/month and a c01 request per stage/model. After an initial Gemini 503, the user provided Free tier dashboard evidence, linked billing and explicitly requested retesting. [Completed recovery](d13-gemini-recovery.md): **14 valid responses across all seven models**, one preserved/reconciled historical failure, **€0.056702 total conservative usage charges**, no unresolved cost holds. No repeated successful calls or automatic retries. Human adjudication and a meaningful quality benchmark remain open. Historical fake/offline sections below describe their original slices; their no-live/no-migration statements are superseded only by the explicitly authorized technical smoke.

## AI-assisted reference findings — 22 October 2026

Ammar explicitly submitted preliminary **AI-assisted proposals, not independent human approval**. All 12 are retained in [separate exact-hash metadata](../../tasks/d13-proposed-review-findings.json), with direct arithmetic/structural checks, source-backed language checks, provisional severity/completeness and provenance. The original fixtures/expectations and human decisions are unchanged. The one disputed c10 evidence interpretation was resolved by his explicit choice to separate cases: original leakage case retained, [new draft missing-evidence variant](../../tasks/d13-reference-variants.json) shares its development family and is not holdout evidence. No further material dispute currently needs his decision. [Verification and concrete preparation plan](d13-reference-verification.md) identify the v1 schema's inability to represent rubric findings, the new interpretation version, split allocation and separate reporting required before the real expanded comparison. No approval is inferred from his scope choice or model agreement.

## Scope and separation

`src/modules/content/review-benchmark/` contains 12 synthetic Dutch development fixtures, proposed defect labels/rationales, exact-version requests, strict response parsing and report calculations. `src/server/content/review-benchmark.ts` enqueues and reads the benchmark using D12's existing jobs and receipts. `fake-review-provider.ts` supplies two deliberately scripted controls through the same provider port. No queue policy, schema/migration, publication authority, assessment threshold, learner screen or Nexai wording changed.

The four nominally clean controls and eight seeded defective items span arithmetic, language, spelling, reading and objective alignment. Seven seeded defects are proposed blocking issues; one vocabulary mismatch is proposed attention. These are agent-authored **development labels**, not an adjudicated gold set, an unseen holdout or educational approval. The fixture hash is `d1a6482afa85f1f1d256c86ef06bc49ffcd018d897afbf80092eb0db22b789f7`. Human corrections require a new fixture/review version and a new run identity; do not overwrite historical benchmark jobs or call the corrected set held-out.

The benchmark's deliberate defects are isolated test material. They do not change approved exercises, including the spelling fixture's explicit error-preservation policy.

## Cross-provider research follow-up — 22 October 2026

The user requested research across providers for both creation and review, allowing different generators by task type. The [model comparison and proposed D13 experiment](../research/2026-10-22-d13-model-comparison.md) and [wider provider survey](../research/2026-10-22-alternative-model-survey.md) record the findings. Eight core candidates are proposed; no production model is selected. The research revisits ADR-007's initial Anthropic preference and does not authorize live spending. Existing fake results and adjudication gates below remain unchanged. Creating and benchmarking new AI-authored tasks is a separately described companion experiment, not a capability already delivered by this review harness.

## Offline setup follow-up — 22 October 2026

Ammar accepted the eight-model comparison, confirmed all four provider accounts and €0 other nexo AI expenses this month, and named himself reference reviewer. The [offline setup and testing guide](d13-benchmark-setup.md) provides local private-key preparation, presence-only checks and the original 12-item [reference review package](../../tasks/d13-reference-review.md) with [pending decisions](../../tasks/d13-review-decisions.json). Selecting a reviewer is not adjudication: all labels remain pending until his actual decisions are recorded. His benchmark judgments do not claim independent educational certification. Live adapters, the expanded reference/holdout sets, durable real-price bounds and paid execution remain pending. The existing fake benchmark below is unchanged.

## Review flow

Each candidate gets two separately persisted `review` jobs per profile:

1. **Solve:** question, full passage/context, options, objective and rubric; no proposed answer, explanation, expected defect labels or adjudication rationale. The fake solver independently counts displayed digit sums through D11's successor-count solver. Its other answers are scripted plumbing behavior, not a semantic reasoning implementation.
2. **Semantic review:** the full candidate including proposed key and explanation, but no expected defect labels/rationales. The two stages do not share a response or chain of reasoning. An independent request is not independent educational expertise.

Requests pin benchmark version, profile, candidate content hash and stage. D12 freezes exact request bytes and prevents conflicting reuse. Returned objects have exact fields; status, defect codes/severity, answer constraints and source quotations are validated. A quote must occur literally in the named supplied field. Solve-stage findings cannot cite the concealed answer/explanation. Missing jobs, malformed responses, stale hashes and abstention remain unresolved. Quote validation establishes attribution, not the truth of a model's reasoning.

`fake-checker-v1` is a scripted control with one deliberate semantic grammar miss and one deliberate false alarm. `fake-pass-all-v1` suppresses all semantic flags, retaining the same independent solver. Neither is a real AI model. Their results must never be used to select or endorse a commercial model. The fake adapter reads the request only and does not import the fixture labels. It delegates non-benchmark requests to D12's existing fake adapter; no live adapter is enabled.

## Metrics and meaning

Reports retain per-item expected labels, solver result, semantic findings, missing defect codes and unresolved state alongside totals. The CLI also includes all original candidate text, keys, explanations and proposed label rationales for inspection.

- `completedCriticalMisses`: proposed blocking defects without a matching blocking semantic flag, among items with both stages resolved. It measures the semantic stage, even if the independent solver raises an answer disagreement.
- `unresolvedCriticalDefects`: blocking reference defects on unresolved items, reported separately so abstention/failure cannot disappear from the denominator. A semantic flag can exist while the independent solve remains unresolved.
- `undetectedDefects`: proposed codes lacking adequate semantic detection across the entire set, including incomplete items.
- `falseAlarms`: clean reference items with a semantic flag or solver/key disagreement. `flaggedItems` counts semantic flags; `answerDisagreements` separately counts literal solver/key differences. A disagreement requests human inspection; it is not proof that either answer is correct, particularly for semantic equivalents.
- Tokens and simulated committed cost come from **all durable D12 attempts**, including retry reservations and uncertain charges. Attempt counts are durable attempt records, not proof that every reserved request reached a provider. Known token totals are retained even if another attempt's usage is unknown. Unknown-usage attempts are counted explicitly. No unattempted queued job invents a receipt.

The initial scripted run, per profile, has 12 items (8 defective, 4 clean), 24 calls, 240 fictional input tokens, 480 fictional output tokens and 9,600 simulated micro-euros (€0.0096). Both profiles together account for 48 calls and €0.0192 **simulated**, with actual spend **€0**. The offline CLI labels these as simulated receipts; only the PostgreSQL integration path exercises durable reservations.

| Scripted profile | Semantic flags | Completed critical misses | Unresolved items / critical defects | False alarms | Solver/key disagreements |
| ---------------- | -------------: | ------------------------: | ----------------------------------: | -----------: | -----------------------: |
| fake-checker-v1  |              8 |                         1 |                               1 / 1 |            1 |                        3 |
| fake-pass-all-v1 |              0 |                         6 |                               1 / 1 |            0 |                        3 |

The missing-evidence reading case abstains in the solve stage. The controls show that the reporting preserves errors and uncertainty. They say nothing about real Dutch model quality, validated school level, user review time or educational accuracy. There is no model-confidence threshold, automatic approval or D10 publication call.

## How to test

From the repository root with Node **24.22.0**:

```sh
npm test -- src/modules/content/review-benchmark/benchmark.test.ts src/server/content/review-benchmark.test.ts
npm run content:benchmark-review
```

Expected: **7 focused tests pass**. The second command prints the two complete scripted reports and all 12 candidate/reference pairs. It requires no Docker, credentials, database or network. Save the report if useful:

```sh
npm run --silent content:benchmark-review > /tmp/nexo-d13-review-report.json
```

Inspect `c05` for the incorrect arithmetic key, `c09` for missing passage evidence and abstention, `c11` for the intentional semantic miss despite solver disagreement, and `c02` for the intentional false alarm. Neither report should show human adjudication or educational approval.

With Docker running:

```sh
npm run test:saved
```

This builds the app and creates/removes disposable local PostgreSQL, applies/replays the eight existing migrations, and exercises four new D13 scenarios along with existing identity, content, queue and saved student/guardian cases. D13 checks 48 persisted review jobs, exact re-enqueue/reconnect without duplicate charges, budget-blocked/malformed reviews, and uncertain failed-attempt cost plus known retry token totals. Existing D12 tests cover actual timeout, stale workers, process recovery and concurrency. The script ignores caller database URLs; nothing is applied to the VPS. There is no new screen in D13.

## Human adjudication package and live-run gate

Use the CLI's complete `reviewMaterial` and proposed rationales to review **every** clean and defective item, including unflagged cases. An independent Dutch educator/content reviewer should record reviewer identity/date, exact fixture hash, accept/change decision, correct answer/acceptable alternatives, defect code/severity and rationale for each row. Reconcile disagreements before calling this an adjudicated set. Review suitability and intended scope independently of the model's response. Preserve original proposals and append reviewed decisions; do not invent a reviewer or silently replace reference truth to improve scores.

| Item | Proposed reference                                             | Review decision |
| ---- | -------------------------------------------------------------- | --------------- |
| c01  | Clean digit addition                                           | Pending         |
| c02  | Clean synonym                                                  | Pending         |
| c03  | Clean verb form                                                | Pending         |
| c04  | Clean text-supported answer                                    | Pending         |
| c05  | Blocking incorrect arithmetic key                              | Pending         |
| c06  | Blocking two valid choices                                     | Pending         |
| c07  | Blocking incorrect unit                                        | Pending         |
| c08  | Attention: technical term violates explicit wording constraint | Pending         |
| c09  | Blocking missing passage evidence                              | Pending         |
| c10  | Blocking earlier-feedback answer disclosure                    | Pending         |
| c11  | Blocking incorrect verb agreement                              | Pending         |
| c12  | Blocking objective mismatch                                    | Pending         |

Before real benchmarking: adjudicate and freeze a larger representative set plus genuinely unused family/passage-separated holdout; define critical-error and disagreement handling; verify current provider models, prices, token maxima, euro conversion/tax buffer and privacy terms. Propose an exact bounded run and obtain its separate spend authorization inside the shared €10 monthly ceiling. D12's fictional €0.001 reservation is **not** a safe live-price bound and must not be reused for a real call. Persist actual model/version, prompt, response, token/pricing receipts and all reservations through the existing budget contract. Compare models on the same frozen inputs; do not tune against the reserved holdout. A real model adapter and live run are **Not Implemented** here.

D14's full-content review UI depends on D13; do not mark the full dependency complete based on these scripted results. A user may separately assign a bounded UI prototype, but that is not an inferred approval to skip adjudication or the real benchmark.
