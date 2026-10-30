'use client';
import { useEffect, useRef, useState } from 'react';
import { LearningBackdrop } from '../../../components/learning-backdrop/learning-backdrop';
import { ExerciseScreen } from '../exercise/exercise-screen';
import type { ExerciseSnapshot } from '../exercise/exercise-definition';
import { PracticeBlockCard } from '../practice-block/practice-block-card';
import { PracticeTasksPage } from '../practice-block/practice-tasks-page';
import type { PracticeBlockView } from '../practice-block/practice-block.types';
import { dayLabel, taskTitle, type PathState } from './path-model';
import { pathExercise } from './path-exercise';
import styles from '../practice-block/practice-tasks.module.css';
const previewNote =
  'Ontwerpvoorbeeld · alleen tijdelijk in deze preview. Vernieuwen of een ander scenario kiezen wist de antwoorden.';

export function PathStudent({
  state,
  onChange,
}: {
  state: PathState;
  onChange: (id: string, snapshot: ExerciseSnapshot) => void;
}) {
  const [page, setPage] = useState('blocks');
  const [returnTaskId, setReturnTaskId] = useState<string>();
  const blockRegion = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const tasks = state.days[state.day]!.map((id) =>
    state.tasks.find((t) => t.id === id)!,
  );
  const sessions: PracticeBlockView['sessions'] = tasks.map((t) => ({
    id: t.id,
    title: taskTitle(t),
    questions: t.questions.length,
    status:
      t.snapshot.state.stage === 'result'
        ? 'done'
        : t.started
          ? 'active'
          : 'planned',
  }));
  const done = sessions.every((t) => t.status === 'done');
  const block: PracticeBlockView = {
    number: 1,
    title: 'Vandaag oefenen',
    state: done
      ? 'completed'
      : sessions.some((t) => t.status !== 'planned')
        ? 'active'
        : 'planned',
    subjects: 'Rekenen · taal',
    sessions,
    passMinutes: 0,
    availability: '',
    studentAvailability: done
      ? 'Alle taken zijn klaar!'
      : 'Kies zelf welke taak je nu doet.',
    carryoverNote: tasks.some(
      (t) => t.issuedDay < state.day && t.snapshot.state.stage !== 'result',
    )
      ? 'Je gaat verder waar je gebleven was.'
      : undefined,
  };
  useEffect(() => {
    if (page === 'blocks' && opened.current)
      blockRegion.current?.querySelector('a')?.focus();
  }, [page]);
  if (page === 'blocks')
    return (
      <LearningBackdrop>
        <main className={styles.page}>
          <p className={styles.previewNote}>{previewNote}</p>
          <header>
            <p className={styles.eyebrow}>{dayLabel(state.day)}</p>
            <h1 tabIndex={-1}>Mijn blokken voor vandaag</h1>
            <p>Dit staat er vandaag voor je klaar.</p>
          </header>
          <div ref={blockRegion}>
            <PracticeBlockCard
              block={block}
              headingLevel={2}
              showPass={false}
              tasksHref="#taken"
              onOpenTasks={() => {
                opened.current = true;
                setPage('tasks');
              }}
            />
          </div>
        </main>
      </LearningBackdrop>
    );
  if (page === 'tasks')
    return (
      <PracticeTasksPage
        block={block}
        backHref="#vandaag"
        previewNote={previewNote}
        returnTaskId={returnTaskId}
        onBack={() => setPage('blocks')}
        onChoose={(session) => {
          const chosen = tasks.find((task) => task.id === session.id)!;
          onChange(chosen.id, chosen.snapshot);
          setReturnTaskId(session.id);
          setPage(session.id);
        }}
      />
    );
  const task = tasks.find((t) => t.id === page)!;
  return (
    <ExerciseScreen
      key={task.id}
      definition={pathExercise(task)}
      connected={{
        snapshot: task.snapshot,
        onChange: (snapshot) => onChange(task.id, snapshot),
        onReturn: () => setPage('tasks'),
        taskNumber: 1,
        taskTitle: taskTitle(task),
        blockLabel: `Blok 1 · ${dayLabel(state.day)}`,
      }}
    />
  );
}
