import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Pose = {
  id: string;
  asset: string;
  sha256: string;
  duration: number;
  rest: number;
  origin: string;
  keys: [number, number, number, number, number][];
};
const folder = 'docs/design/references/nexai/pose-motion-v1';
const { poses }: { poses: Pose[] } = JSON.parse(
  readFileSync(`${folder}/motions.json`, 'utf8'),
);
const approved: { poses: Pick<Pose, 'id' | 'sha256'>[] } = JSON.parse(
  readFileSync('docs/design/references/nexai/poses-v2/catalogue.json', 'utf8'),
);

describe('Approved Nexai pose motion contract', () => {
  it('covers every approved pose exactly once and uses its unchanged artwork', () => {
    expect(poses.map((p) => p.id)).toEqual(approved.poses.map((p) => p.id));
    expect(new Set(poses.map((p) => p.id)).size).toBe(24);
    for (const pose of poses) {
      const hash = createHash('sha256')
        .update(readFileSync(resolve(folder, pose.asset)))
        .digest('hex');
      expect(hash).toBe(approved.poses.find((p) => p.id === pose.id)?.sha256);
      expect(pose.sha256).toBe(hash);
    }
  });

  it('returns to exact rest and uses ordered finite keyframes with deliberate rests', () => {
    for (const pose of poses) {
      expect(pose.keys[0]).toEqual([0, 0, 0, 0, 1]);
      expect(pose.keys.at(-1)).toEqual([1, 0, 0, 0, 1]);
      expect(pose.duration).toBeGreaterThanOrEqual(2000);
      expect(pose.duration).toBeLessThanOrEqual(6500);
      expect(pose.rest).toBeGreaterThanOrEqual(6000);
      let previous = -1;
      for (const key of pose.keys) {
        expect(key.every(Number.isFinite)).toBe(true);
        expect(key[0]).toBeGreaterThan(previous);
        previous = key[0];
      }
    }
  });

  it('bounds all motion to the stage gutter without anisotropic distortion', () => {
    // Conservative envelope: covers the entire square PNG, even transparent margins.
    // A 1deg turn about any pivot inside the image displaces a corner <= sqrt(2)*sin(1deg).
    // Combined maxima remain below 5% of image width; the stage provides >=18px padding.
    for (const pose of poses) {
      const origin = pose.origin.split(' ').map(parseFloat);
      expect(origin.every((x) => x >= 0 && x <= 100)).toBe(true);
      for (const [, x, y, angle, scale] of pose.keys) {
        expect(Math.abs(angle)).toBeLessThanOrEqual(1);
        expect(Math.abs(x)).toBeLessThanOrEqual(2);
        expect(Math.abs(y)).toBeLessThanOrEqual(2);
        expect(scale).toBeGreaterThanOrEqual(1);
        expect(scale).toBeLessThanOrEqual(1.012);
        const displacement =
          Math.max(Math.abs(x), Math.abs(y)) / 100 +
          Math.SQRT2 *
            (scale - 1 + scale * Math.sin((Math.abs(angle) * Math.PI) / 180));
        expect(displacement).toBeLessThan(0.05);
      }
    }
  });
});
