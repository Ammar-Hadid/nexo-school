import {
  nexaiSituations,
  type NexaiSituation,
} from '../../../components/nexai/nexai-situations';
import type { PreviewState } from './exercise-preview';

/** Maps known synthetic answer states only, never score/timing to misconduct. */
export function exerciseSituation(state: PreviewState): NexaiSituation {
  if (state.stage === 'result') {
    if (state.outcomes.every((outcome) => outcome === 'first'))
      return 'perfect';
    if (
      !state.outcomes.some(
        (outcome) => outcome === 'first' || outcome === 'second',
      )
    )
      return 'support';
    return 'complete';
  }
  if (state.stage === 'answer') return 'ready';
  const correct = ['first', 'second'].includes(
    state.outcomes[state.index] ?? 'open',
  );
  if (correct) return state.retry ? 'retryCorrect' : 'firstCorrect';
  return state.retry ? 'explanation' : 'firstIncorrect';
}

// These approved lines say “hieronder”; the current explanation is beside/above
// Nexai. Keep their wording intact and reserve them for a compatible layout.
const belowExplanationIds = new Set([
  'explanation-08',
  'explanation-12',
  'explanation-19',
]);

export function exerciseMessages(situation: NexaiSituation) {
  const messages = nexaiSituations[situation].messages;
  return situation === 'explanation'
    ? messages.filter((message) => !belowExplanationIds.has(message.id))
    : messages;
}

/** Stable presentation selection; no timers, randomness or learning inference. */
export function exerciseMessage(situation: NexaiSituation, variant = 0) {
  const messages = exerciseMessages(situation);
  const index = Number.isFinite(variant) ? Math.max(0, Math.floor(variant)) : 0;
  return messages[index % messages.length]!;
}

export function exerciseCompanion(state: PreviewState, variant = -1) {
  const turn =
    state.stage === 'result'
      ? 0
      : state.retry
        ? state.outcomes.length + state.retryIndex
        : state.index;
  return exerciseMessage(
    exerciseSituation(state),
    variant >= 0 ? variant : turn,
  );
}
