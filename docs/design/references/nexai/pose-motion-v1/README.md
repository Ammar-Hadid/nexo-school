# Nexai approved-pose motion review 1

19 October 2026. **Rejected by the user — superseded by localized layers.** All 24 source illustrations remain Approved at their collection-2 hashes. The user requested small animations for every pose, accepting modest motion and explicitly requiring research first.

Review: <http://127.0.0.1:6010/pose-motion-v1/review.html>. Uses the existing `python3 scripts/art/nexai/serve_review.py` server; no additional service or dependency.

The user clarified that whole-image movement does not meet the request. See [the replacement review](../layered-poses-v1/README.md). The record below describes the historical implementation, not the current recommendation.

## Research and direction

Read the [primary-source comparison](../../../../research/2026-10-19-nexai-approved-pose-motion.md). For natural independent eye/paw/tail movement, prepared layers and an authored mesh rig remain the best longer-term route. For these flattened approved images and the user's smaller-motion scope, use a single unchanged image per clip and deterministic browser transforms. Do not describe this as a full rig or independently articulated breathing.

- Focal moment: one selected full-body pose, with its own short motion and static original alongside.
- Continuity: a clip retains one PNG throughout and returns to exact rest. Selecting a different pose deliberately changes the illustration; it is not an animated transition between drawings.
- Feedback: controls respond immediately; no educational event assignments here.
- Budget: only the selected preview animates. Thumbnails are static and lazy-loaded. At most one WAAPI animation and one scheduled rest timer. Temporary `will-change` is removed at rest/cancellation. No canvas, shaders, AI calls or new image generation.

## Assets and timing

`motions.json` pairs all 24 stable IDs with the approved original asset paths and SHA-256 hashes. It contains independently authored timing, pivot, rest interval and transform keyframes. No duplicate or pixel-edited images are created. Groups cover calm, happy, proud, celebrating, curious, encouraging, sad and angry.

Motion remains deliberately small: 2.2–6.4 seconds per action, 6.5–9 seconds between repeats, at most 1° rotation, 2% vertical travel and 1.2% uniform scale growth. Most clips are substantially quieter. Cubic easing starts and stops gently. All endpoints are the identity transform. There is no anisotropic scaling, opacity flicker, synthetic blink, disembodied part or interpolated image sequence. Names describe presentation movement, not head turns, clapping paws or other articulation we have not created.

## Playback contract

- A decoded image replaces the previous selection atomically. A version guard prevents an older decode from overwriting a newer choice.
- Replay cancels the previous animation/timer. Stop returns to the exact static pose and suppresses repeat until explicitly restarted or another pose is selected.
- Repeat is optional and includes a rest. Only the large preview moves; changing/replaying a pose does not animate the thumbnail collection.
- OS reduced motion and the explicit static-comparison checkbox prevent playback. Hidden documents and offscreen stages cancel motion; an explicit stop remains stopped when visible again.
- Loading failure retains the previous image and usable selection controls with a readable error. No inline error is hidden behind artwork.
- Motion-phase labels are not live announcements; the selected description is announced once. Semantic native buttons, select, checkboxes and visible keyboard focus are retained.
- Source artwork is unchanged and full body remains within the padded stage. No audio.

## Executed verification

- Three targeted unit checks via the root `npm test` script: exact 24-pose coverage/source fingerprints, ordered finite timing/exact rest endpoints, and conservative transform bounds. All pass.
- All nine master fingerprints verified unchanged.
- Browser: all 24 selections decode and start playback; rapid selection/replay, stop/reset, static mode and offscreen suspension checked. The stop result is `transform: none` and no playing state. Desktop 1200px and mobile 320px inspected; no horizontal overflow and whole characters visible.
- JavaScript syntax, scoped test-file ESLint, targeted Prettier and whitespace checks passed.
- Screenshot: `.artifacts/nexai-pose-motion-v1.png` (ignored).

Not verified: physical Tab S9 Ultra smoothness, real OS reduced-motion/background-tab transitions, injected network/image failures, manual screen-reader behavior, GPU/compositor tracing. Their defensive code exists but these outcomes are not claimed from code alone. No application/Storybook build or full suite rerun: this is an isolated asset review, not a new shared production component. Rekenen still uses the previously documented motion implementation until a separate integration step. No new motion is approved by passing checks.

Mechanical detector: three cramped-padding findings were false positives because the CLI could not resolve the review server’s `/shared/` token stylesheet. Browser-computed panel padding is 24px/32px, original-reference top padding is 16px and method padding is 24px. Saved a rule/value ignore scoped to this HTML file only; no global rule or file exclusion. Source fingerprints are recorded in `manifest.json`.
