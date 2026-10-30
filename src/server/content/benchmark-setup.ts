import 'server-only';
import {
  closeSync,
  constants,
  fstatSync,
  openSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { parse } from 'dotenv';

const keyNames = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
] as const;
const blank =
  '# D13 API keys — local only. No NEXT_PUBLIC_ prefix. Never commit or paste into chat.\n# Filling this file does not enable or authorize paid calls.\n' +
  keyNames.map((name) => `${name}=\n`).join('');

export function initializeBenchmarkKeys(path: string) {
  try {
    writeFileSync(path, blank, { flag: 'wx', mode: 0o600 });
    return 'created' as const;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST')
      return 'exists' as const;
    throw new Error('BENCHMARK_KEY_FILE_CREATE_FAILED');
  }
}

/** Reads only the explicitly selected file; no environment dump or network validation. */
export function readBenchmarkKeys(
  path: string,
): Partial<Record<(typeof keyNames)[number], string>> {
  let handle: number;
  try {
    handle = openSync(
      path,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
      return {};
    throw new Error('PRIVATE_REGULAR_FILE_REQUIRED');
  }
  let source: string;
  try {
    const stat = fstatSync(handle);
    if (!stat.isFile() || stat.size > 16_384 || (stat.mode & 0o077) !== 0)
      throw new Error('PRIVATE_REGULAR_FILE_REQUIRED');
    source = readFileSync(handle, 'utf8');
  } finally {
    closeSync(handle);
  }
  const seen = new Set<string>();
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = /^([A-Z_]+)=(.*)$/.exec(line);
    if (
      !match ||
      ![...keyNames, 'MISTRAL_API_KEY'].some((name) => name === match[1]) ||
      seen.has(match[1]!)
    )
      throw new Error('INVALID_BENCHMARK_KEY_FILE');
    seen.add(match[1]!);
  }
  const values = parse(source);
  return Object.fromEntries(
    keyNames.map((name) => [name, values[name]?.trim() ?? '']),
  );
}

export function inspectBenchmarkKeys(path: string) {
  const values = readBenchmarkKeys(path);
  return keyNames.map((name) => {
    const value = values[name]?.trim() ?? '';
    return {
      name,
      present:
        value.length > 0 && !/^(replace[-_ ]?me|your[-_ ]|<)/i.test(value),
    };
  });
}
