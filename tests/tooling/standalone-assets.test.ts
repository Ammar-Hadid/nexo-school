import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';

it('packages only registered artwork, removes stale public output and rejects changed pixels', () => {
  const root = mkdtempSync(join(tmpdir(), 'nexo-assets-'));
  const script = resolve('scripts/package-standalone.mjs');
  const put = (path: string, value: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), value);
  };
  try {
    const hash = createHash('sha256').update('approved pixels').digest('hex');
    put('.next/static/media/font.ttf', 'font');
    put('public/nexai/layered-poses-v1/calm-1.png', 'approved pixels');
    put('public/nexai/layered-poses-v1/calm-1-eyes.png', 'approved pixels');
    put('public/nexai/motion-v2/rest.png', 'unselected');
    put('.next/standalone/public/stale.png', 'stale');
    put(
      'src/components/nexai/nexai-layered-catalogue.json',
      JSON.stringify([
        {
          asset: '/nexai/layered-poses-v1/calm-1.png',
          eyes: '/nexai/layered-poses-v1/calm-1-eyes.png',
          sha256: hash,
          eyeSha256: hash,
        },
      ]),
    );
    execFileSync(process.execPath, [script], { cwd: root });
    expect(
      readFileSync(
        join(root, '.next/standalone/public/nexai/layered-poses-v1/calm-1.png'),
        'utf8',
      ),
    ).toBe('approved pixels');
    expect(
      readFileSync(
        join(root, '.next/standalone/.next/static/media/font.ttf'),
        'utf8',
      ),
    ).toBe('font');
    expect(existsSync(join(root, '.next/standalone/public/stale.png'))).toBe(
      false,
    );
    expect(
      existsSync(join(root, '.next/standalone/public/nexai/motion-v2')),
    ).toBe(false);
    put('public/nexai/layered-poses-v1/calm-1.png', 'changed pixels');
    expect(() =>
      execFileSync(process.execPath, [script], { cwd: root, stdio: 'pipe' }),
    ).toThrow();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
