import { expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { canonicalJson } from '../../modules/content/content-records';
import { parseIntegerAnswer } from '../../modules/practice/assignment/submission-state';
vi.mock('server-only', () => ({}));
import {
  additionFamily,
  generateAddition,
  validateAddition,
  solveDisplayedAddition,
  additionCertificationReport,
} from './addition-family';

it('exhaustively checks 100 displayed sums, keys, explanations and stable identities', () => {
  const items = Array.from({ length: 100 }, (_, index) =>
    generateAddition(index),
  );
  expect(new Set(items.map((item) => item.instanceId)).size).toBe(100);
  // Operand order is not fresh independent material.
  expect(new Set(items.map((item) => item.exposureKey)).size).toBe(55);
  expect(new Set(items.map((item) => item.familyId)).size).toBe(1);
  for (const [index, item] of items.entries()) {
    const [left, right] = [Math.floor(index / 10), index % 10];
    const gold = [...Array(left), ...Array(right)].length;
    expect(item.prompt).toBe(`${left} + ${right} =`);
    expect(solveDisplayedAddition(item.prompt)).toBe(String(gold));
    expect(item.answer).toBe(String(gold));
    expect(item.explanation).toBe(
      `Tel ${right} op bij ${left}. ${left} + ${right} = ${gold}.`,
    );
    expect(validateAddition(item)).toBe(true);
    expect(generateAddition(index)).toEqual(item);
    expect(item.exposureKey).toBe(
      generateAddition(right * 10 + left).exposureKey,
    );
  }
});

it('rejects invalid seeds and out-of-contract prompts without coercion', () => {
  for (const seed of [
    -1,
    100,
    0.5,
    NaN,
    Infinity,
    -Infinity,
    '1',
    null,
    {},
    -0,
  ]) {
    expect(() => generateAddition(seed as number)).toThrow();
  }
  for (const prompt of [
    '10 + 1 =',
    '1 - 1 =',
    '1+1=',
    '01 + 1 =',
    '1 + 1 =\n',
    '',
  ]) {
    expect(() => solveDisplayedAddition(prompt)).toThrow();
  }
});

it('rejects tampered snapshots, keys, mappings, explanations and identities', () => {
  const item = generateAddition(79);
  for (const key of Object.keys(item)) {
    expect(validateAddition({ ...item, [key]: 'tampered' }), key).toBe(false);
  }
  for (const value of [
    null,
    {},
    { ...item, extra: true },
    { ...item, answer: 16 },
  ]) {
    expect(validateAddition(value)).toBe(false);
  }
});

it('reports technical verification separately from educational approval and publication', () => {
  const report = additionCertificationReport();
  expect(report.checkedInstances).toBe(100);
  expect(report.mismatches).toBe(0);
  expect(report.independentFamilies).toBe(1);
  expect(report.educationalReview).toBe('pending');
  expect(report.automaticPublication).toBe(false);
  expect(additionFamily.progressionPermission).toBe(false);
  expect(report.contractHash).toMatch(/^[a-f0-9]{64}$/);
  expect(report.inventoryHash).toMatch(/^[a-f0-9]{64}$/);
});

it('matches the existing evaluator grammar without changing scoring or retry rules', () => {
  for (let index = 0; index < 100; index++) {
    const item = generateAddition(index);
    expect(parseIntegerAnswer(` 000${item.answer} `)).toBe(item.answer);
    expect(parseIntegerAnswer(String(Number(item.answer) + 1))).not.toBe(
      item.answer,
    );
  }
  for (const invalid of [
    '',
    ' ',
    '+2',
    '-0',
    '2.0',
    '2e0',
    '2,0',
    '２',
    '0000000',
  ]) {
    expect(parseIntegerAnswer(invalid)).toBeNull();
  }
});

it('rejects a forged correct hash over an incorrect answer', () => {
  const { contentHash: originalHash, ...payload } = generateAddition(79);
  expect(originalHash).toMatch(/^[a-f0-9]{64}$/);
  const forged = { ...payload, answer: '17' };
  const contentHash = createHash('sha256')
    .update(canonicalJson(forged))
    .digest('hex');
  expect(validateAddition({ ...forged, contentHash })).toBe(false);
});

it('pins the reviewed technical contract and exhaustive inventory bytes', () => {
  const report = additionCertificationReport();
  expect(report.contractHash).toBe(
    'a4314053a7c66c3dbcbe284be9e1bfd587d435af4826b94c1cc85d9c5701098b',
  );
  expect(report.inventoryHash).toBe(
    'a7c5d517e9ceb0a30b21cab12b916bc0366cb4daed6a53a6881368ee31d34e5c',
  );
});
