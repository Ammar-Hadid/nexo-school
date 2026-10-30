import type { GuardianSubject } from '@/components/guardian-ui/subject-icon';
import { practiceTasks } from '@/modules/practice/journey/practice-journey-tasks';

const collections = [
  {
    id: 'rekenen-1',
    subject: 'rekenen',
    title: 'Optellen en aftrekken',
    category: 'Optellen en aftrekken',
  },
  {
    id: 'reading-1',
    subject: 'lezen',
    title: 'Een tekst begrijpen',
    category: 'Tekstbegrip',
  },
  {
    id: 'spelling-1',
    subject: 'spelling',
    title: 'Meervouden schrijven',
    category: 'Meervouden',
  },
  {
    id: 'redactiesommen-1',
    subject: 'rekenen',
    title: 'Rekenen in een verhaal',
    category: 'Redactiesommen',
  },
  {
    id: 'taal-1',
    subject: 'taal',
    title: 'Woorden in een zin',
    category: 'Taalvaardigheid',
  },
] as const satisfies readonly {
  id: string;
  subject: GuardianSubject;
  title: string;
  category: string;
}[];

/** Render-only material from existing immutable practice specimens. These local
 * review decisions are never content certificates, inventory or publication. */
export const contentPreviewCollections = collections.map((collection) => {
  const task = practiceTasks.find((item) => item.id === collection.id);
  if (!task) throw new Error('Missing Guardian review specimen');
  return {
    ...collection,
    instruction: task.definition.instruction,
    readingText: task.definition.readingText,
    questions: [
      task.definition.previewQuestion(0),
      task.definition.previewQuestion(1),
    ],
  };
});
