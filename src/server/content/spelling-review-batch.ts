import 'server-only';
import coverage from '../../modules/curriculum/required-coverage.json';
import { doublingBank } from '../../modules/practice/spelling/doubling-family';
import {
  spellingPayload,
  spellingRubric,
  spellingRules,
} from '../../modules/content/spelling/doubling-content';
/** Subject-owned data only; commands, timing, auth and publication stay in shared review/records. */
export const spellingReviewSpec = {
  id: 'd21-spelling-doubling-v1',
  title: 'Spelling · medeklinkerverdubbeling — proefset',
  rubricId: 'd2100000-0000-4000-8000-000000000001',
  rubric: spellingRubric,
  rules: spellingRules,
  requirement: coverage.find((r) => r.code === 'spelling:regelwoorden:04')!,
  provenance: 'deterministic-check' as const,
  seeds: doublingBank.map((w, i) => ({
    contentId: `d2100000-0000-4000-8000-${String(i + 11).padStart(12, '0')}`,
    title: w.singular,
    payload: spellingPayload(i),
    advisory: 'clear' as const,
    note: 'Vaste woordenbank en technische controles akkoord. Geen AI gebruikt. Onderwijskundige geschiktheid en uitleg vragen nog menselijke beoordeling.',
  })),
};
