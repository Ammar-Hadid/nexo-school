'use client';

import { useId, useState } from 'react';
import { Button } from '../button/button';
import {
  GuardianNavigation,
  destinations,
  type GuardianDestination,
} from '../guardian-navigation/guardian-navigation';
import { AttentionState } from './attention-card';
import { ExampleCard, examples } from './attention-examples';
import styles from './attention-review.module.css';

export function AttentionContext({
  name,
  expanded = false,
}: {
  name: string;
  expanded?: boolean;
}) {
  const [page, setPage] = useState<GuardianDestination>('overview');
  const [scenario, setScenario] = useState('attention');
  const selectId = useId();
  const quiet = scenario === 'empty';
  const systemState =
    scenario === 'empty' || scenario === 'loading' || scenario === 'error'
      ? scenario
      : null;
  const shown = examples.filter((item) =>
    scenario === 'attention'
      ? item.id === 'session' || item.id === 'higher'
      : item.id === scenario,
  );
  const label = destinations.find((item) => item.id === page)?.label;
  return (
    <div role="group" aria-label={name}>
      <div className={styles.previewControls}>
        <label htmlFor={selectId}>Voorbeeldsituatie</label>
        <select
          id={selectId}
          value={scenario}
          onChange={(event) => {
            setScenario(event.target.value);
            setPage('overview');
          }}
        >
          <option value="attention">Twee aandachtspunten</option>
          <option value="session">Taak beoordelen</option>
          <option value="higher">Niveau omhoog</option>
          <option value="support">Extra ondersteuning</option>
          <option value="blocker">Geblokkeerde browser</option>
          <option value="empty">Rustige dag</option>
          <option value="loading">Bezig met ophalen</option>
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
          <span className={styles.small}>Adam · voorbeeldgegevens</span>
          <h3>{label}</h3>
          {page === 'overview' ? (
            <>
              <p className={styles.contextIntro}>
                {quiet
                  ? 'Alles rustig. Je bent weer bij.'
                  : scenario === 'loading'
                    ? 'Je overzicht wordt opgehaald.'
                    : scenario === 'error'
                      ? 'Je overzicht is nog niet compleet.'
                      : 'Dit vraagt even om jouw aandacht.'}
              </p>
              <div className={styles.contextHeading}>
                <h4>Jouw aandacht</h4>
                <span className={styles.count}>
                  {systemState === 'loading' || systemState === 'error'
                    ? 'Nog onbekend'
                    : quiet
                      ? '0 punten'
                      : `${shown.length} ${shown.length === 1 ? 'punt' : 'punten'}`}
                </span>
              </div>
              <div className={styles.stack}>
                {systemState ? (
                  <AttentionState
                    state={systemState}
                    headingLevel={4}
                    onRetry={() => setScenario('attention')}
                  />
                ) : (
                  shown.map((item) => (
                    <ExampleCard key={item.id} item={item} headingLevel={4} />
                  ))
                )}
              </div>
              <div className={styles.today}>
                <h4>Vandaag</h4>
                <p>Blok 1 · afgerond</p>
                <p>
                  Blok 2 ·{' '}
                  {scenario === 'attention' || scenario === 'session'
                    ? 'wacht op jouw beoordeling'
                    : 'nog niet gestart'}
                </p>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setPage('planning')}
                >
                  Bekijk de weekplanning
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.detail}>
              <p>
                Je bent bij {label?.toLowerCase()}. Deze preview richt zich op
                aandachtspunten in het overzicht.
              </p>
              <Button variant="outline" onClick={() => setPage('overview')}>
                Terug naar overzicht
              </Button>
            </div>
          )}
        </div>
      </GuardianNavigation>
    </div>
  );
}
