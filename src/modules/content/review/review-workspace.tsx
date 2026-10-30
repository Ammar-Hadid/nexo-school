'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button/button';
import { GuardianPageHeading } from '@/components/guardian-ui/guardian-ui';
import { SubjectIcon } from '@/components/guardian-ui/subject-icon';
import { subjectForTitle } from '@/modules/guardian/subject-presentation';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import type { ReviewBatch } from './review-contract';
import { ReviewExercise, reviewStatus } from './review-item';
import { ReviewDecision } from './review-decision';
import { ReviewTime, type ReviewTransport } from './review-time';
import styles from './review.module.css';
import { PracticeFlow } from '../practice-flow';
import { guardianHref } from '@/modules/identity/portal/guardian-links';
const href = guardianHref;
export function ReviewWorkspace({
  initialBatch,
  send,
  preview = false,
  assignable = initialBatch.supply ?? false,
}: {
  initialBatch: ReviewBatch;
  send: ReviewTransport;
  preview?: boolean;
  assignable?: boolean;
}) {
  const [batch, setBatch] = useState(initialBatch),
    [selected, setSelected] = useState<string[]>([]),
    [activeId, setActiveId] = useState(initialBatch.cursor),
    [mode, setMode] = useState<'review' | 'decision'>('review'),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const cursorWrites = useRef(Promise.resolve());
  useEffect(() => {
    if (!editing) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [editing]);
  const current =
    batch.items.find((i) => i.contentId === activeId) ?? batch.items[0];
  const index = batch.items.findIndex((i) => i.id === current?.id);
  const chosen = batch.items.filter((i) => selected.includes(i.id));
  const reviewed = batch.items.filter((i) => i.decision !== 'pending').length;
  const approved = batch.items.filter(
    (i) => i.decision === 'approved' && !i.published && !i.checks.length,
  );
  const published = batch.items.filter((i) => i.published).length;
  function focusItem(id: string) {
    requestAnimationFrame(() => document.getElementById(`item-${id}`)?.focus());
  }
  function cursor(contentId: string) {
    cursorWrites.current = cursorWrites.current.then(async () => {
      try {
        await send({ action: 'cursor', contentId });
      } catch {
        setError('Je voortgang kon niet worden opgeslagen.');
      }
    });
  }
  function open(contentId: string) {
    if (editing || busy) return;
    setActiveId(contentId);
    setMode('review');
    setMessage('');
    cursor(contentId);
    focusItem(contentId);
  }
  async function action(input: Record<string, unknown>, success: string) {
    setBusy(true);
    setError('');
    try {
      const r = (await send(input)) as ReviewBatch;
      setBatch(r);
      setSelected([]);
      setMessage(success);
      setMode('review');
      if (input.action === 'edit') {
        setEditing(false);
        if (current) focusItem(current.contentId);
      }
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'REVIEW_LIMIT'
          ? 'De weeklimiet voor nieuwe versies is bereikt. Je wijziging is niet opgeslagen; bewaar je notitie en pak deze volgende week op.'
          : 'Niet bevestigd. Controleer je verbinding of meld je opnieuw aan. Bij een gewijzigde versie moet je de pagina herladen.',
      );
      throw e;
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.shell}>
      <GuardianNavigation
        appearance="workspace"
        current="admin"
        mobileNavigation="bottom"
        accountLabel="Ouder"
        contextNote="Lokale synthetische inhoudsbeoordeling"
        mainContent
        hrefFor={href}
        onNavigate={(d) => {
          if (!preview) window.location.assign(href(d));
        }}
      >
        <div className={styles.page}>
          <GuardianPageHeading
            title="Oefeningen beoordelen"
            description={batch.title}
            context={
              <span className={styles.subjectContext}>
                <SubjectIcon
                  subject={subjectForTitle(batch.title)}
                  size="small"
                />
                Oefenmateriaal / Beoordelen
              </span>
            }
          >
            <ReviewTime initialMs={batch.activeMs} send={send} />
          </GuardianPageHeading>
          {batch.id.startsWith('d14-s5-') && (
            <p>
              Kleine synthetische proefset voor opgeslagen oefensessies; geen
              volledige categorie of niveaubepaling.
              {batch.id === 'd14-s5-reading-v1' &&
                ' Zet één vraag klaar. De volledige tekst blijft bewaard; deze proefset biedt één vraag per tekst.'}
              {batch.id === 'd14-s5-redactiesommen-v1' &&
                ' Alleen het eindantwoord wordt nagekeken; de leerling vult nog geen bewerking, berekening of eigen eenheid in.'}
            </p>
          )}
          <PracticeFlow
            appearance="workspace"
            current={published && assignable ? 2 : 1}
            title={
              approved.length
                ? 'Goedgekeurd. Nu nog publiceren.'
                : published && assignable
                  ? 'Je oefeningen zijn gepubliceerd'
                  : batch.items.length
                    ? 'Bekijk, selecteer en beoordeel'
                    : 'Bereid eerst oefeningen voor'
            }
            action={
              published && assignable && !approved.length
                ? {
                    label: 'Een sessie klaarzetten',
                    href: '/guardian/content/assignments',
                  }
                : !batch.items.length && batch.supply
                  ? {
                      label: 'Oefeningen voorbereiden',
                      href: '/guardian/content/supply',
                    }
                  : undefined
            }
          >
            <p>
              {approved.length
                ? 'Publiceren maakt je goedgekeurde oefeningen beschikbaar voor gebruik. Je bevestigt dit apart.'
                : published && assignable
                  ? `${published} oefeningen zijn gepubliceerd. Je kunt nu een leerling en aantal kiezen voor een sessie.`
                  : batch.items.length
                    ? 'Bekijk de volledige oefening en het antwoord. Vink de oefeningen aan die je hebt beoordeeld en kies Beslis over selectie. Na goedkeuring volgt publiceren.'
                    : batch.supply
                      ? 'Er staat nog geen set klaar. Begin met twee rekenoefeningen.'
                      : 'Gebruik Proefset klaarzetten om te beginnen. Daarna kun je de oefeningen bekijken.'}
            </p>
            {approved.length > 0 && (
              <Button
                variant="outline"
                disabled={editing || busy}
                onClick={() => {
                  setSelected(approved.map((i) => i.id));
                  setMode('decision');
                  requestAnimationFrame(() =>
                    document.getElementById('review-decision')?.focus(),
                  );
                }}
              >
                Verder naar publiceren ({approved.length})
              </Button>
            )}
          </PracticeFlow>
          {batch.supply && (
            <p>
              <a
                href={
                  preview
                    ? '/?path=/story/content-question-supply--first-week'
                    : '/guardian/content/supply'
                }
                target={preview ? '_top' : undefined}
              >
                ← Terug naar weekvoorraad
              </a>
            </p>
          )}
          <details className={styles.demoNote}>
            <summary>
              {batch.supply
                ? 'Lokale voorraadproef · familiecertificering ontbreekt'
                : 'Lokale proef · inhoud vraagt menselijke beoordeling'}
            </summary>
            <p>
              {preview
                ? 'Wijzigingen blijven alleen in dit venster; vernieuwen reset de demo.'
                : 'Wijzigingen worden lokaal opgeslagen.'}{' '}
              Geen toewijzing aan Adam. Automatische controles en AI-advies zijn
              geen menselijke goedkeuring.
            </p>
          </details>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {message && (
            <p role="status" className={styles.success}>
              {message}
            </p>
          )}
          {!batch.items.length ? (
            <section className={styles.empty}>
              <h2>Nog geen proefset</h2>
              <p>
                {batch.supply
                  ? 'Er staat geen beoordeling klaar. Open de weekvoorraad om een begrensde set voor te bereiden.'
                  : 'Zet de vaste proefset klaar om de oefeningen te bekijken.'}
              </p>
              {!batch.supply && (
                <>
                  <Button
                    loading={busy}
                    onClick={() =>
                      void action(
                        { action: 'initialize' },
                        'Proefset klaargezet.',
                      ).catch(() => {})
                    }
                  >
                    Proefset klaarzetten
                  </Button>
                </>
              )}
            </section>
          ) : (
            <>
              <nav className={styles.steps} aria-label="Beoordelingsstappen">
                <button
                  type="button"
                  aria-current={mode === 'review' ? 'step' : undefined}
                  disabled={editing || busy}
                  onClick={() => {
                    setMode('review');
                    if (current) focusItem(current.contentId);
                  }}
                >
                  <span>1</span> Oefeningen bekijken
                </button>
                <button
                  type="button"
                  aria-current={mode === 'decision' ? 'step' : undefined}
                  disabled={editing || busy || !chosen.length}
                  onClick={() => {
                    setMode('decision');
                    requestAnimationFrame(() =>
                      document.getElementById('review-decision')?.focus(),
                    );
                  }}
                >
                  <span>2</span> Beslis over selectie ({chosen.length})
                </button>
                <p>
                  {reviewed} / {batch.items.length} beoordeeld
                </p>
              </nav>
              <div className={styles.workbench}>
                <aside
                  className={styles.queue}
                  aria-label="Oefeningen in deze set"
                >
                  <h2>
                    In deze set <span>{batch.items.length}</span>
                  </h2>
                  <label className={styles.mobilePicker}>
                    Kies een oefening
                    <select
                      value={current?.contentId ?? ''}
                      disabled={editing || busy}
                      onChange={(e) => open(e.target.value)}
                    >
                      {batch.items.map((item, n) => (
                        <option key={item.id} value={item.contentId}>
                          {n + 1}. {item.title}
                          {item.checks.length
                            ? ' · Aanpassen'
                            : item.advisory.status === 'flagged'
                              ? ' · Aandachtspunt'
                              : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <ol>
                    {batch.items.map((item, n) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          title={`Open ${item.title}`}
                          aria-current={
                            current?.id === item.id && mode === 'review'
                              ? 'true'
                              : undefined
                          }
                          disabled={editing || busy}
                          onClick={() => open(item.contentId)}
                        >
                          <span className={styles.queueIcon}>
                            <SubjectIcon
                              subject={subjectForTitle(batch.title)}
                              size="small"
                            />
                            <small>{String(n + 1).padStart(2, '0')}</small>
                          </span>
                          <span>
                            <strong>
                              {item.title}
                              {selected.includes(item.id) ? ' ✓' : ''}
                            </strong>
                            <small
                              data-attention={
                                item.checks.length > 0 ||
                                item.advisory.status === 'flagged'
                              }
                            >
                              {item.checks.length
                                ? `${item.checks.length} blokkades`
                                : item.decision !== 'pending'
                                  ? reviewStatus(item)
                                  : item.advisory.status === 'flagged'
                                    ? item.advisory.provenance ===
                                      'deterministic-check'
                                      ? 'Controlepunt'
                                      : 'AI-aandachtspunt'
                                    : 'Nog te beoordelen'}
                            </small>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                  {editing && (
                    <p className={styles.muted}>
                      Sla je wijziging op of annuleer om verder te gaan.
                    </p>
                  )}
                </aside>
                <div className={styles.reviewPane}>
                  {mode === 'decision' ? (
                    <div id="review-decision" tabIndex={-1}>
                      <ReviewDecision
                        key={chosen.map((i) => i.id).join(',')}
                        items={chosen}
                        busy={busy}
                        onRemove={(id) =>
                          setSelected((s) => s.filter((v) => v !== id))
                        }
                        onOpen={open}
                        onDecision={(kind, notes) =>
                          action(
                            {
                              action: kind,
                              refs: chosen.map(({ id, contentHash }) => ({
                                id,
                                contentHash,
                              })),
                              ...(kind === 'publish' ? {} : { notes }),
                            },
                            kind === 'publish'
                              ? 'Geselecteerde versies zijn lokaal gepubliceerd. Publicatie kun je niet ongedaan maken. Bij een inhoudsfout trek je de versie in via Planning · Inhoud en correcties; bestaande sessies en antwoorden blijven bewaard. Je kunt nu een sessie klaarzetten met geschikte voorraad.'
                              : kind === 'approve'
                                ? 'Je beslissing is opgeslagen. Deze exacte versies zijn goedgekeurd; dit oordeel kun je niet wijzigen. Ga verder naar publiceren om ze beschikbaar te maken. Voor een ander oordeel bewerk je de oefening en beoordeel je de nieuwe versie opnieuw.'
                                : 'Je beslissing is opgeslagen. Deze exacte versies zijn afgewezen en kunnen niet worden gepubliceerd. Dit oordeel kun je niet wijzigen. Bewerk de oefening om een nieuwe versie op te slaan en beoordeel die opnieuw.',
                          )
                        }
                      />
                    </div>
                  ) : (
                    current && (
                      <>
                        <div className={styles.position}>
                          <span>
                            Oefening {index + 1} van {batch.items.length}
                          </span>
                          <span>Bekijk inhoud, antwoord en controles</span>
                        </div>
                        <ReviewExercise
                          key={current.id}
                          item={current}
                          busy={busy}
                          selected={selected.includes(current.id)}
                          onEditing={setEditing}
                          onFocusItem={() => cursor(current.contentId)}
                          onSelect={(yes) =>
                            setSelected((s) =>
                              yes
                                ? [...s, current.id]
                                : s.filter((id) => id !== current.id),
                            )
                          }
                          onSave={(payload) =>
                            action(
                              {
                                action: 'edit',
                                id: current.id,
                                contentHash: current.contentHash,
                                payload,
                              },
                              'Nieuwe versie opgeslagen; opnieuw beoordelen vereist.',
                            )
                          }
                        />
                        <div className={styles.pager}>
                          <Button
                            variant="ghost"
                            disabled={editing || busy || index === 0}
                            onClick={() =>
                              open(batch.items[index - 1]!.contentId)
                            }
                          >
                            Vorige
                          </Button>
                          {index < batch.items.length - 1 ? (
                            <Button
                              variant="outline"
                              disabled={editing || busy}
                              onClick={() =>
                                open(batch.items[index + 1]!.contentId)
                              }
                            >
                              Volgende oefening
                            </Button>
                          ) : (
                            <Button
                              disabled={editing || busy || !chosen.length}
                              onClick={() => {
                                setMode('decision');
                                requestAnimationFrame(() =>
                                  document
                                    .getElementById('review-decision')
                                    ?.focus(),
                                );
                              }}
                            >
                              Naar selectie ({chosen.length})
                            </Button>
                          )}
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </GuardianNavigation>
    </div>
  );
}
