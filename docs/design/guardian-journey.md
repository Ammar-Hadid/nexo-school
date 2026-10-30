# Guardian journey — one repeating routine, clear weekly feedback

**Current reference pass:** [D04-R2](guardian-portal-r2.md), assigned 27 October 2026, supersedes the historical proposals below where they conflict with current automation, taxonomy, carryover or feedback/reversibility requirements. The new clickable prototype is In Review.

Date: 17 October 2026. Status: **Draft for review**. This is the recommended UX direction, not implemented functionality or user-tested proof of intuitiveness. The palette and typography are approved; these screen compositions and proposed interaction defaults are not yet approved.

**Superseded in part by the subsequent [guardian interview](guardian-interview.md).** Use that record for current user direction: attention-based home, manually recurring practice blocks and gaming passes, automatic reuse of unfinished work in the next same-subject slot, Dutch curriculum alignment, a collapsible desktop sidebar and device-specific full-capability mobile UX. The older home/navigation, no-automatic-carryover and classroom-topic-entry proposals below are historical design alternatives, not current requirements. These reference images need revision before implementation.

Read with [research](guardian-research.md), [weekly practice requirements](../product/weekly-practice.md), [color palette](color-palette.md) and [typography](typography.md). The user's priority is intuitiveness: set the routine once, recognize what needs attention, and make a change whose effect is obvious. Preserve all five subjects, School/Growth intent, controlled AI generation, independent student access and honest progress reporting.

## Recommendation

**Set a repeating week → return to this week's progress → inspect a difficulty → adjust only what is needed.**

Use two primary destinations: **Weekplanning** and **Voortgang**. Weekplanning is the returning home, with **Deze week** and **Vast weekritme** as clearly named views. Keep **Instellingen** in the header for child details, devices, security and account settings. Show the current child persistently; introduce a child switcher when there is actually more than one child. Do not require a profile-picker screen for a single-child household.

This keeps the long-lived schedule separate from dated work, while retaining a short route between them. A completion counter answers whether work was done; progress answers what the answers tell us. A conventional hourly calendar is unsuitable because no learning time slots were requested.

## A. First use: create the routine once

1. **Sign in and establish access.** Reuse the approved adult authentication/MFA policy. If the child's browser is not approved, show a setup task under devices; let the guardian plan before the tablet is available. Do not require re-enrollment on ordinary visits or guardian launch of every student session.
2. **Confirm child context.** Reuse known name and school group rather than asking again. Show an editable summary. Do not require a school-method edition if the guardian only wants skill-based practice.
3. **Build the week on one visible surface.** All seven weekdays remain visible. Choose a day, add subjects, then quantities. Selecting a day opens its editor beside the week on desktop; mobile uses a dedicated page with Back returning to the preserved draft. Avoid seven sequential weekday wizard pages.
4. **Choose learning focus within the subject editor.** Keep the quantity and its meaning visible. Reveal learning goals when requested. Offer clear wording for School intent (“Aansluiten op school — ik kies de leerdoelen”) and Growth intent (“Gericht groeien — nexo kiest binnen mijn doelen”). Default to the guardian's last choice, not an unexplained algorithmic mode. Initial goals must be chosen from the supported, reviewed groep-5 scope; without evidence, say that nexo is still learning what is difficult. Do not invent weak skills or claim verified publisher alignment.
5. **Review and activate.** Show the whole repeating pattern, start date, total session count and a preview of one student day. The initial action is **Weekritme starten**. Confirmation states when it begins and that it repeats automatically. Existing-plan edits use **Wijzigingen bekijken**, followed by a before/after summary and **Wijzigingen opslaan**. A multi-step review is justified for activation or recurring changes; ordinary browsing needs no confirmation.

### Day editor contract

