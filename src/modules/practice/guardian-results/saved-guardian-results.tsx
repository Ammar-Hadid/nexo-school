'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { SignInPage } from '@/modules/identity/sign-in/sign-in-page';
import { GuardianSignIn } from '@/modules/identity/portal/guardian-sign-in';
import type { GuardianResultTask } from './guardian-result-contract';
import type { GuardianDestination } from '@/components/guardian-navigation/guardian-navigation';
import { GuardianResultsView } from './guardian-results-view';

export function SavedGuardianResults({
  section,
  initialTask,
}: {
  section?: GuardianDestination;
  initialTask?: string;
}) {
  const [tasks, setTasks] = useState<GuardianResultTask[] | null>(null);
  const [state, setState] = useState<'loading' | 'signed-out' | 'error'>(
    'loading',
  );
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setTasks(null);
      setState('loading');
      try {
        const response = await fetch('/api/guardian/results', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          setState(response.status === 401 ? 'signed-out' : 'error');
          if (response.status === 401)
            window.dispatchEvent(new Event('nexo-auth-change'));
          return;
        }
        const data: GuardianResultTask[] = await response.json();
        if (!controller.signal.aborted) setTasks(data);
      } catch {
        if (!controller.signal.aborted) setState('error');
      }
    }
    void load();
    const refresh = () => setReload((value) => value + 1);
    window.addEventListener('focus', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
    };
  }, [reload]);
  if (tasks)
    return (
      <GuardianResultsView
        tasks={tasks}
        saved
        initialDestination={section}
        initialTask={initialTask}
      />
    );
  if (state === 'signed-out')
    return <GuardianSignIn onDone={() => setReload((v) => v + 1)} />;
  return (
    <SignInPage
      role="guardian"
      help={
        <p>
          Deze lokale synthetische omgeving gebruikt een bestaande
          ouderaanmelding met tweestapsverificatie.
        </p>
      }
    >
      <SignInNotice tone={state === 'error' ? 'error' : 'info'}>
        {state === 'loading'
          ? 'Sessieresultaten ophalen…'
          : 'Sessieresultaten zijn nu niet beschikbaar. Probeer het opnieuw.'}
      </SignInNotice>
      <Button
        loading={state === 'loading'}
        onClick={() => setReload((value) => value + 1)}
      >
        Opnieuw controleren
      </Button>
    </SignInPage>
  );
}
