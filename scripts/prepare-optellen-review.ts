import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { additionCertificationReport } from '../src/server/content/addition-family.ts';
if (
  existsSync('src/modules/content/family-review/optellen-review-package.json')
)
  throw new Error(
    'Package already exists. A change requires a new explicit review version.',
  );
const report = additionCertificationReport();
const sources = [
  'src/server/content/addition-family.ts',
  'src/modules/content/family-review/family-review-contract.ts',
  'src/server/content/family-review.ts',
  'src/server/content/addition-family.test.ts',
  'src/modules/practice/assignment/submission-state.ts',
];
const pkg = {
  version: 'd14-optellen-certification-v1',
  title: 'Optellen met twee cijfers van 0–9',
  purpose: 'practice-only',
  reviewEstimateMinutes: 15,
  automaticPublication: false,
  contract: report.contract,
  contractHash: report.contractHash,
  inventoryHash: report.inventoryHash,
  sources: Object.fromEntries(
    sources.map((path) => [
      path,
      createHash('sha256').update(readFileSync(path)).digest('hex'),
    ]),
  ),
  technical: {
    checkedInstances: report.checkedInstances,
    mismatches: report.mismatches,
    exposureGroups: report.exposureGroups,
    independentFamilies: report.independentFamilies,
    aiCalls: 0,
  },
  examples: [
    { index: 0, reason: 'Ondergrens: beide getallen nul' },
    { index: 9, reason: 'Nul als eerste getal' },
    { index: 90, reason: 'Nul als tweede getal; dezelfde somgroep als 0 + 9' },
    { index: 45, reason: 'Uitkomst onder tien' },
    { index: 55, reason: 'Precies tien; gelijke getallen' },
    { index: 79, reason: 'Over het tiental' },
    { index: 99, reason: 'Bovengrens: hoogste uitkomst' },
  ].map((s) => ({ ...s, ...report.items[s.index]! })),
  criteria: [
    {
      id: 'scope',
      title: 'Bereik en voorkennis',
      question:
        'Is dit afgebakende deelgebied geschikt voor procedureel oefenen?',
      detail:
        'Twee getallen van 0–9; uitkomsten 0–18, inclusief over tien. Vereist tellen tot 18 en herkennen van cijfers, + en =. Alleen uitrekenen; geen bewijs voor begrip, verhaalsommen, beheersing of overslaan. Geen volledige dekking van Optellen tot 100.',
    },
    {
      id: 'wording',
      title: 'Vraag en toegankelijkheid',
      question:
        'Zijn de symbolische vraag en invoer begrijpelijk en bruikbaar?',
      detail:
        'De leerling ziet bijvoorbeeld 7 + 9 = en vult één geheel getal in. Cijfers lezen en typen zijn ondersteunende eisen, geen apart beoordeelde rekenvaardigheden. Er is geen beeld- of audioalternatief binnen deze familie.',
    },
    {
      id: 'explanation',
      title: 'Uitleg en terugkoppeling',
      question:
        'Is de korte telinstructie met uitkomst voldoende voor dit oefendoel?',
      detail:
        'Bijvoorbeeld: Tel 9 op bij 7. 7 + 9 = 16. Dit is geen uitgewerkte rekenstrategie of les. Kies aanpassing nodig als er meer uitleg of een andere aanpak nodig is.',
    },
    {
      id: 'response',
      title: 'Antwoordregels en herhaling',
      question: 'Zijn de invoerregels en grenzen aan bewijs passend?',
      detail:
        'Bij antwoord 5 zijn 5, 05 en spaties rond 5 geldig. +5, 5.0, 5,0, 5e0, leeg en meer dan zes cijfers zijn ongeldig. Omdraaien van getallen levert geen nieuwe onafhankelijke som op: 100 weergaven, 55 groepen, één familie. Dit pakket certificeert geen herhaalinterval of toets-/retentiegebruik.',
    },
  ],
  inventory: report.items,
};
writeFileSync(
  'src/modules/content/family-review/optellen-review-package.json',
  JSON.stringify(pkg, null, 2) + '\n',
);
console.log(
  'Prepared proposed package; no human review or certificate recorded.',
);
