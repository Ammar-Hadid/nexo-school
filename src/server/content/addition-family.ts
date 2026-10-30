import 'server-only';
import { createHash } from 'node:crypto';
import {
  canonicalJson,
  record,
} from '../../modules/content/content-records.ts';

/** Draft educational specification; technical verification cannot approve it. */
export const additionFamily = Object.freeze({
  familyId: 'addition-digits-procedure',
  revision: 'd11-addition-digits-v1',
  rendererVersion: 'symbolic-addition-v1',
  evaluatorVersion: 'integer-exact-v1',
  validatorVersion: 'displayed-successor-count-v1',
  curriculumVersion: 'synthetic-d11-v1',
  proposedAssessedSkill: 'demo:optellen:single-digits',
  coverageCode: 'rekenen:optellen:01',
  coverageScope: 'strict-subset-only',
  subject: 'Rekenen',
  category: 'Optellen',
  operands: 'ordered integer pairs 0..9 inclusive',
  results: 'integers 0..18 inclusive; includes crossing ten',
  prerequisites:
    'Proposed: count 0..18; recognize digits and +/=; enter an integer',
  supportingSkills:
    'Numeral reading and keyboard entry receive no evidence credit',
  facet: 'procedure',
  representation: 'symbolic-sum',
  responseType: 'constructed-integer',
  responsePolicy:
    'Exact nonnegative integer value; trim whitespace; 1..6 ASCII digits, allowing leading zeros; reject signs, decimals and exponents',
  promptPattern: '{left} + {right} =',
  explanationPattern: 'Tel {right} op bij {left}. {left} + {right} = {answer}.',
  rights: 'project-authored-arithmetic',
  provenance:
    'agent-authored synthetic D11 family; no independent educator review',
  educationalReview: 'pending',
  progressionPermission: false,
  automaticPublication: false,
} as const);

const hash = (value: unknown) =>
  createHash('sha256').update(canonicalJson(value)).digest('hex');

/** Independent solver: parses the displayed expression and counts successors, never calls the generator. */
export function solveDisplayedAddition(prompt: string): string {
  const match = /^([0-9]) \+ ([0-9]) =$/.exec(prompt);
  if (!match || match[0] !== prompt)
    throw new Error('Outside addition display contract');
  let count = 0;
  for (const digit of [match[1]!, match[2]!]) {
    let remaining = Number(digit);
    while (remaining > 0) {
      count++;
      remaining--;
    }
  }
  return String(count);
}

/** Index is a finite enumeration, not a novelty claim or an unbounded random seed. */
export function generateAddition(index: number) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= 100 ||
    Object.is(index, -0)
  )
    throw new Error('Addition index must be an integer in 0..99');
  const left = Math.floor(index / 10);
  const right = index % 10;
  const prompt = `${left} + ${right} =`;
  const answer = String(left + right);
  if (solveDisplayedAddition(prompt) !== answer)
    throw new Error('Independent solver mismatch');
  const payload = {
    index,
    familyId: additionFamily.familyId,
    contractHash: hash(additionFamily),
    instanceId: `${additionFamily.revision}:${left}:${right}`,
    // Deliberately independent of revision and operand order. Rewording cannot reset exposure.
    exposureKey: `addition-digits:${Math.min(left, right)}:${Math.max(left, right)}`,
    prompt,
    answer,
    explanation: `Tel ${right} op bij ${left}. ${left} + ${right} = ${answer}.`,
  };
  return Object.freeze({ ...payload, contentHash: hash(payload) });
}

/** Rejects altered data even if a caller recomputes its hash. This grants no publication authority. */
export function validateAddition(candidate: unknown): boolean {
  try {
    return (
      record(candidate) &&
      typeof candidate.index === 'number' &&
      canonicalJson(candidate) ===
        canonicalJson(generateAddition(candidate.index))
    );
  } catch {
    return false;
  }
}

export function additionCertificationReport() {
  const items = Array.from({ length: 100 }, (_, index) =>
    generateAddition(index),
  );
  return {
    contract: additionFamily,
    contractHash: hash(additionFamily),
    inventoryHash: hash(items),
    checkedInstances: items.length,
    mismatches: items.filter(
      (item) => solveDisplayedAddition(item.prompt) !== item.answer,
    ).length,
    independentFamilies: new Set(items.map((item) => item.familyId)).size,
    exposureGroups: new Set(items.map((item) => item.exposureKey)).size,
    educationalReview: additionFamily.educationalReview,
    automaticPublication: additionFamily.automaticPublication,
    aiCalls: 0,
    items,
  };
}
