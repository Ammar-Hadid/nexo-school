import { expect, it } from 'vitest';
import {
  validateGenerationRequest,
  validateMonthlyCap,
  generationPolicy,
} from './generation-policy';
it('accepts bounded synthetic feature requests but rejects extra fields and learner data envelopes', () => {
  const input = {
    requestId: 'batch-1',
    feature: 'generation',
    specification: 'synthetic fixture',
  };
  expect(validateGenerationRequest(input)).toEqual(input);
  for (const change of [
    { feature: 'unknown' },
    { requestId: '' },
    { specification: '' },
    { specification: 'x'.repeat(8001) },
    { learnerId: 'child' },
    { maxCost: 0 },
  ])
    expect(() => validateGenerationRequest({ ...input, ...change })).toThrow();
});
it('uses integer micro-euros and never accepts a cap above the agreed ceiling', () => {
  for (const cap of [0, 1, 10_000_000])
    expect(validateMonthlyCap(cap)).toBe(cap);
  for (const cap of [-1, 10_000_001, 0.1, NaN, Infinity, '100'])
    expect(() => validateMonthlyCap(cap as number)).toThrow();
  expect(generationPolicy.maxAttempts).toBe(3);
  expect(generationPolicy.timeoutMs).toBeLessThan(generationPolicy.leaseMs);
});
