'use client';

import { useEffect, useRef } from 'react';
import { LearningBackdrop } from '../../../components/learning-backdrop/learning-backdrop';
import { Button } from '../../../components/button/button';
import type { PracticeBlockView, SessionView } from './practice-block.types';
import buttonStyles from '../../../components/button/button.module.css';
import './practice-block.tokens.css';
import styles from './practice-tasks.module.css';
import { PracticeTasksNexai } from './practice-tasks-nexai';

const taskLabels = {
  planned: 'Nog te doen',
  active: 'Al begonnen',
  review: 'Samen kijken',
  done: 'Klaar!',
};

/** Task overview; its practice owner supplies navigation and temporary progress. */
export function PracticeTasksPage({
  block,
  backHref,
  onBack,
  onChoose,
  returnTaskId,
  saved = false,
  previewNote = 'Ontwerpvoorbeeld · taakstatussen zijn voorbeelden.',
}: {
  block: PracticeBlockView;
  saved?: boolean;
  backHref: string;
  onBack?: () => void;
  onChoose: (task: SessionView) => void;
  returnTaskId?: string;
  previewNote?: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const actionRefs = useRef(new Map<string, HTMLButtonElement>());
  const hasTasks = block.sessions.length > 0;
  const allDone =
    hasTasks && block.sessions.every((task) => task.status === 'done');
  const hasAvailableTask = block.sessions.some(
    (task) => task.status === 'planned' || task.status === 'active',
  );
  const waitingForReview =
    !hasAvailableTask &&
    block.sessions.some((task) => task.status === 'review');
  const message = allDone
    ? 'Alle taken zijn klaar! Goed gedaan!'
    : waitingForReview
      ? 'Klaar! Vraag Ammar om samen te kijken.'
      : hasTasks
        ? 'Welke taak kies je?'
        : 'Er staan nog geen taken klaar.';

  useEffect(() => {
    const action = returnTaskId ? actionRefs.current.get(returnTaskId) : null;
    if (action) action.focus();
    else if (onBack) headingRef.current?.focus();
  }, [returnTaskId, onBack]);

  return (
    <LearningBackdrop>
      <main className={styles.page}>
        <aside className={styles.previewNote}>{previewNote}</aside>
        <a
          className={buttonStyles.button}
          data-variant="ghost"
          data-size="small"
          href={backHref}
          onClick={
            onBack
              ? (event) => {
                  event.preventDefault();
                  onBack();
                }
              : undefined
          }
        >
          {saved ? 'Afmelden' : '← Terug naar mijn blokken'}
        </a>
        <section className={styles.board} aria-label="Jouw takenoverzicht">
          <header className={styles.header}>
            <div className={styles.headingCopy}>
              <span className={styles.eyebrow}>
                {saved ? (
                  'Opgeslagen oefentaken'
                ) : (
                  <>
                    Blok {block.number} · {block.title}
                  </>
                )}
              </span>
              <h1 ref={headingRef} tabIndex={-1}>
                Jouw taken
              </h1>
              <p>
                {allDone
                  ? saved
                    ? 'Je taken zijn afgerond.'
                    : 'Dit blok is afgerond.'
                  : waitingForReview
                    ? 'Even samen kijken.'
                    : hasTasks
                      ? 'Kies zelf de volgorde.'
                      : 'Kom later nog eens kijken.'}
              </p>
            </div>
            <PracticeTasksNexai message={message} />
          </header>
          <ul className={styles.tasks} aria-label={`Taken in ${block.title}`}>
            {block.sessions.map((session, index) => (
              <li
                key={session.id}
                className={styles.task}
                data-status={session.status}
              >
                <span className={styles.marker} aria-hidden="true">
                  {session.status === 'done' ? '✓' : index + 1}
                </span>
                <div className={styles.description}>
                  <h2>{session.title}</h2>
                  <p>
                    {session.questions} vragen <span aria-hidden="true">·</span>{' '}
                    {taskLabels[session.status]}
                  </p>
                </div>
                {(session.status === 'active' ||
                  session.status === 'planned' ||
                  session.status === 'done') && (
                  <Button
                    aria-label={`${session.status === 'done' ? 'Bekijk resultaat' : session.status === 'active' ? 'Ga verder' : 'Start taak'}: ${session.title}`}
                    variant={
                      session.status === 'active' ? 'primary' : 'outline'
                    }
                    ref={(node) => {
                      if (node) actionRefs.current.set(session.id, node);
                      else actionRefs.current.delete(session.id);
                    }}
                    onClick={() => {
                      onChoose(session);
                    }}
                  >
                    {session.status === 'done'
                      ? 'Bekijk resultaat'
                      : session.status === 'active'
                        ? 'Ga verder'
                        : 'Start taak'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
        <p className={styles.footnote}>
          {saved
            ? 'Bewaar je concept voordat je een taak sluit.'
            : 'De vragen bij één leestekst blijven samen in één taak.'}
        </p>
      </main>
    </LearningBackdrop>
  );
}
