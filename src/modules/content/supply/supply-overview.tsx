'use client';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import {
  GuardianPageHeading,
  GuardianTextLink,
} from '@/components/guardian-ui/guardian-ui';
import { SubjectIcon } from '@/components/guardian-ui/subject-icon';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import type { SupplyOverview } from './supply-contract';
import styles from './supply.module.css';
import { PracticeFlow } from '../practice-flow';
import { guardianHref } from '@/modules/identity/portal/guardian-links';
const href = guardianHref;
export function SupplyWorkspace({
  initial,
  prepare,
  preview = false,
}: {
  initial: SupplyOverview;
  prepare: (demand: number) => Promise<SupplyOverview>;
  preview?: boolean;
}) {
  const [data, setData] = useState(initial),
    [demand, setDemand] = useState(
      String(initial.planned ? initial.demand : 2),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false);
  return (
    <div className={styles.shell}>
      <GuardianNavigation
        appearance="workspace"
        current="admin"
        mobileNavigation="bottom"
        accountLabel="Ouder"
        contextNote="Lokale voorraadproef"
        mainContent
        hrefFor={href}
        onNavigate={(d) => {
          if (!preview) window.location.assign(href(d));
        }}
      >
        <div className={styles.page}>
          <GuardianPageHeading
            title="Oefenvoorraad"
            description="Bereid oefeningen voor, bekijk de voorraad en rond je beoordeling af."
            context={
              <span className={styles.subjectContext}>
                <SubjectIcon subject="rekenen" size="small" />
                Rekenen · Optellen met twee cijfers van 0–9
              </span>
            }
          >
            <span className={styles.weekLabel}>Week vanaf {data.week}</span>
          </GuardianPageHeading>
          <div className={styles.contentNav}>
            <GuardianTextLink href="/guardian/content/spelling">
              Spellingbank beoordelen
            </GuardianTextLink>
            <GuardianTextLink href="/guardian/content/rehearsal/taal">
              Taalproefset beoordelen
            </GuardianTextLink>
            <GuardianTextLink href="/guardian/content/rehearsal/redactiesommen">
              Redactiesommen beoordelen
            </GuardianTextLink>
            <GuardianTextLink href="/guardian/content/rehearsal/reading">
              Leesproefset beoordelen
            </GuardianTextLink>
            <GuardianTextLink href="/guardian/content/supply/family">
              Eenmalige familiereview
            </GuardianTextLink>
          </div>
          <PracticeFlow
            appearance="workspace"
            current={data.pending ? 1 : data.ready ? 2 : 0}
            title={
              data.pending
                ? `${data.pending} oefeningen te beoordelen`
                : data.ready
                  ? 'Je voorraad is klaar voor de volgende stap'
                  : 'Begin met een kleine set'
            }
            action={
              data.pending
                ? {
                    label: 'Beoordeel de kleine set',
                    href: preview
                      ? '/?path=/story/content-question-supply--review-example'
                      : '/guardian/content/supply/review',
                  }
                : data.ready
                  ? {
                      label: 'Een sessie klaarzetten',
                      href: '/guardian/content/assignments',
                    }
                  : undefined
            }
          >
            <p>
              {data.pending
                ? 'Bekijk de oefeningen, keur je selectie goed en publiceer die. Daarna kun je een sessie klaarzetten.'
                : data.ready
                  ? 'Er is gepubliceerde voorraad. Op de volgende pagina kies je voor wie en hoeveel oefeningen.'
                  : 'Twee oefeningen zijn genoeg om de hele route te proberen. Kies hieronder Kleine set voorbereiden.'}
            </p>
          </PracticeFlow>
          <section
            aria-label="Oefeningen voorbereiden"
            className={styles.preparation}
          >
            <form
              className={styles.form}
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError('');
                setSaved(false);
                try {
                  setData(await prepare(Number(demand)));
                  setSaved(true);
                } catch {
                  setError(
                    'Niet opgeslagen. Controleer je verbinding en recente aanmelding, en probeer opnieuw.',
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                Oefeningen voor deze proefweek
                <input
                  type="number"
                  min={1}
                  max={600}
                  step={1}
                  required
                  value={demand}
                  onChange={(e) => {
                    setDemand(e.target.value);
                    setSaved(false);
                  }}
                />
              </label>
              <Button
                type="submit"
                loading={busy}
                variant={data.planned ? 'outline' : 'primary'}
              >
                {data.planned
                  ? 'Voorraad opnieuw plannen'
                  : 'Kleine set voorbereiden'}
              </Button>
            </form>
            {error && <p role="alert">{error}</p>}
            {saved && (
              <p role="status">
                {preview ? 'Demo bijgewerkt.' : 'Weekvoorraad opgeslagen.'} Je
                kunt nu verder via de volgende stap bovenaan. Er is nog geen
                sessie toegewezen.
              </p>
            )}
          </section>
          <details className={styles.details}>
            <summary>Voorraad, weeklimiet en reviewtijd</summary>
            <p>
              {data.admitted} / 10 nieuwe versies toegelaten. Maximaal 8 nieuwe
              oefeningen plus ruimte voor correcties.
            </p>
            <p>
              Gemeten: {Math.floor(data.measuredMs / 60000)}m{' '}
              {Math.floor(data.measuredMs / 1000) % 60}s
            </p>
            <dl className={styles.metrics}>
              <div>
                <dt>Gevraagd deze week</dt>
                <dd>{data.demand}</dd>
              </div>
              <div>
                <dt>Beschikbaar uit beoordeelde voorraad</dt>
                <dd>{data.ready}</dd>
              </div>
              <div>
                <dt>Nog niet beschikbaar</dt>
                <dd>{data.shortage}</dd>
              </div>
            </dl>
            {data.shortage > 0 && (
              <p className={styles.shortage}>
                Er ontbreken nog {data.shortage} oefeningen. De reviewlimiet
                blijft staan; de aanvraag wordt niet automatisch gevuld met
                herhalingen of ongekeurde inhoud.
              </p>
            )}
          </details>
          <details className={styles.details}>
            <summary>Hoe blijven reviewwerk en herhaling begrensd?</summary>
            <ul>
              <li>
                Maximaal 10 nieuwe of gewijzigde versies per week. De schatting
                is 90 seconden per versie; dit is nog geen bewezen reviewtijd.
              </li>
              <li>
                Openstaand werk gaat mee naar de volgende week. Gemeten
                reviewtijd vanaf 15 minuten stopt nieuwe toelating.
              </li>
              <li>
                Een omgedraaide som telt als dezelfde oefening.
                Proefreserveringen van de laatste 14 dagen blokkeren hergebruik;
                een bestaande weekplanning behoudt haar versies.
              </li>
              <li>
                {data.bank} gepubliceerde versies in de bank;{' '}
                {data.recentGroups} recent gebruikte somgroepen. Alleen oefenen,
                geen toets- of retentievoorraad.
              </li>
            </ul>
          </details>
          <details className={styles.details}>
            <summary>Over deze lokale test en familiereview</summary>
            <p>
              Deze ene familie bevat 55 verschillende somgroepen. Nieuwe
              varianten worden nog niet automatisch gepubliceerd. Deze lokale
              proef gebruikt geen AI en wijst niets toe aan een kind.
            </p>
            <p>
              De volledige categorie en automatische dagelijkse toewijzing
              volgen in aparte stappen. Gepubliceerde versies kun je nu apart
              toewijzen of intrekken.
            </p>
            <p>
              <a
                target={preview ? '_top' : undefined}
                href={
                  preview
                    ? '/?path=/story/content-family-certification--review-family'
                    : '/guardian/content/supply/family'
                }
              >
                Open de eenmalige familiereview →
              </a>
            </p>
          </details>
        </div>
      </GuardianNavigation>
    </div>
  );
}
