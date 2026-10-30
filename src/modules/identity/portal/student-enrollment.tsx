'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthClient } from 'better-auth/react';
import { passkeyClient } from '@better-auth/passkey/client';
import { Button } from '@/components/button/button';
import { TextField } from '@/components/text-field/text-field';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { SignInPage } from '../sign-in/sign-in-page';
import { authRequest } from './portal-client';
import styles from './portal.module.css';
const auth = createAuthClient({ plugins: [passkeyClient()] });
type Enrollment = { state: string; enrollmentId?: string; label?: string };
export function StudentEnrollment() {
  const router = useRouter();
  const [grant, setGrant] = useState<Enrollment | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function refresh() {
    try {
      setGrant(await authRequest<Enrollment>('/student/enrollment'));
      setError('');
    } catch {
      setError('Browserstatus niet beschikbaar. Probeer opnieuw.');
    }
  }
  useEffect(() => {
    let active = true;
    void authRequest<Enrollment>('/student/enrollment')
      .then((g) => {
        if (active) setGrant(g);
      })
      .catch(() => {
        if (active)
          setError('Browserstatus niet beschikbaar. Probeer opnieuw.');
      });
    return () => {
      active = false;
    };
  }, []);
  async function act(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await work();
    } catch {
      setError(
        'Niet gelukt. Controleer de oudergoedkeuring en probeer opnieuw. Bij een verlopen aanvraag kun je opnieuw beginnen.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SignInPage
      role="student"
      help={
        <p>
          Een ouder keurt deze browser één keer goed. Daarna meld je je
          zelfstandig aan met je passkey. Gebruik een apart browserprofiel voor
          het ouderportaal.
        </p>
      }
    >
      <div className={styles.fields}>
        <h2>Deze browser aanmelden</h2>
        {(!grant || ['none', 'expired', 'revoked'].includes(grant.state)) && (
          <form
            className={styles.fields}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void act(async () => {
                await authRequest('/student/enroll', { label: f.get('label') });
                await refresh();
              });
            }}
          >
            <TextField
              label="Naam van deze browser"
              name="label"
              placeholder="Bijvoorbeeld: testbrowser leerling"
              maxLength={80}
              required
            />
            <Button type="submit" loading={busy}>
              Goedkeuring aanvragen
            </Button>
          </form>
        )}
        {grant?.state === 'pending' && (
          <>
            <SignInNotice>
              Laat je ouder deze aanvraag goedkeuren in het ouderportaal bij
              Accounts en browsers. Vergelijk de volledige aanmeldcode. De
              aanvraag verloopt na tien minuten.
            </SignInNotice>
            <TextField
              label="Aanmeldcode"
              readOnly
              value={grant.enrollmentId ?? ''}
            />
            <p>Browser: {grant.label}</p>
            <Button onClick={() => void refresh()}>
              Goedkeuring controleren
            </Button>
          </>
        )}
        {grant?.state === 'approved' && (
          <>
            <SignInNotice>
              Je ouder heeft deze browser goedgekeurd. Maak nu je passkey aan,
              of gebruik je bestaande passkey.
            </SignInNotice>
            <Button
              loading={busy}
              onClick={() =>
                void act(async () => {
                  const r = await auth.passkey.addPasskey({
                    context: grant.enrollmentId,
                  });
                  if (r.error) throw Error();
                  await refresh();
                })
              }
            >
              Passkey aanmaken
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void act(async () => {
                  const r = await auth.signIn.passkey();
                  if (r.error) throw Error();
                  router.push('/student');
                })
              }
            >
              Bestaande passkey gebruiken
            </Button>
          </>
        )}
        {grant?.state === 'active' && (
          <>
            <SignInNotice>
              Deze browser is klaar. Je kunt je aanmelden met je passkey.
            </SignInNotice>
            <a href="/student">Verder naar leerlingaanmelding</a>
          </>
        )}
        {grant?.state === 'registering' && (
          <SignInNotice>
            De registratie is nog niet bevestigd. Controleer opnieuw.
          </SignInNotice>
        )}
        {error && <SignInNotice tone="error">{error}</SignInNotice>}
        <div className={styles.links}>
          <a href="/student">Terug naar leerlingportaal</a>
          <Button variant="ghost" onClick={() => void refresh()}>
            Status opnieuw laden
          </Button>
        </div>
      </div>
    </SignInPage>
  );
}
