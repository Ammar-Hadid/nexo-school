/** Closed, source-checked bank; this is not an algorithm for arbitrary Dutch plurals. */
export const doublingVersion = 'spelling-doubling-v1';
const rule = 'https://woordenlijst.org/zoeken/leidraad/2/2.html';
const examples =
  'https://www.vlaanderen.be/team-taaladvies/spellingregels/medeklinkers/medeklinkers-2-enkele-of-dubbele-medeklinker';
const forms =
  'https://codex.vlaanderen.be/Portals/Codex/documenten/1004653.html';
export const doublingBank = [
  { singular: 'kat', plural: 'katten', vowel: 'a', source: examples },
  { singular: 'kip', plural: 'kippen', vowel: 'i', source: examples },
  { singular: 'pet', plural: 'petten', vowel: 'e', source: examples },
  { singular: 'pop', plural: 'poppen', vowel: 'o', source: examples },
  { singular: 'net', plural: 'netten', vowel: 'e', source: rule },
  { singular: 'big', plural: 'biggen', vowel: 'i', source: rule },
  { singular: 'kop', plural: 'koppen', vowel: 'o', source: forms },
  { singular: 'mug', plural: 'muggen', vowel: 'u', source: forms },
  { singular: 'rem', plural: 'remmen', vowel: 'e', source: rule },
  { singular: 'bal', plural: 'ballen', vowel: 'a', source: examples },
] as const;
function entry(index: number) {
  if (!Number.isSafeInteger(index) || !doublingBank[index])
    throw new Error('UNKNOWN_SPELLING_BANK_WORD');
  return doublingBank[index]!;
}
export function doublingQuestion(index: number) {
  const w = entry(index),
    last = w.singular.at(-1)!;
  // Independent explicit dictionary forms above are the key; the rule must agree.
  if (w.singular + last + 'en' !== w.plural)
    throw new Error('SPELLING_BANK_RULE_MISMATCH');
  return {
    prompt: `één ${w.singular} → twee …`,
    answer: w.plural,
    steps: [
      `In ${w.singular} staat een korte ${w.vowel}. Die blijft kort in het meervoud.`,
      `Schrijf daarom twee keer de ${last} en zet er en achter: ${w.singular} → ${w.plural}.`,
    ],
  };
}
/** Matches the approved standalone Spelling response policy; never autocorrect. */
export function doublingCorrect(index: number, answer: string) {
  return (
    answer.length <= 40 &&
    answer.trim().toLocaleLowerCase('nl-NL') === entry(index).plural
  );
}
/** Stable across bank/wording revisions. Practice only; no assessment or retention stock. */
export function doublingExposure(index: number) {
  return `spelling:consonant-doubling:${entry(index).singular}`;
}
