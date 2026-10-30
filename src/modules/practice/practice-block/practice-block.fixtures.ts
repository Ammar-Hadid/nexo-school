import type {
  BlockState,
  SessionView,
  PracticeBlockView,
} from './practice-block.types';
const sessions: SessionView[] = [
  { id: 'r1', title: 'Rekenen · taak 1', questions: 10, status: 'planned' },
  { id: 'r2', title: 'Rekenen · taak 2', questions: 10, status: 'planned' },
  { id: 's1', title: 'Spelling · taak 1', questions: 10, status: 'planned' },
  { id: 't1', title: 'Taal · taak 1', questions: 10, status: 'planned' },
  {
    id: 'b1',
    title: 'Begrijpend lezen · één tekst',
    questions: 6,
    status: 'planned',
  },
];
const snapshots: Record<BlockState, SessionView['status'][]> = {
  planned: ['planned', 'planned', 'planned', 'planned', 'planned'],
  active: ['done', 'done', 'active', 'planned', 'planned'],
  review: ['done', 'done', 'review', 'done', 'done'],
  completed: ['done', 'done', 'done', 'done', 'done'],
};
export const blockExamples: PracticeBlockView[] = (
  ['planned', 'active', 'review', 'completed'] as const
).map((state) => ({
  state,
  number: 1,
  title: 'Na school',
  subjects: 'Rekenen · spelling · taal · begrijpend lezen',
  passMinutes: 20,
  studentAvailability:
    state === 'planned'
      ? 'Dit blok komt eerst.'
      : state === 'active'
        ? 'Kies zelf welke taak je nu doet.'
        : state === 'review'
          ? 'Ammar kijkt nog naar één taak.'
          : 'Alle taken zijn klaar!',
  availability:
    state === 'planned'
      ? 'Dit blok is als eerste aan de beurt.'
      : state === 'active'
        ? 'Adam kiest de volgorde van de taken.'
        : state === 'review'
          ? '1 taak wacht op jouw beoordeling.'
          : 'Alle taken tellen mee voor de gamepas.',
  sessions: sessions.map((session, index) => ({
    ...session,
    status: snapshots[state][index] ?? 'planned',
  })),
}));
export const laterBlock: PracticeBlockView = {
  state: 'planned',
  number: 2,
  title: 'Voor het avondeten',
  subjects: 'Redactiesommen · taal',
  passMinutes: 15,
  availability: 'Aan de beurt na blok 1.',
  studentAvailability: 'Eerst blok 1, daarna dit blok.',
  sessions: [
    {
      id: 'w1',
      title: 'Redactiesommen · taak 1',
      questions: 10,
      status: 'planned',
    },
    {
      id: 'w2',
      title: 'Redactiesommen · taak 2',
      questions: 10,
      status: 'planned',
    },
    { id: 't2', title: 'Taal · taak 1', questions: 10, status: 'planned' },
  ],
};

/** Review-only destination. Application routing supplies its own URL later. */
export function tasksPreviewHref(block: PracticeBlockView) {
  return `./iframe.html?id=components-practice-tasks--tasks-page&viewMode=story&args=state:${block.state}`;
}
