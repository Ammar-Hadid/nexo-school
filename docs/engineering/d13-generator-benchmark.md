# D13 follow-up: small question-generator screen

22 October 2026. User-authorized implementation and paid execution, within the existing €10/month ledger. Claude Haiku is the user-selected content reviewer. This benchmark produces synthetic drafts; none is independently human-approved, published or assigned to a learner.

## Frozen comparison

Four generators: `gpt-6-luna`, `claude-haiku-5-5`, `gemini-3.8-flash`, and `claude-sonnet-5-5`. The three inexpensive models cover all three connected providers; Sonnet is a stronger comparison point. This is a cost-conscious shortlist, not a claim that untested models are worse. No Mistral, Sol, Opus or Argon generation calls are planned.

Each model receives the same eight briefs: two Taal, two Spelling, two Redactiesommen and two reading tasks. **32 generation calls plus at most 32 separate Haiku reviews**, one attempt per immutable request, no automatic repair or retry. Each output is one exercise; each reading exercise includes its own original 120–160-word passage. No reviewer-validation holdout is consumed.

The briefs deliberately constrain objectives and facts: synonym/antonym, singular verb form/plural spelling, equal groups/change after two purchases, explicit reading fact/cause. Numeric and linguistic targets are fixed for comparability. This measures drafting under specified objectives and facts, not unrestricted curriculum design, broad language coverage or long-document generation. Two items per type cannot estimate reliable error rates or diversity. Ordinary arithmetic remains deterministic; AI only authors the word-problem story around independently checked quantities.

`src/modules/content/review-benchmark/generator.ts` owns briefs, bounded output parsing and mechanical checks. Brief hash: `ac5877136c4185da18352580e322bdae78f3b0840431d998ba3ba1c1ab3242b1`. Candidate hashes and exact provider request hashes are recorded. Changing a frozen brief requires a new version.

## Review and interpretation

Haiku sees the actual question, passage, options, rubric, key, explanation and visible brief, without the generator's identity. A durable parent check binds each review to the exact saved generated candidate. Eight Haiku-authored candidates are also reviewed by Haiku: this same-model limitation is explicitly flagged, and agreement is not independent evidence.

Mechanical checks cover schema/size, option count/uniqueness, key membership, known answer targets and passage word count. Arithmetic is recomputed from the brief, not accepted from a generator's explanation. Exact linguistic/reading target mismatches require examination for valid alternatives; a matched key alone cannot prove that the story, explanation or distractors are correct. Agent inspection of full outputs supplements Haiku. Suitability, originality, age fit and semantic correctness remain AI-assisted/provisional until independent human review.

Report per model and content type: valid drafts, mechanical findings, Haiku clear/flagged/unresolved, input/output usage, generation and review cost, and cost per draft passing both mechanical and Haiku checks. That last denominator is a **provisional screening proxy**, not a count of educationally approved usable questions. Costs of invalid/flagged outputs remain included.

## Spending and execution

Starting October commitment: €3.404263; remaining €6.595737. The same dedicated local PostgreSQL ledger is retained. The experiment stops new claims once its recorded usage reaches €0.75; that is a threshold, not a strict final-cost cap. Its hard reservation/uncertain-charge ceiling is **€4**, also constrained by the shared **€10/month** cap. Expected spend for these short calls is below €1, but exact invoices remain unverified.

The initially stated €1 hard experiment limit was corrected **before paid execution** because the existing full-context reservation for one Sonnet request is about €3.18. Keeping conservative holds avoids pretending that unknown-cost outcomes are free. An uncertain receipt stops all live lanes; no automatic zero-cost reconciliation or retry. Normal usage receipts release unused reservation. Output/thinking is capped at 2,048 tokens, low reasoning, no tools/continuations, 60-second timeout and a 90-second lease. Prices expire on 1 November 2026.

The additive migration `20261023000000_generator_benchmark` admits only this version's generation/review jobs. Runtime request-ID checks restrict generation to the 32-item manifest and review to one exact-parent job each. The old review manifests and provider payloads are preserved; a regression asserts their frozen full-request hash. No deployment, VPS migration, scheduler, publication record or production generator routing is introduced.

## Commands

Use Node 24.22.0 and the existing dedicated local Docker database:

