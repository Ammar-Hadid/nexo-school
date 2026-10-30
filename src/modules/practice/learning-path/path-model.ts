import {
  ASSESSMENT_POLICY,
  assessmentLimits,
  isEligibleEvidence,
  type Facet,
} from '../assessment/assessment-policy';
import {
  blueprint,
  categoryAssessment,
  confirmationQuestions,
  numericalProbe,
  pathEvidence,
} from './path-assessment';
import type { ExerciseSnapshot } from '../exercise/exercise-definition';
import {
  advancePreview,
  initialPreview,
  recordPreviewAnswer,
} from '../exercise/exercise-preview';
import {
  categories,
  dailyQuestions,
  makeQuestions,
  purposeLabels,
  routes,
  subjects,
  type Category,
  type Purpose,
  type Question,
  type Subject,
} from './path-content';

export const POLICY = ASSESSMENT_POLICY;
export const MAX_DAY = 6;
export const histories = {
  known: 'Instapstof al bekend',
  gap: 'Eén gericht oefenpunt',
  unknown: 'Nog onvoldoende bewijs',
  conceptual: 'Procedure goed, begrip nog onzeker',
  transfer: 'Moeite met nieuwe toepassing',
  assisted: 'Goede antwoorden met hulp',
  guessing: 'Alle keuzevragen goed, bewijs ontbreekt',
  forgotten: 'Eerdere stof opnieuw bekijken',
} as const;
export type History = keyof typeof histories;
export type Assignment = {
  id: string;
  subject: Subject;
  category: Category | 'redactiesommen';
  purpose: Purpose;
  issuedDay: number;
  questions: Question[];
  reason: string;
  snapshot: ExerciseSnapshot;
  processed: boolean;
  started: boolean;
  completedDay?: number;
  attemptDays?: readonly number[];
  assistedItems?: readonly string[];
  decision?: ReturnType<typeof categoryAssessment>;
};
export type Route = {
  index: number;
  next: 'check' | 'practice' | 'confirm' | 'support';
  gaps: number[];
  failedChecks: number;
};
export type Retention = {
  subject: Subject;
  category: Category;
  due: number;
  next: 'retention' | 'repair' | 'support';
  gaps: number[];
  failures: number;
};
export type PathState = {
  day: number;
  history: History;
  tasks: Assignment[];
  days: Record<number, string[]>;
  routes: Record<Subject, Route>;
  retention: Retention[];
  notices: string[];
  holds: Partial<Record<Subject, boolean>>;
  overrides: { subject: Subject; held: boolean; reason: string; day: number }[];
};
export function dayLabel(day: number) {
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(Date.UTC(2026, 9, 22 + day, 12)));
}
export function taskTitle(task: Assignment) {
  return `${subjects[task.subject]} · ${task.category === 'redactiesommen' ? 'Redactiesommen' : categories[task.category].label} · ${purposeLabels[task.purpose]}`;
}
export function emptySnapshot(count: number): ExerciseSnapshot {
  return {
    state: initialPreview('question', '', '', count),
    answer: '',
    error: '',
  };
}
export function submit(
  task: Assignment,
  snapshot: ExerciseSnapshot,
  answer: string,
) {
  const value = answer.trim();
  const expected = task.questions[snapshot.state.index]!.answer;
  const correct =
    task.subject === 'rekenen'
      ? /^\d{1,6}$/.test(value) && Number(value) === Number(expected)
      : value.toLocaleLowerCase('nl-NL') ===
        expected.toLocaleLowerCase('nl-NL');
  return {
    ...snapshot,
    state: recordPreviewAnswer(snapshot.state, answer.trim(), correct),
    error: '',
  };
}

/** Evidence display is the same policy projection used by the route, never a score threshold. */
export function evidence(state: PathState, task: Assignment) {
  if (task.category === 'redactiesommen') return [];
  const result = task.decision ?? categoryAssessment(state, task.category);
  return result.skills.map((skill, objective) => ({
    objective,
    correct: skill.observations,
    observed: skill.observations,
    families: skill.families,
    demonstrated: skill.decision === 'ready-provisional',
    decision: skill.decision,
    missing: skill.missing,
    reason: skill.reason,
  }));
}

