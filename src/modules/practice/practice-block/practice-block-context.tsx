'use client';

import { useId, useState } from 'react';
import { Button } from '../../../components/button/button';
import {
  GuardianNavigation,
  destinations,
  type GuardianDestination,
} from '../../../components/guardian-navigation/guardian-navigation';
import { PracticeBlockCard } from './practice-block-card';
import { blockExamples, laterBlock } from './practice-block.fixtures';
import { blockLabels } from './practice-block.types';
import styles from './practice-block-review.module.css';

export function PracticeBlockContext({
  name,
  expanded = false,
}: {
  name: string;
  expanded?: boolean;
}) {
  const [page, setPage] = useState<GuardianDestination>('overview');
  const [scenario, setScenario] = useState('active');
  const id = useId();
  const block = blockExamples.find((item) => item.state === scenario);
  const label = destinations.find((item) => item.id === page)?.label;
  return (
    <div role="group" aria-label={name}>
      <div className={styles.controls}>
        <label htmlFor={id}>Voorbeeldsituatie</label>
        <select
          id={id}
          value={scenario}
          onChange={(event) => {
            setScenario(event.target.value);
            setPage('overview');
          }}
        >
          {blockExamples.map((item) => (
            <option key={item.state} value={item.state}>
              {blockLabels[item.state]}
            </option>
          ))}
          <option value="empty">Geen blokken gepland</option>
          <option value="loading">Blokken ophalen</option>
          <option value="error">Ophalen mislukt</option>
        </select>
      </div>
      <GuardianNavigation
        current={page}
        label={name}
        mobileNavigation="bottom"
        initiallyExpanded={expanded}
        onNavigate={setPage}
        hrefFor={(destination) => `#voorbeeld-${destination}`}
      >
        <div className={styles.context}>
          <span className={styles.eyebrow}>Adam · voorbeeldgegevens</span>
          <h3>{label}</h3>
          {page === 'overview' ? (
            <>
              <p className={styles.intro}>Vandaag, stap voor stap.</p>
              <div className={styles.dayHeading}>
                <h4>Vandaag</h4>
                <span>
                  {block
                    ? '2 oefenblokken'
                    : scenario === 'empty'
                      ? 'Vrije dag'
                      : 'Nog onbekend'}
                </span>
              </div>
              <div className={styles.contextCards}>
                {block ? (
                  <>
                    <PracticeBlockCard
                      key={block.state}
                      block={block}
                      headingLevel={4}
                      audience="guardian"
                    />
                    <PracticeBlockCard
                      block={{
                        ...laterBlock,
                        availability:
                          block.state === 'completed'
                            ? 'Dit blok is nu aan de beurt.'
                            : laterBlock.availability,
                      }}
                      headingLevel={4}
                      audience="guardian"
                    />
                  </>
                ) : (
                  <BlockCollectionState
                    state={
                      scenario === 'empty' || scenario === 'loading'
                        ? scenario
                        : 'error'
                    }
                    onRetry={() => setScenario('active')}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <p>
                De inhoud van {label?.toLowerCase()} valt buiten deze
                kaartpreview.
              </p>
              <Button variant="outline" onClick={() => setPage('overview')}>
                Terug naar overzicht
              </Button>
            </>
          )}
        </div>
      </GuardianNavigation>
    </div>
  );
}

export function BlockCollectionState({
  state,
  onRetry,
}: {
  state: 'empty' | 'loading' | 'error';
  onRetry?: () => void;
}) {
  return (
    <div className={styles.collectionState} data-state={state}>
      <div
        role={state === 'loading' ? 'status' : undefined}
        aria-busy={state === 'loading' || undefined}
      >
        <strong>
          {state === 'empty'
            ? 'Vandaag geen oefenblokken'
            : state === 'loading'
              ? 'Oefenblokken ophalen…'
              : 'Oefenblokken niet geladen'}
        </strong>
        <p>
          {state === 'empty'
            ? 'Er staan voor vandaag geen blokken in de planning.'
            : state === 'loading'
              ? 'Even wachten. De voortgang is nog niet bekend.'
              : 'De voortgang is nu niet beschikbaar. Probeer het opnieuw.'}
        </p>
      </div>
      {state === 'error' && onRetry && (
        <Button variant="outline" size="small" onClick={onRetry}>
          Opnieuw proberen
        </Button>
      )}
    </div>
  );
}
