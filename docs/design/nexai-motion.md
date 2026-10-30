# Nexai motion

**19 October 2026:** all 24 localized pose animations are now Approved and available through the [shared library](nexai-library.md). `NexaiCompanion.pose` selects this implementation. Existing screens still use their prior `motion` assignments; adoption does not choose new situation mappings.

## Historical fallback — restored revision 2.1 playback

**In Review**, 18 October 2026. The user rejected revision 1: a permanently raised paw and whole-image translations did not feel like character animation. They explicitly requested twelve replacement actions, lying on his back, research and image generation. [Revision 1 contract](references/nexai/motion-v1/contract.md) is historical and rejected; approved master v1 remains unchanged.

## Current contract

The user **rejected revision 3** on 18 October 2026: inconsistent character drawings looked like rapid image switching rather than animation. Runtime playback is restored to the prior revision 2.1 source cels, keyframe sequence and pacing. Isolation masks, stable sheet scale, cancellation and accessibility behavior remain. This is a fallback, **In Review**, not a claim that fluid animation is solved. The rejected intermediate selector and runtime registration have been removed; their source is archived under `references/nexai/motion-v3/rejected-playback/`.

See [method research and feasibility boundary](../research/2026-10-18-nexai-animation-method.md). Do not generate more independent sprite sheets as a continuity fix. A future puppet requires prepared, consistent layers and authored motion; the present master is not a complete rig.

`NexaiCompanion` retains its message, motion, eventKey, ambient and quiet props, HTML bubble, full-body artwork and pause control. The default is a calm blink with resting paws, not a wave. `NexaiArtwork` now plays curated, registered drawings from twelve generated sheets. There are no animated whole-image transforms and no ball. All source artwork, exact prompts and the decision rationale are recorded in [research and workflow](references/nexai/motion-v2/research.md) and [manifest](references/nexai/motion-v2/manifest.json).

The twelve actions: slow blink, wave, head turns, thinking, yawn, paw washing, full-body stretch, roll onto back, curl/sleep/wake, kneading, peekaboo and applause. The original source sheet contains twelve candidates per action; playback deliberately omits inconsistent candidates. Each clip begins and ends in a paws-down seated pose. Scale stays constant within each sheet, so lying down does not enlarge the cat. Full ears, paws and tail fit the 512-unit viewport in every used exposure.

This is limited cel animation with new poses, not a skeletal rig or sixty unique frames per second. Generated drawing consistency and perceived fluidity remain design review questions. The review presents replay, stop, timeline inspection, four pose samples and all twelve choices. `motionFrame` owns curated drawing/exposure lookup; `spriteFrame` owns registration only. No educational rules live here.

## Lifecycle and accessibility

- Assets decode before switching. The previous/rest artwork and HTML message remain if an asset fails. A generation guard prevents old asynchronous decodes from replacing a new action.
- A new motion or event interrupts the prior frame loop and ambient timer. Unrelated React rerendering does not restart playback. DOM image attributes change only when the exposure changes.
- Pause and reduced motion use a static grounded rest. Hidden/offscreen companions stop animation and scheduling. Unmount cancels work/listeners/observer. There is no sound.
- Ambient actions rotate with 6.5-second rests. Quiet exercise mode selects only blinking, head turns and thinking, with 12-second rests. Long sleep/back-roll/play actions stay out of that selection.
- Correct feedback uses the applause clip; wrong feedback uses the slow blink. Restored exposures retain revision 2.1 pacing; durations are computed from the shared timeline. These replace revision 1's 800ms nod/blink treatments under the user's instruction to redo all animations. Neither delays the next action; no answer or explanation rules changed.
- One polite HTML feedback region; decorative SVG hidden from assistive technology. Controls remain native keyboard-operable controls. Pause is hidden when the OS already requests reduced motion.

## Executed evidence — 18 October 2026

Lint and strict typecheck passed. **53 Storybook interaction/accessibility checks** and **14 unit/tooling tests** passed. Storybook production build passed (existing bundler warnings). EveryClip loads every sheet, verifies the selected asset, rapidly changes actions and checks stop/rest. Unit checks cover exposure boundaries, complete bounds, constant scale, end poses, curated frames and quiet-mode exclusions.