function createTask(
  state: PathState,
  subject: Subject,
  category: Assignment['category'],
  purpose: Purpose,
  reason: string,
  objectives = [0, 1],
): Assignment | undefined {
  const serial = state.tasks.length;
  const seen = new Set(
    state.tasks.flatMap((t) => t.questions.map((q) => q.id)),
  );
  const additionAvailable =
    categoryAssessment(state, 'optellen').decision === 'ready-provisional';
  const questions =
    category === 'redactiesommen'
      ? dailyQuestions(serial, additionAvailable)
      : purpose === 'confirm'
        ? confirmationQuestions(
            state,
            category,
            (objective) =>
              makeQuestions(category, 'check', serial, [objective], seen)[0],
          )
        : purpose === 'retention'
          ? objectives.flatMap((objective) => {
              for (let n = 0; n < 36; n++) {
                const q = numericalProbe(
                  category,
                  objective,
                  categoryAssessment(state, category).skills[objective]
                    ?.conflicts[0] ??
                    (state.day % 2 ? 'concept' : 'application'),
                  n,
                );
                if (q && !seen.has(q.id)) return [q];
              }
              return [];
            })
          : makeQuestions(category, purpose, serial, objectives, seen);
  if (
    !questions.length ||
    (purpose === 'retention' && questions.length !== objectives.length)
  )
    return undefined;
  return {
    id: `path-${serial}`,
    subject,
    category,
    purpose,
    issuedDay: state.day,
    questions,
    reason,
    snapshot: emptySnapshot(questions.length),
    processed: false,
    started: false,
  };
}
function addTask(
  state: PathState,
  task: Assignment | undefined,
  ids: string[],
) {
  if (task) {
    state.tasks.push(task);
    ids.push(task.id);
  }
}

/** Materialize once per preview date; never mutate previously issued work. Four slots maximum. */
export function issueDay(input: PathState): PathState {
  if (input.days[input.day]) return input;
  const state: PathState = {
    ...input,
    tasks: [...input.tasks],
    days: { ...input.days },
    notices: [],
  };
  const ids: string[] = [];
  const unfinished = (test: (task: Assignment) => boolean) =>
    state.tasks.find(
      (task) => test(task) && task.snapshot.state.stage !== 'result',
    );
  const daily = unfinished((task) => task.purpose === 'daily');
  if (daily) ids.push(daily.id);
  else
    addTask(
      state,
      createTask(
        state,
        'rekenen',
        'redactiesommen',
        'daily',
        'Elke kalenderdag: toepassen van beschikbare rekenstof. Alleen vergelijken totdat Optellen voorlopig voldoende is aangetoond.',
      ),
      ids,
    );
  for (const subject of ['rekenen', 'taal'] as const) {
    if (state.holds[subject]) continue;
    const carry = unfinished(
      (task) =>
        task.subject === subject &&
        ['check', 'practice', 'confirm'].includes(task.purpose),
    );
    if (carry) {
      ids.push(carry.id);
      continue;
    }
    const route = state.routes[subject];
    const category = routes[subject][route.index];
    if (!category || route.next === 'support') continue;
    if (categoryAssessment(state, category).missingPrerequisites.length) {
      state.notices.push(
        `${subjects[subject]}: de hoofdroute wacht op bewijs voor de vereiste voorkennis. Gericht terugkijken blijft beschikbaar.`,
      );
      continue;
    }
    const reason =
      route.next === 'check'
        ? 'Volgende categorie in de vaste route: eerst bewijs verzamelen.'
        : route.next === 'confirm'
          ? 'Gerichte nieuwe check van ontbrekend bewijs; eerdere geschikte observaties blijven meetellen.'
          : `Alleen het oefenpunt: ${route.gaps.map((o) => categories[category].objectives[o]).join(' en ')}. Daarna een nieuwe check.`;
    const task = createTask(
      state,
      subject,
      category,
      route.next,
      reason,
      route.next === 'practice' ? route.gaps : [0, 1],
    );
    if (!task)
      state.notices.push(
        `${subjects[subject]}: passende ongeziene vragen ontbreken voor het vereiste bewijs. Route wacht op inhoud; geen beheersing toegekend.`,
      );
    addTask(state, task, ids);
  }
  const carriedRetention = unfinished(
    (task) => task.purpose === 'retention' || task.purpose === 'repair',
  );
  if (carriedRetention) ids.push(carriedRetention.id);
  else {
    const due = [...state.retention]
      .filter((item) => item.due <= state.day && item.next !== 'support')
      .sort((a, b) => a.due - b.due)[0];
    if (due) {
      const task = createTask(
        state,
        due.subject,
        due.category,
        due.next === 'repair' ? 'repair' : 'retention',
        due.next === 'repair'
          ? 'Een eerdere check gaf een oefenpunt. Kort bijoefenen; de hoofdroute blijft staan.'
          : 'Uitgestelde check van eerder voorlopig aangetoonde doelen. Geen nieuwe categorie en geen reset van de hoofdroute.',
        due.next === 'repair' ? due.gaps : [0, 1],
      );
      if (!task)
        state.notices.push(
          `${categories[due.category].label}: retentie nog niet geverifieerd; ongeziene fixturevragen ontbreken.`,
        );
      addTask(state, task, ids);
    }
  }
  state.days[state.day] = ids;
  return state;
}

