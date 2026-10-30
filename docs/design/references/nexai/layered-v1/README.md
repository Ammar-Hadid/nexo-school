# Nexai · layered 2.5D greeting · revision 1

18 October 2026. **Approved master v1 and greeting.** The user selected a layered approach using option 2's appearance and requested deletion of the Blender work. This is an image-derived reconstruction, not a pixel-identical extraction. The user subsequently approved this exact character as the canonical master. See [the character bible](../../../nexai-character-bible.md) and [frozen manifest](../master-v1/manifest.json).

## Review and sources

Run `python3 scripts/art/nexai/serve_review.py` from the repository root, then open <http://127.0.0.1:6010/layered-v1/review.html>.

- `nexai-atlas.png`: transparent 1536 × 1024 body and detached arm atlas.
- `nexai-blink.png`: matching closed-eye edit; only the eye regions are used.
- `review.html`: editable SVG layer composition, clipping, shoulder position and feathered eye masks; Dutch speech bubble is HTML.
- `review.js`: deterministic 2.6-second timeline, two brief blinks, shoulder rotation and subtle body tilt. One requestAnimationFrame loop at a time, cancel on replay/stop/hidden page. No autoplay, audio or continuous loop.
- `review.css`: responsive asset review using shared palette/font/button tokens. This is an asset proof, not a shared application component or approved product screen.
- `prompts.md`: source and exact prompts. Built-in image generation was used, without an API-key or CLI fallback.

The waving paw is composited behind the body to hide its shoulder seam. Layer coordinates are in the atlas's native pixel space; edit SVG transforms/masks to adjust registration. The original option 2 image stays unchanged. The greeting timing does not supersede the planned shorter per-answer reactions.

## Checks executed

- Browser playback started, moved the arm and completed at 2600 ms without looping. Closed-eye overlay inspected at 650 ms. Stop resets to zero; static mode disables animation and timeline, hides the eyelids and resets the arm. Enter activates playback with focus on its button.
- No horizontal overflow at 320, 1024 and 1440 CSS pixels. Desktop and narrow compositions visually inspected. These are viewport checks, not physical-device testing.
- Native `prefers-reduced-motion` is honored in code and on preference changes; the equivalent static toggle was exercised. OS preference switching itself and screen-reader announcements were not manually tested.
- Both atlas files contain genuine alpha transparency. Exact signatures/dimensions/hashes are recorded in `manifest.json`.
- `node --check` for the timeline, Python AST parsing for the review server, targeted Prettier checks and `git diff --check` passed.
- No application source or dependency changes. Full application/Storybook test suites were not rerun for this isolated asset review. No Storybook component, full pose catalogue, student-page integration, exported video, physical Tab S9 Ultra test or production deployment is included.

## Cleanup

Removed `assets/nexai/blender/`, `docs/design/references/nexai/blender-v1/`, all prior `.artifacts/nexai/` Blender renders/logs/screenshots, and the three Blender build/render/verification scripts. Removed the old Blender download route and the deleted page's narrow design-hook exception. The original option 2 raster concept and the independently planned gamepas are retained.