- Heading identifies scope: **Elke maandag** when editing the repeating plan; **Alleen maandag 19 oktober** for a dated exception.
- Subject rows have labelled quantity inputs and adjacent conversions: **80 vragen → 8 sessies van 10**. For reading: **2 leestaken → 2 sessies**, with **Elke leestaak bevat één tekst met vragen**. Never treat two reading tasks as two questions.
- Use questions as the input unit for the four numeric categories because that matches the guardian's language. Offer increments of ten. If an arbitrary entry is not divisible by ten, show the remainder explicitly and require resolution; the exact remainder policy is still open. Never silently round up.
- Give each row a visible **Leerdoelen** action and current focus summary. Keep detailed algorithm parameters, provider names and prompts out of the planning form.
- **Overnemen naar andere dagen** copies a selected day's draft after explicit target-day selection. It does not overwrite other days silently.
- Empty weekdays say **Geen oefeningen**. Rest days are valid. No assumed daily all-subject target or inferred duration.
- Include **Annuleren** and **Opslaan in weekritme** for the day draft. Preserve other entered days when returning from review or correcting errors.

## B. Normal return: understand this week at a glance

Land on **Deze week**, using the family's local dates and a visible week selector. Mark today with text and a subtle accent. A persistent short sentence says the repeating plan is active; the guardian never needs to recreate or manually roll it forward.

Show seven day rows, each containing subject names and completed/planned session counts. Expand a day to see subjects, then the individual sessions. A reading task shows its own question count when known. Avoid exposing hundreds of question rows on the home screen.

Use explicit **Niet gestart**, **Bezig**, **Afgerond** and **Nog niet beschikbaar** states. Separate assigned, available and completed work where availability differs. “Plan active” never means every future question is already available. A session in progress shows where Adam stopped, not a final score.

Only show an attention message when action is useful. Examples: unfinished sessions, unavailable practice or a device that needs approval. No placeholder warnings, broad dashboard metric grid or routine success notification on every visit. Cornflower/text communicate planning and completion; green remains reserved for correct answers.

**Bekijk Adams dag** opens a read-only guardian preview clearly labelled **Voorbeeld**. It does not sign the guardian into the student account or let the guardian submit student answers.

## C. Change something without accidentally changing everything

| Entry point                            | Proposed default                                                     | Confirmation tells the guardian                                                         |
| -------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Dated day → **Wijzig alleen deze dag** | That date only                                                       | Date, before/after quantities, affected unstarted sessions; repeating pattern unchanged |
| **Vast weekritme** → edit weekday      | Future occurrences from selected effective date; suggest next Monday | Weekday, start date and ongoing weekly scope                                            |
| Dated day → **Eenmalig toevoegen**     | One dated assignment                                                 | Subject, quantity and date; no new recurring item                                       |
| **Bekijk open sessies**                | No automatic carryover                                               | Which work remains, then explicit leave/move/waive action                               |

These defaults are proposals for review. Offer another effective date intentionally, with an impact preview. Do not silently change a plan's scope based on which button happens to have focus. Started and completed sessions retain their questions/policy/history; if a quantity reduction cannot fit around protected work, explain the conflict and let the guardian reduce only unstarted work or choose a later date.

For unfinished work, recommend **Laten staan**, **Verplaatsen** or **Niet meer nodig**. Moving existing sessions must not duplicate them or change the repeating plan. Waived work is distinct from completed work. Removing already started work needs an explicit consequence statement and preserved attempts. Future weeks still recur independently; no hidden workload escalation.

Changes show success only after acknowledgement. Failed saves retain the draft and explain how to retry. A stale plan opened in another tab requires reviewing the newer version before overwriting. Accessibility errors identify the relevant field, preserve input and use text rather than color alone.

## D. Understand learning, then decide whether to act

**Voortgang → subject → skill or session → original questions and attempts.**

Start with five subject rows, a simple time period and concrete recent evidence. Expand to see skill patterns and completed sessions. State when evidence is limited, assisted or drawn from one reading text; do not label a skill mastered from one successful session. Avoid equating time spent or total volume with learning.

Session detail separates **Oefenscore met herkansing**, **Eerste poging** and questions still worth practising. For the agreed example: 8 direct successes, 1 successful retry and 1 failed retry = **8,5/10**, with first-attempt success **8/10**. Show both submitted answers, the exact original question and its explanation. Retry presentations do not increase the assigned-question count. For reading, retain access to the text and evidence context.

A difficulty summary links to its evidence before offering **Leerdoel aanpassen**. Changing emphasis should not automatically add questions. Future new questions/targeted reviews stay within the guardian's configured scope. Existing correctly completed exact questions are not filler; the specified fresh/review selection policy remains intact.

