/** Stable JSON bytes for version fingerprints. Never silently omit unsupported values. */
export function canonicalJson(value: unknown, depth = 0): string {
  if (depth > 20) throw new Error('Record nesting exceeds limit');
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean')
    return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value))
    return JSON.stringify(value);
  if (Array.isArray(value))
    return `[${Array.from(value, (item) => canonicalJson(item, depth + 1)).join(',')}]`;
  if (record(value))
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalJson(value[key], depth + 1)}`,
      )
      .join(',')}}`;
  throw new Error('Record must contain only JSON values');
}
export function record(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
export const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 16000;
export const exact = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).sort().join(',') === [...keys].sort().join(',');
