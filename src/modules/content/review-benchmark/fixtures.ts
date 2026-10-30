export const benchmarkVersion = 'synthetic-review-benchmark-v1';
export const modelProfiles = ['fake-checker-v1', 'fake-pass-all-v1'] as const;
export type ModelProfile = (typeof modelProfiles)[number];
export const defectCodes = [
  'wrong-key',
  'ambiguity',
  'wrong-unit',
  'vocabulary',
  'missing-evidence',
  'answer-leakage',
  'grammar',
  'objective-mismatch',
] as const;
export type DefectCode = (typeof defectCodes)[number];
export type Candidate = {
  id: string;
  subject: string;
  category: string;
  objective: string;
  prompt: string;
  passage: string;
  options: string[];
  rubric: string;
  answer: string;
  explanation: string;
};
export type BenchmarkCase = {
  candidate: Candidate;
  expected: {
    code: DefectCode;
    severity: 'blocking' | 'attention';
    rationale: string;
  }[];
};
function item(
  id: string,
  changes: Partial<Candidate>,
  expected: BenchmarkCase['expected'] = [],
): BenchmarkCase {
  return {
    candidate: {
      id,
      subject: 'Taal',
      category: 'Woordenschat',
      objective: 'Een synoniem herkennen.',
      prompt: 'Welk woord betekent hetzelfde als blij?',
      passage: '',
      options: ['vrolijk', 'boos'],
      rubric: 'Kies precies één correct antwoord; gebruik gewone woorden.',
      answer: 'vrolijk',
      explanation: 'Blij en vrolijk betekenen hier hetzelfde.',
      ...changes,
    },
    expected,
  };
}
// Authored development fixtures and proposed labels, NOT human-adjudicated or a held-out set.
export const benchmarkCases: BenchmarkCase[] = [
  item('c01', {
    subject: 'Rekenen',
    category: 'Optellen',
    objective: 'Eencijferige getallen optellen.',
    prompt: '3 + 4 =',
    options: [],
    rubric: 'Geef één geheel getal.',
    answer: '7',
    explanation: 'Tel vier op bij drie: zeven.',
  }),
  item('c02', {}),
  item('c03', {
    subject: 'Spelling',
    category: 'Werkwoorden',
    objective: 'De persoonsvorm kiezen.',
    prompt: 'Kies de juiste vorm: hij ... naar huis.',
    options: ['loopt', 'lopen'],
    answer: 'loopt',
    explanation: 'Bij hij hoort hier loopt.',
  }),
  item('c04', {
    subject: 'Begrijpend Lezen',
    category: 'Letterlijk begrip',
    objective: 'Een gegeven uit de tekst ophalen.',
    passage: 'Noor draagt een rode jas.',
    prompt: 'Welke kleur heeft de jas van Noor?',
    options: [],
    answer: 'rood',
    explanation: 'In de tekst staat dat de jas rood is.',
  }),
  item(
    'c05',
    {
      subject: 'Rekenen',
      category: 'Optellen',
      objective: 'Eencijferige getallen optellen.',
      prompt: '8 + 7 =',
      options: [],
      rubric: 'Geef één geheel getal.',
      answer: '14',
      explanation: 'Acht plus zeven is veertien.',
    },
    [
      {
        code: 'wrong-key',
        severity: 'blocking',
        rationale: 'Eight successors after seven gives fifteen, not fourteen.',
      },
    ],
  ),
  item('c06', { options: ['vrolijk', 'opgewekt'], answer: 'vrolijk' }, [
    {
      code: 'ambiguity',
      severity: 'blocking',
      rationale:
        'Both vrolijk and opgewekt can mean blij; the rubric permits one choice.',
    },
  ]),
  item(
    'c07',
    {
      subject: 'Rekenen',
      category: 'Meten',
      objective: 'Een lengte in centimeters benoemen.',
      prompt:
        'Een potlood is 12 centimeter lang. Geef de lengte in centimeter.',
      options: [],
      answer: '12 meter',
      explanation: 'De lengte is twaalf meter.',
    },
    [
      {
        code: 'wrong-unit',
        severity: 'blocking',
        rationale:
          'The supplied key changes centimeter into meter without conversion.',
      },
    ],
  ),
  item(
    'c08',
    {
      objective: 'Een alledaags woord zonder vaktaal herkennen.',
      prompt: 'Welk woord beschrijft fotosynthese?',
      options: ['voedselvorming', 'slapen'],
      answer: 'voedselvorming',
      rubric:
        'Gebruik uitsluitend alledaagse woorden; vermijd biologische vaktaal.',
      explanation: 'Fotosynthese is voedselvorming met behulp van licht.',
    },
    [
      {
        code: 'vocabulary',
        severity: 'attention',
        rationale:
          'Fotosynthese conflicts with this explicit no-technical-vocabulary specification; no school-level calibration is claimed.',
      },
    ],
  ),
  item(
    'c09',
    {
      subject: 'Begrijpend Lezen',
      category: 'Letterlijk begrip',
      objective: 'Een gegeven uit de tekst ophalen.',
      passage: 'Noor gaat naar buiten.',
      prompt: 'Welke kleur heeft de jas van Noor?',
      options: [],
      answer: 'rood',
      explanation: 'Haar jas is rood.',
    },
    [
      {
        code: 'missing-evidence',
        severity: 'blocking',
        rationale: 'The text supplies no jacket or colour information.',
      },
    ],
  ),
  item(
    'c10',
    {
      subject: 'Begrijpend Lezen',
      category: 'Letterlijk begrip',
      objective: 'Zelfstandig een gegeven ophalen.',
      passage:
        'Noor telt haar appels. Eerder zichtbare feedback bij vraag 1: Noor heeft drie appels.',
      prompt: 'Hoeveel appels heeft Noor?',
      options: [],
      answer: 'drie',
      explanation: 'Noor heeft drie appels.',
    },
    [
      {
        code: 'answer-leakage',
        severity: 'blocking',
        rationale:
          'Previously visible feedback supplies the answer to the later question; review the whole reveal dependency.',
      },
    ],
  ),
  item(
    'c11',
    {
      subject: 'Spelling',
      category: 'Werkwoorden',
      objective: 'De persoonsvorm kiezen.',
      prompt: 'Kies de juiste vorm: hij ... naar huis.',
      options: ['loopt', 'lopen'],
      answer: 'lopen',
      explanation: 'Hij lopen is de juiste vorm.',
    },
    [
      {
        code: 'grammar',
        severity: 'blocking',
        rationale:
          'Hij requires loopt here, not lopen; this is not an intentionally preserved learner error.',
      },
    ],
  ),
  item(
    'c12',
    {
      subject: 'Rekenen',
      category: 'Optellen',
      objective: 'Twee getallen optellen.',
      prompt: 'Welk dier miauwt?',
      options: ['kat', 'hond'],
      answer: 'kat',
      explanation: 'Een kat miauwt.',
    },
    [
      {
        code: 'objective-mismatch',
        severity: 'blocking',
        rationale: 'Animal recognition collects no addition evidence.',
      },
    ],
  ),
];
