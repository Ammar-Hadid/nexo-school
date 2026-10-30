# Guardian journey research

Date: 17 October 2026. Status: **desk research and design recommendations, not user-validated behavior or implemented functionality**. Read with [weekly practice requirements](../product/weekly-practice.md) and [MVP scope](../product/mvp-scope.md).

## Question and method

How can a guardian set a varied recurring week once, trust that practice continues automatically, and understand when Adam needs support without managing hundreds of individual questions?

Reviewed seven primary sources: official product documentation from Khan Academy, IXL and Google, plus original usability guidance from Nielsen Norman Group. These establish existing interaction patterns and explain useful principles; they do not establish that this exact journey is optimal for this family. The user's quantities, two-attempt scoring, independent sessions and ongoing recurrence are requirements, not conclusions from competitor research.

Repository inspection confirms a foundation route and visual specimens, not a working guardian portal. Existing foundation browser tests cover rendering/accessibility wiring, not the proposed journey. This research adds no runtime implementation or test evidence.

## Evidence and implications

### 1. Make important choices recognizable

**Source:** [NN/g — Memory Recognition and Recall in User Interfaces](https://www.nngroup.com/articles/recognition-and-recall/), Raluca Budiu, 15 January 2024; retrieved 17 October 2026.

**Observed guidance:** Show available actions and relevant information rather than making users remember commands or prior information. Labels and contextual help support recognition; a tutorial cannot substitute for an understandable interface.

**nexo inference:** Use visible weekdays, named subjects, labelled actions and current skill choices. Keep the whole weekly pattern available while editing one day. Prefer “Pas vast weekplan aan” and “Wijzig alleen deze dag” to an ambiguous edit icon. Display question-to-session conversion next to the quantity input.

### 2. Keep related planning decisions together

**Source:** [NN/g — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/), Jakob Nielsen, 3 December 2006; retrieved 17 October 2026.

**Observed guidance:** Expose frequent/important controls first and make secondary options discoverable. The article distinguishes this from a sequential wizard: interdependent choices benefit from being visible together, while independent stages can be separated.

**nexo inference:** Do not force seven weekday setup screens. Use one weekly plan surface with an editor for the selected day or subject. Days, quantity and session consequences belong together. Reveal skill refinement and less frequent settings when requested. Keep administrative content review and AI-provider operations out of the routine planning path, even when the same adult has both roles.

### 3. Distinguish a recurring pattern from a dated exception

**Source:** [Google Calendar Help — Create a recurring event](https://support.google.com/calendar/answer/37115?hl=en), retrieved 17 October 2026.

**Observed behavior:** Events can repeat on selected days; when editing a recurring event, users choose which events in the series the change applies to.

**nexo inference:** Treat the fixed week plan and dated learning work as related but distinct. Show the repeat promise persistently. A dated-day change should clearly say it affects that date only; a plan change should show its effective date and future scope before saving. Never rewrite completed learning history. Exact controls and effective-date defaults remain design proposals, not behavior mandated by Google.

### 4. Separate completion state from performance

**Source:** [Khan Academy — How do I use the Assignments report?](https://support.khanacademy.org/hc/en-us/articles/360031122951-How-do-I-use-the-Assignments-report), updated 6 July 2026; retrieved 17 October 2026.

**Observed behavior:** The report distinguishes unassigned, not-started and in-progress work and exposes completion/performance information. It supports date/type filtering and links from assignments to response detail. Summary percentages represent best scores.

**nexo inference:** The dated week overview should answer “What is planned, done and remaining?” before showing learning detail. A completed session is not proof of mastery. Use explicit text labels and quantities; do not adopt Khan's traffic-light score thresholds or mix those colors into the approved brand. Adam's retry-weighted score must be labelled as such rather than resembling first-attempt accuracy.

### 5. Preserve first-attempt evidence behind the summary

**Source:** [Khan Academy — How do I use the Responses and Completion Reports?](https://support.khanacademy.org/hc/en-us/articles/115000780012-How-do-I-use-the-Responses-and-Completion-Reports), updated 29 September 2026; retrieved 17 October 2026.

**Observed behavior:** Assignment detail exposes question outcomes, first and best scores, and individual responses with correct answers to help identify misconceptions. It also offers exercise previews.

**nexo inference:** Let a guardian move from weekly subject progress to a session and its exact attempts. Display first-try success separately from the 1/0.5/0 practice score. Show both attempts for the same item rather than treating a successful retry as a new independent success. A preview of what Adam will see can make the plan concrete without requiring the guardian to sign in as the student.

### 6. Summarize sessions before opening every question

**Source:** [IXL — How do I use the Student Usage report?](https://www.ixl.com/help-center/article/8887938/how_do_i_use_the_student_usage_report), retrieved 17 October 2026.

**Observed behavior:** The report summarizes activity over time, then sessions/skills with questions answered, missed questions and score change; users can open the question log for detail.

**nexo inference:** Group work by day and subject, then reveal sessions on demand. At Adam's volumes, a top-level list of every question would be impractical. Do not equate time spent, quantities completed or a proprietary competitor score with learning. Keep reading tasks distinct from question totals and never count retry presentations as extra assigned work.

### 7. Make “needs support” explainable

**Source:** [IXL — How can I use the Questions Log?](https://www.ixl.com/help-center/article/8422671/how_can_i_use_the_questions_log), retrieved 17 October 2026.

**Observed behavior:** The question log provides exact answered questions, student and correct answers, and a missed-questions filter. Its guidance uses these records to find patterns and support individual review.

**nexo inference:** A difficult-skill suggestion should lead to actual examples and recent first-attempt evidence, with sample size and appropriate uncertainty. From there, the guardian can adjust the plan's skill emphasis. Avoid an opaque “AI says he struggles” card or automatically increasing workload. Difficulty adaptation remains within guardian-set bounds.

## Recommended direction

**Set up once → check the dated week → inspect a concern → make a bounded adjustment.**

- **First use:** choose the learning focus and build a recurring week; show each subject's unit and conversion (80 Redactiesommen → 8 sessions of 10; 2 reading tasks → 2 text-based sessions). Review the pattern and its start date, then activate it. No implied all-subject daily quota.
- **Normal return:** land on the current dated week, with today obvious and planned/completed/remaining sessions visible. Keep “Vast weekplan” accessible without requiring a planning task on every visit.
- **Inspect learning:** open a subject or noteworthy skill, then session/attempt evidence. Separate first-attempt outcomes, successful retries and unresolved mistakes. An incomplete session has no final score yet.
- **Adjust:** distinguish “this date only” from “the repeating plan from [date]”. Show the effect on unstarted work. Started sessions and historical evidence remain intact. A one-off extra assignment must not accidentally become recurring.
- **Occasional tasks:** student devices, recovery and household settings remain easy to find but outside the daily learning loop. Admin content review and operational cost controls remain a separate role area.

These are proposed design implications. No cited source establishes a correct quantity for Adam, the best length of a session, the educational validity of half-credit retries, or an ideal algorithm for adaptivity. Those remain user requirements and educational evaluation concerns.

## Limits and prototype checks

The research used publicly accessible documentation, not authenticated product walkthroughs. IXL article bodies were available in search-index text; direct page opens returned a navigation shell, so their exact current visual arrangement was not inspected. Khan search snippets included older wording; the findings above use the opened July/September 2026 pages. No analytics, interviews or usability testing of this proposed nexo journey have been performed.

Test the prototype with the guardian on the MacBook: create a varied recurring week; explain what will happen next Monday without prompting; change one date without changing the pattern; change a future pattern without altering completed work; identify a weak skill from first-attempt evidence; find the actual missed question. Verify the same core tasks through keyboard navigation and a narrow layout. Treat task confusion as design evidence, not a need for a longer tutorial.

Open design decisions include non-multiples of ten, current-week versus next-week effective dates, unfinished-work disposition, shortage messaging, and how School/Growth choices are explained. The prototype should make a proposed policy concrete; implementation requires resolving it explicitly.
