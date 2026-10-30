'use client';
import { useCallback, useRef, useState } from 'react';
import { checkExercise, type ExercisePayload } from '../exercise-contract';
import type { ReviewBatch } from './review-contract';
import {
  reviewBatchId,
  reviewBatchTitle,
  reviewRules,
  reviewSeeds,
} from './review-fixture';
import { ReviewWorkspace } from './review-workspace';
export function demoBatch(): ReviewBatch {
  return {
    id: reviewBatchId,
    title: reviewBatchTitle,
    cursor: null,
    activeMs: 0,
    items: reviewSeeds.map((seed, i) => ({
      id: `demo-${i}-v1`,
      contentId: seed.contentId,
      contentHash: `synthetic-preview-${i}-v1`,
      revision: 1,
      title: seed.title,
      objective:
        'Werkwoordsvormen in zinnen (synthetisch voorbeeld; mapping niet gecertificeerd)',
      payload: structuredClone(seed.payload),
      rules: reviewRules,
      checks: checkExercise(seed.payload, reviewRules),
      decision: 'pending',
      published: false,
      advisory: {
        status: seed.advisory,
        text: seed.note,
        sourceHash: `synthetic-preview-${i}-v1`,
        provenance: 'synthetic-haiku-example',
      },
    })),
  };
}
/** Story-only in-memory transport. Never imported by the saved route. */
export function ReviewDemo({
  empty = false,
  fail = false,
  sample,
}: {
  empty?: boolean;
  fail?: boolean;
  sample?: ReviewBatch;
}) {
  const [initial] = useState<ReviewBatch>(
    () => sample ?? (empty ? { ...demoBatch(), items: [] } : demoBatch()),
  );
  const data = useRef<ReviewBatch>(structuredClone(initial));
  const session = useRef({ id: 'demo', base: 0 });
  const send = useCallback(
    async (body: Record<string, unknown>) => {
      if (fail) throw new Error('SYNTHETIC_FAILURE');
      if (body.action === 'initialize') data.current = demoBatch();
      if (body.action === 'cursor') {
        data.current.cursor = String(body.contentId);
        return { saved: true };
      }
      if (body.action === 'start-time') {
        session.current = {
          id: crypto.randomUUID(),
          base: data.current.activeMs,
        };
        return {
          sessionId: session.current.id,
          activeMs: data.current.activeMs,
        };
      }
      if (body.action === 'time') {
        data.current.activeMs = session.current.base + Number(body.sessionMs);
        return { activeMs: data.current.activeMs };
      }
      if (body.action === 'edit')
        data.current.items = data.current.items.map((i) =>
          i.id === body.id
            ? {
                ...i,
                id: `${i.id}-next`,
                contentHash: `${i.contentHash}-next`,
                revision: i.revision + 1,
                payload: structuredClone(body.payload as ExercisePayload),
                checks: checkExercise(body.payload, i.rules),
                decision: 'pending',
                published: false,
                advisory: {
                  ...i.advisory,
                  status: 'stale',
                  text: 'Gewijzigde versie; beoordeel de inhoud opnieuw.',
                },
              }
            : i,
        );
      if (['approve', 'reject', 'publish'].includes(String(body.action))) {
        const refs = body.refs as { id: string }[];
        data.current.items = data.current.items.map((i) =>
          refs.some((r) => r.id === i.id)
            ? {
                ...i,
                decision: body.action === 'reject' ? 'rejected' : 'approved',
                published: body.action === 'publish',
              }
            : i,
        );
      }
      return structuredClone(data.current);
    },
    [fail],
  );
  return <ReviewWorkspace initialBatch={initial} send={send} preview />;
}
