# Repeating weekly practice and session scoring

Status: user-directed product requirements, 17 October 2026. **Specified, not implemented.** This refines the planned assignment/session lifecycle without changing the approved technical stack. It guides the guardian weekly-planner and student Today/session reference screens.

## Standing weekly plan

The guardian configures subjects, skills and quantities by weekday once. That schedule repeats for future weeks until changed; the guardian does not have to copy or recreate it weekly. Different days can have different combinations and amounts. The repeated object is the plan, not an identical collection of questions.

User-reported practice volumes inform realistic example screens and inventory sizing: Rekenen 80–120 questions, Redactiesommen around 80 problems, Spelling 20–50 items, Taal 20–50 items, and Begrijpend Lezen 2–3 reading tasks. These are variable examples, not simultaneous daily requirements or enforced quotas. One reading task contains a text and its associated questions.

The guardian sees the repeating plan alongside dated weekly progress. Adam sees the scheduled sessions for today. Future plan edits preserve completed work and existing attempt history; an in-progress session retains its pinned content and scoring policy. The UI must distinguish changing the repeating plan from changing a single dated assignment. Effective-date and unfinished-work controls are still reference-screen design details, not implemented behavior.

## Session boundaries

- Rekenen, Redactiesommen, Taal and Spelling are separate subjects, each divided into batches of 10 questions. Each batch is an independently startable, resumable session. For example, 80 Redactiesommen becomes eight sessions of 10.
- One Begrijpend Lezen task is one session containing its full text and associated questions. Its question count follows the text's reviewed bundle, not a fixed size of 10.
- Pause/resume retains the exact question versions, responses, retry queue and score. Retry presentations do not become additional assigned questions or additional sessions.
- Quantities that are not multiples of 10 need a visible remainder policy before implementation; do not silently round the guardian's requested amount up.

## Fresh content and targeted review

Select new-to-the-student questions and deliberate review of previously missed questions, weighted toward difficult skills and bounded by the guardian's plan. Do not repeatedly serve correctly completed exact questions as filler. Repeating a skill through a genuinely new question is different from replaying the identical item. Preserve exposure history across sessions and weeks.

Within a session, a retry is deliberately the **same exact question**: same wording, values, answer choices/order and, for reading, the same passage version. A new AI variation is not a retry.

Keep the existing generation policy: deterministic routine arithmetic variants, and externally generated semantic/reading content through the approved validation/publication process. Fresh practice need not trigger an AI call while Adam waits; select from eligible published inventory and replenish within budget. If inventory cannot satisfy freshness and skill constraints, surface the shortage rather than silently recycling correct items or publishing unreviewed content.

## Two chances and final score

The default allowance is two valid answer attempts per original question:

| Outcome                     | Points for that question | Next action                                                               |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| Correct on first attempt    | 1                        | Close the question                                                        |
| Incorrect on first attempt  | Pending                  | Queue the exact question for the retry round after the original questions |
| Correct on second attempt   | 0.5                      | Close the question                                                        |
| Incorrect on second attempt | 0                        | Explain the correct solution and close the question                       |

The first wrong answer does not immediately reveal the correct solution or trigger a consecutive retry. After the original question sequence, present queued questions in the order they were missed. A second wrong answer never enters the queue again. This replaces the earlier proposed immediate hint/retry behavior.

For example, missing question 4 in a 10-question session means continuing through questions 5–10 before retrying question 4. The session maximum remains 10 points, even though more than 10 answer submissions may occur. Eight first-try successes, one second-try success and one question missed twice produce **8.5/10**. A reading session with N original questions is scored out of N, under the same default policy. Only report a final score once all original questions and required retries are resolved; incomplete sessions remain in progress.

The final screen should separate first-try successes, second-try successes and questions to practise again. Keep this practice score distinct from mastery: original misses remain evidence, and successful retries do not become independent first-attempt mastery credit. Record both genuine submissions; network retries/replayed requests never consume a chance or award points twice.

## Details to resolve in reference screens

- If the final original question is the only miss, an immediate next-question retry would contradict the requested spacing. Show a deliberate transition/pause before that retry; the exact interaction/delay is still to be agreed.
- Reading explanations can reveal answers to other questions. Preserve the approved answer-leakage/assistance policy when presenting second-attempt explanations; do not report affected later answers as unassisted evidence.
- The default 1/0.5/0 session score is now explicit. Existing multi-step/per-blank evaluator plans must map clearly to one original question and its two chances before those renderers are implemented; do not silently stack another partial-credit formula on top.

## Future acceptance checks

Verify weekly recurrence without manual copying or duplicate dated work; future edits preserve historical sessions; 80 questions produce eight sessions; reading bundles remain intact; new-item selection respects exposure history; deferred retries preserve exact content and order; scoring uses original question count; no third attempt is accepted; resumed/concurrent/replayed submissions preserve one factual outcome. These are specified checks, not test results.
