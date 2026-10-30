'use client';
import { categoryAssessment } from './path-assessment';
import {
  decisionLabels,
  facetLabels,
  retentionDecision,
} from '../assessment/assessment-policy';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/button/button';
import {
  GuardianNavigation,
  destinations,
  type GuardianDestination,
} from '../../../components/guardian-navigation/guardian-navigation';
import {
  categories,
  purposeLabels,
  routes,
  subjects,
  uncoveredCatalogue,
  type Subject,
} from './path-content';
import { dayLabel, evidence, taskTitle, type PathState } from './path-model';
import { guardianResult } from '../guardian-results/guardian-result-model';
import { pathExercise } from './path-exercise';
import styles from './path-preview.module.css';

export function PathGuardian({
  state,
  onHold,
}: {
  state: PathState;
  onHold?: (subject: Subject, held: boolean) => void;
}) {
  const [destination, setDestination] =
    useState<GuardianDestination>('planning');
  const heading = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  useEffect(() => {
    if (navigated.current) heading.current?.focus();
  }, [destination]);
  const available = ['overview', 'planning', 'progress'].includes(destination);
  const visibleTasks =
    destination === 'progress'
      ? state.tasks
      : state.days[state.day]!.map((id) =>
          state.tasks.find((t) => t.id === id)!,
        );
  return (
    <div className={styles.guardian}>
      <GuardianNavigation
        current={destination}
        label="Leerroutepreview"
        mobileNavigation="bottom"
        hrefFor={(id) => `#leerroute-${id}`}
        onNavigate={(id) => {
          navigated.current = true;
          setDestination(id);
        }}
      >
        <div className={styles.page}>
          <p className={styles.eyebrow}>
            Fictieve leerroute · wijzigingen gelden alleen in deze preview
          </p>
          <h1 ref={heading} tabIndex={-1}>
            {available
              ? destination === 'progress'
                ? 'Bewijs en voortgang'
                : 'Automatisch klaar voor vandaag'
              : destinations.find((d) => d.id === destination)?.label}
          </h1>
          {!available ? (
            <>
              <p>Dit onderdeel valt buiten de leerroutepreview.</p>
              <Button
                variant="outline"
                onClick={() => setDestination('planning')}
              >
                Terug naar de leerroute
              </Button>
            </>
          ) : (
            <>
              <p>
                {dayLabel(state.day)} · één blok · maximaal vier taken,
                inclusief dagelijkse Redactiesommen en hoogstens één retentie-
                of bijoefentaak.
              </p>
              <div className={styles.notice}>
                <strong>
                  Demonstratieregels, geen meting van Adams niveau
                </strong>
                <p>
                  Per verplicht doel verzamelen we bewijs van uitvoeren, begrip
                  en toepassing. Herhaalde sjablonen tellen samen als één
                  observatie. Alleen keuzevragen, hulp of herkansingen zijn
                  onvoldoende. Een goede taakscore is geen bewijs van
                  beheersing.
                </p>
                <p>
                  Verdergaan is voorlopig: een uitgestelde check blijft nodig.
                  Bij ontbrekend bewijs volgt een gerichte check; bij fouten
                  gericht oefenen. De Taal-bank mist nog passende begrips- en
                  toepassingsvragen. De route wacht dan op inhoud. Deze
                  demonstratieregels en vragen zijn niet onderwijskundig
                  gevalideerd.
                </p>
              </div>
              <h2>Een eigen route per vak</h2>
              <p>
                Pauzeren en hervatten gelden vanaf de volgende previewdag.
                Bestaande taken blijven bewaard. Een ouderkeuze geldt nooit als
                bewijs van beheersing.
              </p>
              {state.overrides.length > 0 && (
                <details>
                  <summary>Ouderkeuzes in deze preview</summary>
                  <ul>
                    {state.overrides.map((o, i) => (
                      <li key={i}>
                        {dayLabel(o.day)} · {subjects[o.subject]} ·{' '}
                        {o.held ? 'gepauzeerd' : 'hervat'} · {o.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <div className={styles.routes}>
                {(['rekenen', 'taal'] as const).map((subject) => {
                  const route = state.routes[subject];
                  return (
                    <section
                      key={subject}
                      aria-label={`${subjects[subject]} leerroute`}
                    >
                      <h3>{subjects[subject]}</h3>
                      {onHold && (
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => onHold(subject, !state.holds[subject])}
                        >
                          {state.holds[subject]
                            ? `Hervat ${subjects[subject]}-route`
                            : `Pauzeer ${subjects[subject]}-route`}
                        </Button>
                      )}
                      {state.holds[subject] && (
                        <p>
                          Gepauzeerd vanaf de volgende previewdag. Dit verandert
                          het bewijs niet.
                        </p>
                      )}
                      <ol>
                        {routes[subject].map((category, index) => (
                          <li
                            key={category}
                            data-current={index === route.index}
                          >
                            <strong>{categories[category].label}</strong>
                            <span>
                              {index < route.index
                                ? 'Voorlopig verder · retentie blijft nodig'
                                : index > route.index
                                  ? 'Nog niet beoordeeld'
                                  : route.next === 'support'
                                    ? 'Passende uitleg nodig · route wacht'
                                    : purposeLabels[route.next]}
                            </span>
                            <small>{categories[category].level}</small>
                            <p>
                              {
                                decisionLabels[
                                  categoryAssessment(state, category).decision
                                ]
                              }{' '}
                              ·{' '}
                              {
                                categoryAssessment(state, category).coverage
                                  .demonstrated
                              }
                              /
                              {
                                categoryAssessment(state, category).coverage
                                  .required
                              }{' '}
                              voorbeeldvaardigheden met voldoende bewijs.
                            </p>
                            <small>
                              {categories[category].objectives.join(' · ')}
                            </small>
                          </li>
                        ))}
                      </ol>
                      {route.index === routes[subject].length && (
                        <p>
                          Einde van deze voorbeeldroute. Volgende categorieën
                          zijn nog niet beoordeeld.
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>
              {state.retention.length > 0 && (
                <>
                  <h2>Eerder voorlopig aangetoonde doelen</h2>
                  <ul className={styles.retention}>
                    {state.retention.map((item) => (
                      <li key={item.category}>
                        <strong>
                          {subjects[item.subject]} ·{' '}
                          {categories[item.category].label}
                        </strong>
                        <span>
                          {
                            decisionLabels[
                              retentionDecision(
                                item.due,
                                item.gaps.length > 0,
                                state.day,
                              )
                            ]
                          }
                          .{' '}
                          {item.next === 'support'
                            ? 'Extra uitleg nodig; hoofdroute blijft staan.'
                            : `${item.next === 'repair' ? 'Bijoefenen' : 'Retentiecheck'} vanaf ${dayLabel(item.due)}. Bij samenloop komt de oudste eerst.`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {state.notices.map((notice) => (
                <p className={styles.notice} key={notice}>
                  {notice}
                </p>
              ))}
              <h2>
                {destination === 'progress'
                  ? 'Alle uitgegeven taken en bewijs'
                  : 'Waarom deze taken?'}
              </h2>
              <ul className={styles.assignments}>
                {visibleTasks.map((task) => {
                  const result = guardianResult(
                    pathExercise(task),
                    task.started ? task.snapshot : undefined,
                  );
                  return (
                    <li key={task.id}>
                      <h3>{taskTitle(task)}</h3>
                      <p>{task.reason}</p>
                      <p className={styles.meta}>
                        {task.questions.length} vragen · {result.status} ·
                        uitgegeven {dayLabel(task.issuedDay)}
                        {task.issuedDay < state.day && !result.complete
                          ? ' · meegenomen zonder opnieuw te beginnen'
                          : ''}
                      </p>
                      <details>
                        <summary>
                          Bekijk bewijs en ingediende antwoorden
                        </summary>
                        <p>
                          {result.first} goed in één keer · {result.second} goed
                          bij tweede poging · {result.solved} opgelost van{' '}
                          {result.total}.{' '}
                          {result.complete
                            ? `Taakscore ${result.score?.toLocaleString('nl-NL')} / ${result.total}.`
                            : 'Nog geen eindscore.'}
                        </p>
                        {task.category !== 'redactiesommen' && (
                          <ul>
                            {evidence(state, task).map((item) => (
                              <li key={item.objective}>
                                {
                                  categories[
                                    task.category as keyof typeof categories
                                  ].objectives[item.objective]
                                }
                                : {item.correct} bruikbare observaties uit{' '}
                                {item.families} families.{' '}
                                {decisionLabels[item.decision]}.
                                {item.missing.length > 0 &&
                                  ` Nog nodig: ${item.missing.map((f) => facetLabels[f]).join(', ')}.`}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p>
                          Het besluit bij afronden gebruikt ook eerder geschikt
                          bewijs. Hieronder staan alleen antwoorden uit deze
                          taak. Tweede pogingen tellen mee als opgeloste vragen,
                          maar niet als onafhankelijk bewijs. De gewogen
                          taakscore bepaalt de route niet.
                        </p>
                        <ol>
                          {result.questions.map((question) => (
                            <li key={question.index}>
                              <p>{question.prompt}</p>
                              {question.attempts.length ? (
                                question.attempts.map((attempt) => (
                                  <p key={String(attempt.retry)}>
                                    {attempt.retry
                                      ? 'Tweede poging'
                                      : 'Eerste poging'}
                                    : {attempt.label} ·{' '}
                                    {attempt.correct ? 'goed' : 'niet goed'}
                                  </p>
                                ))
                              ) : (
                                <p>Nog niet beantwoord</p>
                              )}
                              {question.answerModel && (
                                <p>
                                  Antwoordmodel: {question.answerModel.answer}
                                </p>
                              )}
                            </li>
                          ))}
                        </ol>
                      </details>
                    </li>
                  );
                })}
              </ul>
              <details className={styles.coverage}>
                <summary>Dekking en grenzen van dit voorbeeld</summary>
                <p>
                  Vier productvakken: Rekenen, Taal, Spelling en Begrijpend
                  Lezen. Redactiesommen is een categorie binnen Rekenen, elke
                  kalenderdag beschikbaar, ook in het weekend. Totdat Optellen
                  voorlopig voldoende is aangetoond, gebruiken de verhalen
                  alleen getalvergelijking; daarna ook optellen.
                </p>
                <p>
                  Alleen Getalbegrip → Optellen en Woordenschat → Woordsoorten
                  hebben hier oefeninhoud. Overige categorieën, inclusief
                  Verbanden/tabellen/grafieken, Spelling en Begrijpend Lezen:
                  niet beoordeeld en niet automatisch overgeslagen. De bestaande
                  leespreview behoudt zijn volledige tekst/vraagbundel.
                </p>
                <ul>
                  {Object.entries(uncoveredCatalogue).map(
                    ([subject, names]) => (
                      <li key={subject}>
                        <strong>{subject} · niet beoordeeld:</strong>{' '}
                        {names.join(' · ')}.
                      </li>
                    ),
                  )}
                </ul>
                <p>
                  De zeven previewdagen en taaklimiet zijn een demonstratie,
                  geen aanbevolen dagbelasting. Twee voorbeeldvaardigheden zijn
                  geen volledige curriculumdekking. Startchecks hebben vier
                  vragen, vervolgchecks hoogstens vier, oefenen tien, retentie
                  twee, bijoefenen vier. De bestaande twee pogingen en uitleg na
                  een tweede fout blijven gelden. Er is geen live AI, opgeslagen
                  voortgang of productieplanner.
                </p>
              </details>
            </>
          )}
        </div>
      </GuardianNavigation>
    </div>
  );
}