All nine approved-master fingerprints still match. All twelve source sheets and representative full-body back/stretch poses were visually inspected. Browser inspection at 320 and 1200px found no horizontal overflow in the motion review; the mobile Rekenen screen retains the complete resting cat. Timeline keyboard control selects the requested pose. Source images are transparent PNGs; no frozen master was edited.

Not verified: physical Tab S9 Ultra performance/comfort, Safari, actual device keyboard, manual screen-reader behavior, OS reduced-motion switching or final visual approval. Full Next build/E2E and visual-baseline updates were not performed for this artwork change. No production learner integration, live AI, new package/service or 3D assets.

## Revision 2.1 — isolation, registration and pacing

The user reported stray fragments and uneven/glitchy motion after liking the revised action catalogue. This correction remains **In Review**; it does not infer final motion approval.

Rectangular crops overlapped neighbouring poses. A read-only alpha-component inspector now generates a separate SVG silhouette clip for each of the 144 source cells, with a two-pixel edge margin. It leaves every PNG untouched. Inspection counted 2,123 opaque neighbouring pixels inside the previous rectangles, and zero after isolation. A synthetic regression checks two separate shapes whose bounding rectangles overlap, retaining the intended shape and excluding its neighbour.

Frames use ground-contact registration instead of the changing outside silhouette; the back-roll uses a centred lying-body anchor. A moving paw or tail therefore no longer determines the whole image's horizontal centre. Constant scale and full-body viewport bounds remain enforced. The pose strip uses the same geometry, and its CSS now sizes only the outer SVG rather than overriding the inner crop width.

Exposure durations are approximately 30% longer (rounded to 10ms). This retimes the existing drawings; it does not interpolate missing poses or certify smooth device playback. Large changes between generated drawings may still look stepped. The subsequent attempt to solve this with independently generated in-betweens was rejected; more generated drawings are not the accepted remedy. No source art was regenerated or upscaled.

Executed for this correction: **15 unit/tooling tests**, **53 Chromium Storybook interaction/axe checks**, lint, typecheck and Storybook build passed. The build retains existing bundler warnings. All nine approved-master source/export fingerprints match. Browser inspection at 1200px and 320px confirmed clean grooming/back-roll sample poses, complete artwork and no horizontal mobile overflow; it is not a frame-rate benchmark. Evidence is saved in `.artifacts/nexai-fix/` (ignored). Full Next build/E2E, visual-baseline updates, Safari and physical Tab S9 Ultra performance were not run. No suppressions were added.

## Revision 3 — generated intermediate poses

Implemented at the user’s request with the built-in image-generation tool. Thirteen new source sheets, 81 curated drawings, shared registration and clipping, predecoded playback, reversible transitions and a comparison control. **Rejected by the user** after visual review; retained here as historical evidence only. The character master remains Approved and frozen. Historical checks: 17 unit/tooling tests, 54 story checks, lint, typecheck and Storybook build pass. [Full evidence, exact prompts, selection and limitations](references/nexai/motion-v3/README.md).

## Rollback verification — 18 October 2026

Restored the prior twelve-action keyframe catalogue, single-sheet playback and v2.1 exposure pacing. Removed generated transition registration and the comparison switch. Rejected interpolation helpers and geometry are archived, not imported by the runtime. Existing source PNGs and all nine frozen-master fingerprints are unchanged.

A targeted regression first failed because blink loaded `/nexai/motion-v3/blink.png`; after removal it passes for every exposure in every action. This verifies the rollback, **not perceived fluidity**. Current checks: **16 unit/tooling tests**, **53 Chromium Storybook interaction/axe checks**, lint, strict typecheck and Storybook build passed. Build warnings remain unchanged. `git diff --check` passed. Browser inspection verified the restored 2.1 heading, removed intermediate switch, prior back sheet and pause/rest behavior. Screenshot: `.artifacts/nexai-rollback-review.png` (ignored).

No full Next build/E2E, new visual baselines, physical Tab S9 Ultra, Safari, manual screen-reader or OS reduced-motion test in this correction. No new animation assets, full puppet or smooth replacement was made. The previous cel-animation limitations remain visible; this restoration is not presented as the requested final-quality animation.
