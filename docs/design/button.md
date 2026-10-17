# Button review — revision 4

Status: **Approved**, 17 October 2026. The user explicitly approved the current purple and Button revision 4: “okay this purple looks better, approved. approve the buttons too and save it in our design system.” Approval covers the variants, sizes and states in the reviewed contract below.

Open **Components → Button → Review Page** in Storybook. The page uses the actual shared `Button`, approved Purple & Cornflower palette and shared Outfit typography. All copy is Dutch. This is a component workbench, not a guardian screen or live save/delete workflow.

## Proposed contract

- Variants: `primary` (purple), `secondary` (cornflower), `outline`, `ghost`, `danger`.
- States: default, hover, active/pressed, focus-visible, busy, disabled. The state sheet pins visual pseudo-states through `data-preview`; application use relies on real CSS pseudo-classes. The interactive demo also shows a native `aria-pressed` toggle.
- Sizes: `small`, `medium` (default), `large`; minimum heights 44/52/56px with the approved 18px/600 Outfit button type. Long labels wrap and grow the button.
- Optional start/end decorative icons, full width and icon-only presentation. The icon-only prop requires `aria-label` in TypeScript.
- Native button attributes, ref and event props are forwarded. Default type is `button`, so using it inside a form does not accidentally submit. Consumers explicitly select `submit` when needed.
- Busy buttons retain their accessible label, dimensions and focus; expose `aria-busy` and `aria-disabled`; and block click/keyboard-generated activation. A consumer supplies contextual live feedback, as shown in the demo. This UI guard is not a substitute for server idempotency.
- Native disabled buttons leave the tab order. Explicit `aria-disabled` buttons remain focusable but cannot activate through the click handler. Selection is consumer-owned through `aria-pressed`.
- The spinner and transitions respect reduced motion. Focus uses the shared outline tokens; forced-color styling preserves visible boundaries.
- Errors/success belong in contextual feedback, not generic red/green button result variants. Green remains reserved for correct answers.

Editable approved tokens live in `src/styles/tokens.css`: `--button-*`, `--color-action-danger` and `--color-on-action-danger`. The 6px radius and red `#cc3541` are included in the Button revision 4 approval. No new dependency was introduced. Font loading and approved typography were promoted from the specimen into shared globals, so Storybook and application use the same source.

## Review revision and evidence

User-reviewed source at commit `cd872be`, SHA-256: `fab77741edb8046c3c6838398f9bda53d07ef0c6b29d031586c9b16e9fffc162`. Reproduce by sorting all files directly inside `src/components/button/` plus `src/styles/tokens.css`, `src/styles/fonts.css`, and `src/styles/globals.css`, then hashing the concatenation of each relative UTF-8 path, a NUL byte, file bytes and a NUL byte. Approval bookkeeping subsequently changed only token comments and review-page status copy, with no component style, token value or behavior changes. Current source fingerprint: `4d8edcec632abff6252d6b57900f0b83be89cd3bcef80efbf291421a5c89f8d1`. Significant future contract changes require another review.

Stories: `components-button--review-page`, `--playground`, `--interaction-checks`, `--native-behavior`, `--secondary-contrast`.

Revision 2 verification: lint and strict typecheck passed; nine Chromium Storybook tests including axe and a new secondary contrast regression passed; Storybook production build passed with the existing upstream warnings. The test measures computed default/hover/pressed secondary text contrast against a 7:1 design floor and border contrast against 3:1. Measured secondary text ratios: **12.48 / 11.31 / 10.08:1**; border-to-fill ratios: **4.86 / 4.41 / 3.93:1**. Calculations use rendered CSS sRGB values, not screenshot sampling.

Visually inspected revision 2 at 320, 390 and 1440px without horizontal overflow. Physical Safari/Android, screen-reader and forced-color/reduced-motion emulation were not run. The application build and four foundation E2E tests passed for revision 1's shared font adoption; they were not rerun for this button-only visual change. No approved visual baseline exists.

Revision 4 verification: all nine Chromium Storybook tests (including axe), lint, strict typecheck, and both Next.js and Storybook production builds passed. The first accessibility run caught insufficient small-label contrast on blush; the derived text-accent token fixed it before the passing run. Foundation E2E and physical-device checks were not rerun for this color-only change.

## Revision history

- Revision 1 (`6b0daa1`, SHA-256 `486bd132c0fc4620ac545fccb6553ef0c114db607f4ec80681a724941453135f`): rejected by the user for shape, cramped padding and secondary state contrast. Its passing tests did not establish visual approval.
- Revision 2: [primary-source research](button-research.md) informed the revision. Radius reduced from 12px to 6px; medium height increased from 48px to 52px; small/medium/large horizontal padding is 20/26/28px. The review no longer overrides component padding. Per-variant hover/pressed tokens replace universal ink mixing. Secondary uses light cornflower tints with an ink label and contrasting border. Focus outline reduced to 2px with 3px separation. These choices were retained in the subsequently approved revision 4.

- Revision 3: user requested a lighter danger color. Base red changed from `#a3343e` to `#cc3541`, with gentler hover/pressed mixes (92% / 82% base red). Default white-label contrast is 5.06:1; darker hover/pressed backgrounds increase it. All nine Chromium story/axe tests passed for this color revision. Revision 2 build/typecheck evidence remains historical; no runtime behavior changed.

- Revision 4: user requested a lighter purple across the design system. Primary is now `--palette-purple: #8759A6` (white text 5.24:1), replacing the former plum primitive. A derived `--color-text-accent` retains readability for small labels/links on blush and outline/subtle button states. The palette guide and live stories reflect this palette; historical images/research are labeled accordingly. The user subsequently approved both this component revision and the lighter-purple palette.

Approval bookkeeping verification: all nine Chromium Storybook tests passed after updating the approval labels. Styles and runtime behavior were unchanged; build and device evidence remains as recorded above.
