import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

// Temporary backport of https://github.com/storybookjs/storybook/pull/36732.
// Keep security-patched Next.js; remove this after upgrading to a tested fixed Storybook.
const require = createRequire(import.meta.url);
const entry = require.resolve('@storybook/nextjs-vite/package.json');
const pkg = JSON.parse(await readFile(entry, 'utf8'));
if (pkg.version !== '10.6.2') {
  throw new Error(
    'Review/remove the Storybook compatibility patch after changing its version.',
  );
}
const target = join(dirname(entry), 'dist/_browser-chunks/chunk-342N7CWU.js');
const original = '          parentCacheNode: newLazyCacheNode,\n';
const patched = `${original}          parentRenderTree: { data: { bfcacheId: 0 } },\n`;
const source = await readFile(target, 'utf8');
if (!source.includes(patched)) {
  if (source.split(original).length !== 2) {
    throw new Error(
      'Storybook router mock changed; refusing an ambiguous compatibility patch.',
    );
  }
  await writeFile(target, source.replace(original, patched));
  console.log(
    'Applied the upstream Storybook Next.js 16.4 router-context fix.',
  );
}
