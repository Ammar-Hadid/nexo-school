# TextField — revision 2

**Approved**, 19 October 2026. User requested a dedicated input-field review before reviewing Nexai motion. Story: `components-text-field--review-page`.

Shared `src/components/text-field/` contains a native input, visible label, optional hint/error/success message, read-only pending treatment and a standard or learning-answer appearance. The learning variant uses Lexend, a pencil mark and the same single border; the general variant uses Outfit. Shared semantic palette tokens supply focus, error and success colors. Editable dimensions/borders live in `text-field.tokens.css`. Neither variant validates, grades or submits data on its own.

The review covers empty, filled, real hover/focus, invalid, success, read-only, disabled and pending states, plus interactive validation of whole-number input. Validation errors use a short message with an error marker and `aria-invalid`, rather than a large filled error box. Hints/errors join any caller-provided accessible description. Caller refs reach the native input. Disabled is a native unavailable control; read-only remains selectable. Pending is read-only and `aria-busy` without a decorative spinner.

Native text/email/numeric-keyboard inputs are demonstrated; this is not approval or implementation of every future input family (textarea, selects, password reveal, date pickers, etc.). The component is used in the Rekenen review immediately under the user's instruction, with revision 2 now approved.

No runtime persistence, network validation or user data. The consumer must validate input on the server when this enters production.

## Revision evidence — 18 October 2026

Node 24: lint, strict typecheck, all **52 Storybook interaction/accessibility tests**, all **13 unit/tooling tests**, and the Storybook production build passed. Master verification passed all nine original fingerprints. Git whitespace checks passed. Local ignored screenshots/logs are under `.artifacts/revision2/` and `.artifacts/revision2-*.log`.

Browser inspection covered input and motion reviews at 320px and wide desktop, and Rekenen at 320, 390, 768 and 1200px. Inspected layouts had no horizontal overflow. Keyboard timeline inspection confirmed the closed-eye/open-mouth yawn frame; pause reset the artwork and stopped playback. The input validation, direct identical retries, explanation timing and child-friendly result counts are covered by interaction tests.

Not performed: physical Tab S9 Ultra/iPhone/Safari validation, actual software-keyboard comfort, manual screen-reader testing, real OS reduced-motion switching, full Next build/E2E or visual-baseline approval. All new revisions remain **In Review**.

## Revision 2 — single focus border, 19 October 2026

User requested a single border instead of the bold doubled focus treatment. Removed the offset outline and the answer variant’s thick lower edge. Both appearances now keep one 1px border; focus changes it to the shared purple focus color and adds the existing soft surface tint, without changing dimensions. Focus also takes precedence on error/success/read-only fields; status text and markers remain visible. Forced-colors focus uses the system Highlight border.

Verification: all five TextField Storybook interaction/axe checks passed; scoped ESLint, Prettier and whitespace checks passed. Browser computed styles confirm one 1px border and no outline for standard and answer inputs; 320px layout has no overflow. Desktop screenshot: `.artifacts/text-field-single-border.png`. Full application build/suite and physical-device/forced-colors inspection not rerun for this CSS/copy change. Subsequently **Approved** on 19 October 2026. Source fingerprint: `382236130b68f95ecad539075d10733ccfc1e3a99acb25daa3ec1c1b0b632b78`.

## Approval — 19 October 2026

The user explicitly approved revision 2: “okay looks better, approve the inputs and save them in our design system.” Approval covers the standard and learning-answer TextField variants and reviewed states, including the single-border focus treatment, at the verified source fingerprint above. Only the Storybook review status label changed while recording approval; styling and behavior are unchanged. Existing five-story verification remains the implementation evidence; application tests were not rerun for this documentation/label-only update.
