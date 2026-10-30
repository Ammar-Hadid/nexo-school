import { createHash } from 'node:crypto';
import { canonicalJson } from '../../modules/content/content-records.ts';
import extensions from './family-source-compatibility.json' with { type: 'json' };
/** Exact, reviewed workflow-only extension. Never accepts content drift or transfers approval. */
export function familySourceMatches(
  pkg: { version: string; sources: Record<string, string> },
  path: string,
  actual: string,
) {
  if (actual === pkg.sources[path]) return true;
  const packageHash = createHash('sha256')
    .update(canonicalJson(pkg))
    .digest('hex');
  return extensions.some(
    (e) =>
      e.packageHash === packageHash &&
      e.version === pkg.version &&
      e.path === path &&
      e.previous === pkg.sources[path] &&
      e.current === actual,
  );
}
