# D07 handoff — shared sign-in approved

21 October 2026 · **D07 handoff complete.**

Subsequent user amendment on 21 October: the user explicitly resumed D08 in a new assignment. The stop instructions below record the original D07 handoff; they no longer hold D08. Follow the [current ledger](todo.md#current-position-and-handoff) and [D08 contract](../docs/engineering/guardian-results.md).

## Current position

D00–D07 have their recorded bounded technical acceptance in the [ledger](todo.md#current-position-and-handoff). The user explicitly approved D07-UI revision 2: “Approve this design, register it in our shared system, dont move on to D08 yet, make the handof”. This closes the shared sign-in visual review. It does not approve every other D07 saved/error screen or the separate guardian results design.

The [sign-in contract](../docs/design/sign-in.md) and [shared approval register](../docs/design/component-approvals.md#shared-sign-in--d07-ui-revision-2-21-october-2026) are authoritative. Reuse the approved layout, stationery artwork, mark as used here, Dutch copy, tokens, role contexts and feedback presentation. No redesign or passkey-only shell is needed for later integration.

## Implementation to reuse

- `src/components/sign-in-layout/`: shared `SignInLayout` form/help/footer slots, `SignInNotice`, component tokens and stories. No domain/auth dependencies.
- `src/modules/identity/sign-in/sign-in-page.tsx`: student/guardian copy and current device-method adapter. Authentication methods belong inside the form slot.
- `src/modules/identity/sign-in/sign-in-review.tsx`: role/method/state preview. Password/code forms are local-only concepts; this approval accepts the presentation, not a method decision or backend.
- `src/modules/practice/saved/student-home.tsx`: real `/student` integration, passkey login, availability/retry states and authenticated task overview. Saved-route architecture and evidence remain in the [D07 engineering contract](../docs/engineering/saved-student-journey.md).
- `tests/e2e/sign-in.spec.ts` and the two sign-in story files cover the presentation; `tests/identity/student-browser.test.ts` includes actual built sign-in and saved-work resume.

[Open the approved design](http://127.0.0.1:6007/iframe.html?id=identity-sign-in--review&viewMode=story). No account is required. This is a local Storybook link and requires that server to be running. `/student` on local port 3000 is the real composition with identity deliberately disabled, so it shows service unavailability. Do not ask the user to authenticate there for a design review.

## Verification and revision identity

Reviewed source matched SHA-256 `11e84c0e40ae915886a874343b5f32f3ddd9eb36b9b79dfb4a39946a933c15ef` before registration. After approval-only story tags, review labels and token comment updates, the source fingerprint is `ff1729e6cebc20580880c66c45bd3346907faa4056c46373fa5343150827bb34` (sorted paths + NUL + bytes + NUL across both sign-in directories). Layout, form behavior, auth and persistence were not changed in this approval turn.

Fresh approval-turn checks: 12 focused Chromium story/interaction/axe checks passed across two files; scoped ESLint, formatting, local document targets, whitespace and source-fingerprint verification passed. Earlier implementation evidence, not rerun in this approval turn: 132 unit tests, 43 local PostgreSQL integration tests including the built virtual-passkey/saved journey, five built UI checks, typecheck and Next/Storybook builds. See the design contract for exact limits and initial corrections. No full suites, new image baselines, physical devices/Safari, manual screen reader, remote CI or deployment was performed for this registration.

## Remaining work and stop point

- **Stop here.** D08 is dependency-ready but explicitly on hold until the user resumes it. Do not start D08, D09 or another roadmap implementation as part of this handoff.
- When resumed, D08 is the next planned slice: authorized guardian result projection matching committed attempts, unfinished-score withholding, ownership tests and review of the existing In Review guardian-results design. Read its contract and current ledger first.
- D09 still owns missing public Nexai artwork in standalone saved-exercise output. Sign-in has no missing image dependency. Do not claim the whole built learning journey visually complete.
- Guardian auth routes, landing page, final password/code choice, enrollment/recovery UI, hosted identity and physical-device release checks remain separate work. No public admin entry was added.
- Preserve the existing dirty working tree and unrelated work. No commit, push, remote migration, real learner data or live AI was introduced by this approval registration.
