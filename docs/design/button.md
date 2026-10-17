# Button review — revision 1

Status: **In Review**, 17 October 2026. The user requested a review page showing a button style with its variants and states. No button styling has been approved yet.

Open **Components → Button → Review Page** in Storybook. The page uses the actual shared `Button`, approved colors and shared Outfit typography. All copy is Dutch. This is a component workbench, not a guardian screen or live save/delete workflow.

## Proposed contract

- Variants: `primary` (plum), `secondary` (cornflower), `outline`, `ghost`, `danger`.
- States: default, hover, active/pressed, focus-visible, busy, disabled. The state sheet pins visual pseudo-states through `data-preview`; application use relies on real CSS pseudo-classes. The interactive demo also shows a native `aria-pressed` toggle.
- Sizes: `small`, `medium` (default), `large`; minimum heights 44/48/56px with the approved 18px/600 Outfit button type. Long labels wrap and grow the button.
- Optional start/end decorative icons, full width and icon-only presentation. The icon-only prop requires `aria-label` in TypeScript.
- Native button attributes, ref and event props are forwarded. Default type is `button`, so using it inside a form does not accidentally submit. Consumers explicitly select `submit` when needed.
- Busy buttons retain their accessible label, dimensions and focus; expose `aria-busy` and `aria-disabled`; and block click/keyboard-generated activation. A consumer supplies contextual live feedback, as shown in the demo. This UI guard is not a substitute for server idempotency.
- Native disabled buttons leave the tab order. Explicit `aria-disabled` buttons remain focusable but cannot activate through the click handler. Selection is consumer-owned through `aria-pressed`.
- The spinner and transitions respect reduced motion. Focus uses the shared outline tokens; forced-color styling preserves visible boundaries.
- Errors/success belong in contextual feedback, not generic red/green button result variants. Green remains reserved for correct answers.

Editable proposal tokens live in `src/styles/tokens.css`: `--button-*`, `--color-action-danger` and `--color-on-action-danger`. The 12px radius and red `#a3343e` are new proposals, not prior palette approvals. No new dependency was introduced. Font loading and approved typography were promoted from the specimen into shared globals, so Storybook and application use the same source.

## Review revision and evidence

Content fingerprint SHA-256: `486bd132c0fc4620ac545fccb6553ef0c114db607f4ec80681a724941453135f`. Reproduce by sorting all files directly inside `src/components/button/` plus `src/styles/tokens.css`, `src/styles/fonts.css`, and `src/styles/globals.css`, then hashing the concatenation of each relative UTF-8 path, a NUL byte, file bytes and a NUL byte. Any source change invalidates this review revision.

Stories: `components-button--review-page`, `--playground`, `--interaction-checks`, `--native-behavior`.

Verification: lint and strict typecheck passed; eight Chromium Storybook tests including axe checks passed; application and Storybook production builds passed; four existing foundation E2E checks passed following shared font adoption. Storybook retains the documented upstream bundle/directive warnings. Interaction coverage includes focus retention, repeated keyboard activation during loading, selected-state toggling, disabled controls, default non-submitting behavior and explicit form submission. An initial demo wait timeout, a specimen-only text contrast override and a test-only anchor navigation were corrected before the final passing run.

Visually inspected the review at 320, 390, 768, 1024 and 1440px, with no horizontal overflow. Measured single-line size samples at 44/48/56px. Physical Safari/Android, screen-reader and forced-color/reduced-motion emulation checks were not run; CSS handling is present but not certification. No visual-regression baseline was approved or generated.
