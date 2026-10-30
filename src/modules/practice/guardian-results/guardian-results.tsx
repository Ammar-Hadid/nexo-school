'use client';
import type { TaskSnapshots } from '../journey/practice-journey-state';
import { practiceTasks } from '../journey/practice-journey-tasks';
import { guardianResult } from './guardian-result-model';
import { GuardianResultsView } from './guardian-results-view';

export function GuardianResults({
  snapshots,
}: {
  snapshots: Readonly<TaskSnapshots>;
}) {
  return (
    <GuardianResultsView
      tasks={practiceTasks.map((task) => ({
        id: task.id,
        title: `${task.definition.subject} · taak ${task.number}`,
        readingText: task.definition.readingText,
        result: guardianResult(task.definition, snapshots[task.id]),
      }))}
    />
  );
}
