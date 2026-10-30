# D13 — first reference review for Ammar

AI-assisted proposals and the subsequent Codex verification are recorded separately in [review metadata](d13-proposed-review-findings.json) and [verification/preparation notes](../docs/engineering/d13-reference-verification.md). Ammar explicitly did not provide independent human approval. His later c10 scope choice creates a separate draft case; the original material below is preserved.

Status: Pending human decisions. These 12 existing development fixtures are not an unused holdout. This is the first review batch, not the full planned benchmark.

Fixture hash: `d1a6482afa85f1f1d256c86ef06bc49ffcd018d897afbf80092eb0db22b789f7`. Version: `synthetic-review-benchmark-v1`.

Review every item, including those proposed clean. The keys and explanations below deliberately contain errors in some cases. They are benchmark material, never learner content.

For each item, decide whether you accept the proposed defect labels and severity. Check for additional defects, answer alternatives and unclear instructions. Record “accept-proposal” or “change-required” with a correction in tasks/d13-review-decisions.json; leave uncertain items pending. Add reviewedAt only when you have reviewed the package. You can instead send decisions in chat using the item IDs; they will be recorded against these hashes. No decision has been filled in for you.

Your review establishes the benchmark references for this bounded comparison. It does not certify curriculum coverage, mastery thresholds or production educational suitability. Corrections require a new reviewed fixture version; historical test material is preserved.

## c01 — Rekenen: Optellen

Content hash: `e2e440e01a2191bd88617c0320039ac0c2eb0448f546b894ec563a87cb05a461`

**Objective:** Eencijferige getallen optellen.

**Rubric:** Geef één geheel getal.

**Passage/context:** (none)

**Question:** 3 + 4 =

**Options:** (open answer)

**Supplied key:** 7

**Supplied explanation:** Tel vier op bij drie: zeven.

**Proposed reference:**

No defect proposed.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c02 — Taal: Woordenschat

Content hash: `cbc9e35aec3a4e29084d8bd14483efdfc28e1bafdafcfef2bf375932c6c3142c`

**Objective:** Een synoniem herkennen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** (none)

**Question:** Welk woord betekent hetzelfde als blij?

**Options:** vrolijk / boos

**Supplied key:** vrolijk

**Supplied explanation:** Blij en vrolijk betekenen hier hetzelfde.

**Proposed reference:**

No defect proposed.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c03 — Spelling: Werkwoorden

Content hash: `dca4f55e57e9310f308d8480b833c1b7b71577798d869c8fd6cad1131e8b0f45`

**Objective:** De persoonsvorm kiezen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** (none)

**Question:** Kies de juiste vorm: hij ... naar huis.

**Options:** loopt / lopen

**Supplied key:** loopt

**Supplied explanation:** Bij hij hoort hier loopt.

**Proposed reference:**

No defect proposed.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c04 — Begrijpend Lezen: Letterlijk begrip

Content hash: `2a2ec0a7e001a44fcd9127fa9737f63d782f8db17445155180456b6b3c12c157`

**Objective:** Een gegeven uit de tekst ophalen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** Noor draagt een rode jas.

**Question:** Welke kleur heeft de jas van Noor?

**Options:** (open answer)

**Supplied key:** rood

**Supplied explanation:** In de tekst staat dat de jas rood is.

**Proposed reference:**

No defect proposed.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c05 — Rekenen: Optellen

Content hash: `3b32f054f6e27fcc3a095d6034914ada4ff65ef25707729ee29f572e1b5473a6`

**Objective:** Eencijferige getallen optellen.

**Rubric:** Geef één geheel getal.

**Passage/context:** (none)

**Question:** 8 + 7 =

**Options:** (open answer)

**Supplied key:** 14

**Supplied explanation:** Acht plus zeven is veertien.

**Proposed reference:**

- blocking / wrong-key: Eight successors after seven gives fifteen, not fourteen.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c06 — Taal: Woordenschat

Content hash: `748c8c698ef473e355a67b36031d27a24d4f6f923e4df3bb4633c40d10484b3c`

**Objective:** Een synoniem herkennen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** (none)

