# Approved typography — Outfit and Lexend

**Guardian-only R3, 28 October 2026:** the new workspace retains Outfit and introduces scoped compact navigation (15px), secondary text (14px) and section headings (22px). These Guardian overrides are **Approved on 28 October 2026** under the [R3 language](guardian-visual-language.md); the approved global/student scale below is unchanged.

Status: **Approved**, 17 October 2026. The user explicitly replied “approved” after reviewing the Outfit/Lexend pairing and scale at revision `e198aed`. Approval covers the families, role assignments, sizes, weights and line heights shown below. Shared application adoption was implemented for the first button review on 17 October 2026.

Review **Foundation → Typography → Proposed Pairing** in Storybook. It uses real locally served fonts with Dutch prose, an exercise question, answer specimens and potentially ambiguous characters. The samples are synthetic typography specimens, not published learning content or working controls.

## Approved roles

| Role               | Family | Size at default browser settings | Weight | Line height |
| ------------------ | ------ | -------------------------------- | ------ | ----------- |
| Page titles        | Outfit | 32–40px                          | 700    | 1.2         |
| Section headings   | Outfit | 24–28px                          | 600    | 1.2         |
| Navigation/buttons | Outfit | 18px                             | 600    | 1.6         |
| Exercise questions | Lexend | 22–26px                          | 500    | 1.7         |
| Reading passages   | Lexend | 22px                             | 400    | 1.7         |
| Answers            | Lexend | 18–22px                          | 400    | 1.7         |
| Guardian text      | Outfit | 16px                             | 400    | 1.6         |
| Small labels       | Outfit | 14px                             | 500    | 1.6         |

These select values inside the supplied ranges. Reading stays at 22px on small screens; shorter lines provide the adaptation. Headings, questions and answers use bounded fluid sizes. CSS uses rem units, with reading lines limited to 42ch. Labels describe metadata; essential questions/instructions use larger learning text. Avoid all-caps reading passages and long italic passages. Actual device comfort should guide any later adjustments; a font choice alone is not evidence of improved reading performance.

## Implementation boundary and editing

Approved semantic typography values now live in [tokens.css](../../src/styles/tokens.css), with local font faces in [fonts.css](../../src/styles/fonts.css). Application and Storybook both load them through `globals.css`. Future design changes should preserve this approval record and be reviewed as a new revision. The approved palette is consumed through existing shared semantic color tokens.

The typography specimen consumes the shared tokens; the application body now uses Outfit. This adoption does not approve Button, navigation, exercise or reading components.

Font assets and original licenses live in [fonts/](../../src/styles/fonts/README.md), with upstream commit URLs and SHA-256 hashes. The shared styles load original variable TTFs (approximately 280 KiB total) through Vite asset URLs; browsers do not contact Google Fonts. Further compression can be considered separately.

## Verification

Executed on 17 October 2026: lint and strict typecheck passed; all four Storybook browser tests passed, including actual loading of both font faces and the accessibility scan. Storybook production build passed with the previously documented bundle/directive warnings. Visually inspected the preview at 1280px and 390px; neither had horizontal overflow, and the intended title resolved to Outfit at 40px on the wider viewport. Temporary viewport overrides were reset afterward.

Application E2E/build, physical tablet checks, screen-reader checks and visual-regression baseline creation were not run for this isolated story. The user subsequently approved the typography; physical-device checks and actual component validation remain outstanding.
