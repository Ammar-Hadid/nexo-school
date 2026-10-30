import type {
  ExerciseDefinition,
  ExerciseSnapshot,
} from '../exercise/exercise-definition';
import { previewScore } from '../exercise/exercise-preview';

/** A read-only projection of committed synthetic attempts, never a second result store. */
export function guardianResult(
  definition: Pick<ExerciseDefinition, 'initialPreview' | 'previewQuestion'>,
  snapshot?: Readonly<ExerciseSnapshot>,
) {
  const state = snapshot?.state;
  const total = definition.initialPreview('question').outcomes.length;
  const complete = state?.stage === 'result';
  const first =
    state?.outcomes.filter((outcome) => outcome === 'first').length ?? 0;
  const second =
    state?.outcomes.filter((outcome) => outcome === 'second').length ?? 0;
  return {
    status: !state ? 'Nog niet gestart' : complete ? 'Afgerond' : 'Bezig',
    complete,
    total,
    first,
    second,
    solved: first + second,
    answered: state?.attempts.filter((attempt) => !attempt.retry).length ?? 0,
    pendingRetries:
      state?.outcomes.filter((outcome) => outcome === 'queued').length ?? 0,
    score: complete ? previewScore(state.outcomes) : undefined,
    questions: Array.from({ length: total }, (_, index) => {
      const question = definition.previewQuestion(index);
      const outcome = state?.outcomes[index] ?? 'open';
      return {
        index,
        prompt: question.prompt,
        options: question.options,
        outcome,
        attempts: (
          state?.attempts.filter((attempt) => attempt.index === index) ?? []
        ).map((attempt) => ({
          ...attempt,
          label:
            question.options?.find((option) => option.value === attempt.answer)
              ?.label ?? attempt.answer,
        })),
        // An unfinished review must not reveal keys for unanswered/queued questions.
        answerModel:
          complete || outcome === 'missed'
            ? {
                answer: `${question.answer}${question.answerUnit ? ` ${question.answerUnit}` : ''}`,
                steps: question.steps,
              }
            : undefined,
      };
    }),
  };
}
