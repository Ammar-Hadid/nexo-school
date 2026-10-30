import fs from 'node:fs';
import { PNG } from 'pngjs';
import { inspectSprites } from './sprite-isolation.mjs';
const names = [
  'back',
  'wave',
  'yawn',
  'groom',
  'stretch',
  'sleep',
  'think',
  'blink',
  'curious',
  'celebrate',
  'knead',
  'peek',
];
const result = {},
  evidence = {};
for (const name of names) {
  const png = PNG.sync.read(
    fs.readFileSync(`public/nexai/motion-v2/${name}.png`),
  );
  const frames = inspectSprites(png);
  if (frames.length !== 12)
    throw new Error(`${name}: expected12 frames, got${frames.length}`);
  // A belly-up cat rests on his back, not on the distant tail tip.
  if (name === 'back')
    for (let i = 2; i <= 9; i++) {
      const f = frames[i];
      f.anchor[0] = f.rect[0] + f.rect[2] / 2;
    }
  result[name] = {
    width: png.width,
    height: png.height,
    frames: frames.map(({ rect, path, anchor }) => ({ rect, path, anchor })),
  };
  evidence[name] = frames.map(({ foreignBefore, foreignAfter }) => ({
    foreignBefore,
    foreignAfter,
  }));
  if (frames.some((f) => f.foreignAfter))
    throw new Error(`${name}: foreign pixel in mask`);
}
fs.writeFileSync(
  'src/components/nexai/nexai-sprite-bounds.json',
  JSON.stringify(result, null, 2) + '\n',
);
fs.writeFileSync(
  '.artifacts/nexai-fix/isolation.json',
  JSON.stringify(evidence, null, 2) + '\n',
);
console.log(
  'Foreign opaque pixels in old rectangles:',
  Object.values(evidence)
    .flat()
    .reduce((n, f) => n + f.foreignBefore, 0),
);
console.log(
  'Foreign opaque pixels after isolation:',
  Object.values(evidence)
    .flat()
    .reduce((n, f) => n + f.foreignAfter, 0),
);
