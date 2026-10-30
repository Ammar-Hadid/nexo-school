import {
  initialPreview as createPreview,
  recordPreviewAnswer,
  type PreviewState,
  type Scenario,
} from '../exercise/exercise-preview';
export {
  scenarios,
  advancePreview,
  previewScore,
} from '../exercise/exercise-preview';

/** Original synthetic reading bundle. No curriculum level, publication or mastery claim. */
export const readingText = {
  title: 'Een tuin voor iedereen',
  paragraphs: [
    'Achter de school ligt een vergeten hoek van het plein. Er staan drie lege plantenbakken en tussen de tegels groeit onkruid. In de pauze loopt bijna iedereen eraan voorbij. Noor vindt dat jammer. Ze stelt voor om van de hoek een kleine tuin te maken. Daar kunnen kinderen rustig zitten en kunnen bijen voedsel vinden. Haar klas mag een plan bedenken.',
    'De volgende ochtend bekijkt de klas de plek. Kian wil meteen zonnebloemen planten, maar Noor stelt voor om eerst goed te kijken. Ze ontdekken dat er naast de muur bijna de hele dag schaduw is. Bij het hek schijnt juist veel zon. Daarom tekenen ze op hun plattegrond twee verschillende vakken. Niet elke plant heeft immers dezelfde hoeveelheid zon nodig.',
    'Dan komt conciërge Sam kijken. Hij raadt aan om bloemen te kiezen die niet allemaal tegelijk bloeien. Zo kunnen bijen van het voorjaar tot het najaar voedsel vinden. Sam heeft nog een tip: laat ergens een klein hoopje takken liggen. Daar kunnen insecten schuilen. De klas besluit ook een smal pad vrij te houden, zodat niemand op de planten hoeft te stappen.',
    'Op vrijdag brengen de kinderen oude potten van thuis mee. Ze hoeven daardoor minder nieuwe spullen te kopen. In één pot zit een barst. Kian wil hem weggooien, maar Noor legt hem voorzichtig op zijn kant onder een struik. Nu is de kapotte pot een schuilplaats. Kian lacht: “Zelfs iets wat stuk is, kan nog handig zijn.”',
    'Na het planten maken de kinderen een rooster. Elke week controleert een ander groepje of de aarde droog is. Alleen dan geven ze water. Naast de tuin zetten ze een bordje: “Kijk gerust, maar laat de bloemen staan.” Ze willen dat iedereen van de tuin kan genieten en dat de bijen hun voedsel houden.',
    'Een maand later zitten Noor en Kian op het bankje bij de tuin. Er zoemt een bij boven de bloemen. Twee jongere kinderen wijzen naar een kever bij de takken. “Het is hier veel drukker geworden”, zegt Kian zacht. Noor knikt. Er spelen niet méér kinderen op dit stukje plein, maar er is wel veel meer leven.',
  ],
} as const;

