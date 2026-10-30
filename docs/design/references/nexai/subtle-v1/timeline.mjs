// Conservative motion of approved layers; no generated frames or shape morphing.
export const durations = { blink: 1800, wave: 2600, calm: 6000 };
export const restGap = 6000;
const waveKeys = [
  [0, 0],
  [400, -8],
  [750, 12],
  [1100, -12],
  [1450, 12],
  [1800, -8],
  [2200, 0],
  [2600, 0],
];
const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2;
function waveAngle(t) {
  const index = waveKeys.findIndex(([at]) => at >= t);
  if (index <= 0) return 0;
  const [a, x] = waveKeys[index - 1];
  const [b, y] = waveKeys[index];
  return x + (y - x) * ease((t - a) / (b - a));
}
export function poseAt(motion, elapsed) {
  const duration = durations[motion];
  const t = Number.isFinite(elapsed)
    ? Math.max(0, Math.min(duration, elapsed))
    : 0;
  const blink =
    motion === 'wave'
      ? (t >= 590 && t < 710) || (t >= 1920 && t < 2040)
      : motion === 'calm'
        ? t >= 2800 && t < 2920
        : t >= 650 && t < 770;
  // Uniform scaling about the grounded feet preserves the master's proportions.
  const scale =
    motion === 'calm'
      ? 1 + (0.003 * (1 - Math.cos((2 * Math.PI * t) / duration))) / 2
      : 1;
  return {
    angle: motion === 'wave' ? waveAngle(t) : 0,
    blink: Number(blink),
    scale,
  };
}
