import { expect, it } from 'vitest';
import { benchmarkCases, benchmarkVersion } from './fixtures';
import { reviewRequest, parseReview, summarizeBenchmark } from './benchmark';

it('separates concealed reference labels and proposed keys from independent solving', () => {
  for (const fixture of benchmarkCases) {
    const solve = reviewRequest(fixture.candidate, 'solve', 'fake-checker-v1');
    expect(solve).not.toHaveProperty('expected');
    expect(solve).not.toHaveProperty('answer');
    expect(solve).not.toHaveProperty('explanation');
    expect(solve).not.toHaveProperty('rationale');
    expect(solve.version).toBe(benchmarkVersion);
    const semantic = reviewRequest(
      fixture.candidate,
      'semantic',
      'fake-checker-v1',
    );
    expect(semantic.answer).toBe(fixture.candidate.answer);
    expect(semantic).not.toHaveProperty('expected');
  }
});
it('rejects malformed flags, invented quotations, stale hashes and unsupported verdicts', () => {
  const item = benchmarkCases[0]!.candidate;
  for (const reply of [
    null,
    {},
    { contentHash: 'stale', status: 'clear', findings: [] },
    { contentHash: 'x', status: 'approved', findings: [] },
  ])
    expect(parseReview(item, 'semantic', reply)).toBeNull();
});
it('keeps missing results unresolved and does not turn an empty run into a pass', () => {
  const report = summarizeBenchmark('fake-checker-v1', []);
  expect(report.totalItems).toBe(12);
  expect(report.unresolvedItems).toBe(12);
  expect(report.actualSpendMicroEur).toBe(0);
  expect(report.educationalApproval).toBe(false);
  expect(report.humanAdjudication).toBe('pending');
});

it('binds findings to real source spans, exact content revision and stage-visible fields', () => {
  const item = benchmarkCases[4]!.candidate;
  const hash = reviewRequest(item, 'semantic', 'fake-checker-v1').contentHash;
  const finding = {
    code: 'wrong-key',
    severity: 'blocking',
    field: 'answer',
    quote: '14',
    reason: 'Independent count gives 15.',
  };
  const response = {
    contentHash: hash,
    status: 'flagged',
    answer: null,
    findings: [finding],
  };
  expect(parseReview(item, 'semantic', response)).not.toBeNull();
  expect(parseReview(item, 'solve', response)).toBeNull();
  expect(
    parseReview({ ...item, answer: '15' }, 'semantic', response),
  ).toBeNull();
  for (const patch of [
    { quote: 'invented' },
    { code: 'unknown' },
    { severity: ['blocking'] },
    { reason: '' },
  ]) {
    expect(
      parseReview(item, 'semantic', {
        ...response,
        findings: [{ ...finding, ...patch }],
      }),
    ).toBeNull();
  }
  expect(
    parseReview(item, 'semantic', { ...response, status: ['flagged'] }),
  ).toBeNull();
  expect(
    parseReview(item, 'semantic', { ...response, approved: true }),
  ).toBeNull();
});

it('duplicate observations cannot inflate completed coverage', () => {
  const item = benchmarkCases[0]!.candidate;
  const observation = {
    candidateId: item.id,
    stage: 'solve' as const,
    response: {
      contentHash: reviewRequest(item, 'solve', 'fake-checker-v1').contentHash,
      status: 'clear',
      answer: '7',
      findings: [],
    },
    chargedMicroEur: 400,
    inputTokens: 10,
    outputTokens: 20,
    attemptCount: 1,
  };
  const report = summarizeBenchmark('fake-checker-v1', [
    observation,
    observation,
  ]);
  expect(report.rows[0]!.solve).toBeNull();
  expect(report.unresolvedItems).toBe(12);
});
