import type { Blueprint, Facet } from '../assessment-policy';

/** Draft review package only. Never imported by the interactive question bank. */
export const PACKAGE_VERSION = 'getalbegrip-bounded-draft-v1';
export const PREREQUISITE = 'proposed:base-ten-exchange-99:v1';
export const PLACE_VALUE = 'proposed:place-value-999:v1';
// Same ordering construct; the new release/level never transfers old evidence.
export const ORDERING = 'demo:getalbegrip:1';
export const facets: readonly Facet[] = ['procedure', 'concept', 'application'];
const common = {
  version: PACKAGE_VERSION,
  subject: 'rekenen',
  category: 'getalbegrip',
  level: 'proposed-g5-whole-0-999-v1',
} as const;
export const foundationBlueprint: Blueprint = {
  ...common,
  objectives: [{ skill: PREREQUISITE, facets }],
  prerequisites: [],
};
export const targetBlueprint: Blueprint = {
  ...common,
  objectives: [
    { skill: PLACE_VALUE, facets },
    { skill: ORDERING, facets },
  ],
  prerequisites: [PREREQUISITE],
};
export const requiredSkills = [PREREQUISITE, PLACE_VALUE, ORDERING] as const;

export type DraftItem = {
  id: string;
  version: '1';
  pool: 'entry-confirmation' | 'practice-repair' | 'held-out-delayed';
  skill: string;
  facet: Facet;
  family: string;
  representation: string;
  response: 'constructed' | 'choice' | 'unsupported';
  prompt: string;
  key: number | null;
  rubric: string;
  alternativeExplanation: string;
  concern: string;
  difficulty: string;
  rejected: string;
};
