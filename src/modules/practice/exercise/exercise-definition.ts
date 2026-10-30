import type { PreviewState, Scenario } from './exercise-preview';
import type { SummaryCopy } from './exercise-summary';
import type { exerciseCompanion } from './exercise-companion';

export type ExerciseSnapshot = {
  state: PreviewState;
  answer: string;
  error: string;
};
export type ConnectedExercise = {
  snapshot: ExerciseSnapshot;
  onChange: (snapshot: ExerciseSnapshot) => void;
  onReturn: () => void;
  taskNumber: number;
  /** Category-aware assignment title; existing approved previews keep their title. */
  taskTitle?: string;
  blockLabel: string;
};
export type ExerciseScreenProps = {
  connected?: ConnectedExercise;
  scenario?: Scenario;
  embedded?: boolean;
  messageVariant?: number;
};
/** Concrete adapters for the in-memory design previews; not an educational content API. */
export type ExerciseDefinition = {
  subject: string;
  task: number;
  exerciseLabel: string;
  instruction: string;
  promptAppearance?: 'passage';
  readingText?: { title: string; paragraphs: readonly string[] };
  inputMode: 'numeric' | 'text';
  maxLength: number;
  autoCorrect?: 'off';
  nextFeedback: string;
  explanationHeading: string;
  explanationIntro: string;
  summary: SummaryCopy;
  initialPreview: (scenario: Scenario) => PreviewState;
  previewQuestion: (index: number) => {
    answerUnit?: string;
    options?: readonly { value: string; label: string }[];
    prompt: string;
    answer: string | number;
    steps: string[];
  };
  submitPreview: (state: PreviewState, answer: string) => PreviewState;
  validate: (answer: string) => string;
  companion: typeof exerciseCompanion;
};

/** Server-backed rendering has no browser evaluator or answer-key catalogue. */
export type ExercisePresentation = Omit<
  ExerciseDefinition,
  'initialPreview' | 'submitPreview'
>;
export type SavedExerciseActions = {
  busy: boolean;
  note: string;
  onSubmit: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
};
