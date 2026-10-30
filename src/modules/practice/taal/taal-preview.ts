import {
  initialPreview as initialExercise,
  recordPreviewAnswer,
  type PreviewState,
  type Scenario,
} from '../exercise/exercise-preview';
export { advancePreview, previewScore } from '../exercise/exercise-preview';
export type { Scenario } from '../exercise/exercise-preview';

/** Original, synthetic design examples. No curriculum or educational publication approval. */
export const questions = [
  {
    prompt: 'De kat slaapt op de bank.',
    answer: 'slaapt',
    steps: [
      'Wat doet de kat? De kat slaapt.',
      'Slaapt vertelt wat de kat doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'Noor leest een boek.',
    answer: 'leest',
    steps: [
      'Wat doet Noor? Noor leest.',
      'Leest vertelt wat Noor doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'De hond rent door het park.',
    answer: 'rent',
    steps: [
      'Wat doet de hond? De hond rent.',
      'Rent vertelt wat de hond doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'Mila fietst naar school.',
    answer: 'fietst',
    steps: [
      'Wat doet Mila? Mila fietst.',
      'Fietst vertelt wat Mila doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'De vogel zingt in de boom.',
    answer: 'zingt',
    steps: [
      'Wat doet de vogel? De vogel zingt.',
      'Zingt vertelt wat de vogel doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'Amir tekent een huis.',
    answer: 'tekent',
    steps: [
      'Wat doet Amir? Amir tekent.',
      'Tekent vertelt wat Amir doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'De baby lacht naar papa.',
    answer: 'lacht',
    steps: [
      'Wat doet de baby? De baby lacht.',
      'Lacht vertelt wat de baby doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'Sara danst op de muziek.',
    answer: 'danst',
    steps: [
      'Wat doet Sara? Sara danst.',
      'Danst vertelt wat Sara doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'De vis zwemt in de vijver.',
    answer: 'zwemt',
    steps: [
      'Wat doet de vis? De vis zwemt.',
      'Zwemt vertelt wat de vis doet. Dat is het werkwoord.',
    ],
  },
  {
    prompt: 'Omar bouwt een toren.',
    answer: 'bouwt',
    steps: [
      'Wat doet Omar? Omar bouwt.',
      'Bouwt vertelt wat Omar doet. Dat is het werkwoord.',
    ],
  },
];
export { scenarios } from '../exercise/exercise-preview';

export function initialPreview(scenario: Scenario): PreviewState {
  return initialExercise(scenario, 'fietst', 'school');
}
export function previewQuestion(index: number) {
  const question = questions[index];
  if (!question) throw new Error('Unknown synthetic Taal question');
  return question;
}
export function validateAnswer(answer: string) {
  if (!answer.trim()) return 'Typ eerst een woord in.';
  if (!/^\p{L}{1,40}$/u.test(answer.trim())) return 'Typ één woord uit de zin.';
  return '';
}
export function submitPreview(
  state: PreviewState,
  answer: string,
): PreviewState {
  if (state.stage !== 'answer' || validateAnswer(answer)) return state;
  // This word-identification fixture ignores case and surrounding whitespace only.
  // It does not correct spelling, strip accents or grade unrestricted language.
  return recordPreviewAnswer(
    state,
    answer.trim(),
    answer.trim().toLocaleLowerCase('nl-NL') ===
      previewQuestion(state.index).answer,
  );
}
