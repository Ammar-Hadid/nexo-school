'use client';

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { LearningBackdrop } from '../../../components/learning-backdrop/learning-backdrop';
import { ExerciseScreen } from '../exercise/exercise-screen';
import { practiceTasks as tasks } from './practice-journey-tasks';
import { PracticeBlockCard } from '../practice-block/practice-block-card';
import { PracticeTasksPage } from '../practice-block/practice-tasks-page';
import type { PracticeBlockView } from '../practice-block/practice-block.types';
import { taskStatus, type TaskSnapshots } from './practice-journey-state';
import styles from '../practice-block/practice-tasks.module.css';

type Page = 'blocks' | 'tasks' | { taskId: string };
const previewNote =
  'Ontwerpvoorbeeld · voortgang blijft alleen tijdelijk in deze preview. Vernieuwen of sluiten wist alle antwoorden.';

/** Connected synthetic design specimen; no route, server or durable progress API. */
export function PracticeJourney({
  initialPage = 'blocks',
  progress,
}: {
  initialPage?: 'blocks' | 'tasks';
  progress?: {
    snapshots: TaskSnapshots;
    setSnapshots: Dispatch<SetStateAction<TaskSnapshots>>;
  };
}) {
  const [page, setPage] = useState<Page>(initialPage);
  const [localSnapshots, setLocalSnapshots] = useState<TaskSnapshots>({});
  const snapshots = progress?.snapshots ?? localSnapshots;
  const setSnapshots = progress?.setSnapshots ?? setLocalSnapshots;
  const [returnTaskId, setReturnTaskId] = useState<string>();
  const blockRegion = useRef<HTMLDivElement>(null);
  const openedBlock = useRef(initialPage === 'tasks');
  const sessions = tasks.map((task) => ({
    id: task.id,
    title: `${task.definition.subject} · taak ${task.number}`,
    questions: task.definition.initialPreview('question').outcomes.length,
    status: taskStatus(snapshots[task.id]),
  }));
  const complete = sessions.every((task) => task.status === 'done');
  const block: PracticeBlockView = {
    number: 1,
    title: 'Na school',
    state: complete
      ? 'completed'
      : Object.keys(snapshots).length
        ? 'active'
        : 'planned',
    subjects: 'Rekenen · taal · spelling · redactiesommen · begrijpend lezen',
    sessions,
    passMinutes: 0,
    availability: '',
    studentAvailability: complete
      ? 'Alle taken zijn klaar!'
      : 'Kies zelf welke taak je nu doet.',
  };

  useEffect(() => {
    if (page === 'blocks' && openedBlock.current)
      blockRegion.current?.querySelector('a')?.focus();
  }, [page]);

  if (page === 'blocks') {
    return (
      <LearningBackdrop>
        <main className={styles.page}>
          <aside className={styles.previewNote}>{previewNote}</aside>
          <h1>Mijn blokken</h1>
          <div ref={blockRegion}>
            <PracticeBlockCard
              block={block}
              headingLevel={2}
              tasksHref="#taken"
              showPass={false}
              onOpenTasks={() => {
                openedBlock.current = true;
                setPage('tasks');
              }}
            />
          </div>
        </main>
      </LearningBackdrop>
    );
  }
  if (page === 'tasks') {
    return (
      <PracticeTasksPage
        block={block}
        backHref="#blokken"
        onBack={() => setPage('blocks')}
        previewNote={previewNote}
        returnTaskId={returnTaskId}
        onChoose={(session) => {
          const task = tasks.find((item) => item.id === session.id);
          if (!task) return;
          setSnapshots((previous) =>
            previous[task.id]
              ? previous
              : {
                  ...previous,
                  [task.id]: {
                    state: task.definition.initialPreview('question'),
                    answer: '',
                    error: '',
                  },
                },
          );
          setReturnTaskId(task.id);
          setPage({ taskId: task.id });
        }}
      />
    );
  }
  const task = tasks.find((item) => item.id === page.taskId);
  const snapshot = snapshots[page.taskId];
  if (!task || !snapshot) return null;
  return (
    <ExerciseScreen
      key={task.id}
      definition={task.definition}
      connected={{
        snapshot,
        taskNumber: task.number,
        blockLabel: 'Blok 1 · Na school',
        onChange: (next) =>
          setSnapshots((previous) => ({ ...previous, [task.id]: next })),
        onReturn: () => setPage('tasks'),
      }}
    />
  );
}
