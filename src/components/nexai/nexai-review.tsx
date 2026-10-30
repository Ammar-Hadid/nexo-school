'use client';
import { useState } from 'react';
import { Button } from '../button/button';
import { NexaiArtwork } from './nexai-artwork';
import { NexaiPose } from './nexai-pose';
import { motions, motionFrame, type NexaiMotion } from './nexai-motion';
import './nexai.tokens.css';
import styles from './nexai-review.module.css';
export function NexaiReview() {
  const [motion, setMotion] = useState<NexaiMotion>('back');
  const [event, setEvent] = useState(0);
  const [ambient, setAmbient] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inspectAt, setInspectAt] = useState<number | undefined>();
  const duration = motions[motion].duration;
  return (
    <main className={styles.review}>
      <p>nexo School · bewegingsstudio 2.1 · ter beoordeling</p>
      <h1>Nexai: bewegingen bekijken.</h1>
      <p>
        De vorige beeldreeksen zijn teruggezet. De nieuwe tussenposes zijn
        afgewezen; vloeiende karakteranimatie is nog niet gerealiseerd.
      </p>
      <nav className={styles.links} aria-label="Ontwerpreviews">
        <a href="/iframe.html?id=components-text-field--review-page&viewMode=story">
          ← Eerst: invoervelden
        </a>
        <a href="/iframe.html?id=practice-rekenen--review-page&viewMode=story">
          Naar de rekentaak →
        </a>
      </nav>
      <section className={styles.stage} aria-label="Animatie bekijken">
        <div className={styles.art}>
          <NexaiArtwork
            motion={motion}
            eventKey={event}
            ambient={ambient}
            paused={paused}
            inspectAt={inspectAt}
          />
        </div>
        <div>
          <h2>{motions[motion].label}</h2>
          <p>{motions[motion].description}</p>
          <div className={styles.controls}>
            <Button
              onClick={() => {
                setInspectAt(undefined);
                setPaused(false);
                setEvent(event + 1);
              }}
            >
              Opnieuw afspelen
            </Button>
            <Button variant="outline" onClick={() => setPaused(!paused)}>
              {paused ? 'Hervatten' : 'Stilzetten'}
            </Button>
          </div>
          <label className={styles.slider}>
            Bekijk een moment
            <input
              type="range"
              min="0"
              max={duration}
              step="10"
              value={inspectAt ?? 0}
              onChange={(e) => {
                setAmbient(false);
                setPaused(false);
                setInspectAt(Number(e.target.value));
              }}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={ambient}
              onChange={(e) => {
                setAmbient(e.target.checked);
                setInspectAt(undefined);
                setPaused(false);
              }}
            />{' '}
            Laat Nexai zijn eigen gang gaan
          </label>
          <p>
            Met korte rustmomenten tussen zijn bewegingen. Verminderde beweging
            op je apparaat houdt hem stil.
          </p>
        </div>
      </section>
      <section
        className={styles.filmstrip}
        aria-label="Houdingen uit deze beweging"
      >
        {[0, 0.25, 0.5, 0.75].map((progress) => {
          const time = duration * progress;

          return (
            <figure key={progress}>
              <NexaiPose motion={motion} frame={motionFrame(motion, time)} />
              <figcaption>
                {Math.round(progress * 100)}% van de beweging
              </figcaption>
            </figure>
          );
        })}
      </section>
      <div className={styles.grid}>
        {Object.entries(motions).map(([name, clip]) => (
          <button
            className={styles.clip}
            type="button"
            key={name}
            aria-pressed={motion === name}
            onClick={() => {
              setMotion(name as NexaiMotion);
              setEvent(event + 1);
              setPaused(false);
              setInspectAt(undefined);
            }}
          >
            <strong>{clip.label}</strong>
            <span>{clip.description}</span>
          </button>
        ))}
      </div>
      <p>
        Herstelde 2.5D beeldreeksen: elke houding is apart getekend. De
        rusthouding heeft twee poten op de grond. Gapen, wassen, rollen en
        dutten zijn voor rustige momenten; tijdens vragen blijft Nexai
        aandachtig. Geen geluid. Gebruik de schuif om de houdingen te bekijken.
        Deze versie is nog ter beoordeling op vloeiendheid en
        karakterconsistentie.
      </p>
    </main>
  );
}
