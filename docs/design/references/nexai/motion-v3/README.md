# Nexai motion v3 — generated in-betweens

**REJECTED — 18 October 2026.** The user found these generated intermediate drawings inconsistent and glitchy. None is used by active playback. The implementation below is historical, not current guidance. Preserved source helpers/registration are in `rejected-playback/`; see [the corrected method](../../../../research/2026-10-18-nexai-animation-method.md).

**Historical implementation record · 18 October 2026.** The user requested real intermediate drawings for smoother animation, generated against the approved Nexai master. This is an extension of the synthetic design milestone, not approval of new character artwork.

## Assets and repeatability

- Built-in `image_gen` produced thirteen transparent PNG sheets: twelve action-specific sets and an additional gradual paw-lift sheet. Every call included `public/nexai/master-v1-atlas.png` as the identity authority and the matching v2 action sheet as the endpoint reference.
- All 156 candidates were visually inspected as sheets. Playback uses **81 selected new drawings** across all twelve actions. Unused drawings stay in the source sheets for traceability but are never selected by the timeline.
- [Exact prompts and reference paths](generation.json), [source hashes and image dimensions](manifest.json), and [actual selection/curation](selection.json) are distinct records. Requested cell positions were not reliably followed by generation; runtime selection follows visual inspection rather than the prompt alone.
- Distribution assets: `public/nexai/motion-v3/`. Approved master v1 and all thirteen previous motion-v2 assets remain byte-for-byte unchanged. No raster pixels were edited, recolored, traced or upscaled after generation.
- Regenerate isolation geometry with `node scripts/art/nexai/inspect_inbetweens.mjs`, then format the resulting JSON with the repo's Prettier. The script reads image alpha, finds twelve complete connected cats per sheet, excludes neighbouring components, and writes SVG clipping geometry. It does not generate art. A successful geometry check is not visual approval.

## Selection and playback

Added drawings per action: blink 2, wave 7, curious 4, thinking 8, yawn 8, grooming 4, stretch 10, back-roll 9, sleep 9, kneading 7, peekaboo 7, applause 6. The extra wave-lift sheet supplies the previously missing ankle/belly positions. Grooming no longer plays the two original switched-paw cells; a consistent-paw lick replaces them.

`nexai-inbetweens.ts` owns the explicit transition map. Reverse movement plays the same intermediate drawings in reverse order. `nexai-exposures.ts` inserts 60–80ms exposures, retaining longer intentional holds. Only transitions needing more time are extended; adding cels does not multiply every action's duration. This is cel animation, not image crossfading or whole-character translation.

New drawings use uniform scaling calibrated to the height/position between their original endpoints. They do not independently fill each cell. The same crop geometry is used in playback and the pose strip. Playback decodes every required sheet before starting, so switching between old and new frames does not start an image fetch mid-action. Cancellation, rest, pause, reduced motion and hidden/offscreen handling are preserved.

The review offers **Met tussenposes** to compare the current sequence with intermediate exposures disabled. The corrected grooming key pose and the extra wave recovery key remain in both versions; this is not an exact archived v2.1 comparison. Pose inspection is deterministic and shows the same source frames used in playback.

## Evidence and limits

17 unit/tooling tests and 54 Chromium Storybook interaction/axe checks pass, including all action assets, reverse transition order, exposure boundaries, full-body bounds, a directly inspected generated wave transition and pause/rest behavior. Lint, typecheck and Storybook production build pass (existing bundler warnings). All nine approved-master fingerprints and all thirteen v2 source hashes match. Every generated sheet contains twelve isolated cats and no foreign opaque component pixels remain inside the clip geometry.

Browser inspection at 1200px and 320px checked the new wave-lift and back-roll poses, comparison control and mobile overflow. Proof screenshots and command logs are under ignored `.artifacts/nexai-inbetweens/`. No screenshot baselines were overwritten. Full Next build/E2E, physical Tab S9 Ultra performance, Safari, OS reduced-motion switching and manual screen-reader checks were not run in this slice.

Generated frames can still vary subtly in texture, facial details and spacing. The new drawings are candidates matched to master v1, not pixel-identical copies or a newly approved master. The checks prove integration and geometry; they do not certify subjective smoothness or physical-device frame rate. Final visual/motion approval remains with the user.
