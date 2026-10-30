'use client';
import { useEffect, useId, useRef } from 'react';
import { nexaiPose, type NexaiPoseId } from './nexai-library';
import { duration, eyesAt, pawAt } from './nexai-layered-timeline';
import styles from './nexai.module.css';

type Props = {
  pose?: NexaiPoseId;
  /** Change for a new reaction; ordinary rerenders do not replay. */
  eventKey?: string | number;
  paused?: boolean;
  repeat?: boolean;
};
/** Decorative approved layers. The caller owns messages, events and pause UI. */
export function NexaiAnimatedPose({
  pose = 'calm-1',
  eventKey = 0,
  paused = false,
  repeat = false,
}: Props) {
  const item = nexaiPose(pose);
  const id = useId();
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const eyes = root.querySelectorAll<SVGImageElement>('[data-eye]');
    const paw = root.querySelector<SVGGElement>('[data-arm]');
    let disposed = false,
      ready = false,
      visible = false,
      frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const paint = (time: number) => {
      const values = eyesAt(item.mode, time);
      eyes.forEach((eye, i) =>
        eye.setAttribute('opacity', String(values[i] ?? 0)),
      );
      if (item.arm)
        paw?.setAttribute(
          'transform',
          `rotate(${pawAt(time, item.arm.amplitude)} ${item.arm.pivot.join(' ')})`,
        );
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      root.dataset.playing = 'false';
      paint(0);
    };
    const blocked = () =>
      disposed || paused || media.matches || document.hidden || !visible;
    const play = () => {
      stop();
      if (!ready || blocked()) return;
      root.dataset.playing = 'true';
      const start = performance.now();
      const tick = (now: number) => {
        if (blocked()) {
          stop();
          return;
        }
        const elapsed = Math.min(now - start, duration);
        paint(elapsed);
        if (elapsed < duration) frame = requestAnimationFrame(tick);
        else {
          stop();
          if (repeat) timer = setTimeout(play, item.rest);
        }
      };
      frame = requestAnimationFrame(tick);
    };
    // Returning on screen never replays an old event. A new eventKey resumes it.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visible;
        visible = entry?.isIntersecting ?? false;
        if (!visible) stop();
        else if (!wasVisible && root.dataset.started !== 'true' && ready) {
          root.dataset.started = 'true';
          play();
        }
      },
      { threshold: 0.1 },
    );
    root.dataset.started = 'false';
    root.dataset.assetError = 'false';
    root.dataset.ready = 'false';
    stop();
    observer.observe(root);
    void Promise.all(
      [item.asset, item.eyes].map(async (src) => {
        const image = new Image();
        image.src = src;
        await image.decode();
      }),
    )
      .then(() => {
        if (disposed) return;
        ready = true;
        root.dataset.ready = 'true';
        if (visible) {
          root.dataset.started = 'true';
          play();
        }
      })
      .catch(() => {
        if (!disposed) {
          root.dataset.assetError = 'true';
          stop();
        }
      });
    const suspend = () => {
      if (media.matches || document.hidden) stop();
    };
    media.addEventListener('change', suspend);
    document.addEventListener('visibilitychange', suspend);
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      media.removeEventListener('change', suspend);
      document.removeEventListener('visibilitychange', suspend);
    };
  }, [item, eventKey, paused, repeat]);
  return (
    <svg
      ref={svg}
      className={styles.artwork}
      viewBox="0 0 1254 1254"
      aria-hidden="true"
      focusable="false"
      data-pose={item.id}
      data-playing="false"
    >
      <defs>
        <radialGradient id={`${id}-feather`}>
          <stop offset="90%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        {item.regions.map(([cx, cy, rx, ry], i) => (
          <mask
            key={i}
            id={`${id}-eye-${i}`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1254"
            height="1254"
          >
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={`url(#${id}-feather)`}
            />
          </mask>
        ))}
        {item.arm && (
          <>
            <mask
              id={`${id}-body`}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1254"
              height="1254"
            >
              <rect width="1254" height="1254" fill="white" />
              <path d={item.arm.cut} fill="black" />
            </mask>
            <clipPath id={`${id}-arm`}>
              <path d={item.arm.clip} />
            </clipPath>
          </>
        )}
      </defs>
      {item.arm && (
        <g data-arm="paw">
          <image
            href={item.asset}
            width="1254"
            height="1254"
            clipPath={`url(#${id}-arm)`}
          />
        </g>
      )}
      <image
        data-body="fixed"
        href={item.asset}
        width="1254"
        height="1254"
        mask={item.arm ? `url(#${id}-body)` : undefined}
      />
      {item.regions.map((_, i) => (
        <image
          key={i}
          data-eye={i}
          href={item.eyes}
          width="1254"
          height="1254"
          opacity="0"
          mask={`url(#${id}-eye-${i})`}
        />
      ))}
    </svg>
  );
}
