'use client';

import { useState } from 'react';
import { AttentionState } from './attention-card';
import { ExampleCard, examples } from './attention-examples';
import { AttentionContext } from './attention-context';
import styles from './attention-review.module.css';

export function RecoveryExample() {
  const [retried, setRetried] = useState(false);
  return (
    <div>
      <AttentionState
        state={retried ? 'empty' : 'error'}
        onRetry={() => setRetried(true)}
      />
      {retried && (
        <p role="status" className={styles.small}>
          Voorbeeld opnieuw geladen. Geen aandachtspunten gevonden.
        </p>
      )}
    </div>
  );
}

export function AttentionReview() {
  return (
    <main className={styles.review}>
      <header className={styles.header}>
        <a href="#states" className={styles.brand}>
          nexo School <span>/ Ontwerpsysteem</span>
        </a>
        <span className={styles.badge}>Aandachtskaarten · goedgekeurd 02</span>
      </header>
      <section className={styles.intro}>
        <span className={styles.eyebrow}>Ouderportaal / Jouw aandacht</span>
        <h1>
          Even aandacht.
          <br />
          Dan weer verder.
        </h1>
        <p>
          Wat speelt er, waarom zie je dit en wat kun je doen? Eén kaart, één
          duidelijke volgende stap.
        </p>
        <nav aria-label="Op deze reviewpagina" className={styles.jump}>
          <a href="#states">01 Alle toestanden</a>
          <a href="#desktop">02 Desktop</a>
          <a href="#iphone">03 iPhone</a>
        </nav>
      </section>
      <section id="states" className={styles.section}>
        <span className={styles.eyebrow}>01 / De kaarten</span>
        <h2>Kleur vertelt wat er speelt.</h2>
        <p className={styles.lead}>
          Rood: een gemarkeerde sessie. Groen: positieve groei. Oranje: Adam kan
          niet verder. Blauw: extra ondersteuning. Open de toelichting om de
          voorbeeldinformatie te zien.
        </p>
        <div className={styles.grid}>
          {examples.map((item) => (
            <ExampleCard key={item.id} item={item} />
          ))}
        </div>
        <div className={styles.stateHeading}>
          <h2>Ook duidelijk als er geen kaart klaarstaat.</h2>
          <p>
            Een rustige dag, nog aan het laden of een fout: drie verschillende
            boodschappen.
          </p>
        </div>
        <div className={styles.stateGrid}>
          <div>
            <span className={styles.specimenLabel}>Niets te doen</span>
            <AttentionState state="empty" />
          </div>
          <div>
            <span className={styles.specimenLabel}>Bezig met ophalen</span>
            <AttentionState state="loading" />
          </div>
          <div>
            <span className={styles.specimenLabel}>Ophalen mislukt</span>
            <RecoveryExample />
          </div>
        </div>
      </section>
      <section id="desktop" className={styles.section}>
        <span className={styles.eyebrow}>
          02 / Goedgekeurde desktopnavigatie
        </span>
        <h2>Direct zichtbaar in je overzicht.</h2>
        <p className={styles.lead}>
          Een compact overzicht boven de blokken van vandaag. Kies boven het
          voorbeeld een rustige dag, fout of andere kaart. De header en zijbalk
          zijn de goedgekeurde componenten.
        </p>
        <AttentionContext name="Desktop met aandachtskaarten" expanded />
      </section>
      <section id="iphone" className={styles.section}>
        <span className={styles.eyebrow}>03 / Goedgekeurde iPhone-optie A</span>
        <h2>Dezelfde duidelijkheid, binnen handbereik.</h2>
        <div className={styles.phoneRow}>
          <div className={styles.phone}>
            <AttentionContext name="iPhone met aandachtskaarten" />
          </div>
          <div className={styles.phoneNotes}>
            <h3>Eén kolom. Volledige informatie.</h3>
            <p>
              De kaarten stapelen onder elkaar. De actieknop krijgt de volle
              breedte wanneer de ruimte klein is.
            </p>
            <h3>De navigatie blijft bereikbaar.</h3>
            <p>
              Scroll door de inhoud; de goedgekeurde onderbalk blijft staan. Een
              toelichting opent direct onder de kaart.
            </p>
            <h3>Rust als er niets speelt.</h3>
            <p>
              Geen lege waarschuwingskaart en geen groene score. Alleen een
              korte bevestiging dat je nu niets hoeft te doen.
            </p>
          </div>
        </div>
      </section>
      <footer className={styles.footer}>
        Voorbeeldgegevens · Geen AI-beoordelingen of echte acties · Kaarten
        goedgekeurd op 17 oktober 2026
      </footer>
    </main>
  );
}
