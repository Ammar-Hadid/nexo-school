import 'server-only';
import { createHash } from 'node:crypto';

// Synthetic software certificate only. Human template/skill certification remains pending.
export const arithmeticPolicy = 'synthetic-addition-seed-v1';
export function arithmeticItem(left: number, right: number) {
  if (![left, right].every((n) => Number.isInteger(n) && n >= 0 && n <= 9))
    throw new Error('Outside certified arithmetic bounds');
  const payload = {
    templateVersion: 'addition-digits-v1',
    evaluatorVersion: 'integer-exact-v1',
    validatorVersion: 'counting-oracle-v1',
    curriculumVersion: 'synthetic-d05-v1',
    skillId: 'demo:optellen:single-digits',
    subject: 'Rekenen',
    category: 'Optellen',
    prompt: `${left} + ${right} =`,
    answer: String(left + right),
    responseType: 'integer',
    seed: `${left}:${right}`,
    publicationPolicy: arithmeticPolicy,
    rights: 'project-authored-arithmetic',
  };
  // Independent exact counting, also exhaustively checked over the finite domain in tests.
  if (payload.answer !== String([...Array(left), ...Array(right)].length))
    throw new Error('Arithmetic validation failed');
  return {
    id: `d05-add-v1-${left}-${right}`,
    ...payload,
    contentHash: createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex'),
  };
}
export function seedItems() {
  return Array.from({ length: 10 }, (_, n) => arithmeticItem(n, (n * 3) % 10));
}
