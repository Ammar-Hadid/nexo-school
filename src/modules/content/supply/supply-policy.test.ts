import { expect, it } from 'vitest';
import {
  amsterdamWeek,
  selectSupply,
  reviewCapacity,
  type StockItem,
} from './supply-policy';
const stock = (n: number): StockItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `v${i}`,
    exposureKey: `pair${i}`,
    eligible: true,
  }));
it('uses Amsterdam Monday boundaries, including DST, instead of caller-selected weeks', () => {
  expect(amsterdamWeek(new Date('2026-10-25T23:30:00Z'))).toBe('2026-10-26');
  expect(amsterdamWeek(new Date('2026-10-25T22:30:00Z'))).toBe('2026-10-19');
});
it('caps cumulative admissions, carries old pending work and never refunds rejections', () => {
  expect(reviewCapacity(0, 0, 0, 0)).toBe(10);
  expect(reviewCapacity(7, 7, 0, 0)).toBe(3);
  expect(reviewCapacity(7, 0, 0, 0)).toBe(3);
  expect(reviewCapacity(0, 10, 10, 0)).toBe(0);
  expect(reviewCapacity(0, 0, 0, 900000)).toBe(0);
  expect(reviewCapacity(0, 0, 0, 850000)).toBe(0);
  expect(() => reviewCapacity(-1, 0, 0, 0)).toThrow();
});
it('reuses published stock, deduplicates commuted pairs, excludes recent exposure and never fills a shortage with unchecked stock', () => {
  const items = [
    ...stock(3),
    { id: 'commuted', exposureKey: 'pair0', eligible: true },
    { id: 'bad', exposureKey: 'bad', eligible: false },
  ];
  const result = selectSupply(600, items, new Set(['pair1']), ['v0']);
  expect(result.readyIds).toEqual(['v0', 'v2']);
  expect(result.shortage).toBe(598);
  expect(selectSupply(2, items, new Set(), ['v2'])).toEqual({
    readyIds: ['v2', 'v0'],
    shortage: 0,
  });
  expect(() => selectSupply(0, items, new Set(), [])).toThrow();
});
