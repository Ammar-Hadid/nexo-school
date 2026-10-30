'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button/button';
import { ExerciseScreen } from '../exercise/exercise-screen';
import type { PublicAssignment } from '../assignment/public-contract';
import { spellingPresentation } from '../spelling/spelling-presentation';
import { taalPresentation } from '../taal/taal-presentation';
import { redactiesommenPresentation } from '../redactiesommen/redactiesommen-presentation';
import { readingPresentation } from '../begrijpend-lezen/begrijpend-lezen-presentation';
import { rekenenPresentation } from '../rekenen/rekenen-presentation';
import { savedSnapshot, type SavedProgress } from './saved-state';
import styles from '../exercise/exercise-screen.module.css';

export function SavedExercise({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<{
    assignment: PublicAssignment;
    saved: SavedProgress;
  } | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('Taak laden…');
  const locked = useRef(false);
  const base = `/api/practice/assignments/${encodeURIComponent(id)}`;
  async function request(path: string, body?: unknown) {
    const response = await fetch(`${base}${path}`, {
      cache: 'no-store',
      ...(body
        ? {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          }
        : {}),
    });
    if (!response.ok) throw new Error(String(response.status));
    return response.json();
  }
  async function refresh() {
    const [assignment, saved] = (await Promise.all([
      request(''),
      request('/progress'),
    ])) as [PublicAssignment, SavedProgress];
    setData({ assignment, saved });
    setAnswer(savedSnapshot(assignment, saved).answer);
    setError('');
    return saved;
  }
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(base, { cache: 'no-store' }),
      fetch(`${base}/progress`, { cache: 'no-store' }),
    ])
      .then(async (responses) => {
        if (responses.some((r) => !r.ok)) throw new Error('unavailable');
        const [assignment, saved] = (await Promise.all(
          responses.map((r) => r.json()),
        )) as [PublicAssignment, SavedProgress];
        if (active) {
          setData({ assignment, saved });
          setAnswer(savedSnapshot(assignment, saved).answer);
          setNotice('Opgeslagen werk geladen.');
        }
      })
      .catch(() => {
        if (active)
          setNotice(
            'Taak niet beschikbaar. Meld je aan op je goedgekeurde browser en probeer opnieuw.',
          );
      });
    return () => {
      active = false;
    };
  }, [base]);
  const snapshot = data ? savedSnapshot(data.assignment, data.saved) : null;
  const dirty =
    snapshot?.state.stage === 'answer' && answer !== snapshot.answer;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    if (dirty || busy) window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  async function act(action: 'draft' | 'continue' | 'submit' | 'refresh') {
    if (!data || locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      let saved = data.saved;
      if (
        action === 'draft' ||
        (action === 'submit' && (dirty || !saved.presentation.requestId))
      ) {
        await request('/presentation', {
          action: 'draft',
          answer,
          expectedVersion: saved.presentation.version,
          expectedRevision: saved.progress.revision,
        });
        saved = await refresh();
        // A competing tab may have changed the draft between write and read.
        if (
          saved.presentation.answer !== answer ||
          saved.presentation.progressRevision !== data.saved.progress.revision
        )
          throw new Error('409');
      }
      if (action === 'continue')
        await request('/presentation', {
          action: 'continue',
          answer: '',
          expectedVersion: saved.presentation.version,
          expectedRevision: saved.progress.revision,
        });
      if (action === 'submit') {
        if (!saved.progress.next || !saved.presentation.requestId)
          throw new Error('409');
        await request('/attempts', {
          requestId: saved.presentation.requestId,
          itemId: saved.progress.next.itemId,
          expectedRevision: saved.progress.revision,
          answer: saved.presentation.answer,
        });
      }
      await refresh();
      setNotice(
        action === 'draft'
          ? 'Concept opgeslagen. Je kunt later verder.'
          : 'Opgeslagen werk geladen.',
      );
    } catch (failure) {
      if (failure instanceof Error && failure.message === '409') {
        try {
          await refresh();
          setNotice(
            'Deze taak is elders gewijzigd. Het opgeslagen werk is opnieuw geladen; controleer het voordat je verdergaat.',
          );
        } catch {
          setData(null);
          setAnswer('');
          setNotice(
            'Het nieuwste opgeslagen werk kon niet worden geladen. Probeer opnieuw.',
          );
        }
      } else if (
        failure instanceof Error &&
        ['401', '403', '404'].includes(failure.message)
      ) {
        setData(null);
        setAnswer('');
        setNotice(
          'Toegang verlopen. Meld je opnieuw aan op je goedgekeurde browser.',
        );
      } else
        setNotice(
          'Opslaan niet bevestigd. Probeer opnieuw of laad het opgeslagen werk.',
        );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  if (!data || !snapshot)
    return (
      <main className={styles.page}>
        <h1>Mijn taak</h1>
        <p role="status">{notice}</p>
        <Button onClick={() => window.location.reload()}>Opnieuw laden</Button>
        <p>
          <a href="/student">Mijn taken</a>
        </p>
      </main>
    );
  if (data.saved.withdrawn)
    return (
      <main className={styles.page}>
        <h1>Deze taak is gepauzeerd</h1>
        <p role="status">
          Er wordt een oefening gecontroleerd. Je hoeft deze taak niet af te
          maken. Je opgeslagen werk blijft bewaard.
        </p>
        <p>Je ouder kan de toelichting bij de taakresultaten bekijken.</p>
        <a href="/student">Terug naar mijn taken</a>
      </main>
    );
  const receipt = data.saved.lastSubmission;
  return (
    <>
      <ExerciseScreen
        definition={{
          ...(data.assignment.subject === 'Spelling'
            ? spellingPresentation
            : data.assignment.subject === 'Taal'
              ? taalPresentation
              : data.assignment.subject === 'Begrijpend Lezen'
                ? readingPresentation
                : data.assignment.category === 'Redactiesommen'
                  ? redactiesommenPresentation
                  : rekenenPresentation),
          readingText: data.assignment.items[snapshot.state.index]?.readingText,
          previewQuestion: (index) => ({
            prompt: data.assignment.items[index]!.prompt,
            answerUnit: data.assignment.items[index]!.answerUnit,
            options: data.assignment.items[index]!.options,
            answer:
              snapshot.state.stage === 'feedback'
                ? (receipt?.solution?.answer ?? '')
                : '',
            steps:
              snapshot.state.stage === 'feedback'
                ? (receipt?.solution?.steps ?? [])
                : [],
          }),
        }}
        connected={{
          snapshot: { ...snapshot, answer, error },
          onChange: (next) => {
            setAnswer(next.answer);
            setError(next.error);
          },
          onReturn: () => {
            if (dirty || busy) {
              setNotice('Bewaar je concept voordat je naar je taken gaat.');
              return;
            }
            router.push('/student');
          },
          taskNumber: 1,
          taskTitle: `${data.assignment.subject} · ${data.assignment.category}`,
          blockLabel: 'Opgeslagen oefentaak',
        }}
        saved={{
          busy,
          note: `${busy ? 'Opslaan…' : notice} ${dirty ? 'Je wijzigingen zijn nog niet opgeslagen. Kies Bewaar concept voordat je sluit.' : 'Alleen bewaarde concepten en bevestigde antwoorden blijven bewaard.'}`,
          onSaveDraft: () => void act('draft'),
          onSubmit: () => void act('submit'),
          onContinue: () => void act('continue'),
        }}
      />
      <div className={styles.page}>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void act('refresh')}
        >
          Laad opgeslagen werk
        </Button>
      </div>
    </>
  );
}
