import { advancePreview } from '../exercise/exercise-preview';
import { practiceTasks } from '../journey/practice-journey-tasks';
import type { TaskSnapshots } from '../journey/practice-journey-state';

/** Seed through the same submissions/transitions as the student, including every attempt. */
export function guardianReviewFixture(): TaskSnapshots {
  const snapshots: TaskSnapshots = {};
  for (const task of practiceTasks.filter(
    (task) => task.id === 'rekenen-1' || task.id === 'reading-1',
  )) {
    const d = task.definition;
    let state = d.initialPreview('question');
    while (state.stage !== 'result') {
      const question = d.previewQuestion(state.index);
      const correct =
        question.options?.find((option) => option.label === question.answer)
          ?.value ?? String(question.answer);
      const miss = state.index === 8 || (state.index === 3 && !state.retry);
      const incorrect =
        question.options?.find((option) => option.value !== correct)?.value ??
        '1';
      state = advancePreview(
        d.submitPreview(state, miss ? incorrect : correct),
      );
    }
    snapshots[task.id] = { state, answer: '', error: '' };
  }
  const spelling = practiceTasks.find(
    (task) => task.id === 'spelling-1',
  )!.definition;
  snapshots['spelling-1'] = {
    state: advancePreview(
      spelling.submitPreview(spelling.initialPreview('question'), 'kátten'),
    ),
    answer: 'hond',
    error: '',
  };
  return snapshots;
}
