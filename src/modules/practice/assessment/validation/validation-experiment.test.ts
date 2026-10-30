import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, expect, it } from 'vitest';
import manifest from '../../../../../docs/research/assessment-validation/manifest.json';
import plan from '../../../../../docs/research/assessment-validation/scenario-plan.json';
import { items as entry } from './entry-items';
import { items as practice } from './practice-items';
import { items as heldOut } from './held-out-items';
import { independentAnswers } from './independent-oracle';
import {
  assessPackage,
  inspectInventory,
  observe,
  scoreDraft,
  selectDraftBatch,
  type DraftAttempt,
} from './validation-tooling';
import { requiredSkills, facets, type DraftItem } from './validation-blueprint';
import { retentionDecision, type Evidence } from '../assessment-policy';

const bank = [...entry, ...practice, ...heldOut];
const oracle = independentAnswers();
beforeAll(() => {
  // Fail before evaluating outcomes if frozen source/content/scenario inputs changed.
  for (const [path, expected] of Object.entries(manifest.sha256))
    expect(
      createHash('sha256').update(readFileSync(path)).digest('hex'),
      path,
    ).toBe(expected);
});
const factsFor = (
  items: readonly DraftItem[],
  correct: (i: DraftItem) => boolean = () => true,
) =>
  items.map((item): DraftAttempt => ({
    source: `attempt:${item.id}`,
    item: item.id,
    raw:
      oracle[item.id] === null
        ? 'Uitleg vereist'
        : correct(item)
          ? String(oracle[item.id])
          : '999999',
    day:
      item.pool === 'held-out-delayed' ? 3 : item.facet === 'procedure' ? 0 : 1,
    session:
      item.pool === 'held-out-delayed'
        ? `delayed:${item.facet}`
        : `entry:${item.facet}`,
  }));
const allSkills = (result: ReturnType<typeof assessPackage>) => [
  ...result.foundation.skills,
  ...result.skills,
];
const requestsFor = (result: ReturnType<typeof assessPackage>) =>
  allSkills(result).flatMap((s) =>
    [...new Set([...s.conflicts, ...s.missing])].map((facet) => ({
      skill: s.skill,
      facet,
    })),
  );

it('freezes all 27 identities, covers the nine declared cells per pool and reserves different delayed families', () => {
  expect(bank).toHaveLength(27);
  expect(new Set(bank.map((i) => i.id)).size).toBe(27);
  expect(new Set(bank.map((i) => i.prompt.trim())).size).toBe(27);
  const reviewSheet = readFileSync(
    'docs/research/assessment-validation/reviewer-package.md',
    'utf8',
  );
  for (const item of bank) {
    expect(reviewSheet, item.id).toContain(item.prompt);
    expect(reviewSheet, item.id).toContain(
      `### ${item.id} · version ${item.version}`,
    );
  }
  const developmentFamilies = new Set(
    [...entry, ...practice].map((i) => i.family),
  );
  expect(heldOut.filter((i) => developmentFamilies.has(i.family))).toEqual([]);
  for (const items of [entry, practice, heldOut])
    expect(inspectInventory(items).missing).toEqual([]);
  expect(inspectInventory(heldOut).unsupported).toEqual(['H-F-C']);
  // Honest response classification: typed selection is still a choice.
  expect(
    heldOut.filter((i) => i.response === 'choice').map((i) => i.id),
  ).toEqual(['H-O-P', 'H-O-A']);
  const delayedAlone = assessPackage(observe(heldOut, factsFor(heldOut)), 3);
  expect(delayedAlone.foundation.skills[0]!.missing).toContain('concept');
  expect(delayedAlone.skills[1]!.decision).toBe('more-evidence');
  for (const skill of requiredSkills)
    expect(practice.filter((i) => i.skill === skill)).toHaveLength(3);
});

it('independently recomputes 26 numeric keys and exhaustively checks 26,000 bounded response comparisons', () => {
  let comparisons = 0;
  for (const item of bank) {
    expect(item.key, item.id).toBe(oracle[item.id]);
    if (item.key === null) {
      expect(scoreDraft(item, '10').status).toBe('unscorable');
      continue;
    }
    for (let answer = 0; answer <= 999; answer++) {
      expect(
        scoreDraft(item, String(answer)).status,
        `${item.id}:${answer}`,
      ).toBe(answer === oracle[item.id] ? 'correct' : 'incorrect');
      comparisons++;
    }
    for (const raw of [
      String(item.key),
      ` ${item.key} `,
      String(item.key).padStart(6, '0'),
    ])
      expect(scoreDraft(item, raw).status).toBe('correct');
    expect(scoreDraft(item, item.rejected).status, item.id).toBe('incorrect');
  }
  expect(comparisons).toBe(26000);
});

