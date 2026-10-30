# Guardian visual language — D04-R3

28 October 2026 · **Approved by the user on 28 October 2026.** Applies only to the Guardian portal. Student screens, Nexai, learner typography, exercises and scoring retain their existing contracts.

The user rejected the D04-R2 presentation and supplied five AI renders of their own sketches. Replace R2's frontend rather than polishing it. Preserve its useful interactions and all existing saved capabilities. The renders govern composition and feel, not invented data, logos, educational claims or incidental controls. The four standing questions are: **Where am I? What just happened? Can I undo it, and how? What should I do next?**

The unchanged [five source renders and their provenance](references/guardian-r3/README.md) are retained for future design work. The [implementation and verification record](guardian-portal-r3.md) distinguishes saved functionality from reference interactions.

## Approval and future adoption

The user explicitly approved R3: “this is perfect, I really like this”, and required the same language throughout the entire Guardian portal, including future pages and functionality. This approves the R3 visual system and current connected reference; it does not certify educational content, activate preview-only features or waive functional release gates.

Every new or revised Guardian/admin page must use `GuardianNavigation appearance="workspace"`, the scoped Guardian tokens, the shared Guardian UI components and the permanent subject-icon registry. Extend these shared components when a reusable pattern is needed. Do not introduce a page-specific theme, competing shell, alternate subject icons or copy the student design. Reuse the approved compositions as references while adapting layout to the job. Show new meaningful shared patterns in Storybook; verify desktop/phone layout, keyboard access and all four cues. Significant new visual patterns still need review; ordinary features inherit the approved language.

### Guardian terminology

Use **sessie / sessies** for a learner's assigned practice activity in the Guardian/admin interface: `Oefensessies`, `Bekijk sessie`, `Sessieresultaten`, `Sessie klaarzetten`. Use `oefening` or `vraag` for individual exercises/questions. This is presentation terminology, not a rename of stored assignments, API fields or authentication sessions. Display stored historical titles through the Guardian presentation adapter. Student wording stays unchanged; quote the literal student label **Mijn taken** when directing a parent to that screen. In English documentation call the activity a _practice session_ where confusion with sign-in sessions is possible.

## Visual grammar

- A quiet, warm canvas, white surfaces, fine neutral borders, deep readable ink. Purple identifies the primary action and selected navigation. Existing Plum & Cornflower primitives remain authoritative; Guardian aliases are scoped to `[data-guardian-ui='r3']` in `src/styles/guardian.tokens.css`.
- A slim white header, real wordmark, separated portal name and account access. Desktop navigation is visible initially, collapsible, and stays in a consistent place. Mobile keeps the approved bottom-navigation model and a reachable More menu.
- Outfit throughout the Guardian workspace. Strong 32–40px page titles, 20–24px panel titles, 16px body, 14px secondary labels. A denser control scale is a Guardian revision, not a change to student typography.
- Content spans the available workspace (maximum 90rem); approximately 24–40px page gutters. Panels use 20–24px padding, 12px corners and one border. No heavy shadows, purple outlines on every panel, nested ornamental cards or oversized empty hero regions.
- Compose for the job: Today uses one attention strip and a 3:2 task/result split; Progress uses a chart and subject summary; results use a readable evidence list/detail; material review uses a queue and preview; Settings uses section navigation and grouped forms. Do not force all screens into identical card grids.
- Use compact, aligned rows for repeated records, quiet separators, right-aligned quantities and tabular numerals. Reserve tinted areas for a selected item, a relevant status or a short explanation.
- Primary buttons are solid purple, secondary actions outlined or quiet. Use explicit verbs and at most one primary commitment per decision region. A link navigates; a button changes state. All visible controls work or explain a genuine unavailable prerequisite.

## Question and answer details

**Revision 1 · Approved by the user on 29 October 2026.** Explicit approval: “Okay, I approve this. Please add it to the shared design system so future implementations use this as well.”

Use this pattern whenever current or future Guardian/admin pages show questions and submitted answers, across Rekenen, Taal, Spelling and Begrijpend Lezen, including Redactiesommen within Rekenen:

- Give the question a quiet ivory surface. Keep its prompt and submitted values stronger than attempt labels and explanatory steps.
- Group each submitted attempt in a compact card with a fine neutral border, modest corners and no shadow or status-colored fill. Keep these cards subordinate to the enclosing page/panel.
- Separate the answer model and secondary explanation with a fine rule. Preserve question options, complete reading context, exact submitted text and the existing conditions for withholding solutions.
- Place attempts side by side only when the container allows readable text; stack them in narrow containers and wrap long answers without changing their content.

