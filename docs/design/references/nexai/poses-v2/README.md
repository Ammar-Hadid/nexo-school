# Nexai pose collection 2

19 October 2026. **Approved.** The user liked the first static pose collection and requested around 24 poses, varied emotions including sadness and anger, with three alternatives per mood.

Review: <http://127.0.0.1:6010/poses-v2/review.html>. Run the existing local server with `python3 scripts/art/nexai/serve_review.py` if needed.

## Collection

Eight groups of three: calm, happy, proud, celebrating, curious, encouraging, sad and angry. The calm set reuses the three `poses-v1` images without duplicating or changing them. Twenty-one new transparent PNGs complete the 24-pose collection. Stable IDs, titles, paths, dimensions and SHA-256 fingerprints live in `catalogue.json`.

Each new image was separately generated with the built-in image-generation tool, using both the approved `layered-v1/nexai-atlas.png` and the existing `poses-v1/rest.png` as references. Exact prompts are preserved in `prompts.json`; original output paths and per-image prompts are in `generation-sources.json`. Outputs were copied without pixel editing. The approved master remains the identity authority, with its nine frozen fingerprints unchanged.

These are static illustrations, not animation frames or rig layers. Facial proportions and texture can vary slightly between generated images; reference conditioning does not guarantee pixel-identical identity. The review places three alternatives side by side for explicit visual selection. No transitions, automatic pose rotation, application integration or educational event mapping were added.

## Emotion use

The user's requested sad and angry expressions are approved as artwork. Their presence is not approval to depict Nexai as angry at Adam after a mistake. Encouragement is the proposed wrong-answer direction; final mappings remain to be selected with the user. Existing no-mockery and no-inference-of-feelings/effort rules still apply. Celebrating, proud and happy groups provide different intensities for ordinary success and larger achievements.

## Verification

- All 24 images load in the browser; eight groups contain exactly three cards each.
- Desktop 1200px and narrow 320px layouts inspected: full-image aspect ratios preserved, cards stack at narrow widths, no horizontal overflow.
- Mood navigation links exercised. Every illustration links to its full-resolution PNG. Static presentation has no motion to disable.
- All nine approved-master fingerprints pass verification. Targeted Prettier and `git diff --check` pass.
- Browser screenshot: `.artifacts/nexai-poses-v2-review.png` (ignored).
- No application source or dependencies changed. Application suites/build and physical-device tests were not rerun for this static reference collection. All 24 static illustrations are now **Approved**; event mappings remain undecided.

## Approval — 19 October 2026

Explicit user approval: “okay I like these, approve the 24 poses and save them in our design system.” This covers all 24 exact PNGs in `catalogue.json`, including the three reused collection-1 poses. Verified all 24 recorded SHA-256 fingerprints and all nine master fingerprints before recording approval. No artwork or styling changed. This supersedes the earlier In Review status for these static poses; it does not approve previous animation experiments or automatically select educational event mappings. Approval recording changes documentation and status labels only; application tests were not rerun.
