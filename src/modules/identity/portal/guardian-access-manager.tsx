'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button/button';
import { TextField } from '@/components/text-field/text-field';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import { guardianHref, useGuardian } from './portal-access';
import { authRequest, portalRequest } from './portal-client';
import {
  ArrowLeft,
  Info,
  KeyRound,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import {
  GuardianEmpty,
  GuardianFeedback,
  GuardianPageHeading,
  GuardianPanel,
  GuardianStatus,
  GuardianTextLink,
} from '@/components/guardian-ui/guardian-ui';
import styles from './guardian-pages.module.css';
type Student = { id: string; displayName: string; canManage: boolean };
type BrowserGrant = {
  id: string;
  label: string;
  state: string;
  expiresAt: string;
};
export function GuardianAccessManager() {
  const guardian = useGuardian(),
    router = useRouter();
  const [students, setStudents] = useState<Student[]>([]),
    [studentId, setStudent] = useState(''),
    [browsers, setBrowsers] = useState<BrowserGrant[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [loadingStudents, setLoadingStudents] = useState(true),
    [loadingBrowsers, setLoadingBrowsers] = useState(true),
    [section, setSection] = useState('guardian-profile');
  async function load() {
    const rows = await portalRequest<Student[]>('/api/identity/students');
    setStudents(rows.filter((s) => s.canManage));
    setStudent((id) => id || rows.find((s) => s.canManage)?.id || '');
  }
  useEffect(() => {
    let active = true;
    void portalRequest<Student[]>('/api/identity/students')
      .then((rows) => {
        if (active) {
          setStudents(rows.filter((s) => s.canManage));
          setStudent(rows.find((s) => s.canManage)?.id ?? '');
          setLoadingStudents(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Leerlingen ophalen niet gelukt.');
          setLoadingStudents(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!studentId) return;
    let active = true;
    void authRequest<BrowserGrant[]>('/student/browsers', { studentId })
      .then((rows) => {
        if (active) {
          setBrowsers(rows);
          setLoadingBrowsers(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoadingBrowsers(false);
          setError(
            'Browsers ophalen niet gelukt. Controleer je recente aanmelding.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [studentId, notice]);
  async function act(work: () => Promise<string>) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      setNotice(await work());
    } catch {
      setError(
        'Niet bevestigd. Controleer je gegevens en recente aanmelding, en probeer opnieuw.',
      );
      window.dispatchEvent(new Event('nexo-auth-change'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <GuardianNavigation
      appearance="workspace"
      current="settings"
      mainContent
      mobileNavigation="bottom"
      accountLabel={guardian?.name ?? 'Ouder'}
      contextNote="Je accounts en browsertoegang"
      hrefFor={guardianHref}
      onNavigate={(id) => router.push(guardianHref(id))}
    >
      <div className={styles.page}>
        <GuardianPageHeading
          title="Accounts en browsers"
          description="Beheer wie er kan oefenen en welke browsers toegang hebben."
        />
        <div className={styles.settings}>
          <nav
            className={styles.settingsNav}
            aria-label="Instellingenonderdelen"
          >
            <a
              href="#guardian-profile"
              aria-current={
                section === 'guardian-profile' ? 'location' : undefined
              }
              onClick={() => setSection('guardian-profile')}
            >
              <UserRound size={18} strokeWidth={1.75} aria-hidden="true" />
              Profiel en leerling
            </a>
            <a
              href="#guardian-students"
              aria-current={
                section === 'guardian-students' ? 'location' : undefined
              }
              onClick={() => setSection('guardian-students')}
            >
              <UsersRound size={18} strokeWidth={1.75} aria-hidden="true" />
              Leerling toevoegen
            </a>
            <a
              href="#guardian-browsers"
              aria-current={
                section === 'guardian-browsers' ? 'location' : undefined
              }
              onClick={() => setSection('guardian-browsers')}
            >
              <MonitorSmartphone
                size={18}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Browsertoegang
            </a>
            <a
              href="#guardian-security"
              aria-current={
                section === 'guardian-security' ? 'location' : undefined
              }
              onClick={() => setSection('guardian-security')}
            >
              <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
              Beveiliging
            </a>
          </nav>
          <div className={styles.settingsContent}>
            {error && (
              <GuardianFeedback tone="negative" title={error}>
                <p>
                  Er is geen nieuwe wijziging bevestigd. Je invoer blijft staan.
                  Controleer je aanmelding en probeer opnieuw.
                </p>
              </GuardianFeedback>
            )}
            {notice && (
              <GuardianFeedback title={notice}>
                <p>
                  {notice === 'Testleerling toegevoegd.'
                    ? 'Koppel nu de leerlingbrowser hieronder. Je hoeft deze leerling niet opnieuw toe te voegen.'
                    : notice === 'Browsertoegang ingetrokken.'
                      ? 'Opgeslagen antwoorden blijven bewaard. Ongedaan maken kan niet: vraag vanuit de leerlingbrowser opnieuw goedkeuring aan.'
                      : 'Je opgeslagen oefensessies en antwoorden blijven bewaard.'}
                </p>
              </GuardianFeedback>
            )}
            <div id="guardian-profile" className={styles.profileGrid}>
              <GuardianPanel title="Jouw profiel" icon={UserRound}>
                <div className={styles.profile}>
                  <span className={styles.avatar}>
                    <UserRound
                      size={25}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h3>{guardian?.name ?? 'Ouder'}</h3>
                    <p>
                      Ouder{guardian?.operator ? ' / inhoudsbeheerder' : ''}
                    </p>
                  </div>
                </div>
                <dl className={styles.rows}>
                  <div>
                    <dt>Omgeving</dt>
                    <dd>Lokale testomgeving</dd>
                  </div>
                  <div>
                    <dt>Extra verificatie</dt>
                    <dd>
                      {guardian?.fresh
                        ? 'Recent bevestigd'
                        : 'Opnieuw bevestigen bij beheer'}
                    </dd>
                  </div>
                </dl>
              </GuardianPanel>
              <GuardianPanel title="Jouw leerlingen" icon={UsersRound}>
                {loadingStudents ? (
                  <p role="status" className={styles.muted}>
                    Leerlingen ophalen…
                  </p>
                ) : students.length ? (
                  <>
                    <div className={styles.profile}>
                      <span className={styles.avatar}>
                        {students
                          .find((s) => s.id === studentId)
                          ?.displayName.slice(0, 1)
                          .toLocaleUpperCase('nl') ?? 'L'}
                      </span>
                      <div>
                        <h3>
                          {students.find((s) => s.id === studentId)
                            ?.displayName ?? 'Leerling'}
                        </h3>
                        <p>Lokale testleerling</p>
                      </div>
                    </div>
                    <p className={styles.muted}>
                      {students.length}{' '}
                      {students.length === 1 ? 'leerling' : 'leerlingen'} met
                      beheerrechten. Kies hieronder voor welke leerling je een
                      browser koppelt.
                    </p>
                  </>
                ) : (
                  <p className={styles.muted}>
                    Voeg eerst je testleerling toe. Daarna kun je een
                    leerlingbrowser koppelen.
                  </p>
                )}
                <GuardianTextLink href="#guardian-students">
                  Leerling toevoegen
                </GuardianTextLink>
              </GuardianPanel>
            </div>
            <details
              id="guardian-students"
              className={styles.panel}
              open={!students.length && !loadingStudents}
            >
              <summary>
                {students.length
                  ? 'Nog een testleerling toevoegen'
                  : 'Testleerling toevoegen'}
              </summary>
              <p className={styles.muted}>
                Voeg een testnaam toe. De leerling blijft lokaal bewaard; dit
                scherm biedt geen accountverwijdering. Hierna koppel je de
                leerlingbrowser.
              </p>
              <form
                className={styles.fields}
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget,
                    f = new FormData(form);
                  void act(async () => {
                    await portalRequest('/api/identity/students', {
                      displayName: f.get('name'),
                    });
                    form.reset();
                    await load();
                    return 'Testleerling toegevoegd.';
                  });
                }}
              >
                <TextField
                  label="Naam testleerling"
                  name="name"
                  maxLength={80}
                  required
                />
                <Button type="submit" loading={busy}>
                  Testleerling toevoegen
                </Button>
              </form>
            </details>
            <div id="guardian-browsers">
              <GuardianPanel
                title="Browser goedkeuren"
                icon={MonitorSmartphone}
              >
                {!students.length ? (
                  <GuardianEmpty title="Voeg eerst een leerling toe">
                    <p>
                      Na het toevoegen kun je de aanmeldcode uit de
                      leerlingbrowser hier invullen.
                    </p>
                  </GuardianEmpty>
                ) : (
                  <>
                    <label className={styles.field}>
                      Leerling
                      <select
                        value={studentId}
                        onChange={(e) => {
                          setBrowsers([]);
                          setStudent(e.target.value);
                        }}
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.displayName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className={styles.muted}>
                      Open het leerlingportaal in een andere browser of een
                      apart profiel. Kies Nieuwe browser aanmelden, vergelijk de
                      volledige code en vul die hieronder in. Rond de
                      passkey-registratie daarna af in de leerlingbrowser.
                    </p>
                    <form
                      className={styles.fields}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        void act(async () => {
                          await authRequest('/student/approve', {
                            studentId,
                            enrollmentId: String(f.get('enrollment')).trim(),
                          });
                          return 'Browser goedgekeurd. Ga in de leerlingbrowser verder met Goedkeuring controleren.';
                        });
                      }}
                    >
                      <TextField
                        label="Aanmeldcode van leerlingbrowser"
                        name="enrollment"
                        required
                        pattern="[0-9a-f-]{36}"
                      />
                      <Button type="submit" loading={busy}>
                        Browser goedkeuren
                      </Button>
                    </form>
                    <p className={styles.muted}>
                      Je kunt browsertoegang later hieronder intrekken.
                      Bestaande antwoorden blijven dan bewaard.
                    </p>
                  </>
                )}
              </GuardianPanel>
            </div>
            {!!students.length && (
              <GuardianPanel title="Bekende browsers" icon={MonitorSmartphone}>
                {loadingBrowsers ? (
                  <p role="status" className={styles.muted}>
                    Browsers ophalen…
                  </p>
                ) : !browsers.length ? (
                  <p className={styles.muted}>
                    Er zijn nog geen browsers gekoppeld.
                  </p>
                ) : (
                  <ul className={styles.browserList}>
                    {browsers.map((b) => (
                      <li key={b.id}>
                        <div className={styles.browserHeading}>
                          <MonitorSmartphone
                            size={21}
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                          <strong>{b.label}</strong>
                          <GuardianStatus
                            tone={
                              b.state === 'active'
                                ? 'positive'
                                : b.state === 'revoked'
                                  ? 'negative'
                                  : 'neutral'
                            }
                          >
                            {b.state === 'active'
                              ? 'Actief'
                              : b.state === 'revoked'
                                ? 'Ingetrokken'
                                : 'Wacht op registratie'}
                          </GuardianStatus>
                        </div>
                        {b.state !== 'revoked' ? (
                          <div className={styles.links}>
                            <Button
                              variant="outline"
                              disabled={busy}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Toegang voor deze browser intrekken? Opgeslagen antwoorden blijven bewaard. Ongedaan maken kan niet: opnieuw gebruiken vereist een nieuwe browseraanmelding en jouw goedkeuring.',
                                  )
                                )
                                  void act(async () => {
                                    await authRequest('/student/revoke', {
                                      studentId,
                                      browserId: b.id,
                                      scope: 'browser',
                                    });
                                    return 'Browsertoegang ingetrokken.';
                                  });
                              }}
                            >
                              Browser intrekken
                            </Button>
                            {b.state === 'active' && (
                              <Button
                                variant="outline"
                                disabled={busy}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      'Deze passkey en alle gekoppelde browsers intrekken? Opgeslagen antwoorden blijven bewaard. Dit is niet terug te draaien. Meld de leerling daarna opnieuw aan en registreer een nieuwe passkey.',
                                    )
                                  )
                                    void act(async () => {
                                      await authRequest('/student/revoke', {
                                        studentId,
                                        browserId: b.id,
                                        scope: 'credential',
                                      });
                                      return 'Passkey ingetrokken. Vraag vanuit de leerlingbrowser opnieuw goedkeuring aan.';
                                    });
                                }}
                              >
                                <KeyRound size={17} aria-hidden="true" />
                                Passkey vervangen
                              </Button>
                            )}
                          </div>
                        ) : (
                          <p className={styles.muted}>
                            Opnieuw toegang nodig? Vraag vanuit deze
                            leerlingbrowser een nieuwe aanmeldcode aan.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </GuardianPanel>
            )}
            <div id="guardian-security" className={styles.securityNote}>
              <Info size={20} strokeWidth={1.75} aria-hidden="true" />
              <p>
                Beheeracties kunnen opnieuw je authenticatorcode vragen. Ouder-
                en leerlingaanmeldingen blijven gescheiden. Toegang intrekken
                verwijdert geen opgeslagen oefenwerk.
              </p>
            </div>
            <p className={styles.returnLink}>
              <a href="/guardian">
                <ArrowLeft size={17} aria-hidden="true" />
                Terug naar je volgende stap
              </a>
            </p>
          </div>
        </div>
      </div>
    </GuardianNavigation>
  );
}
