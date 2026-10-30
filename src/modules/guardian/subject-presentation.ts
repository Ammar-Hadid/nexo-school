import type { GuardianSubject } from '@/components/guardian-ui/subject-icon';

/** Display adapter for existing localized task titles, never a skill mapping. */
export function subjectForTitle(title: string): GuardianSubject {
  const labels = title
    .toLocaleLowerCase('nl')
    .split(' · ')
    .map((part) => part.trim())
    .reverse();
  for (const label of labels) {
    if (label === 'begrijpend lezen' || label === 'lezen') return 'lezen';
    if (label === 'spelling') return 'spelling';
    if (label === 'taal') return 'taal';
    if (label === 'rekenen' || label === 'redactiesommen') return 'rekenen';
  }
  return 'rekenen';
}
export function guardianTaskTitle(title: string) {
  const display = title.replace(/\btaak\b/gi, (word) =>
    word === 'Taak' ? 'Sessie' : 'sessie',
  );
  return display.startsWith('Redactiesommen')
    ? `Rekenen · ${display}`
    : display;
}
