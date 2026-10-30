import type { ExerciseSnapshot } from '../exercise/exercise-definition';
import type { SessionView } from '../practice-block/practice-block.types';

/** Owned by one mounted preview. Never persisted or shared between tabs. */
export type TaskSnapshots = Record<string, ExerciseSnapshot>;

export function taskStatus(snapshot?: ExerciseSnapshot): SessionView['status'] {
  if (!snapshot) return 'planned';
  return snapshot.state.stage === 'result' ? 'done' : 'active';
}
