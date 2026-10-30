import { expect, it } from 'vitest';
import {
  canonicalJson,
  contentPayload,
  rubricPayload,
} from './content-records';

it('hash input is deterministic and rejects non-JSON values instead of dropping them', () => {
  expect(canonicalJson({ z: [2, 1], a: { y: true, x: 'é' } })).toBe(
    '{"a":{"x":"é","y":true},"z":[2,1]}',
  );
  for (const value of [
    undefined,
    NaN,
    { x: undefined },
    new Date(),
    { x: Infinity },
  ])
    expect(() => canonicalJson(value)).toThrow();
});
it('rejects empty or incomplete rubric/content envelopes without claiming semantic validation', () => {
  expect(
    rubricPayload({
      criteria: [],
      responsePolicy: 'x',
      evaluatorVersion: 'v1',
    }),
  ).toBe(false);
  expect(
    rubricPayload({
      criteria: ['exact value'],
      responsePolicy: 'integer',
      evaluatorVersion: 'v1',
    }),
  ).toBe(true);
  expect(contentPayload({ prompt: 'x' })).toBe(false);
  expect(
    contentPayload({
      prompt: '1 + 1 =',
      responseSpecification: { type: 'integer' },
      evaluationSpecification: { answer: '2' },
      explanation: 'One and one make two.',
      rights: 'project-authored',
      provenance: 'synthetic-fixture',
    }),
  ).toBe(true);
});
