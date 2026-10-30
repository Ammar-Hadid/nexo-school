import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spellingFamilyReport } from '../src/server/content/spelling-family.ts';
const report = spellingFamilyReport();
const sources = [
  'src/modules/practice/spelling/doubling-family.ts',
  'src/modules/practice/spelling/doubling-family.test.ts',
  'src/modules/content/spelling/doubling-content.ts',
  'src/server/content/spelling-family.ts',
  'src/server/content/spelling-review-batch.ts',
  'src/server/content/subject-checks.ts',
  'src/server/content/records.ts',
  'src/server/content/review.ts',
  'src/server/content/family-review.ts',
  'src/server/content/family-source-compatibility.ts',
  'src/server/content/family-source-compatibility.json',
  'src/modules/content/family-review/family-package.ts',
  'src/modules/content/family-review/family-review-contract.ts',
];
console.log(
  JSON.stringify(
    {
      version: 'spelling-doubling-workflow-v3',
      title: 'Spelling · medeklinkerverdubbeling',
      purpose: 'practice-only',
      reviewEstimateMinutes: 10,
      automaticPublication: false,
      contract: report.contract,
      contractHash: report.contractHash,
      inventoryHash: report.inventoryHash,
      sources: Object.fromEntries(
        sources.map((p) => [
          p,
          createHash('sha256').update(readFileSync(p)).digest('hex'),
        ]),
      ),
      technical: report.technical,
      scope: {
        bounds:
          'Tien vaste woorden: kat, kip, pet, pop, net, big, kop, mug, rem en bal. Alleen korte klinker + dubbele eindmedeklinker + en.',
        prerequisites: report.contract.prerequisites,
        objective:
          'De medeklinker verdubbelen bij deze meervouden. Geen bewijs voor beheersing van de hele categorie.',
        pattern:
          'één woord → twee …; typ het meervoud. Uitleg verschijnt volgens de bestaande uitgestelde-herkansingsregels.',
        changes:
          'Nieuwe, gesloten woordenbank met broncontrole. Geen vrije woordgeneratie, dictee, zinscontext of automatische publicatie. Alle woorden zijn oefenvoorraad; toets- en behoudsvoorraad ontbreken. D14-S5: gedeelde workflow ondersteunt nu ook vaste synthetische Taal-, lees- en Redactiesommenproefsets. De Spellinginhoud en regels zijn ongewijzigd. Eerdere reviewbesluiten worden niet overgenomen.',
      },
      examples: [0, 1, 2, 3, 7].map((index) => ({
        ...report.items[index],
        reason: `Voorbeeld met de korte ${['a', 'i', 'e', 'o', 'u'][[0, 1, 2, 3, 7].indexOf(index)]}; controleer betekenis, antwoord en uitleg.`,
      })),
      criteria: [
        {
          id: 'scope',
          title: 'Bereik en voorkennis',
          question:
            'Zijn deze tien woorden en de voorkennis geschikt voor deze oefening?',
          detail:
            'Controleer woordbetekenissen, korte klinkers en het beperkte oefendoel. De overige curriculumdoelen blijven open.',
        },
        {
          id: 'wording',
          title: 'Vraag en woordenbank',
          question:
            'Is ieder enkelvoud met precies dit meervoud ondubbelzinnig?',
          detail:
            'Bronnen staan in de provenance van elke oefening. Een feitelijke broncontrole is geen onderwijskundige goedkeuring.',
        },
        {
          id: 'explanation',
          title: 'Uitleg en terugkoppeling',
          question:
            'Leggen de stappen de verdubbeling begrijpelijk en juist uit?',
          detail:
            'Beoordeel het vaste uitlegpatroon en alle vijf korte klinkers. Uitleg wordt pas na een onjuiste herkansing getoond.',
        },
        {
          id: 'response',
          title: 'Antwoordregels en herhaling',
          question: 'Past de exacte spellingcontrole bij dit doel?',
          detail:
            'Alleen hoofdletters en buitenste spaties worden genegeerd. Alle varianten blijven één gecorreleerde familie; geen beheersing of toetsvoorraad.',
        },
      ],
      inventory: report.items,
    },
    null,
    2,
  ),
);
