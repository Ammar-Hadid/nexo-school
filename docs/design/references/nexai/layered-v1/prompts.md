# Nexai layered asset prompts

Built-in image generation, 18 October 2026; transparent_background=true for both calls. No CLI fallback or educational API use.

## Body and arm atlas

Reference: `../nexai-soft-3d-concept-v1.png` (original option 2). Saved output: `nexai-atlas.png`.

> Create a production 2.5D animation sprite atlas from this EXACT Nexai reference. Preserve the character identity, beautiful soft shaded purple coat, cream muzzle/chest and paws, cornflower ear interiors and curled tail tip, sculpted cheek tufts, expressive dark eyebrows, shiny black-purple eyes, pink nose. Closest possible to the large cat on LEFT and welcome cat at upper middle in the reference, not a redesign. Output a transparent 1536x1024 landscape image with TWO clearly separated regions, no text or labels, no background, no shadow plane: LEFT TWO THIRDS contain ONE full-body seated Nexai, looking directly toward viewer, head straight upright, friendly closed-mouth smile, both eyes open. Tail curled on viewer RIGHT. Viewer RIGHT forepaw planted on ground. IMPORTANT viewer LEFT forearm is ABSENT below shoulder (this is a layered puppet body, its missing arm will be attached separately); torso behind that missing arm is fully painted with uninterrupted purple fur. Do not create a stump, simply silhouette smooth at left shoulder. Keep all body parts inside x=100..900 y=60..970. RIGHT THIRD x=1080..1450 y=220..820: ONE isolated matching viewer LEFT waving arm, same scale as body, angled upward: upper arm starts at bottom-right (shoulder attachment), bent elbow below, forearm raised up-left ending in cream paw with subtle pink pads facing viewer. Complete continuous purple shoulder-to-cream-paw arm, soft round silhouette, same lighting. No duplicate cat, no extra eyes or face, no captions, no panels. Actual transparent alpha outside these two assets. Artwork for animation layers, preserve exquisite original image appearance.

## Closed-eye edit

Edit target: generated atlas above. Saved output: `nexai-blink.png`.

> Precise animation frame edit. Keep EXACTLY the same image dimensions 1536x1024, layout, pixel registration, cat identity, proportions, body, detached arm, tail, lighting, colors and transparent alpha. Change ONLY the TWO OPEN EYES to gently CLOSED EYES for a brief natural blink. Purple fur eyelids cover the eye whites/irises entirely, with curved dark eyelash lines across the closed lids. Keep eyebrows, muzzle, ears and head outline fixed in the same position. Do not smile more, do not tilt head, do not move anything. This is the closed-eye animation overlay frame for this precise layered sprite. No background or glow, preserve genuine transparent background. No text.

Generated edits can vary outside the requested area. The runtime uses only feathered eye regions from the second image to keep the body, eyebrows and arm stable.
