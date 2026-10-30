import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { nexaiLibrary } from '../../src/components/nexai/nexai-library';
import {
  eyesAt,
  pawAt,
} from '../../src/components/nexai/nexai-layered-timeline';
const reviewPath = resolve('docs/design/references/nexai/layered-poses-v1');
const approved = JSON.parse(readFileSync(`${reviewPath}/motions.json`, 'utf8'));
const originalTiming = await import(`${reviewPath}/timeline.mjs`);
it('distributes all approved pixels, registrations and timings without changing them', () => {
  expect(nexaiLibrary).toHaveLength(24);
  nexaiLibrary.forEach((pose, index) => {
    const { asset, eyes, ...contract } = pose;
    const {
      asset: original,
      eyes: originalEyes,
      ...originalContract
    } = approved.poses[index];
    expect(original).toBeTruthy();
    expect(originalEyes).toBeTruthy();
    expect(contract).toEqual(originalContract);
    for (const [path, expected] of [
      [asset, pose.sha256],
      [eyes, pose.eyeSha256],
    ]) {
      expect(
        createHash('sha256')
          .update(readFileSync(`public${path}`))
          .digest('hex'),
      ).toBe(expected);
    }
    for (let ms = 0; ms <= pose.duration; ms += 10) {
      expect(eyesAt(pose.mode, ms)).toEqual(
        originalTiming.eyesAt(pose.mode, ms),
      );
      expect(pawAt(ms, 5)).toEqual(originalTiming.pawAt(ms, 5));
    }
  });
});
