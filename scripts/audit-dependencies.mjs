import { spawnSync } from 'node:child_process';

// Production dependencies never inherit the development-tool exception.
const production = spawnSync(
  'npm',
  ['audit', '--omit=dev', '--audit-level=high'],
  { stdio: 'inherit' },
);
if (production.status !== 0) process.exit(1);
const result = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' });
if (![0, 1].includes(result.status))
  throw new Error('Dependency audit could not complete.');
const audit = JSON.parse(result.stdout);
if (audit.error || !audit.metadata || !audit.vulnerabilities)
  throw new Error('Dependency audit did not return a valid report.');

// See docs/engineering/tooling-risks.md; no upstream patch as of 2026-10-16.
const advisory = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm';
const affectedTools = new Set([
  '@next/eslint-plugin-next',
  'braces',
  'eslint-config-next',
  'fast-glob',
  'micromatch',
]);
let unreviewed = false;
for (const [name, vulnerability] of Object.entries(audit.vulnerabilities)) {
  if (!['high', 'critical'].includes(vulnerability.severity)) continue;
  const known =
    affectedTools.has(name) &&
    vulnerability.via.length > 0 &&
    vulnerability.via.every((cause) =>
      typeof cause === 'string'
        ? affectedTools.has(cause)
        : cause.url === advisory,
    );
  console.log(
    `${known ? 'Documented development risk' : 'UNREVIEWED'}: ${name} (${vulnerability.severity})`,
  );
  if (!known) unreviewed = true;
}
console.log('Full audit totals:', audit.metadata.vulnerabilities);
if (unreviewed) process.exit(1);
