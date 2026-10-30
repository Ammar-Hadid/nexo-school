# Nexai motion — revision 1

**In Review**, 18 October 2026. User requested a lively, varied cat companion and a motion review after the input review. This supersedes the earlier no-ambient-motion direction. Story: `components-nexai--review-page`.

## Shared component

`src/components/nexai/NexaiCompanion` (file `nexai.tsx`) composes an HTML bubble, decorative full-body `NexaiArtwork`, and an always-available pause/resume control. Props are message, selected motion, answer-event identity, ambient and quiet mode. Neither component grades, infers feelings, issues rewards or calls AI. Task overview and Rekenen use the same implementation.

The viewBox includes the complete original body plus margins for the moving paw, ears, tail and jumps. Never crop the body unless there is intentional hiding behind a visible foreground object; this is now a character-bible rule. The old cropped task-page renderer is replaced, not copied.

## Twelve review clips

Blink; double blink; approved greeting wave; curious lean; small nod; stretch; yawn; doze; shake; celebration hop; ball play; sideways exploration hops. Motion dimensions/timing are centralized in `nexai-motion.ts`, with SVG registration in `nexai-artwork.tsx` and presentation tokens in `nexai.tokens.css`.

These are layered 2.5D animation trials. Arm rotation, eye overlays, masked mouth opening, whole-body transforms and a code-authored ball provide varied motion. The head, ears, legs and tail are not individually rigged: stretch/exploration are stylized, not an anatomical walk or new complete pose set. The approved greeting's original shoulder keyframes and blink timings are reused. New clips require review; master approval does not approve all movement.

The generated yawn uses a precise edit of the approved atlas and only a feathered mouth region, leaving all other original pixels intact. Source prompt, tool, registration and SHA-256 hashes are in `references/nexai/motion-v1/prompts.md`. The old master files remain untouched. The added yawn expression is In Review.

## Playback and accessibility

- One animation frame loop per mounted companion. A new event, replay, stop, unmount, hidden document, offscreen artwork or changed motion preference cancels previous work and timers. Unrelated React rendering is not a new event.
- Ambient mode rotates through a deterministic varied catalogue with 6.5-second rests. Quiet exercise mode limits ambient clips to blinking, looking and small stretching, with 12-second rests. No roaming over questions or buttons, no sounds.
- Answer nod/blink reactions last 800ms; completion hop lasts 1.8s. All can be interrupted immediately by advancing. Longer yawn/play/doze clips belong to the motion review and nonfocused overview context.
- Pause resets the artwork to its neutral pose and cancels ambient scheduling. `prefers-reduced-motion` keeps the same full character and message static; the unnecessary pause control is hidden in that mode.
- Review offers separate clip selection, replay, stop, a deterministic inspection slider and ambient mode. The slider is an inspection control; it does not claim to track live playback.
- HTML bubble is the single polite live region for feedback. Artwork is hidden from screen readers. Ambient actions do not change message text or announce themselves. A missing image does not remove the HTML message or task controls.

Not yet proven: physical Tab S9 Ultra smoothness/comfort, real OS preference toggling and manual screen-reader behavior. No full skeletal puppet, new approved poses or sound system.

## Revision evidence — 18 October 2026

Node 24: lint, strict typecheck, all **52 Storybook interaction/accessibility tests**, all **13 unit/tooling tests**, and the Storybook production build passed. Master verification passed all nine original fingerprints. Git whitespace checks passed. Local ignored screenshots/logs are under `.artifacts/revision2/` and `.artifacts/revision2-*.log`.

Browser inspection covered input and motion reviews at 320px and wide desktop, and Rekenen at 320, 390, 768 and 1200px. Inspected layouts had no horizontal overflow. Keyboard timeline inspection confirmed the closed-eye/open-mouth yawn frame; pause reset the artwork and stopped playback. The input validation, direct identical retries, explanation timing and child-friendly result counts are covered by interaction tests.

Not performed: physical Tab S9 Ultra/iPhone/Safari validation, actual software-keyboard comfort, manual screen-reader testing, real OS reduced-motion switching, full Next build/E2E or visual-baseline approval. All new revisions remain **In Review**.