export function changeSnapshot(
  input: PathState,
  id: string,
  snapshot: ExerciseSnapshot,
): PathState {
  const original = input.tasks.find((task) => task.id === id);
  if (!original || original.processed) return input;
  const task = {
    ...original,
    snapshot,
    started: true,
    attemptDays: snapshot.state.attempts.map(
      (_, i) => original.attemptDays?.[i] ?? input.day,
    ),
  };
  const state: PathState = {
    ...input,
    tasks: input.tasks.map((item) => (item.id === id ? task : item)),
    routes: { ...input.routes },
    retention: input.retention.map((item) => ({ ...item })),
  };
  if (snapshot.state.stage !== 'result') return state;
  task.processed = true;
  task.completedDay = state.day;
  if (task.purpose === 'daily' || task.category === 'redactiesommen')
    return state;
  const assessment = categoryAssessment(state, task.category);
  task.decision = assessment;
  const gaps = assessment.skills.flatMap((item, objective) =>
    item.conflicts.length ? [objective] : [],
  );
  const currentEvidence = pathEvidence(state).filter(
    (e) =>
      e.session === task.id &&
      isEligibleEvidence(blueprint(task.category as Category), e, state.day),
  );
  const newError = currentEvidence.some((e) => !e.correct);
  if (task.purpose === 'retention' || task.purpose === 'repair') {
    const retained = state.retention.find(
      (item) => item.category === task.category,
    )!;
    retained.due = state.day + 1;
    if (task.purpose === 'repair') retained.next = 'retention';
    else if (newError) {
      retained.failures += 1;
      retained.gaps = gaps;
      retained.next =
        retained.failures >= assessmentLimits.recoveryFailures
          ? 'support'
          : 'repair';
    } else {
      retained.next = 'retention';
      if (!gaps.length && currentEvidence.length === task.questions.length) {
        retained.due = state.day + assessmentLimits.recheckDays;
        retained.gaps = [];
        retained.failures = 0;
      }
    }
    return state;
  }
  const route = { ...state.routes[task.subject] };
  state.routes[task.subject] = route;
  if (task.purpose === 'practice') {
    route.next = 'confirm';
    return state;
  }
  if (gaps.length && newError) {
    if (task.purpose === 'confirm') route.failedChecks += 1;
    route.next =
      assessment.decision === 'targeted-instruction' ||
      route.failedChecks >= assessmentLimits.unsuccessfulFollowups
        ? 'support'
        : 'practice';
    route.gaps = gaps;
  } else if (assessment.decision !== 'ready-provisional') {
    route.next = 'confirm';
    route.gaps = assessment.skills.flatMap((item, objective) =>
      item.decision !== 'ready-provisional' ? [objective] : [],
    );
  } else {
    state.retention.push({
      subject: task.subject,
      category: task.category,
      due: state.day + assessmentLimits.retentionDays,
      next: 'retention',
      gaps: [],
      failures: 0,
    });
    route.index += 1;
    route.next = 'check';
    route.gaps = [];
    route.failedChecks = 0;
  }
  return state;
}
export function nextDay(state: PathState): PathState {
  return state.day >= MAX_DAY
    ? state
    : issueDay({ ...state, day: state.day + 1 });
}

