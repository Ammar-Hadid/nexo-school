// A pose is never a frame: only the opacity of its registered eye patches changes.
export const duration = 2800;
export function pawAt(time: number, amplitude: number) {
  if (time <= 250 || time >= 2250) return 0;
  const progress = (time - 250) / 2000;
  return (
    amplitude *
    Math.sin(progress * Math.PI) ** 2 *
    Math.sin(progress * Math.PI * 4)
  );
}
export function pulse(
  time: number,
  start: number,
  close: number,
  hold: number,
  open: number,
) {
  const t = time - start;
  if (t <= 0 || t >= close + hold + open) return 0;
  if (t < close) return t / close;
  if (t < close + hold) return 1;
  return 1 - (t - close - hold) / open;
}
export function eyesAt(mode: string, time: number) {
  const blink = pulse(time, 500, 45, 100, 85);
  if (mode === 'peek') {
    const peek = pulse(time, 450, 110, 650, 100);
    return [peek, peek];
  }
  if (mode === 'slow') {
    const slow = pulse(time, 550, 95, 240, 160);
    return [slow, slow];
  }
  if (mode === 'wink') {
    const wink = pulse(time, 500, 65, 280, 120);
    const last = pulse(time, 1850, 45, 90, 85);
    return [Math.max(wink, last), last];
  }
  const second = pulse(time, 1640, 45, 90, 85);
  return [Math.max(blink, second), Math.max(blink, second)];
}
