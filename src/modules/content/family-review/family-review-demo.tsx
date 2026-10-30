'use client';
import { useCallback, useRef, useState } from 'react';
import spellingPackage from './spelling-doubling-workflow-v3.json';
import digits from './addition-digits-v2.json';
import twoDigits from './addition-two-digits-v1.json';
import {
  emptyFamilyDraft,
  familyDecision,
  type FamilyDraft,
  type FamilyReviewState,
} from './family-review-contract';
import { FamilyReviewWorkspace } from './family-review-workspace';
export function FamilyReviewDemo({
  fail = false,
  resume = false,
  twoDigit = false,
  spelling = false,
}: {
  fail?: boolean;
  resume?: boolean;
  twoDigit?: boolean;
  spelling?: boolean;
}) {
  const pkg = spelling ? spellingPackage : twoDigit ? twoDigits : digits;
  const [initial] = useState<FamilyReviewState>(() => ({
    package: pkg,
    packageHash: 'synthetic-preview-not-a-certificate',
    revision: resume ? 1 : 0,
    draft: {
      ...emptyFamilyDraft(pkg),
      ...(resume
        ? {
            examples: pkg.examples.slice(0, 2).map((e) => e.index),
            notes: 'Opgeslagen voorbeeldnotitie.',
          }
        : {}),
    },
    activeMs: 0,
    history: [],
    automaticPublication: false,
  }));
  const data = useRef(structuredClone(initial)),
    base = useRef(0);
  const send = useCallback(
    async (input: Record<string, unknown>) => {
      if (fail) throw new Error('SYNTHETIC_FAILURE');
      if (input.action === 'start-time') {
        base.current = data.current.activeMs;
        return { sessionId: 'synthetic-timer', activeMs: base.current };
      }
      if (input.action === 'time') {
        data.current.activeMs = base.current + Number(input.sessionMs);
        return { activeMs: data.current.activeMs };
      }
      if (input.revision !== data.current.revision)
        throw new Error('STALE_DEMO');
      const draft = structuredClone(input.draft as FamilyDraft),
        revision = data.current.revision + 1;
      data.current = { ...data.current, draft, revision };
      if (input.action === 'record')
        data.current.history.unshift({
          id: `synthetic-${revision}`,
          revision,
          outcome: familyDecision(draft, data.current.package),
          createdAt: new Date().toISOString(),
          reviewerId: 'synthetic-demo-reviewer',
          snapshot: JSON.stringify(draft),
        });
      return structuredClone(data.current);
    },
    [fail],
  );
  return <FamilyReviewWorkspace initial={initial} send={send} preview />;
}
