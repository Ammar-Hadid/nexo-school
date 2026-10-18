'use client';

import { useState } from 'react';
import { PracticeBlockCard } from './practice-block-card';
import { blockExamples } from './practice-block.fixtures';
import {
  BlockCollectionState,
  PracticeBlockContext,
} from './practice-block-context';
import styles from './practice-block-review.module.css';

export function BlockRecoveryExample() {
  const [recovered, setRecovered] = useState(false);
  return (
    <>
      <BlockCollectionState
        state={recovered ? 'empty' : 'error'}
        onRetry={() => setRecovered(true)}
      />
      <span role="status">{recovered ? 'Voorbeeld opnieuw geladen.' : ''}</span>
    </>
  );
}

export function PracticeBlockReview() {
  return (
    <main className={styles.review}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>nexo School · componentreview 01</span>
        <h1>Oefenblokken</h1>
        <p>
          In één blik: wat is af, wat wacht op jou en is de gamepas verdiend?
        </p>
        <span className={styles.reviewLabel}>
          Ter beoordeling · 18 oktober 2026
        </span>
        <nav className={styles.jumps} aria-label="Onderdelen van de blokreview">
          <a href="#states">Alle toestanden</a>
          <a href="#desktop">Desktop</a>
          <a href="#iphone">iPhone</a>
        </nav>
      </header>
      <section id="states" className={styles.section}>
        <h2>Eén blok, vier momenten</h2>
        <p className={styles.intro}>
          Hetzelfde voorbeeldblok door de dag heen. Open de sessies om de opbouw
          te bekijken.
        </p>
        <div className={styles.grid}>
          {blockExamples.map((block) => (
            <PracticeBlockCard key={block.state} block={block} />
          ))}
        </div>
        <aside className={styles.note}>
          <strong>Klaar is niet altijd goedgekeurd.</strong>
          <p>
            Bij 5 van 5 beantwoorde sessies kan er nog één op jouw beoordeling
            wachten. De gamepas is dan nog niet verdiend. Groen verschijnt pas
            wanneer alle sessies meetellen.
          </p>
        </aside>
        <h2>Als de planning nog niet zichtbaar is</h2>
        <div className={styles.systemGrid}>
          <BlockCollectionState state="empty" />
          <BlockCollectionState state="loading" />
          <BlockRecoveryExample />
        </div>
      </section>
      <section id="desktop" className={styles.section}>
        <h2>In het desktopoverzicht</h2>
        <p className={styles.intro}>
          De goedgekeurde header en inklapbare zijbalk. Wissel de
          voorbeeldsituatie om elke toestand te bekijken.
        </p>
        <PracticeBlockContext name="Desktop oefenblokken" expanded />
      </section>
      <section id="iphone" className={styles.section}>
        <h2>Op de iPhone</h2>
        <p className={styles.intro}>
          Dezelfde informatie, onder elkaar. Met de goedgekeurde navigatie
          onderin.
        </p>
        <div className={styles.phone}>
          <PracticeBlockContext name="iPhone oefenblokken" />
        </div>
      </section>
      <footer className={styles.note}>
        <strong>Een ontwerp om samen te beoordelen.</strong>
        <p>
          Alle gegevens zijn voorbeelden. Vijf sessies en twintig gameminuten
          zijn geen vaste daglimiet. Een leessessie bevat de vragen bij één
          tekst. Alleen de sessielijst, voorbeeldkeuze en navigatie reageren;
          planning, beoordeling en gamepassen zijn nog niet gekoppeld.
        </p>
      </footer>
    </main>
  );
}
