# Nexai localized pose motion 1

19 October 2026 · **Approved**. The user explicitly approved this review and requested adoption in the shared library. Approval covers all 24 eye animations and the pose-17 paw gesture; situation assignments remain separate. The original collection-2 illustrations remain Approved.

[Open the animation review](http://127.0.0.1:6010/layered-poses-v1/review.html) · [Inspect all changed expressions](http://127.0.0.1:6010/layered-poses-v1/inspection.html).

## What changed

The user rejected moving whole pictures and explicitly requested visible changes within each character. This supersedes `pose-motion-v1`, which is preserved as rejected evidence. The implementation follows the approved master greeting's local eye-overlay technique.

- All 24 poses have a matching eye layer. Most blink; happy-2, proud-1 and encourage-2 wink before blinking. Originally closed-eye happy-1, proud-2 and celebrate-3 briefly open their eyes.
- Each original body stays fixed. Only the left/right eye masks change opacity. There is no whole-image translation, rotation, scaling or full-frame swapping.
- Encourage-2 (pose 17) also makes a small forepaw gesture. It reuses clipped pixels from that approved pose, pivoted behind the stationary overlapping forearm. Rotation is bounded to ±5°. No other limb, ear or tail has been rigged.
- Four eye timing patterns: slow blink, double blink, wink, peek. Each finite sequence lasts 2.8 seconds; optional repeats have a five-second rest. This is not 24 distinct full-body actions.

## Source and editing contract

`motions.json` owns the 24 stable IDs, approved original paths/hashes, new eye hashes, hand-registered mask ellipses, timing mode and optional paw registration. `sources.json` preserves every exact prompt and generated output path. The source reference for each edit is the matching ID in `poses-v2/catalogue.json` (including three reused `poses-v1` originals). Artwork was edited with the built-in `image_gen.imagegen` tool and transparent-background output, not painted with code.

Each `*-eyes.png` is a full-canvas 1254 × 1254 RGBA edit for registration. **Never display it as a replacement body.** `puppet.mjs` composites only two tightly fitted, feathered eye regions over the unchanged approved image. The otherwise unused generated mouth, fur, silhouette and body pixels are excluded. Left/right patches are independent. The paw is an SVG layer composition from original pixels, not another generated pose.

`timeline.mjs` defines deterministic local motion; `review.js` handles decode, selection and cancellation. `inspection.html` shows all 24 final eye composites without animation and offers an original/changed toggle. `manifest.json` fingerprints the reviewed revision. Frozen master v1 and all approved pose PNGs remain untouched.

Use the existing `python3 scripts/art/nexai/serve_review.py` server on port 6010. Shared fonts/tokens and prior review CSS conventions are reused. No dependency, runtime AI, new service, 3D work, product event mapping or application component integration was introduced. The PNGs are editable review sources; production export-size optimization is still pending.

## Playback and accessibility

- Only the selected large preview animates. Both sources decode before play; no image URL changes during a clip.
- Selection generations prevent late decodes from restarting an obsolete pose. Stop/replay cancel both the frame callback and pending rest timer.
- Stop restores original eyes and paw angle. The timeline and changed-eyes hold control permit static inspection. Hold resets any prior paw motion.
- System reduced motion and the explicit static option disable animation. Offscreen and hidden-tab events stop and reset playback; there is no automatic restart from an old timer.
- Missing eye artwork leaves the original body and readable feedback. No sound or educational content is embedded in artwork. Native controls retain keyboard focus; motion itself is not announced repeatedly.
- Whole-body framing is preserved in a padded square stage. This review does not certify the physical tablet or a production screen composition.

## Evidence

Executed on 19 October 2026:

- `npm test -- tests/tooling/nexai-layered-poses.test.ts`: **4 passed**. Covers exact 24-pose IDs/original and eye fingerprints/RGBA dimensions, bounded nonoverlapping mask regions, eye activity and rest endpoints, independent wink channels and paw bounds.
- `python3 scripts/art/nexai/verify_master.py`: **all 9 fingerprints pass**.
- `npm run typecheck`, scoped ESLint, runtime JavaScript syntax checks, targeted Prettier formatting and `git diff --check`: passed.
- Browser: all 24 selections load and expose matching eye patches with a fixed body; all 24 closed/open eye composites visually inspected. Wink channels `[1,0]` checked at 700ms; paw extremes inspected at 1050/1450ms. Rapid replay followed by Stop restores `[0,0]`, time 0 and paw rotation 0. Static mode disables playback; scrolling offscreen cancels playback and resets time.
- Layout: inspected wide and narrow compositions, including 320 CSS px at the browser's current zoom; no horizontal overflow. Full figure fits the stage. Browser console returned no warnings/errors during the checks.

Not executed: physical Tab S9 Ultra smoothness, real OS reduced-motion change, background-tab transition, injected source failure, manual screen-reader review or a measured frame-rate trace. The corresponding defensive code is not presented as executed evidence. No full application/Storybook build or suite rerun: app source is unchanged. These checks preceded the subsequent explicit user approval.

## Research

The [corrected research record](../../../../research/2026-10-19-nexai-approved-pose-motion.md) distinguishes full-puppet rigging from this deliberately small set of layered actions. [SVG masks](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mask) define local compositing; [Live2D material separation](https://docs.live2d.com/en/cubism-editor-manual/divide-the-material/) describes preparing independently moving parts. Local visual inspection, not documentation alone, determines whether a particular mask or joint fits these images.

## Shared library adoption — 19 October 2026

Exact approved source copies are distributed from `public/nexai/layered-poses-v1/`. Use `NexaiCompanion` with its `pose` prop or the decorative `NexaiAnimatedPose`; see [shared library contract](../../../nexai-library.md). Existing learning-event mappings were not changed.
