# Guardian navigation — revision 1

**28 October 2026 amendment:** this document remains the approved classic revision. Current Guardian portal screens use the user-requested R3 replacement via `appearance="workspace"`: expanded desktop rail with manual collapse, six destinations, mobile bottom navigation plus Meer, and focus to the destination heading. R3 was **Approved by the user on 28 October 2026**. See the [Guardian visual language](guardian-visual-language.md) and [implementation record](guardian-portal-r3.md). The classic implementation and specimens remain available for their existing consumers; this is not a student-navigation redesign.

Status: **Approved — desktop header/sidebar and iPhone option A (bottom navigation)**, 17 October 2026. The user explicitly said: “I like option A with the bottom navigation for iphone. approve that and the desktop header and sidebar, save them in our design system.” Option B is an unselected comparison, not an approved product alternative.

Open **Components → Guardian navigation → Review Page** in Storybook. Separate Desktop, Iphone Bottom and Iphone Menu stories allow focused inspection. The page reuses the approved Button, Purple & Cornflower palette and Outfit typography. Example learning content is synthetic context, not an implemented dashboard or approved education workflow.

## Contract and choices

- `GuardianNavigation` owns disclosure state and renders a header, sidebar and optional mobile bottom navigation. Its host supplies `current`, `onNavigate`, `hrefFor`, `children`, an optional landmark `label`, and `initiallyExpanded`. `mobileNavigation` selects `bottom` or `menu`. No route, authentication, persistence or API integration is implemented in this review.
- Desktop starts collapsed by default; the review page starts expanded to show the sidebar. Selecting a destination collapses it. This reviewed behavior is included in the desktop approval.
- Destinations: Overzicht, Weekplanning, Voortgang, Instellingen and Beheer. Beheer remains a distinct destination. The account shortcut opens Instellingen. No fabricated notification counter, search or learner switcher.
- At container widths up to 43rem, the menu replaces the content area. It is a nonmodal disclosure, not an overlay. The header remains available. The bottom variant provides Overzicht, Planning, Voortgang and Meer; Meer exposes the complete navigation including Instellingen/Beheer. Both options reach all five destinations.
- Header and bottom bar remain visible while content scrolls. Approved navigation dimensions and colors are centralized in `navigation.tokens.css`; the bounded review shell height is editable there. Phone tabs use approved component-specific 13px labels to fit four destinations; main sidebar navigation retains approved 18px type. Product viewport integration remains later work.
- Selected links expose `aria-current="page"`, with a colored surface and edge. Native anchors preserve supplied destinations and modified-click behavior; review callbacks show local sample pages. The host must provide actual routes before application use.
- Toggle buttons expose expansion and panel IDs. Opening focuses the first link; Escape, selecting a destination and closing return focus to the trigger. The disclosure does not trap focus. Each preview has uniquely named landmarks. Scrollable content is keyboard focusable. Hidden panels leave the accessibility tree.
- No animated transitions are introduced. Forced-color selection outlines supplement the selected state. No new dependency or stack change.

## Evidence and revision

SHA-256: `fc9f14d7fc5dcebcaa0e4c1eab0539218ac823092e2fbcff859803fdb0486945`. Reproduce by sorting all direct files in `src/components/guardian-navigation/`, then hashing each relative UTF-8 path, NUL, file bytes and NUL in order. Approved shared dependencies are referenced through existing tokens and Button imports, not copied.

Lint and strict typecheck passed. All **15 Chromium Storybook tests** passed, including the six navigation stories and keyboard/Escape/focus-return, current-destination, bottom navigation and Beheer reachability checks. Axe passes for all stories. Storybook production build passed with the existing upstream bundle/directive warnings. Initial accessible-name and duplicate-landmark issues were corrected before the passing run.

Visually inspected at 320, 768, 1024 and 1440px, with no page horizontal overflow. Narrow tab labels were adjusted after inspection. Desktop open/closed and both mobile menu presentations were exercised. Physical iPhone/Safari, screen readers and forced-color emulation were not tested. No new approved visual baseline was created. Next.js build and foundation E2E were not rerun: the review is Storybook-only and no app routes were changed.

## Approval scope

Revision 1 at commit `81dc482` is approved for the desktop header/sidebar and iPhone bottom bar, including its Meer disclosure. Retain option B only as historical comparison; new guardian screens should use option A. Dashboard example content, production routing/permissions, viewport integration and physical-device certification are outside this approval. No further approval is needed to reuse the approved navigation contract.

Approval bookkeeping updates only review-page labels and the token-file comment, without changing component behavior or styling. Current source fingerprint after those updates: `2067431394872daa73b26120500f4f9efca088a7a2703ee94477a7c3d653f1dc`. The original reviewed fingerprint above remains the approval reference.

Approval bookkeeping verification: all 15 Chromium Storybook tests passed after the label updates; formatting and `git diff --check` passed. No runtime changes or new device validation were introduced.

Historical terminology amendment (18 October 2026), superseded for Guardian/admin R3 on 28 October by **sessie/sessies** (student copy unchanged): at the user's explicit request, frontend labels now use **taak/taken** instead of sessie/sessies. This is a copy-only amendment to the approved component/examples; styles, navigation and action behavior are unchanged. Historical approval fingerprints remain recorded in the register.

D08 integration (21 October 2026): optional `accountLabel`, `contextNote` and `mainContent` props let a real route supply neutral account/context copy and use the existing content section as its main landmark. Existing defaults, layout, navigation behavior and revision 1 review specimens are preserved. The saved guardian host uses “Ouder” and “Je bekijkt opgeslagen taakresultaten.” instead of preview names; see the [D08 contract](../engineering/guardian-results.md). These internal composition options do not approve the new saved-result screen.
