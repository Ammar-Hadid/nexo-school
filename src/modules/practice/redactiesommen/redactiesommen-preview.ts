import {
  initialPreview as initialExercise,
  recordPreviewAnswer,
  type PreviewState,
  type Scenario,
} from '../exercise/exercise-preview';
export {
  advancePreview,
  previewScore,
  scenarios,
} from '../exercise/exercise-preview';
export type { Scenario } from '../exercise/exercise-preview';

/** Original fixed story problems for design review, not published learning content. */
export const questions = [
  {
    prompt:
      'Voor een knutselmiddag op school verzamelt Noor stickers om kaarten te versieren. In haar bewaardoos zitten al 24 stickers. Haar tante geeft haar een nieuw vel met 18 stickers. Noor legt die allemaal bij de stickers in haar doos. Hoeveel stickers heeft Noor nu?',
    answer: 42,
    answerUnit: 'stickers',
    steps: [
      'Er komen stickers bij. Tel 24 en 18 bij elkaar op.',
      '24 + 18 = 42.',
      'Noor heeft nu 42 stickers.',
    ],
  },
  {
    prompt:
      'Amir neemt zijn verzameling van 56 knikkers mee naar het speelplein. Zijn zus wil ook meedoen, maar zij heeft zelf geen knikkers meegenomen. Daarom geeft Amir haar 19 knikkers uit zijn verzameling. De rest stopt hij weer in zijn eigen zak. Hoeveel knikkers houdt Amir over?',
    answer: 37,
    answerUnit: 'knikkers',
    steps: [
      'Amir geeft knikkers weg. Trek 19 van 56 af.',
      '56 − 19 = 37.',
      'Amir houdt 37 knikkers over.',
    ],
  },
  {
    prompt:
      'Voor de tekenles zet de juf 7 doosjes met potloden op de grote tafel in de klas. Alle doosjes zijn nog vol en in ieder doosje zitten 8 potloden. De kinderen mogen straks zelf een potlood uit een doosje kiezen. Hoeveel potloden zijn dat samen?',
    answer: 56,
    answerUnit: 'potloden',
    steps: [
      'Er zijn 7 gelijke groepjes van 8 potloden.',
      '7 × 8 = 56.',
      'Samen zijn dat 56 potloden.',
    ],
  },
  {
    prompt:
      'Mila bewaart haar knikkers in een glazen pot op haar kamer. Als ze ze telt, zitten er 36 knikkers in de pot. Haar broer ruimt zijn kamer op en geeft haar 27 knikkers die hij niet meer gebruikt. Mila stopt ze allemaal in haar pot. Hoeveel knikkers heeft Mila nu?',
    answer: 63,
    answerUnit: 'knikkers',
    steps: [
      'Er komen knikkers bij. Tel 36 en 27 bij elkaar op.',
      '36 + 27 = 63.',
      'Mila heeft nu 63 knikkers.',
    ],
  },
  {
    prompt:
      'In de leeshoek van de klas staat een boekenkast met 81 boeken. Voor de vakantie mogen de kinderen een boek mee naar huis nemen om daar verder te lezen. De kinderen lenen samen 34 boeken en nemen die mee. Hoeveel boeken blijven in de kast?',
    answer: 47,
    answerUnit: 'boeken',
    steps: [
      'Er gaan boeken uit de kast. Trek 34 van 81 af.',
      '81 − 34 = 47.',
      'Er blijven 47 boeken in de kast.',
    ],
  },
  {
    prompt:
      'Op de markt koopt de meester appels voor de sportdag van school. De appels zitten in zakken en iedere zak bevat precies 9 appels. Hij neemt 6 volle zakken mee en zet ze in de keuken klaar voor de kinderen. Hoeveel appels zijn dat samen?',
    answer: 54,
    answerUnit: 'appels',
    steps: [
      'Er zijn 6 gelijke groepjes van 9 appels.',
      '6 × 9 = 54.',
      'Samen zijn dat 54 appels.',
    ],
  },
  {
    prompt:
      'Sara heeft voor een picknick een trommel met 48 koekjes meegenomen. Er zitten 6 kinderen aan de picknicktafel. Ze wil alle koekjes eerlijk over de kinderen verdelen, zodat iedereen evenveel krijgt en er niets in de trommel achterblijft. Hoeveel koekjes krijgt ieder kind?',
    answer: 8,
    answerUnit: 'koekjes',
    steps: [
      'Verdeel de 48 koekjes in 6 gelijke groepjes.',
      '48 ÷ 6 = 8.',
      'Ieder kind krijgt 8 koekjes.',
    ],
  },
  {
    prompt:
      'Bij de knutselclub maken de kinderen armbanden van gekleurde kralen. Op tafel staat een grote bak met daarin 45 rode kralen en 38 blauwe kralen. Er zitten geen andere kralen in de bak en de kinderen zijn nog niet begonnen. Hoeveel kralen liggen er in de bak?',
    answer: 83,
    answerUnit: 'kralen',
    steps: [
      'Tel de rode en blauwe kralen bij elkaar op.',
      '45 + 38 = 83.',
      'In de bak liggen 83 kralen.',
    ],
  },
  {
    prompt:
      'Omar heeft 72 euro gespaard en gaat met zijn vader naar de boekwinkel. Daar ziet hij een groot boek over dieren dat hij graag wil hebben. Het boek kost 28 euro. Omar betaalt het helemaal van zijn eigen spaargeld en koopt verder niets. Hoeveel euro houdt Omar over?',
    answer: 44,
    answerUnit: 'euro',
    steps: [
      'Omar geeft 28 euro uit. Trek 28 van 72 af.',
      '72 − 28 = 44.',
      'Omar houdt 44 euro over.',
    ],
  },
  {
    prompt:
      'Voor de voorstelling op school worden stoelen in de zaal klaargezet. De conciërge maakt 9 rechte rijen met in iedere rij precies 7 stoelen. Alle bezoekers kunnen straks op deze stoelen gaan zitten. Er staan geen losse stoelen op een andere plek. Hoeveel stoelen staan er in de zaal?',
    answer: 63,
    answerUnit: 'stoelen',
    steps: [
      'Er zijn 9 gelijke rijen van 7 stoelen.',
      '9 × 7 = 63.',
      'In de zaal staan 63 stoelen.',
    ],
  },
];
export function initialPreview(scenario: Scenario): PreviewState {
  return initialExercise(scenario, '63', '53');
}
export function previewQuestion(index: number) {
  const question = questions[index];
  if (!question) throw new Error('Unknown synthetic Redactiesommen question');
  return question;
}
export function validateAnswer(answer: string) {
  return /^\d{1,6}$/.test(answer.trim()) ? '' : 'Typ eerst een getal in.';
}
export function submitPreview(
  state: PreviewState,
  answer: string,
): PreviewState {
  if (state.stage !== 'answer' || validateAnswer(answer)) return state;
  return recordPreviewAnswer(
    state,
    answer.trim(),
    Number(answer.trim()) === previewQuestion(state.index).answer,
  );
}
