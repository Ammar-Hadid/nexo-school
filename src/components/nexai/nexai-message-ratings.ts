import {
  messageCandidates,
  messageCatalogueVersion,
} from './nexai-message-candidates';
export type MessageRating = 'keep' | 'revise' | 'remove';
export type MessageReviews = Record<
  string,
  { rating: MessageRating; note: string }
>;
export const ratingsStorageKey = `${messageCatalogueVersion}:reviews`;
const known = new Set(messageCandidates.map((message) => message.id));
export function decodeReviews(raw: string | null): MessageReviews {
  if (!raw) return {};
  const data: unknown = JSON.parse(raw);
  if (
    !data ||
    typeof data !== 'object' ||
    !('version' in data) ||
    data.version !== messageCatalogueVersion ||
    !('reviews' in data) ||
    !data.reviews ||
    typeof data.reviews !== 'object'
  )
    throw new Error('Unknown review format');
  const reviews: MessageReviews = {};
  for (const [id, value] of Object.entries(data.reviews)) {
    if (!known.has(id) || !value || typeof value !== 'object') continue;
    if (
      value.rating !== 'keep' &&
      value.rating !== 'revise' &&
      value.rating !== 'remove'
    )
      continue;
    reviews[id] = {
      rating: value.rating,
      note: typeof value.note === 'string' ? value.note.slice(0, 500) : '',
    };
  }
  return reviews;
}
export function reviewExport(reviews: MessageReviews) {
  return {
    version: messageCatalogueVersion,
    reviews,
    candidates: messageCandidates.map((message) => ({
      ...message,
      review: reviews[message.id] ?? null,
    })),
  };
}
