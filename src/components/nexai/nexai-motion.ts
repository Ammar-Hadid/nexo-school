import bounds from './nexai-sprite-bounds.json';
type Exposure = readonly [frame: number, milliseconds: number];
/** Prior v2.1 cel playback. Rejected generated in-betweens are not loaded. */
function clip(label: string, description: string, frames: readonly Exposure[]) {
  const paced = frames.map(
    ([frame, ms]) => [frame, Math.round((ms * 1.3) / 10) * 10] as const,
  );
  return {
    label,
    description,
    frames: paced,
    duration: paced.reduce((n, [, ms]) => n + ms, 0),
  };
}
export const motions = {
  blink: clip(
    'Een rustig knipoogje',
    'Zachte ogen, een korte knippering en weer aandachtig kijken.',
    [
      [0, 120],
      [1, 70],
      [2, 120],
      [1, 70],
      [0, 120],
    ],
  ),
  wave: clip(
    'Even hallo zeggen',
    'Poot van de grond, een kleine zwaai en weer rustig neerzetten.',
    [
      [0, 180],
      [1, 100],
      [2, 100],
      [3, 110],
      [4, 140],
      [3, 120],
      [4, 140],
      [3, 110],
      [2, 120],
      [0, 220],
    ],
  ),
  curious: clip(
    'Wat hoor ik daar?',
    'Zijn blik en hoofd draaien; zijn poten blijven op de grond.',
    [
      [0, 200],
      [1, 100],
      [2, 120],
      [3, 300],
      [2, 100],
      [1, 90],
      [0, 100],
      [6, 100],
      [7, 280],
      [6, 90],
      [0, 200],
    ],
  ),
  think: clip(
    'Even nadenken',
    'Poot onder zijn kin, ogen omhoog, een idee en weer ontspannen.',
    [
      [0, 180],
      [1, 180],
      [2, 100],
      [3, 160],
      [4, 240],
      [5, 300],
      [6, 200],
      [8, 120],
      [9, 100],
      [0, 220],
    ],
  ),
  yawn: clip(
    'Een flinke gaap',
    'Zijn kaak opent, een poot gaat voor zijn mond en zakt weer terug.',
    [
      [0, 180],
      [1, 140],
      [2, 150],
      [3, 100],
      [4, 180],
      [5, 320],
      [6, 160],
      [7, 140],
      [8, 120],
      [9, 150],
      [0, 220],
    ],
  ),
  groom: clip(
    'Pootje wassen',
    'Poot naar zijn mond, twee likjes en weer neerzetten.',
    [
      [0, 180],
      [1, 100],
      [2, 130],
      [3, 100],
      [4, 100],
      [5, 100],
      [4, 120],
      [5, 100],
      [4, 160],
      [2, 100],
      [1, 100],
      [0, 220],
    ],
  ),
  stretch: clip(
    'Lekker uitrekken',
    'Voorpoten vooruit, rug buigen, achterhand omhoog en terug gaan zitten.',
    [
      [0, 200],
      [1, 120],
      [2, 130],
      [3, 140],
      [4, 180],
      [5, 260],
      [6, 220],
      [7, 130],
      [8, 120],
      [9, 130],
      [10, 160],
      [0, 220],
    ],
  ),
  back: clip(
    'Op zijn rug rollen',
    'Via zijn zij op zijn rug, poten in de lucht en rustig weer overeind.',
    [
      [0, 200],
      [1, 110],
      [2, 120],
      [3, 140],
      [4, 160],
      [5, 180],
      [6, 200],
      [7, 340],
      [6, 180],
      [5, 180],
      [4, 140],
      [8, 140],
      [9, 130],
      [10, 140],
      [0, 240],
    ],
  ),
  sleep: clip(
    'Een klein dutje',
    'Hij gaat liggen, krult zich op, sluit zijn ogen en wordt weer wakker.',
    [
      [0, 180],
      [1, 180],
      [2, 140],
      [3, 160],
      [4, 160],
      [5, 420],
      [6, 440],
      [7, 220],
      [8, 160],
      [9, 160],
      [10, 140],
      [0, 220],
    ],
  ),
  knead: clip(
    'Zachte pootjes',
    'Om en om drukken zijn voorpoten, zoals een tevreden kat doet.',
    [
      [0, 180],
      [1, 120],
      [2, 140],
      [3, 140],
      [2, 140],
      [3, 140],
      [6, 160],
      [7, 160],
      [6, 160],
      [7, 160],
      [8, 220],
      [9, 120],
      [0, 240],
    ],
  ),
  peek: clip(
    'Kiekeboe',
    'Twee poten voor zijn ogen, even spieken en een vrolijk gezicht.',
    [
      [0, 200],
      [1, 140],
      [2, 110],
      [3, 110],
      [4, 260],
      [5, 240],
      [6, 160],
      [7, 200],
      [8, 120],
      [9, 100],
      [0, 220],
    ],
  ),
  celebrate: clip(
    'Dat verdient applaus',
    'Beide poten komen samen voor twee kleine klapjes.',
    [
      [0, 140],
      [1, 120],
      [2, 100],
      [3, 100],
      [4, 80],
      [5, 140],
      [6, 80],
      [7, 140],
      [8, 120],
      [9, 120],
      [0, 200],
    ],
  ),
} as const;
export type NexaiMotion = keyof typeof motions;
export const ambientSequence: NexaiMotion[] = [
  'blink',
  'curious',
  'groom',
  'think',
  'knead',
  'stretch',
  'peek',
  'yawn',
  'back',
  'sleep',
];
export const quietSequence: NexaiMotion[] = [
  'blink',
  'curious',
  'blink',
  'think',
];
export const motionTiming = { ambientRest: 6500, exerciseRest: 12000 };
export function motionFrame(name: NexaiMotion, elapsed: number) {
  const animation = motions[name];
  const { frames, duration } = animation;
  if (!Number.isFinite(elapsed) || elapsed <= 0 || elapsed >= duration)
    return 0;
  let end = 0;
  for (const [frame, exposure] of frames) {
    end += exposure;
    if (elapsed < end) return frame;
  }
  return 0;
}
export function spriteFrame(name: NexaiMotion, index: number) {
  const sheet = bounds[name];
  const frame = sheet.frames[index] ?? sheet.frames[0]!;
  const [x, y, width, height] = frame.rect as [number, number, number, number];
  // One scale per sheet: a lying cat stays shorter than a sitting cat.
  const scale = 350 / sheet.frames[0]!.rect[3]!;
  return {
    source: `/nexai/motion-v2/${name}.png`,
    viewBox: `${x} ${y} ${width} ${height}`,
    x: 240 + (x - frame.anchor[0]!) * scale,
    y: 445 + (y - frame.anchor[1]!) * scale,
    width: width * scale,
    height: height * scale,
    isolation: frame.path,
    sheetWidth: sheet.width,
    sheetHeight: sheet.height,
  };
}
