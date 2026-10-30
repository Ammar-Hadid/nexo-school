'use client';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import type { ExercisePayload } from '../exercise-contract';
import type { ReviewItem } from './review-contract';
import { ReviewDetails } from './review-details';
import { ReviewEditor } from './review-editor';
import styles from './review.module.css';
const labels: Record<string, string> = {
  'spelling-bank-mismatch':
    'Vraag, antwoord of uitleg wijkt af van de vastgelegde woordenbank. Een gewijzigde bank vraagt een nieuwe familierevisie.',
  'family-mismatch': 'De som of sleutel valt buiten deze vaste oefenvariant.',
  'missing-context': 'De vereiste zin of context ontbreekt.',
  formatting: 'Onverwachte opmaak of tekens.',
  options: 'Opties ontbreken of zijn dubbel.',
  'answer-option': 'Antwoord sluit niet aan op de opties.',
  'response-mismatch': 'Instructie past niet bij het antwoordveld.',
  'objective-cue': 'Vereiste verwijzing naar het leerdoel ontbreekt.',
  'passage-length': 'Tekstlengte buiten de afgesproken grenzen.',
  'answer-disclosure': 'Mogelijke onthulling van het antwoord.',
  'calculation-key': 'Antwoord of eenheid wijkt af van de berekening.',
};
const fieldLabels: Record<string, string> = {
  'learner.prompt': 'Vraag',
  'learner.passage': 'Lees- of contexttekst',
  'learner.options': 'Opties',
  'privateEvaluation.acceptedAnswers': 'Goede antwoorden',
  'privateEvaluation.explanation': 'Uitleg',
  'privateEvaluation.gradingRules': 'Beoordelingsregels',
};
export function reviewStatus(item: ReviewItem) {
  if (item.published) return 'Gepubliceerd voor lokale proef';
  if (item.decision === 'approved') return 'Goedgekeurd';
  if (item.decision === 'rejected') return 'Afgewezen';
  return 'Nog te beoordelen';
}
export function ReviewExercise({
  item,
  selected,
  onSelect,
  onSave,
  onFocusItem,
  onEditing,
  busy = false,
}: {
  item: ReviewItem;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onSave: (payload: ExercisePayload) => Promise<void>;
  onFocusItem: () => void;
  onEditing: (editing: boolean) => void;
  busy?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const edit = (value: boolean) => {
    setEditing(value);
    onEditing(value);
  };
  return (
    <article
      className={styles.item}
      id={`item-${item.contentId}`}
      tabIndex={-1}
      aria-label={`Oefening ${item.title}`}
    >
      <header className={styles.itemHeader}>
        <div>
          <h2>{item.title}</h2>
          <span className={styles.muted}>
            Versie {item.revision} · {reviewStatus(item)}
          </span>
        </div>
        {!editing && (
          <Button
            size="small"
            variant="outline"
            disabled={busy}
            onClick={() => {
              onFocusItem();
              edit(true);
            }}
          >
            Bewerk {item.title}
          </Button>
        )}
      </header>
      <p className={styles.objective}>
        <strong>Leerdoel</strong> · {item.objective}
      </p>
      {editing ? (
        <ReviewEditor
          item={item}
          onCancel={() => {
            edit(false);
            requestAnimationFrame(() =>
              document.getElementById(`item-${item.contentId}`)?.focus(),
            );
          }}
          onSave={async (payload) => {
            await onSave(payload);
            edit(false);
          }}
        />
      ) : (
        <>
          <div className={styles.columns}>
            <section
              className={styles.learner}
              aria-label={`Leerlingweergave ${item.title}`}
            >
              <h3>Oefening</h3>
              <p className={styles.muted}>
                {item.rules.response === 'open'
                  ? 'Vul je antwoord in.'
                  : 'Kies één antwoord.'}
              </p>
              {item.payload.learner.passage && (
                <p className={styles.passage}>{item.payload.learner.passage}</p>
              )}
              <p className={styles.question}>{item.payload.learner.prompt}</p>
              {!!item.payload.learner.options.length && (
                <ol>
                  {item.payload.learner.options.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ol>
              )}
            </section>
            <section
              className={styles.private}
              aria-label={`Privébeoordeling ${item.title}`}
            >
              <h3>Antwoord & uitleg</h3>
              <p className={styles.answer}>
                {item.payload.privateEvaluation.acceptedAnswers.join(' / ')}
              </p>
              <p>{item.payload.privateEvaluation.explanation}</p>
              <details className={styles.details}>
                <summary>
                  Beoordelingsregels (
                  {item.payload.privateEvaluation.gradingRules.length})
                </summary>
                <ul>
                  {item.payload.privateEvaluation.gradingRules.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </details>
            </section>
          </div>
          <section className={styles.findings} aria-label="Controles">
            {!!item.checks.length ? (
              <div className={styles.blockers}>
                <h3>Eerst aanpassen · {item.checks.length} blokkades</h3>
                <ul>
                  {item.checks.map((c, i) => (
                    <li key={i}>
                      <strong>
                        {fieldLabels[
                          c.field.split('.').slice(0, 2).join('.')
                        ] ?? 'Inhoud'}
                        :
                      </strong>{' '}
                      {labels[c.code] ?? 'Voldoet niet aan de opdrachtregels.'}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={styles.checkClear}>✓ Geen mechanische blokkades</p>
            )}
            <details
              className={styles.advisory}
              open={item.advisory.status !== 'clear'}
              key={item.contentHash}
            >
              <summary>
                {item.advisory.provenance === 'deterministic-check'
                  ? item.rules.calculation
                    ? 'Vaste rekencontrole'
                    : 'Vaste inhoudscontrole'
                  : 'Haiku · gesimuleerd'}{' '}
                <span className={styles.badge}>
                  {item.advisory.status === 'clear'
                    ? item.advisory.provenance === 'deterministic-check'
                      ? 'Technische controle geslaagd'
                      : 'Geen AI-vlag'
                    : item.advisory.status === 'flagged'
                      ? 'Aandachtspunt'
                      : 'Opnieuw beoordelen'}
                </span>
              </summary>
              <p>{item.advisory.text}</p>
              <small>Advies, geen menselijke goedkeuring.</small>
            </details>
          </section>
          <ReviewDetails item={item} />
          <footer className={styles.itemFooter}>
            <label className={styles.selection}>
              <input
                type="checkbox"
                checked={selected}
                disabled={busy || item.published}
                aria-label={`Selecteer ${item.title}`}
                onChange={(e) => {
                  onFocusItem();
                  onSelect(e.target.checked);
                }}
              />
              {item.published
                ? 'Deze versie is gepubliceerd'
                : 'Meenemen in selectie'}
            </label>
            {selected && (
              <span className={styles.muted}>
                Beslis straks over je selectie
              </span>
            )}
          </footer>
        </>
      )}
    </article>
  );
}
