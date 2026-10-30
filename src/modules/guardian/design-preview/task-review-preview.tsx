'use client';

import { useRef, useState } from 'react';
import { Check, MessageSquare, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/button/button';
import { GuardianFeedback } from '@/components/guardian-ui/guardian-ui';
import styles from '../guardian-workspace.module.css';

/** D26 interaction specimen. Never writes scores, tasks, learning evidence or passes. */
export function TaskReviewPreview() {
  const [choice, setChoice] = useState<'accept' | 'repeat'>();
  const [saved, setSaved] = useState<'accept' | 'repeat'>();
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [noteReceipt, setNoteReceipt] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [message, setMessage] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  function choose(next: 'accept' | 'repeat') {
    setChoice(next);
    setMessage('');
    requestAnimationFrame(() => panel.current?.focus());
  }
  return (
    <details className={styles.details}>
      <summary>Vooruitblik: een gemarkeerde sessie beoordelen</summary>
      <div className={styles.stack}>
        <div className={styles.notice}>
          <ShieldCheck size={20} aria-hidden="true" />
          <p>
            Jouw oordeel gaat over deze sessie. Een fout antwoord is geen bewijs
            van onwil of gebrek aan beheersing. Signalering en deze beslissingen
            zijn nog niet aangesloten; alles hieronder blijft in dit voorbeeld.
          </p>
        </div>
        {message && (
          <GuardianFeedback
            title={message}
            undo={
              saved
                ? {
                    label: 'Beslissing terugzetten',
                    onClick: () => {
                      setSaved(undefined);
                      setMessage(
                        'Beslissing teruggezet in dit voorbeeld. De sessie wacht weer op je oordeel; antwoorden en score zijn bewaard.',
                      );
                    },
                  }
                : undefined
            }
          >
            <p>
              {saved === 'repeat'
                ? 'Bekijk de beschikbare inhoud bij de planning. Er is hier nog geen nieuwe sessie begonnen; daarom kun je het verzoek nog terugzetten.'
                : saved === 'accept'
                  ? 'Je kunt verder met het oefenblok. Er is hier geen gamepas uitgegeven; daarom kun je de beslissing nog terugzetten.'
                  : 'Bekijk de oorspronkelijke antwoorden of kies opnieuw wat helpt.'}
            </p>
          </GuardianFeedback>
        )}
        {choice ? (
          <div ref={panel} tabIndex={-1} className={styles.confirmation}>
            <h3>
              {choice === 'accept'
                ? 'Deze sessie laten meetellen?'
                : 'Opnieuw oefenen aanvragen?'}
            </h3>
            <p>
              {choice === 'accept'
                ? 'De sessie mag meetellen voor het oefenblok. De score en oorspronkelijke antwoorden blijven hetzelfde. Dit is geen oordeel over beheersing.'
                : 'Je vraagt een nieuwe, gelijkwaardige sessie aan binnen de geplande ruimte. De oorspronkelijke sessie en score blijven bewaard. Zonder geschikte, beoordeelde inhoud blijft het verzoek wachten.'}
            </p>
            <p>
              {choice === 'accept'
                ? 'Terugzetten kan zolang er nog geen gamepas uit is verdiend. Daarna is een aparte correctie nodig; een al gebruikte pas kun je niet terughalen.'
                : 'Je kunt het verzoek intrekken zolang de nieuwe sessie niet is begonnen. Daarna blijft het begonnen werk behouden.'}{' '}
              In dit voorbeeld is er nog niets uitgegeven.
            </p>
            <div className={styles.actions}>
              <Button
                onClick={() => {
                  setSaved(choice);
                  setChoice(undefined);
                  setMessage(
                    choice === 'accept'
                      ? 'Beslissing vastgelegd in dit voorbeeld'
                      : 'Verzoek vastgelegd in dit voorbeeld',
                  );
                }}
              >
                Beslissing bevestigen
              </Button>
              <Button variant="ghost" onClick={() => setChoice(undefined)}>
                Beslissing annuleren
              </Button>
            </div>
          </div>
        ) : (
          !saved && (
            <div className={styles.actions}>
              <Button variant="outline" onClick={() => choose('accept')}>
                <Check size={17} aria-hidden="true" />
                Laten meetellen
              </Button>
              <Button variant="outline" onClick={() => choose('repeat')}>
                <RotateCcw size={17} aria-hidden="true" />
                Opnieuw oefenen aanvragen
              </Button>
            </div>
          )
        )}
        {editingNote ? (
          <form
            className={styles.stack}
            onSubmit={(event) => {
              event.preventDefault();
              setSavedNote(note);
              setEditingNote(false);
              setNoteReceipt(
                note.trim()
                  ? 'Notitie bewaard in dit voorbeeld. Je kunt de tekst aanpassen of wissen.'
                  : 'Notitie gewist in dit voorbeeld. De sessie en beslissing zijn ongewijzigd.',
              );
            }}
          >
            <label className={styles.field}>
              Notitie bij deze sessie
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={1000}
              />
            </label>
            <div className={styles.actions}>
              <Button type="submit" variant="outline">
                Notitie bewaren
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setNote(savedNote);
                  setEditingNote(false);
                }}
              >
                Notitie annuleren
              </Button>
            </div>
          </form>
        ) : (
          <div>
            {savedNote && (
              <div className={styles.notice}>
                <MessageSquare size={18} aria-hidden="true" />
                <p>{savedNote}</p>
              </div>
            )}
            {noteReceipt && (
              <p className={styles.muted} role="status">
                {noteReceipt}
              </p>
            )}
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                setEditingNote(true);
                setNoteReceipt('');
              }}
            >
              <MessageSquare size={17} aria-hidden="true" />
              {savedNote ? 'Notitie aanpassen' : 'Notitie toevoegen'}
            </Button>
          </div>
        )}
      </div>
    </details>
  );
}
