# Nexai movement research and production choice

18 October 2026. Scope: replace the twelve rejected movement trials, including genuine lying/back poses. This is character-animation design work, not a new educational engine.

## Findings from primary sources

- [Adobe: principles of animation](https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html): anticipation establishes an action before its main movement; pose-to-pose planning defines key drawings; arcs, timing and overlapping action give movement weight. Application here: prepare a paw lift, perform the gesture, then lower it. A torso translation alone cannot express rolling onto a back or curling to sleep.
- [Toon Boom: about exposure](https://docs.toonboom.com/help/harmony-24/essentials/timing/about-exposure.html) and [timing](https://docs.toonboom.com/help/harmony-24/advanced/timing/about-timing.html): drawing exposure defines how long each drawing appears and is part of planning the action. Application: separate per-action exposure tables with shorter transitions and longer holds; no uniform sine-wave loop applied to all clips.
- [Rive's official bones documentation source](https://github.com/rive-app/help-center/blob/master/editor/manipulating-shapes/bones/README.md): a hierarchy of bones can drive graphic parts. This is an alternative, but our approved raster atlas does not contain a complete rig or unseen body surfaces. Rotating its whole seated picture cannot create new anatomy. No Rive dependency or service was added.

## Chosen approach and honest limits

Generate new transparent cel sheets with the built-in image-generation tool, using approved master v1 as identity authority and a new paws-down candidate for resting pose. Each sheet has twelve candidate drawings. Curate usable exposures, register them to a common groundline with one scale per sheet, and play them in the existing shared component. There is no CSS transform animating the whole picture and no ball prop.

This is **limited cel animation**, not a fully deformable puppet or film-quality motion capture. It has discrete drawings, held roughly 70–440ms depending on the action. RequestAnimationFrame schedules exposure boundaries; that does not mean sixty unique drawings a second. Generated frames can vary in face/proportions; visual consistency and fluidity still require the user's review. Do not relabel this a finished professional rig.

All twelve generated sheets were inspected. The wave generator switched paws in some cells; playback excludes those cells. Grooming's switched-paw cheek strokes are also excluded; its final action is a consistent paw wash. A wrong-direction head-turn cell is omitted. Original files are retained as evidence rather than silently claiming every generated cell was usable. Source frames stay unchanged; runtime SVG crops and read-only registration metadata assemble them.

## Catalogue

Slow blink; greeting wave; attentive head turns; paw-under-chin thinking; paw-covering yawn; paw washing; four-legged forward stretch; roll onto back; curl up/sleep/wake; alternating paw kneading; peekaboo; two-paw applause. Both front paws rest on the ground between actions. Wave is no longer the universal pose.

Focused exercise ambient selection is limited to blink, head turns and thinking. Back rolls, grooming, sleep and playful gestures belong to nonfocused moments. Correct-answer applause can be interrupted immediately; it lasts 1.2 seconds, never blocks advancing. No emotion/effort inference, audio, AI runtime or rewards logic.

## Reproducibility

- Exact built-in prompts, references and generation output paths: `generation.json`.
- Workspace assets: `public/nexai/motion-v2/*.png`, with immutable hashes in `manifest.json`.
- Read-only PNG component/bounds inspection: `scripts/art/nexai/inspect_sprite_bounds.mjs`; uses the existing tooling copy of pngjs, no added dependency. It writes JSON coordinates, never edits pixels. Run Prettier after regenerating JSON.
- Registered source rectangles: `src/components/nexai/nexai-sprite-bounds.json`.
- Curated frame order and per-drawing exposure: `src/components/nexai/nexai-motion.ts`.
- Playback, cancellation, decode and preference handling: `src/components/nexai/nexai-artwork.tsx`.

One active sheet loads at a time. The full original PNG catalogue is approximately 22.3MB; assets are not all imported into the application bundle. Native decode completes before switching an active sheet. This is review-asset delivery, not final production media optimization.
