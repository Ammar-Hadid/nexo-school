---
name: nexo School — Guardian R3 only
description: "Extracted Guardian-only overlay for [data-guardian-ui='r3']; Approved 28 October 2026; never a student or whole-app theme."
colors:
  guardian-primary: '#8759a6'
  guardian-primary-text: 'color-mix(in srgb, #8759a6 80%, #302633)'
  guardian-canvas: '#fcfaf7'
  guardian-surface: '#ffffff'
  guardian-ink: '#302633'
  guardian-muted: 'color-mix(in srgb, #302633 74%, white)'
  guardian-line: 'color-mix(in srgb, #302633 13%, white)'
  guardian-tint: 'color-mix(in srgb, #8759a6 8%, white)'
  guardian-blue-tint: 'color-mix(in srgb, #93b4f4 12%, white)'
  guardian-blue-ink: 'color-mix(in srgb, #93b4f4 42%, #302633)'
  guardian-chart-fill: 'color-mix(in srgb, #8759a6 28%, white)'
  positive-text: '#17633a'
  positive-surface: 'color-mix(in srgb, #26834f 8%, #ffffff)'
  warning-text: '#884000'
  warning-surface: 'color-mix(in srgb, #ed8a23 10%, #ffffff)'
  negative-text: '#9f2430'
  negative-surface: 'color-mix(in srgb, #cc3541 7%, #ffffff)'
  action-danger: '#cc3541'
typography:
  display:
    fontFamily: "'Nexo Outfit', system-ui, sans-serif"
    fontSize: 'clamp(2rem, 1.75rem + 1vw, 2.5rem)'
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '-0.035em'
  title:
    fontFamily: "'Nexo Outfit', system-ui, sans-serif"
    fontSize: '1.375rem'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-0.025em'
  body:
    fontFamily: "'Nexo Outfit', system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  control:
    fontFamily: "'Nexo Outfit', system-ui, sans-serif"
    fontSize: '0.9375rem'
    fontWeight: 600
    lineHeight: 1.6
  label:
    fontFamily: "'Nexo Outfit', system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
  status:
    fontFamily: "'Nexo Outfit', system-ui, sans-serif"
    fontSize: '0.8125rem'
    fontWeight: 500
rounded:
  panel: '0.75rem'
  control: '0.5rem'
  status: '0.375rem'
spacing:
  space-2: '0.5rem'
  space-4: '1rem'
  space-6: '1.5rem'
  space-8: '2rem'
  guardian-gap: '1.25rem'
  guardian-panel-padding: '1.5rem'
  guardian-gutter: 'clamp(1rem, 2.5vw, 2.5rem)'
components:
  button-primary:
    backgroundColor: '{colors.guardian-primary}'
    textColor: '{colors.guardian-surface}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '0.375rem 1rem'
  button-outline:
    backgroundColor: '{colors.guardian-surface}'
    textColor: '{colors.guardian-primary-text}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '0.375rem 1rem'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.guardian-primary-text}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '0.375rem 1rem'
  button-secondary:
    backgroundColor: 'color-mix(in srgb, #93b4f4 22%, #ffffff)'
    textColor: '{colors.guardian-ink}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '0.375rem 1rem'
  button-danger:
    backgroundColor: '{colors.action-danger}'
    textColor: '{colors.guardian-surface}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '0.375rem 1rem'
  field:
    backgroundColor: '{colors.guardian-surface}'
    textColor: '{colors.guardian-ink}'
    rounded: '{rounded.control}'
    padding: '0.5rem 0.75rem'
  navigation-current:
    backgroundColor: '{colors.guardian-tint}'
    textColor: '{colors.guardian-primary-text}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '0.625rem 0.875rem'
  status-neutral:
    backgroundColor: '{colors.guardian-tint}'
    textColor: '{colors.guardian-primary-text}'
    typography: '{typography.status}'
    rounded: '{rounded.status}'
    padding: '0.25rem 0.625rem'
  panel:
    backgroundColor: '{colors.guardian-surface}'
    textColor: '{colors.guardian-ink}'
    rounded: '{rounded.panel}'
    padding: '{spacing.guardian-panel-padding}'
  feedback-positive:
    backgroundColor: '{colors.positive-surface}'
    textColor: '{colors.positive-text}'
    rounded: '{rounded.control}'
    padding: '1rem 1.25rem'
---

# Design System: nexo School — Guardian R3 only

## Overview

**Creative North Star: "A calm parent workspace"**

