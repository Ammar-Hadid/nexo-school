import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { arithmeticItem, seedItems } from './arithmetic';
it('certifies every bounded addition against an independent counting oracle', () => {
  for (let left = 0; left <= 9; left++) {
    for (let right = 0; right <= 9; right++) {
      const item = arithmeticItem(left, right);
      const expected = [...Array(left), ...Array(right)].length;
      expect(item.answer).toBe(String(expected));
      expect(item.prompt).toBe(`${left} + ${right} =`);
      expect(item.contentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(arithmeticItem(left, right)).toEqual(item);
    }
  }
  expect(seedItems()).toHaveLength(10);
  expect(new Set(seedItems().map((item) => item.id)).size).toBe(10);
});
it('rejects operands outside the certified integer bounds', () => {
  for (const value of [-1, 10, 1.5, NaN, Infinity]) {
    expect(() => arithmeticItem(value, 1)).toThrow();
    expect(() => arithmeticItem(1, value)).toThrow();
  }
});
