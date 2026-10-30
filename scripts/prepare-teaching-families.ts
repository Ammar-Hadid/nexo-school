import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { teachingAdditionReport } from '../src/server/content/teaching-addition-family.ts';
import type { AdditionRange } from '../src/modules/practice/rekenen/addition-strategies.ts';
const sources = [
  'src/modules/content/family-review/family-package.ts',
  'src/server/content/family-packages.test.ts',
  'src/modules/practice/rekenen/addition-strategies.ts',
  'src/modules/practice/rekenen/addition-strategies.test.ts',
  'src/server/content/teaching-addition-family.ts',
  'src/server/content/family-review.ts',
  'src/modules/content/family-review/family-review-contract.ts',
  'src/modules/practice/assignment/submission-state.ts',
];
for (const range of ['digits', 'two-digits'] as AdditionRange[]) {
  const path = `src/modules/content/family-review/addition-${range === 'digits' ? 'digits-v2' : 'two-digits-v1'}.json`;
  if (existsSync(path))
    throw new Error(
      'Package already exists; create a new version rather than rewriting reviewed bytes.',
    );
  const r = teachingAdditionReport(range);
  const scope = {
    bounds:
      range === 'digits'
        ? 'Twee cijfers van 0–9; uitkomsten 0–18, ook over het tiental.'
        : 'Twee getallen van 10–99; uitkomst maximaal 100. Met en zonder tientalovergang.',
    prerequisites: r.contract.prerequisites,
    objective:
      'Procedureel optellen oefenen. Geen bewijs voor begrip, toepassing, beheersing of overslaan.',
    pattern: r.contract.explanationRules,
    changes:
      range === 'digits'
        ? 'Het eerder goedgekeurde vraagformaat en oefenbereik blijven gelijk. Nieuw: uitleg met nul, dubbelen, aanvullen tot tien en doortellen. Het oude v1-pakket blijft historisch bewaard.'
        : 'Nieuwe begrensde familie. Hergebruikt de tientallen/eenheden-aanpak uit 24 + 18, 36 + 27 en 45 + 38. Nog geen onderwijskundige goedkeuring.',
  };
  const prompts =
    range === 'digits'
      ? [
          '0 + 0 =',
          '0 + 9 =',
          '9 + 0 =',
          '4 + 5 =',
          '5 + 5 =',
          '7 + 9 =',
          '9 + 9 =',
          '2 + 2 =',
          '1 + 9 =',
        ]
      : [
          '10 + 10 =',
          '24 + 18 =',
          '36 + 27 =',
          '45 + 38 =',
          '21 + 34 =',
          '11 + 89 =',
          '50 + 50 =',
          '90 + 10 =',
        ];
  const examples = prompts.map((prompt) => ({
    ...r.items.find((i) => i.prompt === prompt)!,
    reason:
      range === 'digits'
        ? 'Strategie en grens bekijken'
        : 'Plaatswaarde en tientalovergang bekijken',
  }));
  const pkg = {
    version: r.contract.revision,
    title:
      range === 'digits'
        ? 'Optellen · cijfers 0–9 · nieuwe uitleg'
        : 'Optellen · twee cijfers · tot 100',
    purpose: 'practice-only',
    reviewEstimateMinutes: 15,
    automaticPublication: false,
    contract: r.contract,
    contractHash: r.contractHash,
    inventoryHash: r.inventoryHash,
    sources: Object.fromEntries(
      sources.map((path) => [
        path,
        createHash('sha256').update(readFileSync(path)).digest('hex'),
      ]),
    ),
    technical: r.technical,
    scope,
    examples,
    criteria: [
      {
        id: 'scope',
        title: 'Bereik en voorkennis',
        question: 'Is deze afbakening geschikt voor procedureel oefenen?',
        detail: `${scope.bounds} ${scope.prerequisites} ${scope.objective}`,
      },
      {
        id: 'wording',
        title: 'Vraag en toegankelijkheid',
        question: 'Zijn de symbolische vraag en getalinvoer begrijpelijk?',
        detail:
          'Eén geheel getal typen. Lezen en typen zijn ondersteunende eisen, geen zelfstandig leerbewijs.',
      },
      {
        id: 'explanation',
        title: 'Uitleg en terugkoppeling',
        question: 'Leren de stappen een bruikbare aanpak?',
        detail: `${scope.pattern} Controleer de verschillende strategieën en hun grenzen. Technisch narekenen is geen onderwijskundige goedkeuring.`,
      },
      {
        id: 'response',
        title: 'Antwoordregels en herhaling',
        question: 'Zijn invoerregels en grenzen aan bewijs passend?',
        detail:
          'Spaties en voorloopnullen toegestaan; tekens, decimalen en exponenten niet. Omgekeerde sommen delen blootstelling; andere getallen maken geen onafhankelijke familie.',
      },
    ],
    inventory: r.items,
  };
  writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
}
