# Guardian portal interview record

Date: 17 October 2026. Status: **Record of explicit user answers; not an implemented feature, validated research result, or approval of a screen design.** The interview provides enough direction for guardian reference screens. The complete composition has not yet been reviewed. Preserve the approved stack, palette and typography.

This record takes precedence over conflicting proposals in [the earlier guardian journey](guardian-journey.md). Read alongside [weekly practice](../product/weekly-practice.md) and [architecture decisions](../architecture/decisions.md). Question numbers identify answers in the project conversation; subsequent corrections take precedence.

## 19 October subsequent instruction

The user now wants automatic assignment with category-level assessment, skipping already-demonstrated work and sequential category progression per subject; Redactiesommen must be assigned every day. This supersedes Q10's manual-only/no-automatic-planner answer. The earlier difficulty-approval rule requires reconciliation with the requested routine automation; a bounded route approved once is proposed, not yet implemented. Preserve the historical interview below and use the [current research/proposal](../research/2026-10-19-automatic-progression.md) and [weekly-practice amendment](../product/weekly-practice.md) for the new direction. Adam still sees only today's assigned blocks.

## Intent

- Outcome: an intuitive guardian workspace for spotting what needs attention, managing a repeating routine and understanding learning progress.
- User: Ammar, initially Adam's only guardian and also the administrator; additional guardians later.
- Why now: settle the portal's structure and reference screens before building shared product components.
- Success: check quickly and leave when everything is fine; investigate concerns, review work and edit the plan comfortably on either MacBook or iPhone.
- Constraints: manual recurring planning, guardian-approved difficulty changes, economical content generation, Dutch-first language and evidence that does not pretend to establish motivation or exact ability.
- Outside this design step: production educational implementation, live assistant integration, an open-ended student chatbot and device/game control. Research and implementation details remain separate work.

## Home and review (Q1–9)

- Home prioritizes attention, including blockers, many mistakes, possible rushing, persistent difficulty and work becoming too easy. Ordinary completion remains visible through today's blocks.
- The user specifically wants thorough research into distinguishing possible disengagement from genuine difficulty. Response times and answer patterns are candidate evidence, not proof of intent. No detection thresholds or accuracy claims have been approved.
- The system recommends difficulty increases or decreases with evidence; the guardian approves every change.
- Completed sessions count toward the practice-before-play agreement automatically unless flagged. Flagged sessions await the guardian's decision. Factual completion and score remain separate from approval for the agreement.
- A flagged session gives Adam a personalized Dutch instruction naming Ammar and asking him to come for a review. Ordinary completion receives a positive completion message. Exact copy remains a design detail.
- Review opens with a short reason, relevant answers and a suggested next step; full session details remain accessible.
- Guardian decisions are simple: approve or request a repeat. Preserve the original result. A repeat uses fresh equivalent questions at the same difficulty; for reading, retain the text and its associated questions.
- Notifications stay inside the application. Adam is prompted to ask Ammar himself. Future integration with the user's personal assistant, nexo, should be accommodated, but calls, external messages and assistant automation are out of current scope.

## Recurring plan, blocks and passes (Q10–18)

- The guardian manually builds one full weekly template during setup. It repeats until edited. No automatic planner or algorithmically proposed schedule is requested.
- Distinguish a question session (normally 10 questions, or one complete reading bundle) from a practice block containing multiple sessions. Days typically have two or three blocks, varying by weekday.
- Blocks follow the guardian's order. Adam chooses session order within the current block.
- Each completed, eligible block earns a gaming pass. Flagged sessions require review before counting. Passes use a default duration with per-block overrides; 20 minutes was an example, not a confirmed default.
- Adam activates an earned pass when ready, starting a visible timer. Passes are valid only that day; unused minutes do not carry over.
- The user wants an actual pass visual and suggested Blender/Three.js. This is visual direction to explore, not an installed dependency or a change to the approved stack.
- Schedule edits explicitly choose between a single date and the repeating weekly plan.
- Unfinished work carries forward as the exact already-generated questions with saved progress, to the next scheduled slot for the same subject. It replaces new work within that slot's planned capacity rather than adding workload. For example, two carried rekenen sessions precede four new ones in a six-session rekenen slot. A day without rekenen does not receive those sessions merely because it is next chronologically.
- Carryover must not regenerate questions or reset completed answers. Code/templates should generate appropriate content; use AI only where needed. The temporary suggestion to use AI for every question was explicitly withdrawn. See ADR-007.
- Specific daily core subjects have not been chosen. The planner must support the guardian choosing weekday combinations, without inventing a fixed set.

