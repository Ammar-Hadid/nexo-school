# Automatic planning and sequential progression

Research date: 19 October 2026. **Evidence and recommendation input, not an implemented learning algorithm or validated assessment.** This note follows the [category and daily-practice research](2026-10-19-curriculum-categories-and-daily-practice.md). Current user intent is automatic assignment, assessment that avoids unnecessary practice, a sequential main category path within each subject, and Redactiesommen every calendar day. The latter is a product requirement, not a research-prescribed dosage.

## Subsequent accepted scope and implementation

The user explicitly accepted occasional retention checks and then authorized building the in-memory automatic learning-path prototype. The retention discussion below records the earlier recommendation stage; it is no longer an unanswered preference. [Revision 1](../design/automatic-learning-path.md) is now implemented **In Review** with synthetic histories, independent bounded routes, daily Redactiesommen and visible demonstration rules. This changes implementation status, not the evidence claims or validation limits in this research.

## Evidence findings

### Assessment should change the next learning action

A 2017 IES/REL review identified 23 sufficiently rigorous elementary-school studies of formative assessment; 19 contributed effect-size calculations. It found positive average achievement effects, with stronger average effects in mathematics than reading/writing. The underlying process gathers evidence and uses it to change instruction, rather than merely showing a score. Educator- and computer-directed approaches are included. The review covers studies published in 1988–2014, mostly grades 1–6 and English-speaking contexts. It does not validate nexo's proposed planner, a Dutch curriculum sequence, a particular skip rule or an autonomous replacement for teaching. [Klute et al., _Formative assessment and elementary school student academic achievement_, summary, pp. 2–3 and limitations pp. 10–11](https://ies.ed.gov/sites/default/files/migrated/rel/regions/central/pdf/REL_2017259.pdf).

**Implication:** a bounded loop of assess → identify uncovered objectives → teach/practise those objectives → check again is better grounded than assigning a fixed quantity to every category regardless of prior knowledge. This is an inference from the review, not an experimentally established nexo algorithm.

### A category needs representative coverage, not just a passing percentage

APA's assessment guidance says assessments should align with taught content, include enough varied questions to assess mastery, and be interpreted for their intended purpose. It explicitly calls attention to the criteria used for pass/fail cut-points. [APA, _Pre-K to 12 Teaching Principle: Assessment_, principles 19–20](https://www.apa.org/ed/schools/teaching-learning/top-twenty/assessment).

**Implication:** define the objectives and target difficulty of a category before designing its entry check. Correct answers to easy addition do not establish addition across every number range, representation or carrying case. A short check can justify provisional placement and reduced practice, but cannot establish permanent category-wide mastery. Unknown/unassessed must remain distinct from weak. The number of questions needed depends on coverage, item quality and the decision being made; none of these sources supplies a universal “three correct”, “80%” or “90%” rule. A fast-track decision should therefore be distinguishable from a later, better-supported retention judgement. Any numerical policy needs explicit review and evaluation against real item behaviour before being treated as trustworthy.

### Sequential teaching and later review serve different purposes

