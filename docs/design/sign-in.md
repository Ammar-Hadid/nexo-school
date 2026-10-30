# Shared sign-in — D07-UI revision 2

**25 October D04-M1 follow-up:** real guardian password/TOTP/setup/recovery and student enrollment now compose this approved layout. The new controls are **In Review**, not additional visual approval. See the [portal contract](../engineering/local-portal-access.md). Earlier concept-only limitations below describe the 21 October slice.

**21 October 2026: Implemented, Tested, Approved.** The user requested a showcase-quality shared sign-in page for students and guardians, with replaceable authentication methods. This supersedes the bare D07 heading/button presentation. The user explicitly approved this design and requested shared-system registration: “Approve this design, register it in our shared system, dont move on to D08 yet, make the handof”. D08 must not start until the user resumes it. See the [D07 handoff](../../tasks/d07-handoff.md).

## Review and intended experience

Open Storybook `identity-sign-in--review`. The review toolbar switches learner/parent context, device/password/code presentation and device loading/error/unavailable states. It is review tooling, never a role switch or authentication mechanism. `components-sign-in-layout--layout` and `--feedback` expose the reusable layout and notices separately.

Desktop uses a spacious two-column composition: cornflower learning panel and restrained stationery artwork beside a focused sign-in form. On narrow screens the form comes first; the welcome panel follows and decorative artwork is hidden. The approved purple/cornflower palette and Outfit typography remain authoritative. The small brand mark, stationery illustration, layout, copy and sign-in tokens are approved as used in this sign-in revision; this is not a separate company-wide identity redesign. No new Nexai artwork or messages are introduced; the shared page does not place Nexai in guardian context.

The public contexts are “Voor leerlingen” and “Voor ouders”. There is no admin entry. A future landing page can link into these contexts; it is not implemented here. There are no nonfunctional landing, registration, recovery or support links. Help expands in place with guidance matching the displayed method.

## Ownership and reuse

- `src/components/sign-in-layout/`: presentation-only `SignInLayout` with form/help/footer slots, neutral artwork and `SignInNotice`. No domain or server imports. Approved revision-specific geometry and color aliases live in `sign-in.tokens.css`; existing palette values are unchanged.
- `src/modules/identity/sign-in/sign-in-page.tsx`: student/guardian copy and composition. `DeviceSignIn` is the current method adapter; the shared page itself does not require passkeys or particular input fields. Existing Button and TextField are reused unchanged.
- `src/modules/identity/sign-in/sign-in-review.tsx`: Storybook-only controls and password/code concept forms. They validate locally, never send or persist input, and explicitly report that nobody was signed in. These methods and their recovery/enrollment flows remain unchosen and unimplemented.
- `src/modules/practice/saved/student-home.tsx`: actual `/student` signed-out composition. Existing Better Auth passkey authority is retained. A 401 exposes the sign-in option; other failed reads/network errors show an availability notice and retry. Pending checks/sign-in prevent duplicate activation. Authenticated task rendering is unchanged. No guardian route or new authentication provider is claimed.

## Accessibility and review limits

One main landmark and h1, explicit context, labelled native fields, keyboard skip link, disclosure help, live feedback, visible focus and reduced-motion-safe static artwork. Loading retains button focus and blocks activation. Code is a single labelled field supporting paste; concept password visibility is an explicit button. Decoration is hidden from assistive technology. Narrow layouts retain all sign-in controls without horizontal scrolling.

## Verification — 21 October 2026

On Node 24.22.0:

- Root lint and typecheck passed; Next production and Storybook builds passed.
- 132 unit/tooling tests in 27 files passed.
- 12 focused Chromium Storybook interaction/axe checks in two files passed, covering role/method switching, notices, pending activation, retry, concept input validation and password visibility.
- `npm run test:saved`: all 43 PostgreSQL integration tests in four files passed, including actual built passkey sign-in, task opening, saved responses, browser/server restart and resume. Six migrations installed and replayed in a disposable local database.
- Five focused built Playwright checks passed: keyboard skip/focus/help, zero axe violations and no page errors at 320/768/1024/1440px, plus disabled-service retry with no sign-in action. These use mocked 401 responses only for signed-out presentation; real auth evidence is the separate saved-journey suite.
- Inspected desktop/student/guardian and phone screenshots, plus final guardian password concept at 320/768/1024/1440px with no horizontal overflow. Restarted the identity-disabled local app on port 3000 and visually checked its unavailable state, loaded Outfit font and absence of page exceptions. The interactive design review stays on port 6007, with no account required.
- Changed-file formatting, new-document links and whitespace checks passed. Source fingerprint over sorted paths + NUL + bytes + NUL for the two sign-in folders: `11e84c0e40ae915886a874343b5f32f3ddd9eb36b9b79dfb4a39946a933c15ef`.

Initial check corrections: Storybook role-query typing was corrected; exercising a native skip-link navigation inside Vitest disconnected its browser, so the actual navigation is tested in built Playwright and the story checks keyboard focus. A supplementary ad hoc axe script conflicted with Storybook's own axe run; the repeatable story and built-app suites above are the accessibility evidence. Its review-toolbar landmark finding was corrected with a labelled region. Existing Storybook module-directive/build-timing and pg deprecation warnings remain.

User visual approval was explicitly given on 21 October 2026. Password/code presentation approval does not select either authentication method or authorize its backend. No full Storybook/E2E suite, visual baselines, physical devices/Safari, manual screen-reader or remote CI run is claimed. D09's existing saved-exercise Nexai packaging issue is unchanged; this sign-in page has no missing image dependency. No release, live user accounts, remote migrations, new authentication-method decision or educational approval is part of this change.

## Approval registration and handoff — 21 October 2026

The reviewed source fingerprint above was confirmed before registration. Only Storybook tags, review status labels and the token status comment changed to reflect explicit user approval; the registered source fingerprint is `ff1729e6cebc20580880c66c45bd3346907faa4056c46373fa5343150827bb34` using the same algorithm. Fresh registration checks: 12 focused story/interaction/axe checks passed, with scoped lint, formatting, local links and whitespace checks. Runtime/authentication tests and builds above remain the preceding implementation evidence and were not repeated for status-only changes. [Handoff and explicit D08 hold](../../tasks/d07-handoff.md).
