# Repeating weekly practice and session scoring

## 26 October result scale and flexible task length — user amendment

Completed tasks show a weighted result out of 10 in both portals, independently of the number of original questions. Calculate `10 × weighted points / original questions`, show at most one decimal, and retain solved/first-attempt/retry counts separately. Original points remain 1 / 0.5 / 0; retry submissions do not enlarge the denominator. This supersedes the solved-count-only child summary below and any implication that a task must contain ten questions to receive a grade out of ten. Existing variable-length tasks and whole reading bundles remain intact; this request does not change scheduler defaults or regenerate assigned tasks. Scores are not mastery evidence. See [implementation and examples](../design/rekenen-task.md#26-october-2026--d04-m3-result-scale-amendment).


Status: user-directed product requirements, 17 October 2026. **Specified, not implemented.** This refines the planned assignment/session lifecycle without changing the approved technical stack. It guides the guardian weekly-planner and student Today/session reference screens.

## 19 October synthetic prototype implementation

The user accepted occasional retention checks and authorized the [automatic learning-path prototype](../design/automatic-learning-path.md), now **In Review**. It demonstrates two bounded Rekenen stages and two Taal stages, daily Redactiesommen (including weekends), compatible carryover and separate delayed retention/repair. Its four-task cap and short check sizes are explicit demonstration choices, not approved production quantities. Ordinary practice keeps ten questions and reading keeps complete bundles. The earlier research-only and no-implementation statements below remain historical for this synthetic slice; production scheduling, ability calibration and durable history are still not implemented.

## 19 October taxonomy correction

The user clarified that Redactiesommen is a category of Rekenen, not a separate subject. Product subjects are Rekenen, Taal, Spelling and Begrijpend Lezen; category labels must identify assigned tasks. Adam sees only today's assigned blocks, then their tasks, not the entire category catalogue. The previous five-peer wording is superseded without removing any exercise capability, changing quantities or changing the two-attempt policy. [Research/proposed integration](../research/2026-10-19-curriculum-categories-and-daily-practice.md).

The existing same-subject carryover rule now needs a category-aware compatibility decision: unfinished Redactiesommen must not silently consume a later Optellen-only slot merely because both now belong to Rekenen. No new carryover eligibility rule is implemented or inferred here. Existing exact-content/progress preservation and no-extra-workload rules remain.

## 19 October automatic-progression amendment

The user accepted the preceding category/daily-view recommendations and then requested automatic assignment to minimize guardian planning. Every category should be assessed so demonstrated knowledge can be skipped; each subject progresses in category order, with one focused learning category at a time. Redactiesommen remains a category of Rekenen and is explicitly assigned **every day**, alongside the main sequence. This is not limited to school days by implication.

This supersedes the earlier manual-only weekly-template requirement below. Category-compatible carryover remains the accepted direction from the preceding recommendation: preserve exact unfinished work and consume compatible capacity, rather than substitute across arbitrary Rekenen categories. Automatic daily scheduling, calibrated assessment and progression are not implemented. The [research/recommendation](../research/2026-10-19-automatic-progression.md) distinguishes confirmed intent from proposed rules, including workload limits and maintenance review.

The prior guardian-approves-every-difficulty-change rule conflicts with a fully hands-off interpretation. The current request clearly calls for routine automatic assignment and advancement; the proposed resolution is guardian approval of a bounded learning route/budget, with normal advancement inside it and explicit handling of changes outside it. Exact limits are not inferred or implemented. Existing two-attempt scoring, pinned reading bundles, fresh-versus-retry distinction and preserved in-progress state remain unchanged.

## Standing weekly plan — historical manual configuration


The guardian configures subjects, skills and quantities by weekday once. That schedule repeats for future weeks until changed; the guardian does not have to copy or recreate it weekly. Different days can have different combinations and amounts. The repeated object is the plan, not an identical collection of questions.

User-reported practice volumes inform realistic example screens and inventory sizing: Rekenen 80–120 questions, Redactiesommen around 80 problems, Spelling 20–50 items, Taal 20–50 items, and Begrijpend Lezen 2–3 reading tasks. These are variable examples, not simultaneous daily requirements or enforced quotas. One reading task contains a text and its associated questions.

The guardian sees the repeating plan alongside dated weekly progress. Adam sees the scheduled sessions for today. Future plan edits preserve completed work and existing attempt history; an in-progress session retains its pinned content and scoring policy. The UI must distinguish changing the repeating plan from changing a single dated assignment. Effective-date and unfinished-work controls are still reference-screen design details, not implemented behavior.

## Session boundaries

- Non-reading practice in Rekenen (including its Redactiesommen category), Taal and Spelling uses batches of 10 questions. Each batch is an independently startable, resumable session. For example, 80 Redactiesommen becomes eight sessions of 10.
- One Begrijpend Lezen task is one session containing its full text and associated questions. Its question count follows the text's reviewed bundle, not a fixed size of 10.
- Pause/resume retains the exact question versions, responses, retry queue and score. Retry presentations do not become additional assigned questions or additional sessions.
- Quantities that are not multiples of 10 need a visible remainder policy before implementation; do not silently round the guardian's requested amount up.

## Fresh content and targeted review

Select new-to-the-student questions and deliberate review of previously missed questions, weighted toward difficult skills and bounded by the guardian's plan. Do not repeatedly serve correctly completed exact questions as filler. Repeating a skill through a genuinely new question is different from replaying the identical item. Preserve exposure history across sessions and weeks.

Within a session, a retry is deliberately the **same exact question**: same wording, values, answer choices/order and, for reading, the same passage version. A new AI variation is not a retry.

Generation policy, reaffirmed by the user during the 17 October interview: prefer deterministic code or validated templates wherever they can produce suitable, correct questions, including routine arithmetic variants. Use external AI only where it is needed, such as semantic/reading content, through the approved validation/publication process. AI is required in the MVP; it is not required for every question. See [ADR-007](../architecture/decisions.md#adr-007--required-early-ai-generation-with-type-specific-approval). Fresh practice need not trigger an AI call while Adam waits; select from eligible published inventory and replenish within budget. If inventory cannot satisfy freshness and skill constraints, surface the shortage rather than silently recycling correct items or publishing unreviewed content. Concrete generation timing, inventory targets and replenishment budgets remain to be planned.

Unfinished work retains its exact assigned questions and saved progress when carried forward; neither code nor AI regenerates replacements merely because the scheduled day changes. Already completed answers remain recorded and are not requested again as part of resuming that work. This reuse rule applies regardless of how the original questions were generated and is distinct from deliberately assigning fresh equivalent questions after a guardian requests a repeat of a completed session.

## Two chances and final score

The default allowance is two valid answer attempts per original question:

| Outcome                     | Points for that question | Next action                                                               |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| Correct on first attempt    | 1                        | Close the question                                                        |
| Incorrect on first attempt  | Pending                  | Queue the exact question for the retry round after the original questions |
| Correct on second attempt   | 0.5                      | Close the question                                                        |
| Incorrect on second attempt | 0                        | Explain the correct solution and close the question                       |

The first wrong answer does not reveal the correct solution. After the original question sequence, present queued questions in the order they were missed. **18 October amendment:** move directly into these questions, with no retry announcement, readiness question or pause screen. If the final original question is the sole miss, its retry follows directly after its normal feedback/Verder action; this explicitly replaces the previous spacing exception. A second wrong answer never enters the queue again. This replaces the earlier proposed immediate hint/retry behavior.

For example, missing question 4 in a 10-question session means continuing through questions 5–10 before retrying question 4. The session maximum remains 10 points, even though more than 10 answer submissions may occur. Eight first-try successes, one second-try success and one question missed twice produce **8.5/10**. A reading session with N original questions is scored out of N, under the same default policy. Only report a final score once all original questions and required retries are resolved; incomplete sessions remain in progress.

The final screen should separate first-try successes, second-try successes and questions to practise again. Keep this practice score distinct from mastery: original misses remain evidence, and successful retries do not become independent first-attempt mastery credit. Record both genuine submissions; network retries/replayed requests never consume a chance or award points twice.

## Details to resolve in reference screens

- Resolved on 18 October: no separate retry transition, including the final-question-only case. Preserve identical questions and the two-attempt limit.
- Reading explanations can reveal answers to other questions. Preserve the approved answer-leakage/assistance policy when presenting second-attempt explanations; do not report affected later answers as unassisted evidence.
- The default 1/0.5/0 session score is now explicit. Existing multi-step/per-blank evaluator plans must map clearly to one original question and its two chances before those renderers are implemented; do not silently stack another partial-credit formula on top.

## Future acceptance checks

Verify weekly recurrence without manual copying or duplicate dated work; future edits preserve historical sessions; 80 questions produce eight sessions; reading bundles remain intact; new-item selection respects exposure history; deferred retries preserve exact content and order; scoring uses original question count; no third attempt is accepted; resumed/concurrent/replayed submissions preserve one factual outcome. These are specified checks, not test results.

## User-facing terminology and entry — 18 October 2026

The user chose **taak** (singular) and **taken** (plural) for frontend copy instead of sessie/sessies. Internal session terminology and historical product prose still refer to the same practice unit. Adam selects **Bekijk taken** on a block, opening a separate task overview page rather than expanding an inline list. From there he can start a task or resume one already begun; block order and within-block choice are unchanged. Current implementation is a synthetic design preview, not an educational runtime.

## Child-facing results amendment — 18 October 2026

The user requested kind, simple results instead of technical point formulas. Adam sees how many original questions he solved, plus plain-language counts for first-try success, success after another try and questions to practise together. A successful retry counts as one solved question in this summary. Preserve the existing 1/0.5/0 weighted score internally for guardian/progress use; do not relabel the solved-question count as that weighted score. Example: 8 first-try + 1 retry success + 1 missed means **9 of 10 questions solved** for Adam and **8.5/10 weighted points** internally. No mastery or reward rule changes.