The 2021 IES elementary mathematics intervention guide gives strong evidence to systematic instruction: incremental, intentional development toward learning outcomes. It also recommends reviewing previously learned content and connecting it to new content. Its word-problem recommendation stresses deliberate instruction and understanding problem structures. This guide concerns elementary intervention, especially students struggling with mathematics; it is useful design evidence, not a diagnosis of Adam or a universally prescribed schedule. [Fuchs et al., _Assisting Students Struggling with Mathematics: Intervention in the Elementary Grades_, recommendations 1 and 5](https://ies.ed.gov/ncee/WWC/Docs/PracticeGuide/WWC2021006-Math-PG.pdf).

**Implication:** one active category per subject can provide the clear forward path the user wants, with objectives arranged by prerequisites. Daily word problems can apply operations already available to Adam, becoming more complex as his main Rekenen path progresses. A planner must supply suitable instruction/support for gaps rather than automatically generating more tests indefinitely. This source does not establish that daily word problems, a particular task length or one ordering of the user's categories is optimal.

### Delayed retrieval helps test what remains available later

IES's 2007 learning guide rates spacing learning over time as moderate evidence and using quizzes to re-expose learners to key content as strong evidence. Its separate recommendation to use tests to allocate study has minimal evidence. Its recommendation labelled “interleave” concerns alternating worked examples and problem solving; it must not be misreported as a recommendation to alternate entire subject categories. [Pashler et al., _Organizing Instruction and Study to Improve Student Learning_, recommendations 1, 2, 5b and 6b](https://ies.ed.gov/ncee/wwc/PracticeGuide/1).

**Implication:** moving forward need not imply “never encounter this skill again”. Brief delayed checks could distinguish initial success from retention. Their exact intervals and workload are product-policy decisions, not established by this guide for Adam. Because the user explicitly rejects category hopping, any maintenance activity involving a previous category must be proposed openly, not silently inserted into the main path.

### Interleaving evidence does not require random category hopping

Rohrer, Dedrick and Stershic's original classroom experiment used 126 US seventh-grade students, rearranging the same practice problems over three months. Interleaved practice produced better delayed test performance than blocked practice. Students had to choose the relevant problem-solving strategy rather than infer it from a block of identical problem types. [Rohrer et al., _Interleaved Practice Improves Mathematics Learning_ (2015), full article](https://files.eric.ed.gov/fulltext/ED557355.pdf).

**Implication:** occasionally checking whether a learner can select an appropriate operation is educationally different from checking execution of a named operation. This supports considering varied, already-taught problem structures within the requested daily Redactiesommen work. It does not directly establish the best schedule for a Dutch groep-5 child, language or spelling categories, nor justify overriding the requested sequential main path. Cross-category maintenance remains a recommendation to accept or decline.

## Evidence interpretation boundaries

The existing architecture already records several appropriate distinctions; they are intended policy, not implemented learning evidence: [architecture, section 8](../architecture/initial-architecture.md#8-learning-evidence-mastery-and-adaptive-selection).

- First unassisted responses and success after feedback/retry answer different questions. Preserve the approved two attempts, identical deferred retries and 1/0.5/0 task score, while keeping those task points separate from any advancement decision. A correct retry on the same question is useful learning history, not another independent demonstration of mastery.
- Correctness after a reveal, help or prior exposure must retain that context. Do not silently turn supported success into unassisted evidence.
- Multiple questions on one reading passage share context. Preserve the whole passage/question bundle and the architecture's per-skill/passage aggregation rather than treating ten responses from one text as ten independent texts. A result should not generalize beyond the objectives, difficulty and passage diversity actually sampled.
- An absence of recent evidence is uncertainty or a review need, not proof that a child has lost ability. One new error should not erase an entire completed category or silently restart it.
- Existing architecture thresholds and the 60/30/10 selector are explicitly provisional heuristics. The new preference for a sequential main path requires reconciliation before implementation; those numbers are not research-validated defaults.

No reviewed source establishes a validated, universal category-skipping test for nexo's catalogue. A calibrated adaptive test or latent mastery probability would require suitable item data and validation beyond this research. An understandable, versioned rule system with visible evidence limitations is a reasonable initial engineering proposal; it should not claim a precise probability that Adam “knows” a category.

## Repository inspection and changed authority

The current implementation still has six static task definitions (`src/modules/practice/journey/practice-journey-tasks.ts`), synthetic question/outcome/attempt state (`exercise/exercise-preview.ts`) and a read-only result projection (`guardian-results/guardian-result-model.ts`). It has no dated scheduler, objective-level diagnostic blueprint, curriculum progression or validated ability estimator. `prisma/schema.prisma` still contains only the foundation datasource/generator. Passing prior preview tests does not establish any of these new capabilities.

The user now expressly requests:

- Automatic assignment so the guardian need not choose daily categories or questions.
- Assessment for every category, allowing demonstrated material to be skipped.
- Sequential category progression within each subject; no arbitrary rotation among unrelated new categories.
- Redactiesommen every day, as a parallel category within Rekenen.
- The already-confirmed student entry remains today's assigned blocks.

This supersedes Q10 of the guardian interview (manual-only planning) and the previous research's guardian-selects-each-target workflow. It also conflicts with using the architecture's provisional 60/30/10 focus/review/exploration selector as the default. Routine automatic advancement is now requested; do not keep asking the guardian to approve every normal next category. The proposed boundary is approval of a route/workload envelope once, with the guardian retaining pause/override controls and explicit handling of changes outside that envelope. This boundary is a recommendation; the previous requirement for approval of every difficulty change is not silently extended into unrestricted difficulty automation.

The preceding category placement and compatible-carryover recommendations were accepted in the user's “Okay, I agree” response. Do not repeat those questions. The current discussion concerns automatic selection and progression, not deleting the category model or declaring a complete curriculum approved.

## Recommendation: one focused route per subject, plus daily application

### Define a finishable route at the current level

Keep the requested category order, but define a bounded objective set and target level for each category in a reviewed route version. Getalbegrip spans several school years; completing it means satisfying its current route objectives, not finishing every possible number concept before learning addition. A next-level route can revisit the same category at a greater range or complexity, with explicit new goals and retained prior evidence.

For Rekenen, the visible main path can begin **Getalbegrip → Optellen → Aftrekken → Vermenigvuldigen → Delen → …**, using the supplied order. Redactiesommen is scheduled alongside that path from day one instead of being deferred to category 12. Taal, Spelling and reading likewise keep their own single active focus category; they need not reach category 3 on the same day. A list position is not an educational prerequisite by itself: review each bounded category's objectives for dependency conflicts before publishing the route, rather than silently reordering categories at runtime.

SLO describes a learning line as a reasoned sequence toward goals, including progression in knowledge, skill, difficulty and representation. This supports a separate reviewed route over the catalogue, not treating the catalogue's category names as a complete validated teaching sequence. [SLO, Leerlijnen](https://www.slo.nl/thema/vakspecifieke-thema/rekenen-wiskunde/leerlijnen/).

Reading remains whole-passage practice with one explicit primary focus category and per-question objectives. Other language processes still support reading; they do not imply an independently assessed mastery claim or a new active category. Keep passage length and question count appropriate to the reviewed bundle. For spelling, define observable pattern-level goals inside the broad category before making placement decisions.

### Assess just before a category is needed

All categories have an ability/evidence record, initially **not assessed**, rather than a fictitious low score. Assess categories in the route's order as Adam reaches them, so the initial experience is not an exhausting test of the entire catalogue. Strong evidence can allow quick passage through several already-known categories over short checks; the first real gap becomes the main practice target.

Proposed decision loop:

1. **Read eligible existing evidence.** If it already covers this category's current objectives and remains suitable for the placement decision, avoid asking the same assessment again.
2. **Entry check.** Sample the essential subskills, representations and target level with fresh reviewed items. Use the answers to select a further short check only where evidence is uncertain. Begin near the configured starting route, not automatically with groep-1 material.
3. **Enough evidence to fast-track:** skip the unassigned teaching/drill sequence for that scoped category and assess the next category. Record “demonstrated in entry check”, not permanent complete mastery of the whole subject.
4. **Specific gaps:** teach/practise those objectives, leaving already-demonstrated objectives satisfied for this route. A high overall score must not hide a missing essential subskill.
5. **Fresh confirmation:** after instruction, check uncovered objectives with new independent items. When the route gate is satisfied, continue forward automatically.
6. **Ambiguous or repeated difficulty:** provide a reviewed worked example/support or a targeted prerequisite repair; bound repeated attempts and the day's work. Show the guardian the actual evidence if automatic support is insufficient. Do not infer disengagement or keep increasing question volume until Adam passes.

Example: the current Getalbegrip objectives are covered by an entry check, so its drill sequence is skipped. In Optellen, ordinary addition is demonstrated but crossing a hundred boundary is not. Practice targets that gap; successful new checks allow Aftrekken next. These are illustrative outcomes, not measurements of Adam.

Progression eligibility and durable retention are separate decisions. A learner should not be forced to complete a large practice quota merely to accumulate a nominal mastery sample after demonstrating prior knowledge. Conversely, an efficient fast-track is a revisable placement decision; stronger long-term claims require later varied evidence. The original architecture's 8 observations / 3 families / 3 dates / 85% figures were provisional, not validated thresholds; do not reuse them as mandatory entry-test length or unquestioned promotion rules.

No universal pass percentage or number of assessment questions is selected in this research. Each reviewed assessment blueprint needs essential-objective coverage, item-family diversity, assistance rules, sufficient evidence, an uncertainty path and an effort cap. Numerical settings must be explicit, versioned and evaluated for false skips and unnecessary repetition. A calibrated IRT/BKT model would require item/response data the project does not have; begin with inspectable rules and honest evidence labels, not invented mastery probabilities.

### Preserve practice feedback while separating evidence

The existing practice contract remains two attempts with identical deferred retries, explanation after a second miss, child solved-question counts and separate weighted scores. A retry success never becomes a new independent first-attempt observation for fast-track eligibility. An answer after explanation/help retains that assistance status. Question familiarity and template-family repetition also matter.

Short diagnostic sets are a **proposed separate contract**, not a silent change to ordinary ten-question tasks. To retain predictable resume/retry behavior, adapt between bounded sets rather than replacing questions within an already assigned set. Pin each set's original questions/order and complete its required feedback/retries. Only novel unassisted evidence feeds entry/advancement decisions. Feedback that can reveal another reading answer must be handled through the existing reveal-dependency/assistance policy before production use.

### Redactiesommen every day

Reserve a daily Redactiesommen slot, including weekends under the user's literal every-day request. It remains within Rekenen in the catalogue and reports. The frequency does not imply a fixed daily count or extra work on top of an agreed budget; daily quantity must fit the workload setting. The existing ordinary task contract uses ten questions, so any smaller task would need an explicit task-size amendment rather than an invented silent exception.

Use only mathematical prerequisites Adam has demonstrated or is currently learning, plus appropriately reviewed reading demands. Early work can use simple quantity/comparison contexts where suitable; later work includes operations, money, time or measurement when those skills become available. Do not assign division-with-remainder or multi-step money problems merely because they exist in the bank. Distinguish learning the problem structure from executing the arithmetic. When later mixed word problems are eligible, record only the skills actually observed and avoid counting one answer twice in overlapping categories.

Passing an entry check for a word-problem subskill removes unnecessary beginner drills; it does not remove the user's daily application requirement. Vary eligible contexts and targeted demands without silently raising difficulty beyond the reviewed route. If the eligible published bank cannot provide suitable work, surface the shortage rather than fill it with unreviewed content or unrelated categories.

### Preserve forward focus without promising never to revisit

My recommendation is a small, explicitly labelled retention component after moving on. It does not replace the main active category or reset it after one error. For mathematics, some review can naturally occur in the already-requested daily Redactiesommen. For taal/spelling/reading, occasional short checks on earlier objectives could help distinguish retained skill from short-lived performance.

This is **optional proposed behavior requiring agreement** because the user rejected category hopping. No automatic 30% review quota, arbitrary mixing of new categories or future-category exploration should be smuggled into the planner. If the user chooses strictly no earlier-category review, retain the sequential path and label long-term retention as unverified where evidence is absent. Even with review, an error triggers a limited check/targeted repair, not wholesale loss of completed categories.

## A low-maintenance daily planner

The guardian chooses a small set of boundaries once: starting learning route/level, a daily workload limit and the block/subject cadence. Offer a reviewed suggested setup so this does not become manual curriculum configuration. Exact minutes/counts, number of blocks and cadence for the subjects other than Redactiesommen are not specified by this research; previous high-volume examples are not default quotas. Daily Redactiesommen is fixed by the current instruction.

Within that envelope, the planner automatically:

1. Resolves the date in Europe/Amsterdam and available block capacity.
2. Reserves the daily Redactiesommen allocation; eligible unfinished Redactiesommen can fulfil that slot without duplicating it or resetting answers.
3. Resumes compatible unfinished work in the appropriate slots, consuming capacity rather than increasing it.
4. Selects each scheduled subject's current route category and next required action: entry check, targeted instruction/practice or confirmation.
5. Includes optional maintenance only if that policy is accepted and inside the same workload limit.
6. Issues reviewed eligible content and records the assignment's reasons, policy and versions.

Assessments and required retries consume effort; a nominal original-question count is not a promise of exact completion time. Pause/resume must remain available when the time budget is reached. Do not turn the budget into a target that generates more drills after objectives are satisfied. Partial batches, reading bundles and timing/carryover conflicts need explicit handling in the future planner contract, consistent with the existing task-size rules.

Do not preassign a week's worth of category drills before assessing what Adam knows. Plan capacity ahead; materialize the next suitable task at a decision boundary. Already assigned/in-progress questions, original order, retries and submissions remain frozen. Recompute only unassigned future work after new evidence or plan edits. Reopening the day or replaying an answer must not create duplicate tasks or advance the route twice.

Adam still sees only **Vandaag → ordered blocks → category-labelled tasks**. He can choose task order within the current block as already agreed; tasks with unmet prerequisites are not issued prematurely. The guardian gets a concise explanation such as “Optellen: oefenen met oversteken naar het volgende honderdtal” and a route overview, without approving every ordinary assignment.

## Minimal technical shape and boundaries

Use the existing TypeScript modular monolith. Keep three separate pure decisions with recorded inputs and versions:

- **Evidence assessment:** which scoped objectives have demonstrated knowledge, need practice or have insufficient evidence? Retain coverage, assistance and source attempts.
- **Route progression:** what is the single active category/next step for each subject? Keep Redactiesommen's daily application track explicit.
- **Daily assignment:** which eligible next actions fit today's blocks, capacity, prerequisites and available reviewed content?

These can initially live in the practice module with typed local fixtures; no new service or production schema is required to review the behavior. Later production integration uses the existing planned curriculum/content/assignment entities and server-side authority. LLMs need not decide a child's level or schedule: deterministic, inspectable policies select reviewed content. The separately required MVP semantic AI-generation workflow remains, with its validation/publication boundary; no live generation is introduced by this recommendation.

Every catalogue category can have a route/status entry, but the system cannot honestly auto-assess every category today. Open writing, oral language, audio dictation and some visual mathematics need appropriate tasks and evaluation methods; current numeric/finite-text/choice specimens are insufficient. Unknown or unsupported must never appear as mastered, and the planner must not silently skip unavailable teaching as though Adam passed it. Publish only route stages with appropriate assessment/instruction coverage; show the affected route's gap while other supported subjects can continue.

## Recommended next bounded milestone

Build an **in-memory automatic progression simulator** on the approved connected student and guardian compositions, after authorization. It should demonstrate a small reviewed synthetic route with at least two consecutive Rekenen categories plus daily Redactiesommen, and a second subject advancing independently. Represent the remaining catalogue as coverage metadata rather than claim complete educational implementation.

Show three deterministic illustrative learner histories: already knows the entry material, has one specific gap, and has insufficient evidence. Provide a preview-date control for several consecutive days, including a weekend, so assignment, preserved unfinished state and the daily word-problem rule are reviewable. Guardian views expose why each task was chosen and what evidence permits progression. No scenario should imply an assessment of real Adam.

Acceptance checks should prove:

- Known material skips its unassigned drill sequence; essential gaps cannot be hidden by category averages.
- Only one main category per subject is active; subjects advance independently in their configured order.
- Redactiesommen appears every preview day with eligible prerequisite skills and stays within configured capacity.
- Retry success, help, repeated item families and one reading passage do not inflate independent mastery evidence.
- Uncertainty requests bounded further evidence/support; unsupported content never becomes a pass.
- Resume, dates, idempotency, workload caps and category-compatible carryover preserve exact assigned work.
- New data/labels reuse approved layouts; keyboard, responsive and accessibility checks cover the connected path.

This simulator validates behavior and reviewability, not assessment accuracy. Before real ability-based skipping, the route/assessment blueprints need educational review and a consented bounded evaluation comparing advancement decisions against independent new-item checks. Track false fast-tracks, unnecessary repetition, objective coverage, delayed retention and learner workload; thresholds must be revisable without rewriting history.

## Status and checks

Research and governance documentation only. AGENTS, the weekly-practice requirements, the historical guardian interview, ADR-006 and task records now distinguish the new automatic direction from superseded manual-only guidance. No application/test code, dependencies, schema, learner data, live AI calls or deployment changed. Existing visual approvals remain revision-specific; the guardian result composition remains In Review.

Documentation formatting, local links and whitespace are checked at handoff. No unit, Storybook, browser or production-build suite was rerun for this documentation-only work. Existing preview test results are not evidence that the proposed scheduler or assessment model is implemented or accurate.
