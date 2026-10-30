'use client';
import { useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Info } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
  GuardianNavigation,
  type GuardianDestination,
} from '@/components/guardian-navigation/guardian-navigation';
import { workspaceDestinations } from '@/components/guardian-navigation/guardian-workspace-navigation';
import {
  GuardianEmpty,
  GuardianFeedback,
  GuardianPageHeading,
  GuardianPanel,
} from '@/components/guardian-ui/guardian-ui';
import { GuardianDashboard } from '../dashboard/guardian-dashboard';
import { GuardianProgress } from '../progress/guardian-progress';
import { guardianTaskTitle, subjectForTitle } from '../subject-presentation';
import { scoreOutOfTen } from '@/modules/practice/exercise/score-display';
import { PlanningPreview } from './planning-preview';
import { ContentPreview } from './content-preview';
import { ResultsPreview } from './results-preview';
import { SettingsPreview } from './settings-preview';
import { resultTasks } from './preview-data';
import styles from '../guardian-workspace.module.css';

export type PreviewScenario =
  'attention' | 'quiet' | 'shortage' | 'empty' | 'loading' | 'error';
const scenarioLabels: Record<PreviewScenario, string> = {
  attention: 'Samen terugkijken',
  quiet: 'Alles loopt',
  shortage: 'Oefeningen ontbreken',
  empty: 'Eerste bezoek',
  loading: 'Laden',
  error: 'Verbinding mislukt',
};
const descriptions: Record<GuardianDestination, string> = {
  overview: 'De sessies, resultaten en volgende stap op één plek.',
  progress:
    'Bekijk hoe de oefensessies gingen en welke vragen aandacht verdienen.',
  planning: 'Een vaste week, met ruimte om een losse dag aan te passen.',
  admin: 'Bekijk de oefeningen en maak ze na beoordeling beschikbaar.',
  results: 'Van het overzicht naar de oorspronkelijke vraag en alle pogingen.',
  settings: 'Beheer je profiel, voorkeuren en de toegang van je leerling.',
};
export function GuardianPreview({
  initialDestination = 'overview',
  initialScenario = 'attention',
  failFirstSave = false,
}: {
  initialDestination?: GuardianDestination;
  initialScenario?: PreviewScenario;
  failFirstSave?: boolean;
}) {
  const [destination, setDestination] = useState(initialDestination);
  const [scenario, setScenario] = useState(initialScenario);
  const [selectedTask, setSelectedTask] = useState<string>();
  const [noted, setNoted] = useState(false);
  const [name, setName] = useState('Ammar');
  const [help, setHelp] = useState(false);
  const planning = useRef<{ openToday: () => void }>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  function navigate(next: GuardianDestination) {
    setDestination(next);
    if (next === 'results') setSelectedTask(undefined);
  }
  function openTask(id: string) {
    setSelectedTask(id);
    setDestination('results');
  }
  const today = resultTasks.filter((t) =>
    ['rekenen-1', 'reading-1', 'spelling-1', 'redactiesommen-1'].includes(t.id),
  );
  const featured = resultTasks.find((t) => t.id === 'rekenen-1')!;
  const quiet = scenario === 'quiet' || noted;
  return (
    <div className={styles.preview}>
      <aside className={styles.toolbar} aria-label="Ontwerpbediening">
        <p>
          <strong>Ontwerp R3</strong> · Fictieve gegevens, alleen in dit
          tabblad. Vernieuwen herstelt het voorbeeld.
        </p>
        <label>
          Situatie
          <select
            value={scenario}
            onChange={(e) => {
              setScenario(e.target.value as PreviewScenario);
              setNoted(false);
              navigate('overview');
            }}
          >
            {Object.entries(scenarioLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </aside>
      <GuardianNavigation
        appearance="workspace"
        current={destination}
        mobileNavigation="bottom"
        mainContent
        accountLabel={name}
        contextNote="Ontwerpvoorbeeld · Adam"
        label="Guardian ontwerp R3"
        hrefFor={(id) => `#${id}`}
        onNavigate={navigate}
      >
        <div className={styles.page}>
          <GuardianPageHeading
            title={
              destination === 'overview'
                ? 'Vandaag voor Adam'
                : workspaceDestinations.find((d) => d.id === destination)!.label
            }
            description={descriptions[destination]}
            context={
              destination === 'overview'
                ? 'Dinsdag 27 oktober 2026 · voorbeeld'
                : undefined
            }
          >
            {destination === 'overview' ? (
              <div className={styles.child}>
                <span className={styles.childAvatar}>A</span>
                <span>
                  <strong>Adam</strong>
                  <small>Groep 6 · voorbeeld</small>
                </span>
              </div>
            ) : destination === 'progress' ? (
              <Button variant="outline" onClick={() => navigate('planning')}>
                <CalendarDays size={17} aria-hidden="true" />
                Weekplanning
              </Button>
            ) : null}
          </GuardianPageHeading>
          <div hidden={destination !== 'overview'}>
            {scenario === 'loading' ? (
              <GuardianPanel>
                <GuardianEmpty title="Je overzicht ophalen…" loading>
                  <p>We verzamelen de sessies en resultaten.</p>
                </GuardianEmpty>
              </GuardianPanel>
            ) : scenario === 'error' ? (
              <GuardianFeedback
                tone="negative"
                title="Je overzicht is nu niet beschikbaar"
                next={
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setScenario('attention')}
                  >
                    Opnieuw proberen
                  </Button>
                }
              >
                <p>
                  We konden de gegevens niet ophalen. Er is niets gewijzigd.
                </p>
              </GuardianFeedback>
            ) : (
              <GuardianDashboard
                tasks={
                  scenario === 'empty'
                    ? []
                    : today.map((t) => ({
                        id: t.id,
                        title: guardianTaskTitle(t.title),
                        subject: subjectForTitle(t.title),
                        description: t.result.complete
                          ? `${t.result.solved} van ${t.result.total} opgelost`
                          : t.result.status,
                        complete: t.result.complete,
                        started: t.result.answered > 0,
                      }))
                }
                onOpenTask={openTask}
                onResults={() => navigate('results')}
                onPlanning={() => navigate('planning')}
                onHelp={() => {
                  setHelp(!help);
                  requestAnimationFrame(() =>
                    helpRef.current?.scrollIntoView({
                      block: 'nearest',
                      behavior: 'instant',
                    }),
                  );
                }}
                attention={
                  scenario === 'empty'
                    ? {
                        title: 'Een goede start, stap voor stap',
                        description:
                          'Bekijk je oefenritme en maak daarna de oefeningen klaar. Hier verschijnen straks Adams sessies.',
                        label: 'Bekijk je weekritme',
                        action: () => navigate('planning'),
                      }
                    : scenario === 'shortage'
                      ? {
                          title: 'Er ontbreekt nog een leessessie',
                          description:
                            'Andere beschikbare sessies kunnen doorgaan. Bekijk welke beoordeelde inhoud nodig is.',
                          label: 'Bekijk oefenmateriaal',
                          action: () => navigate('admin'),
                          warning: true,
                        }
                      : quiet
                        ? {
                            title: 'Alles staat op een rij voor vandaag',
                            description:
                              'Je hoeft nu niets te regelen. Je kunt rustig terugkijken naar de ingediende antwoorden.',
                            label: 'Bekijk resultaten',
                            action: () => navigate('results'),
                            quiet: true,
                          }
                        : {
                            title: 'Samen één rekenvraag bekijken',
                            description:
                              'Eén vraag was na twee pogingen nog niet goed. Bekijk de vraag en de uitleg samen.',
                            label: 'Bekijk de vraag',
                            action: () => openTask('rekenen-1'),
                          }
                }
                featured={
                  scenario === 'empty'
                    ? undefined
                    : {
                        id: featured.id,
                        title: guardianTaskTitle(featured.title),
                        subject: 'rekenen',
                        score:
                          scoreOutOfTen(
                            featured.result.score,
                            featured.result.total,
                          ) ?? '—',
                        description: `${featured.result.first} van ${featured.result.total} goed in één keer. ${featured.result.second} goed bij de tweede poging. ${featured.result.total - featured.result.solved} nog niet goed.`,
                        next: 'Bekijk samen de vraag die nog niet goed ging. Je hoeft de sessie niet opnieuw te beoordelen.',
                      }
                }
                footer={
                  <div className={styles.stack}>
                    {scenario === 'attention' &&
                      (noted ? (
                        <GuardianFeedback
                          title="Gemarkeerd als samen bekeken"
                          undo={{ onClick: () => setNoted(false) }}
                        >
                          <p>
                            De antwoorden en score blijven hetzelfde. Je kunt nu
                            verder met de planning of resultaten.
                          </p>
                        </GuardianFeedback>
                      ) : (
                        <div className={styles.row}>
                          <p className={styles.muted}>
                            De rekenvraag al samen bekeken? Werk alleen je
                            aandachtspunt bij.
                          </p>
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => setNoted(true)}
                          >
                            Markeer als samen bekeken
                          </Button>
                        </div>
                      ))}
                    {help && (
                      <div ref={helpRef}>
                        <GuardianPanel title="Zo werkt het ouderportaal">
                          <p>
                            Begin op Vandaag. Bekijk via Resultaten de
                            ingediende antwoorden. Onder Oefenmateriaal
                            beoordeel je nieuwe inhoud en publiceer je die
                            apart. In Planning kies je het oefenritme.
                          </p>
                          <p className={styles.muted}>
                            Dit ontwerp gebruikt fictieve voorbeelden.
                            Automatische planning en de voorgestelde
                            sessiebeoordeling zijn nog niet aangesloten. De
                            bestaande opgeslagen omgeving blijft apart
                            bereikbaar.
                          </p>
                          <a
                            href="http://localhost:3060/guardian"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open de opgeslagen testomgeving in een apart tabblad{' '}
                            <ArrowRight size={16} aria-hidden="true" />
                          </a>
                        </GuardianPanel>
                      </div>
                    )}
                  </div>
                }
              />
            )}
          </div>
          {destination === 'progress' && (
            <GuardianProgress
              tasks={resultTasks}
              onOpenTask={openTask}
              onResults={() => navigate('results')}
            />
          )}
          <div hidden={destination !== 'planning'}>
            <PlanningPreview ref={planning} failFirstSave={failFirstSave} />
          </div>
          <div hidden={destination !== 'results'}>
            <ResultsPreview
              selectedId={selectedTask}
              onSelect={setSelectedTask}
            />
          </div>
          <div hidden={destination !== 'admin'}>
            <ContentPreview
              shortage={scenario === 'shortage'}
              onPlanning={() => {
                planning.current?.openToday();
                navigate('planning');
              }}
            />
          </div>
          <div hidden={destination !== 'settings'}>
            <SettingsPreview
              onPlanning={() => navigate('planning')}
              onNameChange={setName}
            />
          </div>
          {destination === 'results' && (
            <p className={styles.muted}>
              <Info size={14} aria-hidden="true" /> Resultaten uit de bestaande
              synthetische oefenvoorbeelden. Dit zijn geen gegevens over een
              echte leerling.
            </p>
          )}
        </div>
      </GuardianNavigation>
    </div>
  );
}
