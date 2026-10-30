'use client';

import { useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Info,
  Search,
  ShieldCheck,
  Undo2,
  X,
} from 'lucide-react';
import { Button } from '@/components/button/button';
import {
  GuardianEmpty,
  GuardianFeedback,
  GuardianPanel,
  GuardianStatus,
  GuardianTextLink,
} from '@/components/guardian-ui/guardian-ui';
import {
  guardianSubjects,
  SubjectIcon,
  type GuardianSubject,
} from '@/components/guardian-ui/subject-icon';
import { contentPreviewCollections } from './content-preview-data';
import styles from '../guardian-workspace.module.css';
import material from './content-preview.module.css';

type MaterialState =
  'pending' | 'approved' | 'rejected' | 'published' | 'withdrawn';
type Decision = 'approve' | 'reject' | 'publish' | 'withdraw';
type ReviewRecord = { state: MaterialState; viewed: number[]; note: string };
const labels: Record<MaterialState, string> = {
  pending: 'Te beoordelen',
  approved: 'Goedgekeurd',
  rejected: 'Afgekeurd',
  published: 'Gepubliceerd',
  withdrawn: 'Ingetrokken',
};
const confirmationCopy: Record<
  Decision,
  { title: string; description: string; action: string }
> = {
  approve: {
    title: 'Deze set goedkeuren?',
    description:
      'Je keurt beide bekeken vragen goed in dit voorbeeld. Publiceren is een aparte stap. Tot die tijd kun je de goedkeuring terugnemen.',
    action: 'Goedkeuren',
  },
  reject: {
    title: 'Deze set afkeuren?',
    description:
      'De twee vragen blijven bewaard, maar worden niet beschikbaar voor oefensessies. Je kunt deze beslissing terugnemen en opnieuw beoordelen.',
    action: 'Afkeuren',
  },
  publish: {
    title: 'Beschikbaar maken voor oefensessies?',
    description:
      'Na publicatie mag deze voorbeeldset worden gebruikt voor nieuwe sessies. Er wordt nu nog geen sessie klaargezet. Publicatie kun je niet wissen; bij een fout trek je de inhoud in. Oorspronkelijke vragen en antwoorden blijven bewaard.',
    action: 'Publiceren',
  },
  withdraw: {
    title: 'Deze inhoud intrekken?',
    description:
      'Nieuwe sessies mogen deze inhoud niet meer gebruiken. Betrokken open sessies worden gepauzeerd en resultaten tellen niet meer mee als leerbewijs. De oorspronkelijke vragen en antwoorden blijven bewaard. Intrekken kun je niet ongedaan maken: een correctie krijgt een nieuwe versie en beoordeling.',
    action: 'Inhoud intrekken',
  },
};

