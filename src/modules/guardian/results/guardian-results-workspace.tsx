'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import {
  GuardianActionLink,
  GuardianPageHeading,
} from '@/components/guardian-ui/guardian-ui';
import { guardianHref } from '@/modules/identity/portal/guardian-links';
import type { GuardianResultTask } from '@/modules/practice/guardian-results/guardian-result-contract';
import { GuardianResultBrowser } from './guardian-result-browser';
import { GuardianProgress } from '../progress/guardian-progress';
import styles from '../guardian-workspace.module.css';

export function GuardianResultsWorkspace({
  tasks,
  progress = false,
  initialTask,
}: {
  tasks: readonly GuardianResultTask[];
  progress?: boolean;
  initialTask?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialTask);
  return (
    <GuardianNavigation
      appearance="workspace"
      current={progress ? 'progress' : 'results'}
      mobileNavigation="bottom"
      mainContent
      accountLabel="Ouder"
      contextNote="Opgeslagen oefensessies"
      hrefFor={guardianHref}
      onNavigate={(id) => router.push(guardianHref(id))}
    >
      <div className={styles.page}>
        <GuardianPageHeading
          title={progress ? 'Voortgang' : 'Sessieresultaten'}
          description={
            progress
              ? 'Een overzicht van de afgeronde sessies en de ingediende antwoorden.'
              : 'Bekijk het opgeslagen werk van de leerlingen die je begeleidt.'
          }
        />
        {progress ? (
          <GuardianProgress
            tasks={tasks}
            onOpenTask={(id) =>
              router.push(`/guardian/results?task=${encodeURIComponent(id)}`)
            }
            onResults={() => router.push('/guardian/results')}
          />
        ) : (
          <GuardianResultBrowser
            tasks={tasks}
            selectedId={selected}
            onSelect={setSelected}
            emptyAction={
              <GuardianActionLink href="/guardian">
                Naar je volgende stap
              </GuardianActionLink>
            }
          />
        )}
        <p className={styles.muted}>
          Opgeslagen synthetische oefensessies · maximaal 100 meest recente.
          Geen uitspraak over beheersing.{' '}
          <a href="/guardian">Terug naar het overzicht</a>
        </p>
      </div>
    </GuardianNavigation>
  );
}
