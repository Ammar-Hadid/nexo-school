# nexo School color palette

## Approval and scope

On 17 October 2026 the user approved **Plum & Cornflower** after reviewing the palette and a static student practice-page mockup: “okay approved, put it in tokens so that I can change it antime I want tho”. This approves the color direction and authorizes central editable tokens. The static page is a visual reference; it does not establish implemented components, educational functionality, responsive behavior or approved component contracts.

**Current approved palette:** the user subsequently requested a lighter purple. The live primary primitive is now `--palette-purple: #8759A6`, replacing `--palette-plum: #633B66`. On 17 October 2026 the user approved this lighter purple and the buttons: “okay this purple looks better, approved. approve the buttons too and save it in our design system.” The original plum approval remains historical. Application, Storybook, button states, links and focus references consume the updated central tokens.

Historical references, preserved without modification (they show the former plum):

- [Palette board](references/plum-cornflower-palette.png), SHA-256 `34408cc25c65e340152c1b09fdb3a544efea626a5c19c21207583540783cf0cf`.
- [Student practice page](references/student-practice-color-reference.png), SHA-256 `bae895b40297dec25240ae824fd0291a6d3ae388474a21756be83caf559ba11d`.

Generated images illustrate the direction. The specified hex values below define the current live colors; do not sample pixels or copy incidental shading, blue link text or extra illustration colors from the mockup.

## Editing the palette

Edit the six `--palette-*` values at the top of [tokens.css](../../src/styles/tokens.css). These are the live source of truth. Both the Next.js application and Storybook import that file through `globals.css`; changes appear on reload during development and in the next build when deployed. No settings screen or database is needed.

| Primitive              | Current value | Intended use                               |
| ---------------------- | ------------- | ------------------------------------------ |
| `--palette-purple`     | `#8759A6`     | Primary actions, links and focus           |
| `--palette-cornflower` | `#93B4F4`     | Supporting accents                         |
| `--palette-blush`      | `#F3EAF0`     | Soft surfaces                              |
| `--palette-ivory`      | `#FCFAF7`     | Page background                            |
| `--palette-ink`        | `#302633`     | Reading text                               |
| `--palette-white`      | `#FFFFFF`     | Raised/content surfaces and text on purple |

Components use the `--color-*` semantic aliases in the same file, rather than raw hex values or palette names. For example, use `--color-action-primary` with `--color-on-action-primary`, and `--color-accent` with `--color-on-accent`. Change a primitive to update all its uses; change a semantic mapping to update only that role. The Button now has `--button-*` tokens for dimensions and state treatments; these derive colors from the same palette.

Open **Foundation → Color palette → Approved Colors** in Storybook to inspect swatches and text pairings. The preview consumes the live tokens, so it follows edits automatically. Its layout is documentation, not an approved product component.

## Color meaning and readability

Green is reserved for correct-answer feedback, following the user's explicit preference. Pair correctness with text and an icon, not color alone. A green shade and other functional status colors remain to be designed with their actual feedback components. Do not use the blue accent as a correctness signal.

Calculated sRGB contrast for the current solid-color pairs:

| Foreground / background | Ratio   |
| ----------------------- | ------- |
| Ink / Ivory             | 13.89:1 |
| Ink / White             | 14.48:1 |
| Ink / Blush             | 12.30:1 |
| Ink / Cornflower        | 6.95:1  |
| White / Purple          | 5.24:1  |
| Purple / Ivory          | 5.03:1  |

Use Ink on Cornflower, and the derived `--color-text-accent` for links and small colored labels on light or blush surfaces. The brighter primary Purple is intended for fills; its contrast on Blush is only 4.45:1, so do not use it for small text on Blush. Cornflower is an accent fill, not small text on Ivory or White. Purple text on Cornflower measures 2.51:1, so use the prescribed Ink pairing for body text. Recheck contrast after editing colors, including actual focus and component states. Forced-colors mode retains the operating system's focus color. These pair calculations do not certify the full UI's accessibility.

Typography and Button revision 4 (including shape, spacing and states) are approved and adopted; other components remain subject to their own review. Button outline/subtle labels use a darker purple/ink-derived text token to retain contrast over tinted pressed backgrounds.

## Historical verification — original palette adoption, 17 October 2026

Formatting, lint, strict typecheck, all six unit/boundary checks, all three Storybook render/accessibility checks, Next.js and Storybook production builds, and all four existing responsive/shared-style E2E checks passed after token adoption. Existing Storybook bundle/directive warnings remain as documented in the tooling risk record. No new product components, dependency changes or security behavior were introduced. Hosted CI, physical-device checks and visual baseline approval were not run for this palette change.

## Current lighter-purple verification — 17 October 2026

All nine Chromium Storybook tests including axe, lint, strict typecheck, and Next.js/Storybook production builds passed. The trial required a darker derived text accent for small labels on blush; the primary fill remains the lighter purple. Physical-device checks and foundation E2E were not rerun. The user subsequently approved this palette; test evidence does not imply full accessibility certification.
