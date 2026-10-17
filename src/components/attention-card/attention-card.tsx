'use client';

import { useId } from 'react';
import { Button } from '../button/button';
import './attention.tokens.css';
import styles from './attention-card.module.css';

export type AttentionKind = 'review' | 'recommendation' | 'support' | 'blocker';
export type AttentionCardProps = {
  kind: AttentionKind;
  title: string;
  summary: string;
  metadata: string;
  headingLevel?: 3 | 4;
  action: {
    label: string;
    onSelect: () => void;
    expanded?: boolean;
    controls?: string;
  };
};
const labels = {
  review: 'Sessie gemarkeerd',
  recommendation: 'Klaar voor een volgende stap',
  support: 'Extra ondersteuning',
  blocker: 'Kan niet verder',
};
const paths = {
  review: 'M4 4h16v12H9l-5 4V4Z M8 8h8 M8 12h5',
  support: 'M9 18h6 M9 21h6 M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z',
  recommendation: 'M4 18 10 12 14 15 21 6 M15 6h6v6',
  blocker: 'M12 3 22 21H2L12 3Z M12 9v5 M12 17v1',
};
export function AttentionCard({
  kind,
  title,
  summary,
  metadata,
  action,
  headingLevel = 3,
}: AttentionCardProps) {
  const titleId = useId();
  const Heading = headingLevel === 4 ? 'h4' : 'h3';
  return (
    <article className={styles.card} data-kind={kind} aria-labelledby={titleId}>
      <div className={styles.topline}>
        <span className={styles.icon} aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={paths[kind]} />
          </svg>
        </span>
        <span className={styles.kind}>{labels[kind]}</span>
      </div>
      <Heading id={titleId} className={styles.title}>
        {title}
      </Heading>
      <p className={styles.summary}>{summary}</p>
      <div className={styles.bottom}>
        <p className={styles.metadata}>{metadata}</p>
        <Button
          variant="outline"
          size="small"
          aria-expanded={action.expanded}
          aria-controls={action.controls}
          onClick={action.onSelect}
        >
          {action.label}
        </Button>
      </div>
    </article>
  );
}

export function AttentionState({
  state,
  onRetry,
  headingLevel = 3,
}: {
  state: 'empty' | 'loading' | 'error';
  onRetry?: () => void;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 4 ? 'h4' : 'h3';
  if (state === 'loading')
    return (
      <div className={styles.quiet} role="status" aria-busy="true">
        <span className={styles.loadingMark} aria-hidden="true">
          ···
        </span>
        <div>
          <Heading>Aandachtspunten ophalen</Heading>
          <p>We kijken of er iets voor je klaarstaat.</p>
        </div>
      </div>
    );
  if (state === 'error')
    return (
      <div className={styles.quiet} data-error="true">
        <span className={styles.stateMark} aria-hidden="true">
          !
        </span>
        <div>
          <Heading>Aandachtspunten niet geladen</Heading>
          <p>
            We kunnen nu niet zien of er iets op je wacht. Probeer het opnieuw.
          </p>
          {onRetry && (
            <Button variant="outline" size="small" onClick={onRetry}>
              Opnieuw proberen
            </Button>
          )}
        </div>
      </div>
    );
  return (
    <div className={styles.quiet}>
      <span className={styles.stateMark} aria-hidden="true">
        ✓
      </span>
      <div>
        <Heading>Je hoeft nu niets te doen</Heading>
        <p>Er staan geen sessies, adviezen of blokkades op je te wachten.</p>
      </div>
    </div>
  );
}