it('keeps every validation bank out of app/story selectors and rejects held-out substitution on exhaustion', () => {
  const files = readdirSync('src', {
    recursive: true,
    encoding: 'utf8',
  }).filter(
    (p) =>
      /\.(ts|tsx)$/.test(p) &&
      !p.includes('/validation/') &&
      !p.startsWith('generated/'),
  );
  for (const file of files)
    expect(readFileSync(join('src', file), 'utf8'), file).not.toMatch(
      /(?:from\s*|import\s*\()[\"'][^\"']*\/validation(?:\/|[\"'])/,
    );
  const requests = requiredSkills.flatMap((skill) =>
    facets.map((facet) => ({ skill, facet })),
  );
  const seen = new Set(entry.map((i) => i.id));
  expect(selectDraftBatch(bank, requests.slice(0, 4), seen)).toEqual([]);
  expect(selectDraftBatch(heldOut, requests.slice(0, 4), new Set())).toEqual(
    [],
  );
});

it('blocks foreign subject/release/level/supporting/assisted/retry/practice evidence and missing prerequisites', () => {
  const facts = observe(entry, factsFor(entry));
  const attacks: Partial<Evidence>[] = [
    { subject: 'taal' },
    { curriculumVersion: 'synthetic-curriculum-v3' },
    { level: 'different' },
    { role: 'supporting' },
    { assisted: true },
    { firstAttempt: false },
    { novel: false },
    { complete: false },
    { review: 'missing' },
    { purpose: 'practice' },
    { purpose: 'repair' },
    { response: 'unsupported' },
    { day: 2 },
    { day: Number.NaN },
    { family: 'one-correlated-family' },
  ];
  for (const attack of attacks)
    expect(
      assessPackage(
        facts.map((e) => ({ ...e, ...attack })),
        1,
      ).decision,
      JSON.stringify(attack),
    ).not.toBe('ready-provisional');
  const targetOnly = facts.filter((e) => e.skill !== requiredSkills[0]);
  expect(assessPackage(targetOnly, 1).missingPrerequisites).toEqual([
    requiredSkills[0],
  ]);
  expect(
    assessPackage(observe(practice, factsFor(practice)), 1).decision,
  ).not.toBe('ready-provisional');
  expect(assessPackage(facts, 15).foundation.decision).toBe('more-evidence');
});

it('runs the frozen 512-state experiment and 13 profiles, preserving failures and burden in a reproducible report', () => {
  const seen = new Set(entry.map((i) => i.id));
  let falseAdvancements = 0;
  let missedWeaknesses = 0;
  let weakFacetCount = 0;
  let ready = 0;
  let unresolvedFacetRequests = 0;
  let contentBlockedStates = 0;
  let unnecessaryFullKnownRequests = 0;
  for (let mask = 0; mask < plan.matrix.states; mask++) {
    const known = (i: DraftItem) =>
      Boolean(
        mask &
        (1 <<
          (requiredSkills.indexOf(i.skill as (typeof requiredSkills)[number]) *
            3 +
            facets.indexOf(i.facet))),
      );
    const result = assessPackage(observe(entry, factsFor(entry, known)), 1);
    if (result.decision === 'ready-provisional') {
      ready++;
      if (mask !== 511) falseAdvancements++;
    }
    for (const item of entry)
      if (!known(item)) {
        weakFacetCount++;
        if (
          !allSkills(result)
            .find((s) => s.skill === item.skill)!
            .conflicts.includes(item.facet)
        )
          missedWeaknesses++;
      }
    const requests = requestsFor(result);
    unresolvedFacetRequests += requests.length;
    if (
      requests.length &&
      !selectDraftBatch(entry, requests.slice(0, 4), seen).length
    )
      contentBlockedStates++;
    if (mask === 511) unnecessaryFullKnownRequests = requests.length;
  }
  expect({
    falseAdvancements,
    missedWeaknesses,
    ready,
    weakFacetCount,
    unresolvedFacetRequests,
    contentBlockedStates,
    unnecessaryFullKnownRequests,
  }).toEqual({
    falseAdvancements: 0,
    missedWeaknesses: 0,
    ready: 1,
    weakFacetCount: 2304,
    unresolvedFacetRequests: 2304,
    contentBlockedStates: 511,
    unnecessaryFullKnownRequests: 0,
  });

  const profiles = plan.profiles.map((name) => {
    const weak = (item: DraftItem) =>
      name === 'foundational-gap'
        ? item.id === 'E-F-C'
        : name === 'procedure-only'
          ? item.facet !== 'procedure'
          : name === 'single-slip'
            ? item.id === 'E-V-C'
            : false;
    let attempts = factsFor(entry, (i) => !weak(i));
    if (name === 'constant-zero-guess')
      attempts = attempts.map((a) => ({ ...a, raw: '0' }));
    if (name === 'known-memorization')
      attempts = attempts.map((a) => ({ ...a, familiar: true }));
    if (name === 'assisted')
      attempts = attempts.map((a) => ({ ...a, assisted: true }));
    if (name === 'retry-only')
      attempts = attempts.map((a) => ({ ...a, retry: true }));
    if (name === 'stale') attempts = attempts.map((a) => ({ ...a, day: -20 }));
    let history = observe(entry, attempts);
    if (name === 'conflicting')
      history = [
        ...history,
        {
          ...history.find(
            (e) => e.skill === requiredSkills[1] && e.facet === 'procedure',
          )!,
          id: 'adversarial-conflict',
          item: 'adversarial-conflict',
          session: 'later-conflict',
          day: 1,
          correct: false,
        },
      ];
    const initial = assessPackage(history, 1);
    const latentKnown = [
      'full',
      'stale',
      'single-slip',
      'delayed-forgetting',
    ].includes(name);
    const initiallyReady = initial.decision === 'ready-provisional';
    const delayedCorrect = (i: DraftItem) =>
      [
        'lucky-all-correct',
        'hidden-memorization',
        'constant-zero-guess',
        'known-memorization',
        'assisted',
        'retry-only',
      ].includes(name)
        ? false
        : name === 'delayed-forgetting' || name === 'conflicting'
          ? i.id !== 'H-V-P'
          : name === 'procedure-only'
            ? i.facet === 'procedure'
            : name === 'foundational-gap'
              ? i.id !== 'H-F-C'
              : true;
    const delayedAttempts = factsFor(heldOut, delayedCorrect);
    const delayedScores = delayedAttempts.map(
      (a, i) => scoreDraft(heldOut[i]!, a.raw).status,
    );
    const delayedHistory = observe(heldOut, delayedAttempts);
    const later = assessPackage([...history, ...delayedHistory], 3);
    const retention = retentionDecision(
      3,
      allSkills(later).some((s) => s.conflicts.length > 0),
      3,
    );
    const requests = requestsFor(initial);
    const repairSkills = allSkills(initial).filter(
      (s) => s.conflicts.length > 0,
    );
    return {
      name,
      initialDecision: initial.decision,
      foundationDecision: initial.foundation.decision,
      demonstratedSkills: allSkills(initial).filter(
        (s) => s.decision === 'ready-provisional',
      ).length,
      initialOriginals: attempts.length,
      initialEvidenceRecords: history.length,
      additionalFacetRequests: requests.length,
      freshEntryItemsAvailable: selectDraftBatch(
        entry,
        requests.slice(0, 4),
        seen,
      ).length,
      practiceSpecimensAvailable: practice.filter((i) =>
        repairSkills.some((s) => s.skill === i.skill),
      ).length,
      completeTenItemPracticeTasksAvailable: repairSkills.filter(
        (s) => practice.filter((i) => i.skill === s.skill).length >= 10,
      ).length,
      falseAdvancement: initiallyReady && !latentKnown,
      unnecessaryWithholdingUnderStipulatedKnowledge:
        latentKnown && !initiallyReady,
      delayedOriginals: heldOut.length,
      delayedScorable: delayedScores.filter((s) => s !== 'unscorable').length,
      delayedIncorrect: delayedScores.filter((s) => s === 'incorrect').length,
      delayedUnscorable: delayedScores.filter((s) => s === 'unscorable').length,
      laterDecision: later.decision,
      retentionSignal: retention,
      reversal: initiallyReady && later.decision !== 'ready-provisional',
    };
  });
  expect(
    profiles.find((p) => p.name === 'hidden-memorization')!.falseAdvancement,
  ).toBe(true);
  expect(
    profiles.find((p) => p.name === 'known-memorization')!.falseAdvancement,
  ).toBe(false);
  expect(
    profiles.find((p) => p.name === 'lucky-all-correct')!.falseAdvancement,
  ).toBe(true);
  expect(profiles.find((p) => p.name === 'delayed-forgetting')!.reversal).toBe(
    true,
  );
  expect(
    profiles.find((p) => p.name === 'single-slip')!
      .unnecessaryWithholdingUnderStipulatedKnowledge,
  ).toBe(true);
  const report = {
    manifest: manifest.version,
    policy: manifest.policy,
    content: manifest.content,
    matrix: {
      scenarios: 512,
      initialOriginals: 512 * 9,
      falseAdvancements,
      weakFacetCount,
      missedWeaknesses,
      ready,
      unresolvedFacetRequests,
      contentBlockedStates,
      unnecessaryFullKnownRequests,
    },
    profiles,
    totals: {
      profiles: profiles.length,
      falseAdvancements: profiles.filter((p) => p.falseAdvancement).length,
      reversals: profiles.filter((p) => p.reversal).length,
      unnecessaryWithholding: profiles.filter(
        (p) => p.unnecessaryWithholdingUnderStipulatedKnowledge,
      ).length,
    },
  };
  mkdirSync('test-results', { recursive: true });
  writeFileSync(
    'test-results/assessment-validation.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.info('Synthetic validation metrics:', JSON.stringify(report));
});
