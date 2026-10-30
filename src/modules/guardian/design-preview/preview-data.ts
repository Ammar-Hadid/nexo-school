import { guardianReviewFixture } from '../../practice/guardian-results/guardian-results.fixtures';
import { guardianResult } from '../../practice/guardian-results/guardian-result-model';
import { practiceTasks } from '../../practice/journey/practice-journey-tasks';

// Synthetic review material only. No account, API, storage or scheduler connection.
const snapshots = guardianReviewFixture();
export const resultTasks = practiceTasks.map((task) => ({
  id: task.id,
  title: `${task.definition.subject} · sessie ${task.number}`,
  readingText: task.definition.readingText,
  result: guardianResult(task.definition, snapshots[task.id]),
}));
export const weekdays = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag',
];
export const subjects = [
  'Rekenen · Optellen',
  'Taal · Werkwoorden',
  'Spelling · Meervouden',
  'Begrijpend Lezen',
];
export type DayPlan = { counts: number[]; minutes: number };
export const initialWeek: DayPlan[] = weekdays.map((_, day) => ({
  counts: day < 5 ? [1, 1, 1, 0] : [0, 0, 0, 0],
  minutes: 20,
}));
export const taskCount = (plan: DayPlan) =>
  plan.counts.reduce((sum, count) => sum + count, 1);
export const planDescription = (plan: DayPlan) =>
  `${taskCount(plan)} sessies · ${plan.minutes} minuten per gamepas`;
