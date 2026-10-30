'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../../components/button/button';
import { PracticeJourney } from '../journey/practice-journey';
import type { TaskSnapshots } from '../journey/practice-journey-state';
import { GuardianResults } from './guardian-results';
import { guardianReviewFixture } from './guardian-results.fixtures';
import styles from './guardian-results.module.css';

/** Review tooling, not a product role switch or an authentication boundary. */
export function GuardianResultsPreview({
  populated = true,
}: {
  populated?: boolean;
}) {
  const [snapshots, setSnapshots] = useState<TaskSnapshots>(() =>
    populated ? guardianReviewFixture() : {},
  );
  const [view, setView] = useState<'guardian' | 'student'>('guardian');
  const student = useRef<HTMLDivElement>(null);
  const guardian = useRef<HTMLDivElement>(null);
  const lastStudentFocus = useRef<HTMLElement | null>(null);
  const switched = useRef(false);
  useLayoutEffect(() => {
    if (!switched.current) return;
    if (view === 'guardian')
      guardian.current?.querySelector<HTMLElement>('h1')?.focus();
    else if (lastStudentFocus.current?.isConnected)
      lastStudentFocus.current.focus();
    else student.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [view]);
  return (
    <div className={styles.preview}>
      <aside className={styles.toolbar} aria-label="Previewbediening">
        <div>
          <strong>Ontwerpvoorbeeld · ouderresultaten</strong>
          <p>
            Fictieve gegevens · alleen in het geheugen. Vernieuwen herstelt dit
            voorbeeld.
            {populated
              ? ' Twee taken zijn vooraf doorlopen.'
              : ' Alle taken beginnen leeg.'}
          </p>
        </div>
        <Button
          size="small"
          variant="outline"
          onClick={() => {
            switched.current = true;
            setView(view === 'guardian' ? 'student' : 'guardian');
          }}
        >
          {view === 'guardian' ? 'Naar leerlingpreview' : 'Naar ouderpreview'}
        </Button>
      </aside>
      {/* Keep the student mounted so its navigation, draft, feedback and focus target survive. */}
      <div
        ref={student}
        hidden={view !== 'student'}
        onFocusCapture={(event) => {
          lastStudentFocus.current = event.target;
        }}
      >
        <PracticeJourney
          initialPage="tasks"
          progress={{ snapshots, setSnapshots }}
        />
      </div>
      <div ref={guardian} hidden={view !== 'guardian'}>
        <GuardianResults snapshots={snapshots} />
      </div>
    </div>
  );
}
