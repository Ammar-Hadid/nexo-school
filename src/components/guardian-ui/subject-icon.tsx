import {
  BookOpen,
  Calculator,
  CaseSensitive,
  Pencil,
  type LucideIcon,
} from 'lucide-react';
import styles from './guardian-ui.module.css';

/** Presentational identifiers, not curriculum rules. Labels and category ownership
 * remain with the host. This registry applies only to Guardian UI. */
export const guardianSubjects = {
  rekenen: { label: 'Rekenen', icon: Calculator },
  taal: { label: 'Taal', icon: CaseSensitive },
  spelling: { label: 'Spelling', icon: Pencil },
  lezen: { label: 'Begrijpend Lezen', icon: BookOpen },
} satisfies Record<string, { label: string; icon: LucideIcon }>;
export type GuardianSubject = keyof typeof guardianSubjects;

export function SubjectIcon({
  subject,
  size = 'medium',
}: {
  subject: GuardianSubject;
  size?: 'small' | 'medium' | 'large';
}) {
  const Icon = guardianSubjects[subject].icon;
  return (
    <span
      className={styles.subjectIcon}
      data-subject={subject}
      data-size={size}
      aria-hidden="true"
    >
      <Icon size={22} strokeWidth={1.75} />
    </span>
  );
}

export function SubjectLabel({
  subject,
  category,
}: {
  subject: GuardianSubject;
  category?: string;
}) {
  return (
    <span className={styles.subjectLabel}>
      <SubjectIcon subject={subject} size="small" />
      <span>
        {guardianSubjects[subject].label}
        {category ? ` · ${category}` : ''}
      </span>
    </span>
  );
}
