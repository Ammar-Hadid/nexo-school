'use client';
import type { ReactNode } from 'react';
import { Button } from '@/components/button/button';
import {
  SignInLayout,
  SignInNotice,
} from '@/components/sign-in-layout/sign-in-layout';
import styles from './sign-in.module.css';

export type SignInRole = 'student' | 'guardian';
const copy = {
  student: {
    context: 'Voor leerlingen',
    title: 'Welkom terug.',
    description:
      'Klaar om iets nieuws te ontdekken? Meld je aan en ga verder met jouw taken.',
    welcome: {
      eyebrow: 'Jouw plek om te groeien',
      title: 'Kleine stappen.',
      accent: 'Grote ontdekkingen.',
      description:
        'Rekenen, lezen en taal. Ontdek wat je al kunt en leer elke dag iets nieuws.',
    },
  },
  guardian: {
    context: 'Voor ouders',
    title: 'Fijn dat je er bent.',
    description:
      'Meld je aan en blijf betrokken bij de leerstappen van je kind.',
    welcome: {
      eyebrow: 'Samen aan de volgende stap',
      title: 'Ruimte om te leren.',
      accent: 'Aandacht om te groeien.',
      description:
        'Kijk mee, vier nieuwe ontdekkingen en help je kind met vertrouwen verder.',
    },
  },
} as const;

/** Role-specific copy around a method-independent shared layout. */
export function SignInPage({
  role,
  children,
  help,
  footer,
}: {
  role: SignInRole;
  children: ReactNode;
  help: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SignInLayout {...copy[role]} help={help} footer={footer}>
      {children}
    </SignInLayout>
  );
}

export type DeviceSignInState =
  'ready' | 'checking' | 'busy' | 'error' | 'unavailable';
/** The current method adapter; no passkey assumptions live in SignInLayout/SignInPage. */
export function DeviceSignIn({
  state = 'ready',
  onSignIn,
  onRetry,
}: {
  state?: DeviceSignInState;
  onSignIn: () => void;
  onRetry?: () => void;
}) {
  const pending = state === 'checking' || state === 'busy';
  return (
    <div className={styles.method}>
      <div className={styles.device}>
        <span className={styles.deviceIcon} aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <rect x="6" y="4" width="20" height="17" rx="3" />
            <path d="M3 26h26M12 21l-1 5m9-5 1 5M13 12l2 2 4-4" />
          </svg>
        </span>
        <div>
          <strong>Jouw vertrouwde apparaat</strong>
          <p>Gebruik je passkey om verder te gaan.</p>
        </div>
      </div>
      {state === 'error' && (
        <SignInNotice tone="error">
          Aanmelden is niet gelukt. Probeer het opnieuw op je goedgekeurde
          browser.
        </SignInNotice>
      )}
      {state === 'unavailable' ? (
        <>
          <SignInNotice>
            Aanmelden is nu niet beschikbaar. Probeer het later opnieuw.
          </SignInNotice>
          {onRetry && (
            <Button fullWidth variant="outline" onClick={onRetry}>
              Opnieuw proberen
            </Button>
          )}
        </>
      ) : (
        <Button
          size="large"
          fullWidth
          loading={pending}
          onClick={onSignIn}
          endIcon={<span aria-hidden="true">→</span>}
        >
          {state === 'checking'
            ? 'Even controleren…'
            : state === 'busy'
              ? 'Bezig met aanmelden…'
              : 'Aanmelden'}
        </Button>
      )}
      <p className={styles.methodNote}>
        Je apparaat helpt je veilig aanmelden.
      </p>
    </div>
  );
}

export function DeviceSignInHelp({ role }: { role: SignInRole }) {
  return (
    <details>
      <summary>Hulp nodig bij aanmelden?</summary>
      <p>
        {role === 'student'
          ? 'Gebruik de browser die je ouder voor je heeft goedgekeurd. Lukt het niet? Vraag je ouder om even mee te kijken.'
          : 'Gebruik het apparaat waarop je je passkey hebt ingesteld. Je browser begeleidt je bij het aanmelden.'}
      </p>
    </details>
  );
}
