'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { SignInPage } from '@/modules/identity/sign-in/sign-in-page';
import { SupplyWorkspace } from './supply-overview';
import type { SupplyOverview } from './supply-contract';
async function prepare(demand: number) {
  const r = await fetch('/api/guardian/content-supply', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'prepare', demand }),
    cache: 'no-store',
  });
  if (!r.ok) throw new Error('SUPPLY_FAILED');
  return r.json();
}
export function SavedSupply() {
  const [data, setData] = useState<SupplyOverview | null>(null),
    [state, setState] = useState('loading'),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    void fetch('/api/guardian/content-supply', {
      signal: c.signal,
      cache: 'no-store',
    })
      .then(async (r) => {
        if (!r.ok) {
          setState(r.status === 401 || r.status === 403 ? 'auth' : 'error');
          return;
        }
        setData(await r.json());
      })
      .catch(() => {
        if (!c.signal.aborted) setState('error');
      });
    return () => c.abort();
  }, [retry]);
  return data ? (
    <SupplyWorkspace initial={data} prepare={prepare} />
  ) : (
    <SignInPage
      role="guardian"
      help={
        <p>
          Deze lokale proef vereist je beheeraccount met recente
          tweestapsverificatie.
        </p>
      }
    >
      <SignInNotice tone={state === 'error' ? 'error' : 'info'}>
        {state === 'loading'
          ? 'Voorraad ophalen…'
          : state === 'auth'
            ? 'Meld je opnieuw aan met je beheeraccount en tweestapsverificatie.'
            : 'Voorraad niet beschikbaar.'}
      </SignInNotice>
      <Button
        onClick={() => {
          setState('loading');
          setRetry((n) => n + 1);
        }}
      >
        Opnieuw controleren
      </Button>
    </SignInPage>
  );
}
