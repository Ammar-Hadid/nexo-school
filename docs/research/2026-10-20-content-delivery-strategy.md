# Content preparation and daily delivery

20 October 2026 · Research and delivery recommendation · **Proposed, not approved or implemented**

This note supports the current repository-to-release plan. It does not authorize live AI, new production data, deployment, content certification or real-learner assessment. It preserves the [approved architecture](../architecture/initial-architecture.md), [content acceptance lanes](../product/mvp-scope.md#content-acceptance-and-validation-lanes), [weekly practice contract](../product/weekly-practice.md) and [assessment policy](../product/assessment-policy.md). The user’s latest description of “AI generates everything” conflicts with the explicitly reaffirmed deterministic-first policy; confirm intent before changing that policy.

## Recommendation

**Prepare content ahead of time; assign suitable work daily from approved inventory.** These are different operations. Adam should not wait for an AI call when opening a task or submitting an answer. A daily plan can adapt to his recent evidence without generating every question that morning.

Keep the approved three lanes:

| Content                                             | Preparation                                                                                  | Publication                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Routine numerical practice                          | Seeded deterministic parameters in a bounded, certified template; independent solution check | Policy approval tied to exact template, renderer and validator revisions                  |
| Taal, Spelling and original semantic Redactiesommen | External AI drafts against a reviewed skill specification; mechanical and semantic checks    | Human review of the exact item, key, rationale and versions initially                     |
| Begrijpend Lezen                                    | Generate original passage and its related questions as one versioned bundle                  | Human review of the whole bundle, including anchors, ambiguity, reading demand and rights |

This is the existing approved direction, not a new requirement for manual approval of every arithmetic variation. Redactiesommen stays within Rekenen. An arithmetic solver can verify a story’s calculation without establishing that its language describes that calculation correctly.

## Separate the clocks

1. **Content preparation:** periodically inspect inventory gaps and replenish before they become shortages. Prioritize current categories, likely next categories and due retention needs. Avoid generating a whole curriculum speculatively.
2. **Daily assignment:** once per learner/local date, select eligible published content within the chosen workload and block rules. Make issuance idempotent and recover a missed scheduled run on the next request. Use Europe/Amsterdam calendar rules, not a fixed 24-hour offset.
3. **Between-task adaptation:** evaluate completed evidence and select the next permitted task from that bank. Preserve already issued content and submitted facts; a changed estimate does not rewrite today’s started task.
4. **Immediate interaction:** deterministic validation and durable answer storage; no dependency on content generation. Retry the exact same item after the originals, under the approved two-attempt rule.

These are proposed production responsibilities. The current synthetic policy already adapts between completed tasks and requires exact carryover. Implementation must use the eventual owning domains rather than add rules to shared UI.

## Curriculum source and scope

Current SLO information explicitly states that the new Nederlands and rekenen/wiskunde goals entered into force on **1 August 2026**. Its current overview describes a transition through **August 2031**. These statements were checked against the current pages, rather than inferred from older documents that still call the goals proposed. This is source verification, not an independent legal opinion. [SLO current questions](https://www.slo.nl/thema/meer/actualisatie-kerndoelen-examenprogramma/vragen-kerndoelen/?pager_page=3), [SLO current goals](https://www.slo.nl/kerndoelen/)

Use a versioned, publisher-independent Dutch primary curriculum map with a reviewed groep-5 starting envelope and explicit routes beyond it. This matches the guardian's stated groep-5-plus direction; exact textbook-edition mapping is not a dependency for first use. Do not claim alignment with Adam's actual school's current sequence without evidence. SLO notes schools retain curriculum choices, and describes TULE as illustrative elaboration of the older 2006 goals across pairs of school years. Therefore a TULE list is useful context, not a ready-made validated 2026 assessment blueprint or precise individual learning level. [SLO primary goals and elaborations](https://www.slo.nl/sectoren/po/kerndoelen/)

## Inventory that measures usable work

Start with the architecture’s proposed **3–7 days of eligible work**, then tune from actual review capacity and demand. This is an operating target, not a validated learning schedule or a promise that every category will have enough content.

Count inventory by skill revision, level, category, purpose, family and representation. For reading, count complete eligible passage bundles as well as questions. Subtract reserved/issued content, quarantined versions and items already exposed to the learner where novelty is required. A pending AI result or an awaiting-review item is not available stock.

An operational replenishment calculation can estimate demand during provider plus review lead time, add a safety buffer and subtract eligible unreserved stock. Treat each missing skill/facet cell separately; a large total bank cannot compensate for one absent prerequisite probe. Measure forecast error and do not present this estimate as the child’s learning need.

Keep separate inventories for ordinary practice and independent assessment. A hundred operand changes in one template can provide useful practice, but cannot become a hundred independent assessment families. Published content can be reused across learners; repeated exposure by the same learner is still recorded. Carryover preserves the original question IDs, wording, progress and versions.

If suitable content is unavailable:

- Keep submitted answers and unfinished assignments safe.
- Show the guardian the exact inventory gap and replenishment/review state.
- Offer another already-approved compatible activity only within the agreed plan and selection policy.
- Leave the affected assessment branch waiting. Never substitute familiar/easier/unrelated questions or infer readiness to hide missing evidence.
- Do not silently recycle correctly completed questions as filler. Deliberate review and retention must be labelled and governed separately.

## External API and job execution

The current architecture selects one Anthropic adapter behind an application-owned interface. Retain that boundary; model selection should follow Dutch content evaluations rather than a pricing-only choice.

Anthropic documents asynchronous batch processing with a 50% token discount, a processing window of up to 24 hours, possible expiration, separate per-request outcomes and retained results available for 29 days. It also warns that batch concurrency can exceed a provider workspace spend limit slightly. Therefore a batch submitted the previous evening is **not** a reliable next-morning supply guarantee. Use it for buffer replenishment and evaluation, not the learner’s next question. Persist provider IDs/results promptly and inspect individual outcomes. [Anthropic Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

For this single-learner starting scale, first prove small standard API jobs and review throughput. Add provider batching through the same adapter when measured savings justify the additional lifecycle. Both standard and provider-batch requests still produce candidates awaiting the appropriate publication gate. A standard request can shorten a replenishment wait; it cannot bypass review.

Use the existing PostgreSQL durable-job design and a bounded executor from the same Docker image on the VPS. Start with one local generation job at a time; provider request concurrency also needs its own bound. Scheduled bursts should claim a lease, dispatch or collect bounded work, persist progress and exit. Do not hold a database transaction open during a provider call. Retry only transient failures with a finite budget; reconcile an ambiguous accepted request before reissuing it where possible.

**Hosting amendment, 20 October 2026:** the user selected self-hosted PostgreSQL on the existing VPS. Bounded preparation/collection windows and request-triggered catch-up avoid unnecessary database polling and shared-host contention. No Redis, broker or additional hosted scheduler is justified for this slice. Provider suspension assumptions from the original research no longer govern this plan.

## Cost and validation controls

Reserve application-side worst-case spend before dispatch, with per-job, seed/evaluation and monthly limits. Set output-token/request limits and settle actual usage after completion. Stop new generation at the limit while published work remains usable. Account for retries, rejected candidates and validation calls; an inexpensive generated question can still be an expensive usable question.

Report provider cost per **published usable item or bundle**, independent family coverage, rejection causes, review minutes, oldest awaiting-review age and stock coverage. Estimate with measured token usage and the chosen model’s current rates; this note does not invent a monthly price or approve a budget. Official pricing confirms different model rates and batch discounts. [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)

Structured output helps enforce response shape. Refusals and token truncation still need explicit handling. A schema-valid key, explanation or skill label is not educational validation; that conclusion follows from the distinction between structure and meaning. Keep independent arithmetic checks, exact-hash publication gates and semantic review. [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)

Model/provider evaluations should be task-specific and include edge cases; provider evaluation guidance does not certify Dutch educational content. Preserve the stronger repository requirement for independently reviewed blueprints and held-out validation before consequential advancement. Improving automated semantic validation belongs in shadow evaluation against human-reviewed labels before narrow release policies change. [Anthropic evaluation guidance](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), [assessment validation protocol](assessment-validation/educator-protocol.md)

Send canonical content requirements to the generator, not Adam’s name, raw history or account data. Select the resulting content locally using learner evidence. Personalized explanations based on his actual answer are a **separate data/output problem**: pre-generated reviewed explanations can cover known error patterns, while unrestricted live personalization requires an explicit validation, privacy and fallback design. Choosing the first option for an early slice would be a scoped compromise requiring discussion, not silent removal of the requested personalization.

## Concrete delivery evidence

Before claiming this pipeline operational, demonstrate:

1. One certified arithmetic family produces the agreed bounded inventory with zero provider calls, independent key checks and recorded duplicate/family counts.
2. A bounded real semantic generation job reaches exact-version human review and publication; modifying content invalidates approval.
3. A reading bundle cannot publish with mismatched passage versions or invalid required anchors.
4. Daily assignment pins approved versions, resumes exact unfinished work and survives duplicate scheduler/request execution.
5. Provider outage, refusal, exhausted budget, expired batch and worker interruption cannot publish unchecked content or lose a committed answer.
6. Stock and review metrics show enough usable coverage for the agreed pilot workload. Generation speed alone does not pass.
7. Assessment selection cannot use exposed/practice-only/unreviewed inventory as fresh independent evidence.

These are future implementation acceptance criteria. This research changed no runtime, contacted no paid model API and conducted no educational validation.

## Decisions for the delivery interview

- Confirm retaining deterministic-first generation despite the latest “AI everything” wording.
- Who can review semantic content, and how much time can they realistically provide? Separately name the qualified educational reviewer for assessment validity.
- What first-release category coverage and daily workload must inventory support? All four subject screens do not imply complete curricula.
- What seed/evaluation allowance and recurring AI hard cap are acceptable?
- For the first usable release, are reviewed explanations for known answer patterns acceptable while unconstrained live personalization is separately validated?

The unresolved production assessment gates must stay visible in the overall release plan. Building a reliable content bank and supervised practice can progress independently of calibrating an automatic knowledge engine; changing what the first release promises requires an explicit product decision.
