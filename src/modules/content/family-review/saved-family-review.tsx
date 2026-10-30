'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { SignInPage } from '@/modules/identity/sign-in/sign-in-page';
import { FamilyReviewWorkspace } from './family-review-workspace';
import type { FamilyReviewState } from './family-review-contract';
function endpoint() {
  const version = new URL(window.location.href).searchParams.get('package');
  return (
    '/api/guardian/family-review' +
    (version ? `?package=${encodeURIComponent(version)}` : '')
  );
}
async function send(body: Record<string, unknown>) {
  const r = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    keepalive: body.action === 'time',
  });
  if (!r.ok) throw new Error('FAMILY_REVIEW_FAILED');
  return r.json();
}
export function SavedFamilyReview() {
  const [data, setData] = useState<FamilyReviewState | null>(null),
    [status, setStatus] = useState('loading'),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    void fetch(endpoint(), {
      signal: c.signal,
      cache: 'no-store',
    })
      .then(async (r) => {
        if (!r.ok) {
          setStatus(r.status === 401 || r.status === 403 ? 'auth' : 'error');
          return;
        }
        setData(await r.json());
      })
      .catch(() => {
        if (!c.signal.aborted) setStatus('error');
      });
    return () => c.abort();
  }, [retry]);
  return data ? (
    <FamilyReviewWorkspace initial={data} send={send} />
  ) : (
    <SignInPage
      role="guardian"
      help={
        <p>
          Deze lokale review vereist je beheeraccount met recente
          tweestapsverificatie.
        </p>
      }
    >
      <SignInNotice tone={status === 'error' ? 'error' : 'info'}>
        {status === 'loading'
          ? 'Reviewpakket ophalen…'
          : status === 'auth'
            ? 'Meld je opnieuw aan met je beheeraccount en tweestapsverificatie.'
            : 'Het reviewpakket is niet beschikbaar of gewijzigd.'}
      </SignInNotice>
      <Button
        onClick={() => {
          setStatus('loading');
          setRetry((n) => n + 1);
        }}
      >
        Opnieuw controleren
      </Button>
    </SignInPage>
  );
}
