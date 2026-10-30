'use client';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import { TextField } from '@/components/text-field/text-field';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import {
  DeviceSignIn,
  DeviceSignInHelp,
  SignInPage,
  type SignInRole,
  type DeviceSignInState,
} from './sign-in-page';
import styles from './sign-in.module.css';

type Method = 'device' | 'password' | 'code';
/** Storybook-only concept forms. No credential persistence, networking or auth claims. */
function ConceptForm({ method }: { method: Exclude<Method, 'device'> }) {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className={styles.fields}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      {method === 'password' ? (
        <>
          <TextField
            label="E-mailadres"
            type="email"
            autoComplete="off"
            placeholder="naam@voorbeeld.nl"
            required
          />
          <TextField
            label="Wachtwoord"
            type={visible ? 'text' : 'password'}
            autoComplete="off"
            required
          />
          <div className={styles.passwordOption}>
            <Button
              variant="ghost"
              size="small"
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              {visible ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
            </Button>
          </div>
        </>
      ) : (
        <TextField
          label="Jouw toegangscode"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="123456"
          hint="Vul de zes cijfers van je code in."
          required
        />
      )}
      <Button
        type="submit"
        fullWidth
        size="large"
        endIcon={<span aria-hidden="true">→</span>}
      >
        Aanmelden
      </Button>
      {submitted && (
        <SignInNotice>
          Dit is een ontwerpreview. Je gegevens worden niet verstuurd en je bent
          niet aangemeld.
        </SignInNotice>
      )}
    </form>
  );
}

export function SignInReview({
  initialRole = 'student',
  initialMethod = 'device',
  initialState = 'ready',
  controls = true,
}: {
  initialRole?: SignInRole;
  initialMethod?: Method;
  initialState?: DeviceSignInState;
  controls?: boolean;
}) {
  const [role, setRole] = useState(initialRole);
  const [method, setMethod] = useState(initialMethod);
  const [state, setState] = useState(initialState);
  const [previewClicked, setPreviewClicked] = useState(false);
  return (
    <>
      {controls && (
        <div
          className={styles.reviewBar}
          role="region"
          aria-label="Ontwerpinstellingen"
        >
          <div className={styles.reviewTitle}>
            <strong>Aanmelden · Ontwerpreview</strong>
            <span>
              Ontwerp goedgekeurd · Gebruik alleen fictieve gegevens · Geen
              echte aanmelding
            </span>
          </div>
          <label>
            Weergave
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as SignInRole);
                setPreviewClicked(false);
              }}
            >
              <option value="student">Leerling</option>
              <option value="guardian">Ouder</option>
            </select>
          </label>
          <label>
            Methode
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value as Method);
                setPreviewClicked(false);
              }}
            >
              <option value="device">Apparaat / passkey</option>
              <option value="password">Wachtwoord · concept</option>
              <option value="code">Toegangscode · concept</option>
            </select>
          </label>
          {method === 'device' && (
            <label>
              Status
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value as DeviceSignInState);
                  setPreviewClicked(false);
                }}
              >
                <option value="ready">Klaar</option>
                <option value="checking">Controleren</option>
                <option value="busy">Bezig</option>
                <option value="error">Mislukt</option>
                <option value="unavailable">Niet beschikbaar</option>
              </select>
            </label>
          )}
        </div>
      )}
      <SignInPage
        role={role}
        footer={
          <span>
            Ontwerpreview · Ontwerp goedgekeurd
            {method !== 'device' && ' · Methode nog niet gekozen'}
          </span>
        }
        help={
          method === 'device' ? (
            <DeviceSignInHelp role={role} />
          ) : (
            <details>
              <summary>Hulp nodig bij aanmelden?</summary>
              <p>
                Dit aanmeldformulier is een ontwerpvoorbeeld. Hoe je een account
                of code krijgt, werken we later uit.
              </p>
            </details>
          )
        }
      >
        {method === 'device' ? (
          <>
            <DeviceSignIn
              state={state}
              onSignIn={() => setPreviewClicked(true)}
              onRetry={() => {
                setState('ready');
                setPreviewClicked(false);
              }}
            />
            {previewClicked && (
              <SignInNotice>
                Dit is een ontwerpreview. Er wordt geen echte aanmelding
                gestart.
              </SignInNotice>
            )}
          </>
        ) : (
          <ConceptForm key={`${role}-${method}`} method={method} />
        )}
      </SignInPage>
    </>
  );
}
