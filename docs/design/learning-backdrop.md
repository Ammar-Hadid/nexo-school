# Learning backdrop — revision 1

**Approved**, 18 October 2026. The user requested decoration on the left and right of the taken page and asked to preserve it in the shared design system for reuse. Motion was optional; this revision intentionally uses static illustration so task selection remains calm.

## Visual language

Asymmetric open books and pencils, small four-point stars, dots and curved dashed trails fill the side margins. Thin purple linework and cornflower accents/washes derive from the approved palette. These are original code-authored SVG ornaments, not generated raster artwork, learning prompts, scoring symbols or a new Nexai pose. No status red/green/orange is used.

Do not use these decorative colors for text, borders that convey state or essential icons: their low contrast is intentional because the entire layer is nonessential. The center remains clear, and opaque task cards sit above it. There is no animation, audio, parallax, JavaScript measurement or added dependency.

## Reuse contract

Component: `src/components/learning-backdrop/learning-backdrop.tsx`.

```tsx
<LearningBackdrop>
  <main className={styles.page}>{/* Page content */}</main>
</LearningBackdrop>
```

Use once around a student overview or task-selection composition. It accepts only `children` and does not change their semantic structure or handle learning state. The wrapper establishes a local positioning/stacking context with a minimum viewport height; it does not fix the art to the browser window. Keep it outside focused question/reading surfaces unless a separate design review establishes a benefit. Guardian pages do not adopt it automatically.

The content should use `max-width: var(--learning-backdrop-content-width)` and auto inline margins, as the task page does. Positioning is designed for a full-width host. A narrower container is still clipped safely, but needs its own placement review; the responsive cutoff is viewport-based, not a container query. Do not nest multiple backdrops.

## Shared tokens

All appearance controls are in `learning-backdrop.tokens.css`, consumed by the component and application/Storybook alike:

| Token                               | Purpose                                           |
| ----------------------------------- | ------------------------------------------------- |
| `--learning-backdrop-content-width` | Reserved center width; currently 58rem            |
| `--learning-backdrop-rail-width`    | Width of each illustrated side; currently 10rem   |
| `--learning-backdrop-gap`           | Clear space between center boundary and ornaments |
| `--learning-backdrop-top`           | Vertical placement within the page                |
| `--learning-backdrop-ink`           | Soft purple linework derived from approved Purple |
| `--learning-backdrop-accent`        | Cornflower stars and dots                         |
| `--learning-backdrop-wash`          | Very light Cornflower backing shapes              |
| `--learning-backdrop-stroke`        | Main SVG stroke width in viewBox units            |

The two SVG viewBoxes and coordinates are artwork geometry, not spacing tokens. Change the shared component to revise the motif; do not copy its paths into individual pages. Preserve the whitespace around text and actions. New branded illustration directions require review.

## Responsive and accessibility behavior

- At viewport widths **1184px and below**, the artwork is hidden. Narrow layouts use their space for tasks rather than squeezing decorations behind readable content.
- Outside edges clip within a separate decorative layer; it cannot create horizontal scrolling. The content is not clipped by that layer.
- `pointer-events: none`, `aria-hidden="true"` and non-focusable SVG keep the ornaments out of interaction and the accessibility tree.
- The layer is also hidden in forced-colors and print. Reduced motion needs no special transition because this version is completely static.
- There are no image requests or asset-loading failures. Task page labels, focus, actions and Nexai messages retain their existing behavior.

## Stories, verification and approval

Storybook: `components-learning-backdrop--review-page` and `--keyboard-and-decoration`. The taken page is the integrated reference at `components-practice-tasks--tasks-page`.

Executed under Node 24.22.0: lint, typecheck, all **36** Chromium Storybook interaction/axe checks and Storybook production build passed. Existing bundler warnings remain. Keyboard review verifies that decoration adds no tab stop or accessible image and cannot intercept pointers. Actual taken-page widths 320, 768, 1024 and 1440px were inspected with no horizontal overflow; narrow artwork hiding and wide margin placement were verified. Targeted formatting and Git whitespace checks passed.

Full Next production build/E2E, physical device/Safari checks, manual screen-reader use and forced-color OS switching were not run. Nexai master files remain unchanged. The user explicitly approved the background decorations on 18 October 2026: “okay looks good, approve the background decorations and save them in our design system”. Approval covers LearningBackdrop revision 1 and its reviewed taken-page placement; it does not extend to unrelated task-page behavior. The exact reviewed source fingerprint is recorded in the component approval register.
