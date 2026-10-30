import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import {
  currentFamilyPackage,
  resolveFamilyPackage,
  validateFamilyPackage,
  familyPackageHash,
} from './family-review';
import {
  familyDecision,
  emptyFamilyDraft,
} from '../../modules/content/family-review/family-review-contract';
it('resolves two families through one immutable package boundary and refuses unknown or corrupted packages', () => {
  const a = currentFamilyPackage(),
    b = resolveFamilyPackage('addition-two-digits-v1').package;
  expect(a.inventory).toHaveLength(100);
  expect(b.inventory).toHaveLength(3321);
  expect(b.contract.familyId).not.toBe(a.contract.familyId);
  expect(() => resolveFamilyPackage('unknown')).toThrow();
  expect(() => resolveFamilyPackage('d14-optellen-certification-v1')).toThrow();
  expect(
    validateFamilyPackage({ ...b, inventoryHash: familyPackageHash }),
  ).toBe(false);
  expect(
    validateFamilyPackage({
      ...b,
      examples: [{ ...b.examples[0], answer: '999' }],
    }),
  ).toBe(false);
  expect(validateFamilyPackage({ ...b, automaticPublication: true })).toBe(
    false,
  );
  expect(validateFamilyPackage(null)).toBe(false);
});
it('uses each package examples and criteria, never approvals from another package', () => {
  const pkg = resolveFamilyPackage('addition-two-digits-v1').package;
  const d = {
    ...emptyFamilyDraft(pkg),
    examples: pkg.examples.map((e) => e.index),
    judgments: Object.fromEntries(pkg.criteria.map((c) => [c.id, 'accept'])),
    basis: 'independent-human',
    notes: 'Synthetic local package review.',
  };
  expect(familyDecision(d, pkg)).toBe('guardian-feedback');
  expect(
    familyDecision({ ...d, examples: [0, 9, 90, 45, 55, 79, 99] }, pkg),
  ).toBe('incomplete');
});

it('verifies all instance identities and response normalization without inheriting legacy approval', async () => {
  const { parseIntegerAnswer } =
    await import('../../modules/practice/assignment/submission-state');
  const { validateTeachingAddition } =
    await import('./teaching-addition-family');
  for (const version of [
    'addition-digits-teaching-v2',
    'addition-two-digits-v1',
  ]) {
    const pkg = resolveFamilyPackage(version).package;
    expect(new Set(pkg.inventory.map((i) => i.instanceId)).size).toBe(
      pkg.inventory.length,
    );
    expect(pkg.contract.educationalReview).toBe('pending');
    expect(pkg.contract.progressionPermission).toBe(false);
    for (const item of pkg.inventory)
      expect(parseIntegerAnswer(` 00${item.answer} `)).toBe(item.answer);
    const item = pkg.examples[1]!;
    const exact = Object.fromEntries(
      Object.entries(item).filter(([k]) => k !== 'reason'),
    );
    expect(
      validateTeachingAddition(
        version === 'addition-two-digits-v1' ? 'two-digits' : 'digits',
        exact,
      ),
    ).toBe(true);
    expect(
      validateTeachingAddition('digits', { ...exact, answer: '999' }),
    ).toBe(false);
  }
  for (const bad of ['', '+1', '1.0', '1,0', '1e0', '1234567'])
    expect(parseIntegerAnswer(bad)).toBeNull();
});

it('rejects malformed descriptor criteria/examples and supports subject-owned language criteria', async () => {
  const { validFamilyDescriptor } =
    await import('../../modules/content/family-review/family-package');
  const pkg = currentFamilyPackage();
  for (const bad of [
    null,
    {},
    { ...pkg, examples: [] },
    { ...pkg, criteria: [] },
    { ...pkg, criteria: [pkg.criteria[0], pkg.criteria[0]] },
    { ...pkg, examples: [pkg.examples[0], pkg.examples[0]] },
    { ...pkg, contract: { ...pkg.contract, prerequisites: undefined } },
  ])
    expect(validFamilyDescriptor(bad)).toBe(false);
  const language = {
    ...pkg,
    contract: {
      ...pkg.contract,
      subject: 'Taal',
      familyId: 'synthetic-word-bank',
    },
    criteria: [
      {
        id: 'bank',
        title: 'Woordbank',
        question: 'Zijn de woorden geschikt?',
        detail: 'Synthetische descriptor; geen certificering.',
      },
    ],
  };
  expect(validFamilyDescriptor(language)).toBe(true);
  const d = {
    ...emptyFamilyDraft(language),
    examples: language.examples.map((e) => e.index),
    judgments: { bank: 'accept' },
    basis: 'independent-human',
    notes: 'Synthetic subject extension test.',
  };
  expect(familyDecision(d, language)).toBe('guardian-feedback');
  // A valid shape cannot register a package or confer subject validation/publication authority.
  expect(validateFamilyPackage(language)).toBe(false);
});
