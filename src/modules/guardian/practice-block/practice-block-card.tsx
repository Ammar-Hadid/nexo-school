'use client';

import { useId, useState } from 'react';
import { Button } from '../../../components/button/button';
import { blockLabels, type PracticeBlockView } from './practice-block.types';
import './practice-block.tokens.css';
import styles from './practice-block.module.css';

const sessionLabels = {
  planned: 'Nog te doen',
  active: 'Bezig',
  review: 'Ter beoordeling',
  done: 'Afgerond',
};
const marks = { planned: '○', active: '◔', review: '!', completed: '✓' };

export function PracticeBlockCard({
  block,
  headingLevel = 3,
}: {
  block: PracticeBlockView;
  headingLevel?: 3 | 4;
}) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const sessionsId = useId();
  const Heading = headingLevel === 4 ? 'h4' : 'h3';
  const finished = block.sessions.filter(
    (session) => session.status === 'done' || session.status === 'review',
  ).length;
  return (
    <article
      className={styles.card}
      data-state={block.state}
      aria-labelledby={titleId}
    >
      <div className={styles.top}>
        <span className={styles.number}>Blok {block.number}</span>
        <span className={styles.status}>
          <span aria-hidden="true">{marks[block.state]}</span>
          {blockLabels[block.state]}
        </span>
      </div>
      <Heading id={titleId} className={styles.title}>
        {block.title}
      </Heading>
      <p className={styles.subjects}>{block.subjects}</p>
      <div className={styles.progressText}>
        <span>Sessies klaar</span>
        <strong>
          {finished} van {block.sessions.length}
        </strong>
      </div>
      <progress
        className={styles.progress}
        max={block.sessions.length}
        value={finished}
        aria-label={`Sessies klaar in ${block.title}`}
      />
      <p className={styles.availability}>{block.availability}</p>
      {block.carryoverNote && (
        <p className={styles.carryover}>{block.carryoverNote}</p>
      )}
      <div className={styles.pass}>
        <svg
          className={styles.ticket}
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Z M16 5v3 M16 11v2 M16 16v3" />
        </svg>
        <div>
          <strong>Gamepas · {block.passMinutes} minuten</strong>
          <span>
            {block.state === 'completed'
              ? 'Verdiend · vandaag te gebruiken'
              : block.state === 'review'
                ? 'Nog niet verdiend · eerst jouw beoordeling'
                : 'Nog niet verdiend'}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="small"
        fullWidth
        aria-expanded={expanded}
        aria-controls={sessionsId}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Sluit sessies' : `Bekijk ${block.sessions.length} sessies`}
      </Button>
      <div id={sessionsId} hidden={!expanded} className={styles.details}>
        <ol
          className={styles.sessions}
          aria-label={`Sessies in ${block.title}`}
        >
          {block.sessions.map((session) => (
            <li key={session.id}>
              <div>
                <strong>{session.title}</strong>
                <span>{session.questions} vragen</span>
              </div>
              <span
                className={styles.sessionStatus}
                data-status={session.status}
              >
                {sessionLabels[session.status]}
              </span>
            </li>
          ))}
        </ol>
        {block.state === 'review' && (
          <p className={styles.reviewNote}>
            De gemarkeerde sessie is beantwoord, maar telt pas mee na jouw
            beoordeling. Het beoordelen zelf valt buiten deze preview.
          </p>
        )}
      </div>
    </article>
  );
}
