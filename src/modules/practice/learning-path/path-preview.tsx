'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../../components/button/button';
import { PathStudent } from './path-student';
import { PathGuardian } from './path-guardian';
import {
  changeSnapshot,
  createPath,
  dayLabel,
  finishFixture,
  histories,
  MAX_DAY,
  nextDay,
  setRouteHold,
  type History,
} from './path-model';
import styles from './path-preview.module.css';

/** Review controls only: no learner identities, storage, clock or service calls. */
export function AutomaticLearningPath({
  initialHistory = 'known',
}: {
  initialHistory?: History;
}) {
  const [state, setState] = useState(() => createPath(initialHistory));
  const [view, setView] = useState<'student' | 'guardian'>('student');
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
          <strong>In Review · automatische leerroute</strong>
          <p>
            Fictieve geschiedenis · alleen in het geheugen. Vernieuwen of een
            ander scenario kiezen wist deze preview.
          </p>
        </div>
        <div className={styles.controls}>
          <label>
            Fictieve voorgeschiedenis
            <select
              value={state.history}
              onChange={(e) => {
                const history = e.target.value;
                if (Object.hasOwn(histories, history))
                  setState(createPath(history as History));
              }}
            >
              {Object.entries(histories).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button
            size="small"
            variant="outline"
            onClick={() => {
              switched.current = true;
              setView(view === 'student' ? 'guardian' : 'student');
            }}
          >
            {view === 'student' ? 'Naar ouderpreview' : 'Naar leerlingpreview'}
          </Button>
        </div>
        <div className={styles.timeline}>
          <span role="status">
            Previewdag {state.day + 1} van 7 · {dayLabel(state.day)}
          </span>
          <div className={styles.controls}>
            <Button
              size="small"
              variant="ghost"
              onClick={() =>
                setState((previous) =>
                  previous.days[previous.day]!.reduce(
                    (s, id) => finishFixture(s, id),
                    previous,
                  ),
                )
              }
            >
              Doorloop open taken foutloos (demo)
            </Button>
            <Button
              size="small"
              variant="outline"
              disabled={state.day === MAX_DAY}
              onClick={() => setState(nextDay)}
            >
              Volgende previewdag
            </Button>
          </div>
        </div>
        <p>
          De demoknop vult fictieve antwoorden in. Volgende dag bewaart
          onafgemaakte taken. Dit zijn reviewknoppen, geen bediening voor Adam.
        </p>
      </aside>
      <div
        ref={student}
        hidden={view !== 'student'}
        onFocusCapture={(event) => {
          lastStudentFocus.current = event.target;
        }}
      >
        <PathStudent
          key={`${state.history}-${state.day}`}
          state={state}
          onChange={(id, snapshot) =>
            setState((previous) => changeSnapshot(previous, id, snapshot))
          }
        />
      </div>
      <div ref={guardian} hidden={view !== 'guardian'}>
        <PathGuardian
          state={state}
          onHold={(subject, held) =>
            setState((previous) =>
              setRouteHold(
                previous,
                subject,
                held,
                held
                  ? 'Ouderpreview: extra uitleg bespreken'
                  : 'Ouderpreview: route hervatten',
              ),
            )
          }
        />
      </div>
    </div>
  );
}
