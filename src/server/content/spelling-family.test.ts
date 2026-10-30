import { expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
vi.mock('server-only', () => ({}));
import { resolveFamilyPackage, validateFamilyPackage } from './family-review';
import { familySourceMatches } from './family-source-compatibility';
import { spellingFamilyReport } from './spelling-family';
import { subjectContentChecks } from './subject-checks';
import {
  spellingPayload,
  spellingRubric,
} from '../../modules/content/spelling/doubling-content';
import { canonicalJson } from '../../modules/content/content-records';
import digits from '../../modules/content/family-review/addition-digits-v2.json';
import twoDigits from '../../modules/content/family-review/addition-two-digits-v1.json';
it('binds the finite spelling inventory, examples and every source without conferring educational or progression permission', () => {
  const result = resolveFamilyPackage('spelling-doubling-workflow-v3'),
    report = spellingFamilyReport();
  expect(result.package.inventory).toEqual(report.items);
  expect(result.package.contract.educationalReview).toBe('pending');
  expect(result.package.contract.progressionPermission).toBe(false);
  expect(result.package.technical.independentFamilies).toBe(1);
  expect(result.package.technical.aiCalls).toBe(0);
  expect(
    validateFamilyPackage({ ...result.package, automaticPublication: true }),
  ).toBe(false);
  for (const [path, digest] of Object.entries(result.package.sources))
    expect(createHash('sha256').update(readFileSync(path)).digest('hex')).toBe(
      digest,
    );
});
it('permits only the exact registered workflow extension of frozen addition packages; any other source or package drift fails', () => {
  for (const pkg of [digits, twoDigits]) {
    const path = 'src/server/content/family-review.ts';
    const actual = createHash('sha256')
      .update(readFileSync(path))
      .digest('hex');
    expect(actual).not.toBe(pkg.sources[path]);
    expect(familySourceMatches(pkg, path, actual)).toBe(true);
    expect(familySourceMatches(pkg, path, '0'.repeat(64))).toBe(false);
    const changed = { ...pkg, title: 'changed' };
    expect(familySourceMatches(changed, path, actual)).toBe(false);
    expect(
      familySourceMatches(
        pkg,
        'src/server/content/teaching-addition-family.ts',
        actual,
      ),
    ).toBe(false);
    expect(resolveFamilyPackage(pkg.version).package).toEqual(pkg);
  }
});
it('blocks answer, instruction, explanation, provenance and rubric tampering at the common publication boundary', () => {
  expect(subjectContentChecks(spellingPayload(0), spellingRubric)).toEqual([]);
  const payload = spellingPayload(0);
  payload.privateEvaluation.explanation = 'De t blijft enkel.';
  expect(subjectContentChecks(payload, spellingRubric)).toContainEqual({
    code: 'spelling-bank-mismatch',
    field: 'payload',
  });
  expect(
    subjectContentChecks(spellingPayload(0), {
      ...spellingRubric,
      responsePolicy: 'Autocorrect all mistakes',
    }),
  ).toContainEqual({ code: 'spelling-bank-mismatch', field: 'payload' });
  expect(canonicalJson(spellingPayload(0))).not.toContain(
    'automaticPublication',
  );
});

it('versions the shared multi-subject workflow without carrying prior review progress or changing spelling content', async () => {
  const old = JSON.parse(
    readFileSync(
      'src/modules/content/family-review/spelling-doubling-workflow-v2.json',
      'utf8',
    ),
  );
  const current = resolveFamilyPackage('spelling-doubling-workflow-v3');
  expect(current.package.inventory).toEqual(old.inventory);
  expect(current.package.contract).toEqual(old.contract);
  expect(current.package.criteria).toEqual(old.criteria);
  expect(current.packageHash).not.toBe(
    createHash('sha256').update(canonicalJson(old)).digest('hex'),
  );
  expect(current.package.contract.educationalReview).toBe('pending');
  expect(() => resolveFamilyPackage(old.version)).toThrow(
    'UNKNOWN_FAMILY_PACKAGE',
  );
});