const questions = [
  {
    prompt: 'Waarom wil Noor een tuin maken?',
    choices: [
      'Om meer ruimte te maken voor balspellen.',
      'Om een rustige plek en voedsel voor bijen te maken.',
      'Om alle tegels van het schoolplein weg te halen.',
      'Om bloemen aan de buurt te verkopen.',
    ],
    correct: 'b',
    paragraph: 0,
    evidence:
      'Daar kunnen kinderen rustig zitten en kunnen bijen voedsel vinden.',
    reason:
      'Noor noemt twee doelen: een rustige plek voor kinderen en voedsel voor bijen.',
  },
  {
    prompt: 'Waarom tekenen de kinderen twee vakken op hun plattegrond?',
    choices: [
      'De klas bestaat uit twee groepjes.',
      'Sam wil twee verschillende paden.',
      'Elke plant moet een eigen vak krijgen.',
      'De ene plek krijgt meer zon dan de andere.',
    ],
    correct: 'd',
    paragraph: 1,
    evidence: 'Niet elke plant heeft immers dezelfde hoeveelheid zon nodig.',
    reason:
      'Bij de muur is schaduw en bij het hek is veel zon. De vakken helpen om planten een geschikte plek te geven.',
  },
  {
    prompt:
      'Waarom adviseert Sam bloemen die op verschillende momenten bloeien?',
    choices: [
      'Dan vinden bijen een groot deel van het jaar voedsel.',
      'Dan hoeven de kinderen nooit water te geven.',
      'Dan krijgen alle bloemen dezelfde kleur.',
      'Dan is de tuin binnen één dag klaar.',
    ],
    correct: 'a',
    paragraph: 2,
    evidence: 'Zo kunnen bijen van het voorjaar tot het najaar voedsel vinden.',
    reason:
      'Verschillende bloeitijden zorgen ervoor dat er langer bloemen met voedsel voor bijen zijn.',
  },
  {
    prompt: 'Waarvoor dient het hoopje takken?',
    choices: [
      'Om het smalle pad af te sluiten.',
      'Om de plantenbakken te vullen.',
      'Als schuilplek voor insecten.',
      'Als brandhout voor de school.',
    ],
    correct: 'c',
    paragraph: 2,
    evidence: 'Daar kunnen insecten schuilen.',
    reason:
      '“Daar” verwijst naar het hoopje takken. Insecten kunnen zich ertussen verstoppen.',
  },
  {
    prompt:
      'Wat betekent “daardoor” in: “Ze hoeven daardoor minder nieuwe spullen te kopen”?',
    choices: [
      'Doordat de kinderen oude potten meenemen.',
      'Doordat de tuin naast de school ligt.',
      'Doordat Kian een pot wil weggooien.',
      'Doordat er een struik in de tuin staat.',
    ],
    correct: 'a',
    paragraph: 3,
    evidence: 'Op vrijdag brengen de kinderen oude potten van thuis mee.',
    reason:
      'De oude potten worden opnieuw gebruikt. Daarom zijn er minder nieuwe spullen nodig.',
  },
  {
    prompt: 'Wat laat Noor zien door de kapotte pot te bewaren?',
    choices: [
      'Dat iedere pot gerepareerd moet worden.',
      'Dat een kapotte pot beter is voor bloemen.',
      'Dat de klas geen afvalbak heeft.',
      'Dat een kapot voorwerp een nieuwe functie kan krijgen.',
    ],
    correct: 'd',
    paragraph: 3,
    evidence: 'Nu is de kapotte pot een schuilplaats.',
    reason:
      'De pot krijgt een ander gebruik: hij biedt een dier een plek om te schuilen.',
  },
  {
    prompt: 'Wanneer geven de kinderen de planten water?',
    choices: [
      'Elke ochtend, ook als het regent.',
      'Als de aarde droog is.',
      'Alleen op de dag dat ze planten.',
      'Zodra ze een bij zien.',
    ],
    correct: 'b',
    paragraph: 4,
    evidence:
      'Elke week controleert een ander groepje of de aarde droog is. Alleen dan geven ze water.',
    reason:
      'Eerst controleren de kinderen de aarde. Ze geven alleen water als dat nodig is.',
  },
  {
    prompt: 'Waarom mogen bezoekers de bloemen niet plukken?',
    choices: [
      'De bloemen zijn nog niet geteld.',
      'De bloemen zijn alleen voor Sam.',
      'Iedereen moet ervan kunnen genieten en bijen hebben ze nodig.',
      'De kinderen willen ze later verkopen.',
    ],
    correct: 'c',
    paragraph: 4,
    evidence:
      'Ze willen dat iedereen van de tuin kan genieten en dat de bijen hun voedsel houden.',
    reason:
      'Door de bloemen te laten staan blijven ze beschikbaar voor bezoekers én bijen.',
  },
  {
    prompt: 'Wat bedoelt Kian aan het einde met “veel drukker”?',
    choices: [
      'Er zijn meer dieren en insecten te zien.',
      'Er spelen veel meer kinderen.',
      'De kinderen hebben meer huiswerk.',
      'Er rijden meer auto’s langs de school.',
    ],
    correct: 'a',
    paragraph: 5,
    evidence:
      'Er spelen niet méér kinderen op dit stukje plein, maar er is wel veel meer leven.',
    reason:
      'Kian ziet onder andere een bij en een kever. Met de drukte bedoelt hij het dierenleven.',
  },
  {
    prompt: 'Welke zin vat het verhaal het beste samen?',
    choices: [
      'Kian leert hoe hij een kapotte pot kan repareren.',
      'Sam legt uit waarom kinderen niet buiten mogen spelen.',
      'Een klas verkoopt planten om nieuwe spullen te kopen.',
      'Een klas verandert een vergeten plek in een tuin voor mensen en dieren.',
    ],
    correct: 'd',
    paragraph: 0,
    evidence: 'Ze stelt voor om van de hoek een kleine tuin te maken.',
    reason:
      'De klas bedenkt een plan, maakt de tuin en verzorgt hem. Aan het einde genieten kinderen en dieren ervan. Dit beschrijft het hele verhaal.',
  },
] as const;
const keys = ['a', 'b', 'c', 'd'];
export function previewQuestion(index: number) {
  const question = questions[index % questions.length]!;
  const options = question.choices.map((label, i) => ({
    value: keys[i]!,
    label,
  }));
  return {
    prompt: question.prompt,
    options,
    answer: options.find((option) => option.value === question.correct)!.label,
    correctChoice: question.correct,
    evidence: question.evidence,
    paragraph: question.paragraph,
    steps: [
      `In alinea ${question.paragraph + 1} staat: “${question.evidence}”`,
      question.reason,
    ],
  };
}
export function initialPreview(scenario: Scenario) {
  return createPreview(scenario, 'c', 'a', questions.length);
}
export function validateAnswer(answer: string) {
  return keys.includes(answer) ? '' : 'Kies eerst een antwoord.';
}
export function submitPreview(state: PreviewState, answer: string) {
  if (state.stage !== 'answer' || validateAnswer(answer)) return state;
  return recordPreviewAnswer(
    state,
    answer,
    answer === previewQuestion(state.index).correctChoice,
  );
}
