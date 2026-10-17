'use client';

import { useEffect, useState } from 'react';
import { Button, type ButtonVariant } from './button';
import styles from './button-review.module.css';

export function ReviewIcon({
  name,
}: {
  name: 'arrow' | 'plus' | 'check' | 'trash';
}) {
  const paths = {
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    plus: 'M12 5v14M5 12h14',
    check: 'm5 12 4 4L19 6',
    trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

const variants: {
  value: ButtonVariant;
  name: string;
  use: string;
  label: string;
}[] = [
  {
    value: 'primary',
    name: 'Primair',
    use: 'De belangrijkste actie.',
    label: 'Opslaan',
  },
  {
    value: 'secondary',
    name: 'Secundair',
    use: 'Een volgende stap.',
    label: 'Bekijken',
  },
  {
    value: 'outline',
    name: 'Omlijnd',
    use: 'Een alternatief aanbieden.',
    label: 'Wijzigen',
  },
  {
    value: 'ghost',
    name: 'Subtiel',
    use: 'Een rustige nevenactie.',
    label: 'Annuleren',
  },
  {
    value: 'danger',
    name: 'Verwijderen',
    use: 'Een destructieve actie.',
    label: 'Verwijderen',
  },
];
const states = [
  { value: 'default', label: 'Standaard' },
  { value: 'hover', label: 'Hover' },
  { value: 'pressed', label: 'Ingedrukt' },
  { value: 'focus', label: 'Toetsenbordfocus' },
  { value: 'loading', label: 'Bezig' },
  { value: 'disabled', label: 'Uitgeschakeld' },
] as const;

function InteractionDemo() {
  const [busy, setBusy] = useState(false);
  const [saves, setSaves] = useState(0);
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => {
      setSaves((count) => count + 1);
      setBusy(false);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [busy]);

  return (
    <div className={styles.demo}>
      <div>
        <h3>Voel hoe het werkt</h3>
        <p>
          Gebruik je muis, Tab, Enter of de spatiebalk. Deze demo slaat geen
          gegevens op.
        </p>
        <div className={styles.actions}>
          <Button
            loading={busy}
            onClick={() => setBusy(true)}
            endIcon={<ReviewIcon name="arrow" />}
          >
            Probeer opslaan
          </Button>
          <Button
            variant="outline"
            aria-pressed={selected}
            onClick={() => setSelected(!selected)}
            startIcon={selected ? <ReviewIcon name="check" /> : undefined}
          >
            Selecteer voorbeeld
          </Button>
        </div>
      </div>
      <p className={styles.demoStatus} role="status">
        {busy
          ? 'Even wachten…'
          : saves
            ? `Demo opgeslagen · ${saves} keer`
            : 'Klaar om te proberen.'}
      </p>
    </div>
  );
}

export function ButtonReview() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a
          className={styles.wordmark}
          href="#varianten"
          aria-label="nexo School — naar de knopvarianten"
        >
          nexo<span> School</span>
        </a>
        <span className={styles.badge}>Componentreview · 03</span>
      </header>
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>De basis / Knoppen</p>
          <h1>Knoppen, opnieuw bekeken.</h1>
          <p>
            Minder rond. Meer ruimte. Een helder onderscheid tussen de
            hoofdactie en de rest.
          </p>
        </div>
        <div className={styles.sample}>
          <Button
            size="large"
            endIcon={<ReviewIcon name="arrow" />}
            onClick={() =>
              document.getElementById('proberen')?.scrollIntoView()
            }
          >
            Probeer de knoppen
          </Button>
          <span>Outfit · Plum & Cornflower</span>
        </div>
      </div>
      <nav className={styles.jumpLinks} aria-label="Op deze reviewpagina">
        <a href="#varianten">01 Varianten & toestanden</a>
        <a href="#formaten">02 Formaten & iconen</a>
        <a href="#proberen">03 Zelf proberen</a>
      </nav>

      <section
        id="varianten"
        className={styles.section}
        aria-labelledby="variants-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>01 / Het overzicht</p>
            <h2 id="variants-title">Elke variant, elke toestand.</h2>
          </div>
          <p>
            Hover, ingedrukt en focus zijn hier vastgezet om te vergelijken.
            Probeer de echte interactie onderaan.
          </p>
        </div>
        <div className={styles.matrix}>
          <div className={styles.columnLabels} aria-hidden="true">
            <span>Variant</span>
            {states.map((state) => (
              <span key={state.value}>{state.label}</span>
            ))}
          </div>
          {variants.map((variant) => (
            <div key={variant.value} className={styles.variantRow}>
              <div className={styles.variantName}>
                <h3>{variant.name}</h3>
                <p>{variant.use}</p>
              </div>
              {states.map((state) => (
                <div key={state.value} className={styles.cell}>
                  <span className={styles.mobileState}>{state.label}</span>
                  <Button
                    variant={variant.value}
                    size="medium"
                    data-preview={state.value}
                    loading={state.value === 'loading'}
                    disabled={state.value === 'disabled'}
                  >
                    {variant.label}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className={styles.note}>
          Voorstel: subtiele hoeken van 6px en een aparte rode kleur voor
          verwijderen. Groen blijft gereserveerd voor correcte antwoorden.
        </p>
      </section>

      <section
        id="formaten"
        className={styles.section}
        aria-labelledby="sizes-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>02 / De details</p>
            <h2 id="sizes-title">Passend bij de actie.</h2>
          </div>
          <p>
            Dezelfde leesbare tekstgrootte. Meer of minder ruimte rond de knop.
          </p>
        </div>
        <div className={styles.details}>
          <div className={styles.detail}>
            <h3>Drie formaten</h3>
            <div className={styles.sizeSamples}>
              {(['small', 'medium', 'large'] as const).map((size, index) => (
                <div key={size}>
                  <Button size={size}>Opslaan</Button>
                  <span>
                    {
                      ['Compact · 44px', 'Standaard · 52px', 'Ruim · 56px'][
                        index
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.detail}>
            <h3>Met een icoon</h3>
            <div className={styles.actions}>
              <Button variant="outline" startIcon={<ReviewIcon name="plus" />}>
                Blok toevoegen
              </Button>
              <Button variant="secondary" endIcon={<ReviewIcon name="arrow" />}>
                Verder
              </Button>
              <Button
                variant="ghost"
                iconOnly
                aria-label="Voorbeeld: blok toevoegen"
              >
                <ReviewIcon name="plus" />
              </Button>
              <Button
                variant="danger"
                iconOnly
                aria-label="Voorbeeld: verwijderen"
              >
                <ReviewIcon name="trash" />
              </Button>
            </div>
            <p>
              Iconen ondersteunen de tekst. Losse iconen hebben altijd een
              toegankelijke naam.
            </p>
          </div>
          <div className={styles.detail}>
            <h3>Een brede actie</h3>
            <Button fullWidth endIcon={<ReviewIcon name="arrow" />}>
              Wijzigingen opslaan
            </Button>
            <p>Voor een duidelijke hoofdactie op een klein scherm.</p>
          </div>
          <div className={styles.detail}>
            <h3>Ruimte voor langere tekst</h3>
            <Button variant="outline">Wijzigingen voor deze dag bewaren</Button>
            <p>De tekst mag afbreken; de knop groeit mee.</p>
          </div>
        </div>
      </section>

      <section
        id="proberen"
        className={styles.section}
        aria-labelledby="try-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>03 / In beweging</p>
            <h2 id="try-title">Even zelf proberen.</h2>
          </div>
          <p>
            Een klik krijgt feedback. Tijdens het laden voorkomt de knop een
            tweede actie.
          </p>
        </div>
        <InteractionDemo />
      </section>
      <footer className={styles.footer}>
        <span>nexo School / Ontwerpsysteem</span>
        <span>Voorstel · Nog niet goedgekeurd</span>
      </footer>
    </main>
  );
}
