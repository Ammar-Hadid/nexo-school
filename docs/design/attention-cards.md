# Attention cards — revision 2

Status: **Approved**, 17 October 2026. The user explicitly approved revision 2 after reviewing its status colors: “okay this looks much better, approve the attention cards and save them in our design system.” Approval covers the card presentation, status treatments, empty/loading/error states and reviewed desktop/iPhone compositions.

Open **Components → Attention cards → Review Page**. The state sheet shows session review, a recommendation to increase difficulty, a recommendation for extra support, and a browser-access blocker. It also shows empty, loading and error states. Both device compositions include a labeled example selector outside the product shell, allowing every state to be inspected in context. iPhone uses approved option A. Navigation, buttons, typography and brand values are reused without modifying their approved implementations.

## Presentation contract

- `AttentionCard` receives `kind` (`review`, `recommendation`, `support`, `blocker`), `title`, `summary`, `metadata`, `headingLevel` (3 or 4), and one `action` containing its visible label and callback. Optional `expanded` and `controls` expose a disclosure controlled by the host. The card has no learning analysis, state persistence or API calls.
- Each card is a named article. Its category has both an icon and visible text; color is supplementary. The title, short factual explanation, context and one clear next action stay visible. Only the action button activates the card; the entire surface is not an ambiguous click target.
- The approved outline Button opens inline example detail. It exposes expansion, remains keyboard focused, and closes with the same button. The disclosure retains stable IDs. Details explain the sample evidence, the potential next step and the fact that nothing is saved or approved here.
- `AttentionState` distinguishes `empty`, `loading` and `error`; loading exposes `role="status"` and `aria-busy`. Error optionally accepts `onRetry`. Neither a failed request nor loading claims that no attention items exist. Unknown counts are labeled “Nog onbekend”. Empty is shown only in the explicitly selected empty fixture.
- The review's retry is a local simulation, not a network request. The isolated recovery story ends in empty; the layout simulation loads two example items. Actual request handling remains future work.
- Component-specific values live in `attention.tokens.css`; new shared status roles live in `src/styles/tokens.css`; existing brand values and Button styling are unchanged. Tinted status surfaces, a 4px colored edge, solid icon backgrounds, 6px corners, 20px semibold card titles and readable 16px summaries form the approved treatment. Red marks flagged sessions, green positive progress/higher-level recommendations, orange urgent blockers and blue extra support. The user explicitly expanded the previous green-only-for-correctness rule. Load errors use negative red; empty and loading remain neutral. No new dependency.
- At compact card widths, the metadata and full-width action stack. At wide desktop container widths, the two example attention items sit side by side; phone and narrower desktops stack them. Content scrolls inside the unchanged approved shell while its header/mobile navigation remain available.
- There is no animation. Inherited focus and native forced-color behavior remain; no claim of manual screen-reader or forced-color validation.

## Content and scope

All results, review flags, recommendations and browser requests are synthetic fixtures. Four incorrect first attempts are an example, **not a flagging threshold**. Three strong sessions do not establish a mastery algorithm. Copy does not claim to know effort, intent or motivation. Difficulty changes remain recommendations requiring guardian approval. Review acceptance/repetition, authenticated access approval, AI explanation generation and actual dashboard data are not implemented.

The approved header/sidebar and iPhone bottom bar are imported directly. Navigation callbacks in the preview switch to explicit destination placeholders and back. Example blocks provide visual context only. The native scenario selector is a review tool, not a proposed product form component.

## Revision and evidence

SHA-256: `f10cbbeca251c1cf5ba2b5696b8e8d7173157abbfa8caaaee4e4df332d323a2b`. Reproduce by sorting all direct files in `src/components/attention-card/` plus `src/styles/tokens.css`, then hashing each relative UTF-8 path, NUL, file bytes and NUL in order. Shared dependencies remain governed by their existing approval records.

Executed: formatting, lint and strict typecheck passed; all **21 Chromium Storybook tests** across six files passed, including six attention-card stories. Tests cover Enter/Space disclosure, focus retention, disclosure linkage and visibility, explicit loading/error versus empty, retry simulation, all-state iPhone selection including the blocker, and navigation away/back. Axe passes for all stories. Storybook production build passed with the existing upstream bundle/directive warnings.

Visual inspection at 320, 768, 1024 and 1440px found no page horizontal overflow. Checked narrow wrapping, compact button stacking, desktop composition, and phone quiet-day state. Device frames are responsive browser previews, not physical iPhone evidence. Physical Safari/Android, screen readers, forced-color emulation, Next.js production build and foundation E2E were not rerun for these Storybook-only additions. No approved visual baseline was created.

Approval applies to revision 2 at `e6a2638`. Reuse the approved contract and status tokens. This does not approve learning inference, sample thresholds, the full session-review workflow or production integration.

## Revision history

Revision 1 (`c1c3511`, hash `b012e6c29bd5a6ae85ffdd1966541aeb5e10af7936df1b8ee8b8a3b46d3b3149`, component-folder-only scope) was superseded after the user requested stronger color meaning. Revision 2 adds shared status tokens and distinguishes support from positive recommendations. Synthetic mistakes remain evidence for discussion, not proof of intent.

Revision 2 verification: lint/typecheck and all 21 Chromium story/axe checks passed; Storybook build passed. Calculated icon contrasts: white on red 5.06:1, white on green 4.73:1, Ink on orange 5.69:1. Original responsive geometry checks remain historical; the revision changes colors and category copy/icons, not navigation behavior. No physical-device or new visual-baseline claim.

Approval bookkeeping: user approval refers to `e6a2638` and the reviewed hash above. Status labels and token comments were updated without changing visual styling or runtime behavior. The resulting source fingerprint is `017134bece63326bc7d43de293ac9f7fbc8421822ca9dae968b20dc49db0435c`.

Terminology amendment (18 October 2026): at the user's explicit request, frontend labels now use **taak/taken** instead of sessie/sessies. This is a copy-only amendment to the approved component/examples; styles, navigation and action behavior are unchanged. Historical approval fingerprints remain recorded in the register.