## Progress, explanations and starting level (Q19–22, Q30–31)

- Progress covers all three requested perspectives: skills improving or needing support; weekly scores and completed work; and Dutch curriculum learning goals.
- A personalized AI explanation uses Adam's actual incorrect answer, suggests a possible mistake without claiming to know his thoughts, explains why the answer is incorrect and explains the correct answer/method in simple Dutch at his level.
- It appears automatically after the second incorrect attempt, without per-question guardian approval. It must not reveal the answer before the deferred second attempt. A correct second attempt earns 0.5 points with confirmation and no explanation.
- This is bounded personalized explanation, not an open-ended conversational tutor. Runtime explanation validation, latency, cost, answer leakage and safe fallback need design/research; this request does not remove existing semantic content publication checks.
- Adam takes a short assessment on first use of each subject. The desired result is an accurate starting-level estimate. Accuracy has not been demonstrated and must be evaluated; subsequent practice should refine evidence.
- Dutch curriculum alignment starts around groep 5 and permits progression beyond it. The user does not want routine manual classroom-topic entry or school-material uploads. Do not claim exact alignment with his current classroom or publisher edition.
- Preserve skill-level strengths and gaps. Grade is a starting reference, not a ceiling; more advanced work follows evidence and guardian-approved difficulty changes.

## Portal structure and device experience (Q23–29)

- One guardian initially, with additional guardians possible later. Do not add current invitation/permission flows just for that future possibility.
- Administrative content review, AI spending and system status belong in a separate **Beheer** area accessible from the guardian portal.
- Desktop uses a collapsible sidebar to give the page more space. Proposed destinations discussed were Overzicht, Weekplanning, Voortgang and Instellingen; the desktop header/sidebar and labels were subsequently approved at navigation revision 1.
- Home is compact: attention items and today's blocks, with details one click away.
- Full capabilities must be comfortable on both MacBook and iPhone, including weekly planning. Tailor layouts, navigation and interactions to each device while sharing data, rules and branding.
- Show both a bottom-navigation and a menu-button approach for iPhone in the reference designs. The user subsequently selected and approved option A (bottom navigation) on 17 October 2026; option B remains unselected.
- Guardian visual direction is calm and polished with purple/blue. The user later approved the lighter purple and Button revision 4; see [the current palette](color-palette.md). Intuitiveness is the overriding priority. Dutch is primary throughout both portals; English is planned later.

## Research and interaction details still open

These are not grounds for repeating the preference interview or claiming that implementation is ready:

- Research learning/engagement evidence, false flags, mastery estimates and first-use assessment quality before inventing a detector or precise level prediction.
- Establish reviewed Dutch goal mappings and progression beyond groep 5; distinguish curriculum references from classroom alignment.
- Plan generation timing, reusable inventory, replenishment and budgets; validate personalized explanation output and preserve trusted answer keys.
- Resolve carryover across block boundaries and changed templates, removed subjects, skill/difficulty changes, and reading bundle capacities while preserving the confirmed same-subject reuse rule.
- Define gaming-pass expiry/timezone, timer behavior across navigation/devices, expiry feedback and relationship to carried blocks. External game/device enforcement has not been requested.
- Resolve remaining session details already recorded in weekly practice, including reading answer leakage, non-multiple-of-10 quantities and the final-question retry transition.
- Reference screens should cover normal, attention, review and planning states on both devices. The subsequent navigation review approved desktop header/sidebar and mobile option A; this interview itself does not establish approval of other components or full page layouts.
