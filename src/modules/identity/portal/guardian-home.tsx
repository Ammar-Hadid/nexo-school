'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  MonitorSmartphone,
} from 'lucide-react';
import { GuardianDashboard } from '@/modules/guardian/dashboard/guardian-dashboard';
import {
  GuardianEmpty,
  GuardianFeedback,
  GuardianPageHeading,
  GuardianPanel,
  GuardianTextLink,
} from '@/components/guardian-ui/guardian-ui';
import { SubjectIcon } from '@/components/guardian-ui/subject-icon';
import {
  guardianTaskTitle,
  subjectForTitle,
} from '@/modules/guardian/subject-presentation';
import { scoreOutOfTen } from '@/modules/practice/exercise/score-display';
import type { DeliveryOverview } from '@/modules/content/delivery/delivery-contract';
import type { GuardianResultTask } from '@/modules/practice/guardian-results/guardian-result-contract';
import { useGuardian } from './portal-access';
import { guardianHref } from './guardian-links';
import { portalRequest } from './portal-client';
import styles from './guardian-pages.module.css';
type HomeState = 'loading' | 'ready' | 'verify' | 'error';

export function GuardianHomeView({
  name,
  operator,
  state,
  data,
  tasks = [],
}: {
  name: string;
  operator: boolean;
  state: HomeState;
  data?: DeliveryOverview;
  tasks?: GuardianResultTask[];
}) {
  const router = useRouter();
  const unfinished = tasks.filter(
    (t) => !t.result.complete && !t.corrections?.length,
  );
  const published = data?.items.filter((i) => i.eligible).length ?? 0;
  const review = data?.items.some(
    (i) =>
      i.reason === 'review-required' || i.reason === 'publication-required',
  );
  const next = !operator
    ? {
        step: 4,
        title: 'Bekijk het opgeslagen werk',
        text: 'Open de sessies en antwoorden van de leerlingen die je begeleidt.',
        href: '/guardian/results',
        label: 'Resultaten bekijken',
      }
    : !data?.students.length
      ? {
          step: 0,
          title: 'Stel eerst je testleerling in',
          text: 'Voeg een testleerling toe en koppel een leerlingbrowser. Dit hoef je maar één keer te doen.',
          href: '/guardian/access',
          label: 'Leerling instellen',
        }
      : unfinished.length
        ? {
            step: 3,
            title: 'Er staat een sessie klaar voor je leerling',
            text: 'Ga verder in de aparte leerlingbrowser. Hier kun je de opgeslagen voortgang en daarna het resultaat bekijken.',
            href: '/guardian/results',
            label: 'Opgeslagen sessies bekijken',
          }
        : tasks.some((t) => t.result.complete)
          ? {
              step: 4,
              title: 'Bekijk het resultaat',
              text: 'Er is afgerond werk om te bekijken. Daarna kun je hieronder een volgende sessie klaarzetten.',
              href: '/guardian/results',
              label: 'Resultaten bekijken',
            }
          : published
            ? {
                step: 2,
                title: 'Zet een oefensessie klaar',
                text: `${published} gepubliceerde oefeningen in de voorraad. Kies een leerling, categorie en aantal. De volgende pagina controleert wat die leerling kan krijgen.`,
                href: '/guardian/content/assignments',
                label: 'Sessie klaarzetten',
              }
            : review
              ? {
                  step: 1,
                  title: 'Maak je oefeningen klaar voor gebruik',
                  text: 'Er staat inhoud klaar die nog beoordeling of publicatie nodig heeft. Kies de bijbehorende set in het overzicht.',
                  href: '/guardian/content/assignments',
                  label: 'Verder met je oefeningen',
                }
              : data?.items.length
                ? {
                    step: 0,
                    title: 'Je voorraad vraagt aandacht',
                    text: 'De bewaarde inhoud is nu niet beschikbaar voor een sessie. Bekijk de reden en bereid zo nodig nieuwe oefeningen voor.',
                    href: '/guardian/content/assignments',
                    label: 'Voorraad bekijken',
                  }
                : {
                    step: 0,
                    title: 'Begin met twee oefeningen',
                    text: 'Er zijn nog geen oefeningen. Bereid een kleine rekenset voor; daarna bekijken we de inhoud en zet je een sessie klaar.',
                    href: '/guardian/content/supply',
                    label: 'Oefeningen voorbereiden',
                  };
  const completed = tasks.find(
    (task) =>
      task.result.complete &&
      !task.corrections?.length &&
      scoreOutOfTen(task.result.score, task.result.total) !== undefined,
  );
  const goResults = (id?: string) =>
    router.push(
      id
        ? `/guardian/results?task=${encodeURIComponent(id)}`
        : '/guardian/results',
    );
  return (
    <GuardianNavigation
      appearance="workspace"
      current="overview"
      mainContent
      mobileNavigation="bottom"
      accountLabel={name}
      contextNote="Lokaal bewaarde oefensessies"
      hrefFor={guardianHref}
      onNavigate={(id) => router.push(guardianHref(id))}
    >
      <div className={styles.page}>
        <GuardianPageHeading
          title="Jouw ouderportaal"
          description="Je oefensessies, resultaten en volgende stap op één plek."
        >
          <span className={styles.context}>
            <MonitorSmartphone
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Lokaal opgeslagen
          </span>
        </GuardianPageHeading>
        {state === 'loading' ? (
          <GuardianPanel>
            <GuardianEmpty loading title="Je volgende stap ophalen…">
              <p>We halen je opgeslagen oefensessies en voorraad op.</p>
            </GuardianEmpty>
          </GuardianPanel>
        ) : state === 'error' ? (
          <GuardianFeedback
            tone="negative"
            title="Je voortgang is nu niet beschikbaar"
            next={
              <GuardianTextLink href="/guardian">
                Opnieuw proberen
              </GuardianTextLink>
            }
          >
            <p>
              We konden je opgeslagen gegevens niet ophalen. Er is niets
              gewijzigd.
            </p>
          </GuardianFeedback>
        ) : state === 'verify' ? (
          <GuardianFeedback
            tone="info"
            title="Ga verder met je oefeningen"
            next={
              <GuardianTextLink href="/guardian/content/assignments">
                Verdergaan
              </GuardianTextLink>
            }
          >
            <p>
              Bevestig zo nodig je authenticatorcode. Daarna zie je de
              opgeslagen voorraad en de volgende stap.
            </p>
          </GuardianFeedback>
        ) : (
          <GuardianDashboard
            tasks={tasks.slice(0, 4).map((task) => ({
              id: task.id,
              title: guardianTaskTitle(task.title),
              subject: subjectForTitle(task.title),
              description: task.corrections?.length
                ? 'Inhoud ingetrokken · bekijk de toelichting'
                : task.result.complete
                  ? `${task.result.solved} van ${task.result.total} vragen opgelost`
                  : task.result.status,
              complete: task.result.complete,
              started: task.result.answered > 0,
            }))}
            attention={{
              title: next.title,
              description: next.text,
              label: next.label,
              href: next.href,
              action: () => router.push(next.href),
            }}
            onOpenTask={goResults}
            onResults={() => goResults()}
            onPlanning={() =>
              router.push(
                operator
                  ? '/guardian/content/assignments'
                  : '/guardian/results',
              )
            }
            featured={
              completed
                ? {
                    id: completed.id,
                    title: guardianTaskTitle(completed.title),
                    subject: subjectForTitle(completed.title),
                    score: scoreOutOfTen(
                      completed.result.score,
                      completed.result.total,
                    )!,
                    description: `${completed.result.first} van ${completed.result.total} goed in één keer. ${completed.result.second} goed bij de tweede poging. ${completed.result.total - completed.result.solved} nog niet goed.`,
                    next:
                      completed.result.solved < completed.result.total
                        ? 'Bekijk samen de oorspronkelijke vraag en pogingen. Het resultaat van één sessie zegt niet wat de leerling al beheerst.'
                        : 'Bekijk de ingediende antwoorden en zet daarna een volgende sessie klaar.',
                  }
                : undefined
            }
          />
        )}
        <GuardianPanel title="Direct naar" className={styles.shortcutsPanel}>
          <ul className={styles.shortcuts}>
            <li>
              <MonitorSmartphone
                size={21}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div>
                <a href="/guardian/access">Leerling en browsers beheren</a>
                <p>Eenmalig instellen of toegang wijzigen.</p>
              </div>
              <ArrowRight size={17} aria-hidden="true" />
            </li>
            {operator && (
              <>
                <li>
                  <SubjectIcon subject="rekenen" size="small" />
                  <div>
                    <a href="/guardian/content/supply">
                      Rekenvoorraad voorbereiden en beoordelen
                    </a>
                    <p>Begin hier als er nog geen oefeningen zijn.</p>
                  </div>
                  <ArrowRight size={17} aria-hidden="true" />
                </li>
                <li>
                  <SubjectIcon subject="spelling" size="small" />
                  <div>
                    <a href="/guardian/content/spelling">
                      Spellingbank beoordelen
                    </a>
                    <p>Dezelfde stappen, met spellingsoefeningen.</p>
                  </div>
                  <ArrowRight size={17} aria-hidden="true" />
                </li>
                <li>
                  <BookOpenCheck
                    size={21}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <div>
                    <a href="/guardian/content/assignments">
                      Oefensessies klaarzetten en inhoud intrekken
                    </a>
                    <p>Gebruik je gepubliceerde oefeningen voor een sessie.</p>
                  </div>
                  <ArrowRight size={17} aria-hidden="true" />
                </li>
              </>
            )}
            <li>
              <ClipboardList size={21} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <a href="/guardian/results">Opgeslagen resultaten bekijken</a>
                <p>Bekijk ingediende antwoorden en afgeronde sessies.</p>
              </div>
              <ArrowRight size={17} aria-hidden="true" />
            </li>
          </ul>
        </GuardianPanel>
        <details className={styles.environment}>
          <summary>Over deze testomgeving</summary>
          <p>
            Gebruik je testleerling. Accounts, oefeningen en antwoorden blijven
            lokaal bewaard. Je test het klaarmaken, oefenen en terugkijken;
            automatische dagplanning is nog niet beschikbaar.
          </p>
          <p>
            Gebruik voor het leerlingportaal een apart browserprofiel of een
            andere browser. Twee tabbladen delen dezelfde aanmelding.
          </p>
          <p>
            Het overzicht toont maximaal vier van de meest recente opgeslagen
            sessies, over de leerlingen die je mag begeleiden. Alle beschikbare
            sessies staan bij Resultaten.
          </p>
        </details>
      </div>
    </GuardianNavigation>
  );
}

export function GuardianHome() {
  const guardian = useGuardian();
  const [snapshot, setSnapshot] = useState<{
    state: HomeState;
    data?: DeliveryOverview;
    tasks?: GuardianResultTask[];
  }>({ state: 'loading' });
  useEffect(() => {
    if (!guardian?.operator || !guardian.fresh) return;
    let active = true;
    Promise.all([
      portalRequest<DeliveryOverview>('/api/guardian/content-delivery'),
      portalRequest<GuardianResultTask[]>('/api/guardian/results'),
    ])
      .then(([data, tasks]) => {
        if (active) setSnapshot({ state: 'ready', data, tasks });
      })
      .catch(() => {
        if (active) setSnapshot({ state: 'error' });
      });
    return () => {
      active = false;
    };
  }, [guardian]);
  return (
    <GuardianHomeView
      {...snapshot}
      name={guardian?.name ?? 'Ouder'}
      operator={guardian?.operator ?? false}
      state={
        !guardian?.operator
          ? 'ready'
          : !guardian.fresh
            ? 'verify'
            : snapshot.state
      }
    />
  );
}
