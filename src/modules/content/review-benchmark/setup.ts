import { exact, record } from '../content-records.ts';
import { fingerprint } from './benchmark.ts';
import { benchmarkCases, benchmarkVersion } from './fixtures.ts';

// Research observations, not executable provider pricing or reservation maxima.
export const benchmarkModels = [
  {
    provider: 'openai',
    model: 'gpt-6-luna',
    inputMicroUsd: 100_000,
    outputMicroUsd: 500_000,
  },
  {
    provider: 'anthropic',
    model: 'claude-haiku-5-5',
    inputMicroUsd: 100_000,
    outputMicroUsd: 500_000,
  },
  {
    provider: 'google',
    model: 'gemini-3.8-flash',
    inputMicroUsd: 750_000,
    outputMicroUsd: 3_750_000,
  },
  {
    provider: 'openai',
    model: 'gpt-6.1-sol',
    inputMicroUsd: 2_000_000,
    outputMicroUsd: 10_000_000,
  },
  {
    provider: 'anthropic',
    model: 'claude-sonnet-5-5',
    inputMicroUsd: 2_000_000,
    outputMicroUsd: 10_000_000,
  },
  {
    provider: 'anthropic',
    model: 'claude-opus-5-5',
    inputMicroUsd: 4_000_000,
    outputMicroUsd: 20_000_000,
  },
  {
    provider: 'google',
    model: 'gemini-4-argon',
    inputMicroUsd: 2_000_000,
    outputMicroUsd: 10_000_000,
  },
] as const;

/** This is an explicitly hypothetical estimate. It grants no dispatch authority. */
export function estimateScreen(input: {
  items: number;
  inputTokens: number;
  outputTokens: number;
  microEurPerUsd: number;
}) {
  for (const [key, value] of Object.entries(input)) {
    const max =
      key === 'items'
        ? 1000
        : key === 'microEurPerUsd'
          ? 10_000_000
          : 1_000_000;
    if (!Number.isSafeInteger(value) || value < 1 || value > max)
      throw new Error('INVALID_ESTIMATE_INPUT');
  }
  const rows = benchmarkModels.map((model) => {
    const microUsdNumerator =
      BigInt(input.items * 2) *
      (BigInt(input.inputTokens) * BigInt(model.inputMicroUsd) +
        BigInt(input.outputTokens) * BigInt(model.outputMicroUsd));
    const numerator = microUsdNumerator * BigInt(input.microEurPerUsd);
    const planningMicroEur = Number(
      (numerator + 999_999_999_999n) / 1_000_000_000_000n,
    );
    return { model: model.model, planningMicroEur };
  });
  return {
    assumptions: input,
    pricesObservedAt: '2026-10-22',
    calls: input.items * 2 * benchmarkModels.length,
    planningMicroEur: rows.reduce((sum, row) => sum + row.planningMicroEur, 0),
    isDispatchBound: false,
    excludes: [
      'retries',
      'cache-write premiums',
      'regional premiums',
      'provider fees',
      'holdout',
      'creation',
    ],
    rows,
  };
}

export function createReviewDecisions() {
  return {
    version: benchmarkVersion,
    fixtureHash: fingerprint(benchmarkCases),
    reviewer: 'Ammar',
    reviewedAt: '',
    items: benchmarkCases.map(({ candidate }) => ({
      id: candidate.id,
      contentHash: fingerprint(candidate),
      decision: 'pending',
      note: '',
    })),
  };
}

/** Validates recorded decisions, not reviewer identity or educational expertise. */
export function reviewReadiness(value: unknown) {
  const result = { ready: false, accepted: 0, total: benchmarkCases.length };
  if (
    !record(value) ||
    !exact(value, [
      'version',
      'fixtureHash',
      'reviewer',
      'reviewedAt',
      'items',
    ]) ||
    value.version !== benchmarkVersion ||
    value.fixtureHash !== fingerprint(benchmarkCases) ||
    value.reviewer !== 'Ammar' ||
    typeof value.reviewedAt !== 'string' ||
    !Array.isArray(value.items) ||
    value.items.length !== benchmarkCases.length
  )
    return result;
  const ids = new Set<string>();
  for (const item of value.items) {
    if (
      !record(item) ||
      !exact(item, ['id', 'contentHash', 'decision', 'note']) ||
      typeof item.id !== 'string' ||
      ids.has(item.id) ||
      typeof item.note !== 'string' ||
      item.note.length > 4000 ||
      !['pending', 'accept-proposal', 'change-required'].includes(
        String(item.decision),
      )
    )
      return result;
    ids.add(item.id);
    const source = benchmarkCases.find((c) => c.candidate.id === item.id);
    if (!source || item.contentHash !== fingerprint(source.candidate))
      return result;
  }
  const accepted = value.items.filter(
    (item) => record(item) && item.decision === 'accept-proposal',
  ).length;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value.reviewedAt)
    ? new Date(`${value.reviewedAt}T00:00:00Z`)
    : null;
  const dated =
    date &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value.reviewedAt;
  return {
    ...result,
    accepted,
    ready: Boolean(dated && accepted === result.total),
  };
}

export function renderReviewPackage() {
  const lines = [
    '# D13 — first reference review for Ammar',
    '',
    'Status: Pending human decisions. These 12 existing development fixtures are not an unused holdout. This is the first review batch, not the full planned benchmark.',
    '',
    `Fixture hash: \`${fingerprint(benchmarkCases)}\`. Version: \`${benchmarkVersion}\`.`,
    '',
    'Review every item, including those proposed clean. The keys and explanations below deliberately contain errors in some cases. They are benchmark material, never learner content.',
    '',
    'For each item, decide whether you accept the proposed defect labels and severity. Check for additional defects, answer alternatives and unclear instructions. Record “accept-proposal” or “change-required” with a correction in tasks/d13-review-decisions.json; leave uncertain items pending. Add reviewedAt only when you have reviewed the package. You can instead send decisions in chat using the item IDs; they will be recorded against these hashes. No decision has been filled in for you.',
    '',
    'Your review establishes the benchmark references for this bounded comparison. It does not certify curriculum coverage, mastery thresholds or production educational suitability. Corrections require a new reviewed fixture version; historical test material is preserved.',
    '',
  ];
  for (const { candidate, expected } of benchmarkCases) {
    lines.push(
      `## ${candidate.id} — ${candidate.subject}: ${candidate.category}`,
      '',
      `Content hash: \`${fingerprint(candidate)}\``,
      '',
      `**Objective:** ${candidate.objective}`,
      '',
      `**Rubric:** ${candidate.rubric}`,
      '',
      `**Passage/context:** ${candidate.passage || '(none)'}`,
      '',
      `**Question:** ${candidate.prompt}`,
      '',
      `**Options:** ${candidate.options.join(' / ') || '(open answer)'}`,
      '',
      `**Supplied key:** ${candidate.answer}`,
      '',
      `**Supplied explanation:** ${candidate.explanation}`,
      '',
      '**Proposed reference:**',
      '',
      ...(expected.length
        ? expected.map((e) => `- ${e.severity} / ${e.code}: ${e.rationale}`)
        : ['No defect proposed.']),
      '',
      '**Your decision:** Pending',
      '',
      '**Corrections / acceptable answers / additional defects:**',
      '',
    );
  }
  return `${lines.join('\n')}\n`;
}
