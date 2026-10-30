import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Pose = {
  id: string;
  asset: string;
  eyes: string;
  sha256: string;
  eyeSha256: string;
  mode: string;
  regions: [number, number, number, number][];
  arm?: { amplitude: number; pivot: [number, number] };
};
const folder = resolve('docs/design/references/nexai/layered-poses-v1');
const { poses }: { poses: Pose[] } = JSON.parse(
  readFileSync(`${folder}/motions.json`, 'utf8'),
);
const approved: { poses: { id: string; sha256: string }[] } = JSON.parse(
  readFileSync('docs/design/references/nexai/poses-v2/catalogue.json', 'utf8'),
);
const timelinePath = `${folder}/timeline.mjs`;
const {
  eyesAt,
  pawAt,
  duration,
}: {
  eyesAt: (mode: string, time: number) => [number, number];
  pawAt: (time: number, amplitude: number) => number;
  duration: number;
} = await import(timelinePath);

describe('Localized Nexai pose animation', () => {
  it('preserves all 24 approved bodies and records every matching eye source', () => {
    expect(poses.map((p) => p.id)).toEqual(approved.poses.map((p) => p.id));
    expect(new Set(poses.map((p) => p.eyes)).size).toBe(24);
    for (const pose of poses) {
      for (const [asset, hash] of [
        [pose.asset, pose.sha256],
        [pose.eyes, pose.eyeSha256],
      ]) {
        const image = readFileSync(resolve(folder, asset!));
        expect(createHash('sha256').update(image).digest('hex')).toBe(hash);
        expect(image.readUInt32BE(16)).toBe(1254);
        expect(image.readUInt32BE(20)).toBe(1254);
        expect(image[25]).toBe(6); // RGBA, not a flattened background.
      }
      expect(pose.sha256).toBe(
        approved.poses.find((p) => p.id === pose.id)?.sha256,
      );
    }
  });
  it('isolates two nonoverlapping eye regions within every face', () => {
    for (const pose of poses) {
      expect(pose.regions).toHaveLength(2);
      for (const [cx, cy, rx, ry] of pose.regions) {
        expect(cx - rx).toBeGreaterThan(0);
        expect(cx + rx).toBeLessThan(1254);
        expect(cy - ry).toBeGreaterThan(0);
        expect(cy + ry).toBeLessThan(750);
        expect(rx).toBeGreaterThan(60);
        expect(ry).toBeGreaterThan(50);
      }
      const [left, right] = pose.regions;
      expect(left![0] + left![2]).toBeLessThan(right![0] - right![2]);
    }
  });
  it('changes an eye in every pose, remains bounded and returns exactly to its approved expression', () => {
    for (const pose of poses) {
      expect(eyesAt(pose.mode, 0)).toEqual([0, 0]);
      expect(eyesAt(pose.mode, duration)).toEqual([0, 0]);
      let peak = 0;
      for (let t = 0; t <= duration; t += 10) {
        for (const value of eyesAt(pose.mode, t)) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
          peak = Math.max(peak, value);
        }
      }
      expect(peak).toBe(1);
    }
  });
  it('supports one-eye gestures and a bounded independent paw, without moving the body', () => {
    expect(eyesAt('wink', 700)).toEqual([1, 0]);
    expect(eyesAt('peek', 700)).toEqual([1, 1]);
    for (const pose of poses.filter((p) => p.arm)) {
      expect(pawAt(0, pose.arm!.amplitude)).toBe(0);
      expect(pawAt(duration, pose.arm!.amplitude)).toBe(0);
      for (let t = 0; t <= duration; t += 10)
        expect(Math.abs(pawAt(t, pose.arm!.amplitude))).toBeLessThanOrEqual(5);
    }
  });
});
