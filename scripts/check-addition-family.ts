import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { additionCertificationReport } from '../src/server/content/addition-family.ts';

// Read-only review material. Never writes to PostgreSQL or grants publication authority.
const report = additionCertificationReport();
const sourceHashes = Object.fromEntries(
  [
    'src/server/content/addition-family.ts',
    'src/server/content/addition-family.test.ts',
    'src/modules/content/content-records.ts',
    'src/modules/practice/assignment/submission-state.ts',
  ].map((path) => [
    path,
    createHash('sha256').update(readFileSync(path)).digest('hex'),
  ]),
);
console.log(JSON.stringify({ ...report, sourceHashes }, null, 2));
if (report.mismatches !== 0) process.exitCode = 1;