```sh
# Read saved results without paid calls:
npm run content:smoke-live -- generator-report
# Execute/resume the fixed user-authorized run only:
npm run content:smoke-live -- generator-run
# Offline focused tests:
npm test -- src/modules/content/review-benchmark/generator.test.ts src/server/content/live-review-provider.test.ts
```

`.artifacts/d13/generator-report.json` is machine-local, Git-ignored and mode 0600. It includes complete parsed draft/review content, hashes and per-type metrics. Malformed outputs retain a bounded diagnostic prefix (up to 1,000 characters) and known charges. The PostgreSQL ledger remains the durable authority; do not reset or replace its volume. Keys are read only from the existing private file.

Results and executed verification will be recorded after completion.

## Completed results

All 32 generation attempts ran. **31 complete drafts** received a separate Haiku review; Haiku's r01 generation reached the 2,048-token output limit and remains unresolved. No paid review of that incomplete candidate and no retry: **63 calls total**, all with known usage. All 31 review responses parsed: 29 clear, two flagged. Replay returned idle with identical attempts and charges.

**Experiment cost €0.185643**, including generation and all reviews. October commitment is now **€3.589906**, leaving **€6.410094** of the shared €10 allowance. No uncertain-cost holds. These are conservative token/FX/tax amounts; invoices remain unverified.

Manifest hash: `42818523a80c415c94de750eaf3663856954e999e83c108c5e4881998fea6d5b`. Generation-provider payload hash: `c8c0dd81bf911418d88fa99a6a291472914aa8c61a3931b8c8260c1e0f0364a6`. Each review's native request hash is separately recorded because it depends on the immutable generated candidate.

| Generator     | Complete drafts | Generation cost | Haiku review cost |     Total |
| ------------- | --------------: | --------------: | ----------------: | --------: |
| GPT-6 Luna    |             8/8 |       €0.003845 |         €0.018041 | €0.021886 |
| Claude Haiku  |             7/8 |       €0.020602 |         €0.018341 | €0.038943 |
| Gemini Flash  |             8/8 |       €0.021518 |         €0.020399 | €0.041917 |
| Claude Sonnet |             8/8 |       €0.057921 |         €0.024976 | €0.082897 |

### Comparison by content type

The following counts are **drafts with no further issue found during this post-run AI-assisted inspection**, out of two attempts per cell. They are not independent human acceptance or estimated production success rates. All outputs were inspected in full. Frozen automated scores are preserved separately in the JSON report; these counts do not replace them. A dagger indicates one additional draft whose answer-bearing rubric requires a learner-instruction/private-marking contract decision.

| Generator     | Taal | Spelling | Redactiesommen | Reading |
| ------------- | ---: | -------: | -------------: | ------: |
| GPT-6 Luna    |  1/2 |      2/2 |            2/2 |     2/2 |
| Claude Haiku  |  1/2 |      1/2 |            1/2 |     0/2 |
| Gemini Flash  |  1/2 |      2/2 |          1/2 † |     1/2 |
| Claude Sonnet |  0/2 |      2/2 |          1/2 † |     1/2 |

Per-type combined generation/review costs for two attempts:

| Generator     |      Taal |  Spelling | Redactiesommen |   Reading |
| ------------- | --------: | --------: | -------------: | --------: |
| GPT-6 Luna    | €0.003652 | €0.004236 |      €0.004822 | €0.009176 |
| Claude Haiku  | €0.007240 | €0.007832 |      €0.007497 | €0.016374 |
| Gemini Flash  | €0.008166 | €0.007877 |      €0.008534 | €0.017340 |
| Claude Sonnet | €0.017049 | €0.017042 |      €0.014511 | €0.034295 |

Observed differences:

- **Taal:** no model delivered two drafts without an issue in this inspection. Luna changed the second task from asking for the antonym of vol to describing an empty bottle; its answer was reasonable but it did not follow the requested objective/presentation. Sonnet used “De dapper brandweerman” and included stray markup elsewhere. Flash's explanation incorrectly conflated not-full with empty. Haiku's explanation confused a full cup with being underwater and included markup.
- **Spelling:** Luna, Flash and Sonnet provided both requested forms correctly in usable contexts. Haiku omitted the required sentence from its hij/hebben question and placed it in the explanation instead. Its key was correct for the hidden intended sentence, which the mechanical answer check alone could not diagnose.
- **Redactiesommen:** all eight parsed numerical keys and calculations were correct for the prescribed quantities. Luna kept both questions and response instructions free of the answer. Sonnet/Flash's second rubrics disclosed the correct amount; that is a learner-facing exposure risk, but the non-reading brief did not explicitly distinguish private marking guidance. Haiku also left a closing markup tag in its explanation. The actual drafts remain untouched.
- **Reading:** Luna supplied two coherent passages within 120–160 words, with evidence supporting the answers. Its longer causal answer was semantically correct despite missing the frozen exact-answer variants. Sonnet and Haiku exceeded the second passage's length limit; Haiku's first was truncated. Sonnet, Flash and Haiku all placed the causal answer in the second rubric, despite the reading brief explicitly forbidding this. Flash otherwise met both passage lengths.

### What Haiku review did and missed

Haiku remains the user-selected reviewer. It caught Sonnet's adjective error and Haiku's inaccurate cup explanation. Post-run inspection identified corrections/brief violations in **eight additional drafts marked clear**, including missing question context, markup, objective drift, answer disclosure and word-count breaches. Some were independently caught by mechanical checks. These observations are not an adjudicated sensitivity estimate, but they show why a Haiku clear flag must not authorize publication.

[18 separate inspection notes](../../tasks/d13-generator-analysis.json) bind quotes and interpretations to exact candidate hashes. They preserve objectively observable formatting/length/brief violations, provisional language judgments, conditional instruction exposure and two verified answer equivalences as distinct records. All human approvals remain pending. The reviewer did not know generator identities; Haiku-on-Haiku samples still carry same-model limitations.

The generic field name `rubric` was a contract weakness: models sometimes produced private marking guidance where response instructions were intended. A future version should separate `learnerInstructions` from private grading guidance, explicitly prohibit revealing the key in learner-visible fields and add mechanical markup/format checks. Do not silently revise these frozen prompts or outputs or reclassify every conditional case as a definite generator error.

### Practical recommendation

**Luna is the provisional starting candidate for constrained generation**, particularly Spelling, Redactiesommen and these short reading passages: lowest combined cost and no further issue found in both samples for each of those types. Taal needs an explicit objective-compliance gate; none of the four earned an unqualified recommendation from two examples. Flash is a reasonable comparison candidate for future broader reading tests, but this sample supplies no evidence that paying for it or Sonnet improves these constrained tasks. Reviewer-model performance did not predict generator performance.

This recommends a direction; it does not adopt a production generator or validate unrestricted text generation. Keep Haiku as a separate reviewer, deterministic arithmetic/checks and actual human content approval. Before relying on the pipeline, split the instruction/grading contract and check missing context, markup and key exposure independently. No extra paid retesting was launched. The 40 unused reviewer-validation items remain untouched.

## Review and testing artifacts

- [Complete original generated review package](../../tasks/d13-generator-review-package.md): all 32 attempts, full parsed content, mechanical findings, Haiku judgments and separate inspection notes. Human approval is explicitly pending.
- [Machine-readable inspection](../../tasks/d13-generator-analysis.json): original outputs/results were not corrected or overwritten.
- Machine-local `.artifacts/d13/generator-report.json`: all receipt data, per-model/type automated results, token usage, costs and hashes. `generator-report` refreshes it without provider calls.

Node 24.22.0 verification: **178 unit tests / 41 files**, **77 built PostgreSQL/integration tests / 8 files**, twelve-migration fresh install/replay, standalone build, strict typecheck, lint, **12 focused learning-path stories**, **10 built learning-path browser regressions**, scoped/root formatting, local document links and whitespace. The live migration was applied only to the existing dedicated local benchmark database. Replay verified **63 attempts / €0.185643 unchanged**, with no extra inference. Existing pg deprecation warnings remain.

Omitted: full Storybook/E2E/visual/device/Safari/manual-screen-reader suites, provider invoice reconciliation, remote CI/VPS/deployment, real learner data, broad curriculum/novelty/long-text validation and independent educator approval. No scoring, progression, learner UI, publication authority or production model routing changed. Full D13 remains open for its independent adjudication gate; this authorized small generator screen is complete.