This is an extracted **Guardian-only overlay**, limited to `[data-guardian-ui='r3']`. It documents the implemented D04-R3 interpretation of the user's five sketch renders: warm paper, white panels, readable ink, quiet boundaries and a clear purple action. The phrase above describes that established direction; it is not a new brand decision. The R3 visual system was **Approved by the user on 28 October 2026**, including adoption for future Guardian functionality.

The [Guardian visual language](docs/design/guardian-visual-language.md) owns direction and behavior; [Guardian tokens](src/styles/guardian.tokens.css) and [shared primitives](src/styles/tokens.css) own runtime values. This frontmatter is their extracted snapshot, with CSS variable dependencies expanded for portability; update it and the [sidecar](.impeccable/design.json) together after an authorized source change. It is not another editable token source. The [implementation record](docs/design/guardian-portal-r3.md) owns the surface map. Product truth remains in the [MVP scope](docs/product/mvp-scope.md), [release coverage](docs/product/private-release-coverage.md) and [delivery roadmap](tasks/delivery-roadmap.md); there is no new product canon here.

**The Guardian Boundary Rule.** Apply these values only inside the Guardian R3 scope. Student pages, Nexai, learner typography, exercise feedback and their existing approval contracts remain separate. A root-level filename does not expand this overlay to the whole application.

**Key Characteristics:**

- Warm canvas, white surfaces and fine neutral separators.
- Stable navigation, compact rows and job-specific compositions.
- Purple commitments and selected states; labelled status and subject identity.
- Visible location, acknowledged outcome, honest recovery and a useful next step.

## Colors

The palette uses the existing Purple & Cornflower primitives with softer Guardian surface and border aliases.

### Primary

**Warm purple** identifies primary commitments, selection and keyboard focus. **Deep purple text** supports links and selected navigation; **pale purple** supports local emphasis. The frontmatter retains the source `color-mix()` formulas rather than introducing rounded hex approximations.

### Secondary

**Cornflower mist** supports informational explanations and the Taal/Begrijpend Lezen icon tiles; **cornflower ink** keeps those icons legible. Supporting tints do not replace text labels.

### Neutral

**Ivory canvas**, **white surface**, **deep ink**, **muted ink** and **fine neutral line** separate page, panel, content and supporting information. Panel boundaries use the neutral line rather than a purple outline.

### Named Rules

**The Meaningful Color Rule.** Status combines text and an icon where appropriate: green for positive progress, orange for an urgent learning blocker, red for negative or flagged states. A subject tint identifies the subject and makes no judgment about performance.

## Typography

**Display Font:** locally hosted Nexo Outfit, with system-ui and sans-serif fallbacks.
**Body Font:** the same Outfit family. Lexend remains governed by learner-specific contracts.

Page headings use the `display` role; panel headings use `title`; body, control, label and status roles retain the extracted frontmatter values. Small navigation labels are denser than the student scale. The page title becomes `2rem` at the narrow breakpoint. Counts and scores use tabular numerals. The Guardian reading-detail passage uses normal body size, `1.8` line height and a `65ch` maximum measure; this does not change learner reading layout.

## Layout

The workspace has a `4.25rem` white header, an initially expanded `15rem` sidebar, and content capped at `90rem`. The sidebar can collapse to `5rem`. Gutters, panel padding and gaps use the frontmatter's Guardian spacing aliases.

Composition follows the job: Today has one attention strip with task/result columns; Progress pairs a chart and subject summary; Results moves from a compact list to evidence; Oefenmateriaal pairs a queue with preview; Settings uses section navigation and grouped forms. These are related compositions, not a requirement to use the same grid everywhere.

At the `55rem` workspace container breakpoint the sidebar narrows to `12.5rem`. At `43rem`, navigation becomes a bottom bar with Meer, the header becomes `4rem`, content uses `1rem` side padding and panels use `1rem` padding. Feature media queries at `76rem`, `55rem` and `43rem` stack their own layouts in reading order. Long text wraps; a wide table may scroll within its labelled region, never by widening the page.

## Elevation & Depth

Depth comes from the ivory/white surface relationship, a single fine border and restrained semantic tints. Panels have no ambient drop shadow. The selected material queue row uses an inset `1px` purple stroke as selection emphasis, not elevation.

## Shapes

Panels use the `panel` radius; controls and subject tiles use `control`; status labels use `status`. Avatars remain circular. Avoid nested decorative panels, heavy shadows and purple outlines on every panel: these are explicit rejections in the Guardian direction.

## Components

### Buttons

