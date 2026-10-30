import { expect, it } from 'vitest';
import { benchmarkCases } from './fixtures';
import { fingerprint } from './benchmark';
import { expandedCases } from './expanded-fixtures';
import {
  expandedRequest,
  parseExpandedReview,
  summarizeExpanded,
  expandedPolicy,
  readExpandedRequest,
} from './expanded';

it('freezes balanced, family-separated screen and validation sets without replacing original fixtures', () => {
  expect(fingerprint(benchmarkCases)).toBe(
    'd1a6482afa85f1f1d256c86ef06bc49ffcd018d897afbf80092eb0db22b789f7',
  );
  expect(expandedCases).toHaveLength(80);
  expect(new Set(expandedCases.map((x) => x.candidate.id)).size).toBe(80);
  for (const split of ['screen', 'validation']) {
    const rows = expandedCases.filter((x) => x.split === split);
    expect(rows).toHaveLength(40);
    expect(rows.filter((x) => x.expected.length === 0)).toHaveLength(20);
    for (const stratum of [
      'arithmetic',
      'word-problems',
      'taal',
      'spelling',
      'reading',
    ])
      expect(rows.filter((x) => x.stratum === stratum)).toHaveLength(8);
  }
  const screen = new Set(
    expandedCases.filter((x) => x.split === 'screen').map((x) => x.family),
  );
  expect(
    expandedCases
      .filter((x) => x.split === 'validation')
      .every((x) => !screen.has(x.family)),
  ).toBe(true);
});

it('binds requests to the frozen screening manifest, hides reference labels and rejects holdout dispatch', () => {
  const c = expandedCases[0]!;
  const spec = expandedRequest(c.candidate.id, 'solve', 'gpt-6.1-sol');
  expect(readExpandedRequest(spec).candidate.id).toBe(c.candidate.id);
  const value = JSON.parse(spec);
  for (const key of [
    'answer',
    'explanation',
    'expected',
    'acceptedAnswers',
    'answerEvidence',
    'family',
  ])
    expect(value).not.toHaveProperty(key);
  expect(() =>
    readExpandedRequest(spec.replace(c.candidate.prompt, 'altered')),
  ).toThrow();
  expect(() => expandedRequest('v01', 'solve', 'gpt-6.1-sol')).toThrow();
  expect(expandedPolicy(spec).maxAttempts).toBe(1);
});

it('accepts rubric citations but rejects hidden fields, stale hashes and fabricated quotes', () => {
  const c = expandedCases.find((x) => x.candidate.id === 's08')!.candidate;
  const response = {
    contentHash: fingerprint(c),
    status: 'flagged',
    answer: null,
    findings: [
      {
        code: 'rubric-response-mismatch',
        severity: 'attention',
        field: 'rubric',
        quote: c.rubric,
        reason: 'No options supplied.',
      },
    ],
  };
  expect(parseExpandedReview(c, 'semantic', response)).not.toBeNull();
  expect(
    parseExpandedReview(c, 'semantic', { ...response, contentHash: 'stale' }),
  ).toBeNull();
  expect(
    parseExpandedReview(c, 'solve', {
      ...response,
      findings: [{ ...response.findings[0], field: 'answer', quote: c.answer }],
    }),
  ).toBeNull();
  expect(
    parseExpandedReview(c, 'semantic', {
      ...response,
      findings: [{ ...response.findings[0], quote: 'fabricated' }],
    }),
  ).toBeNull();
});

it('separates objective checks from provisional misses and keeps missing results in unresolved counts', () => {
  const summary = summarizeExpanded('gpt-6-luna', []);
  expect(summary.humanApproval).toBe('pending');
  expect(summary.provisional.unresolvedItems).toBe(40);
  expect(summary.provisional.resolvedItems).toBe(0);
  expect(summary.objective.answered).toBe(0);
  expect(summary.rows).toHaveLength(40);
});

it('distinguishes matched abstention, unmatched answers, provisional misses and false alarms', () => {
  const observation = (
    id: string,
    stage: 'solve' | 'semantic',
    status: 'clear' | 'flagged' | 'abstain',
    answer: string | null,
    findings: import('./expanded').ExpandedFinding[] = [],
  ) => ({
    id,
    stage,
    review: {
      contentHash: fingerprint(
        expandedCases.find((c) => c.candidate.id === id)!.candidate,
      ),
      status,
      answer,
      findings,
    },
    attempts: 1,
    costMicroEur: 123,
    inputTokens: 50,
    outputTokens: 20,
    unresolvedCost: false,
  });
  const summary = summarizeExpanded('gpt-6.1-sol', [
    observation('s15', 'solve', 'abstain', null),
    observation('s05', 'solve', 'clear', '12'),
    observation('s05', 'semantic', 'clear', null),
    observation('s01', 'solve', 'clear', '45.'),
    observation('s01', 'semantic', 'flagged', null, [
      {
        code: 'wrong-key',
        severity: 'blocking',
        field: 'answer',
        quote: '45',
        reason: 'False alarm test',
      },
    ]),
  ]);
  expect(summary.rows.find((r) => r.id === 's15')?.answerStatus).toBe(
    'matches-reference',
  );
  expect(summary.rows.find((r) => r.id === 's05')?.answerStatus).toBe(
    'unmatched-needs-review',
  );
  expect(summary.provisional.missedBlockingDefects).toBe(1);
  expect(summary.provisional.falseAlarmItems).toBe(1);
  expect(summary.provisional.unresolvedItems).toBe(38);
  expect(summary.committedMicroEur).toBe(615);
});

it('independently recomputes arithmetic and conversion references, preserving deliberately bad keys', () => {
  const expected: Record<string, number> = {
    s01: 27 + 18,
    s02: 70 - 26,
    s03: 6 * 7,
    s04: 56 / 8,
    s05: 32 - 19,
    s06: 2 * 100,
    s08: 9 + 6,
    s09: 12 + 15,
    s10: 4 * 6,
    s11: 5 - 3,
    s12: 45 - 15,
    s13: 23 - 8,
    s14: 2 * 500,
    s16: 2 * (5 + 3),
    v01: 4 * 100 + 2 * 10 + 6,
    v02: Math.min(305, 350, 503),
    v03: 38 / 2,
    v04: 100 + 25,
    v05: 3 + 2 * 4,
    v06: 1000,
    v08: 0.5 + 0.5,
    v09: 20 / 4,
    v10: Math.floor(17 / 5),
    v11: 9 - 6,
    v12: 3 * 2,
    v13: 11 - 4 + 2,
    v15: 4 * 4,
    v16: 4 * 250,
  };
  for (const [id, answer] of Object.entries(expected)) {
    const row = expandedCases.find((c) => c.candidate.id === id)!;
    expect(Number.parseFloat(row.acceptedAnswers![0]!)).toBe(answer);
    if (row.expected.length === 0)
      expect(Number.parseFloat(row.candidate.answer)).toBe(answer);
  }
  expect(
    expandedCases.find((c) => c.candidate.id === 's05')!.candidate.answer,
  ).toBe('12');
});

it('validates every durable request before any paid dispatch', async () => {
  const { expandedManifest } = await import('./expanded');
  const { validateGenerationRequest } = await import('../generation-policy');
  expect(expandedManifest).toHaveLength(560);
  expect(new Set(expandedManifest.map((m) => m.requestId)).size).toBe(560);
  for (const { requestId, specification } of expandedManifest)
    expect(() =>
      validateGenerationRequest({
        requestId,
        specification,
        feature: 'review',
      }),
    ).not.toThrow();
});
