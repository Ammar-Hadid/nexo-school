import { test } from 'node:test';
import assert from 'node:assert/strict';
import { durations, poseAt } from './timeline.mjs';
test('every clip returns precisely to the unchanged master', () => {
  for (const [name, duration] of Object.entries(durations)) {
    for (const t of [-1, 0, duration, duration + 1, Infinity]) {
      assert.deepEqual(poseAt(name, t), { angle: 0, blink: 0, scale: 1 });
    }
  }
});
test('blink only changes the approved eyelid overlay in its short exposure', () => {
  assert.equal(poseAt('blink', 649).blink, 0);
  assert.deepEqual(poseAt('blink', 650), { angle: 0, blink: 1, scale: 1 });
  assert.equal(poseAt('blink', 770).blink, 0);
});
test('wave preserves approved angle limits and does not rescale the artwork', () => {
  assert.equal(poseAt('wave', 750).angle, 12);
  assert.equal(poseAt('wave', 1100).angle, -12);
  for (let t = 0; t <= durations.wave; t++) {
    const a = poseAt('wave', t);
    assert.ok(a.angle >= -12 && a.angle <= 12);
    assert.equal(a.scale, 1);
    if (t) assert.ok(Math.abs(a.angle - poseAt('wave', t - 1).angle) < 0.12);
  }
});
test('breathing stays within 0.3 percent and never moves the arm independently', () => {
  for (let t = 0; t <= durations.calm; t += 10) {
    const pose = poseAt('calm', t);
    assert.ok(pose.scale >= 1 && pose.scale <= 1.003);
    assert.equal(pose.angle, 0);
  }
});
