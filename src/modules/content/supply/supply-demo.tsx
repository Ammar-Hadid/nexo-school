'use client';
import { useState } from 'react';
import { SupplyWorkspace } from './supply-overview';
import type { SupplyOverview } from './supply-contract';
import { reviewCapacity, supplyLimits } from './supply-policy';
import type { ReviewBatch } from '../review/review-contract';
export const emptySupply: SupplyOverview = {
  week: '2026-10-19',
  planned: false,
  demand: 20,
  ready: 0,
  readyIds: [],
  shortage: 20,
  pending: 0,
  admitted: 0,
  capacity: 10,
  measuredMs: 0,
  estimatedMs: 0,
  bank: 0,
  recentGroups: 0,
  certification: 'pending',
  automaticPublication: false,
  purpose: 'local-synthetic-practice',
};
/** Synthetic UI states only, never production inventory or approval evidence. */
export function SupplyDemo({
  reused = false,
  exhausted = false,
  fail = false,
}: {
  reused?: boolean;
  exhausted?: boolean;
  fail?: boolean;
}) {
  const [initial] = useState<SupplyOverview>(() => ({
    ...emptySupply,
    ...(reused
      ? { planned: true, demand: 6, ready: 6, shortage: 0, bank: 8 }
      : {}),
    ...(exhausted
      ? {
          planned: true,
          demand: 600,
          pending: 8,
          admitted: 10,
          capacity: 0,
          shortage: 600,
          estimatedMs: 720000,
          measuredMs: 900000,
        }
      : {}),
  }));
  const [data, setData] = useState(initial);
  async function prepare(demand: number) {
    if (fail) throw new Error('DEMO_FAILED');
    const ready = Math.min(data.bank, demand),
      shortage = demand - ready;
    const added = Math.min(
      data.capacity,
      Math.max(0, 8 - data.admitted),
      Math.max(0, shortage - data.pending),
    );
    const pending = data.pending + added,
      admitted = data.admitted + added;
    const next = {
      ...data,
      demand,
      planned: true,
      ready,
      shortage,
      pending,
      admitted,
      capacity: reviewCapacity(admitted, pending, 0, data.measuredMs),
      estimatedMs: pending * supplyLimits.estimateMs,
    };
    setData(next);
    return next;
  }
  return <SupplyWorkspace initial={initial} prepare={prepare} preview />;
}
export const supplyReviewExample: ReviewBatch = {
  id: 'synthetic-optellen-story',
  title: 'Optellen — twee voorbeelden van de kleine set',
  supply: true,
  cursor: null,
  activeMs: 0,
  items: [
    { a: 2, b: 3 },
    { a: 4, b: 7 },
  ].map(({ a, b }, i) => ({
    id: `demo-${i}`,
    contentId: `demo-sum-${i}`,
    contentHash: `synthetic-hash-${i}`,
    revision: 1,
    title: `${a} + ${b} =`,
    objective: 'Optellen · twee cijfers 0–9 (synthetisch deelgebied)',
    payload: {
      schemaVersion: 'exercise-v2',
      learner: { prompt: `${a} + ${b} =`, passage: '', options: [] },
      privateEvaluation: {
        acceptedAnswers: [String(a + b)],
        explanation: `Tel ${b} op bij ${a}. ${a} + ${b} = ${a + b}.`,
        gradingRules: ['Vul het gehele getal in.'],
      },
      rights: 'project-authored-synthetic',
      provenance: 'Storybook example; no educational approval',
    },
    rules: {
      version: 'exercise-checks-v1',
      response: 'open',
      optionCount: 0,
      context: 'none',
      passageWords: null,
      requiredPromptTerms: [],
      calculation: { operation: 'sum', operands: [a, b], unit: null },
    },
    checks: [],
    decision: 'pending',
    published: false,
    advisory: {
      status: 'clear',
      text: 'Vaste rekencontrole; geen educatieve goedkeuring. Controleer de volledige oefening.',
      sourceHash: `synthetic-hash-${i}`,
      provenance: 'deterministic-check',
    },
  })),
};
