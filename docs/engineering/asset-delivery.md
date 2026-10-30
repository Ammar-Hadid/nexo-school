# Standalone asset delivery — D09

**22 October 2026 user approval:** the user explicitly approved D07, D08 and D09 and authorized D10. Approval covers the delivered bounded local synthetic revisions, including D07 saved/error/resume presentation and D08 saved guardian presentation. It does not certify educational content, approve assessment revision 3 or authorize deployment/real learner data.

22 October 2026. Local synthetic technical implementation. Read the [D08 handoff](guardian-results.md) and [current ledger](../../tasks/todo.md#current-position-and-handoff) before continuing. Existing visual and educational approvals are unchanged.

## Runtime contract

`npm run build` runs `scripts/package-standalone.mjs` after Next's standalone build. Run `npm run start` to serve that package locally. Copy the complete `.next/standalone` directory when preparing a later authorized runtime; do not overlay repository `public/` onto it. Container deployment/rehearsal remains D34; this task verifies the actual standalone server, not a Docker application image.

The packaging script uses the approved `src/components/nexai/nexai-layered-catalogue.json` as its explicit public allowlist: 24 approved poses, each with its base and eye PNG. Every path must be inside `nexai/layered-poses-v1` and every file must match the catalogue's frozen SHA-256. Missing or modified artwork fails packaging. It validates before replacing generated public output, removes stale public/static output, writes the selected files and copies Next static output, including both locally bundled font families. Historical motion sheets, review exports and arbitrary public files are excluded. Future public assets must be deliberately registered; adding a file to `public/` alone does not publish it.

The existing shared component requests only its selected base/eye pair. No pixel, timing, message, pose assignment, component, grading or persistence behavior changes. Its existing failure state stops animation while HTML feedback and controls remain usable. A total image failure can still show the browser's broken-image glyph in the decorative area; this is not a new designed fallback. No new Storybook component or visual approval is introduced.

## Measurements

Local Chromium, fresh context, built saved exercise with synthetic intercepted presentation responses and real asset requests. Sizes are bytes; transfer includes browser-reported overhead. These are measurements, not latency/device qualification or a performance budget.

| Resource                   | Count | Encoded body | Decoded body |  Transfer |
| -------------------------- | ----: | -----------: | -----------: | --------: |
| Selected happy-2 base/eyes |     2 |    2,481,512 |    2,481,512 | 2,482,112 |
| Outfit/Lexend fonts        |     2 |      148,274 |      286,640 |   148,874 |
| Browser JavaScript         |     7 |      451,625 |    1,520,585 |   453,725 |
| CSS                        |     5 |        6,514 |       24,724 |     8,014 |

Full approved PNG inventory: **63,904,746 bytes**, 48 files. Next static output: **2,053,619 bytes**. Complete standalone file contents: **120,407,799 bytes** (logical size, not compressed container size). The whole pose inventory is packaged but is not eagerly downloaded. The original PNG pair is approximately 2.37 MiB; no re-encoding or new approval claim is hidden in this fix. Legacy motion metadata remains in the shared JavaScript dependency graph; bundle reduction and image compression are possible later optimizations, not measured improvements here.

The browser test writes per-request measurements and desktop/390px inspection screenshots under ignored `test-results/standalone-assets-*/`. These are inspection evidence, not approved visual baselines. The exact chunk names may change on subsequent builds.

## Verification

- Regression first failed with ENOENT for the missing standalone PNG; passed after packaging. It checks exact selected bytes, exclusion of historical assets, removal of stale files, font copying and rejection of altered pixels.
- Node 24.22.0 root unit suite: **133 passed / 28 files**.
- Standalone build passed, including all 48 fingerprint checks.
- Built Playwright asset/sign-in checks: **8 passed**. All 48 HTTP responses match approved hashes; historical sheet returns 404. Saved exercise requests precisely its selected two images, both font faces load, image failures retain feedback and keyboard-focusable Continue. Desktop and 390px screenshots inspected; phone overflow check passes. Approved sign-in regression spans 320–1440px.
- Full `npm run test:saved`: **45 passed / 4 files**, including fresh/replayed six-migration install and the real authenticated student/guardian journey. Added a decoded-artwork assertion to the actual authenticated student route.
- Typecheck, lint, scoped formatting and whitespace checks passed.

The first Playwright invocation failed during collection because Node required a JSON import attribute; corrected before the passing browser run. Existing PostgreSQL client deprecation and Playwright color-environment warnings remain. No full Storybook suite/build, visual baselines, physical-device/Safari test, manual screen-reader check, remote CI, VPS migration, real learner data, AI or deployment. No database/schema or auth changes. D07 saved/error and D08 guardian presentation were subsequently Approved on 22 October 2026; shared sign-in revision 2 remains Approved.
