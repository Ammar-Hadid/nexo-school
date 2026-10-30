import { exerciseMessages, exerciseSituation } from './exercise-companion';
import type { PreviewState } from './exercise-preview';
import type { NexaiSituation } from '../../../components/nexai/nexai-situations';

/** Exact approved catalogue lines selected for this language context; no rewriting. */
export function wordMessages(situation: NexaiSituation) {
  return exerciseMessages(situation).filter(
    (message) =>
      !/\b(som|sommen|getal|getallen|reken|rekent|rekenen|gerekend|uitgerekend|uitrekenen|rekentaak|rekenstand|uitkomst|uitkomen)\b/i.test(
        message.text,
      ),
  );
}
export function wordCompanion(state: PreviewState, variant = -1) {
  const messages = wordMessages(exerciseSituation(state));
  const turn =
    state.stage === 'result'
      ? 0
      : state.retry
        ? state.outcomes.length + state.retryIndex
        : state.index;
  const index =
    Number.isFinite(variant) && variant >= 0 ? Math.floor(variant) : turn;
  return messages[index % messages.length]!;
}
