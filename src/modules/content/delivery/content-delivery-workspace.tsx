'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/button/button';
import { CalendarDays } from 'lucide-react';
import { GuardianPageHeading } from '@/components/guardian-ui/guardian-ui';
import { SubjectIcon } from '@/components/guardian-ui/subject-icon';
import { subjectForTitle } from '@/modules/guardian/subject-presentation';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import type { DeliveryOverview, DeliveryImpact } from './delivery-contract';
import styles from '../supply/supply.module.css';
import { PracticeFlow } from '../practice-flow';
import { guardianHref } from '@/modules/identity/portal/guardian-links';
const reasons: Record<string, string> = {
  withdrawn: 'Ingetrokken',
  'stale-content': 'Vervangen door een nieuwere versie',
  'stale-rubric': 'Beoordelingsregels gewijzigd',
  'review-required': 'Menselijke beoordeling ontbreekt',
  'publication-required': 'Nog niet gepubliceerd',
  'unsupported-or-invalid-metadata':
    'Nog geen geschikt opgeslagen oefenformaat',
};
const pendingStorageKey = 'nexo:pending-content-assignment';
function restoreRequest(initial: DeliveryOverview) {
  try {
    const raw = sessionStorage.getItem(pendingStorageKey);
    if (!raw) return null;
    const request = JSON.parse(raw),
      values = JSON.parse(request.key);
    if (
      typeof request.id !== 'string' ||
      !/^[a-f0-9-]{36}$/.test(request.id) ||
      !initial.students.some((s) => s.id === values.studentId) ||
      !initial.items.some((i) => i.coverageId === values.coverageId) ||
      !Number.isInteger(values.count) ||
      values.count < 1 ||
      values.count > 10
    )
      return null;
    return {
      key: String(request.key),
      id: request.id as string,
      studentId: values.studentId as string,
      coverageId: values.coverageId as string,
      count: values.count as number,
    };
  } catch {
    return null;
  }
}
export function ContentDeliveryWorkspace({
  initial,
  assign,
  command,
  refresh,
  preview = false,
}: {
  initial: DeliveryOverview;
  preview?: boolean;
  assign: (input: {
    studentId: string;
    requestId: string;
    source: 'published-practice';
    coverageId: string;
    count: number;
  }) => Promise<{ id: string }>;
  command: (input: unknown) => Promise<unknown>;
  refresh: () => Promise<DeliveryOverview>;
}) {
  const [restored] = useState(() => (preview ? null : restoreRequest(initial)));
  const [data, setData] = useState(initial),
    [studentId, setStudent] = useState(
      restored?.studentId ?? initial.students[0]?.id ?? '',
    ),
    [coverageId, setCoverage] = useState(
      restored?.coverageId ??
        initial.items.find((i) => i.eligible)?.coverageId ??
        initial.items[0]?.coverageId ??
        '',
    ),
    [count, setCount] = useState(restored?.count ?? 2),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [assigned, setAssigned] = useState(false),
    [error, setError] = useState(''),
    [impact, setImpact] = useState<DeliveryImpact | null>(null);
  const pending = useRef<{ key: string; id: string } | null>(restored);
  const groups = [
    ...new Map(
      data.items.map((i) => [
        i.coverageId,
        { id: i.coverageId, title: i.title },
      ]),
    ).values(),
  ];
  const visible = data.items.filter((i) => i.coverageId === coverageId);
  async function act(work: () => Promise<string>) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      setNotice(await work());
      setData(await refresh());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Niet opgeslagen. Probeer opnieuw.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.shell}>
      <GuardianNavigation
        appearance="workspace"
        current="planning"
        mainContent
        mobileNavigation="bottom"
        accountLabel="Ouder"
        contextNote="Lokale synthetische oefensessies"
        hrefFor={guardianHref}
        onNavigate={(d) => {
          if (!preview) window.location.assign(guardianHref(d));
        }}
      >
        <div className={styles.page}>
          <GuardianPageHeading
            title="Een oefensessie klaarzetten"
            description="Kies voor wie je oefeningen klaarzet. De sessie verschijnt daarna in het leerlingportaal."
            context={
              <span className={styles.subjectContext}>
                <CalendarDays size={18} strokeWidth={1.75} aria-hidden="true" />
                Planning / Opgeslagen oefensessies
              </span>
            }
          />
          <PracticeFlow
            appearance="workspace"
            current={
              assigned
                ? 3
                : !data.students.length || !data.items.length
                  ? 0
                  : data.items.some((i) => i.eligible)
                    ? 2
                    : 1
            }
            title={
              assigned
                ? 'De sessie staat klaar. Nu is de leerling aan de beurt.'
                : !data.students.length
                  ? 'Stel eerst een testleerling in'
                  : !data.items.length
                    ? 'Er zijn nog geen oefeningen om toe te wijzen'
                    : !data.items.some((i) => i.eligible)
                      ? 'Maak je voorraad eerst klaar voor gebruik'
                      : 'Kies de leerling en de oefeningen'
            }
            action={
              assigned
                ? {
                    label: 'Opgeslagen sessies bekijken',
                    href: '/guardian/results',
                  }
                : !data.students.length
                  ? { label: 'Leerling instellen', href: '/guardian/access' }
                  : !data.items.length
                    ? {
                        label: 'Begin met twee rekenoefeningen',
                        href: '/guardian/content/supply',
                      }
                    : undefined
            }
          >
            <p>
              {assigned
                ? `Open ${window.location.origin}/student in de aparte leerlingbrowser. Maak daar de sessie en kom hier terug om de antwoorden te bekijken.`
                : !data.students.length
                  ? 'Voeg een testleerling toe en koppel de leerlingbrowser. Kom daarna hier terug.'
                  : !data.items.length
                    ? 'Bereid een kleine set voor, beoordeel die en publiceer je selectie. Daarna verschijnt de categorie hier vanzelf.'
                    : !data.items.some((i) => i.eligible)
                      ? 'De inhoud is nog niet beschikbaar voor een sessie. Open de bijbehorende beoordeling hieronder. Ingetrokken of verouderde inhoud blijft geblokkeerd.'
                      : 'Kies één of twee oefeningen; de leesproefset bevat één vraag. De server controleert de beschikbare voorraad voor deze leerling.'}
            </p>
            {!!data.items.length &&
              !assigned &&
              !data.items.some((i) => i.eligible) && (
                <div className={styles.links}>
                  <a href="/guardian/content/supply/review">
                    Rekenen beoordelen en publiceren
                  </a>
                  <a href="/guardian/content/spelling">
                    Spelling beoordelen en publiceren
                  </a>
                  <a href="/guardian/content/rehearsal/taal">
                    Taal beoordelen en publiceren
                  </a>
                  <a href="/guardian/content/rehearsal/redactiesommen">
                    Redactiesommen beoordelen en publiceren
                  </a>
                  <a href="/guardian/content/rehearsal/reading">
                    Leesproefset beoordelen en publiceren
                  </a>
                </div>
              )}
          </PracticeFlow>
          {notice && <p role="status">{notice}</p>}
          {error && <p role="alert">{error}</p>}
          <section aria-label="Sessiegegevens" className={styles.preparation}>
            {!!data.students.length && !!data.items.length && (
              <h2 id="assign-heading">
                {assigned ? 'Nog een sessie klaarzetten' : 'Jouw oefensessie'}
              </h2>
            )}
            {!!data.students.length && !!data.items.length && (
              <>
                <p>
                  Controleer de leerling, categorie en het aantal voordat je
                  bevestigt. Na klaarzetten kun je de sessie hier niet annuleren
                  of verwijderen. De oorspronkelijke sessie en eventuele
                  antwoorden blijven bewaard.
                </p>
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    void act(async () => {
                      const key = JSON.stringify({
                        studentId,
                        coverageId,
                        count,
                      });
                      const storageKey = pendingStorageKey;
                      if (!pending.current || pending.current.key !== key) {
                        const prior = !preview ? restoreRequest(data) : null;
                        pending.current =
                          prior?.key === key
                            ? prior
                            : { key, id: crypto.randomUUID() };
                      }
                      // Save the request identity before dispatch; a reload after a lost response reuses it.
                      if (!preview)
                        sessionStorage.setItem(
                          storageKey,
                          JSON.stringify(pending.current),
                        );
                      const result = await assign({
                        studentId,
                        coverageId,
                        count,
                        source: 'published-practice',
                        requestId: pending.current.id,
                      });
                      if (!preview) sessionStorage.removeItem(storageKey);
                      setAssigned(true);
                      return `Sessie opgeslagen. De leerling kan deze openen via Mijn taken. Je kunt de sessie hier niet annuleren of verwijderen; de sessie en antwoorden blijven bewaard. Bekijk de voortgang en antwoorden bij Resultaten. Sessienummer: ${result.id}`;
                    });
                  }}
                >
                  <label>
                    Leerling
                    <select
                      value={studentId}
                      required
                      onChange={(e) => setStudent(e.target.value)}
                    >
                      {data.students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Categorie
                    <select
                      value={coverageId}
                      required
                      onChange={(e) => setCoverage(e.target.value)}
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Aantal oefeningen
                    <input
                      type="number"
                      min={1}
                      max={10}
                      required
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                    />
                  </label>
                  <Button
                    type="submit"
                    loading={busy}
                    disabled={!studentId || !coverageId}
                  >
                    Sessie klaarzetten
                  </Button>
                </form>
                <p>
                  De server kiest de exacte versies en sluit recent toegewezen
                  oefeningen uit. Bij een tekort wordt geen onvolledige sessie
                  gemaakt.
                </p>
              </>
            )}
          </section>
          <details className={styles.details}>
            <summary>Andere oefeningen en voorraad beheren</summary>
            <div className={styles.links}>
              <a href="/guardian/content/supply">
                Rekenvoorraad voorbereiden en beoordelen
              </a>
              <a href="/guardian/content/spelling">Spellingbank beoordelen</a>
            </div>
            <p>
              {data.pending} versies wachten op beoordeling. Gemeten actieve
              reviewtijd: {Math.floor(data.measuredReviewMs / 60000)} minuten.
              Dit is geen bewezen wekelijkse capaciteit.
            </p>
            <p>
              Lokale synthetische oefening; geen toets, retentie of uitspraak
              over beheersing.
            </p>
          </details>
          {!!data.items.length && (
            <>
              <section aria-labelledby="versions-heading">
                <h2 id="versions-heading">Inhoud en correcties</h2>
                {!visible.length && (
                  <p>
                    Er is nog geen inhoud. Bereid eerst een set voor en
                    beoordeel die.
                  </p>
                )}
                {visible.map((item) => (
                  <details key={item.id} className={styles.details}>
                    <summary>
                      {item.prompt} · versie {item.revision} ·{' '}
                      {item.eligible
                        ? 'Beschikbaar voor oefenen'
                        : (reasons[item.reason ?? ''] ?? 'Niet beschikbaar')}
                    </summary>
                    <p className={styles.subjectContext}>
                      <SubjectIcon
                        subject={subjectForTitle(item.title)}
                        size="small"
                      />
                      {item.title}
                    </p>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void act(async () => {
                          setImpact(
                            (await command({
                              action: 'impact',
                              contentVersionId: item.id,
                            })) as DeliveryImpact,
                          );
                          return 'Betrokken sessies opgehaald.';
                        })
                      }
                    >
                      Bekijk betrokken sessies
                    </Button>
                    {!item.withdrawal ? (
                      <>
                        <p>
                          Intrekken is definitief en bedoeld voor een
                          inhoudsfout, niet om één sessie te annuleren. Deze
                          versie blijft uitgesloten voor nieuw gebruik en
                          betrokken onvoltooide sessies worden gepauzeerd.
                          Bestaande sessies en oorspronkelijke antwoorden
                          blijven bewaard.
                        </p>
                        <p>
                          Bekijk eerst de betrokken sessies. Voor herstel bewerk
                          je de oefening via de bestaande beoordeling. Beoordeel
                          en publiceer de nieuwe versie en koppel die daarna
                          hieronder als correctie.
                        </p>
                        <form
                          className={styles.form}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            void act(async () => {
                              await command({
                                action: 'withdraw',
                                contentVersionId: item.id,
                                contentHash: item.contentHash,
                                reason: f.get('reason'),
                                note: f.get('note'),
                              });
                              return 'Versie ingetrokken. Nieuwe toewijzing is geblokkeerd; betrokken onvoltooide sessies zijn gepauzeerd. De intrekking is definitief en oorspronkelijke antwoorden blijven bewaard. Bekijk de betrokken sessies. Maak voor herstel via de beoordeling een nieuwe versie, beoordeel en publiceer die en koppel daarna de correctie.';
                            });
                          }}
                        >
                          <label>
                            Reden
                            <select name="reason">
                              <option value="incorrect-answer">
                                Onjuist antwoord
                              </option>
                              <option value="misleading-explanation">
                                Misleidende uitleg
                              </option>
                              <option value="unsuitable-content">
                                Ongeschikte inhoud
                              </option>
                              <option value="other-defect">
                                Andere inhoudsfout
                              </option>
                            </select>
                          </label>
                          <label>
                            Toelichting voor de ouder
                            <input name="note" required maxLength={500} />
                          </label>
                          <Button
                            type="submit"
                            variant="outline"
                            disabled={busy}
                          >
                            Versie intrekken en sessies pauzeren
                          </Button>
                        </form>
                      </>
                    ) : (
                      <>
                        <p>Ingetrokken: {item.withdrawal.note}</p>
                        {item.withdrawal.correction ? (
                          <p>
                            Correctie vastgelegd:{' '}
                            {item.withdrawal.correction.note}. Eerdere sessies
                            blijven ongewijzigd. De koppeling kan niet worden
                            gewijzigd of verwijderd; de oude versie blijft
                            ingetrokken.
                          </p>
                        ) : (
                          <>
                            <p>
                              Controleer de nieuwe versie en toelichting. Deze
                              koppeling kan na bevestiging niet worden gewijzigd
                              of verwijderd. De oude versie blijft ingetrokken;
                              bestaande sessies en antwoorden blijven
                              ongewijzigd en gepauzeerde sessies worden niet
                              hervat. De nieuwe versie kan alleen in nieuwe
                              sessies worden gebruikt.
                            </p>
                            <form
                              className={styles.form}
                              onSubmit={(e) => {
                                e.preventDefault();
                                const f = new FormData(e.currentTarget),
                                  replacement = data.items.find(
                                    (i) => i.id === f.get('replacement'),
                                  );
                                if (!replacement) return;
                                void act(async () => {
                                  await command({
                                    action: 'correct',
                                    withdrawalId: item.withdrawal!.id,
                                    replacementVersionId: replacement.id,
                                    replacementHash: replacement.contentHash,
                                    note: f.get('note'),
                                  });
                                  return 'Correctie gekoppeld. De oorspronkelijke sessies en antwoorden blijven bewaard. Deze koppeling kun je niet wijzigen of verwijderen; de oude versie blijft ingetrokken en gepauzeerde sessies worden niet hervat. Bekijk de bewaarde resultaten of zet bovenaan een nieuwe sessie klaar met geschikte voorraad.';
                                });
                              }}
                            >
                              <label>
                                Beoordeelde nieuwe versie
                                <select
                                  name="replacement"
                                  required
                                  defaultValue=""
                                >
                                  <option value="" disabled>
                                    Kies een gepubliceerde correctie
                                  </option>
                                  {data.items
                                    .filter(
                                      (i) =>
                                        i.contentId === item.contentId &&
                                        i.revision > item.revision &&
                                        i.eligible,
                                    )
                                    .map((i) => (
                                      <option key={i.id} value={i.id}>
                                        Versie {i.revision} · {i.prompt}
                                      </option>
                                    ))}
                                </select>
                              </label>
                              <label>
                                Correctietoelichting
                                <input name="note" required maxLength={500} />
                              </label>
                              <Button
                                type="submit"
                                disabled={busy}
                                variant="outline"
                              >
                                Correctie vastleggen
                              </Button>
                            </form>
                          </>
                        )}
                      </>
                    )}
                  </details>
                ))}
              </section>
              {impact && (
                <section aria-label="Betrokken sessies">
                  <h2>Betrokken opgeslagen sessies</h2>
                  {!impact.items.length ? (
                    <p>Geen betrokken sessies binnen je kijkrechten.</p>
                  ) : (
                    <ul>
                      {impact.items.map((i) => (
                        <li key={i.id}>
                          {i.assignment.student.displayName} ·{' '}
                          {i.attempts.length} bewaarde pogingen ·{' '}
                          <a
                            className={styles.reviewLink}
                            href="/guardian/results"
                          >
                            Bekijk resultaat
                          </a>{' '}
                          · sessie {i.assignmentId}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
              <aside className={styles.scope}>
                Een correctie overschrijft geen antwoorden of scores.
                Ingetrokken inhoud blijft uitgesloten als leerbewijs. Beoordeel
                en publiceer een nieuwe versie via de bestaande review voordat
                je die als correctie koppelt:{' '}
                <a href="/guardian/content/supply/review">Rekenen beoordelen</a>{' '}
                of <a href="/guardian/content/spelling">Spelling beoordelen</a>.
              </aside>
            </>
          )}
        </div>
      </GuardianNavigation>
    </div>
  );
}