Reuse [GuardianResultBrowser](../../src/modules/guardian/results/guardian-result-browser.tsx) and its [shared workspace styles](../../src/modules/guardian/guardian-workspace.module.css), which already serve reference and saved results. Extend that domain-owned composition for new result functionality instead of copying its markup or inventing another result-card style. Keep this pattern scoped to Guardian/admin; student pages retain their own approved design. Significant visual changes require review.

Reference stories: `guardian-portal-design--results-preserve-evidence` and `guardian-portal-design--reading-context`, plus the saved-result stories. [Approval and verification record](component-approvals.md).

## Permanent subject identity

One registry in `src/components/guardian-ui/subject-icon.tsx` owns these mappings. Every use includes a visible text label or an accessible name; color is never the only identifier.

| Subject          | Lucide icon   | Supporting tint |
| ---------------- | ------------- | --------------- |
| Rekenen          | Calculator    | Purple          |
| Taal             | CaseSensitive | Cornflower      |
| Spelling         | Pencil        | Warm orange     |
| Begrijpend Lezen | BookOpen      | Blue            |

Redactiesommen is **Rekenen · Redactiesommen**, using the calculator. It is never a fifth subject. Icons have a consistent 1.75px stroke and 20–22px control size. Do not substitute emoji or different glyphs in individual screens. Status icons (check, clock, warning) describe state and are distinct from subject icons.

## Interaction contract

1. Location: active navigation, one clear page title, selected child/context, and a return action from detail. Restore focus to the originating control. Preserve drafts while moving within a workspace.
2. Outcome: distinguish draft, saving, saved, failed and uncertain. Confirm only acknowledged changes. Use persistent inline `role=status` receipts for consequential actions and `role=alert` for failures; retain the draft and offer retry.
3. Reversal: provide working undo when the underlying operation supports it. Otherwise explain the consequence before confirmation and the recovery path after it. Approval and publication are separate. Published history/attempts are never erased by withdrawal. Revoking a browser requires renewed enrollment; do not promise undo.
4. Next step: place the next useful action beside the outcome. Empty states explain the prerequisite and offer its real route. Avoid backend vocabulary in the primary flow; retain reachable operational detail.

Use modest 140–180ms color/opacity transitions, respect reduced motion, retain visible keyboard focus, 44px touch targets and correct labels. No information depends on animation, hover or color. At narrow widths collapse columns into their reading order, retain all controls and allow long text to wrap. Data tables may scroll locally with a visible label; the page itself must not overflow.

## Data and feature truth

Charts state what is measured, the denominator and period where available, with a readable data table. Scores are not mastery. Do not invent trend dates, speed, streaks, confidence percentages, surveillance/tab-switch signals or diagnoses from the render. Show a truthful empty state when data is missing. Incomplete/withdrawn tasks do not become scored progress evidence. Keep original reading context, attempts and withheld solutions intact.

The connected design reference uses clearly labelled fictitious data and memory-only interactions. Future recurring scheduling and flagged-task decisions remain reference interactions until their roadmap gates are met. The saved portal uses its existing authenticated APIs. No reset, real learner data, paid AI, remote changes or production deployment is part of this redesign.

## Research and dependency decision

Inspected the existing navigation, Button, TextField, attention, content review, supply, delivery, identity and saved-result implementations before rebuilding. Reuse their working state/API boundaries. R2's presentation files are replaced; the classic navigation remains available for previously approved historical specimens.

- [Nielsen Norman Group: system status](https://www.nngroup.com/articles/visibility-system-status/) supports immediate, understandable action feedback; [user control and freedom](https://www.nngroup.com/articles/user-control-and-freedom/) supports back, cancel and discoverable undo. Application here: explicit receipts and reversible local planning, with honest irreversible-access copy.
- [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html) inform accessible notifications and the permanent icon registry.
- [Lucide React](https://lucide.dev/guide/react/) provides typed, selectively imported SVG icons, matching the supplied outline language. Prefer it to growing a hand-maintained icon collection. Pin `lucide-react` 1.62.0.
- [Recharts](https://recharts.github.io/en-US/guide/installation/) provides React/SVG charts, responsive sizing and [keyboard accessibility enabled in v3](https://github.com/recharts/recharts/blob/main/storybook/stories/API/Accessibility.mdx). Prefer it here to lower-level [visx](https://visx.airbnb.tech/docs/xychart), which would require more chart interaction assembly. Pin Recharts 3.10.1 and matching React Is 19.3.1; supplement the chart with a table. No chart library is imported by the student portal.

These are implementation decisions, not claims of educational validation or accessibility certification. Executed evidence and remaining gaps belong in the D04-R3 ledger entry.
