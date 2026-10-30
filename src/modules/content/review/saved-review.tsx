'use client';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import { SignInNotice } from '@/components/sign-in-layout/sign-in-layout';
import { SignInPage } from '@/modules/identity/sign-in/sign-in-page';
import type { ReviewBatch } from './review-contract';
import { ReviewWorkspace } from './review-workspace';
async function sendTo(url: string, body: Record<string, unknown>) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    keepalive: body.action === 'time',
  });
  if (!r.ok) {
    const failure = await r.json().catch(() => null);
    throw new Error(
      failure?.error === 'REVIEW_LIMIT' ? 'REVIEW_LIMIT' : 'REVIEW_NOT_SAVED',
    );
  }
  return r.json();
}
export function SavedContentReview({
  supply = false,
  spelling = false,
  rehearsal,
}: {
  supply?: boolean;
  spelling?: boolean;
  rehearsal?: 'taal' | 'redactiesommen' | 'reading';
}) {
  const url =
    '/api/guardian/content-review' +
    (supply
      ? '?batch=optellen'
      : spelling
        ? '?batch=spelling-doubling'
        : rehearsal
          ? `?batch=d14-s5-${rehearsal}-v1`
          : '');
  const send = useCallback(
    (body: Record<string, unknown>) => sendTo(url, body),
    [url],
  );
  const [batch, setBatch] = useState<ReviewBatch | null>(null),
    [state, setState] = useState('loading'),
    [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          setState(r.status === 401 || r.status === 403 ? 'auth' : 'error');
          return;
        }
        setBatch(await r.json());
      })
      .catch(() => {
        if (!controller.signal.aborted) setState('error');
      });
    return () => controller.abort();
  }, [reload, url]);
  return batch ? (
    <ReviewWorkspace
      initialBatch={batch}
      send={send}
      assignable={supply || spelling || Boolean(rehearsal)}
    />
  ) : (
    <SignInPage
      role="guardian"
      help={
        <p>
          Deze lokale proef vereist het bestaande beheeraccount met recente
          tweestapsverificatie. Je opgeslagen werk blijft bewaard.
        </p>
      }
    >
      <SignInNotice tone={state === 'error' ? 'error' : 'info'}>
        {state === 'loading'
          ? 'Beoordelingsset ophalen…'
          : state === 'auth'
            ? 'Meld je opnieuw aan met je beheeraccount en tweestapsverificatie.'
            : 'De lokale beoordelingsomgeving is niet beschikbaar.'}
      </SignInNotice>
      <Button
        onClick={() => {
          setState('loading');
          setReload((n) => n + 1);
        }}
      >
        Opnieuw controleren
      </Button>
    </SignInPage>
  );
}
