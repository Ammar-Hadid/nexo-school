import { Button } from '../../../components/button/button';
import { previewScore, type Outcome } from './exercise-preview';
import { scoreOutOfTen } from './score-display';
import styles from './exercise-screen.module.css';

export const tasksHref =
  '/iframe.html?id=components-practice-tasks--tasks-page&viewMode=story&args=state:active';

export type SummaryCopy = {
  title: string;
  singular: string;
  plural: string;
  success: string;
  support: string;
};

export function ExerciseSummary({
  copy,
  outcomes,
  onRestart,
  onReturn,
}: {
  copy: SummaryCopy;
  outcomes: Outcome[];
  onRestart?: () => void;
  onReturn?: () => void;
}) {
  const first = outcomes.filter((value) => value === 'first').length;
  const second = outcomes.filter((value) => value === 'second').length;
  const missed = outcomes.filter((value) => value === 'missed').length;
  const correct = first + second;
  const score = scoreOutOfTen(previewScore(outcomes), outcomes.length);
  return (
    <div className={styles.result}>
      <span className={styles.eyebrow}>{copy.title}</span>
      <h2>Taak klaar!</h2>
      <p>Je hebt alle {outcomes.length} vragen afgerond.</p>
      <p className={styles.score} aria-label={`Resultaat: ${score} van de 10`}>
        {score} <small>van de 10</small>
      </p>
      <p
        aria-label={`${correct} van de ${outcomes.length} ${copy.plural} goed`}
      >
        {correct} van de {outcomes.length} {copy.plural} goed
      </p>
      <p>{correct > 0 ? copy.success : copy.support}</p>
      <dl className={styles.breakdown}>
        <div>
          <dt>In één keer goed</dt>
          <dd>
            {first} {first === 1 ? copy.singular : copy.plural}
          </dd>
        </div>
        <div>
          <dt>Na nog eens proberen</dt>
          <dd>
            {second} {second === 1 ? copy.singular : copy.plural}
          </dd>
        </div>
        <div>
          <dt>Samen verder oefenen</dt>
          <dd>
            {missed} {missed === 1 ? copy.singular : copy.plural}
          </dd>
        </div>
      </dl>
      <a
        href={onReturn ? '#taken' : tasksHref}
        onClick={
          onReturn
            ? (event) => {
                event.preventDefault();
                onReturn();
              }
            : undefined
        }
      >
        ← Terug naar mijn taken
      </a>
      {onRestart && (
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onRestart}>
            Voorbeeld opnieuw proberen
          </Button>
        </div>
      )}
    </div>
  );
}
