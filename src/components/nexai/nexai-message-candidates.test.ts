import { expect, it } from 'vitest';
import {
  messageCandidates,
  messageCategories,
  messageCatalogueVersion,
} from './nexai-message-candidates';
import { nexaiLibrary } from './nexai-library';
import {
  decodeReviews,
  ratingsStorageKey,
  reviewExport,
} from './nexai-message-ratings';

it('provides 240 individually identified messages in 12 categories of 20', () => {
  expect(messageCategories).toHaveLength(12);
  expect(messageCandidates).toHaveLength(240);
  expect(new Set(messageCandidates.map((item) => item.id)).size).toBe(240);
  expect(
    new Set(messageCandidates.map((item) => item.text.toLocaleLowerCase('nl')))
      .size,
  ).toBe(240);
  for (const group of messageCategories) {
    expect(group.messages).toHaveLength(20);
    expect(nexaiLibrary.some((pose) => pose.id === group.pose)).toBe(true);
    for (const item of group.messages) {
      expect(item.text.length).toBeGreaterThan(8);
      expect(item.text.length).toBeLessThanOrEqual(62);
      expect(item.text.split(/\s+/).length).toBeLessThanOrEqual(13);
      expect(item.text).not.toMatch(/sessie|gamepas|https?:/i);
    }
  }
});
it('keeps catalogue 1 ratings separate from the rewritten catalogue', () => {
  expect(messageCatalogueVersion).toBe('nexai-messages-v2');
  expect(ratingsStorageKey).toBe('nexai-messages-v2:reviews');
  expect(() =>
    decodeReviews(
      JSON.stringify({
        version: 'nexai-messages-v1',
        reviews: { 'welcome-01': { rating: 'keep', note: 'Old wording' } },
      }),
    ),
  ).toThrow('Unknown review format');
});
it('round-trips ratings and notes in an export with the exact reviewed texts', () => {
  const reviews = {
    'ready-01': { rating: 'revise' as const, note: 'Korter graag.' },
  };
  const exported = reviewExport(reviews);
  expect(decodeReviews(JSON.stringify(exported))).toEqual(reviews);
  expect(exported.candidates).toHaveLength(240);
  expect(
    exported.candidates.find((item) => item.id === 'ready-01')?.review,
  ).toEqual(reviews['ready-01']);
});
it('rejects invalid formats and discards unknown IDs or invalid ratings', () => {
  expect(decodeReviews(null)).toEqual({});
  expect(() => decodeReviews('broken')).toThrow();
  expect(() => decodeReviews('{"version":"old","reviews":{}}')).toThrow();
  expect(
    decodeReviews(
      JSON.stringify({
        version: messageCatalogueVersion,
        reviews: {
          unknown: { rating: 'keep' },
          'ready-01': { rating: 'invalid' },
          'ready-02': { rating: 'keep', note: 'x'.repeat(501) },
        },
      }),
    ),
  ).toEqual({ 'ready-02': { rating: 'keep', note: 'x'.repeat(500) } });
});
