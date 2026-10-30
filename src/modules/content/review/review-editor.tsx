'use client';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import type { ExercisePayload } from '../exercise-contract';
import type { ReviewItem } from './review-contract';
import styles from './review.module.css';
export function ReviewEditor({
  item,
  onSave,
  onCancel,
}: {
  item: ReviewItem;
  onSave: (payload: ExercisePayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(item.payload));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  function learner(key: 'prompt' | 'passage' | 'options', value: string) {
    setDraft((d) => ({
      ...d,
      learner: {
        ...d.learner,
        [key]: key === 'options' ? value.split('\n').filter(Boolean) : value,
      },
    }));
  }
  function privateField(
    key: 'acceptedAnswers' | 'gradingRules' | 'explanation',
    value: string,
  ) {
    setDraft((d) => ({
      ...d,
      privateEvaluation: {
        ...d.privateEvaluation,
        [key]:
          key === 'explanation' ? value : value.split('\n').filter(Boolean),
      },
    }));
  }
  return (
    <form
      className={styles.editor}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
          await onSave(draft);
        } catch {
          setError(
            'Niet opgeslagen. Controleer je verbinding of laad de nieuwste versie. Je wijzigingen staan nog hier.',
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <p>
        Opslaan maakt een nieuwe versie. Eerdere goedkeuring en AI-bevindingen
        gelden dan niet meer.
      </p>
      <label>
        Vraag
        <textarea
          required
          value={draft.learner.prompt}
          onChange={(e) => learner('prompt', e.target.value)}
        />
      </label>
      <label>
        Lees- of contexttekst
        <textarea
          value={draft.learner.passage}
          onChange={(e) => learner('passage', e.target.value)}
        />
      </label>
      <label>
        Opties (één per regel)
        <textarea
          value={draft.learner.options.join('\n')}
          onChange={(e) => learner('options', e.target.value)}
        />
      </label>
      <label>
        Goede antwoorden (één per regel)
        <textarea
          required
          value={draft.privateEvaluation.acceptedAnswers.join('\n')}
          onChange={(e) => privateField('acceptedAnswers', e.target.value)}
        />
      </label>
      <label>
        Uitleg
        <textarea
          required
          value={draft.privateEvaluation.explanation}
          onChange={(e) => privateField('explanation', e.target.value)}
        />
      </label>
      <label>
        Beoordelingsregels (één per regel)
        <textarea
          required
          value={draft.privateEvaluation.gradingRules.join('\n')}
          onChange={(e) => privateField('gradingRules', e.target.value)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="submit" loading={busy}>
          Nieuwe versie opslaan
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel}>
          Annuleren
        </Button>
      </div>
    </form>
  );
}
