# Typography proposal — Outfit and Lexend

Status: **In Review**, 17 October 2026. The user supplied an Outfit/Lexend scale and requested typography exploration. This preview follows that reference; typography has not yet been approved for application-wide adoption.

Review **Foundation → Typography → Proposed Pairing** in Storybook. It uses real locally served fonts with Dutch prose, an exercise question, answer specimens and potentially ambiguous characters. The samples are synthetic typography specimens, not published learning content or working controls.

## Proposed roles

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

Draft semantic typography variables are scoped to `.specimen` in [typography.module.css](../../src/styles/typography.module.css). Edit those values to refine this preview. The approved palette is consumed through existing shared semantic color tokens.

After approval, promote the agreed variables/font loading into the shared style system, then validate real components. For now `tokens.css`, app layout and existing stories retain their current typography. This review does not approve Button, navigation, exercise or reading components.

Font assets and original licenses live in [fonts/](../../src/styles/fonts/README.md), with upstream commit URLs and SHA-256 hashes. The preview loads original variable TTFs (approximately 280 KiB total) through Vite asset URLs; browsers do not contact Google Fonts. Production delivery/compression can be considered when the fonts are adopted.

## Verification

Executed on 17 October 2026: lint and strict typecheck passed; all four Storybook browser tests passed, including actual loading of both font faces and the accessibility scan. Storybook production build passed with the previously documented bundle/directive warnings. Visually inspected the preview at 1280px and 390px; neither had horizontal overflow, and the intended title resolved to Outfit at 40px on the wider viewport. Temporary viewport overrides were reset afterward.

Application E2E/build, physical tablet checks, screen-reader checks and visual-regression baseline creation were not run for this isolated story. Final typography approval remains pending.
