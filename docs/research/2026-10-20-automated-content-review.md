# Automated content review and operating cost

20 October 2026. Research and proposed design; no provider calls, spending or publication-policy changes. Requested during the private-release planning interview.

## Recommendation

Build an automated **review assistant** before scaling semantic generation. Combine deterministic checks, a separate model review and Ammar's publication decision. Show every exercise in its actual student presentation, with the answer/explanation and specific concerns alongside it. Do not replace exercises with a summary. Support inline correction, keyboard navigation and explicit batch approval of selected versions.

This is a promising way to reduce review effort, not evidence that 15–30 minutes will cover any content volume. The initial human-publication policy stays in force. Automating publication later requires a separately evaluated, narrowly scoped policy.

Anthropic distinguishes code, model and human graders and recommends calibrating model judgments against expert judgments. Its evaluation guidance recommends explicit rubrics and human agreement checks. These support the hybrid approach; neither source validates Dutch primary-school content or this proposed implementation. [Evaluation engineering](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [evaluation guidance](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests).

## Proposed pipeline

1. **Generate from a versioned specification.** Objective, permitted number range, response format, vocabulary constraints, intended solution and approved source boundaries are explicit. No learner identity is needed for content preparation.
2. **Verify what code can prove.** Schema, arithmetic, units, permitted values, accepted-answer consistency, duplicate identity, missing references, answer leakage and bundle integrity. Certified arithmetic families need family review and regression checks, not a model call per variation.
3. **Solve independently before seeing the proposed key.** A separate reviewer request receives the question/passage and rubric. Compare its proposed answer with the generator's key. This reduces answer anchoring; a separate call is not independent educational expertise and can repeat the same model's mistakes.
4. **Review semantics.** Check ambiguity, alternative valid answers, sufficient information, explanation correctness, age-appropriate Dutch and objective alignment. Reading review includes the entire passage and related questions, including disclosures between them.
5. **Triage visibly.** `blocking issue`, `needs attention`, or `no issue found`, with exact supporting spans and suggested edits. Never label the last state “guaranteed correct.” Timeouts, refusals and invalid responses stay unresolved.
6. **Human publication.** Ammar skims the complete batch, inspects flags and edits/rejects/approves. Publication pins exact content, solver, rubric and review versions. A correction creates a new candidate and reruns affected checks; the AI cannot edit an approved item in place.

Use one provider adapter initially. Evaluate a modest reviewer against a stronger reviewer on the same concealed reference set; choose based on missed defects and useful flags, not model reputation or price alone. No need to add an agent framework, vector database or permanent review service.

## Proof before relying on it

Prepare a human-adjudicated Dutch test set with correct items and realistic seeded defects: incorrect key, two correct options, misleading wording, wrong unit, unsuitable vocabulary, missing passage evidence, explanation leakage and subtly incorrect grammar. Keep an unseen test split.

Measure critical missed defects, false alarms, disagreement resolution, usable items per batch, correction minutes, review minutes and dollars per published item. Include unflagged items in human inspection: reviewing only flags cannot measure missed errors. A model's self-reported confidence is not calibrated reliability.

The first benchmark establishes a recommendation for review assistance. It does not certify assessment rubrics, authorize autonomous mastery decisions, or replace the independent educational-review gate.

## Price basis and reproducible estimates

Prices retrieved on 20 October 2026 from the official live price table. USD, excluding tax. The table listed Sonnet 4.6 at $3/$15 per million input/output tokens and Haiku 4.5 at $1/$5; asynchronous batch rates were half those rates. These are comparison anchors, not a commitment to a model or a claim that they are the newest available models. Recheck availability and pricing before implementation. [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing).

Assumed total tokens **across the review stages for one content unit**, including prompts, rubric and result:

| Content unit                | Input | Output | Sonnet 4.6 batch review | Haiku 4.5 batch review |
| --------------------------- | ----: | -----: | ----------------------: | ---------------------: |
| One short semantic exercise | 3,000 |    500 |                $0.00825 |               $0.00275 |
| One complete reading bundle | 8,000 |  1,500 |                $0.02325 |               $0.00775 |

These token allowances are planning assumptions, not measured traces. If independent solving and semantic review together consume twice the allowance, the cost doubles. Dutch text length, reasoning tokens, rubric size and corrections affect usage.

Formula: `(input tokens × input rate + output tokens × output rate) / 1,000,000`.

| Illustrative monthly new content           | Sonnet batch review only | Standard synchronous review |
| ------------------------------------------ | -----------------------: | --------------------------: |
| 1,000 short exercises + 30 reading bundles |                    $8.95 |                      $17.90 |
| 2,000 short exercises + 40 reading bundles |                   $17.43 |                      $34.86 |
| 3,000 short exercises + 60 reading bundles |                   $26.15 |                      $52.29 |

These quantities are examples, not Adam's selected workload. Deterministic arithmetic variations are excluded; reading questions are counted inside their bundle, not charged again as short exercises.

For a transparent **generation plus review** illustration, assume generation itself consumes 2,000 input/700 output tokens per short exercise and 5,000 input/3,000 output per reading bundle, at the same Sonnet batch rates:

| Same monthly workload | Generation + review | With illustrative 20% retry/correction allowance |
| --------------------- | ------------------: | -----------------------------------------------: |
| 1,000 + 30            |              $18.10 |                                           $21.72 |
| 2,000 + 40            |              $35.13 |                                           $42.16 |
| 3,000 + 60            |              $52.70 |                                           $63.23 |

The allowance is not a hard upper bound. These figures exclude live explanations, writing/speech evaluation, audio generation/transcription, images, initial stock, educational review labor, database/backups, tax and exchange-rate differences. Cache savings are deliberately not assumed. The actual configured monthly limit must cover all AI operations and reserve outstanding request costs.

Batch jobs may take up to 24 hours; use reserve replenishment, not a request made as Adam starts a question. Standard jobs are simpler to start with and cost roughly twice this batch-only token illustration. Failed/expired results need explicit handling. [Batch lifecycle](https://platform.claude.com/docs/en/build-with-claude/batch-processing).

## Fitting 15–30 minutes per week

### Applying the subsequently confirmed €10/month ceiling

The user subsequently set **€10/month maximum, preferably less**, for the whole AI workload. The Sonnet-only examples above are therefore a comparison baseline, not the recommended operating configuration.

The same official table currently also lists Haiku 5.5 at $0.10/$0.50 per million input/output tokens below its 100,000-token prompt boundary, with batch at $0.05/$0.25. Availability, Dutch content quality and total token usage must be benchmarked before selecting it; price is not educational evidence. [Current model pricing](https://platform.claude.com/docs/en/about-claude/pricing).

At the **same assumed token counts** and including the same 20% correction allowance:

| Monthly short exercises + bundles | Generation + review using Haiku 4.5 batch | Using Haiku 5.5 batch | Haiku 5.5 plus an additional Sonnet 4.6 pass on 10% of the same workload |
| --------------------------------- | ----------------------------------------: | --------------------: | -----------------------------------------------------------------------: |
| 1,000 + 30                        |                                     $7.24 |                 $0.72 |                                                                    $2.90 |
| 2,000 + 40                        |                                    $14.05 |                 $1.41 |                                                                    $5.62 |
| 3,000 + 60                        |                                    $21.08 |                 $2.11 |                                                                    $8.43 |

These are calculated scenarios, not promised bills or recommended escalation percentages. Tokenizers and output lengths can differ; the final column assumes the escalated work has the same average size and adds a complete stronger-model generation/review pass. Routine strong-model generation would cost more. Audio, live feedback and tax remain excluded.

**Recommendation under this budget:** benchmark the lowest-cost eligible model for narrow generation and review, use deterministic generation broadly, and reserve a small explicit allowance for stronger review and live explanations. Prefer a tested inexpensive model over an untested newer one. If quality is inadequate, retain the human gate and report the volume/cost conflict instead of claiming €10 covers it. Do not force unreliable automated grading to save cents.

Track reservations and billed usage across all AI features in one ledger. Enforce a euro-denominated ceiling with an explicit currency/tax convention and exchange-rate margin; provider USD totals alone do not enforce €10. Stop new paid work before the cap, including retry reservations, while prepared assignments remain usable. Initial seed/benchmark spending needs separate approval or must fit inside the same cap; it is not implicitly unlimited.

### Review-time capacity

Separate initial catalogue seeding from steady-state weekly operations. The full launch catalogue needs upfront content/rubric work that cannot honestly be included in a permanent 15-minute weekly promise.

Use certified deterministic families wherever appropriate, prepare semantic stock in advance, and group review by objective. Show all exercises; prioritize flagged concerns without hiding unflagged items. Reading bundles remain together. Reserve some review time for corrections and shortages.

An illustrative 250 new semantic questions in one week gives only 3.6–7.2 seconds per question within 15–30 minutes, before any passages or corrections. That is a capacity warning, not a recommended review speed. Measure real throughput in the first batch. If it does not fit, improve constrained generation/review tooling, obtain reviewer help or agree a narrower independently validated publication rule. Do not silently approve unseen content, repeat solved questions against the learning policy or remove requested subjects.

## Next bounded implementation task

After roadmap approval, build a review-assistant evaluation with synthetic content and a capped, separately approved real-provider benchmark. Deliver the full-content review screen, defect-detection report, actual usage receipts and timed human trial before selecting model/cost settings. Keep the current publication gate until an explicit replacement is approved.
