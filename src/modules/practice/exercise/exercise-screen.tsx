'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../../../components/button/button';
import { NexaiCompanion } from '../../../components/nexai/nexai';
import { ChoiceAnswer } from './choice-answer';
import { ReadingPassage } from './reading-passage';
import { TextField } from '../../../components/text-field/text-field';
import '../practice-block/practice-block.tokens.css';
import { advancePreview } from './exercise-preview';
import { ExerciseSummary, tasksHref } from './exercise-summary';
import type {
  ExerciseDefinition,
  ExerciseScreenProps,
  ExerciseSnapshot,
  ExercisePresentation,
  SavedExerciseActions,
} from './exercise-definition';
import './exercise.tokens.css';
import styles from './exercise-screen.module.css';

/** Approved presentation shared by local previews and the server-authoritative route. */
export function ExerciseScreen({
  definition,
  scenario = 'question',
  embedded = false,
  messageVariant = -1,
  connected,
  saved,
}: {
  definition: ExerciseDefinition | ExercisePresentation;
  saved?: SavedExerciseActions;
} & ExerciseScreenProps) {
  const { previewQuestion } = definition;
  const initialPreview = (
    scenario: Parameters<ExerciseDefinition['initialPreview']>[0],
  ) => {
    if ('initialPreview' in definition)
      return definition.initialPreview(scenario);
    if (connected) return connected.snapshot.state;
    throw new Error('Saved exercise requires a snapshot');
  };
  const [localSnapshot, setLocalSnapshot] = useState<ExerciseSnapshot>(() => {
    const state = initialPreview(scenario);
    return { state, answer: state.submitted, error: '' };
  });
  const snapshot = connected?.snapshot ?? localSnapshot;
  const { state, answer, error } = snapshot;
  const setSnapshot = connected?.onChange ?? setLocalSnapshot;
  const taskNumber = connected?.taskNumber ?? definition.task;
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const isConnected = Boolean(connected);
  const id = useId();
  const question = previewQuestion(state.index);
  const Root = embedded ? 'div' : 'main';
  const ExplanationHeading =
    definition.promptAppearance === 'passage' ? 'h2' : 'h3';
  const reading = definition.readingText;
  const feedback = state.stage === 'feedback';
  const outcome = state.outcomes[state.index];
  const correct = outcome === 'first' || outcome === 'second';
  const finalMiss = feedback && state.retry && !correct;
  const resolved = state.outcomes.filter((item) =>
    ['first', 'second', 'missed'].includes(item),
  ).length;
  const companion = definition.companion(state, messageVariant);

  useEffect(() => {
    const entering = !started.current;
    started.current = true;
    if (entering && !isConnected) return;
    if (state.stage === 'answer') input.current?.focus();
    if (state.stage === 'result' || (entering && state.stage === 'feedback'))
      heading.current?.focus();
  }, [state.index, state.stage, isConnected]);

  function advance() {
    if (saved) {
      saved.onContinue();
      return;
    }
    setSnapshot({ state: advancePreview(state), answer: '', error: '' });
  }

  return (
    <Root className={`${styles.page} ${reading ? styles.readingPage : ''}`}>
      <div className={styles.topbar}>
        <a
          href={saved ? '/student' : isConnected ? '#taken' : tasksHref}
          onClick={
            connected
              ? (event) => {
                  event.preventDefault();
                  connected.onReturn();
                }
              : undefined
          }
        >
          ← Mijn taken
        </a>
        <span className={styles.muted}>
          {connected?.blockLabel ?? 'Blok 1 · Na school'}
        </span>
      </div>
      <header className={styles.header}>
        <p className={styles.brand}>
          nexo School <span>· Samen met Nexai</span>
        </p>
        <h1>
          {connected?.taskTitle ?? (
            <>
              {definition.subject}{' '}
              <span className={styles.muted}>· taak {taskNumber}</span>
            </>
          )}
        </h1>
        <div
          className={styles.progress}
          role="img"
          aria-label={
            state.stage === 'result'
              ? `Voortgang: alle ${definition.summary.plural} afgerond.`
              : `Voortgang: vraag ${state.index + 1} van ${state.outcomes.length}, ${resolved} van ${state.outcomes.length} afgerond.`
          }
        >
          {state.outcomes.map((value, index) => (
            <span
              className={styles.step}
              aria-hidden="true"
              key={index}
              data-state={value}
              data-current={state.index === index && state.stage !== 'result'}
            >
              <svg viewBox="0 0 24 24" focusable="false">
                <ellipse cx="5" cy="9" rx="3" ry="4" />
                <ellipse cx="10" cy="5" rx="3" ry="4" />
                <ellipse cx="17" cy="6" rx="3" ry="4" />
                <ellipse cx="21" cy="11" rx="2.5" ry="3.5" />
                <path d="M5 18C5 14 9 11 12 11S20 15 19 19C18 23 15 20 12 20S5 23 5 18Z" />
              </svg>
            </span>
          ))}
        </div>
      </header>
      <section
        className={styles.workspace}
        aria-label={definition.exerciseLabel}
      >
        <div
          className={
            reading && state.stage !== 'result'
              ? styles.readingLayout
              : undefined
          }
        >
          {reading && state.stage !== 'result' && (
            <ReadingPassage
              title={reading.title}
              paragraphs={reading.paragraphs}
              id={`${id}-passage`}
            />
          )}
          <div
            className={`${styles.layout} ${reading && state.stage !== 'result' ? styles.readingQuestions : ''}`}
          >
            <div
              ref={heading}
              tabIndex={-1}
              id={`${id}-question-panel`}
              className={reading ? styles.questionPanel : undefined}
            >
              {state.stage === 'result' ? (
                <ExerciseSummary
                  copy={
                    connected
                      ? {
                          ...definition.summary,
                          title:
                            connected.taskTitle ??
                            `${definition.subject} · taak ${taskNumber}`,
                        }
                      : definition.summary
                  }
                  onReturn={connected?.onReturn}
                  outcomes={state.outcomes}
                  onRestart={
                    connected
                      ? undefined
                      : () => {
                          setSnapshot({
                            state: initialPreview('question'),
                            answer: '',
                            error: '',
                          });
                        }
                  }
                />
              ) : (
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (saved?.busy) return;
                    if (feedback) {
                      advance();
                      return;
                    }
                    const validation = definition.validate(answer);
                    if (validation) {
                      setSnapshot({ ...snapshot, error: validation });
                      input.current?.focus();
                      return;
                    }
                    if (saved) {
                      saved.onSubmit();
                      return;
                    }
                    if (!('submitPreview' in definition)) return;
                    setSnapshot({
                      ...snapshot,
                      error: '',
                      state: definition.submitPreview(state, answer.trim()),
                    });
                  }}
                >
                  <div className={styles.question}>
                    <span className={styles.eyebrow}>
                      {definition.instruction}
                    </span>
                    {definition.promptAppearance === 'passage' ? (
                      <p className={styles.passage} id={`${id}-question`}>
                        {question.prompt}
                      </p>
                    ) : (
                      <h2 id={`${id}-question`}>{question.prompt}</h2>
                    )}
                    {question.options ? (
                      <ChoiceAnswer
                        ref={input}
                        name={`${id}-answer`}
                        questionId={`${id}-question`}
                        options={question.options}
                        value={answer}
                        disabled={feedback || Boolean(saved?.busy)}
                        error={error}
                        onChange={(value) => {
                          setSnapshot({
                            ...snapshot,
                            answer: value,
                            error: '',
                          });
                        }}
                      />
                    ) : (
                      <TextField
                        ref={input}
                        id={`${id}-answer`}
                        label={
                          question.answerUnit
                            ? `Jouw antwoord in ${question.answerUnit}`
                            : 'Jouw antwoord'
                        }
                        appearance="answer"
                        type="text"
                        inputMode={definition.inputMode}
                        autoComplete="off"
                        autoCorrect={definition.autoCorrect}
                        maxLength={definition.maxLength}
                        autoCapitalize={
                          definition.inputMode === 'text' ? 'none' : undefined
                        }
                        spellCheck={
                          definition.inputMode === 'text' ? false : undefined
                        }
                        value={answer}
                        readOnly={feedback || saved?.busy}
                        error={error}
                        aria-describedby={`${id}-question`}
                        onChange={(event) => {
                          setSnapshot({
                            ...snapshot,
                            answer: event.target.value,
                            error: '',
                          });
                        }}
                      />
                    )}
                  </div>
                  {feedback && (
                    <div
                      className={styles.feedback}
                      data-tone={correct ? 'positive' : 'negative'}
                    >
                      <strong>{correct ? '✓ Goed!' : 'Nog niet goed'}</strong>
                      <p>
                        {correct
                          ? definition.nextFeedback
                          : finalMiss
                            ? 'Lees de stappen hieronder rustig door.'
                            : 'Ga rustig verder.'}
                      </p>
                    </div>
                  )}
                  {finalMiss && (
                    <div className={styles.explanation}>
                      <ExplanationHeading>
                        {definition.explanationHeading}
                      </ExplanationHeading>
                      <p>
                        Jouw antwoord was{' '}
                        {question.options?.find(
                          (option) => option.value === state.submitted,
                        )?.label ?? state.submitted}
                        . Het juiste antwoord is {question.answer}
                        {question.answerUnit ? ` ${question.answerUnit}` : ''}.
                      </p>
                      <p>{definition.explanationIntro}</p>
                      <ol className={styles.steps}>
                        {question.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <div className={styles.actions}>
                    <Button type="submit" loading={saved?.busy}>
                      {feedback ? 'Verder' : 'Controleer antwoord'}
                    </Button>
                    {saved && !feedback && (
                      <Button
                        variant="outline"
                        disabled={saved.busy}
                        onClick={saved.onSaveDraft}
                      >
                        Bewaar concept
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>
            <div className={styles.companion}>
              <div className={styles.nexaiSpot}>
                <span className={styles.spotLabel}>Nexai is erbij</span>
                <NexaiCompanion
                  message={companion.text}
                  pose={companion.pose}
                  eventKey={`${state.index}-${state.retry}-${state.stage}-${companion.id}`}
                  ambient={state.stage === 'answer'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <p className={styles.note} role={saved ? 'status' : undefined}>
        {saved
          ? saved.note
          : connected
            ? 'Ontwerpvoorbeeld · voortgang blijft alleen tijdelijk in deze preview. Vernieuwen of sluiten wist alle antwoorden.'
            : `Ontwerpvoorbeeld · ${state.outcomes.length} vaste oefenvragen. Antwoorden blijven alleen op deze pagina; er wordt niets opgeslagen.`}
      </p>
    </Root>
  );
}
