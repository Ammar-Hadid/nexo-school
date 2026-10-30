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

/** Original fixed design specimens, not published or curriculum-approved content. */
export const questions = [
  {
    prompt: 'één kat → twee …',
    answer: 'katten',
    steps: [
      'In kat staat een korte a. Die blijft kort in katten.',
      'Schrijf daarom twee keer de t: kat → katten.',
    ],
  },
  {
    prompt: 'één hond → twee …',
    answer: 'honden',
    steps: [
      'Het woord hond eindigt op nd.',
      'Schrijf en achter hond: hond → honden.',
    ],
  },
  {
    prompt: 'één boom → twee …',
    answer: 'bomen',
    steps: [
      'De lange oo-klank blijft hetzelfde: boom → bomen.',
      'In de eerste open lettergreep bo schrijf je één o. Daarna volgt men: bomen.',
    ],
  },
  {
    prompt: 'één kip → twee …',
    answer: 'kippen',
    steps: [
      'In kip staat een korte i. Die blijft kort in kippen.',
      'Schrijf daarom twee keer de p: kip → kippen.',
    ],
  },
  {
    prompt: 'één raam → twee …',
    answer: 'ramen',
    steps: [
      'De lange aa-klank blijft hetzelfde: raam → ramen.',
      'In de eerste open lettergreep ra schrijf je één a. Daarna volgt men: ramen.',
    ],
  },
  {
    prompt: 'één boek → twee …',
    answer: 'boeken',
    steps: [
      'De letters oe blijven bij elkaar.',
      'Schrijf en achter boek: boek → boeken.',
    ],
  },
  {
    prompt: 'één pen → twee …',
    answer: 'pennen',
    steps: [
      'In pen staat een korte e. Die blijft kort in pennen.',
      'Schrijf daarom twee keer de n: pen → pennen.',
    ],
  },
  {
    prompt: 'één boot → twee …',
    answer: 'boten',
    steps: [
      'De lange oo-klank blijft hetzelfde: boot → boten.',
      'In de eerste open lettergreep bo schrijf je één o. Daarna volgt ten: boten.',
    ],
  },
  {
    prompt: 'één vis → twee …',
    answer: 'vissen',
    steps: [
      'In vis staat een korte i. Die blijft kort in vissen.',
      'Schrijf daarom twee keer de s: vis → vissen.',
    ],
  },
  {
    prompt: 'één tent → twee …',
    answer: 'tenten',
    steps: [
      'Het woord tent eindigt op nt.',
      'Schrijf en achter tent: tent → tenten.',
    ],
  },
];
export function initialPreview(scenario: Scenario): PreviewState {
  return initialExercise(scenario, 'kippen', 'kipen');
}
export function previewQuestion(index: number) {
  const question = questions[index];
  if (!question) throw new Error('Unknown synthetic Spelling question');
  return question;
}
export function validateAnswer(answer: string) {
  if (!answer.trim()) return 'Typ eerst een woord in.';
  if (answer.length > 40) return 'Gebruik maximaal 40 tekens.';
  return '';
}
export function submitPreview(
  state: PreviewState,
  answer: string,
): PreviewState {
  if (state.stage !== 'answer' || validateAnswer(answer)) return state;
  // Standalone plural-word objective: case and outer whitespace do not matter.
  // Keep misspellings, accents, punctuation and internal spaces intact.
  return recordPreviewAnswer(
    state,
    answer.trim(),
    answer.trim().toLocaleLowerCase('nl-NL') ===
      previewQuestion(state.index).answer,
  );
}