**Question:** Welk woord betekent hetzelfde als blij?

**Options:** vrolijk / opgewekt

**Supplied key:** vrolijk

**Supplied explanation:** Blij en vrolijk betekenen hier hetzelfde.

**Proposed reference:**

- blocking / ambiguity: Both vrolijk and opgewekt can mean blij; the rubric permits one choice.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c07 — Rekenen: Meten

Content hash: `882bbcd6a3486912b484f4e635f957313baf2f034389d1839713bb8a6d5fdacc`

**Objective:** Een lengte in centimeters benoemen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** (none)

**Question:** Een potlood is 12 centimeter lang. Geef de lengte in centimeter.

**Options:** (open answer)

**Supplied key:** 12 meter

**Supplied explanation:** De lengte is twaalf meter.

**Proposed reference:**

- blocking / wrong-unit: The supplied key changes centimeter into meter without conversion.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c08 — Taal: Woordenschat

Content hash: `6988f439e8c1adf8ab3e7fc4a5ba2e8ff4e9dfc7158b9c73fd3a2b0bff1f2284`

**Objective:** Een alledaags woord zonder vaktaal herkennen.

**Rubric:** Gebruik uitsluitend alledaagse woorden; vermijd biologische vaktaal.

**Passage/context:** (none)

**Question:** Welk woord beschrijft fotosynthese?

**Options:** voedselvorming / slapen

**Supplied key:** voedselvorming

**Supplied explanation:** Fotosynthese is voedselvorming met behulp van licht.

**Proposed reference:**

- attention / vocabulary: Fotosynthese conflicts with this explicit no-technical-vocabulary specification; no school-level calibration is claimed.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c09 — Begrijpend Lezen: Letterlijk begrip

Content hash: `071de7b49fe12d9a7916679574992c0bba95ccd7e1f118623f5a946ca325ef3f`

**Objective:** Een gegeven uit de tekst ophalen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** Noor gaat naar buiten.

**Question:** Welke kleur heeft de jas van Noor?

**Options:** (open answer)

**Supplied key:** rood

**Supplied explanation:** Haar jas is rood.

**Proposed reference:**

- blocking / missing-evidence: The text supplies no jacket or colour information.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c10 — Begrijpend Lezen: Letterlijk begrip

Content hash: `ff2be9458863a0cc360cfb113fdd16cb937fa13086873e68dc6ca63ab4c2340a`

**Objective:** Zelfstandig een gegeven ophalen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** Noor telt haar appels. Eerder zichtbare feedback bij vraag 1: Noor heeft drie appels.

**Question:** Hoeveel appels heeft Noor?

**Options:** (open answer)

**Supplied key:** drie

**Supplied explanation:** Noor heeft drie appels.

**Proposed reference:**

- blocking / answer-leakage: Previously visible feedback supplies the answer to the later question; review the whole reveal dependency.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c11 — Spelling: Werkwoorden

Content hash: `d7254b176e776f3aec73f510fcee379f1f1e62c827b8775fc1e537cf1c488cdf`

**Objective:** De persoonsvorm kiezen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** (none)

**Question:** Kies de juiste vorm: hij ... naar huis.

**Options:** loopt / lopen

**Supplied key:** lopen

**Supplied explanation:** Hij lopen is de juiste vorm.

**Proposed reference:**

- blocking / grammar: Hij requires loopt here, not lopen; this is not an intentionally preserved learner error.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**

## c12 — Rekenen: Optellen

Content hash: `0adc05e7d5daf0be6a78024308a0bb48ad023176ea14694ba6f808c61895713d`

**Objective:** Twee getallen optellen.

**Rubric:** Kies precies één correct antwoord; gebruik gewone woorden.

**Passage/context:** (none)

**Question:** Welk dier miauwt?

**Options:** kat / hond

**Supplied key:** kat

**Supplied explanation:** Een kat miauwt.

**Proposed reference:**

- blocking / objective-mismatch: Animal recognition collects no addition evidence.

**Your decision:** Pending

**Corrections / acceptable answers / additional defects:**
