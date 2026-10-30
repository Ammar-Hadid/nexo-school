'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button/button';
import styles from './review.module.css';
export type ReviewTransport = (
  body: Record<string, unknown>,
) => Promise<unknown>;
export function ReviewTime({
  initialMs,
  send,
}: {
  initialMs: number;
  send: ReviewTransport;
}) {
  const [active, setActive] = useState(false),
    [saved, setSaved] = useState(initialMs),
    [live, setLive] = useState(initialMs),
    [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const savedRef = useRef(initialMs);
  const session = useRef<{
    base: number;
    id: string;
    sequence: number;
    ms: number;
    last: number;
    interaction: number;
  } | null>(null);
  const pending = useRef(Promise.resolve());
  function pulse(stop = false) {
    const s = session.current;
    if (!s) return;
    const now = Math.min(performance.now(), s.interaction + 60000);
    s.ms += Math.max(0, Math.floor(now - s.last));
    s.last = now;
    s.sequence++;
    setLive(s.base + s.ms);
    const payload = {
      action: 'time',
      sessionId: s.id,
      sequence: s.sequence,
      sessionMs: s.ms,
    };
    if (stop) {
      session.current = null;
      setActive(false);
    }
    pending.current = pending.current.then(async () => {
      try {
        const r = (await send(payload)) as { activeMs: number };
        savedRef.current = r.activeMs;
        setSaved(r.activeMs);
      } catch {
        session.current = null;
        setActive(false);
        setLive(savedRef.current);
        setError(
          'Tijdmeting gestopt: opslaan is niet bevestigd. Start opnieuw zodra je verbinding en aanmelding werken.',
        );
      }
    });
  }
  useEffect(() => {
    if (!active) return;
    const touch = () => {
      if (session.current) session.current.interaction = performance.now();
    };
    const pause = () => pulse(true);
    const visibility = () => {
      if (document.hidden) pause();
    };
    const interval = window.setInterval(() => pulse(), 10000);
    const clock = window.setInterval(() => {
      if (
        session.current &&
        performance.now() - session.current.interaction >= 60000
      )
        pulse(true);
      else if (session.current) {
        const s = session.current;
        setLive(s.base + s.ms + Math.max(0, performance.now() - s.last));
      }
    }, 250);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', pause);
    window.addEventListener('pagehide', pause);
    window.addEventListener('pointerdown', touch);
    window.addEventListener('keydown', touch);
    window.addEventListener('scroll', touch, true);
    return () => {
      clearInterval(interval);
      clearInterval(clock);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', pause);
      window.removeEventListener('pagehide', pause);
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
      window.removeEventListener('scroll', touch, true);
    };
    // The active interval owns its session; send is a stable transport supplied by the host.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, send]);
  return (
    <section className={styles.time} aria-label="Beoordelingstijd">
      <div className={styles.clockReadout}>
        <span className={styles.clockLabel}>
          {active ? 'Beoordelingstijd · loopt' : 'Beoordelingstijd'}
        </span>
        <span
          role="timer"
          aria-label="Actieve beoordelingstijd"
          className={styles.clockDigits}
        >
          {formatTime(live)}
        </span>
        <small>Opgeslagen: {formatTime(saved)}</small>
      </div>
      <Button
        variant="ghost"
        size="small"
        title="Pauzeert ook bij verlaten van het venster of na één minuut zonder interactie."
        aria-label={active ? 'Pauzeer tijdmeting' : 'Start tijdmeting'}
        loading={busy}
        onClick={async () => {
          if (active) {
            pulse(true);
            return;
          }
          setBusy(true);
          setError('');
          await pending.current;
          try {
            const r = (await send({ action: 'start-time' })) as {
              sessionId: string;
              activeMs: number;
            };
            const now = performance.now();
            session.current = {
              base: r.activeMs,
              id: r.sessionId,
              sequence: 0,
              ms: 0,
              last: now,
              interaction: now,
            };
            savedRef.current = r.activeMs;
            setSaved(r.activeMs);
            setLive(r.activeMs);
            setActive(true);
          } catch {
            setError('Tijdmeting kon niet starten.');
          } finally {
            setBusy(false);
          }
        }}
      >
        {active ? 'Pauzeer' : 'Start'}
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
