import type { ItemEvidence } from '../assessment/assessment-policy';
export const CURRICULUM = 'synthetic-curriculum-v3';
export function skillId(category: Category, objective: number) {
  return `demo:${category}:${objective}`;
}

/** Bounded synthetic blueprints, not a published curriculum or learner assessment. */
export type Category =
  'getalbegrip' | 'optellen' | 'woordenschat' | 'woordsoorten';
export type Subject = 'rekenen' | 'taal';
export type Purpose =
  'check' | 'practice' | 'confirm' | 'retention' | 'repair' | 'daily';
export type Question = {
  id: string;
  objective: number;
  family: string;
  prompt: string;
  answerUnit?: string;
  answer: string;
  steps: string[];
  assessment?: Omit<ItemEvidence, 'family'>;
};
export const routes: Record<Subject, readonly Category[]> = {
  rekenen: ['getalbegrip', 'optellen'],
  taal: ['woordenschat', 'woordsoorten'],
};
export const subjects = { rekenen: 'Rekenen', taal: 'Taal' };
export const categories: Record<
  Category,
  { label: string; level: string; objectives: readonly [string, string] }
> = {
  getalbegrip: {
    label: 'Getalbegrip',
    level: 'Hele getallen tot 1.000',
    objectives: ['Plaatswaarde: tientallen', 'Getallen ordenen'],
  },
  optellen: {
    label: 'Optellen',
    level: 'Hele getallen tot 1.000',
    objectives: [
      'Optellen zonder tientalovergang',
      'Optellen met tientalovergang',
    ],
  },
  woordenschat: {
    label: 'Woordenschat',
    level: 'Bekende concrete woorden',
    objectives: ['Synoniemen herkennen', 'Tegenstellingen herkennen'],
  },
  woordsoorten: {
    label: 'Woordsoorten',
    level: 'Korte enkelvoudige zinnen',
    objectives: ['Werkwoorden herkennen', 'Zelfstandige naamwoorden herkennen'],
  },
};
export const purposeLabels: Record<Purpose, string> = {
  check: 'Startcheck',
  practice: 'Gericht oefenen',
  confirm: 'Nieuwe check',
  retention: 'Even terugkijken',
  repair: 'Kort bijoefenen',
  daily: 'Dagelijkse toepassing',
};
const synonyms = [
  ['blij', 'vrolijk', 'boos'],
  ['snel', 'vlug', 'traag'],
  ['kalm', 'rustig', 'druk'],
  ['fraai', 'mooi', 'lelijk'],
  ['kwaad', 'boos', 'blij'],
  ['slim', 'knap', 'dom'],
  ['reusachtig', 'enorm', 'klein'],
  ['starten', 'beginnen', 'stoppen'],
  ['eindigen', 'stoppen', 'beginnen'],
  ['praten', 'spreken', 'zwijgen'],
  ['roepen', 'schreeuwen', 'fluisteren'],
  ['dikwijls', 'vaak', 'zelden'],
  ['verdrietig', 'bedroefd', 'vrolijk'],
  ['moe', 'vermoeid', 'wakker'],
  ['bang', 'angstig', 'dapper'],
  ['stil', 'geluidloos', 'luidruchtig'],
  ['leuk', 'plezierig', 'vervelend'],
  ['stuk', 'kapot', 'heel'],
  ['dapper', 'moedig', 'bang'],
  ['gemakkelijk', 'eenvoudig', 'moeilijk'],
  ['moeilijk', 'lastig', 'eenvoudig'],
  ['vriendelijk', 'aardig', 'onaardig'],
  ['huis', 'woning', 'auto'],
  ['fiets', 'rijwiel', 'bus'],
] as const;
const opposites = [
  ['hoog', 'laag', 'groot'],
  ['warm', 'koud', 'heet'],
  ['vol', 'leeg', 'rond'],
  ['nat', 'droog', 'vochtig'],
  ['open', 'dicht', 'breed'],
  ['licht', 'donker', 'helder'],
  ['vroeg', 'laat', 'eerst'],
  ['breed', 'smal', 'lang'],
  ['oud', 'nieuw', 'stuk'],
  ['hard', 'zacht', 'stevig'],
  ['diep', 'ondiep', 'ver'],
  ['zwaar', 'licht', 'groot'],
  ['lang', 'kort', 'breed'],
  ['dag', 'nacht', 'middag'],
  ['voor', 'achter', 'naast'],
  ['links', 'rechts', 'boven'],
  ['binnen', 'buiten', 'boven'],
  ['schoon', 'vies', 'droog'],
  ['dichtbij', 'veraf', 'naast'],
  ['veel', 'weinig', 'genoeg'],
  ['goed', 'slecht', 'prima'],
  ['blij', 'verdrietig', 'vrolijk'],
  ['snel', 'langzaam', 'vlug'],
  ['sterk', 'zwak', 'stevig'],
] as const;
const verbs = [
  'loopt',
  'slaapt',
  'springt',
  'eet',
  'rent',
  'speelt',
  'kijkt',
  'wacht',
  'danst',
  'zingt',
  'zwemt',
  'rust',
  'leest',
  'schrijft',
  'tekent',
  'fietst',
  'klapt',
  'lacht',
  'kruipt',
  'huppelt',
  'fluit',
  'werkt',
  'luistert',
  'wandelt',
];
const nouns = [
  'hond',
  'kat',
  'jongen',
  'meisje',
  'vogel',
  'beer',
  'vos',
  'leeuw',
  'muis',
  'aap',
  'vis',
  'paard',
  'juf',
  'moeder',
  'vader',
  'broer',
  'zus',
  'oma',
  'slak',
  'konijn',
  'merel',
  'tuinman',
  'buurman',
  'opa',
];

