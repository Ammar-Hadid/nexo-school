import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

// The approved catalogue is the public runtime allowlist. Never copy the
// historical artwork/review directories or all of public into this package.
const catalogue = JSON.parse(
  await readFile('src/components/nexai/nexai-layered-catalogue.json', 'utf8'),
);
const assets = new Map();
for (const pose of catalogue) {
  for (const [url, hash] of [
    [pose.asset, pose.sha256],
    [pose.eyes, pose.eyeSha256],
  ]) {
    if (!/^\/nexai\/layered-poses-v1\/[a-z]+-[123](?:-eyes)?\.png$/.test(url))
      throw new Error(`Unexpected production asset path: ${url}`);
    const bytes = await readFile(`public${url}`);
    if (createHash('sha256').update(bytes).digest('hex') !== hash)
      throw new Error(`Approved asset fingerprint mismatch: ${url}`);
    assets.set(url, bytes);
  }
}
// Validate before replacing generated output; reruns cannot leave stale assets.
await rm('.next/standalone/public', { recursive: true, force: true });
for (const [url, bytes] of assets) {
  const target = `.next/standalone/public${url}`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
}
// Includes locally bundled approved fonts, CSS and browser chunks.
await rm('.next/standalone/.next/static', { recursive: true, force: true });
await cp('.next/static', '.next/standalone/.next/static', { recursive: true });
console.log(
  `Packaged ${assets.size} approved Nexai assets (${[...assets.values()].reduce((total, bytes) => total + bytes.length, 0)} bytes) plus Next static output.`,
);
