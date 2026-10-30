'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { guardianHref } from '@/modules/identity/portal/guardian-links';
import { useGuardian } from '@/modules/identity/portal/portal-access';
import { Button } from '@/components/button/button';
import { GuardianNavigation } from '@/components/guardian-navigation/guardian-navigation';
import { ContentDeliveryWorkspace } from './content-delivery-workspace';
import type { DeliveryOverview, DeliveryImpact } from './delivery-contract';
import styles from '../supply/supply.module.css';
export async function deliveryRequest(
  body?: unknown,
): Promise<DeliveryOverview | DeliveryImpact | { id: string }> {
  const r = await fetch('/api/guardian/content-delivery', {
    cache: 'no-store',
    ...(body
      ? {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      : {}),
  });
  if (!r.ok)
    throw new Error(
      'Niet bevestigd. Controleer je verbinding en recente beheerderaanmelding, en probeer opnieuw.',
    );
  return r.json();
}
export function SavedContentDelivery() {
  const router = useRouter();
  const guardian = useGuardian();
  const [data, setData] = useState<DeliveryOverview | null>(null),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    void deliveryRequest()
      .then((d) => {
        if (active) setData(d as DeliveryOverview);
      })
      .catch(() => {
        if (active)
          setError(
            'Meld je aan met je lokale beheeraccount en recente tweestapsverificatie, of probeer opnieuw.',
          );
      });
    return () => {
      active = false;
    };
  }, [reload]);
  if (data)
    return (
      <ContentDeliveryWorkspace
        initial={data}
        command={deliveryRequest}
        refresh={async () => (await deliveryRequest()) as DeliveryOverview}
        assign={async (input) => {
          const r = await fetch('/api/practice/assignments', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(input),
            cache: 'no-store',
          }).catch(() => {
            throw new Error(
              'Toewijzing niet bevestigd. Probeer dezelfde aanvraag opnieuw.',
            );
          });
          const body = await r.json();
          if (!r.ok)
            throw new Error(
              body.error === 'CONTENT_SHORTAGE'
                ? `Er ontbreken ${body.shortage} geschikte oefeningen (${body.available} beschikbaar). Er is geen sessie aangemaakt.`
                : 'Toewijzing niet bevestigd. Probeer dezelfde aanvraag opnieuw.',
            );
          return body;
        }}
      />
    );
  return (
    <GuardianNavigation
      appearance="workspace"
      current="planning"
      accountLabel={guardian?.name ?? 'Ouder'}
      contextNote="Opgeslagen oefensessies"
      mainContent
      mobileNavigation="bottom"
      hrefFor={guardianHref}
      onNavigate={(d) => router.push(guardianHref(d))}
    >
      <div className={styles.page}>
        <h1>Opgeslagen oefensessies</h1>
        <p role="status">{error || 'Voorraad ophalen…'}</p>
        <Button onClick={() => setReload((n) => n + 1)}>Opnieuw laden</Button>
      </div>
    </GuardianNavigation>
  );
}
