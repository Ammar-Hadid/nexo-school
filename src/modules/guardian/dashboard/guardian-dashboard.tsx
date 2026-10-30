'use client';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  HelpCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/button/button';
import {
  GuardianActionLink,
  GuardianEmpty,
  GuardianPanel,
  GuardianStatus,
  GuardianTextLink,
} from '@/components/guardian-ui/guardian-ui';
import {
  SubjectIcon,
  type GuardianSubject,
} from '@/components/guardian-ui/subject-icon';
import styles from './guardian-dashboard.module.css';

export type DashboardTask = {
  id: string;
  title: string;
  subject: GuardianSubject;
  description: string;
  complete: boolean;
  started: boolean;
  score?: string;
};
export function GuardianDashboard({
  tasks,
  attention,
  onOpenTask,
  onPlanning,
  onResults,
  featured,
  footer,
  onHelp,
}: {
  tasks: readonly DashboardTask[];
  attention: {
    title: string;
    description: string;
    label: string;
    action: () => void;
    href?: string;
    quiet?: boolean;
    warning?: boolean;
  };
  onOpenTask: (id: string) => void;
  onPlanning: () => void;
  onResults: () => void;
  featured?: {
    id: string;
    title: string;
    subject: GuardianSubject;
    score: string;
    description: string;
    next: string;
  };
  footer?: ReactNode;
  onHelp?: () => void;
}) {
  const AttentionIcon = attention.quiet ? Check : BookOpen;
  return (
    <div className={styles.dashboard}>
      <section
        className={styles.attention}
        data-quiet={attention.quiet}
        data-warning={attention.warning}
        aria-label="Volgende stap"
      >
        <span className={styles.attentionIcon}>
          <AttentionIcon size={29} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div>
          <span className={styles.attentionLabel}>
            {attention.quiet
              ? 'Alles op een rij'
              : attention.warning
                ? 'Dit vraagt aandacht'
                : 'Even samen kijken'}
          </span>
          <h2>{attention.title}</h2>
          <p>{attention.description}</p>
        </div>
        {attention.href ? (
          <GuardianActionLink href={attention.href}>
            {attention.label}
            <ArrowRight size={17} aria-hidden="true" />
          </GuardianActionLink>
        ) : (
          <Button onClick={attention.action}>
            {attention.label}
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
        )}
      </section>
      <div className={styles.mainGrid}>
        <GuardianPanel
          title="Oefensessies"
          action={
            <GuardianStatus>
              {tasks.filter((t) => t.complete).length} van {tasks.length}{' '}
              afgerond
            </GuardianStatus>
          }
        >
          {tasks.length ? (
            <ul className={styles.taskList}>
              {tasks.map((task) => (
                <li key={task.id}>
                  <SubjectIcon subject={task.subject} />
                  <div className={styles.taskText}>
                    <strong>{task.title}</strong>
                    <p className={styles.taskStatus}>
                      {task.complete ? (
                        <Check size={14} aria-hidden="true" />
                      ) : task.started ? (
                        <Clock3 size={14} aria-hidden="true" />
                      ) : (
                        <Circle size={14} aria-hidden="true" />
                      )}
                      <span>{task.description}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => onOpenTask(task.id)}
                  >
                    {task.complete ? 'Bekijk resultaat' : 'Bekijk sessie'}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <GuardianEmpty
              title="Hier verschijnen de oefensessies"
              action={
                <Button variant="outline" onClick={attention.action}>
                  {attention.label}
                </Button>
              }
            >
              <p>
                Volg de stap hierboven om verder te gaan. Klaargezette sessies
                en ingediende antwoorden vind je daarna hier terug.
              </p>
            </GuardianEmpty>
          )}
          <div className={styles.panelFooter}>
            <span>De leerling oefent in zijn eigen portaal.</span>
            <GuardianTextLink onClick={onResults}>
              Alle sessies
            </GuardianTextLink>
          </div>
        </GuardianPanel>
        <GuardianPanel
          title="Resultaat uitgelicht"
          action={
            <GuardianTextLink onClick={onResults}>
              Alle resultaten
            </GuardianTextLink>
          }
        >
          {featured ? (
            <div className={styles.featured}>
              <div className={styles.resultTitle}>
                <SubjectIcon subject={featured.subject} />
                <div>
                  <h3>{featured.title}</h3>
                  <p>Afgeronde oefensessie</p>
                </div>
                <strong className={styles.score}>
                  {featured.score}
                  <small> / 10</small>
                </strong>
              </div>
              <p className={styles.resultDescription}>{featured.description}</p>
              <div className={styles.resultAdvice}>
                <HelpCircle size={19} strokeWidth={1.75} aria-hidden="true" />
                <p>{featured.next}</p>
              </div>
              <Button onClick={() => onOpenTask(featured.id)}>
                Bekijk de vraag en het antwoord
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <GuardianEmpty title="Nog geen afgerond resultaat">
              <p>
                Een cijfer verschijnt wanneer alle pogingen zijn afgerond.
                Tussendoor kun je de ingediende antwoorden bekijken.
              </p>
            </GuardianEmpty>
          )}
        </GuardianPanel>
      </div>
      <div className={styles.mainGrid}>
        <section className={styles.shortcut}>
          <span className={styles.shortcutIcon}>
            <CalendarDays size={25} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <h2>Een ritme dat bij jullie past</h2>
            <p>Bekijk de planning en zet de volgende stap klaar.</p>
          </div>
          <Button variant="outline" size="small" onClick={onPlanning}>
            Bekijk planning
          </Button>
        </section>
        <section className={styles.shortcut}>
          <span className={styles.shortcutIcon}>
            <HelpCircle size={25} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <h2>Even hulp nodig?</h2>
            <p>Van oefeningen beoordelen tot resultaten bekijken.</p>
            {onHelp ? (
              <GuardianTextLink onClick={onHelp}>
                Hoe werkt het ouderportaal?
              </GuardianTextLink>
            ) : (
              <details>
                <summary>Zo gebruik je het ouderportaal</summary>
                <p>
                  Bekijk eerst de volgende stap. Onder Oefenmateriaal bereid je
                  inhoud voor en publiceer je die na beoordeling. Via Planning
                  zet je een sessie klaar; Resultaten toont het ingediende werk.
                </p>
              </details>
            )}
          </div>
        </section>
      </div>
      {footer}
    </div>
  );
}
