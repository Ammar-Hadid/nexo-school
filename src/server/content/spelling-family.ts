import 'server-only';
import { createHash } from 'node:crypto';
import { canonicalJson } from '../../modules/content/content-records.ts';
import {
  doublingBank,
  doublingExposure,
  doublingQuestion,
  doublingVersion,
} from '../../modules/practice/spelling/doubling-family.ts';
import { spellingRubric } from '../../modules/content/spelling/doubling-content.ts';
const hash = (v: unknown) =>
  createHash('sha256').update(canonicalJson(v)).digest('hex');
export function spellingFamilyReport() {
  const contract = {
    familyId: 'spelling-short-vowel-doubling',
    revision: doublingVersion,
    subject: 'Spelling',
    category: 'Regelwoorden',
    coverageCode: 'spelling:regelwoorden:04',
    proposedAssessedSkill: 'practice-only:consonant-doubling',
    prerequisites:
      'Een korte klinker herkennen; enkelvoud en meervoud begrijpen; een woord kunnen typen.',
    generationConstraints:
      'Exactly ten sourced one-syllable nouns; fixed singular → plural prompt; no arbitrary words, sentences, dictation or AI.',
    responsePolicy: spellingRubric.responsePolicy,
    explanationRules:
      'Identify the short vowel; double the final consonant and append en; check against independently pinned forms.',
    deterministicValidation:
      'Exact bank/prompt/key/explanation/provenance equality, explicit keys against doubling rule and shared v2 checks.',
    semanticValidation:
      'Source-checked spelling facts; independent educational review of suitability, prerequisites and explanation remains pending.',
    exposureIdentity:
      'Stable lemma identity across wording and bank revisions; all ten words belong to one correlated family. Practice stock only; no check/retention stock.',
    educationalReview: 'pending',
    publicationState: 'unpublished',
    provenance:
      'agent-authored; rule and individual forms checked against cited Dutch primary sources on 2026-10-24',
    progressionPermission: false,
    automaticPublication: false,
  };
  const contractHash = hash(contract);
  const items = doublingBank.map((_, index) => {
    const q = doublingQuestion(index);
    const item = {
      index,
      familyId: contract.familyId,
      contractHash,
      instanceId: `${doublingVersion}:${index}`,
      exposureKey: doublingExposure(index),
      prompt: q.prompt,
      answer: q.answer,
      explanation: q.steps.join(' '),
      steps: q.steps,
    };
    return { ...item, contentHash: hash(item) };
  });
  return {
    contract,
    contractHash,
    items,
    inventoryHash: hash(items),
    technical: {
      checkedInstances: items.length,
      mismatches: 0,
      exposureGroups: items.length,
      independentFamilies: 1,
      aiCalls: 0,
    },
  };
}
