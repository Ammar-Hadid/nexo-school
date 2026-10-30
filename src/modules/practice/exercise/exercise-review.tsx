'use client';
import { useState, type ComponentType } from 'react';
import {
  scenarios,
  type Scenario,
  type PreviewState,
} from './exercise-preview';
import { wordMessages } from './word-companion';
import { exerciseSituation } from './exercise-companion';
import type { ExerciseScreenProps } from './exercise-definition';
import styles from './exercise-review.module.css';

type Props = {
  subject: 'Taal' | 'Spelling' | 'Redactiesommen' | 'Begrijpend Lezen';
  messages?: typeof wordMessages;
  keyboard?: 'lettertoetsenbord' | 'cijfertoetsenbord' | 'antwoordkeuze';
  exerciseLabel?: string;
  approved: boolean;
  revision?: number;
  intro: string;
  fixtureNote: string;
  Screen: ComponentType<ExerciseScreenProps>;
  initialPreview: (scenario: Scenario) => PreviewState;
};
export function ExerciseReview({
  messages = wordMessages,
  keyboard = 'lettertoetsenbord',
  exerciseLabel,
  subject,
  approved,
  revision = 1,
  intro,
  fixtureNote,
  Screen,
  initialPreview,
}: Props) {
  const slug = subject.toLowerCase().replaceAll(' ', '-');
  const [scenario, setScenario] = useState<Scenario>('question');
  const [messageVariant, setMessageVariant] = useState(-1);
  const variants = messages(exerciseSituation(initialPreview(scenario)));
  return (
    <main
      className={`${styles.review} ${subject === 'Begrijpend Lezen' ? styles.readingReview : ''}`}
    >
      <header className={styles.header}>
        <span className={styles.eyebrow}>
          nexo School · {slug} revisie {revision} ·{' '}
          {approved ? 'goedgekeurd' : 'ter beoordeling'}
        </span>
        <h1>{subject} met je kattenmaatje.</h1>
        <p>Eén vraag tegelijk. Rust om na te denken. Nexai naast je.</p>
        <nav
          className={styles.links}
          aria-label={`Onderdelen van de ${slug}review`}
        >
          <a href="#try">{exerciseLabel ?? `${subject}oefening`}</a>
          <a href="#tablet">Tablet</a>
          <a href="#mobile">Mobiel</a>
          <a href="/iframe.html?id=practice-rekenen--screen&viewMode=story">
            Goedgekeurde Rekenen-pagina
          </a>
        </nav>
      </header>
      <section id="try">
        <h2>De hele taak, of direct naar een moment</h2>
        <p>
          {intro} De vormgeving en het verloop volgen de goedgekeurde
          Rekenen-pagina.
        </p>
        <label className={styles.picker}>
          Voorbeeldmoment
          <select
            value={scenario}
            onChange={(event) => {
              const value = event.target.value;
              if (value in scenarios) {
                setScenario(value as Scenario);
                setMessageVariant(-1);
              }
            }}
          >
            {Object.entries(scenarios).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.picker}>
          Berichtvariant
          <select
            value={messageVariant}
            onChange={(event) => setMessageVariant(Number(event.target.value))}
          >
            <option value={-1}>Automatisch afwisselen</option>
            {variants.map((message, index) => (
              <option key={message.id} value={index}>
                Variatie {index + 1} · {message.id}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.stage}>
          <Screen
            key={scenario}
            scenario={scenario}
            messageVariant={messageVariant}
            embedded
          />
        </div>
      </section>
      <section id="tablet">
        <h2>Dezelfde taak op tablet</h2>
        <p>
          {keyboard === 'antwoordkeuze'
            ? 'De tekst en vraag staan naast elkaar waar daar ruimte voor is. Kies een antwoord met aanraken of de pijltjestoetsen.'
            : `Hetzelfde antwoordveld, nu met een ${keyboard}. Dit is een browserpreview; het fysieke toetsenbordgedrag moet nog worden bekeken.`}
        </p>
        <iframe
          key={`tablet-${scenario}`}
          title={`${subject}taak op tablet`}
          className={styles.tablet}
          src={`/iframe.html?id=practice-${slug}--screen&viewMode=story&args=scenario:${scenario};messageVariant:${messageVariant}`}
        />
      </section>
      <section id="mobile">
        <h2>Dezelfde taak op een kleiner scherm</h2>
        <p>
          Nexai staat onder de oefening. Het antwoord en de actie blijven bij
          elkaar.
        </p>
        <iframe
          key={`mobile-${scenario}`}
          title={`${subject}taak op mobiel`}
          className={styles.phone}
          src={`/iframe.html?id=practice-${slug}--screen&viewMode=story&args=scenario:${scenario};messageVariant:${messageVariant}`}
        />
      </section>
      <aside className={styles.note}>
        <h2>
          {approved ? 'Goedgekeurd' : 'Ter beoordeling'} · {subject} revisie{' '}
          {revision}
        </h2>
        <p>
          {subject === 'Begrijpend Lezen'
            ? 'Een eigen leesindeling: de hele tekst links, een vraag rechts en Nexai onder het antwoord. Op smalle schermen staat de volledige tekst boven de vraag. Kleuren, pootjes, feedback, herkansingen en resultaat volgen Rekenen.'
            : 'Zelfde opbouw, kleuren, invoer, pootjes, feedback, herkansingen en resultaat als Rekenen. Alleen het onderwerp, de vragen en de bijbehorende uitleg veranderen.'}{' '}
          Nexai gebruikt ongewijzigde goedgekeurde berichten die ook bij {slug}{' '}
          passen.
        </p>
        <p>
          {fixtureNote} Geen AI, opgeslagen voortgang of gepubliceerd
          lesmateriaal. Een ontwerpgoedkeuring is apart van inhoudelijke
          goedkeuring voor gebruik met leerlingen.
        </p>
      </aside>
    </main>
  );
}
