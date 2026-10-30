import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { rehearsalSpecs } from './rehearsal-batches';
import { deliveryDescriptor } from './delivery-adapters';
import { subjectContentChecks } from './subject-checks';
it('delivers the five exact synthetic specimens through shared subject adapters', () => {
  expect(rehearsalSpecs.flatMap((s) => s.seeds)).toHaveLength(5);
  for (const spec of rehearsalSpecs)
    for (const seed of spec.seeds) {
      expect(subjectContentChecks(seed.payload, spec.rubric)).toEqual([]);
      expect(
        deliveryDescriptor(seed.contentId, seed.payload, spec.rubric),
      ).toMatchObject(seed.descriptor);
      const wrong = structuredClone(seed.payload);
      wrong.privateEvaluation.acceptedAnswers = ['fabricated'];
      expect(deliveryDescriptor(seed.contentId, wrong, spec.rubric)).toBeNull();
      expect(subjectContentChecks(wrong, spec.rubric).length).toBeGreaterThan(
        0,
      );
      expect(
        deliveryDescriptor('unknown', seed.payload, spec.rubric),
      ).toBeNull();
    }
});
it('keeps reading tied to its entire passage and explicit choices, without broadening coverage', () => {
  const spec = rehearsalSpecs[2]!,
    seed = spec.seeds[0]!;
  expect(spec.requirement.code).toBe('begrijpend-lezen:informatie-vinden:01');
  expect(seed.payload.learner.passage.split('\n\n')).toHaveLength(6);
  expect(seed.payload.privateEvaluation.acceptedAnswers).toEqual([
    'Om een rustige plek en voedsel voor bijen te maken.',
  ]);
  const wrong = structuredClone(seed.payload);
  wrong.learner.passage += ' Een gewijzigde passage.';
  expect(deliveryDescriptor(seed.contentId, wrong, spec.rubric)).toBeNull();
  expect(subjectContentChecks(wrong, spec.rubric).length).toBeGreaterThan(0);
});
