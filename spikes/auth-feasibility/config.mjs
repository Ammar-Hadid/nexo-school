import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadConfig() {
  const dataDir = resolve(process.env.SPIKE_DATA_DIR || '.data');
  const config = JSON.parse(readFileSync(`${dataDir}/config.json`, 'utf8'));
  const origin = new URL(config.origin);
  if (origin.origin !== config.origin || origin.username || origin.password ||
      !(origin.protocol === 'https:' || (origin.protocol === 'http:' && origin.hostname === 'localhost'))) {
    throw new Error('Use an exact HTTPS origin, or http://localhost for local tests.');
  }
  if (!config.secret || config.secret.length < 32) throw new Error('Missing auth secret. Run setup.');
  return { ...config, dataDir, secure: origin.protocol === 'https:', rpID: origin.hostname };
}
