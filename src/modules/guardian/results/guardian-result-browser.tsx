'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Search,
} from 'lucide-react';
import { Button } from '@/components/button/button';
import {
  GuardianEmpty,
  GuardianFeedback,
  GuardianPanel,
  GuardianStatus,
} from '@/components/guardian-ui/guardian-ui';
import {
  guardianSubjects,
  SubjectIcon,
  type GuardianSubject,
} from '@/components/guardian-ui/subject-icon';
import type { GuardianResultTask } from '@/modules/practice/guardian-results/guardian-result-contract';
import { scoreOutOfTen } from '@/modules/practice/exercise/score-display';
import { guardianTaskTitle, subjectForTitle } from '../subject-presentation';
import styles from '../guardian-workspace.module.css';

const outcomeLabels = {
  open: 'Nog niet beantwoord',
  queued: 'Tweede poging volgt',
  first: 'Goed in één keer',
  second: 'Goed bij tweede poging',
  missed: 'Na twee pogingen niet goed',
};
export function GuardianResultBrowser({
  tasks,
  selectedId,
  onSelect,
  detailAction,
  emptyAction,
}: {
  tasks: readonly GuardianResultTask[];
  selectedId?: string;
  onSelect: (id?: string) => void;
  detailAction?: ReactNode;
  emptyAction?: ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<GuardianSubject | 'all'>('all');
  const heading = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const returned = useRef<string | undefined>(undefined);
  const task = tasks.find((t) => t.id === selectedId);
  useEffect(() => {
    if (selectedId)
      (
        heading.current?.closest('[data-guardian-ui]')?.querySelector('h1') ??
        heading.current
      )?.focus();
    else if (returned.current) {
      list.current
        ?.querySelector<HTMLButtonElement>(
          `[data-task="${CSS.escape(returned.current)}"]`,
        )
        ?.focus();
      returned.current = undefined;
    }
  }, [selectedId]);
  if (!task) {
    const filtered = tasks.filter(
      (t) =>
        (subject === 'all' || subjectForTitle(t.title) === subject) &&
        guardianTaskTitle(t.title)
          .toLocaleLowerCase('nl')
          .includes(query.toLocaleLowerCase('nl')),
    );
    return (
      <GuardianPanel
        title="Alle sessieresultaten"
        action={
          <GuardianStatus>
            {tasks.filter((t) => t.result.complete).length} van {tasks.length}{' '}
            sessies afgerond
          </GuardianStatus>
        }
      >
        <div className={styles.filters}>
          <label className={styles.search}>
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Zoek een sessie"
              type="search"
              placeholder="Zoek een sessie…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Filter resultaten op vak"
            className={styles.select}
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value as GuardianSubject | 'all')
            }
          >
            <option value="all">Alle vakken</option>
            {Object.entries(guardianSubjects).map(([id, s]) => (
              <option key={id} value={id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {filtered.length ? (
          <ul className={styles.taskRows} ref={list}>
            {filtered.map((t) => (
              <li key={t.id}>
                <SubjectIcon subject={subjectForTitle(t.title)} />
                <div>
                  <h3>{guardianTaskTitle(t.title)}</h3>
                  <p>
                    {t.result.total} {t.result.total === 1 ? 'vraag' : 'vragen'}{' '}
                    · {t.result.answered} eerste antwoorden ingediend
                  </p>
                </div>
                <GuardianStatus
                  tone={
                    t.corrections?.length
                      ? 'warning'
                      : t.result.complete
                        ? 'positive'
                        : 'neutral'
                  }
                >
                  {t.corrections?.length
                    ? 'Inhoud ingetrokken'
                    : t.result.status}
                </GuardianStatus>
                {t.result.complete && !t.corrections?.length && (
                  <span className={styles.taskScore}>
                    {scoreOutOfTen(t.result.score, t.result.total)} / 10
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="small"
                  aria-label={`Bekijk sessie: ${guardianTaskTitle(t.title)}`}
                  data-task={t.id}
                  onClick={() => onSelect(t.id)}
                >
                  Bekijk sessie
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <GuardianEmpty
            title={
              tasks.length
                ? 'Geen sessies bij deze zoekopdracht'
                : 'Nog geen sessie om te bekijken'
            }
            action={
              tasks.length ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setSubject('all');
                  }}
                >
                  Filters wissen
                </Button>
              ) : (
                emptyAction
              )
            }
          >
            <p>
              {tasks.length
                ? 'Probeer een andere naam of bekijk alle vakken.'
                : 'Zet eerst een oefensessie klaar. Daarna vind je de ingediende antwoorden hier terug.'}
            </p>
          </GuardianEmpty>
        )}
        <p className={styles.muted}>
          Alleen ingediende antwoorden. Een eindresultaat verschijnt na de
          laatste poging. Je bekijkt de oorspronkelijke antwoorden; bekijken
          verandert niets.
        </p>
      </GuardianPanel>
    );
  }
  const r = task.result;
  const score = r.complete && !task.corrections?.length;
  return (
    <div className={styles.stack}>
      <div>
        <Button
          variant="ghost"
          size="small"
          onClick={() => {
            returned.current = task.id;
            onSelect(undefined);
          }}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Alle sessieresultaten
        </Button>
      </div>
      <GuardianPanel>
        <div className={styles.detailHeading}>
          <SubjectIcon subject={subjectForTitle(task.title)} size="large" />
          <div>
            <h2 ref={heading} tabIndex={-1}>
              {guardianTaskTitle(task.title)}
            </h2>
            <p>
              {r.total} {r.total === 1 ? 'vraag' : 'vragen'} · oorspronkelijke
              sessie en pogingen
            </p>
          </div>
          {score ? (
            <span className={styles.bigScore}>
              {`${scoreOutOfTen(r.score, r.total)} / 10`}
            </span>
          ) : (
            <GuardianStatus
              tone={task.corrections?.length ? 'warning' : 'neutral'}
            >
              {task.corrections?.length ? 'Ingetrokken' : r.status}
            </GuardianStatus>
          )}
        </div>
        {task.corrections?.length ? (
          <GuardianFeedback
            tone="warning"
            title="Inhoud ingetrokken · resultaat niet gebruiken"
          >
            <p>
              Deze sessie telt niet mee als leerbewijs. De oorspronkelijke
              pogingen blijven zichtbaar; de score wordt niet opnieuw berekend.
              Onvoltooid werk blijft gepauzeerd.
            </p>
            {task.corrections.map((c) => (
              <p key={c.itemId}>
                {c.note}
                {c.correctionNote
                  ? ` Correctie: ${c.correctionNote}. Een nieuwe versie vervangt deze sessie niet.`
                  : ''}
              </p>
            ))}
          </GuardianFeedback>
        ) : r.complete ? (
          <>
            <div className={styles.notice}>
              <Check size={19} aria-hidden="true" />
              <p>
                <strong>
                  {r.first} van {r.total} goed in één keer.
                </strong>{' '}
                {r.second} goed bij de tweede poging. {r.total - r.solved} nog
                niet goed.{' '}
                {r.total > r.solved
                  ? 'Bekijk samen de vragen die nog lastig waren.'
                  : 'Alle vragen zijn opgelost. Bekijk hieronder hoe het ging.'}
              </p>
            </div>
            <dl className={styles.resultCounts}>
              <div>
                <dt>Goed in één keer</dt>
                <dd>
                  {r.first} / {r.total}
                </dd>
              </div>
              <div>
                <dt>Goed bij tweede poging</dt>
                <dd>
                  {r.second} / {r.total}
                </dd>
              </div>
              <div>
                <dt>Opgeloste vragen</dt>
                <dd>
                  {r.solved} / {r.total}
                </dd>
              </div>
            </dl>
            <details className={styles.details}>
              <summary>Hoe is het cijfer berekend?</summary>
              <p>
                Eerste poging goed: 1 punt. Tweede poging goed: 0,5 punt. Na
                twee pogingen niet goed: 0 punten. Het totaal wordt omgerekend
                naar 10, onafhankelijk van het aantal vragen. Het kind ziet
                hetzelfde cijfer.
              </p>
            </details>
          </>
        ) : (
          <GuardianFeedback tone="info" title="Nog geen eindresultaat">
            <p>
              {r.answered} van {r.total} vragen beantwoord in de eerste ronde.{' '}
              {r.pendingRetries} tweede pogingen staan nog open. De leerling kan
              verder in zijn eigen portaal. Niet-ingediende antwoorden en
              verborgen oplossingen staan hier niet.
            </p>
          </GuardianFeedback>
        )}
      </GuardianPanel>
      <div className={task.readingText ? styles.equalGrid : styles.grid}>
        {task.readingText && (
          <GuardianPanel title="Volledige leestekst" icon={BookOpen}>
            <article
              className={styles.passage}
              aria-label={task.readingText.title}
            >
              <h3>{task.readingText.title}</h3>
              {task.readingText.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </article>
          </GuardianPanel>
        )}
        <GuardianPanel title="Vragen en pogingen">
          <p className={styles.muted}>
            In de oorspronkelijke vraagvolgorde. Open een vraag voor de
            ingediende antwoorden en beschikbare uitleg.
          </p>
          <ol className={styles.questions}>
            {r.questions.map((q) => (
              <li key={q.index}>
                <details>
                  <summary>
                    <span className={styles.questionNumber}>{q.index + 1}</span>
                    <span>Vraag {q.index + 1}</span>
                    <GuardianStatus
                      tone={
                        q.outcome === 'missed'
                          ? 'warning'
                          : ['first', 'second'].includes(q.outcome)
                            ? 'positive'
                            : 'neutral'
                      }
                    >
                      {outcomeLabels[q.outcome]}
                    </GuardianStatus>
                    <ChevronRight size={17} aria-hidden="true" />
                  </summary>
                  <div className={styles.questionBody}>
                    <div className={styles.questionPrompt}>
                      <h3>{q.prompt}</h3>
                      {q.options && (
                        <ul className={styles.questionOptions}>
                          {q.options.map((o) => (
                            <li key={o.value}>{o.label}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {q.attempts.length ? (
                      <dl
                        className={styles.answerAttempts}
                        aria-label="Ingediende antwoorden"
                      >
                        {q.attempts.map((attempt, i) => (
                          <div key={i} className={styles.answerAttempt}>
                            <dt>
                              {attempt.retry
                                ? 'Tweede poging'
                                : 'Eerste poging'}{' '}
                              · {attempt.correct ? 'Goed' : 'Niet goed'}
                            </dt>
                            <dd>{attempt.label}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className={styles.unanswered}>
                        Nog geen ingediend antwoord.
                      </p>
                    )}
                    {q.answerModel && (
                      <div className={styles.answerModel}>
                        <strong>Antwoord: {q.answerModel.answer}</strong>
                        <ol aria-label="Uitleg bij het antwoord">
                          {q.answerModel.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </GuardianPanel>
        {!task.readingText && (
          <div className={styles.stack}>
            <GuardianPanel title="Samen terugkijken" icon={CircleHelp}>
              <p>
                {r.complete
                  ? 'Kijk naar de vraag en beide pogingen. Bespreek welke stap hielp en wat nog lastig was.'
                  : 'Laat de leerling eerst verder oefenen. De tweede poging hoort bij de sessie.'}
              </p>
              <p className={styles.muted}>
                Een fout antwoord zegt op zichzelf niets over inzet of
                beheersing. Je hoeft een sessie niet opnieuw te beoordelen om de
                antwoorden te zien.
              </p>
            </GuardianPanel>
            {r.complete && detailAction}
          </div>
        )}
      </div>
      {task.readingText && r.complete && detailAction}
    </div>
  );
}
