/** Shared synthetic review lifecycle; no persistence or production grading. */
export const scenarios = {
  question: 'Vraag beantwoorden',
  correct: 'Goed in één keer',
  incorrect: 'Eerste antwoord onjuist',
  retry: 'Dezelfde vraag opnieuw',
  retryCorrect: 'Goed bij tweede kans',
  retryIncorrect: 'Tweede antwoord onjuist + uitleg',
  result: 'Eindscore',
  perfect: 'Alle vragen in één keer goed',
  support: 'Samen verder oefenen',
} as const;
export type Scenario = keyof typeof scenarios;
export type Outcome = 'open' | 'queued' | 'first' | 'second' | 'missed';
export type PreviewState = {
  index: number;
  retry: boolean;
  stage: 'answer' | 'feedback' | 'result';
  outcomes: Outcome[];
  queue: number[];
  retryIndex: number;
  submitted: string;
  attempts: {
    index: number;
    retry: boolean;
    answer: string;
    correct: boolean;
  }[];
};
export function initialPreview(
  scenario: Scenario,
  correctAnswer: string,
  incorrectAnswer: string,
  questionCount = 10,
): PreviewState {
  const state: PreviewState = {
    index: 0,
    retry: false,
    stage: 'answer',
    outcomes: Array.from({ length: questionCount }, () => 'open'),
    queue: [],
    retryIndex: 0,
    submitted: '',
    attempts: [],
  };
  if (scenario === 'question') return state;
  if (scenario === 'perfect' || scenario === 'support') {
    return {
      ...state,
      stage: 'result',
      outcomes: Array.from({ length: questionCount }, () =>
        scenario === 'perfect' ? 'first' : 'missed',
      ),
    };
  }
  state.index = 3;
  state.outcomes = Array.from({ length: questionCount }, (_, i) =>
    i < 3 ? 'first' : 'open',
  );
  if (scenario === 'correct' || scenario === 'incorrect') {
    state.stage = 'feedback';
    state.submitted = scenario === 'correct' ? correctAnswer : incorrectAnswer;
    state.outcomes[3] = scenario === 'correct' ? 'first' : 'queued';
    state.queue = scenario === 'incorrect' ? [3] : [];
    return state;
  }
  state.outcomes = Array.from({ length: questionCount }, (_, i) =>
    i === 3 || i === 8 ? 'queued' : 'first',
  );
  state.queue = [3, 8];
  state.retry = true;
  if (scenario === 'retryCorrect' || scenario === 'retryIncorrect') {
    state.stage = 'feedback';
    state.submitted =
      scenario === 'retryCorrect' ? correctAnswer : incorrectAnswer;
    state.outcomes[3] = scenario === 'retryCorrect' ? 'second' : 'missed';
  }
  if (scenario === 'result') {
    state.stage = 'result';
    state.outcomes[3] = 'second';
    state.outcomes[8] = 'missed';
  }
  return state;
}
export function recordPreviewAnswer(
  state: PreviewState,
  answer: string,
  correct: boolean,
): PreviewState {
  if (state.stage !== 'answer') return state;
  const outcomes = [...state.outcomes];
  outcomes[state.index] = correct
    ? state.retry
      ? 'second'
      : 'first'
    : state.retry
      ? 'missed'
      : 'queued';
  return {
    ...state,
    stage: 'feedback',
    submitted: answer,
    attempts: [
      ...state.attempts,
      { index: state.index, retry: state.retry, answer, correct },
    ],
    outcomes,
    queue:
      !correct && !state.retry ? [...state.queue, state.index] : state.queue,
  };
}
export function advancePreview(state: PreviewState): PreviewState {
  if (state.stage !== 'feedback') return state;
  if (!state.retry && state.index < state.outcomes.length - 1)
    return { ...state, index: state.index + 1, stage: 'answer', submitted: '' };
  const firstRetry = state.queue[0];
  if (!state.retry && firstRetry !== undefined)
    return {
      ...state,
      stage: 'answer',
      retry: true,
      index: firstRetry,
      submitted: '',
    };
  const nextRetry = state.queue[state.retryIndex + 1];
  if (state.retry && nextRetry !== undefined)
    return {
      ...state,
      index: nextRetry,
      retryIndex: state.retryIndex + 1,
      stage: 'answer',
      submitted: '',
    };
  return { ...state, stage: 'result' };
}

export function previewScore(outcomes: Outcome[]) {
  return outcomes.reduce(
    (score, outcome) =>
      score + (outcome === 'first' ? 1 : outcome === 'second' ? 0.5 : 0),
    0,
  );
}
