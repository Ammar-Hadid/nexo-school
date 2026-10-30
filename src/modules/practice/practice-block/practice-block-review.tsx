'use client';

import { useState } from 'react';
import { PracticeBlockCard } from './practice-block-card';
import { blockExamples, tasksPreviewHref } from './practice-block.fixtures';
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
        <span className={styles.eyebrow}>nexo School · componentreview 03</span>
        <h1>Oefenblokken</h1>
        <p>
          Voor Adam: kleine stappen, duidelijke voortgang en iets om naar uit te
          kijken.
        </p>
        <span className={styles.reviewLabel}>
          Ter beoordeling · 18 oktober 2026
        </span>
        <nav className={styles.jumps} aria-label="Onderdelen van de blokreview">
          <a href="#states">Alle toestanden</a>
          <a href="#adam">Voor Adam</a>
          <a href="#desktop">Ouderportaal</a>
          <a href="#iphone">iPhone</a>
        </nav>
      </header>
      <section id="states" className={styles.section}>
        <h2>Eén blok, vier momenten</h2>
        <p className={styles.intro}>
          Hetzelfde blok, nu voor Adam. Vriendelijkere taal, grotere knoppen en
          een zichtbaar stapje voor elke taak.
        </p>
        <div className={styles.grid}>
          {blockExamples.map((block) => (
            <PracticeBlockCard
              key={block.state}
              block={block}
              tasksHref={tasksPreviewHref(block)}
            />
          ))}
        </div>
        <aside className={styles.note}>
          <strong>Samen kijken, zonder beschuldiging.</strong>
          <p>
            Adam krijgt een rustige boodschap om Ammar erbij te halen. De rode
            beoordelingsstatus blijft in het ouderportaal. De gamepas wordt pas
            verdiend als alle taken meetellen.
          </p>
        </aside>
        <h2>Als de planning nog niet zichtbaar is</h2>
        <div className={styles.systemGrid}>
          <BlockCollectionState state="empty" />
          <BlockCollectionState state="loading" />
          <BlockRecoveryExample />
        </div>
      </section>
      <section id="adam" className={styles.section}>
        <h2>Een kijkje op Adams tablet</h2>
        <p className={styles.intro}>
          Klik op “Bekijk taken” om de aparte takenpagina te openen. Je kunt
          daar ook weer terug naar je blokken.
        </p>
        <div className={styles.studentStage}>
          <span className={styles.eyebrow}>Jouw oefenmoment</span>
          <h3>Hoi Adam, je bent al op weg!</h3>
          {blockExamples
            .filter((block) => block.state === 'active')
            .map((block) => (
              <PracticeBlockCard
                key={block.state}
                block={block}
                tasksHref={tasksPreviewHref(block)}
                headingLevel={4}
              />
            ))}
        </div>
        <aside className={styles.note}>
          <strong>De gamepas ontwerpen we hierna.</strong>
          <p>
            Het Blender-model en de weergave met Three.js krijgen een eigen
            review. Het tekstvak toont nu alleen de beloning en status; het is
            geen voorstel voor het uiteindelijke pasontwerp.
          </p>
        </aside>
      </section>
      <section id="desktop" className={styles.section}>
        <h2>Voor Ammar · desktop</h2>
        <p className={styles.intro}>
          De goedgekeurde header en inklapbare zijbalk. Wissel de
          voorbeeldsituatie om elke toestand te bekijken.
        </p>
        <PracticeBlockContext name="Desktop oefenblokken" expanded />
      </section>
      <section id="iphone" className={styles.section}>
        <h2>Voor Ammar · iPhone</h2>
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
          Alle gegevens zijn voorbeelden. Vijf taken en twintig gameminuten zijn
          geen vaste daglimiet. Een leestaak bevat de vragen bij één tekst. De
          takenpagina, voorbeeldkeuze en navigatie zijn klikbare
          ontwerpvoorbeelden; planning, beoordeling en gamepassen zijn nog niet
          gekoppeld.
        </p>
      </footer>
    </main>
  );
}
