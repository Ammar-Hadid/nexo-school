# Guided local practice workflow — D04-M2

26 October 2026. User-authorized presentation improvement: preserve functionality and make the next step immediately apparent. **Implemented and Tested; In Review, not visually Approved.** This is maintenance before D14-S5, not a new functional milestone or educational approval.

## 26 October follow-up — D04-M3

The user accepted the clearer journey as adequate for testing and explicitly questioned the final guardian design. **The current guardian workspace is a functional local test interface, not the definitive guardian portal or final UX/design approval.** Existing individual palette/navigation/component approvals remain valid within their original scope. Final portal composition and everyday journey still require design review.

Ordinary content approval/rejection notes are now optional (blank or short text accepted; 16,000-character maximum). Missing notes persist as an empty string. Review confirmation, exact-version decisions, mechanical blockers and separate publication stay mandatory. Family educational judgments and correction/withdrawal notes are unchanged. The result-scale amendment is recorded in the [practice contract](rekenen-task.md#26-october-2026--d04-m3-result-scale-amendment).

## Journey

The existing guardian home reads the existing authorized content-delivery and results endpoints to suggest the next action: set up a learner, prepare stock, finish review/publication, assign, continue in the student browser, or inspect completed work. Loading/error/reverification states do not masquerade as an empty account. Historical completed work remains visible; direct links allow another task without resetting progress. The summary reflects the existing result endpoint's most recent 100 tasks; it is not a scheduler or per-learner readiness guarantee.

The shared `WorkflowGuide` component only renders host-provided text, an optional link and an ordered current-step indicator. The content-owned `PracticeFlow` supplies the five labels: Voorbereiden → Beoordelen → Klaarzetten → Oefenen → Resultaat. It stores no progress, runs no API and claims no automatic completion. Reuses existing tokens and navigation; feature-specific choices stay with their owners.

- Home: one highlighted next action plus direct destinations and collapsed local-test context.
- Accounts: one-time setup instructions; adding another learner is collapsed when a learner exists. Existing enrollment/approval/passkey/revocation controls are retained.
- Supply: a first visit defaults to two exercises. Existing saved planning values remain. Preparing leads to review; ready stock leads to assignment. Limits, measured time, shortage counts and family-review information remain available under details.
- Review: explains inspect/select → approve → publish. A shortcut selects currently approved, unblocked, unpublished versions and opens the existing decision panel. Publication still requires its separate explicit confirmation; no approval or publication API is changed. Supported saved arithmetic/Spelling batches link onward after publication.
- Assignment: no empty category control when no stock exists. Explain the prerequisite and link to preparation. Missing learner and unpublished/blocked content get distinct guidance. Default count is two; retained uncertain requests still restore their original count and identity. Confirmed assignment points to the separate student browser and saved results. Existing correction/withdrawal tools remain; their empty presentation is omitted when no content exists.
- Results: explain whether to prepare a task, continue in the student browser or inspect answers. Saved navigation routes Overview back to the actual home and Settings/Admin to their actual pages. Historical in-memory preview navigation remains local.

## Boundaries

Existing APIs, database, authentication/MFA, passkeys, publication decisions, selection/cooldown, attempt/retry/scoring, content, withdrawal and saved data are unchanged. No paid provider, remote environment, real learner data, new curriculum content, automatic planning or educational approval. No new dependency. Existing independent visual approvals remain; these new compositions and guidance await user review.

## Verification

See the current D04-M3 follow-up and historical D04-M2 entry in the [task ledger](../../tasks/todo.md#current-position-and-handoff) for exact executed results and omissions. Focused Storybook cases cover loading/failure/reauthentication, absent learner/stock, blocked/pending/published stock, next actions and explicit publication confirmation. The ordinary-login browser journey follows the new links and shortcut while retaining draft/restart/results/auth-recovery checks. Mobile/desktop accessibility and overflow checks cover the new home, prepared and published screens.
