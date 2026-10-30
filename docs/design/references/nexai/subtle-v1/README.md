# Nexai subtle motion — review 1

18 October 2026. **In Review.** The user chose a simpler scope after rejecting generated in-between frames: use approved Nexai with reliable subtle movement, and review it before app integration.

Open <http://127.0.0.1:6010/subtle-v1/review.html>. The existing loopback review server serves this directory; start it with `python3 scripts/art/nexai/serve_review.py` if needed.

## What is implemented

An isolated HTML/SVG asset review, not an application component. It references the frozen `layered-v1/nexai-atlas.png` and `nexai-blink.png` directly. No PNG is copied, generated, recolored or edited. Body/arm registration and the localized eyelid mask come from the approved composition. A static copy beside the preview uses the same layers. Existing shared tokens/fonts and original review control styles are reused.

- **Even knipperen:** one 120ms closed-eye exposure in an 1800ms preview. Only the accepted eyelid overlay changes; no whole-head or character frame replacement.
- **Een kleine zwaai:** the approved 2600ms arm-angle timeline with cosine easing and its two original blinks. The body's original slight tilt is omitted for a calmer example. The raised-paw resting position remains part of the approved source; this does not create a paws-down pose.
- **Rustig aanwezig:** a six-second breathing impression through at most 0.3% uniform scale about the feet, with one blink. This preserves proportions but is a subtle presentation effect, not anatomical torso rigging. No independent head, ear or tail animation is claimed.

No autoplay or sound. Optional repetition adds a six-second rest; Stop cancels both playback and any pending repeat. Selecting another action resets immediately. Timeline inspection stops playback. Images decode before controls enable. Static comparison and OS reduced motion reset to the exact master and disable playback; hiding the page cancels rather than resuming unexpectedly. HTML bubble remains selectable above the full character. Decorative SVGs are hidden from assistive technology, with one status region and native keyboard controls.

## Boundaries

The approved master and prior app/Storybook runtime are untouched. This is a review proof, not a reusable production component, so no new shared component/story is introduced yet. It has no learning-event wiring, new art, AI integration, whole-body rig, back roll, or promise of animator-level motion. A future shared component must have Storybook coverage before adoption. User approval of this revision is pending.

## Executed checks

- Four timeline tests passed with `node --test docs/design/references/nexai/subtle-v1/timeline.test.mjs`: exact rest endpoints, blink boundaries, bounded continuous wave angles and bounded uniform breathing scale.
- `node --check review.js`, targeted Prettier check and `git diff --check` passed.
- All nine frozen-master source/export fingerprints match with `python3 scripts/art/nexai/verify_master.py`.
- Browser checks: wave begins changing the arm transform and finishes at rest; selecting a new action cancels playback; static comparison disables playback; keyboard timeline inspection shows the approved closed-eye overlay. Narrow 320px layout has no horizontal overflow and shows complete artwork.

This is not physical-device certification. Physical Tab S9 Ultra/Safari, OS preference switching and manual screen-reader testing were not performed. Application unit/Storybook/build suites were not rerun because app code and dependencies were unchanged. Automated timing checks do not approve visual quality.
