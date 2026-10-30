# Guardian portal · D04-R2 reference design

**28 October: presentation rejected and superseded by [D04-R3](guardian-visual-language.md).** This document is historical evidence of retained capabilities and limits, not the current visual direction.

27 October 2026. **Implemented as a synthetic clickable prototype; In Review.** The user assigned D04-R2 after the thread-transition handoff. This authorizes the reference-design pass now, while the functional sequence remains D14-S5 → D24/D25, then D26 and subsequent release gates. It does not approve the final portal or activate automation.

Read with the [roadmap](../../tasks/delivery-roadmap.md), [current ledger](../../tasks/todo.md#current-position-and-handoff), [navigation contract](guardian-navigation.md), [guided saved workflow](guided-local-workflow.md) and [assessment policy](../product/assessment-policy.md). The earlier [journey](guardian-journey.md) and [interview](guardian-interview.md) retain useful preferences but their manual-only planning, five-peer-subject and historical carryover rules do not override current contracts.

## User's interaction principles

Every meaningful action must answer three questions:

1. **What just happened?** Show a specific, truthful outcome after acknowledgement. Pending, failed and uncertain writes must never masquerade as success. Preserve the input and provide a recovery action.
2. **Can I take it back?** Offer undo when the underlying operation supports it, and say how long or under what conditions. Explain irreversible consequences before confirmation. A compensating withdrawal or new version is different from deleting history.
3. **What do I do next?** Make one useful next action prominent. When nothing needs attention, explicitly say so; do not manufacture a warning or required task.

Keep the interface intuitive without removing capability. Backend complexity belongs behind understandable summaries, progressive disclosure and a distinct Beheer destination. Details remain reachable; simpler copy must not weaken authorization, publication, evidence, scoring or immutable-history rules. These principles apply to later guardian implementation as acceptance criteria, not just this prototype.

## Review entry

Storybook → **Guardian → Portal design → Review Page**, story `guardian-portal-design--review-page`.

Local review: `http://127.0.0.1:6007/iframe.html?id=guardian-portal-design--review-page&viewMode=story`.

Source: `src/modules/guardian/design-preview/`. All scenario state stays in memory; reload restores the specimen. The toolbar labels fictitious data and offers attention, quiet, shortage, first-visit, loading and error states. No app route imports the prototype; no fetch, storage, auth, database, content-provider or scheduling adapter is present. Links to the existing portal open separately and require its ordinary authentication.

Uses approved `GuardianNavigation` (collapsible desktop sidebar / mobile bottom navigation), `AttentionCard`, `AttentionState`, `Button`, `TextField`, existing fonts and semantic tokens. No approved shared component or token was edited. The new compositions themselves are not approved.

## Connected reference journeys

| Area                         | Reference behavior                                                                                                                                       | Feedback, reversibility and next step                                                                                                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overzicht                    | Attention first, then today's blocks; quiet means no action required. No invented mastery, engagement diagnosis or notification counter.                 | Open original answers, mark a conversation as viewed, and restore that attention item. This changes only the local example, never results.                                                                                               |
| Weekplanning                 | Seven weekdays, a separate dated edit, effective date, quantities for four subjects, daily Redactiesommen, game-minute specimen and before/after review. | Confirm scope and protected history. Save shows what changed; undo restores the previous plan. Failed-save story keeps the draft and offers retry. Navigation keeps drafts. Cancel discards only that draft.                             |
| Voortgang                    | Recent task list and original-order detail, including full reading passage, choices, committed attempts, second-miss explanation and score out of 10.    | No final score or unrevealed answer key for unfinished tasks. The next action follows the observed answers, without a mastery claim. Focus returns to the opened task when going back.                                                   |
| Proposed flagged-task review | Collapsed, explicitly labelled D26 preview: let a task count or request another practice task. No detector or gamepas implementation.                    | Confirmation explains that original answers/scores remain. Undo is conditional on no issued/used downstream work; this specimen issues none. Repeated reading must retain the complete original text/question bundle when integrated.    |
| Beheer                       | Inspect both example exercises, approve, then separately publish. Optional ordinary note; explicit confirmation.                                         | Approval can be taken back before publication. Published history cannot be erased: withdrawal pauses affected work and preserves attempts. Withdrawal explains that correction requires a new version/review; a reason remains required. |
| Instellingen                 | Browser-access example, with full account/security/recovery links to the existing portal.                                                                | Before revocation, explain that access stops, stored work remains, and recovery requires enrollment/approval again. No misleading undo.                                                                                                  |

The planning specimen is deliberately bounded: it edits one date (27 October) and the seven recurring weekdays, with illustrative fixed category choices and block ordering. Counts and 20-minute gamepasses are example values, not approved defaults. It does not implement arbitrary-date selection, rearranging blocks, curriculum bounds, first activation, persisted conflicts, real carryover, availability checks or earned passes. Those controls must be completed and reviewed with D24/D25/D27/D28; their capabilities remain required. Zero selected subject tasks leaves the mandatory daily Redactiesommen block. The future schedule is an interaction proposal, not a second source of scheduling rules.

The home day and recent-result specimens use existing synthetic completed arithmetic/reading and unfinished spelling; the recurring-week specimen illustrates a future pattern, not a claim that it generated those historical tasks. A shortage is a content limitation, not a learner deficit, and is never resolved by presenting unreviewed work. Prototype error retry changes a local example; it is not evidence of network recovery.

## Preserve existing capability

| Existing capability                                                | Current implementation retained                                                             | Future design placement                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Normal sign-in, MFA, passkeys, enrollment, revocation and recovery | `src/modules/identity/portal/`, existing `/guardian` and `/guardian/access`                 | Instellingen; attention shortcut for required access actions       |
| Stock preparation, review-time/cost caps, family review            | `/guardian/content/supply`, `/guardian/content/supply/family`                               | Beheer, expandable operational detail                              |
| Ordinary review, separate publication, optional notes              | `/guardian/content/supply/review`, `/guardian/content/review`, `/guardian/content/spelling` | Beheer review queue                                                |
| Assignment, correction and withdrawal                              | `/guardian/content/assignments`                                                             | Planning for ordinary assignment; Beheer for correction/withdrawal |
| Saved attempts and results                                         | `/guardian/results`, existing result DTO/projection and score formatter                     | Voortgang, original evidence one step deeper                       |
| Learner exercise, retry, Nexai and saved resume                    | All existing student/practice modules                                                       | Unchanged student portal                                           |

No account/data reset, injected sessions, migration, approval transfer, real publication, remote operation, paid call or real-learner use occurred. The retained localhost:3060 environment was not restarted or mutated. Reusing read-only synthetic fixture/projection functions does not grant real educational validity.

## Validation and review status

Source fingerprint (sorted relative paths + NUL + bytes + NUL across `src/modules/guardian/design-preview/`): `04d011d1a94ef0646cf4b77fef36c4cae854be1ce0ee5057d0f0586c6e941c74`.

Executed evidence is recorded in the D04-R2 ledger entry. Technical QA is agent-owned. The prototype still needs Ammar's design/usability review; tests do not establish that it feels intuitive.

Suggested uncoached review:

1. Find what needs attention and the original answers. Explain the next step.
2. Change only today, explain what next Tuesday does, then undo.
3. Edit a recurring weekday from the stated future date; cancel once, then confirm.
4. Leave a draft to inspect results, return, and find the draft intact.
5. Explain why approving exercises has not published them; publish, then find the correction/withdrawal route.
6. Find browser revocation and explain the recovery consequence before confirming.

Record wrong turns, hesitation and unexpected outcomes in the next revision. Do not ask the user to certify educational thresholds, software correctness or security. Next design work is feedback on this composition and completing the bounded planning/attention subflows, then incremental integration with their functional tasks. D04-R2 remains In Review until that review, not automatically complete or Approved.