Reuse [Button](src/components/button/button.tsx) and its existing primary, secondary, outline, ghost and danger variants. Guardian scope supplies compact geometry: small and medium actions have a `2.75rem` minimum height. Frontmatter component padding describes the small size; medium keeps `0.625rem 1.125rem`. Primary is purple, outline is white with a purple border, ghost is transparent, secondary uses a cornflower tint and danger retains its established red semantics. A link navigates; a button changes state.

Existing hover/pressed/loading/disabled behavior remains in [Button styles](src/components/button/button.module.css). Guardian focus is a visible `2px` purple outline with `3px` offset. Button transitions remain `140ms ease`; workspace transitions use `160ms ease-out`, with reduced-motion suppression. No information depends on motion.

### Inputs / Fields

Native labelled fields use a white surface, neutral border, control radius and `2.75rem` minimum height. Preserve native validation and host-owned error/disabled behavior. The scoped focus rule applies to inputs, selects and textareas. Use [workspace field styles](src/modules/guardian/guardian-workspace.module.css) or the existing host form component; keep failure explanation and retry next to the affected work.

### Navigation

[GuardianNavigation](src/components/guardian-navigation/guardian-navigation.tsx) selects the new shell through `appearance="workspace"`; [GuardianWorkspaceNavigation](src/components/guardian-navigation/guardian-workspace-navigation.tsx) applies the scope. It has real links, current-page semantics, a keyboard skip link, desktop collapse, bottom navigation and a reachable Meer menu. Focus moves to the destination heading and returns appropriately when closing navigation/detail. The classic specimen remains available for historical approved references.

### Chips and panels

[GuardianStatus, GuardianPanel and GuardianPageHeading](src/components/guardian-ui/guardian-ui.tsx) provide repeated status, container and title treatments. Status labels are informational, not substitute buttons. Use rows and separators for repeated records. Panel actions belong with the panel heading rather than creating an extra ornamental container.

### Question and answer details

For question and submitted-answer details, use the [approved Guardian pattern](docs/design/guardian-visual-language.md#question-and-answer-details) (revision 1, 29 October 2026) across all subjects/categories. Reuse `GuardianResultBrowser` for result views. Its quiet prompt surface, restrained attempt cards and secondary explanation are mandatory for future Guardian implementations of this content.

### Outcome and recovery

[GuardianFeedback](src/components/guardian-ui/guardian-ui.tsx) provides persistent status receipts, failure alerts, optional real undo and a next action. [GuardianEmpty](src/components/guardian-ui/guardian-ui.tsx) explains absence/loading and accepts a real prerequisite action. Hosts own state and API confirmation: a visual success treatment cannot turn an uncertain response into a saved change.

### Permanent subject icons

[The single registry](src/components/guardian-ui/subject-icon.tsx) maps **Rekenen → Calculator**, **Taal → CaseSensitive**, **Spelling → Pencil**, **Begrijpend Lezen → BookOpen**. The default glyph is `22px` with `1.75px` stroke, in a `2.75rem` tile; compact labels use an `18px` glyph in a `2rem` tile. Icons are decorative beside visible subject names. **Redactiesommen is a Rekenen category and uses Calculator.** Do not add a fifth subject or substitute per-screen emoji.

### Progress

[ProgressChart](src/components/guardian-ui/progress-chart.tsx) uses Recharts with keyboard accessibility, an explicit first-attempt denominator, caption and readable data table. Chart animation is disabled. No data produces an honest empty state. Chart values and scores describe observed work; they do not certify mastery.

## Do's and Don'ts

### Do:

- **Do** scope every R3 use to `[data-guardian-ui='r3']` and reuse the canonical CSS and shared Guardian components.
- **Do** preserve visible location, acknowledged outcome, honest reversal or recovery, and the next useful action.
- **Do** keep all original attempts, complete reading context and reachable operational detail.
- **Do** retain visible labels, keyboard focus, meaningful states and at least 44px action targets.
- **Do** label fictitious memory-only examples and distinguish them from authenticated saved work.

### Don't:

- **Don't** apply this root document as a student or whole-app theme.
- **Don't** infer approval of new visual patterns, backend functionality or educational content from R3’s visual approval.
- **Don't** imply undo for irreversible publication, withdrawal or browser revocation.
- **Don't** replace permanent subject icons, promote Redactiesommen to a subject, or use color alone to identify meaning.
- **Don't** invent trends, confidence, mastery, surveillance signals or missing results to match a sketch.
- **Don't** hide capabilities behind decoration or force every screen into the same card grid.

Guardian learning activities are called **sessie / sessies**, including future pages. See the [canonical terminology and adoption rules](docs/design/guardian-visual-language.md#guardian-terminology); student labels and internal task identifiers are unchanged.
