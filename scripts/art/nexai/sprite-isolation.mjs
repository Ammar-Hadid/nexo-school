// Geometry only: inspect alpha to generate exact SVG isolation clips and anchors.
// Source image pixels are never edited.
export function inspectSprites({ width: w, height: h, data }) {
  const labels = new Int32Array(w * h),
    queue = new Int32Array(w * h),
    parts = [];
  let id = 0;
  for (let p = 0; p < w * h; p++) {
    if (labels[p] || data[p * 4 + 3] < 160) continue;
    id++;
    let head = 0,
      tail = 1,
      minX = w,
      minY = h,
      maxX = 0,
      maxY = 0;
    queue[0] = p;
    labels[p] = id;
    while (head < tail) {
      const n = queue[head++],
        x = n % w,
        y = Math.floor(n / w);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (const q of [
        x > 0 ? n - 1 : -1,
        x < w - 1 ? n + 1 : -1,
        n - w,
        n + w,
      ])
        if (q >= 0 && q < w * h && !labels[q] && data[q * 4 + 3] >= 160) {
          labels[q] = id;
          queue[tail++] = q;
        }
    }
    if (tail > 7000)
      parts.push({
        id,
        box: [minX, minY, maxX - minX + 1, maxY - minY + 1],
        pixels: Array.from(queue.subarray(0, tail)),
      });
  }
  parts.sort(
    (a, b) =>
      Math.floor((a.box[1] + a.box[3] / 2) / (h / 3)) -
        Math.floor((b.box[1] + b.box[3] / 2) / (h / 3)) || a.box[0] - b.box[0],
  );
  const major = new Set(parts.map((p) => p.id));
  return parts.map((part) => {
    const [x, y, fw, fh] = part.box;
    const rect = [
      Math.max(0, x - 3),
      Math.max(0, y - 3),
      Math.min(w, x + fw + 3) - Math.max(0, x - 3),
      Math.min(h, y + fh + 3) - Math.max(0, y - 3),
    ];
    const mask = new Uint8Array(w * h);
    for (const p of part.pixels) {
      const px = p % w,
        py = Math.floor(p / w);
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const xx = px + dx,
            yy = py + dy,
            q = yy * w + xx;
          if (
            xx >= 0 &&
            xx < w &&
            yy >= 0 &&
            yy < h &&
            (!major.has(labels[q]) || labels[q] === part.id)
          )
            mask[q] = 1;
        }
    }
    // Exact union of horizontal strips, vertically merge identical strips.
    const strips = [];
    let previous = new Map();
    let foreignBefore = 0,
      foreignAfter = 0;
    for (let yy = rect[1]; yy < rect[1] + rect[3]; yy++) {
      const next = new Map();
      let xx = rect[0];
      while (xx < rect[0] + rect[2]) {
        const q = yy * w + xx;
        if (major.has(labels[q]) && labels[q] !== part.id) {
          foreignBefore++;
          if (mask[q]) foreignAfter++;
        }
        if (!mask[q]) {
          xx++;
          continue;
        }
        const from = xx;
        while (xx < rect[0] + rect[2] && mask[yy * w + xx]) xx++;
        const key = `${from}:${xx}`,
          old = previous.get(key);
        if (old !== undefined) {
          strips[old][3]++;
          next.set(key, old);
        } else {
          next.set(key, strips.length);
          strips.push([from, yy, xx - from, 1]);
        }
      }
      previous = next;
    }
    // Ground-contact centroid anchors the torso; swinging tail tips no longer recenter it.
    const floor = part.pixels.filter((p) => Math.floor(p / w) >= y + fh - 18);
    const anchorX = floor.reduce((n, p) => n + (p % w), 0) / floor.length;
    return {
      rect,
      path: strips
        .map(([a, b, c, d]) => `M${a} ${b}h${c}v${d}h-${c}z`)
        .join(''),
      anchor: [Number(anchorX.toFixed(2)), y + fh],
      foreignBefore,
      foreignAfter,
    };
  });
}
