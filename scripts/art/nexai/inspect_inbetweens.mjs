// Read-only image analysis: writes geometry/manifest, never modifies raster pixels.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { PNG } from 'pngjs';
import { inspectSprites } from './sprite-isolation.mjs';

const directory = 'public/nexai/motion-v3';
const result = {},
  files = [];
for (const filename of fs
  .readdirSync(directory)
  .filter((name) => name.endsWith('.png'))
  .sort()) {
  const path = `${directory}/${filename}`;
  const bytes = fs.readFileSync(path);
  const png = PNG.sync.read(bytes);
  const frames = inspectSprites(png);
  if (frames.length !== 12 || frames.some((frame) => frame.foreignAfter)) {
    throw new Error(`${filename}: expected 12 isolated full-body candidates`);
  }
  result[filename.replace('.png', '')] = {
    width: png.width,
    height: png.height,
    frames: frames.map(({ rect, path, anchor }) => ({ rect, path, anchor })),
  };
  files.push({
    path,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    width: png.width,
    height: png.height,
    candidates: frames.length,
    foreignOpaquePixelsAfterClipping: frames.reduce(
      (n, f) => n + f.foreignAfter,
      0,
    ),
  });
}
fs.writeFileSync(
  'docs/design/references/nexai/motion-v3/rejected-playback/nexai-inbetween-bounds.json',
  JSON.stringify(result, null, 2) + '\n',
);
fs.writeFileSync(
  'docs/design/references/nexai/motion-v3/manifest.json',
  JSON.stringify(
    { status: 'In Review', tool: 'built-in image_gen', files },
    null,
    2,
  ) + '\n',
);
console.log(
  `${files.length} sheets / ${files.reduce((n, f) => n + f.candidates, 0)} candidates isolated. Source images unchanged.`,
);
