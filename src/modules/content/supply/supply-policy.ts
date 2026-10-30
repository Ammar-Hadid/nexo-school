export const supplyPolicyVersion = 'd14-optellen-supply-v1';
export const supplyLimits = {
  maxDemand: 600,
  maxNewVersions: 10,
  reviewMs: 900000,
  estimateMs: 90000,
  cooldownDays: 14,
} as const;
export type StockItem = { id: string; exposureKey: string; eligible: boolean };
/** ISO date of Monday in the operator's Amsterdam calendar; never a client-supplied budget period. */
export function amsterdamWeek(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const p = (type: string) => parts.find((p) => p.type === type)!.value;
  const date = new Date(`${p('year')}-${p('month')}-${p('day')}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
export function reviewCapacity(
  admitted: number,
  pending: number,
  oldPending: number,
  measuredMs: number,
) {
  if (
    [admitted, pending, oldPending, measuredMs].some(
      (n) => !Number.isSafeInteger(n) || n < 0,
    )
  )
    throw new Error('INVALID_WORKLOAD');
  const spent = Math.max(admitted * supplyLimits.estimateMs, measuredMs);
  return Math.max(
    0,
    Math.min(
      supplyLimits.maxNewVersions - pending,
      Math.floor(
        (supplyLimits.reviewMs - spent - oldPending * supplyLimits.estimateMs) /
          supplyLimits.estimateMs,
      ),
    ),
  );
}
/** Trusted eligible stock only. Repetition is never used to manufacture fresh stock/evidence. */
export function selectSupply(
  demand: number,
  items: StockItem[],
  recent: ReadonlySet<string>,
  reserved: string[],
) {
  if (
    !Number.isSafeInteger(demand) ||
    demand < 1 ||
    demand > supplyLimits.maxDemand
  )
    throw new Error('INVALID_DEMAND');
  const ordered = [
    ...reserved.flatMap((id) => items.filter((i) => i.id === id)),
    ...items,
  ];
  const seen = new Set<string>(),
    readyIds: string[] = [];
  for (const item of ordered) {
    if (
      !item.eligible ||
      recent.has(item.exposureKey) ||
      seen.has(item.exposureKey)
    )
      continue;
    seen.add(item.exposureKey);
    readyIds.push(item.id);
    if (readyIds.length === demand) break;
  }
  return { readyIds, shortage: demand - readyIds.length };
}
