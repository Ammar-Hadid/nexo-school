# Reusable Spelling family — D21-P1

**24 October integration follow-up:** The user accepted D21-P1 as a tested technical milestone. D14-S4/D15 now supports saved assignments for this exact bank through the common eligibility/submission boundary; its new content remains educationally unapproved. [Current contract and local rehearsal](eligible-content-and-withdrawal.md).

24 October 2026. **Implemented; technical verification recorded below. New content and review presentation In Review, not educationally approved.** The user accepted the preceding addition/Phase D delivery as a tested technical milestone and requested a non-arithmetic proof plus autonomous rollout sequencing. D21 and D14 as a whole remain open. [Roadmap sequence](../../tasks/delivery-roadmap.md#24-october-inventory-and-autonomous-batch-sequence) and [current ledger](../../tasks/todo.md#current-position-and-handoff) own next work.

## Bounded content and sources

Coverage: `spelling:regelwoorden:04` (Medeklinkerverdubbeling); plural formation supports the task but receives no separate evidence credit. `spelling-doubling-v1` is a **closed bank of ten one-syllable nouns**, not a general Dutch inflector: kat/katten, kip/kippen, pet/petten, pop/poppen, net/netten, big/biggen, kop/koppen, mug/muggen, rem/remmen, bal/ballen. The explicit word forms are separate from the deterministic doubling check. The bank covers short a/e/i/o/u. No AI, arbitrary words, sentence generation, dictation or audio.

Source inspection on 24 October:

- [Nederlandse Taalunie, Leidraad 2.2 / rule 2.B](https://woordenlijst.org/zoeken/leidraad/2/2.html): short-vowel consonant doubling and its limitations; explicit netten, biggen and remmen examples.
- [Vlaanderen Team Taaladvies, enkele/dubbele medeklinker](https://www.vlaanderen.be/team-taaladvies/spellingregels/medeklinkers/medeklinkers-2-enkele-of-dubbele-medeklinker): kat/kip syllable examples, bal/ballen and petten/poppen among its examples.
- [Published Taalunie spelling rules, section 2.4](https://codex.vlaanderen.be/Portals/Codex/documenten/1004653.html): explicit kop–koppen and mug–muggen. This older source supports those two unchanged forms; the current rule is checked against the current sources above.

Prompts and teaching explanations are project-authored; no dictionary definitions or bulk licensed corpus copied. Sources verify spelling facts, not vocabulary suitability for Adam or educational certification. Ambiguous `pad → paden/padden`, exceptions, loanwords, long-vowel reduction and other inflections are excluded. New words/rules require a new exact bank/package version and review, not a runtime free-text import.

Prerequisites: recognize short vowels, understand singular/plural and type a word. “één kat → twee …” retains the approved Spelling format. The rule identifies the short vowel, doubles the final consonant and adds `en`. The existing response policy ignores only case and surrounding whitespace: missing letters, accents, internal spaces and punctuation remain mistakes. Existing first-miss silence, identical deferred retry, second-miss teaching steps and Nexai wording remain intact.

All ten items are **practice stock**. Lemma exposure identities remain stable across wording/revision changes; the inventory is **one correlated family**, with no independent assessment/retention stock. Correct practice does not award mastery or trigger category skipping. Ten items do not demonstrate 50–200 daily capacity or the weekly review target.

## Shared implementation

- `src/modules/practice/spelling/doubling-family.ts`: sourced bank, deterministic question/steps, exact evaluator and stable exposure identity. `doubling-family-preview.tsx` supplies the existing `ExerciseScreen` with the approved Spelling definition and validation.
- `src/modules/content/spelling/doubling-content.ts`: shared v2 learner/private payload separation and rubric. Exact bank equality includes instructions, key, explanation, rights and provenance.
- `src/server/content/spelling-family.ts` and frozen `spelling-doubling-v1.json`: complete inventory hashes, five vowel representatives, four package-owned judgments, source fingerprints and disabled automatic publication.
- Existing family resolver, draft/decision/timer tables and authenticated handler: one extra registered subject adapter. Existing content review accepts a subject-owned `spellingReviewSpec`; the same initialize/edit/review/publish commands, immutable version history, time tracking, origin/bootstrap/recent-MFA protections and transactions apply.
- `subject-checks.ts`: shared mechanical validation entry at draft, review and publication. Invalid edited spelling drafts may be saved for diagnosis, but cannot be approved/published, including via the raw records API. A valid new bank revision requires its own reviewed contract. No new schema, worker, review system or provider.

The original D11/v1 and both accepted addition package JSONs remain unchanged. Their frozen manifests include the shared resolver file, which necessarily changes when registering Spelling. `family-source-compatibility.json` separately binds each **exact old package hash + old source hash + new resolver hash** for this registry extension only. It cannot accept changed content, another file, another package or later source drift. Arithmetic inventories/reports still have to match exactly. This preserves historical evidence rather than rewriting manifests or carrying educational approval into a new family. Build preflight and runtime development checks share the same verifier; production uses the build preflight. Future resolver changes need another reviewed exact compatibility entry or a new package, never a wildcard exemption.

## Interactive and saved review

Start `npm run storybook` with Node 24.22.0, then:

- [Interactive Spelling practice](http://127.0.0.1:6006/?path=/story/practice-spelling-family--practice)
- [Second-miss explanation](http://127.0.0.1:6006/?path=/story/practice-spelling-family--explanation)
- [Shared family review](http://127.0.0.1:6006/?path=/story/content-spelling-family--review-bank)

These are in-memory previews. The new authenticated local routes reuse the existing operator setup: `/guardian/content/spelling` for the ten-item review/publication set and `/guardian/content/supply/family?package=spelling-doubling-v1` for family review. GET does not seed/approve content; initialization and all decisions are explicit. Tests simulate review only in a disposable database. No actual content was approved or published by this implementation.

Adam has no newly activated daily route or persisted Spelling assignment. The existing saved arithmetic journey remains available in the local synthetic environment; new Spelling practice resets on reload. D14 eligible-stock integration, D15 quarantine/corrections, D24 settings, subject-owned saved adapters, reviewed daily Redactiesommen and D25 issuance/carryover remain before the next saved daily rehearsal. Real learner use/deployment and complete release qualification remain separately gated.

## Verification

Executed using Node **24.22.0**, synthetic fixtures and disposable local PostgreSQL:

- `npm test`: **213 tests / 51 files passed**, including assessment adversarial regressions, exhaustive addition preservation, all ten sourced Spelling keys, wrong-word/diacritic/space/punctuation rejection, key/private projection and exact package/source drift checks.
- `npm run test:saved`: **production build + 107 PostgreSQL/built tests / 12 files passed**; all 15 existing migrations installed and replayed. New bank/family cases exercise auth/origin/MFA, idempotent initialization/decisions/publication, version isolation, altered-key/raw-API blockers, atomic multi-item rollback, saved reload and protected review pages.
- **51 focused stories / 7 files** initially passed across Spelling, family review, content review, supply and learning path. Final subject-neutral review-label changes and two new bank stories passed **15 review/supply stories / 3 files**: **53 distinct stories / 8 files** overall. Final builds include the new stories.
- **10 learning-path E2E tests passed**. New saved bank/family review passed axe and no-horizontal-overflow at **320, 768, 1024 and 1440px** (eight combinations), with no uncaught browser errors. Phone bank and desktop family screenshots inspected; actual interactive practice opened and visually inspected in the app browser. Artifacts are ignored under `.artifacts/spelling-family/`.
- Final standalone/Storybook builds, build TypeScript validation, explicit typecheck, lint, formatting, source fingerprints, local document targets and whitespace passed. After the final UI copy adjustment, a fresh standalone build and **five focused Spelling DB/built tests** passed again.

The first unit run failed on the absent adapter; initial database tests failed on unregistered routes/packages. Those failures were resolved by implementation. Build checks caught two test typing errors, corrected without weakening behavior assertions. The first full saved run reported three existing offline generation lifecycle failures on immediate null claims; a focused run passed, exposing intermittent timing. D12-M1 aligns enqueue `availableAt` with the locked millisecond database claim clock instead of a separately rounded timestamp default and adds a 40-job immediate-claim regression. The final full saved run passed. No provider/pricing/spend permission was changed. Existing pg concurrency deprecation and build warnings remain.

**Not run/claimed:** physical tablet/iPhone/Safari, actual keyboard autocorrection behavior, dictation/audio, manual screen reader, full unrelated E2E/visual suite, approved baseline updates, remote CI/hosting checks, real learner operation, paid AI or deployment. Independent educational review, actual initial/weekly review-time measurement, production publication eligibility and saved Spelling assignment remain open. The ten-minute package review estimate is an estimate, not measured guardian workload.

## 26 October D04-M3 workflow package revision

Optional ordinary review notes require changing the attested `review.ts` and `records.ts` workflow. The original `spelling-doubling-v1.json` is preserved byte-for-byte. Active family review now uses `spelling-doubling-workflow-v2.json`, with current source fingerprints and a new package hash/progress identity; previous family decisions are not transferred. The spelling family revision, contract, inventory, examples, criteria, grading and educational-pending status are unchanged. This is no content recertification or publication. The two existing addition packages retain their frozen bytes and use the established exact package/source compatibility register solely for the resolver import change. Unrelated source/package drift still fails. Preparation tooling emits the new workflow version; no wildcard exemptions or visual-baseline changes.
