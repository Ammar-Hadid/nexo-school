'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Info,
  KeyRound,
  Pencil,
  ShieldCheck,
  Tablet,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/button/button';
import {
  GuardianFeedback,
  GuardianPanel,
  GuardianStatus,
  GuardianTextLink,
} from '@/components/guardian-ui/guardian-ui';
import {
  guardianSubjects,
  SubjectIcon,
  type GuardianSubject,
} from '@/components/guardian-ui/subject-icon';
import styles from '../guardian-workspace.module.css';
import local from './planning-settings.module.css';

const sections = [
  { id: 'general', label: 'Algemeen', icon: UserRound },
  { id: 'learner', label: 'Leerling', icon: GraduationCap },
  { id: 'notifications', label: 'Meldingen', icon: Bell },
  { id: 'security', label: 'Beveiliging', icon: ShieldCheck },
] as const;
type Section = (typeof sections)[number]['id'];
type Profile = { name: string; email: string };
const notificationOptions = [
  {
    key: 'summary',
    title: 'Dagelijkse samenvatting',
    description: 'Een overzicht na het oefenen.',
  },
  {
    key: 'attention',
    title: 'Wanneer iets aandacht vraagt',
    description: 'Bij een probleem of een sessie om samen te bekijken.',
  },
  {
    key: 'weekly',
    title: 'Weekoverzicht',
    description: 'De gemaakte sessies van de afgelopen week.',
  },
] as const;
type Notifications = Record<
  (typeof notificationOptions)[number]['key'],
  boolean
>;
const notificationDefaults: Notifications = {
  summary: true,
  attention: true,
  weekly: false,
};

