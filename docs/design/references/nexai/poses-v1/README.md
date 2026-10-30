# Nexai pose review 1

19 October 2026. **In Review.** The user rejected the permanently raised arm in the subtle-motion proof and explicitly requested different poses. This authorizes new pose candidates; it does not approve them or reinstate generated in-betweens as an animation method.

Review: <http://127.0.0.1:6010/poses-v1/review.html>. The prior subtle review links here. Existing review server: `python3 scripts/art/nexai/serve_review.py`.

## Deliverables

- `rest.png`: seated with both front paws down; proposed default resting pose.
- `think.png`: seated with one paw near the chin and one grounded.
- `lie.png`: belly-down, head upright, front paws forward.

Built-in image generation created each as a separate edit/reference-conditioned asset from the **approved atlas**, not from rejected intermediate frames. Original outputs were copied into this directory without pixel editing. The immutable master remains the identity authority. Exact prompts are in `prompts.json`; reference and output SHA-256 hashes, PNG dimensions and color types are in `manifest.json`.

The generated candidates retain the principal purple/cream/cornflower markings, eye perspective, cheek tufts and curled tail, but are not pixel-identical to the master. Review facial proportions and texture as well as the new posture. They are static full-character candidates, not rigged layers or transition frames. No automatic rotation through poses, animation, product adoption or replacement of the master is implemented here. Keeping a new pose static avoids claiming that independently generated drawings form continuous animation.

## Verification

- Inspected all three generated images and the rendered comparison page. Full ears, paws and tail visible; no detached waving arm or additional subject.
- All three PNGs are 1254×1254 with RGBA color type; all load in the browser. Images displayed with preserved aspect ratios.
- Browser inspection at 320px and 1200px; the narrow layout stacks cards and has no horizontal overflow. Desktop comparison and reference are visible. Screenshot: `.artifacts/nexai-poses-v1-review.png` (ignored).
- All nine approved-master fingerprints still match. Targeted Prettier and `git diff --check` pass.
- No app source, runtime animation, dependencies or production data changed. Application tests/build were not rerun for this static asset review. Physical-device and new-pose animation testing are not performed; no motion or visual approval is inferred.
