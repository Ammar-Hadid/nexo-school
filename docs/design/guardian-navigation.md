# Guardian navigation — revision 1

Status: **In Review**, 17 October 2026. The user authorized a header/sidebar review page and both iPhone navigation alternatives. Neither navigation option nor the shell composition is approved yet.

Open **Components → Guardian navigation → Review Page** in Storybook. Separate Desktop, Iphone Bottom and Iphone Menu stories allow focused inspection. The page reuses the approved Button, Purple & Cornflower palette and Outfit typography. Example learning content is synthetic context, not an implemented dashboard or approved education workflow.

## Contract and choices

- `GuardianNavigation` owns disclosure state and renders a header, sidebar and optional mobile bottom navigation. Its host supplies `current`, `onNavigate`, `hrefFor`, `children`, an optional landmark `label`, and `initiallyExpanded`. `mobileNavigation` selects `bottom` or `menu`. No route, authentication, persistence or API integration is implemented in this review.
- Desktop starts collapsed by default; the review page starts expanded to show the sidebar. Selecting a destination collapses it. This is a proposed interaction for review, not a previously approved preference beyond collapsibility.
- Destinations: Overzicht, Weekplanning, Voortgang, Instellingen and Beheer. Beheer remains a distinct destination. The account shortcut opens Instellingen. No fabricated notification counter, search or learner switcher.
- At container widths up to 43rem, the menu replaces the content area. It is a nonmodal disclosure, not an overlay. The header remains available. The bottom variant provides Overzicht, Planning, Voortgang and Meer; Meer exposes the complete navigation including Instellingen/Beheer. Both options reach all five destinations.
- Header and bottom bar remain visible while content scrolls. Proposed dimensions and colors are centralized in `navigation.tokens.css`; the bounded review shell height is editable there. Phone tabs use proposed 13px labels to fit four destinations; main sidebar navigation retains approved 18px type. Product viewport integration remains later work.
- Selected links expose `aria-current="page"`, with a colored surface and edge. Native anchors preserve supplied destinations and modified-click behavior; review callbacks show local sample pages. The host must provide actual routes before application use.
- Toggle buttons expose expansion and panel IDs. Opening focuses the first link; Escape, selecting a destination and closing return focus to the trigger. The disclosure does not trap focus. Each preview has uniquely named landmarks. Scrollable content is keyboard focusable. Hidden panels leave the accessibility tree.
- No animated transitions are introduced. Forced-color selection outlines supplement the selected state. No new dependency or stack change.

## Evidence and revision

SHA-256: `fc9f14d7fc5dcebcaa0e4c1eab0539218ac823092e2fbcff859803fdb0486945`. Reproduce by sorting all direct files in `src/components/guardian-navigation/`, then hashing each relative UTF-8 path, NUL, file bytes and NUL in order. Approved shared dependencies are referenced through existing tokens and Button imports, not copied.

Lint and strict typecheck passed. All **15 Chromium Storybook tests** passed, including the six navigation stories and keyboard/Escape/focus-return, current-destination, bottom navigation and Beheer reachability checks. Axe passes for all stories. Storybook production build passed with the existing upstream bundle/directive warnings. Initial accessible-name and duplicate-landmark issues were corrected before the passing run.

Visually inspected at 320, 768, 1024 and 1440px, with no page horizontal overflow. Narrow tab labels were adjusted after inspection. Desktop open/closed and both mobile menu presentations were exercised. Physical iPhone/Safari, screen readers and forced-color emulation were not tested. No new approved visual baseline was created. Next.js build and foundation E2E were not rerun: the review is Storybook-only and no app routes were changed.

## Review decision still needed

Review the header/sidebar styling and collapsed/open behavior, and choose the iPhone bottom bar or menu approach. Dashboard content shown here is illustrative; its detailed design is a separate step.