/** Genuine attempt records for review histories. Not observations about the real Adam. */
export function finishFixture(
  state: PathState,
  id: string,
  wrongObjectives: readonly number[] = [],
  wrongFacets: readonly Facet[] = [],
): PathState {
  const task = state.tasks.find((item) => item.id === id)!;
  let snapshot = task.snapshot;
  while (snapshot.state.stage !== 'result') {
    if (snapshot.state.stage === 'answer')
      snapshot = submit(
        task,
        snapshot,
        !snapshot.state.retry &&
          (wrongObjectives.includes(
            task.questions[snapshot.state.index]!.objective,
          ) ||
            wrongFacets.some(
              (f) =>
                f === task.questions[snapshot.state.index]!.assessment?.facet,
            ))
          ? task.subject === 'taal'
            ? 'anders'
            : '99999'
          : task.questions[snapshot.state.index]!.answer,
      );
    else
      snapshot = {
        state: advancePreview(snapshot.state),
        answer: '',
        error: '',
      };
  }
  return changeSnapshot(state, id, snapshot);
}
export function createPath(history: History): PathState {
  let state: PathState = {
    day: -1,
    history,
    tasks: [],
    days: {},
    routes: {
      rekenen: { index: 0, next: 'check', gaps: [], failedChecks: 0 },
      taal: { index: 0, next: 'check', gaps: [], failedChecks: 0 },
    },
    retention: [],
    notices: [],
    holds: {},
    overrides: [],
  };
  const task = createTask(
    state,
    'rekenen',
    'getalbegrip',
    'check',
    'Fictieve voorgeschiedenis: instapcheck, één dag voor de preview.',
  )!;
  state.tasks.push(task);
  if (history !== 'unknown')
    state = finishFixture(state, task.id, history === 'gap' ? [1] : []);
  else {
    const snapshot = submit(task, task.snapshot, task.questions[0]!.answer);
    state = changeSnapshot(state, task.id, {
      state: advancePreview(snapshot.state),
      answer: '',
      error: '',
    });
  }
  state = issueDay({ ...state, day: 0 });
  const confirmation = state.tasks.find((t) => t.purpose === 'confirm');
  if (
    confirmation &&
    ['conceptual', 'transfer', 'assisted', 'forgotten'].includes(history)
  ) {
    if (history === 'assisted')
      confirmation.assistedItems = confirmation.questions.map((q) => q.id);
    state = finishFixture(
      state,
      confirmation.id,
      [],
      history === 'conceptual'
        ? ['concept']
        : history === 'transfer'
          ? ['application']
          : [],
    );
    if (history === 'forgotten') {
      state = nextDay(nextDay(state));
      const retention = state.tasks.find((t) => t.purpose === 'retention');
      if (retention) state = finishFixture(state, retention.id, [1]);
    }
    state = nextDay(state);
  }
  if (history === 'guessing') {
    const taal = state.tasks.find((t) => t.subject === 'taal');
    if (taal) state = finishFixture(state, taal.id);
    state = nextDay(state);
  }
  return state;
}

/** Reversible review override; never creates or changes assessment evidence. Takes effect on future dates. */
export function setRouteHold(
  state: PathState,
  subject: Subject,
  held: boolean,
  reason: string,
): PathState {
  if (!reason.trim() || Boolean(state.holds[subject]) === held) return state;
  return {
    ...state,
    holds: { ...state.holds, [subject]: held },
    overrides: [
      ...state.overrides,
      { subject, held, reason: reason.trim(), day: state.day },
    ],
  };
}
