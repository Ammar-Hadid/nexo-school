'use client';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import { TextField } from '@/components/text-field/text-field';
import { SignInPage } from '../sign-in/sign-in-page';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { authRequest } from './portal-client';
import styles from './portal.module.css';
export function PasswordReset({ token }: { token?: string }) {
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState('');
  return (
    <SignInPage
      role="guardian"
      help={
        <p>
          Tweestapsverificatie blijft verplicht na het wijzigen van je
          wachtwoord.
        </p>
      }
    >
      {done ? (
        <>
          <SignInNotice>
            Wachtwoord gewijzigd. Meld je opnieuw aan.
          </SignInNotice>
          <a href="/guardian">Naar aanmelden</a>
        </>
      ) : !token ? (
        <>
          <SignInNotice tone="error">
            Deze herstellink is ongeldig of verlopen.
          </SignInNotice>
          <a href="/guardian">Vraag een nieuwe herstellink aan</a>
        </>
      ) : (
        <form
          className={styles.fields}
          onSubmit={(e) => {
            e.preventDefault();
            if (busy) return;
            const f = new FormData(e.currentTarget);
            if (f.get('password') !== f.get('confirm')) {
              setError('De wachtwoorden zijn niet gelijk.');
              return;
            }
            setBusy(true);
            setError('');
            void authRequest('/reset-password', {
              token,
              newPassword: f.get('password'),
            })
              .then(() => {
                window.history.replaceState(
                  null,
                  '',
                  '/guardian/reset-password',
                );
                setDone(true);
              })
              .catch(() =>
                setError(
                  'Wachtwoord niet gewijzigd. Controleer je wachtwoord of vraag een nieuwe herstellink aan.',
                ),
              )
              .finally(() => setBusy(false));
          }}
        >
          <TextField
            label="Nieuw wachtwoord"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={16}
            maxLength={128}
          />
          <TextField
            label="Herhaal nieuw wachtwoord"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
          />
          {error && <p role="alert">{error}</p>}
          <Button type="submit" loading={busy}>
            Wachtwoord opslaan
          </Button>
        </form>
      )}
    </SignInPage>
  );
}
