/** Presentation only: stored points and assessment evidence retain their original scale. */
export function scoreOutOfTen(points: number | undefined, total: number) {
  if (
    points === undefined ||
    !Number.isFinite(points) ||
    !Number.isInteger(total) ||
    total <= 0 ||
    points < 0 ||
    points > total
  )
    return undefined;
  return ((points / total) * 10).toLocaleString('nl-NL', {
    maximumFractionDigits: 1,
  });
}
