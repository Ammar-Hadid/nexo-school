'use client';

import { useState } from 'react';
import { PreviewContent } from './navigation-preview-content';
import {
  GuardianNavigation,
  type GuardianDestination,
} from './guardian-navigation';
import styles from './navigation-review.module.css';

export function NavigationDemo({
  mobileNavigation = 'bottom',
  expanded = false,
  name = 'Voorbeeld',
}: {
  mobileNavigation?: 'bottom' | 'menu';
  expanded?: boolean;
  name?: string;
}) {
  const [page, setPage] = useState<GuardianDestination>('overview');
  return (
    <div role="group" aria-label={name}>
      <GuardianNavigation
        label={name}
        current={page}
        mobileNavigation={mobileNavigation}
        initiallyExpanded={expanded}
        onNavigate={setPage}
        hrefFor={(destination) => `#voorbeeld-${destination}`}
      >
        <PreviewContent page={page} onNavigate={setPage} />
      </GuardianNavigation>
    </div>
  );
}

export function NavigationReview() {
  return (
    <main className={styles.review}>
      <header className={styles.reviewHeader}>
        <a href="#desktop" className={styles.wordmark}>
          nexo School <span>/ Ontwerpsysteem</span>
        </a>
        <span className={styles.badge}>Navigatie · goedgekeurd 01</span>
      </header>
      <section className={styles.opening}>
        <span className={styles.eyebrow}>Ouderportaal / Header & zijbalk</span>
        <h1>
          Alles op zijn plek.
          <br />
          Meer ruimte voor overzicht.
        </h1>
        <p>
          Een rustige werkplek op je MacBook. Twee manieren om op je iPhone snel
          te vinden wat je nodig hebt.
        </p>
        <nav className={styles.jumpLinks} aria-label="Op deze reviewpagina">
          <a href="#desktop">01 Desktop</a>
          <a href="#iphone">02 iPhone vergelijken</a>
          <a href="#details">03 Gedrag & keuzes</a>
        </nav>
      </section>
      <section id="desktop" className={styles.reviewSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>01 / MacBook</span>
            <h2>Een zijbalk wanneer je hem nodig hebt.</h2>
          </div>
          <p>
            Open en sluit het menu linksboven. Kies een bestemming; de zijbalk
            sluit weer voor meer werkruimte.
          </p>
        </div>
        <NavigationDemo name="Desktopvoorbeeld" expanded />
        <p className={styles.caption}>
          De geopende toestand staat hier klaar om te bekijken. In de losse
          desktopdemo begint de zijbalk gesloten. Op smalle schermen wordt dit
          voorbeeld de mobiele variant.
        </p>
      </section>
      <section id="iphone" className={styles.reviewSection}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>02 / iPhone</span>
            <h2>Dezelfde mogelijkheden. Een andere bediening.</h2>
          </div>
          <p>
            Optie A is gekozen. Overzicht, planning, voortgang, instellingen en
            beheer blijven overal bereikbaar.
          </p>
        </div>
        <div className={styles.phoneComparison}>
          <article>
            <div className={styles.optionTitle}>
              <span>A</span>
              <div>
                <h3>Vaste navigatie onderaan · goedgekeurd</h3>
                <p>
                  De drie dagelijkse plekken direct binnen duimbereik.
                  Instellingen en Beheer via Meer.
                </p>
              </div>
            </div>
            <div className={styles.phone}>
              <NavigationDemo name="iPhone met onderbalk" />
            </div>
            <p className={styles.caption}>
              Gekozen: je ziet steeds waar je bent en wisselt snel tussen
              overzicht en planning.
            </p>
          </article>
          <article>
            <div className={styles.optionTitle}>
              <span>B</span>
              <div>
                <h3>Alles via het menu · niet gekozen</h3>
                <p>
                  Een rustiger scherm zonder onderbalk. Alle bestemmingen via de
                  knop linksboven.
                </p>
              </div>
            </div>
            <div className={styles.phone}>
              <NavigationDemo mobileNavigation="menu" name="iPhone met menu" />
            </div>
            <p className={styles.caption}>
              Meer ruimte voor de pagina; een andere bestemming openen kost
              eerst een tik op het menu.
            </p>
          </article>
        </div>
      </section>
      <section id="details" className={styles.reviewSection}>
        <span className={styles.eyebrow}>03 / Het gedrag</span>
        <h2>Klein gehouden. Duidelijk gemaakt.</h2>
        <div className={styles.notes}>
          <div>
            <h3>Waar ben ik?</h3>
            <p>
              Een gemarkeerde bestemming, een paginatitel en tekst bij ieder
              navigatie-icoon. Het profiel opent Instellingen.
            </p>
          </div>
          <div>
            <h3>Een menu, geen onderbreking</h3>
            <p>
              Op je telefoon vervangt het open menu tijdelijk de pagina. Sluiten
              of Escape brengt je terug. Geen zwevend venster boven je werk.
            </p>
          </div>
          <div>
            <h3>Dezelfde basis</h3>
            <p>
              Goedgekeurd paars, cornflower, Outfit en de gedeelde knoppen. De
              desktopnavigatie en iPhone-optie A zijn goedgekeurd.
            </p>
          </div>
        </div>
      </section>
      <footer className={styles.footer}>
        Voorbeeldgegevens · Desktop en iPhone-optie A goedgekeurd · 17 oktober
        2026
      </footer>
    </main>
  );
}
