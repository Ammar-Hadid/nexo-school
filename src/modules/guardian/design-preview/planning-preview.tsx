'use client';

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Info,
  ListChecks,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/button/button';
import {
  GuardianFeedback,
  GuardianPanel,
  GuardianStatus,
} from '@/components/guardian-ui/guardian-ui';
import {
  SubjectIcon,
  type GuardianSubject,
} from '@/components/guardian-ui/subject-icon';
import {
  initialWeek,
  planDescription,
  subjects,
  taskCount,
  weekdays,
  type DayPlan,
} from './preview-data';
import styles from '../guardian-workspace.module.css';
import local from './planning-settings.module.css';

const subjectKeys: GuardianSubject[] = ['rekenen', 'taal', 'spelling', 'lezen'];
const startDate = '2026-11-02';
type Scope = 'weekly' | 'date';
type Receipt = {
  text: string;
  week: DayPlan[];
  exception?: DayPlan;
  dates: string[];
};

/** A local planning specimen. It does not issue work or change a saved schedule. */
export function PlanningPreview({
  failFirstSave = false,
  ref,
}: {
  failFirstSave?: boolean;
  ref?: Ref<{ openToday: () => void }>;
}) {
  const [week, setWeek] = useState(initialWeek);
  const [exception, setException] = useState<DayPlan>();
  const [dates, setDates] = useState(weekdays.map(() => startDate));
  const [day, setDay] = useState(1);
  const [scope, setScope] = useState<Scope>('weekly');
  const [draft, setDraft] = useState<DayPlan>(initialWeek[1]!);
  const [effective, setEffective] = useState(startDate);
  const [review, setReview] = useState(false);
  const [error, setError] = useState(false);
  const [receipt, setReceipt] = useState<Receipt>();
  const [message, setMessage] = useState('');
  const failed = useRef(false);
  const confirmation = useRef<HTMLDivElement>(null);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const previous =
    scope === 'date' ? (exception ?? initialWeek[1]!) : week[day]!;
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(previous) ||
    (scope === 'weekly' && effective !== dates[day]);
  const chosenCount = draft.counts.reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    if (review) confirmation.current?.focus();
  }, [review]);
  function choose(next: Scope, nextDay = day) {
    setScope(next);
    setDay(nextDay);
    setDraft(next === 'date' ? (exception ?? initialWeek[1]!) : week[nextDay]!);
    setEffective(dates[nextDay]!);
    setReview(false);
    setError(false);
  }
  useImperativeHandle(ref, () => ({
    openToday() {
      if (!dirty && !review) choose('date');
    },
  }));
  function save() {
    if (failFirstSave && !failed.current) {
      failed.current = true;
      setError(true);
      return;
    }
    setReceipt({
      week,
      exception,
      dates,
      text:
        scope === 'date'
          ? `Alleen dinsdag 27 oktober gewijzigd: ${planDescription(draft)}. Volgende dinsdag volgt je vaste weekritme.`
          : `Elke ${weekdays[day]!.toLowerCase()} gewijzigd vanaf ${effective}: ${planDescription(draft)}. Vandaag blijft hetzelfde.`,
    });
    if (scope === 'date') setException(draft);
    else {
      setWeek(week.map((value, index) => (index === day ? draft : value)));
      setDates(
        dates.map((value, index) => (index === day ? effective : value)),
      );
    }
    setReview(false);
    setError(false);
    setMessage('');
    requestAnimationFrame(() => reviewButton.current?.focus());
  }
  function undo() {
    if (!receipt) return;
    setWeek(receipt.week);
    setException(receipt.exception);
    setDates(receipt.dates);
    setDraft(
      scope === 'date'
        ? (receipt.exception ?? initialWeek[1]!)
        : receipt.week[day]!,
    );
    setEffective(receipt.dates[day]!);
    setReceipt(undefined);
    setMessage(
      'Wijziging teruggezet. Je vorige planning geldt weer in dit voorbeeld. Je kunt verder plannen.',
    );
  }
  return (
    <div className={styles.stack}>
      <div className={styles.notice}>
        <Info size={18} aria-hidden="true" />
        <p>
          Vooruitblik: je probeert hier een weekritme uit. Automatisch sessies
          klaarzetten en gamepassen zijn nog niet aangesloten.
        </p>
      </div>
      {receipt && (
        <GuardianFeedback
          title="Opgeslagen in dit voorbeeld"
          undo={{
            label: 'Laatste wijziging terugzetten',
            onClick: undo,
            disabled: dirty || review,
          }}
        >
          <p>{receipt.text}</p>
          <p>
            Terugzetten kan zolang er geen sessies uit zijn klaargezet. Hier is
            dat nog niet gebeurd. Bekijk hieronder je nieuwe ritme.
          </p>
        </GuardianFeedback>
      )}
      {message && <GuardianFeedback title={message} />}
      <GuardianPanel
        title="Jouw weekritme"
        icon={CalendarDays}
        action={<GuardianStatus>Dagelijks Redactiesommen</GuardianStatus>}
      >
        <fieldset className={styles.scope} disabled={review || dirty}>
          <legend className={local.srOnly}>Wat wil je wijzigen?</legend>
          <label>
            <input
              type="radio"
              name={`${id}-scope`}
              checked={scope === 'weekly'}
              onChange={() => choose('weekly')}
            />
            Het vaste weekritme
          </label>
          <label>
            <input
              type="radio"
              name={`${id}-scope`}
              checked={scope === 'date'}
              onChange={() => choose('date')}
            />
            Alleen vandaag · dinsdag 27 oktober
          </label>
        </fieldset>
        {scope === 'weekly' ? (
          <div className={styles.week} aria-label="Weekdagen">
            {weekdays.map((label, index) => (
              <button
                className={styles.day}
                key={label}
                type="button"
                aria-pressed={day === index}
                disabled={review || dirty}
                onClick={() => choose('weekly', index)}
              >
                <strong>
                  <span className={local.fullDay}>{label}</span>
                  <span className={local.shortDay}>{label.slice(0, 2)}</span>
                </strong>
                <span className={styles.dayDot} aria-hidden="true" />
                <small>{taskCount(week[index]!)} sessies</small>
                <span className={local.shortDay}>
                  <span className={local.srOnly}>{label}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className={local.datedScope}>
            <CalendarDays size={24} aria-hidden="true" />
            <div>
              <strong>Dinsdag 27 oktober 2026</strong>
              <p>
                Een eenmalige aanpassing. Je vaste dinsdagen houden hun eigen
                ritme.
              </p>
            </div>
          </div>
        )}
        {dirty && !review && (
          <p className={styles.muted}>
            Je hebt een niet-opgeslagen wijziging. Bekijk de wijziging of
            annuleer eerst voordat je een andere dag kiest. Je concept blijft
            staan als je een ander onderdeel opent.
          </p>
        )}
      </GuardianPanel>
      <div className={styles.grid}>
        <GuardianPanel
          title={
            scope === 'date'
              ? 'Alleen dinsdag 27 oktober'
              : `Elke ${weekdays[day]!.toLowerCase()}`
          }
          icon={ListChecks}
          action={
            <GuardianStatus tone={dirty ? 'warning' : 'neutral'}>
              {dirty ? 'Concept' : 'Huidig ritme'}
            </GuardianStatus>
          }
        >
          {!review ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setReview(true);
                setMessage('');
              }}
            >
              <p className={styles.muted}>
                Kies het aantal sessies per vak. Een leessessie bevat één
                complete tekst met de bijbehorende vragen.
              </p>
              <div className={styles.planRows}>
                {subjects.map((subject, index) => (
                  <div className={styles.planRow} key={subject}>
                    <SubjectIcon subject={subjectKeys[index]!} />
                    <label htmlFor={`${id}-subject-${index}`}>{subject}</label>
                    <input
                      id={`${id}-subject-${index}`}
                      aria-label={`${subject} · sessies`}
                      type="number"
                      min={0}
                      max={8}
                      required
                      value={draft.counts[index]}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          counts: draft.counts.map((count, i) =>
                            i === index ? Number(event.target.value) : count,
                          ),
                        })
                      }
                    />
                    <small>sessies</small>
                  </div>
                ))}
              </div>
              <div className={local.dailyTask}>
                <SubjectIcon subject="rekenen" size="small" />
                <div>
                  <strong>Rekenen · Redactiesommen</strong>
                  <p>1 sessie per dag, ook in het weekend.</p>
                </div>
                <Check size={18} aria-label="Vast onderdeel" />
              </div>
              <div className={local.formGrid}>
                <label className={styles.field} htmlFor={`${id}-minutes`}>
                  Minuten per gamepas
                  <input
                    id={`${id}-minutes`}
                    type="number"
                    min={5}
                    max={60}
                    required
                    value={draft.minutes}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        minutes: Number(event.target.value),
                      })
                    }
                  />
                  <span className={styles.muted}>
                    Voorbeeldwaarde; er wordt hier geen pas verdiend.
                  </span>
                </label>
                {scope === 'weekly' && (
                  <label className={styles.field} htmlFor={`${id}-effective`}>
                    Laten ingaan op
                    <input
                      id={`${id}-effective`}
                      type="date"
                      min="2026-10-28"
                      required
                      value={effective}
                      onChange={(event) => setEffective(event.target.value)}
                    />
                    <span className={styles.muted}>
                      Bestaande sessies blijven behouden.
                    </span>
                  </label>
                )}
              </div>
              <div className={styles.actions}>
                <Button
                  ref={reviewButton}
                  type="submit"
                  endIcon={<ArrowRight size={17} />}
                >
                  Wijziging bekijken
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDraft(previous);
                    setEffective(dates[day]!);
                    setError(false);
                    setMessage(
                      'Concept geannuleerd. Je opgeslagen voorbeeldplanning is niet gewijzigd. Je kunt een andere dag kiezen.',
                    );
                  }}
                >
                  Concept annuleren
                </Button>
              </div>
            </form>
          ) : (
            <div ref={confirmation} tabIndex={-1} className={local.review}>
              <h3>Controleer wat er verandert</h3>
              <div className={local.comparison}>
                <div>
                  <span>Nu</span>
                  <strong>{taskCount(previous)} sessies</strong>
                  <small>{previous.minutes} minuten per gamepas</small>
                </div>
                <ArrowRight size={21} aria-hidden="true" />
                <div>
                  <span>Na opslaan</span>
                  <strong>{taskCount(draft)} sessies</strong>
                  <small>{draft.minutes} minuten per gamepas</small>
                </div>
              </div>
              <ul className={local.changes}>
                {subjects.map(
                  (subject, index) =>
                    previous.counts[index] !== draft.counts[index] && (
                      <li key={subject}>
                        <SubjectIcon
                          subject={subjectKeys[index]!}
                          size="small"
                        />
                        <span>{subject}</span>
                        <strong>
                          {previous.counts[index]} → {draft.counts[index]}{' '}
                          sessies
                        </strong>
                      </li>
                    ),
                )}
              </ul>
              <p>
                {scope === 'date'
                  ? 'Alleen 27 oktober. Het vaste weekritme en volgende dinsdag veranderen niet.'
                  : `Vanaf ${effective}, elke ${weekdays[day]!.toLowerCase()}. Bestaande sessies van vandaag veranderen niet.`}
              </p>
              <div className={styles.notice}>
                <Info size={18} aria-hidden="true" />
                <p>
                  Begonnen en afgeronde sessies en antwoorden blijven bewaard.
                  Terugzetten kan vóórdat nieuwe sessies zijn klaargezet. Daarna
                  pas je toekomstige planning aan; uitgegeven sessies worden
                  niet gewist.
                </p>
              </div>
              {error && (
                <GuardianFeedback tone="negative" title="Niet opgeslagen">
                  <p>
                    Je concept is bewaard. Probeer opnieuw; je vorige planning
                    geldt nog.
                  </p>
                </GuardianFeedback>
              )}
              <div className={styles.actions}>
                <Button onClick={save}>
                  {error ? 'Opnieuw opslaan' : 'Wijziging opslaan'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReview(false);
                    requestAnimationFrame(() => reviewButton.current?.focus());
                  }}
                >
                  Terug naar bewerken
                </Button>
              </div>
            </div>
          )}
        </GuardianPanel>
        <div className={styles.stack}>
          <GuardianPanel title="Zo ziet de dag eruit" icon={Clock3}>
            <p className={local.daySummary}>
              <strong>{taskCount(draft)}</strong> sessies{' '}
              <span>in {chosenCount ? '2 blokken' : '1 blok'}</span>
            </p>
            <ol className={local.blocks}>
              {chosenCount > 0 && (
                <li>
                  <span className={local.blockNumber}>1</span>
                  <div>
                    <h3>Na school</h3>
                    <p>
                      {chosenCount} {chosenCount === 1 ? 'sessie' : 'sessies'}{' '}
                      uit je gekozen vakken
                    </p>
                    <div className={local.subjectDots}>
                      {draft.counts.map(
                        (count, index) =>
                          count > 0 && (
                            <span
                              key={subjects[index]}
                              title={`${subjects[index]}: ${count}`}
                            >
                              <SubjectIcon
                                subject={subjectKeys[index]!}
                                size="small"
                              />
                            </span>
                          ),
                      )}
                    </div>
                  </div>
                </li>
              )}
              <li>
                <span className={local.blockNumber}>{chosenCount ? 2 : 1}</span>
                <div>
                  <h3>Rekenen · Redactiesommen</h3>
                  <p>Eén sessie met een doorlopende verhaalsom.</p>
                </div>
              </li>
            </ol>
            <p className={styles.muted}>
              Adam kiest de volgorde binnen zijn huidige blok. Niet-afgerond
              werk blijft bewaard; passende nieuwe sessies maken daar ruimte
              voor.
            </p>
          </GuardianPanel>
          <GuardianPanel title="Ruimte voor een andere dag" icon={RotateCcw}>
            <p className={styles.muted}>
              Minder tijd vandaag? Kies bovenaan ‘Alleen vandaag’. Zo verander
              je één dag en blijft je vaste weekritme intact.
            </p>
            <details className={styles.details}>
              <summary>Wat gebeurt er met bestaand werk?</summary>
              <p>
                Deze planning is een voorbeeld. Bij aansluiting blijft begonnen
                werk behouden. Past open werk niet binnen de beschikbare ruimte,
                dan moet het apart zichtbaar blijven. De volledige planning,
                sessievolgorde en beschikbaarheidscontrole horen bij de volgende
                functionele stap.
              </p>
            </details>
          </GuardianPanel>
        </div>
      </div>
    </div>
  );
}
