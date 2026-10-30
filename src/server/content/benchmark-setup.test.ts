import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import {
  initializeBenchmarkKeys,
  inspectBenchmarkKeys,
} from './benchmark-setup';

const roots: string[] = [];
const file = () => {
  const root = mkdtempSync(join(tmpdir(), 'nexo-d13-'));
  roots.push(root);
  return join(root, '.env.d13.local');
};
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

it('creates a private blank file without overwriting existing secrets or following symlinks', () => {
  const path = file();
  expect(initializeBenchmarkKeys(path)).toBe('created');
  expect(statSync(path).mode & 0o777).toBe(0o600);
  writeFileSync(path, 'OPENAI_API_KEY=secret-sentinel\n', { mode: 0o600 });
  expect(initializeBenchmarkKeys(path)).toBe('exists');
  expect(readFileSync(path, 'utf8')).toContain('secret-sentinel');
  const link = `${path}.link`;
  symlinkSync(path, link);
  expect(() => inspectBenchmarkKeys(link)).toThrow(
    'PRIVATE_REGULAR_FILE_REQUIRED',
  );
});

it('reports presence only, rejects public keys/duplicates, and cannot invoke a provider', () => {
  const path = file();
  expect(inspectBenchmarkKeys(path).every((key) => !key.present)).toBe(true);
  initializeBenchmarkKeys(path);
  writeFileSync(
    path,
    'OPENAI_API_KEY=secret-sentinel\nANTHROPIC_API_KEY=\nGEMINI_API_KEY=replace-me\nMISTRAL_API_KEY="fake-test-key"\n',
  );
  const report = inspectBenchmarkKeys(path);
  expect(report.filter((key) => key.present).map((key) => key.name)).toEqual([
    'OPENAI_API_KEY',
  ]);
  expect(JSON.stringify(report)).not.toContain('secret-sentinel');
  writeFileSync(path, 'OPENAI_API_KEY=one\nOPENAI_API_KEY=two\n');
  expect(() => inspectBenchmarkKeys(path)).toThrow(
    'INVALID_BENCHMARK_KEY_FILE',
  );
  writeFileSync(path, 'NEXT_PUBLIC_OPENAI_API_KEY=nope\n');
  expect(() => inspectBenchmarkKeys(path)).toThrow(
    'INVALID_BENCHMARK_KEY_FILE',
  );
});
