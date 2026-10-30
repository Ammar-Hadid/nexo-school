'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import { ReviewTime, type ReviewTransport } from '../review/review-time';
import { canonicalJson } from '../content-records';
import {
  familyDecision,
  type FamilyDraft,
  type FamilyReviewState,
} from './family-review-contract';
import { FamilyScope } from './family-scope';
import { FamilyEvidence } from './family-evidence';
import { FamilyExamples } from './family-examples';
import { FamilyDecisionForm } from './family-decision';
import styles from './family-review.module.css';
import { guardianHref as href } from '@/modules/identity/portal/guardian-links';
import { GuardianPageHeading } from '@/components/guardian-ui/guardian-ui';
import { SubjectIcon } from '@/components/guardian-ui/subject-icon';
import { subjectForTitle } from '@/modules/guardian/subject-presentation';
export function FamilyReviewWorkspace({
  initial,
  send,
  preview = false,
}: {
  initial: FamilyReviewState;
  send: ReviewTransport;
  preview?: boolean;
}) {
  const [state, setState] = useState(initial),
    [draft, setDraft] = useState(initial.draft),
    [step, setStep] = useState(
      initial.draft.examples.length === initial.package.examples.length
        ? 2
        : initial.draft.examples.length
          ? 1
          : 0,
    ),
    [index, setIndex] = useState(
      Math.max(
        0,
        initial.package.examples.findIndex(
          (e) => !initial.draft.examples.includes(e.index),
        ),
      ),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [confirmed, setConfirmed] = useState(false);
  const dirty = canonicalJson(draft) !== canonicalJson(state.draft),
    pkg = state.package;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function change(next: FamilyDraft) {
    setDraft(next);
    setConfirmed(false);
    setMessage('');
  }
  function go(next: number) {
    setStep(next);
    requestAnimationFrame(() =>
      document.getElementById('family-step')?.focus(),
    );
  }
  async function save(action: 'save' | 'record') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = (await send({
        action,
        packageHash: state.packageHash,
        revision: state.revision,
        draft,
        ...(action === 'record' ? { confirmed } : {}),
      })) as FamilyReviewState;
      setState(result);
      setDraft(result.draft);
      setConfirmed(false);
      setMessage(
        action === 'save'
          ? 'Voortgang opgeslagen. Je kunt later verder.'
          : 'Beoordeling vastgelegd. Automatische publicatie blijft uit.',
      );
    } catch {
      setError(
        'Niet opgeslagen. Je invoer blijft hier staan. Controleer je aanmelding en verbinding. Bij een nieuw pakket of een wijziging in een ander tabblad moet je herladen; bewaar eerst je notities.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.shell}>
      <GuardianNavigation
        appearance="workspace"
        current="admin"
        mobileNavigation="bottom"
        accountLabel="Ouder"
        contextNote="Eenmalige familiereview"
        mainContent
        hrefFor={href}
        onNavigate={(d) => {
          if (!preview) window.location.assign(href(d));
        }}
      >
        <div className={styles.page}>
          <GuardianPageHeading
            title={pkg.title}
            description={`${pkg.examples.length} voorbeelden · ${pkg.criteria.length} oordelen · circa ${pkg.reviewEstimateMinutes} minuten (schatting)`}
            context={
              <span className={styles.subjectContext}>
                <SubjectIcon
                  subject={subjectForTitle(pkg.title)}
                  size="small"
                />
                Oefenmateriaal / Familiebeoordeling
              </span>
            }
          >
            <ReviewTime initialMs={state.activeMs} send={send} />
          </GuardianPageHeading>
          <p className={styles.note}>
            {preview
              ? 'Demo: beslissingen zijn gesimuleerd; vernieuwen reset alles.'
              : 'Je beoordeling wordt lokaal opgeslagen.'}{' '}
            Deze eenmalige reviewtijd staat los van je wekelijkse
            voorraadreview.
          </p>
          <p>
            <a
              href={
                preview
                  ? '/?path=/story/content-question-supply--first-week'
                  : '/guardian/content/supply'
              }
              target={preview ? '_top' : undefined}
            >
              ← Terug naar oefenvoorraad
            </a>
          </p>
          {!preview && (
            <details className={styles.details}>
              <summary>Andere familie beoordelen</summary>
              <p>
                <a href="?package=spelling-doubling-workflow-v3">
                  Spelling · medeklinkerverdubbeling
                </a>
              </p>
              <p>
                <a href="/guardian/content/spelling">
                  Spelling · oefenset beoordelen
                </a>
              </p>
              <p>
                <a href="?package=addition-digits-teaching-v2">
                  Cijfers 0–9 · nieuwe uitleg
                </a>
              </p>
              <p>
                <a href="?package=addition-two-digits-v1">
                  Twee cijfers · tot 100
                </a>
              </p>
            </details>
          )}
          <nav className={styles.steps} aria-label="Familiereview stappen">
            {['1. Afbakening', '2. Voorbeelden', '3. Mijn oordeel'].map(
              (label, n) => (
                <button
                  key={label}
                  disabled={busy}
                  type="button"
                  aria-current={step === n ? 'step' : undefined}
                  onClick={() => go(n)}
                >
                  {label}
                </button>
              ),
            )}
          </nav>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {message && <p role="status">{message}</p>}
          <fieldset
            disabled={busy}
            className={styles.content}
            id="family-step"
            tabIndex={-1}
          >
            <legend className={styles.srOnly}>Actieve reviewstap</legend>
            {step === 0 && <FamilyScope pkg={pkg} onExamples={() => go(1)} />}
            {step === 1 && (
              <FamilyExamples
                pkg={pkg}
                seen={draft.examples}
                index={index}
                onIndex={setIndex}
                onSeen={(id) => {
                  change({
                    ...draft,
                    examples: [...new Set([...draft.examples, id])],
                  });
                  if (index === pkg.examples.length - 1) go(2);
                  else setIndex(index + 1);
                }}
              />
            )}
            {step === 2 && (
              <FamilyDecisionForm
                pkg={pkg}
                draft={draft}
                change={change}
                confirmed={confirmed}
                onConfirm={setConfirmed}
              />
            )}
          </fieldset>
          <footer className={styles.actions}>
            <span>
              {draft.examples.length}/{pkg.examples.length} bekeken ·{' '}
              {dirty
                ? 'Niet-opgeslagen wijzigingen'
                : state.revision
                  ? 'Voortgang opgeslagen'
                  : 'Nog geen beoordeling vastgelegd'}
            </span>
            <Button
              variant="outline"
              loading={busy}
              onClick={() => void save('save')}
            >
              Voortgang opslaan
            </Button>
            {step === 2 && (
              <Button
                loading={busy}
                disabled={
                  !confirmed || familyDecision(draft, pkg) === 'incomplete'
                }
                onClick={() => void save('record')}
              >
                Beoordeling vastleggen
              </Button>
            )}
          </footer>
          <FamilyEvidence state={state} />
        </div>
      </GuardianNavigation>
    </div>
  );
}