/** All edits are in-memory demonstrations, never account or notification writes. */
export function SettingsPreview({
  onPlanning,
  onNameChange,
}: {
  onPlanning: () => void;
  onNameChange?: (name: string) => void;
}) {
  const [section, setSection] = useState<Section>('general');
  const [profile, setProfile] = useState<Profile>({
    name: 'Ammar',
    email: 'ammar@example.com',
  });
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [previousProfile, setPreviousProfile] = useState<Profile>();
  const [profileMessage, setProfileMessage] = useState('');
  const [notifications, setNotifications] = useState(notificationDefaults);
  const [notificationDraft, setNotificationDraft] =
    useState(notificationDefaults);
  const [previousNotifications, setPreviousNotifications] =
    useState<Notifications>();
  const [notificationMessage, setNotificationMessage] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const confirmation = useRef<HTMLDivElement>(null);
  const accessButton = useRef<HTMLButtonElement>(null);
  const profileInput = useRef<HTMLInputElement>(null);
  const profileButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const notificationDirty =
    JSON.stringify(notificationDraft) !== JSON.stringify(notifications);
  const show = (target: Section) => section === 'general' || section === target;
  useEffect(() => {
    if (revoking) confirmation.current?.focus();
  }, [revoking]);
  useEffect(() => {
    if (editing) profileInput.current?.focus();
  }, [editing]);
  function leaveProfile() {
    setEditing(false);
    requestAnimationFrame(() => profileButton.current?.focus());
  }

  return (
    <div className={styles.settings}>
      <nav className={styles.settingsNav} aria-label="Instellingenonderdelen">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={section === item.id}
            onClick={() => setSection(item.id)}
          >
            <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className={styles.stack}>
        <div className={styles.equalGrid}>
          {section === 'general' && (
            <GuardianPanel
              title="Profiel"
              icon={UserRound}
              action={
                !editing && (
                  <Button
                    ref={profileButton}
                    variant="outline"
                    size="small"
                    onClick={() => {
                      setDraft(profile);
                      setEditing(true);
                    }}
                    startIcon={<Pencil size={15} />}
                  >
                    Profiel bewerken
                  </Button>
                )
              }
            >
              {profileMessage && (
                <div className={local.feedbackSpace}>
                  <GuardianFeedback
                    title={profileMessage}
                    undo={
                      previousProfile
                        ? {
                            onClick: () => {
                              setProfile(previousProfile);
                              setDraft(previousProfile);
                              onNameChange?.(previousProfile.name);
                              setPreviousProfile(undefined);
                              setProfileMessage(
                                'Profielwijziging teruggezet. Je vorige voorbeeldgegevens staan er weer.',
                              );
                            },
                            disabled: editing,
                          }
                        : undefined
                    }
                  />
                </div>
              )}
              {editing ? (
                <form
                  className={local.profileForm}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const next = {
                      name: draft.name.trim(),
                      email: draft.email.trim(),
                    };
                    if (!next.name) {
                      profileInput.current?.setCustomValidity(
                        'Vul een naam in.',
                      );
                      profileInput.current?.reportValidity();
                      return;
                    }
                    setPreviousProfile(profile);
                    setProfile(next);
                    setDraft(next);
                    onNameChange?.(next.name);
                    leaveProfile();
                    setProfileMessage(
                      'Profiel opgeslagen in dit voorbeeld. Je kunt verder bij de instellingen hieronder.',
                    );
                  }}
                >
                  <div className={local.profileFields}>
                    <label className={styles.field} htmlFor={`${id}-name`}>
                      Naam
                      <input
                        id={`${id}-name`}
                        ref={profileInput}
                        maxLength={80}
                        required
                        value={draft.name}
                        onChange={(event) => {
                          event.target.setCustomValidity('');
                          setDraft({ ...draft, name: event.target.value });
                        }}
                      />
                    </label>
                    <label className={styles.field} htmlFor={`${id}-email`}>
                      E-mail
                      <input
                        id={`${id}-email`}
                        type="email"
                        required
                        value={draft.email}
                        onChange={(event) =>
                          setDraft({ ...draft, email: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <p>
                    Je past alleen dit voorbeeld aan. Je echte aanmelding en
                    e-mailadres veranderen niet.
                  </p>
                  <div className={styles.actions}>
                    <Button type="submit">Profiel opslaan</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setDraft(profile);
                        leaveProfile();
                        setProfileMessage(
                          'Bewerking geannuleerd. Je voorbeeldprofiel is niet gewijzigd.',
                        );
                      }}
                    >
                      Annuleren
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className={styles.person}>
                    <span className={styles.childAvatar}>
                      <UserRound
                        size={25}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                    <div>
                      <h3>{profile.name}</h3>
                      <p>Ouder / beheerder</p>
                    </div>
                  </div>
                  <dl className={styles.settingRows}>
                    <div>
                      <dt>E-mail</dt>
                      <dd>{profile.email}</dd>
                    </div>
                    <div>
                      <dt>Taal</dt>
                      <dd>Nederlands</dd>
                    </div>
                    <div>
                      <dt>Tijdzone</dt>
                      <dd>Amsterdam</dd>
                    </div>
                  </dl>
                </>
              )}
            </GuardianPanel>
          )}
          {show('learner') && (
            <GuardianPanel
              title="Adam"
              icon={GraduationCap}
              action={<GuardianStatus>Voorbeeldleerling</GuardianStatus>}
            >
              <div className={styles.person}>
                <span className={styles.childAvatar}>A</span>
                <div>
                  <h3>Adam</h3>
                  <p>Leerling · Groep 6</p>
                </div>
              </div>
              <dl className={styles.settingRows}>
                <div>
                  <dt>Huidige groep</dt>
                  <dd>Groep 6</dd>
                </div>
                <div>
                  <dt>Oefenen</dt>
                  <dd>In zijn eigen leerlingportaal</dd>
                </div>
                <div>
                  <dt>Toegang</dt>
                  <dd>
                    {revoked
                      ? 'Opnieuw aanmelden nodig'
                      : 'Voorbeeldtablet gekoppeld'}
                  </dd>
                </div>
              </dl>
              <GuardianTextLink onClick={() => setSection('security')}>
                Browsertoegang bekijken
              </GuardianTextLink>
            </GuardianPanel>
          )}
          {show('learner') && (
            <GuardianPanel title="Vakken" icon={BookOpen}>
              <p className={local.sectionIntro}>
                Dezelfde herkenbare iconen in het hele ouderportaal.
              </p>
              <ul className={local.subjectList}>
                {(Object.keys(guardianSubjects) as GuardianSubject[]).map(
                  (subject) => (
                    <li key={subject}>
                      <SubjectIcon subject={subject} size="small" />
                      <span>{guardianSubjects[subject].label}</span>
                      <small>
                        {subject === 'rekenen'
                          ? 'Ook Redactiesommen'
                          : 'Eigen oefensessies'}
                      </small>
                    </li>
                  ),
                )}
              </ul>
              <GuardianTextLink onClick={onPlanning}>
                Aantal sessies per vak instellen
              </GuardianTextLink>
            </GuardianPanel>
          )}
          {show('learner') && (
            <GuardianPanel title="Planning" icon={CalendarDays}>
              <p className={local.sectionIntro}>
                Een vaste week, met ruimte om een losse dag aan te passen.
              </p>
              <div className={local.settingDetail}>
                <CalendarDays size={20} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Weekritme en losse dagen</strong>
                  <p>
                    Bekijk je bewaarde voorbeeldritme in Planning. Het blijft
                    staan als je hier terugkomt.
                  </p>
                </div>
              </div>
              <div className={local.settingDetail}>
                <Info size={20} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Eerst bekijken, dan wijzigen</strong>
                  <p>
                    Je ziet vooraf wat er verandert en wanneer de wijziging
                    ingaat.
                  </p>
                </div>
              </div>
              <GuardianTextLink onClick={onPlanning}>
                Weekplanning openen
              </GuardianTextLink>
            </GuardianPanel>
          )}
          {show('notifications') && (
            <GuardianPanel title="Meldingen" icon={Bell}>
              <p className={local.sectionIntro}>
                Kies wat je wilt terugzien. Dit voorbeeld verstuurt geen
                berichten.
              </p>
              {notificationMessage && (
                <div className={local.feedbackSpace}>
                  <GuardianFeedback
                    title={notificationMessage}
                    undo={
                      previousNotifications
                        ? {
                            disabled: notificationDirty,
                            onClick: () => {
                              setNotifications(previousNotifications);
                              setNotificationDraft(previousNotifications);
                              setPreviousNotifications(undefined);
                              setNotificationMessage(
                                'Meldingsvoorkeuren teruggezet. Je vorige keuzes gelden weer in dit voorbeeld.',
                              );
                            },
                          }
                        : undefined
                    }
                  />
                </div>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setPreviousNotifications(notifications);
                  setNotifications(notificationDraft);
                  setNotificationMessage(
                    'Meldingsvoorkeuren opgeslagen in dit voorbeeld. Je kunt verder bij je overige instellingen.',
                  );
                }}
              >
                {notificationOptions.map((option) => (
                  <label className={styles.toggleRow} key={option.key}>
                    <span>
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>
                    <input
                      className={local.checkbox}
                      type="checkbox"
                      checked={notificationDraft[option.key]}
                      onChange={(event) =>
                        setNotificationDraft({
                          ...notificationDraft,
                          [option.key]: event.target.checked,
                        })
                      }
                    />
                  </label>
                ))}
                {notificationDirty && (
                  <div className={local.notificationActions}>
                    <Button type="submit" size="small">
                      Meldingen opslaan
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        setNotificationDraft(notifications);
                        setNotificationMessage(
                          'Wijzigingen geannuleerd. Je meldingsvoorkeuren zijn niet gewijzigd.',
                        );
                      }}
                    >
                      Wijzigingen annuleren
                    </Button>
                  </div>
                )}
              </form>
            </GuardianPanel>
          )}
          {show('security') && (
            <GuardianPanel title="Beveiliging en toegang" icon={ShieldCheck}>
              <div className={local.settingDetail}>
                <KeyRound size={20} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Je eigen aanmelding</strong>
                  <p>
                    Ouder- en leerlingtoegang blijven gescheiden. Accountbeheer
                    en herstel zijn bereikbaar in het opgeslagen portaal.
                  </p>
                </div>
              </div>
              <div className={local.browserRow}>
                <Tablet size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Adams tablet</strong>
                  <p>
                    {revoked
                      ? 'Toegang ingetrokken in dit voorbeeld'
                      : 'Gekoppelde voorbeeldbrowser'}
                  </p>
                </div>
                <GuardianStatus tone={revoked ? 'negative' : 'positive'}>
                  {revoked ? 'Ingetrokken' : 'Actief'}
                </GuardianStatus>
              </div>
              {revoked ? (
                <GuardianFeedback
                  title="Toegang ingetrokken in dit voorbeeld"
                  tone="warning"
                  next={
                    <GuardianTextLink href="http://localhost:3060/guardian/access">
                      Browser opnieuw aanmelden
                    </GuardianTextLink>
                  }
                >
                  <p>
                    De tablet kan niet verder oefenen. Eerdere antwoorden
                    blijven bewaard. Dit kun je niet ongedaan maken; meld de
                    browser opnieuw aan en keur hem opnieuw goed.
                  </p>
                </GuardianFeedback>
              ) : revoking ? (
                <div
                  className={styles.confirmation}
                  ref={confirmation}
                  tabIndex={-1}
                >
                  <h3>Toegang van deze tablet intrekken?</h3>
                  <p>
                    Adam kan op deze browser niet verder oefenen. Opgeslagen
                    antwoorden blijven bewaard.
                  </p>
                  <p>
                    Deze actie is niet terug te draaien: opnieuw gebruiken
                    vereist een nieuwe browseraanmelding en jouw goedkeuring.
                  </p>
                  <div className={styles.actions}>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setRevoked(true);
                        setRevoking(false);
                      }}
                    >
                      Toegang intrekken in voorbeeld
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setRevoking(false);
                        requestAnimationFrame(() =>
                          accessButton.current?.focus(),
                        );
                      }}
                    >
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  ref={accessButton}
                  variant="outline"
                  size="small"
                  onClick={() => setRevoking(true)}
                >
                  Browsertoegang beheren
                </Button>
              )}
              <details className={styles.details}>
                <summary>Account, beveiliging en herstel</summary>
                <p>
                  Je bestaande account, extra verificatie, herstelmogelijkheden
                  en leerlingbeheer blijven beschikbaar. Dit ontwerp gebruikt
                  geen echte accountgegevens.
                </p>
                <GuardianTextLink href="http://localhost:3060/guardian/access">
                  Open bestaande instellingen
                </GuardianTextLink>
              </details>
            </GuardianPanel>
          )}
        </div>
      </div>
    </div>
  );
}
