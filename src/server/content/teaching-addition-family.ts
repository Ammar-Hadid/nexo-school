import 'server-only';
import { createHash } from 'node:crypto';
import { canonicalJson } from '../../modules/content/content-records.ts';
import {
  additionPairs,
  additionRevision,
  additionExposure,
  explainAddition,
  type AdditionRange,
} from '../../modules/practice/rekenen/addition-strategies.ts';
export const familyHash = (v: unknown) =>
  createHash('sha256').update(canonicalJson(v)).digest('hex');
export function teachingAdditionContract(range: AdditionRange) {
  return {
    familyId:
      range === 'digits'
        ? 'addition-digits-procedure'
        : 'addition-two-digits-procedure',
    revision: additionRevision[range],
    rendererVersion: 'symbolic-addition-v1',
    evaluatorVersion: 'integer-exact-v1',
    validatorVersion: 'displayed-equations-counting-v2',
    curriculumVersion: 'synthetic-addition-teaching-v1',
    proposedAssessedSkill:
      range === 'digits'
        ? 'demo:optellen:single-digits'
        : 'demo:optellen:two-digits-to-100',
    subject: 'Rekenen',
    category: 'Optellen',
    coverageCode: 'rekenen:optellen:01',
    coverageScope: 'strict-procedural-subset',
    operands:
      range === 'digits' ? '0–9 + 0–9' : '10–99 + 10–99; som maximaal 100',
    prerequisites:
      range === 'digits'
        ? 'Tellen tot 18, cijfers en +/= herkennen, één getal typen.'
        : 'Tellen tot 100, tientallen en eenheden onderscheiden, optellen tot 18, één getal typen.',
    generationConstraints:
      'Exhaustive ordered integer pairs inside bounds; no AI calls.',
    responsePolicy:
      'integer-exact-v1: 1–6 ASCII digits; whitespace and leading zero normalization; no signs/decimals/exponents.',
    explanationRules:
      range === 'digits'
        ? 'Nul vóór dubbelen vóór aanvullen tot tien vóór doortellen.'
        : 'Splits tweede getal in tientallen/eenheden; tel tientallen erbij; vul bij overschrijding eerst het volgende tiental aan.',
    deterministicValidation:
      'Every displayed sum, split and result independently counted; exact regenerated instance/hash equality.',
    semanticValidation:
      'Independent human review of strategy, Dutch wording, scope, prerequisites and response demands remains pending.',
    facet: 'procedure',
    representation: 'symbolic-sum',
    responseType: 'constructed-integer',
    supportingSkills:
      'Numeral reading and keyboard entry receive no evidence credit.',
    exposureIdentity:
      'Commutative operands; stable across wording revisions. All variants remain one correlated family.',
    rights: 'project-authored-arithmetic',
    provenance:
      'agent-authored synthetic teaching revision; not independently educationally certified',
    educationalReview: 'pending',
    publicationState: 'unpublished',
    progressionPermission: false,
    automaticPublication: false,
  };
}
const count = (a: number, b: number) => [...Array(a), ...Array(b)].length;
/** Independent oracle parses the visible text, including decomposition. */
export function verifyAdditionText(
  prompt: string,
  answer: string,
  steps: readonly string[],
) {
  if (
    prompt.length > 32 ||
    answer.length > 3 ||
    steps.length > 8 ||
    steps.some((s) => s.length > 300)
  )
    return false;
  for (const text of [prompt, answer, ...steps])
    if ([...text.matchAll(/\d+/g)].some((m) => Number(m[0]) > 100))
      return false;
  const p = /^(\d+) \+ (\d+) =$/.exec(prompt);
  if (
    !p ||
    count(Number(p[1]), Number(p[2])) !== Number(answer) ||
    !steps.length ||
    !steps.at(-1)!.endsWith(`= ${answer}.`)
  )
    return false;
  for (const step of steps) {
    for (const m of step.matchAll(/(\d+) \+ (\d+) = (\d+)/g))
      if (count(Number(m[1]), Number(m[2])) !== Number(m[3])) return false;
    for (const m of step.matchAll(/Splits (\d+) in (\d+) en (\d+)/g))
      if (count(Number(m[2]), Number(m[3])) !== Number(m[1])) return false;
  }
  return true;
}
export function teachingAdditionReport(range: AdditionRange) {
  const contract = teachingAdditionContract(range),
    contractHash = familyHash(contract);
  const items = additionPairs(range).map(([a, b], index) => {
    const teaching = explainAddition(a, b);
    const payload = {
      index,
      familyId: contract.familyId,
      contractHash,
      instanceId: `${contract.revision}:${a}:${b}`,
      exposureKey: additionExposure(a, b),
      prompt: `${a} + ${b} =`,
      answer: teaching.answer,
      explanation: teaching.steps.join(' '),
      steps: teaching.steps,
    };
    if (!verifyAdditionText(payload.prompt, payload.answer, payload.steps))
      throw new Error('ADDITION_ORACLE_MISMATCH');
    return { ...payload, contentHash: familyHash(payload) };
  });
  return {
    contract,
    contractHash,
    items,
    inventoryHash: familyHash(items),
    technical: {
      checkedInstances: items.length,
      mismatches: 0,
      exposureGroups: new Set(items.map((i) => i.exposureKey)).size,
      independentFamilies: 1,
      aiCalls: 0,
    },
  };
}

/** Exact instance validation grants no review/publication authority. */
export function validateTeachingAddition(
  range: AdditionRange,
  candidate: unknown,
): boolean {
  try {
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      !('index' in candidate) ||
      !Number.isSafeInteger(candidate.index)
    )
      return false;
    const expected =
      teachingAdditionReport(range).items[Number(candidate.index)];
    return (
      Boolean(expected) && canonicalJson(candidate) === canonicalJson(expected)
    );
  } catch {
    return false;
  }
}
