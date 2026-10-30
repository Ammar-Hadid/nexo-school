'use client';
import { useEffect, useRef, useId } from 'react';
import {
  ambientSequence,
  quietSequence,
  motionFrame,
  spriteFrame,
  motions,
  motionTiming,
  type NexaiMotion,
} from './nexai-motion';
import styles from './nexai.module.css';

type Props = {
  motion?: NexaiMotion;
  eventKey?: string | number;
  ambient?: boolean;
  paused?: boolean;
  quiet?: boolean;
  inspectAt?: number;
};
/** Cel playback: each exposure is a different drawing, not a moved static image. */
export function NexaiArtwork({
  motion = 'blink',
  eventKey = 0,
  ambient = false,
  paused = false,
  quiet = false,
  inspectAt,
}: Props) {
  const clipId = useId();
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const crop = root.querySelector<SVGSVGElement>('[data-cel]')!;
    const image = root.querySelector<SVGImageElement>('[data-sheet]')!;
    const isolation = root.querySelector<SVGPathElement>('[data-isolation]')!;
    let frame = 0,
      timer: ReturnType<typeof setTimeout> | undefined,
      sequence = 0,
      visible = true,
      disposed = false,
      generation = 0;
    const loaded = new Map<NexaiMotion, Promise<boolean>>();
    const blocked = () =>
      paused || preference.matches || document.hidden || !visible;
    const stop = () => {
      generation++;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      root.dataset.playing = 'false';
    };
    let lastPaint = '';
    const paint = (clip: NexaiMotion, time: number) => {
      const index = motionFrame(clip, time);
      const key = `${clip}:${index}`;
      if (lastPaint === key) return;
      lastPaint = key;
      const cel = spriteFrame(clip, index);
      isolation.setAttribute('d', cel.isolation);
      crop.setAttribute('viewBox', cel.viewBox);
      for (const attr of ['x', 'y', 'width', 'height'] as const)
        crop.setAttribute(attr, String(cel[attr]));
      image.setAttribute('href', cel.source);
      image.setAttribute('width', String(cel.sheetWidth));
      image.setAttribute('height', String(cel.sheetHeight));
      root.dataset.motion = clip;
      root.dataset.frame = String(index);
    };
    const load = (clip: NexaiMotion) => {
      if (!loaded.has(clip)) {
        const bitmap = new Image();
        bitmap.src = spriteFrame(clip, 0).source;
        loaded.set(
          clip,
          bitmap.decode().then(
            () => true,
            () => false,
          ),
        );
      }
      return loaded.get(clip)!;
    };
    const play = async (clip: NexaiMotion) => {
      const request = ++generation;
      const ready = await load(clip);
      if (disposed || request !== generation) return;
      root.dataset.assetError = String(!ready);
      if (!ready) return; // Keep readable HTML and the previous/rest artwork.
      paint(clip, 0);
      if (blocked()) return;
      if (inspectAt !== undefined) {
        paint(clip, inspectAt);
        return;
      }
      const start = performance.now();
      root.dataset.playing = 'true';
      const tick = (now: number) => {
        if (disposed || request !== generation || blocked()) {
          stop();
          return;
        }
        const elapsed = now - start;
        paint(clip, elapsed);
        if (elapsed < motions[clip].duration)
          frame = requestAnimationFrame(tick);
        else {
          root.dataset.playing = 'false';
          if (ambient)
            timer = setTimeout(
              () => {
                const choices = quiet ? quietSequence : ambientSequence;
                void play(choices[sequence++ % choices.length] ?? 'blink');
              },
              quiet ? motionTiming.exerciseRest : motionTiming.ambientRest,
            );
        }
      };
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      stop();
      void play(motion);
    };
    const observer = new IntersectionObserver(([entry]) => {
      const next = entry?.isIntersecting ?? true;
      if (next !== visible) {
        visible = next;
        start();
      }
    });
    observer.observe(root);
    start();
    preference.addEventListener('change', start);
    document.addEventListener('visibilitychange', start);
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      preference.removeEventListener('change', start);
      document.removeEventListener('visibilitychange', start);
    };
  }, [motion, eventKey, ambient, paused, quiet, inspectAt]);
  return (
    <svg
      ref={svg}
      className={styles.artwork}
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      data-playing="false"
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path data-isolation="" d="M0 0H1280V1280H0Z" />
        </clipPath>
      </defs>
      <svg
        data-cel=""
        x="58"
        y="45"
        width="396"
        height="396"
        viewBox="0 0 1280 1280"
        overflow="hidden"
      >
        <image
          data-sheet=""
          clipPath={`url(#${clipId})`}
          href="/nexai/motion-v2/rest.png"
          width="1280"
          height="1280"
        />
      </svg>
    </svg>
  );
}