## Final-product fit without crowding the daily flow

- Device approval, revoke/recovery, guardian MFA and household settings remain in **Instellingen**, with attention links when needed.
- Curriculum goals and optional exact-edition school mapping appear in the relevant subject's focus editor, not a mandatory separate curriculum-management task.
- Content publication/review, provider keys, generation jobs, budgets and operational controls belong to a distinct **Beheer** area for authorized admins. A guardian who also has that role can reach it explicitly; everyday planning does not require opening it.
- Inventory shortage is shown in guardian language: what practice is available, what is not, and possible next actions. Never serve unreviewed semantic content or disguise duplicate completed questions as fresh ones. Do not claim a preparation completion time unless known.
- Future additional children can reuse the same child-scoped navigation. Teacher/classroom management and other post-MVP functions do not need placeholder navigation now.

## Reference screens and example data

Three connected screens show one direction, not three options:

1. [Vast weekritme](references/guardian-week-pattern.png): ongoing plan editor, quantities/session conversions, effective date and review action.
2. [Deze week](references/guardian-current-week.png): returning home, dated work and explicit incomplete work.
3. [Session detail](references/guardian-session-result.png): transparent first/second-attempt evidence and a route to the skill.

All data is fictional. The sample week is illustrative, not a recommended workload: Monday 12 sessions, Tuesday 10, Wednesday 13, Thursday 5, Friday 12, weekend none = 52 sessions. That represents 480 non-reading questions and 4 reading tasks; reading questions are not included in the 480. Example completion 12 + 10 + 11 + 5 + 10 = 48/52; four remain from Wednesday and Friday. Displayed current week is 12–18 October 2026, today Saturday 17 October. The future pattern change starts Monday 19 October. Session detail is Friday 16 October.

Generated references illustrate hierarchy and composition, not pixel-exact font rendering or production behavior. In the implemented UI use the approved local fonts, exact tokens and deliberate button/focus/error states. The optional child-dropdown glyph in the mockups is omitted when there is only one child. Additional labels/links must use accessible semantic colors, not arbitrary shades sampled from images.

## Narrow layouts and accessibility

On mobile, day rows become stacked entries with the same labels and labelled expand actions. The day editor becomes a full page. Repeating-vs-dated scope remains visible above the Save action. Do not require horizontal table scrolling or drag-and-drop to plan a week. Every action has keyboard access, a visible focus state and a contextual accessible name. Use text labels for status, preserve zoom/reflow, and announce save results/errors. Exact responsive compositions and keyboard behavior remain to be prototyped/tested.

## Research basis and validation before implementation

The seven-source [research brief](guardian-research.md) distinguishes observed product patterns from our inference. Key influences are recognizable labelled actions, keeping interdependent planning choices visible, explicit recurring-edit scope, and drilling from summaries into actual answers. Public documentation is adjacent evidence; no interviews or nexo usability tests have established that this design is intuitive yet.

Additional form guidance: [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/) supports a review step with specific change links and preserved inputs; [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) supports explicit success/error feedback. These inform the proposed interactions, not a claim that nexo inherits another service's usability results.

Next review artifact: one clickable synthetic prototype covering first activation, a dated exception, a future recurring edit, open-work handling and session drilldown. Before backend/component implementation, ask the guardian to complete these without coaching:

1. Set Monday to 80 Redactiesommen, 20 Taal and 20 Spelling, and Tuesday to two reading tasks plus 80 Redactiesommen. Identify what will happen next week.
2. Change next Tuesday only, then verify the following Tuesday is unaffected.
3. Change every Monday from next week, without rewriting completed sessions.
4. Find the four open sessions and move one without duplicating work.
5. Explain why 8,5/10 is different from eight first-time successes, then find the original wrong answer.
6. Find device revocation without entering content administration.

Record wrong turns, hesitation, unexpected outcomes and scope misunderstandings. Revise the design rather than adding instructions to compensate. No task has been tested yet. Remaining policy choices are remainder batches, paused-only retry spacing and detailed treatment of waived/partially started work; the guardian design must make those consequences explicit before implementation.
