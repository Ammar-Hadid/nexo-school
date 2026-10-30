import { expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { canonicalJson } from '../../modules/content/content-records';
vi.mock('server-only', () => ({}));
import { familySourceMatches } from './family-source-compatibility';
import spelling from '../../modules/content/family-review/spelling-doubling-workflow-v3.json';
import { currentFamilyPackage, familyPackageHash } from './family-review';
import { parseIntegerAnswer } from '../../modules/practice/assignment/submission-state';
it('pins exact source, inventory and representative bytes with exhaustive independent arithmetic checks', () => {
  const pkg = currentFamilyPackage();
  expect(createHash('sha256').update(canonicalJson(pkg)).digest('hex')).toBe(
    familyPackageHash,
  );
  for (const file of Object.keys(pkg.sources))
    expect(
      familySourceMatches(
        pkg,
        file,
        createHash('sha256').update(readFileSync(file)).digest('hex'),
      ),
    ).toBe(true);
  expect(pkg.examples.map((i) => i.index)).toEqual([
    0, 9, 90, 45, 55, 79, 99, 22, 19,
  ]);
  for (const item of pkg.inventory) {
    const expected = [
      ...Array(Math.floor(item.index / 10)),
      ...Array(item.index % 10),
    ].length;
    expect(item.answer).toBe(String(expected));
    expect(parseIntegerAnswer(` 00${expected} `)).toBe(item.answer);
  }
  expect(pkg.examples[1]!.exposureKey).toBe(pkg.examples[2]!.exposureKey);
  expect(pkg.automaticPublication).toBe(false);
});

it('build preflight refuses source drift instead of reusing a prior human package', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } =
    await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { dirname, join, resolve } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const folder = mkdtempSync(join(tmpdir(), 'nexo-family-source-'));
  try {
    const pkg = currentFamilyPackage();
    const file = 'src/modules/content/family-review/addition-digits-v2.json';
    mkdirSync(dirname(join(folder, file)), { recursive: true });
    writeFileSync(join(folder, file), JSON.stringify(pkg));
    const historical =
      'src/modules/content/family-review/optellen-review-package.json';
    writeFileSync(join(folder, historical), readFileSync(historical));
    const second =
      'src/modules/content/family-review/addition-two-digits-v1.json';
    writeFileSync(join(folder, second), readFileSync(second));
    writeFileSync(
      join(
        folder,
        'src/modules/content/family-review/spelling-doubling-workflow-v3.json',
      ),
      JSON.stringify(spelling),
    );
    for (const source of new Set([
      ...Object.keys(pkg.sources),
      ...Object.keys(spelling.sources),
    ])) {
      mkdirSync(dirname(join(folder, source)), { recursive: true });
      writeFileSync(join(folder, source), readFileSync(source));
    }
    const run = () =>
      spawnSync(
        process.execPath,
        [resolve('scripts/check-optellen-review.mjs')],
        { cwd: folder, encoding: 'utf8' },
      );
    expect(run().status).toBe(0);
    writeFileSync(
      join(folder, 'src/server/content/teaching-addition-family.ts'),
      'changed source',
    );
    const failed = run();
    expect(failed.status).not.toBe(0);
    expect(failed.stderr).toContain('Optellen review package is stale');
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
