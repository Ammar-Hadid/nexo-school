import { describe, expect, it } from 'vitest';
import { items as entry } from './entry-items';
import { items as practice } from './practice-items';
import {
  inspectInventory,
  selectDraftBatch,
  scoreDraft,
  observe,
  assessPackage,
} from './validation-tooling';
import { facets, requiredSkills } from './validation-blueprint';

describe('draft validation tooling; not a live assessment route', () => {
  it('refuses an ambiguous bank identity instead of choosing the first answer key', () => {
    const item = entry[0]!;
    const ambiguous = [...entry, { ...item, key: 40 }];
    expect(
      selectDraftBatch(
        ambiguous,
        [{ skill: item.skill, facet: item.facet }],
        new Set(),
      ),
    ).toEqual([]);
    expect(
      observe(ambiguous, [
        {
          source: 'source',
          item: item.id,
          raw: '4',
          day: 0,
          session: 'entry',
        },
      ]),
    ).toEqual([]);
  });
  it('requires every declared skill/facet and reports rather than fills inventory gaps', () => {
    expect(inspectInventory(entry).missing).toEqual([]);
    expect(inspectInventory(entry.slice(1)).missing).toEqual([
      `${requiredSkills[0]}:procedure`,
    ]);
    const requests = requiredSkills.flatMap((skill) =>
      facets.map((facet) => ({ skill, facet })),
    );
    expect(
      selectDraftBatch(entry, requests.slice(0, 4), new Set()),
    ).toHaveLength(4);
    expect(selectDraftBatch(entry, requests, new Set())).toEqual([]);
    expect(
      selectDraftBatch(entry, requests.slice(0, 1), new Set(['E-F-P'])),
    ).toEqual([]);
    expect(selectDraftBatch(practice, requests.slice(0, 1), new Set())).toEqual(
      [],
    );
  });

  it('distinguishes invalid syntax from valid wrong answers and preserves raw response', () => {
    const item = entry[0]!;
    for (const raw of [
      '',
      ' ',
      '4.0',
      '4,0',
      '-4',
      '+4',
      '4e0',
      '0x4',
      '4 kralen',
      '0000004',
      '٤',
    ])
      expect(scoreDraft(item, raw).status, raw).toBe('invalid');
    expect(scoreDraft(item, '40').status).toBe('incorrect');
    expect(scoreDraft(item, ' 004 ')).toEqual({
      raw: ' 004 ',
      normalized: '004',
      status: 'correct',
    });
  });

  it('deduplicates source attempts and items before projecting evidence; draft review stays synthetic', () => {
    const facts = entry.map((item, i) => ({
      source: `attempt-${i}`,
      item: item.id,
      raw: String(item.key),
      day: item.facet === 'procedure' ? 0 : 1,
      session: item.facet === 'procedure' ? 'entry' : 'confirmation',
    }));
    expect(observe(entry, facts).every((e) => e.review === 'synthetic')).toBe(
      true,
    );
    expect(observe(entry, [...facts, facts[0]!])).toHaveLength(9);
    expect(
      observe(
        entry,
        facts.map((f) => ({ ...f, source: 'same-source' })),
      ),
    ).toHaveLength(1);
    expect(observe(entry, [{ ...facts[0]!, raw: 'ambiguous' }])).toEqual([]);
    expect(assessPackage(observe(entry, facts), 1).decision).toBe(
      'ready-provisional',
    );
  });
});
