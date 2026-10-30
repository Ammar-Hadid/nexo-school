import { describe, expect, it } from 'vitest';
import {
  motions,
  motionFrame,
  spriteFrame,
  quietSequence,
  type NexaiMotion,
} from './nexai-motion';
describe('Nexai cel animation', () => {
  it('uses only the prior drawings after rejection of generated in-betweens', () => {
    for (const name of Object.keys(motions) as NexaiMotion[]) {
      for (const [frame] of motions[name].frames) {
        expect(spriteFrame(name, frame).source).toBe(
          `/nexai/motion-v2/${name}.png`,
        );
        expect(frame).toBeLessThan(12);
      }
    }
  });
  it('has twelve actions that begin and end with grounded resting paws', () => {
    expect(Object.keys(motions)).toHaveLength(12);
    for (const name of Object.keys(motions) as NexaiMotion[]) {
      expect(motionFrame(name, 0)).toBe(0);
      expect(motionFrame(name, motions[name].duration)).toBe(0);
      expect(motionFrame(name, Infinity)).toBe(0);
    }
  });
  it('plays the back poses and excludes the inconsistent switched-paw wave cels', () => {
    expect(motionFrame('back', 1700)).toBe(7);
    expect(motions.wave.frames.map(([frame]) => frame)).not.toContain(5);
    expect(motions.wave.frames.map(([frame]) => frame)).not.toContain(7);
    expect(quietSequence).not.toContain('back');
    expect(quietSequence).not.toContain('sleep');
  });
  it('keeps complete registered sprites inside the viewport without scaling lying poses up', () => {
    for (const name of Object.keys(motions) as NexaiMotion[]) {
      for (const [frame] of motions[name].frames) {
        const cel = spriteFrame(name, frame);
        expect(cel.x).toBeGreaterThanOrEqual(0);
        expect(cel.y).toBeGreaterThanOrEqual(0);
        expect(cel.x + cel.width).toBeLessThanOrEqual(512);
        expect(cel.y + cel.height).toBeLessThanOrEqual(512);
        expect(cel.viewBox).not.toMatch(/NaN|Infinity|undefined/);
      }
    }
    expect(spriteFrame('back', 7).height).toBeLessThan(
      spriteFrame('back', 0).height,
    );
  });
  it('changes the cel at exposure boundaries and holds a pose for its intended duration', () => {
    expect(motionFrame('blink', 159)).toBe(0);
    expect(motionFrame('blink', 160)).toBe(1);
    expect(motionFrame('blink', 249)).toBe(1);
    expect(motionFrame('blink', 250)).toBe(2);
  });
});
