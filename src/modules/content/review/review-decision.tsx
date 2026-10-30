'use client';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import type { ReviewItem } from './review-contract';
import { reviewStatus } from './review-item';
import styles from './review.module.css';
export function ReviewDecision({
  items,
  busy,
  onRemove,
  onOpen,
  onDecision,
}: {
  items: ReviewItem[];
  busy: boolean;
  onRemove: (id: string) => void;
  onOpen: (contentId: string) => void;
  onDecision: (
    kind: 'approve' | 'reject' | 'publish',
    notes: string,
  ) => Promise<void>;
}) {
  const [notes, setNotes] = useState(''),
    [confirmed, setConfirmed] = useState(false);
  const allPending =
    items.length > 0 && items.every((i) => i.decision === 'pending');
  const ready =
    items.length > 0 &&
    items.every((i) => i.decision === 'approved' && !i.published);
  const blocked = items.some((i) => i.checks.length);
  async function decide(kind: 'approve' | 'reject' | 'publish') {
    setConfirmed(false);
    try {
      await onDecision(kind, notes);
    } catch {
      /* Host displays the error; retain this note. */
    }
  }
  return (
    <section className={styles.decision} aria-label="Beslissing voor selectie">
      <header>
        <p className={styles.eyebrow}>Stap 2 · Beslissen</p>
        <h2>Jouw selectie ({items.length})</h2>
        <p>
          {ready
            ? 'Deze versies zijn goedgekeurd. Publiceer ze voor de lokale proef.'
            : 'Controleer je selectie en leg je oordeel vast.'}
        </p>
      </header>
      <ul className={styles.selectedList}>
        {items.map((i) => (
          <li key={i.id}>
            <div>
              <strong>{i.title}</strong>
              <small>
                Versie {i.revision} · {reviewStatus(i)}
                {i.checks.length ? ' · Geblokkeerd' : ''}
              </small>
            </div>
            <div className={styles.actions}>
              <Button
                size="small"
                variant="ghost"
                disabled={busy}
                onClick={() => onOpen(i.contentId)}
              >
                Bekijk {i.title}
              </Button>
              <Button
                size="small"
                variant="ghost"
                disabled={busy}
                aria-label={`Verwijder ${i.title} uit selectie`}
                onClick={() => onRemove(i.id)}
              >
                Verwijder
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {!items.length && <p>Selecteer eerst een oefening bij stap 1.</p>}
      {blocked && (
        <p className={styles.blockers}>
          Goedkeuren is geblokkeerd. Herstel eerst de gemarkeerde oefeningen of
          verwijder ze uit je selectie.
        </p>
      )}
      {!ready && !allPending && items.length > 0 && (
        <p className={styles.notice}>
          Selecteer alleen nog te beoordelen versies, of alleen goedgekeurde
          versies om te publiceren.
        </p>
      )}
      {!ready && (
        <label className={styles.field}>
          Beoordelingsnotitie (optioneel)
          <textarea
            maxLength={16000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Wil je iets vastleggen over je beoordeling?"
          />
        </label>
      )}
      {ready ? (
        <p className={styles.notice}>
          <strong>Publiceren maakt deze exacte versies beschikbaar.</strong> Je
          kunt publicatie niet ongedaan maken. Ontdek je daarna een inhoudsfout,
          trek de versie dan in via{' '}
          <a href="/guardian/content/assignments#versions-heading">
            Planning · Inhoud en correcties
          </a>
          . Bestaande sessies en antwoorden blijven bewaard. Herstel vraagt een
          nieuwe, opnieuw beoordeelde en gepubliceerde versie.
        </p>
      ) : (
        allPending && (
          <div className={styles.notice}>
            <p>
              <strong>Goedkeuren:</strong> je oordeel staat vast voor deze
              exacte versies. Ze worden pas beschikbaar na apart publiceren.
            </p>
            <p>
              <strong>Afwijzen:</strong> je oordeel staat vast voor deze exacte
              versies. Ze kunnen daarna niet worden gepubliceerd.
            </p>
            <p>
              Beide beslissingen kun je niet ongedaan maken. Voor een ander
              oordeel bewerk je de oefening, sla je een nieuwe versie op en
              beoordeel je die opnieuw.
            </p>
          </div>
        )
      )}
      <label className={styles.selection}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        Ik heb de volledige geselecteerde versies zelf beoordeeld.
      </label>
      <div className={styles.actions}>
        {ready ? (
          <Button
            loading={busy}
            disabled={!confirmed || blocked}
            onClick={() => void decide('publish')}
          >
            Goedgekeurde selectie publiceren
          </Button>
        ) : (
          <>
            <Button
              loading={busy}
              disabled={!allPending || blocked || !confirmed}
              onClick={() => void decide('approve')}
            >
              Selectie goedkeuren
            </Button>
            <Button
              variant="outline"
              loading={busy}
              disabled={!allPending || !confirmed}
              onClick={() => void decide('reject')}
            >
              Selectie afwijzen
            </Button>
          </>
        )}
      </div>
      <p className={styles.muted}>
        Alleen deze exacte versies. Goedkeuren en publiceren blijven aparte
        stappen.
      </p>
    </section>
  );
}
