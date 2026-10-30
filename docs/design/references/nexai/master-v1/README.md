# Nexai master v1

**Approved, 18 October 2026.** [Character bible](../../../nexai-character-bible.md) · [reference page](reference.html) · [reference sheet](reference-sheet.svg) · [portable master](nexai-master.svg).

The existing `../layered-v1/nexai-atlas.png` and `nexai-blink.png` remain the canonical raster sources. No artwork was regenerated or repainted during preservation. The assembled SVG contains embedded raster layers with the exact approved registration; it is not vector art or a 3D model. Both SVG files work without external image/font downloads.

`manifest.json` records the exact approved pixels and timing/composition evidence, plus derived documentation hashes. The reference sheet crops/reuses those pixels. Its closed-eye panel is the approved localized blink, not the entire generated closed-eye head; its miniatures are documentation rather than approved placement sizes. The new sheet/bible record the approved character and do not approve additional poses.

Run from the repository root:

```sh
python3 scripts/art/nexai/verify_master.py
python3 scripts/art/nexai/build_reference_sheet.py
python3 scripts/art/nexai/verify_master.py
python3 scripts/art/nexai/serve_review.py
```

The rebuild command overwrites only the two derived SVG exports and refuses altered source PNGs. The read-only verification detects changes in all recorded sources/exports. Never refresh a fingerprint merely to make a check pass. New approved character revisions belong in new versioned paths with their own records.

The live review is at <http://127.0.0.1:6010/master-v1/reference.html>. No application code, dependencies, educational events or new poses were added. Full application/Storybook tests are not required for these static documentation exports and were not rerun. Physical tablet and screen-reader checks remain outstanding for product integration.

## Verification — 18 October 2026

- Original approved PNG hashes unchanged; greeting JavaScript unchanged.
- All nine source/export fingerprints passed; rebuilding and rechecking reproduced identical exports.
- SVG XML parsed, IDs were unique, every local use/mask/clip reference resolved, and embedded images matched the source PNGs.
- Browser rendered the sheet with the assembled character, closed-eye detail, isolated arm, tail detail and miniatures. Reference page inspected at desktop and narrow widths; no horizontal overflow.
- Python syntax parsing, targeted documentation/HTML/JSON formatting and `git diff --check` passed. No automatic visual-baseline approval was inferred.