export function ContentPreview({
  shortage = false,
  onPlanning,
}: {
  shortage?: boolean;
  onPlanning: () => void;
}) {
  const [records, setRecords] = useState<Record<string, ReviewRecord>>(() =>
    Object.fromEntries(
      contentPreviewCollections.map((collection, index) => [
        collection.id,
        { state: 'pending', viewed: index === 0 ? [0] : [], note: '' },
      ]),
    ),
  );
  const [selectedId, setSelectedId] = useState<string>(
    contentPreviewCollections[0]!.id,
  );
  const [subject, setSubject] = useState<GuardianSubject | 'all'>('all');
  const [status, setStatus] = useState<MaterialState | 'all'>('all');
  const [query, setQuery] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [tab, setTab] = useState<'preview' | 'checks' | 'notes'>('preview');
  const [decision, setDecision] = useState<Decision>();
  const [confirmed, setConfirmed] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    title: string;
    detail: string;
    reversible: boolean;
    id: string;
  }>();
  const [savedNote, setSavedNote] = useState('');
  const confirmation = useRef<HTMLDivElement>(null);
  const paneHeading = useRef<HTMLHeadingElement>(null);
  const selected = contentPreviewCollections.find(
    (item) => item.id === selectedId,
  )!;
  const record = records[selectedId]!;
  const note = noteDrafts[selectedId] ?? record.note;
  const question = selected.questions[questionIndex]!;
  const filtered = contentPreviewCollections.filter(
    (item) =>
      (subject === 'all' || item.subject === subject) &&
      (status === 'all' || records[item.id]!.state === status) &&
      `${item.title} ${item.category} ${guardianSubjects[item.subject].label}`
        .toLocaleLowerCase('nl')
        .includes(query.toLocaleLowerCase('nl').trim()),
  );
  const pending = Object.values(records).filter(
    (item) => item.state === 'pending',
  ).length;
  const allViewed = selected.questions.every((_, index) =>
    record.viewed.includes(index),
  );
  const tone =
    record.state === 'published' || record.state === 'approved'
      ? 'positive'
      : record.state === 'withdrawn' || record.state === 'rejected'
        ? 'negative'
        : 'neutral';

  function setNote(value: string) {
    setNoteDrafts((previous) => ({ ...previous, [selectedId]: value }));
  }

  function open(id: string) {
    if (decision) return;
    setSelectedId(id);
    setQuestionIndex(0);
    setTab('preview');
    setSavedNote('');
    setRecords((previous) => ({
      ...previous,
      [id]: {
        ...previous[id]!,
        viewed: Array.from(new Set([...previous[id]!.viewed, 0])),
      },
    }));
    requestAnimationFrame(() => paneHeading.current?.focus());
  }
  function moveQuestion(index: number) {
    setQuestionIndex(index);
    setRecords((previous) => ({
      ...previous,
      [selectedId]: {
        ...previous[selectedId]!,
        viewed: Array.from(new Set([...previous[selectedId]!.viewed, index])),
      },
    }));
  }
  function choose(next: Decision) {
    setDecision(next);
    setConfirmed(false);
    setMessage(undefined);
    requestAnimationFrame(() => confirmation.current?.focus());
  }
  function decide() {
    if (
      !decision ||
      !confirmed ||
      (decision === 'approve' && !allViewed) ||
      (decision === 'withdraw' && note.trim().length < 3)
    )
      return;
    const next: MaterialState =
      decision === 'approve'
        ? 'approved'
        : decision === 'reject'
          ? 'rejected'
          : decision === 'publish'
            ? 'published'
            : 'withdrawn';
    setRecords((previous) => ({
      ...previous,
      [selectedId]: { ...record, state: next, note },
    }));
    setMessage({
      id: selectedId,
      title: `${selected.title}: ${labels[next].toLocaleLowerCase('nl')} in dit voorbeeld`,
      detail:
        decision === 'approve'
          ? 'Nog niet gepubliceerd. Bekijk nu de publicatie of neem de goedkeuring terug.'
          : decision === 'reject'
            ? 'De vragen blijven bewaard. Bekijk een andere set of neem de beslissing terug.'
            : decision === 'publish'
              ? 'Er is nog geen sessie klaargezet. Ga naar de planning; bij een fout kun je deze inhoud intrekken.'
              : 'Oorspronkelijke antwoorden blijven bewaard. De volgende stap is een gecorrigeerde versie laten beoordelen.',
      reversible: decision === 'approve' || decision === 'reject',
    });
    setDecision(undefined);
  }
  function undo(id: string) {
    setRecords((previous) => ({
      ...previous,
      [id]: { ...previous[id]!, state: 'pending' },
    }));
    setMessage({
      id,
      title: 'Beslissing teruggenomen in dit voorbeeld',
      detail:
        'Deze set wacht weer op beoordeling. De vragen zijn niet gepubliceerd en blijven bewaard.',
      reversible: false,
    });
  }
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <p className={material.intro}>
          Bekijk het oefenmateriaal, controleer de uitleg en maak een set daarna
          apart beschikbaar.
        </p>
        <GuardianStatus>{pending} sets te beoordelen</GuardianStatus>
      </div>
      {shortage && (
        <GuardianFeedback
          tone="warning"
          title="Begrijpend Lezen · echte voorraad ontbreekt"
          next={
            <GuardianTextLink onClick={onPlanning}>
              Dagplanning bekijken
            </GuardianTextLink>
          }
        >
          <p>
            De leesset hieronder is een ontwerpvoorbeeld, geen beschikbare
            voorraad. Andere beschikbare sessies kunnen doorgaan; onbeoordeelde
            inhoud wordt niet automatisch toegevoegd.
          </p>
        </GuardianFeedback>
      )}
      {message && (
        <GuardianFeedback
          title={message.title}
          undo={
            message.reversible
              ? {
                  label: 'Beslissing terugnemen',
                  onClick: () => undo(message.id),
                }
              : undefined
          }
        >
          <p>{message.detail}</p>
        </GuardianFeedback>
      )}
      <div className={material.subjectFilters} aria-label="Filter op vak">
        <button
          type="button"
          aria-pressed={subject === 'all'}
          onClick={() => setSubject('all')}
          disabled={Boolean(decision)}
        >
          Alle vakken <span>{contentPreviewCollections.length}</span>
        </button>
        {(
          Object.entries(guardianSubjects) as [
            GuardianSubject,
            (typeof guardianSubjects)[GuardianSubject],
          ][]
        ).map(([id, item]) => (
          <button
            key={id}
            type="button"
            aria-pressed={subject === id}
            onClick={() => setSubject(id)}
            disabled={Boolean(decision)}
          >
            <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
            {item.label}
            <span>
              {contentPreviewCollections.filter((c) => c.subject === id).length}
            </span>
          </button>
        ))}
      </div>
      <div className={styles.workbench}>
        <section className={styles.queue} aria-label="Oefensets">
          <div className={styles.queueHeader}>
            <label className={styles.search}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                aria-label="Zoek in oefensets"
                placeholder="Zoek in oefeningen…"
                value={query}
                disabled={Boolean(decision)}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label className={material.statusFilter}>
              Status
              <select
                className={styles.select}
                aria-label="Filter op status"
                value={status}
                disabled={Boolean(decision)}
                onChange={(event) =>
                  setStatus(event.target.value as MaterialState | 'all')
                }
              >
                <option value="all">Alle statussen</option>
                {Object.entries(labels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {filtered.length ? (
            <ul>
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    className={styles.queueItem}
                    aria-pressed={item.id === selectedId}
                    disabled={Boolean(decision)}
                    onClick={() => open(item.id)}
                  >
                    <SubjectIcon subject={item.subject} />
                    <span>
                      <strong>{item.title}</strong>
                      <small>
                        {guardianSubjects[item.subject].label} · {item.category}
                      </small>
                      <span className={material.queueMeta}>
                        <FileText size={13} aria-hidden="true" />
                        {item.questions.length} vragen{' '}
                        <span>{labels[records[item.id]!.state]}</span>
                      </span>
                    </span>
                    <ChevronRight size={17} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <GuardianEmpty
              title="Geen sets gevonden"
              action={
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    setQuery('');
                    setSubject('all');
                    setStatus('all');
                  }}
                >
                  Filters wissen
                </Button>
              }
            >
              <p>Pas je zoekopdracht aan of toon alle vakken en statussen.</p>
            </GuardianEmpty>
          )}
          <p className={styles.queueFooter} role="status">
            {filtered.length} van {contentPreviewCollections.length}{' '}
            voorbeeldsets
          </p>
        </section>
        <GuardianPanel>
          <header className={material.materialHeading}>
            <SubjectIcon subject={selected.subject} size="large" />
            <div>
              <h2 ref={paneHeading} tabIndex={-1}>
                {selected.title}
              </h2>
              <p>
                {guardianSubjects[selected.subject].label} · {selected.category}
              </p>
            </div>
            <GuardianStatus tone={tone}>{labels[record.state]}</GuardianStatus>
          </header>
          <p className={material.viewed}>
            <FileText size={15} aria-hidden="true" />
            {selected.questions.length} vragen{' '}
            <span>
              <ClipboardCheck size={15} aria-hidden="true" />
              {record.viewed.length} van {selected.questions.length} bekeken
            </span>
          </p>
          <div
            className={styles.sectionTabs}
            aria-label="Onderdelen van de set"
          >
            <button
              aria-pressed={tab === 'preview'}
              onClick={() => setTab('preview')}
            >
              Voorbeeld
            </button>
            <button
              aria-pressed={tab === 'checks'}
              onClick={() => setTab('checks')}
            >
              Controles
            </button>
            <button
              aria-pressed={tab === 'notes'}
              onClick={() => setTab('notes')}
            >
              Notities
            </button>
          </div>
          {tab === 'preview' && (
            <>
              <div className={styles.row}>
                <label className={material.questionPicker}>
                  Vraag
                  <select
                    className={styles.select}
                    aria-label="Vraag bekijken"
                    value={questionIndex}
                    disabled={Boolean(decision)}
                    onChange={(event) =>
                      moveQuestion(Number(event.target.value))
                    }
                  >
                    {selected.questions.map((_, index) => (
                      <option key={index} value={index}>
                        Vraag {index + 1} van {selected.questions.length}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles.actions}>
                  <Button
                    variant="outline"
                    size="small"
                    iconOnly
                    aria-label="Vorige vraag"
                    disabled={questionIndex === 0 || Boolean(decision)}
                    onClick={() => moveQuestion(questionIndex - 1)}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    iconOnly
                    aria-label="Volgende vraag"
                    disabled={
                      questionIndex === selected.questions.length - 1 ||
                      Boolean(decision)
                    }
                    onClick={() => moveQuestion(questionIndex + 1)}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
              <div className={styles.reviewQuestion}>
                <div className={styles.row}>
                  <GuardianStatus>
                    {question.options?.length ? 'Meerkeuze' : 'Open antwoord'}
                  </GuardianStatus>
                  <span className={styles.muted}>
                    Bestaande voorbeeldinhoud
                  </span>
                </div>
                {selected.readingText && (
                  <details className={styles.details}>
                    <summary>
                      Volledige leestekst · {selected.readingText.title}
                    </summary>
                    <article
                      className={styles.passage}
                      aria-label={selected.readingText.title}
                    >
                      {selected.readingText.paragraphs.map(
                        (paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ),
                      )}
                    </article>
                  </details>
                )}
                <p className={styles.muted}>{selected.instruction}</p>
                <h3>{question.prompt}</h3>
                {question.options?.length ? (
                  <div aria-label="Antwoordmogelijkheden">
                    {question.options.map((option) => (
                      <div
                        key={option.value}
                        className={styles.answerOption}
                        data-correct={String(question.answer) === option.value}
                      >
                        <span>{option.value}</span>
                        <span>{option.label}</span>
                        {String(question.answer) === option.value && (
                          <Check
                            size={18}
                            aria-label="Antwoord volgens voorbeeldsleutel"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={material.answer}>
                    <span>Antwoord volgens voorbeeldsleutel</span>
                    <strong>
                      {question.answer}
                      {question.answerUnit ? ` ${question.answerUnit}` : ''}
                    </strong>
                  </div>
                )}
                <details className={styles.details} open>
                  <summary>Uitleg voor de leerling</summary>
                  <div className={styles.explanation}>
                    {question.steps.map((step, index) => (
                      <p key={index}>{step}</p>
                    ))}
                  </div>
                </details>
              </div>
            </>
          )}
          {tab === 'checks' && (
            <div className={styles.stack}>
              <div className={styles.notice}>
                <ShieldCheck size={20} aria-hidden="true" />
                <p>
                  Deze schermvoorbeelden gebruiken de bestaande
                  oefenvoorbeelden. Er is voor deze set geen nieuwe
                  AI-beoordeling of onafhankelijke onderwijskundige goedkeuring
                  uitgevoerd.
                </p>
              </div>
              <ul className={material.checklist}>
                <li>
                  <BookOpenCheck size={18} aria-hidden="true" />
                  <span>
                    Bekijk beide vragen met hun volledige context en antwoord.
                  </span>
                </li>
                <li>
                  <CircleHelp size={18} aria-hidden="true" />
                  <span>
                    Controleer of instructie, sleutel en uitleg bij elkaar
                    passen.
                  </span>
                </li>
                <li>
                  <Info size={18} aria-hidden="true" />
                  <span>
                    Een technische controle of AI-melding vervangt je
                    inhoudelijke oordeel niet.
                  </span>
                </li>
              </ul>
              <details className={styles.details}>
                <summary>Herkomst en gebruik</summary>
                <p>
                  Ongewijzigde synthetische oefenvoorbeelden uit de gedeelde
                  praktijkpreview. Deze sets zijn geen productievoorraad en
                  zeggen niets over Adams niveau.
                </p>
                <p>
                  Familiecertificering, budgetten en gemeten beoordelingstijd
                  blijven beschikbaar in het opgeslagen beheer.
                </p>
              </details>
            </div>
          )}
          {tab === 'notes' && (
            <form
              className={styles.stack}
              onSubmit={(event) => {
                event.preventDefault();
                setRecords((previous) => ({
                  ...previous,
                  [selectedId]: { ...previous[selectedId]!, note },
                }));
                setSavedNote(
                  'Notitie bewaard in dit voorbeeld. Je kunt de tekst hieronder aanpassen of wissen; de inhoud en beslissing zijn ongewijzigd.',
                );
              }}
            >
              <label className={styles.field}>
                Notitie bij deze set (optioneel)
                <textarea
                  value={note}
                  onChange={(event) => {
                    setNote(event.target.value);
                    setSavedNote('');
                  }}
                  maxLength={1000}
                  placeholder="Wat wil je onthouden bij deze oefeningen?"
                />
              </label>
              <div className={styles.actions}>
                <Button type="submit" variant="outline">
                  Notitie bewaren
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setNote(record.note);
                    setSavedNote(
                      'Wijzigingen in de notitie geannuleerd. Je laatst bewaarde notitie staat weer in het veld.',
                    );
                  }}
                >
                  Annuleren
                </Button>
              </div>
              {savedNote && (
                <p role="status" className={styles.muted}>
                  {savedNote}
                </p>
              )}
            </form>
          )}
          {decision ? (
            <div
              className={styles.confirmation}
              ref={confirmation}
              tabIndex={-1}
            >
              <h3>{confirmationCopy[decision].title}</h3>
              <p>{confirmationCopy[decision].description}</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  decide();
                }}
              >
                <label className={styles.field}>
                  {decision === 'withdraw'
                    ? 'Reden van intrekken'
                    : 'Notitie (optioneel)'}
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    required={decision === 'withdraw'}
                    minLength={decision === 'withdraw' ? 3 : undefined}
                    maxLength={1000}
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                    required
                  />
                  Ik heb de inhoud en de gevolgen gecontroleerd.
                </label>
                <div className={styles.actions}>
                  <Button
                    type="submit"
                    variant={
                      decision === 'withdraw' || decision === 'reject'
                        ? 'danger'
                        : 'primary'
                    }
                  >
                    {confirmationCopy[decision].action}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setDecision(undefined)}
                  >
                    Annuleren
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <footer className={material.reviewActions}>
              {record.state === 'pending' && (
                <>
                  <div className={styles.actions}>
                    <Button variant="outline" onClick={() => choose('reject')}>
                      <X size={17} aria-hidden="true" />
                      Afkeuren
                    </Button>
                    <Button
                      disabled={!allViewed}
                      onClick={() => choose('approve')}
                    >
                      <Check size={17} aria-hidden="true" />
                      Beoordeling afronden
                    </Button>
                  </div>
                  {!allViewed && (
                    <p className={styles.muted}>
                      Bekijk eerst beide vragen. Daarna kun je deze set
                      goedkeuren.
                    </p>
                  )}
                </>
              )}
              {record.state === 'approved' && (
                <>
                  <div className={styles.actions}>
                    <Button variant="ghost" onClick={() => undo(selectedId)}>
                      <Undo2 size={17} aria-hidden="true" />
                      Goedkeuring terugnemen
                    </Button>
                    <Button onClick={() => choose('publish')}>
                      Publicatie bekijken
                      <ArrowRight size={17} aria-hidden="true" />
                    </Button>
                  </div>
                  <p className={styles.muted}>
                    Goedgekeurd, nog niet beschikbaar voor oefensessies.
                  </p>
                </>
              )}
              {record.state === 'rejected' && (
                <Button variant="outline" onClick={() => undo(selectedId)}>
                  <Undo2 size={17} aria-hidden="true" />
                  Afkeuring terugnemen
                </Button>
              )}
              {record.state === 'published' && (
                <div className={styles.actions}>
                  <Button variant="outline" onClick={() => choose('withdraw')}>
                    Probleem melden en intrekken
                  </Button>
                  <Button onClick={onPlanning}>
                    Naar de planning
                    <ArrowRight size={17} aria-hidden="true" />
                  </Button>
                </div>
              )}
              {record.state === 'withdrawn' && (
                <GuardianFeedback
                  tone="warning"
                  title="Een correctie krijgt een nieuwe versie"
                >
                  <p>
                    Deze voorbeeldset blijft ingetrokken. Beoordeel een
                    gecorrigeerde versie in het opgeslagen beheer; oude
                    antwoorden worden niet overschreven.
                  </p>
                </GuardianFeedback>
              )}
            </footer>
          )}
        </GuardianPanel>
      </div>
      <details className={styles.details}>
        <summary>Voorraad, aanpassen en overige beheertaken</summary>
        <p>
          Deze pagina demonstreert de beoordeling met fictieve sets. Het
          opgeslagen beheer bevat voorbereiding, bewerken, familiebeoordeling,
          gemeten reviewtijd, verbruiksgrenzen, correcties en intrekken.
        </p>
        <a
          href="http://localhost:3060/guardian/content/supply"
          target="_blank"
          rel="noreferrer"
        >
          Open opgeslagen beheer in een apart tabblad
        </a>
      </details>
    </div>
  );
}
