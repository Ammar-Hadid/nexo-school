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
const studentLabels = {
  planned: 'Straks beginnen',
  active: 'Goed bezig!',
  review: 'Even samen kijken',
  completed: 'Goed gedaan!',
};
const studentMessages = {
  planned: 'Kies straks een sessie om mee te beginnen.',
  active: 'Elke sessie brengt je een stapje verder.',
  review: 'Je bent klaar! Vraag Ammar om samen te kijken.',
  completed: 'Je hebt dit blok af. Tijd voor jouw gamepas!',
};
const marks = { planned: '○', active: '◔', review: '!', completed: '✓' };

export function PracticeBlockCard({
  block,
  headingLevel = 3,
  audience = 'student',
}: {
  block: PracticeBlockView;
  headingLevel?: 3 | 4;
  audience?: 'student' | 'guardian';
}) {
  const student = audience === 'student';
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
      data-audience={audience}
      aria-labelledby={titleId}
    >
      <div className={styles.top}>
        <span className={styles.number}>
          <span className={styles.numberBadge} aria-hidden="true">
            {block.state === 'completed' ? '✓' : block.number}
          </span>
          Blok {block.number}
        </span>
        <span className={styles.status}>
          <span aria-hidden="true">{marks[block.state]}</span>
          {student ? studentLabels[block.state] : blockLabels[block.state]}
        </span>
      </div>
      <Heading id={titleId} className={styles.title}>
        {block.title}
      </Heading>
      <p className={styles.subjects}>{block.subjects}</p>
      {student && (
        <p className={styles.encouragement}>{studentMessages[block.state]}</p>
      )}
      <div className={styles.progressText}>
        <span>{student ? 'Al gedaan' : 'Sessies klaar'}</span>
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
      {student && (
        <div className={styles.steps} aria-hidden="true">
          {block.sessions.map((session, index) => (
            <span key={session.id} data-status={session.status}>
              {session.status === 'done' ? '✓' : index + 1}
            </span>
          ))}
        </div>
      )}
      <p className={styles.availability}>
        {student ? block.studentAvailability : block.availability}
      </p>
      {block.carryoverNote && (
        <p className={styles.carryover}>{block.carryoverNote}</p>
      )}
      <div className={styles.pass}>
        <div>
          <span className={styles.passLabel}>
            {student ? 'Jouw gamepas' : 'Gamepas'}
          </span>
          <strong>{block.passMinutes} minuten gamen</strong>
          <span>
            {block.state === 'completed'
              ? student
                ? 'Verdiend! Gebruik hem vandaag.'
                : 'Verdiend · vandaag te gebruiken'
              : block.state === 'review'
                ? student
                  ? 'Nog even wachten op Ammar.'
                  : 'Nog niet verdiend · eerst jouw beoordeling'
                : student
                  ? 'Voor als dit blok helemaal af is.'
                  : 'Nog niet verdiend'}
          </span>
        </div>
      </div>
      <Button
        variant={student && block.state === 'active' ? 'primary' : 'outline'}
        size={student ? 'medium' : 'small'}
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
                {student && session.status === 'review'
                  ? 'Samen kijken'
                  : sessionLabels[session.status]}
              </span>
            </li>
          ))}
        </ol>
        {block.state === 'review' && (
          <p className={styles.reviewNote}>
            {student
              ? 'Laat deze sessie aan Ammar zien. Hij kijkt met je mee.'
              : 'De gemarkeerde sessie is beantwoord, maar telt pas mee na jouw beoordeling. Het beoordelen zelf valt buiten deze preview.'}
          </p>
        )}
      </div>
    </article>
  );
}
