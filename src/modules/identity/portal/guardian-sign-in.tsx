'use client';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import { TextField } from '@/components/text-field/text-field';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { SignInPage } from '../sign-in/sign-in-page';
import { authRequest } from './portal-client';
import styles from './portal.module.css';
type Stage = 'login' | 'code' | 'setup' | 'setup-code' | 'replace' | 'reset';
export function GuardianSignIn({
  onDone,
  reverify = false,
  setup = false,
}: {
  onDone: () => void;
  reverify?: boolean;
  setup?: boolean;
}) {
  const [stage, setStage] = useState<Stage>(
    setup ? 'setup' : reverify ? 'code' : 'login',
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [backup, setBackup] = useState(false),
    [material, setMaterial] = useState<{
      totpURI: string;
      backupCodes: string[];
    } | null>(null);
  const [saved, setSaved] = useState(false);
  async function submit(form: HTMLFormElement) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    const f = new FormData(form);
    try {
      if (stage === 'login') {
        const result = await authRequest<{ twoFactorRedirect?: boolean }>(
          '/sign-in/email',
          { email: f.get('email'), password: f.get('password') },
        );
        form.reset();
        setStage(result.twoFactorRedirect ? 'code' : 'setup');
      } else if (stage === 'setup' || stage === 'replace') {
        setMaterial(
          await authRequest(
            stage === 'replace' ? '/recover-totp' : '/two-factor/enable',
            { password: f.get('password') },
          ),
        );
        form.reset();
        setSaved(false);
        setStage('setup-code');
      } else if (stage === 'reset') {
        await authRequest('/request-password-reset', {
          email: f.get('email'),
          redirectTo: `${window.location.origin}/guardian/reset-password`,
        });
        setNotice(
          'Als het account bestaat, staat de herstelmail in de privé lokale testmailbox. Er is geen e-mail verstuurd.',
        );
      } else {
        await authRequest(
          backup ? '/two-factor/verify-backup-code' : '/two-factor/verify-totp',
          { code: String(f.get('code')).trim() },
        );
        form.reset();
        setMaterial(null);
        if (backup) {
          setStage('replace');
          setBackup(false);
        } else onDone();
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Aanmelden niet gelukt. Probeer opnieuw.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SignInPage
      role="guardian"
      help={
        <p>
          Gebruik je lokale synthetische ouderaccount. Met een herstelcode kun
          je je authenticator vervangen.{' '}
          <a href="/student">Naar het leerlingportaal</a>
        </p>
      }
    >
      <form
        className={styles.fields}
        onSubmit={(e) => {
          e.preventDefault();
          void submit(e.currentTarget);
        }}
      >
        {reverify && (
          <SignInNotice>
            Bevestig je aanmelding opnieuw om verder te gaan. Je opgeslagen werk
            blijft bewaard.
          </SignInNotice>
        )}
        {stage === 'login' && (
          <>
            <TextField
              label="E-mailadres"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
            <TextField
              label="Wachtwoord"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </>
        )}
        {(stage === 'setup' || stage === 'replace') && (
          <>
            <SignInNotice>
              {stage === 'replace'
                ? 'Je herstelcode is geaccepteerd. Stel nu een nieuwe authenticator in.'
                : 'Stel tweestapsverificatie in voordat je het ouderportaal opent.'}
            </SignInNotice>
            <TextField
              label="Wachtwoord"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </>
        )}
        {material && (
          <section
            className={styles.fields}
            aria-label="Authenticator instellen"
          >
            <p>
              Voeg in je authenticator-app een account toe met deze geheime
              sleutel. Kies tijdgebaseerde codes.
            </p>
            <TextField
              label="Authenticator-sleutel"
              value={new URL(material.totpURI).searchParams.get('secret') ?? ''}
              readOnly
              autoComplete="off"
            />
            <p>
              Bewaar deze eenmalige herstelcodes privé. Ze worden hier één keer
              getoond.
            </p>
            <pre className={styles.codes}>
              {material.backupCodes.join('\n')}
            </pre>
            <label>
              <input
                type="checkbox"
                checked={saved}
                onChange={(e) => setSaved(e.target.checked)}
                required
              />{' '}
              Ik heb mijn herstelcodes veilig bewaard.
            </label>
          </section>
        )}
        {(stage === 'code' || stage === 'setup-code') && (
          <TextField
            key={backup ? 'backup' : 'totp'}
            label={backup ? 'Herstelcode' : 'Authenticatorcode'}
            name="code"
            autoComplete="one-time-code"
            inputMode={backup ? 'text' : 'numeric'}
            pattern={backup ? undefined : '[0-9]{6}'}
            required
          />
        )}
        {stage === 'reset' && (
          <TextField
            label="E-mailadres"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        )}
        {error && <SignInNotice tone="error">{error}</SignInNotice>}
        {notice && <p role="status">{notice}</p>}
        <Button
          fullWidth
          type="submit"
          loading={busy}
          disabled={stage === 'setup-code' && !saved}
        >
          {stage === 'login'
            ? 'Aanmelden als ouder'
            : stage === 'setup' || stage === 'replace'
              ? 'Authenticator instellen'
              : stage === 'reset'
                ? 'Herstelmail aanvragen'
                : 'Code bevestigen'}
        </Button>
        {stage === 'code' && (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setBackup(!backup);
              setError('');
            }}
          >
            {backup ? 'Gebruik authenticatorcode' : 'Gebruik een herstelcode'}
          </Button>
        )}
        {stage === 'login' && (
          <Button variant="ghost" onClick={() => setStage('reset')}>
            Wachtwoord vergeten
          </Button>
        )}
        {(stage === 'reset' || stage === 'replace') && (
          <Button
            variant="ghost"
            onClick={() => {
              if (stage === 'replace') onDone();
              else setStage('login');
            }}
          >
            {stage === 'replace'
              ? 'Later instellen, naar het portaal'
              : 'Terug naar aanmelden'}
          </Button>
        )}
      </form>
    </SignInPage>
  );
}
