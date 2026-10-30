'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/button/button';
import {
  GuardianNavigation,
  destinations,
  type GuardianDestination,
} from '../../../components/guardian-navigation/guardian-navigation';
import type { GuardianResultTask } from './guardian-result-contract';
import styles from './guardian-results.module.css';
import { guardianHref } from '@/modules/identity/portal/guardian-links';
import { scoreOutOfTen } from '../exercise/score-display';
import { PracticeFlow } from '@/modules/content/practice-flow';
import { GuardianResultsWorkspace } from '@/modules/guardian/results/guardian-results-workspace';

const outcomeLabels = {
  open: 'Nog niet beantwoord',
  queued: 'Tweede poging volgt',
  first: 'Goed in één keer',
  second: 'Goed bij tweede poging',
  missed: 'Na twee pogingen niet goed',
};

export function GuardianResultsView(props: {
  tasks: readonly GuardianResultTask[];
  saved?: boolean;
  initialDestination?: GuardianDestination;
  initialTask?: string;
}) {
  if (props.saved)
    return (
      <GuardianResultsWorkspace
        key={`${props.initialDestination ?? 'results'}:${props.initialTask ?? ''}`}
        tasks={props.tasks}
        progress={props.initialDestination === 'progress'}
        initialTask={props.initialTask}
      />
    );
  return <ClassicGuardianResultsView {...props} />;
}
function ClassicGuardianResultsView({
  tasks,
  saved = false,
  initialDestination = 'progress',
}: {
  tasks: readonly GuardianResultTask[];
  saved?: boolean;
  initialDestination?: GuardianDestination;
}) {
  const [destination, setDestination] =
    useState<GuardianDestination>(initialDestination);
  const [selected, setSelected] = useState<string>();
  const heading = useRef<HTMLHeadingElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const returnTo = useRef<string | undefined>(undefined);
  const interacted = useRef(false);
  const task = tasks.find((item) => item.id === selected);
  const result = task?.result;
  const available = destination === 'progress' || destination === 'overview';
  useEffect(() => {
    if (!interacted.current) return;
    if (!selected && returnTo.current) {
      list.current
        ?.querySelector<HTMLButtonElement>(`[data-task="${returnTo.current}"]`)
        ?.focus();
      returnTo.current = undefined;
    } else heading.current?.focus();
  }, [selected, destination]);
  return (
    <div className={styles.guardian} data-saved={saved || undefined}>
      <GuardianNavigation
        current={destination}
        mainContent={saved}
        accountLabel={saved ? 'Ouder' : undefined}
        contextNote={
          saved ? 'Je bekijkt opgeslagen taakresultaten.' : undefined
        }
        mobileNavigation="bottom"
        label={saved ? 'Opgeslagen taakresultaten' : 'Taakresultatenpreview'}
        hrefFor={(id) => (saved ? guardianHref(id) : `#guardian-${id}`)}
        onNavigate={(id) => {
          if (
            saved &&
            (id === 'overview' || id === 'settings' || id === 'admin')
          ) {
            window.location.assign(guardianHref(id));
            return;
          }
          interacted.current = true;
          returnTo.current = undefined;
          setSelected(undefined);
          setDestination(id);
        }}
      >
        <div className={styles.page}>
          {!available ? (
            <>
              <p className={styles.eyebrow}>
                {saved ? 'Nog niet beschikbaar' : 'Ontwerpvoorbeeld'}
              </p>
              <h1 ref={heading} tabIndex={-1}>
                {destinations.find((item) => item.id === destination)?.label}
              </h1>
              <p>
                {saved
                  ? 'Dit onderdeel is nog niet beschikbaar. Je kunt hier de opgeslagen taakresultaten bekijken.'
                  : 'Dit onderdeel valt buiten deze preview. Je kunt hier alleen de tijdelijke taakresultaten bekijken.'}
              </p>
              <Button
                variant="outline"
                onClick={() => setDestination('progress')}
              >
                Terug naar taakresultaten
              </Button>
            </>
          ) : task && result ? (
            <>
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  returnTo.current = task.id;
                  setSelected(undefined);
                }}
              >
                ← Alle taakresultaten
              </Button>
              <p className={styles.eyebrow}>
                {saved
                  ? 'Opgeslagen oefentaken · maximaal 100 meest recente'
                  : 'Blok 1 · Na school'}
              </p>
              <h1 ref={heading} tabIndex={-1}>
                {task.title}
              </h1>
              <span className={styles.badge} data-complete={result.complete}>
                {result.status}
              </span>
              {task.corrections?.length ? (
                <div className={styles.notice} role="status">
                  <strong>Inhoud ingetrokken · resultaat niet gebruiken</strong>
                  <p>
                    Deze taak telt niet mee als leerbewijs. De oorspronkelijke
                    pogingen blijven hieronder zichtbaar; de score wordt niet
                    opnieuw berekend. Onvoltooid werk blijft gepauzeerd.
                  </p>
                  {task.corrections.map((c) => (
                    <div key={c.itemId}>
                      <p>{c.note}</p>
                      {c.correctionNote && (
                        <p>
                          Correctie: {c.correctionNote}. Een nieuwe versie
                          vervangt deze taak niet.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : result.complete ? (
                <>
                  <dl className={styles.metrics}>
                    <div>
                      <dt>Goed in één keer</dt>
                      <dd>
                        {result.first} / {result.total}
                      </dd>
                    </div>
                    <div>
                      <dt>Goed bij tweede poging</dt>
                      <dd>
                        {result.second} / {result.total}
                      </dd>
                    </div>
                    <div>
                      <dt>Opgeloste vragen</dt>
                      <dd>
                        {result.solved} / {result.total}
                      </dd>
                    </div>
                    <div>
                      <dt>Gewogen score</dt>
                      <dd>{scoreOutOfTen(result.score, result.total)} / 10</dd>
                    </div>
                  </dl>
                  <p className={styles.note}>
                    Eerste poging goed: 1 punt. Tweede poging goed: 0,5 punt. Na
                    twee pogingen niet goed: 0 punten. Het resultaat wordt
                    omgerekend naar een cijfer op 10, afgerond op één decimaal.
                    Het kind ziet hetzelfde cijfer en het aantal opgeloste
                    vragen.
                  </p>
                </>
              ) : (
                <div className={styles.notice}>
                  <strong>Nog geen eindresultaat</strong>
                  <p>
                    {result.answered} van {result.total} vragen beantwoord in de
                    eerste ronde. {result.pendingRetries} tweede{' '}
                    {result.pendingRetries === 1
                      ? 'poging staat'
                      : 'pogingen staan'}{' '}
                    nog open.
                  </p>
                  <p>
                    Alleen ingediende antwoorden staan hieronder. Een nog niet
                    ingediend antwoord blijft bij het kind.
                  </p>
                </div>
              )}
              {task.readingText && (
                <details className={styles.passage}>
                  <summary>
                    Volledige leestekst · {task.readingText.title}
                  </summary>
                  <article aria-label={task.readingText.title}>
                    <h2>{task.readingText.title}</h2>
                    {task.readingText.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </article>
                </details>
              )}
              <h2>Vragen en pogingen</h2>
              <p className={styles.note}>
                In de oorspronkelijke vraagvolgorde. Tweede pogingen kwamen na
                de eerste ronde.
              </p>
              <ol className={styles.questions}>
                {result.questions.map((question) => (
                  <li key={question.index}>
                    <details>
                      <summary>
                        <span>Vraag {question.index + 1}</span>
                        <span className={styles.questionStatus}>
                          {outcomeLabels[question.outcome]}
                        </span>
                      </summary>
                      <div className={styles.questionBody}>
                        <h3>{question.prompt}</h3>
                        {question.options && (
                          <ul className={styles.options}>
                            {question.options.map((option) => (
                              <li key={option.value}>{option.label}</li>
                            ))}
                          </ul>
                        )}
                        {question.attempts.length ? (
                          <dl className={styles.attempts}>
                            {question.attempts.map((attempt) => (
                              <div key={String(attempt.retry)}>
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
                          <p>Nog geen ingediend antwoord.</p>
                        )}
                        {question.answerModel && (
                          <div className={styles.answerModel}>
                            <h4>Antwoordmodel</h4>
                            <p>{question.answerModel.answer}</p>
                            <ol>
                              {question.answerModel.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <p className={styles.eyebrow}>
                {saved
                  ? 'Opgeslagen oefentaken · maximaal 100 meest recente'
                  : 'Blok 1 · Na school'}
              </p>
              <h1 ref={heading} tabIndex={-1}>
                {destination === 'overview'
                  ? 'Overzicht van de taken'
                  : 'Taakresultaten'}
              </h1>
              <p>
                {saved
                  ? 'Bekijk de ingediende antwoorden van de leerlingen die je mag begeleiden.'
                  : 'Bekijk de antwoorden en pogingen van Adam in dit oefenblok.'}
              </p>
              <div className={styles.notice}>
                <strong>
                  {tasks.filter((item) => item.result.complete).length} van{' '}
                  {tasks.length} taken afgerond
                </strong>
                <p>
                  {saved
                    ? 'Alleen bekijken. Opgeslagen synthetische antwoorden; geen uitspraak over beheersing.'
                    : 'Alleen bekijken. De resultaten komen uit dezelfde tijdelijke leerlingpreview.'}
                </p>
              </div>
              {saved && (
                <PracticeFlow
                  current={
                    tasks.some(
                      (t) => !t.result.complete && !t.corrections?.length,
                    )
                      ? 3
                      : 4
                  }
                  title={
                    !tasks.length
                      ? 'Nog geen taak om te bekijken'
                      : tasks.some(
                            (t) => !t.result.complete && !t.corrections?.length,
                          )
                        ? 'Ga verder in de leerlingbrowser'
                        : 'Bekijk de antwoorden hieronder'
                  }
                  action={{
                    label: !tasks.length
                      ? 'Naar je volgende stap'
                      : 'Terug naar het overzicht',
                    href: '/guardian',
                  }}
                >
                  <p>
                    {!tasks.length
                      ? 'Zet eerst een oefentaak klaar. Het overzicht helpt je naar de juiste stap.'
                      : tasks.some(
                            (t) => !t.result.complete && !t.corrections?.length,
                          )
                        ? 'Er is nog werk te doen. Open het leerlingportaal in de aparte leerlingbrowser; ingediende antwoorden verschijnen hier. Vernieuw deze pagina na het oefenen.'
                        : 'Open een taak om de antwoorden en pogingen terug te zien. Via het overzicht kun je opnieuw oefeningen klaarzetten.'}
                  </p>
                </PracticeFlow>
              )}
              {!saved && tasks.length === 0 && (
                <p>Er zijn nog geen opgeslagen taken om te bekijken.</p>
              )}
              <ul className={styles.taskList} ref={list}>
                {tasks.map((item) => {
                  const itemResult = item.result;
                  return (
                    <li key={item.id}>
                      <div>
                        <h2>{item.title}</h2>
                        <p>
                          {itemResult.total} vragen ·{' '}
                          <span
                            className={styles.badge}
                            data-complete={itemResult.complete}
                          >
                            {itemResult.status}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        data-task={item.id}
                        aria-label={`Bekijk taak: ${item.title}`}
                        onClick={() => {
                          interacted.current = true;
                          setSelected(item.id);
                        }}
                      >
                        Bekijk taak <span aria-hidden="true">→</span>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </GuardianNavigation>
    </div>
  );
}
