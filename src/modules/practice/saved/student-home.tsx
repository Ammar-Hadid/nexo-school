'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthClient } from 'better-auth/react';
import { passkeyClient } from '@better-auth/passkey/client';
import {
  DeviceSignIn,
  DeviceSignInHelp,
  SignInPage,
  type DeviceSignInState,
} from '@/modules/identity/sign-in/sign-in-page';
import { PracticeTasksPage } from '../practice-block/practice-tasks-page';
import type { SessionView } from '../practice-block/practice-block.types';
const auth = createAuthClient({ plugins: [passkeyClient()] });
export function StudentHome() {
  const router = useRouter();
  const [tasks, setTasks] = useState<SessionView[] | null>(null);
  const [message, setMessage] = useState(
    'Even controleren of je bent aangemeld…',
  );
  const [busy, setBusy] = useState(false);
  const [signInState, setSignInState] = useState<DeviceSignInState>('checking');
  async function load() {
    const response = await fetch('/api/practice/assignments', {
      cache: 'no-store',
    });
    if (!response.ok) {
      setTasks(null);
      setSignInState(response.status === 401 ? 'ready' : 'unavailable');
      return;
    }
    setTasks(await response.json());
    setMessage('Je opgeslagen oefentaken.');
  }
  useEffect(() => {
    let active = true;
    fetch('/api/practice/assignments', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          if (active)
            setSignInState(response.status === 401 ? 'ready' : 'unavailable');
          return;
        }
        const tasks: SessionView[] = await response.json();
        if (active) {
          setTasks(tasks);
          setMessage('Je opgeslagen oefentaken.');
        }
      })
      .catch(() => {
        if (active) setSignInState('unavailable');
      });
    return () => {
      active = false;
    };
  }, []);
  async function login() {
    if (busy) return;
    setBusy(true);
    setSignInState('busy');
    try {
      const signedOut = await auth.signOut();
      if (signedOut.error) throw new Error('logout');
      const result = await auth.signIn.passkey();
      if (result.error) throw new Error('login');
      window.dispatchEvent(new Event('nexo-auth-change'));
      await load();
    } catch {
      setSignInState('error');
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await auth.signOut();
      if (result.error) throw new Error('logout');
      window.dispatchEvent(new Event('nexo-auth-change'));
      setTasks(null);
      setMessage('Je bent afgemeld.');
      setSignInState('ready');
    } catch {
      setMessage('Afmelden is niet bevestigd. Probeer opnieuw.');
    } finally {
      setBusy(false);
    }
  }
  if (tasks)
    return (
      <PracticeTasksPage
        saved
        block={{
          state: 'active',
          number: 1,
          title: 'opgeslagen oefentaken',
          subjects: 'Rekenen',
          sessions: tasks,
          passMinutes: 0,
          availability: '',
          studentAvailability: '',
        }}
        backHref="/student"
        onBack={() => void logout()}
        onChoose={(task) => router.push(`/student/assignments/${task.id}`)}
        previewNote={`${message} Lokale synthetische oefenomgeving.`}
      />
    );
  return (
    <SignInPage role="student" help={<DeviceSignInHelp role="student" />}>
      <DeviceSignIn
        state={signInState}
        onSignIn={() => void login()}
        onRetry={() => {
          setSignInState('checking');
          void load().catch(() => setSignInState('unavailable'));
        }}
      />
      <p>
        <a href="/student/enroll">Nieuwe browser aanmelden</a>
      </p>
      <p>
        <a href="/guardian">Naar het ouderportaal</a>
      </p>
    </SignInPage>
  );
}
