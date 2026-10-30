import { createHash } from 'node:crypto';
import { familySourceMatches } from '../src/server/content/family-source-compatibility.ts';
import { readFileSync } from 'node:fs';
// Historical v1 remains immutable evidence; its old workflow source attestation is not reused.
const historical =
  'src/modules/content/family-review/optellen-review-package.json';
if (
  createHash('sha256').update(readFileSync(historical)).digest('hex') !==
  'f1fbf556a2cc733eff7c6f2430f95b5f74e5175db8c317a95eef14086513185e'
)
  throw new Error('Historical v1 package was changed');
const paths = [
  'addition-digits-v2.json',
  'addition-two-digits-v1.json',
  'spelling-doubling-workflow-v3.json',
];
for (const file of paths) {
  const pkg = JSON.parse(
    readFileSync(`src/modules/content/family-review/${file}`, 'utf8'),
  );
  for (const path of Object.keys(pkg.sources))
    if (
      !familySourceMatches(
        pkg,
        path,
        createHash('sha256').update(readFileSync(path)).digest('hex'),
      )
    )
      throw new Error(
        `Optellen review package is stale: ${path}. Prepare a new version; do not carry forward a certificate.`,
      );
}
console.log(
  'Active family source fingerprints match. Historical v1 is retained, not recertified. Human approval/publication is not inferred.',
);
