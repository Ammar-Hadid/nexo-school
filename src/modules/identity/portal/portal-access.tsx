'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/button/button';
import { LogOut } from 'lucide-react';
import { GuardianAccountProvider } from '@/components/guardian-navigation/guardian-account-context';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { SignInPage } from '../sign-in/sign-in-page';
import { GuardianSignIn } from './guardian-sign-in';
import { authRequest, PortalError, type PortalSession } from './portal-client';
export { guardianHref } from './guardian-links';
const GuardianContext = createContext<Extract<
  PortalSession,
  { role: 'guardian' }
> | null>(null);
export const useGuardian = () => useContext(GuardianContext);
export function PortalAccess({
  role,
  children,
}: {
  role: 'guardian' | 'student';
  children: ReactNode;
}) {
  const path = usePathname(),
    router = useRouter();
  const [session, setSession] = useState<PortalSession | null>(null),
    [state, setState] = useState<'loading' | 'ready' | 'out' | 'error'>(
      'loading',
    ),
    [reload, setReload] = useState(0),
    [checkedPath, setCheckedPath] = useState(''),
    [logoutError, setLogoutError] = useState('');
  const bypass = path === '/guardian/reset-password';
  const refresh = () => setReload((v) => v + 1);
  useEffect(() => {
    if (bypass) return;
    let active = true;
    void authRequest<PortalSession>('/portal-session')
      .then((s) => {
        if (active) {
          setSession(s);
          setCheckedPath(path);
          setState('ready');
        }
      })
      .catch((e) => {
        if (active) {
          setSession(null);
          setCheckedPath(path);
          setState(
            e instanceof PortalError && e.status === 401 ? 'out' : 'error',
          );
        }
      });
    const focus = () => setReload((v) => v + 1);
    window.addEventListener('focus', focus);
    window.addEventListener('nexo-auth-change', focus);
    return () => {
      active = false;
      window.removeEventListener('focus', focus);
      window.removeEventListener('nexo-auth-change', focus);
    };
  }, [path, reload, bypass]);
  useEffect(() => {
    if (
      role === 'student' &&
      state === 'out' &&
      checkedPath === path &&
      path.startsWith('/student/assignments/')
    )
      router.replace('/student');
  }, [role, state, path, checkedPath, router]);
  useEffect(() => {
    if (session?.role !== 'guardian' || !session.fresh) return;
    const timer = setTimeout(
      () =>
        setSession((s) =>
          s?.role === 'guardian' ? { ...s, fresh: false } : s,
        ),
      Math.max(0, session.freshUntil - Date.now() + 10),
    );
    return () => clearTimeout(timer);
  }, [session]);
  async function logout() {
    try {
      await authRequest('/sign-out', {});
      setLogoutError('');
      refresh();
      router.refresh();
    } catch {
      setLogoutError('Afmelden is niet bevestigd. Probeer opnieuw.');
    }
  }
  if (bypass) return children;
  if (state === 'loading' || state === 'error')
    return (
      <SignInPage
        role={role}
        help={
          <p>Gebruik je eigen ouderaccount of goedgekeurde leerlingbrowser.</p>
        }
      >
        <SignInNotice tone={state === 'error' ? 'error' : 'info'}>
          {state === 'loading'
            ? 'Aanmelding controleren…'
            : 'Aanmelden is nu niet beschikbaar. Controleer of de lokale app en database actief zijn.'}
        </SignInNotice>
        {state === 'error' && (
          <Button onClick={refresh}>Opnieuw proberen</Button>
        )}
      </SignInPage>
    );
  const wrong = session && session.role !== 'setup' && session.role !== role;
  if (wrong || (role === 'student' && session?.role === 'setup'))
    return (
      <SignInPage
        role={role}
        help={
          <p>
            Ouder- en leerlingaanmeldingen blijven gescheiden. Gebruik voor
            gelijktijdig testen twee browserprofielen.
          </p>
        }
      >
        <SignInNotice>
          Deze browser is aangemeld voor het{' '}
          {role === 'guardian' ? 'leerling' : 'ouder'}portaal. Meld je eerst af
          om van account te wisselen.
        </SignInNotice>
        <a href={role === 'guardian' ? '/student' : '/guardian'}>
          Naar je eigen portaal
        </a>
        <Button onClick={() => void logout()}>Afmelden</Button>
        {logoutError && <p role="alert">{logoutError}</p>}
      </SignInPage>
    );
  if (role === 'student') return children;
  if (state === 'out' || session?.role === 'setup')
    return (
      <GuardianSignIn
        key="sign-in"
        setup={session?.role === 'setup'}
        onDone={refresh}
      />
    );
  if (session?.role !== 'guardian') return null;
  const authoring = path.startsWith('/guardian/content');
  if (authoring && !session.operator)
    return (
      <SignInPage
        role="guardian"
        help={<a href="/guardian">Terug naar je portaal</a>}
      >
        <SignInNotice>
          Je account heeft geen toegang tot inhoudsbeheer.
        </SignInNotice>
        <Button onClick={() => void logout()}>Afmelden</Button>
      </SignInPage>
    );
  if ((authoring || path === '/guardian/access') && !session.fresh)
    return <GuardianSignIn key="reverify" reverify onDone={refresh} />;
  return (
    <GuardianContext value={session}>
      <GuardianAccountProvider
        name={session.name}
        actions={
          <>
            <Button
              size="small"
              variant="ghost"
              iconOnly
              aria-label="Afmelden"
              title="Afmelden"
              onClick={() => void logout()}
            >
              <LogOut size={19} aria-hidden="true" />
            </Button>
            {logoutError && <p role="alert">{logoutError}</p>}
          </>
        }
      >
        {children}
      </GuardianAccountProvider>
    </GuardianContext>
  );
}
