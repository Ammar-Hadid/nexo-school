'use client';

import { useState } from 'react';
import { NexaiCompanion } from '../../../components/nexai/nexai';
import {
  nexaiSituations,
  type NexaiSituation,
} from '../../../components/nexai/nexai-situations';
import { RekenenScreen } from './rekenen-screen';
import { initialPreview, scenarios, type Scenario } from './rekenen-preview';
import {
  rekenenMessage,
  rekenenMessages,
  rekenenSituation,
} from './rekenen-companion';
import styles from '../exercise/exercise-review.module.css';

export function RekenenReview() {
  const [context, setContext] = useState<
    'guardianReview' | 'effortConcern' | 'overdueBlock'
  >('guardianReview');
  const [scenario, setScenario] = useState<Scenario>('question');
  const [messageVariant, setMessageVariant] = useState(-1);
  const contextual = rekenenMessage(context, messageVariant);
  const variants = rekenenMessages(rekenenSituation(initialPreview(scenario)));
  return (
    <main className={styles.review}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>
          nexo School · rekenen revisie 4.1 · goedgekeurd
        </span>
        <h1>Rekenen met je kattenmaatje.</h1>
        <p>Eén vraag tegelijk. Rust om na te denken. Nexai naast je.</p>
        <nav
          className={styles.links}
          aria-label="Onderdelen van de rekenreview"
        >
          <a href="/iframe.html?id=components-text-field--review-page&viewMode=story">
            1. Invoervelden
          </a>
          <a href="/iframe.html?id=components-nexai-library--library-review&viewMode=story">
            2. Nexai in beweging
          </a>
          <a href="/iframe.html?id=components-nexai-messages--review-page&viewMode=story">
            Goedgekeurde berichten
          </a>
          <a href="#try">3. Rekentaak</a>
          <a href="#assignments">Nexai per moment</a>
          <a href="#context">Andere situaties</a>
          <a href="#tablet">Adams tablet</a>
          <a href="#mobile">Mobiel</a>
        </nav>
      </header>
      <section id="try">
        <h2>De hele taak, of direct naar een moment</h2>
        <p>
          Vul antwoorden in om de 10 vragen te doorlopen. Of kies een toestand.
          Dezelfde keuze verschijnt ook in de apparaatvoorbeelden.
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
        <p>
          De berichten zijn goedgekeurd. Ze wisselen per vraag; tijdens het
          typen blijft Nexai hetzelfde zeggen. Kies een variatie om die in de
          hele pagina en de apparaatvoorbeelden te bekijken.
        </p>
        <div className={styles.stage}>
          <RekenenScreen
            key={scenario}
            scenario={scenario}
            messageVariant={messageVariant}
            embedded
          />
        </div>
      </section>
      <section id="assignments">
        <h2>Welke Nexai hoort bij welk moment?</h2>
        <p>
          De rekenpagina, koppelingen en berichtvariatie zijn goedgekeurd.
          Hieronder staat een voorbeeld per situatie. De losse voorbeelden
          buiten de oefening blijven apart herkenbaar.
        </p>
        <dl className={styles.assignments}>
          {Object.entries(nexaiSituations).map(([key, item]) => {
            const message = rekenenMessage(
              key as NexaiSituation,
              messageVariant,
            );
            return (
              <div key={key}>
                <dt>{item.label}</dt>
                <dd>
                  <strong>{item.pose}</strong> · {message.id} · “{message.text}”
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
      <section id="context" className={styles.note}>
        <h2>Samen afspreken hoe je verdergaat</h2>
        <p>
          Losse ontwerpvoorbeelden. De oefening hierboven signaleert geen inzet
          of afwezigheid. Fouten en gemist werk bewijzen niet waarom iets niet
          lukt. De voorwaarden voor een automatisch signaal moeten nog worden
          ontworpen en onderzocht.
        </p>
        <label className={styles.picker}>
          Situatievoorbeeld
          <select
            value={context}
            onChange={(event) => {
              const value = event.target.value;
              if (
                value === 'guardianReview' ||
                value === 'effortConcern' ||
                value === 'overdueBlock'
              )
                setContext(value);
            }}
          >
            <option value="guardianReview">Ammar moet de taak bekijken</option>
            <option value="effortConcern">
              Aandacht voor de taak · boze Nexai
            </option>
            <option value="overdueBlock">
              Oefenblok nog open · boze Nexai
            </option>
          </select>
        </label>
        <NexaiCompanion
          pose={contextual.pose}
          message={contextual.text}
          eventKey={`${context}-${contextual.id}`}
          ambient={false}
        />
        <p>
          Geen automatische straf of gamepasbeslissing. Verdrietige houdingen
          blijven nog zonder situatie.
        </p>
      </section>
      <section id="tablet">
        <h2>Voor Adam · Tab S9 Ultra</h2>
        <p>
          Liggend voorbeeld, tot 1200 CSS-pixels breed. Het toetsenbord gebruikt
          de cijferinvoer van het apparaat. Dit is een browserpreview, geen
          fysieke apparaattest.
        </p>
        <iframe
          key={`tablet-${scenario}`}
          title="Rekentaak op tablet"
          className={styles.tablet}
          src={`/iframe.html?id=practice-rekenen--screen&viewMode=story&args=scenario:${scenario};messageVariant:${messageVariant}`}
        />
      </section>
      <section id="mobile">
        <h2>Dezelfde taak, op een kleiner scherm</h2>
        <p>
          Nexai staat onder de oefening. Het antwoord en de actie staan onder
          elkaar; uitleg groeit mee met de pagina.
        </p>
        <iframe
          key={`mobile-${scenario}`}
          title="Rekentaak op mobiel"
          className={styles.phone}
          src={`/iframe.html?id=practice-rekenen--screen&viewMode=story&args=scenario:${scenario};messageVariant:${messageVariant}`}
        />
      </section>
      <aside className={styles.note}>
        <h2>Goedgekeurde rekenpagina</h2>
        <p>
          Vraag, invoer, feedback, tweede kans, uitleg en score. De uitleg is
          vast geschreven voor deze voorbeelden. Geen AI, opgeslagen voortgang
          of gamepas. Nexai is helemaal zichtbaar en beweegt mee. De uitgebreide
          animatiestudio en invoervelden hebben elk een eigen review. Gemiste
          sommen komen zonder aankondiging terug.
        </p>
      </aside>
    </main>
  );
}
