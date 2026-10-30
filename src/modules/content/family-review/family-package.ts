import { exact, record } from '../content-records';
import type { FamilyPackage } from './family-review-contract';
/** Shared descriptor checks; arithmetic/semantic truth belongs to the registered subject validator. */
export function validFamilyDescriptor(value: unknown): value is FamilyPackage {
  if (
    !record(value) ||
    !exact(value, [
      'version',
      'title',
      'purpose',
      'reviewEstimateMinutes',
      'automaticPublication',
      'contract',
      'contractHash',
      'inventoryHash',
      'sources',
      'technical',
      'scope',
      'examples',
      'criteria',
      'inventory',
    ])
  )
    return false;
  if (
    ![value.version, value.title].every(
      (v) => typeof v === 'string' && v.trim().length > 0,
    ) ||
    value.purpose !== 'practice-only' ||
    value.automaticPublication !== false ||
    !Number.isSafeInteger(value.reviewEstimateMinutes) ||
    Number(value.reviewEstimateMinutes) <= 0
  )
    return false;
  if (
    !record(value.contract) ||
    !record(value.sources) ||
    !record(value.scope) ||
    !record(value.technical)
  )
    return false;
  const contract = value.contract,
    scope = value.scope;
  if (
    ![
      'familyId',
      'revision',
      'proposedAssessedSkill',
      'prerequisites',
      'generationConstraints',
      'responsePolicy',
      'explanationRules',
      'deterministicValidation',
      'semanticValidation',
      'exposureIdentity',
      'educationalReview',
      'publicationState',
      'provenance',
    ].every((k) => typeof contract[k] === 'string')
  )
    return false;
  if (
    value.contract.progressionPermission !== false ||
    value.contract.automaticPublication !== false
  )
    return false;
  const digest = (v: unknown) =>
    typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
  if (
    !digest(value.contractHash) ||
    !digest(value.inventoryHash) ||
    !Object.keys(value.sources).length ||
    !Object.values(value.sources).every(digest)
  )
    return false;
  if (
    !['bounds', 'prerequisites', 'objective', 'pattern', 'changes'].every(
      (k) => typeof scope[k] === 'string',
    )
  )
    return false;
  if (
    !Array.isArray(value.inventory) ||
    !value.inventory.length ||
    !Array.isArray(value.examples) ||
    !value.examples.length ||
    !Array.isArray(value.criteria) ||
    !value.criteria.length
  )
    return false;
  const inventory = value.inventory;
  if (
    value.technical.checkedInstances !== value.inventory.length ||
    value.technical.mismatches !== 0 ||
    value.technical.aiCalls !== 0
  )
    return false;
  if (
    !value.criteria.every(
      (c) =>
        record(c) &&
        exact(c, ['id', 'title', 'question', 'detail']) &&
        Object.values(c).every(
          (v) => typeof v === 'string' && v.trim().length > 0,
        ) &&
        /^[a-z][a-z0-9-]*$/.test(String(c.id)),
    )
  )
    return false;
  if (new Set(value.criteria.map((c) => c.id)).size !== value.criteria.length)
    return false;
  if (
    !value.examples.every(
      (e) =>
        record(e) &&
        Number.isSafeInteger(e.index) &&
        Number(e.index) >= 0 &&
        Number(e.index) < inventory.length &&
        typeof e.reason === 'string',
    )
  )
    return false;
  return (
    new Set(value.examples.map((e) => e.index)).size === value.examples.length
  );
}