/** Deterministic review shuffle, applied only at issue time. Not cryptographic randomness. */
function shuffled<T>(values: readonly T[], seed: string): T[] {
  let state = 2166136261;
  for (const char of seed)
    state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((state / 4294967296) * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/** Item identity includes the semantic item, not merely its assignment ID. */
function question(
  category: Category,
  objective: number,
  family: number,
  serial: number,
  presentationSeed: string,
): Question {
  const n = serial % 72;
  let prompt: string;
  let answer: string;
  let steps: string[];
  let semantic: string;
  if (category === 'getalbegrip') {
    const value = 123 + n * 10;
    if (objective === 0) {
      answer = String(Math.floor(value / 10) % 10);
      prompt =
        family === 0
          ? `Welk cijfer staat op de plaats van de tientallen in ${value}?`
          : `${Math.floor(value / 100)} honderdtallen, ? tientallen en 3 eenheden vormen ${value}. Welk cijfer ontbreekt?`;
      steps = [
        `Het rechter cijfer staat voor eenheden.`,
        `Het cijfer links daarvan staat voor tientallen: ${answer}.`,
      ];
    } else {
      answer = String(family === 0 ? value + 12 : value);
      const values = shuffled(
        family === 0
          ? [value, value + 12, value + 5]
          : [value + 9, value, value + 21],
        presentationSeed,
      );
      prompt = `Welk getal is het ${family === 0 ? 'grootst' : 'kleinst'}: ${values[0]}, ${values[1]} of ${values[2]}?`;
      steps = [
        'Vergelijk eerst de honderdtallen, dan de tientallen en dan de eenheden.',
        `Zo vind je ${answer}.`,
      ];
    }
    semantic = `${objective}:${value}`;
  } else if (category === 'optellen') {
    const units = objective === 1 ? 2 + (n % 7) : n % 9;
    const a = 100 + n * 10 + units;
    const b =
      10 * ((n * 3) % 5) +
      (objective === 1
        ? 11 - units + (n % (units - 1))
        : 1 + ((n * 5) % (9 - units)));
    const toTen = 10 - units;
    answer = String(a + b);
    prompt =
      family === 0 ? `${a} + ${b} = ?` : `Tel ${b} op bij ${a}. Wat krijg je?`;
    steps =
      objective === 1
        ? [
            `Vul eerst aan tot ${a + toTen}: tel ${toTen} erbij.`,
            `Tel de overige ${b - toTen} erbij: ${answer}.`,
          ]
        : [`Begin bij ${a}.`, `Tel er ${b} bij op: ${answer}.`];
    semantic = `${a}+${b}`;
  } else if (category === 'woordenschat') {
    const [word, correct, other] = (objective === 0 ? synonyms : opposites)[
      serial % 24
    ]!;
    answer = correct;
    const options = shuffled([correct, other], presentationSeed).join(' of ');
    prompt =
      objective === 0
        ? `${family === 0 ? 'Welk woord betekent hetzelfde als' : 'Kies een synoniem voor'} ‘${word}’: ${options}?`
        : `${family === 0 ? 'Wat is het tegenovergestelde van' : 'Kies de tegenstelling bij'} ‘${word}’: ${options}?`;
    steps = [
      `Lees de betekenis van ‘${word}’.`,
      objective === 0
        ? `‘${correct}’ betekent hier hetzelfde.`
        : `‘${correct}’ betekent hier het tegenovergestelde.`,
    ];
    semantic = `${objective}:${word}`;
  } else {
    const verb = verbs[serial % 24]!;
    const noun = nouns[serial % 24]!;
    const sentence =
      family === 0 ? `De ${noun} ${verb}.` : `Vandaag ${verb} de ${noun}.`;
    answer = objective === 0 ? verb : noun;
    prompt = `${objective === 0 ? 'Welk woord is het werkwoord' : 'Welk woord is het zelfstandige naamwoord'}? ${sentence}`;
    steps = [
      objective === 0
        ? 'Zoek het woord dat vertelt wat er gebeurt.'
        : 'Zoek het woord voor een mens of dier.',
      `Dat is ‘${answer}’.`,
    ];
    semantic = `${objective}:${noun}:${verb}`;
  }
  return {
    id: `${category}:${semantic}`,
    objective,
    family: `${category}:${objective}:procedure`,
    assessment: {
      contentVersion: 'path-bank-v3',
      evaluatorVersion: 'path-grading-v2',
      curriculumVersion: CURRICULUM,
      subject:
        category === 'getalbegrip' || category === 'optellen'
          ? 'rekenen'
          : 'taal',
      category,
      skill: skillId(category, objective),
      level: categories[category].level,
      facet: 'procedure',
      representation: 'symbolic',
      response:
        category === 'woordenschat' ||
        (category === 'getalbegrip' && objective === 1)
          ? 'choice'
          : 'constructed',
      role: 'assessed',
      review: 'synthetic',
    },
    prompt,
    answer,
    steps,
  };
}

export function makeQuestions(
  category: Category,
  purpose: Purpose,
  serial: number,
  objectives: readonly number[] = [0, 1],
  seen: ReadonlySet<string> = new Set(),
): Question[] {
  const count =
    purpose === 'practice'
      ? 10
      : purpose === 'retention'
        ? 2
        : purpose === 'repair'
          ? 4
          : 4;
  const result: Question[] = [];
  const practice = purpose === 'practice' || purpose === 'repair';
  // Disjoint semantic item pools: drills cannot consume unseen check inventory.
  // Twelve language items per objective in each pool; 36 numerical items per pool.
  const poolSize =
    category === 'getalbegrip' || category === 'optellen' ? 36 : 12;
  const used = new Set(practice ? [] : seen);
  for (let i = 0; i < count; i += 1) {
    const objective = objectives[i % objectives.length]!;
    const family = Math.floor(i / objectives.length) % 2;
    let candidate: Question | undefined;
    for (let offset = 0; offset < poolSize; offset += 1) {
      const item =
        ((serial * 4 + i + offset) % poolSize) + (practice ? poolSize : 0);
      const next = question(
        category,
        objective,
        family,
        item,
        `${category}:${purpose}:${serial}:${i}:${item}`,
      );
      if (!used.has(next.id)) {
        candidate = next;
        break;
      }
    }
    // Exhaustion is explicit; never recycle an exposed item as fresh evidence.
    if (!candidate) return [];
    result.push(candidate);
    used.add(candidate.id);
  }
  return result;
}

export function dailyQuestions(
  serial: number,
  additionAvailable: boolean,
): Question[] {
  return Array.from({ length: 10 }, (_, i) => {
    const a = 14 + serial * 10 + i;
    const b = 3 + i;
    const prompt = additionAvailable
      ? `Bij de schooltuin helpt Noor met het klaarzetten van potten voor de klas. Op de tafel staan al ${a} potten. Ze haalt nog ${b} potten uit de schuur en zet ze erbij. De leerlingen gaan straks samen zaadjes planten. Hoeveel potten staan er nu op de tafel?`
      : `Bij de schooltuin helpt Noor met het klaarzetten van potten voor de klas. Op de eerste tafel staan ${a} potten. Op de tweede tafel staan ${a + 5} potten. De leerlingen willen beginnen bij de tafel met de meeste potten. Hoeveel potten staan op die tafel?`;
    return {
      id: `daily:${serial}:${i}`,
      answerUnit: 'potten',
      objective: additionAvailable ? 1 : 0,
      family: additionAvailable ? 'addition-context' : 'compare-context',
      prompt,
      answer: String(additionAvailable ? a + b : a + 5),
      steps: additionAvailable
        ? [`Er staan eerst ${a} potten.`, `Tel ${b} erbij: ${a + b} potten.`]
        : [`Vergelijk ${a} en ${a + 5}.`, `${a + 5} is het grootste aantal.`],
    };
  });
}

/** User catalogue remainder: visibility metadata only, never eligible or assumed passed. */
export const uncoveredCatalogue = {
  Rekenen: [
    'Aftrekken',
    'Vermenigvuldigen',
    'Delen',
    'Hoofdrekenen',
    'Breuken',
    'Kommagetallen',
    'Geld',
    'Tijd en klokkijken',
    'Meten en meetkunde',
    'Verbanden, tabellen en grafieken',
  ],
  Taal: [
    'Zinsbouw en zinsontleding',
    'Werkwoorden',
    'Woordvorming',
    'Schrijven',
    'Spreken en luisteren',
  ],
  Spelling: [
    'Klankwoorden',
    'Regelwoorden',
    'Weetwoorden',
    'Hoofdletters en leestekens',
    'Spelling toepassen',
  ],
  'Begrijpend Lezen': [
    'Onderwerp en hoofdgedachte',
    'Informatie vinden',
    'Hoofd- en bijzaken',
    'Tekstsoorten en tekstdoelen',
    'Tekstopbouw',
    'Verbanden en signaalwoorden',
    'Verwijswoorden',
    'Woordbetekenis in context',
    'Begrijpen en interpreteren',
    'Samenvatten en reflecteren',
  ],
} as const;
