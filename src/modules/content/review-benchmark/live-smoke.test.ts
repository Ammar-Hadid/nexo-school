import { expect, it } from 'vitest';
import { validateGenerationRequest } from '../generation-policy';
import { benchmarkModels } from './setup';
import {
  smokeSpecification,
  smokeRequestId,
  smokePolicy,
  readSmokeSpecification,
  usageCeilingMicroEur,
} from './live-smoke';

it('binds the authorized smoke to c01, two separate stages and seven exact models', () => {
  for (const { model } of benchmarkModels)
    for (const stage of ['solve', 'semantic'] as const) {
      const spec = smokeSpecification(model, stage);
      expect(() =>
        validateGenerationRequest({
          requestId: smokeRequestId(model, stage),
          feature: 'review',
          specification: spec,
        }),
      ).not.toThrow();
      expect(readSmokeSpecification(spec)).toMatchObject({
        model,
        stage,
        id: 'c01',
      });
      const policy = smokePolicy(spec);
      expect(policy.maxAttempts).toBe(1);
      expect(policy.reservationMicroEur).toBeGreaterThan(1000);
      expect(policy.reservationMicroEur).toBeLessThanOrEqual(8_000_000);
      if (stage === 'solve')
        expect(JSON.parse(spec)).not.toHaveProperty('answer');
      expect(() =>
        readSmokeSpecification(spec.replace('3 + 4 =', '3 + 5 =')),
      ).toThrow();
    }
  expect(() => smokeSpecification('mistral-small-2603', 'solve')).toThrow();
});

it('charges combined billable usage conservatively and rejects impossible usage', () => {
  const model = 'claude-opus-5-5';
  expect(usageCeilingMicroEur(model, 1000, 1000)).toBe(36_000);
  expect(usageCeilingMicroEur(model, 0, 0)).toBe(0);
  for (const bad of [-1, 1.2, NaN, 2_000_000])
    expect(() => usageCeilingMicroEur(model, bad, 100)).toThrow();
  expect(() => usageCeilingMicroEur(model, 100, 2049)).toThrow();
});
