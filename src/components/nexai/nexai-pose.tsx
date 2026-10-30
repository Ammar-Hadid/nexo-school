import { useId } from 'react';
import { spriteFrame, type NexaiMotion } from './nexai-motion';
/** The review strip uses the same isolation geometry as live playback. */
export function NexaiPose({
  motion,
  frame,
}: {
  motion: NexaiMotion;
  frame: number;
}) {
  const id = useId(),
    cel = spriteFrame(motion, frame);
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={cel.isolation} />
        </clipPath>
      </defs>
      <svg
        x={cel.x}
        y={cel.y}
        width={cel.width}
        height={cel.height}
        viewBox={cel.viewBox}
        overflow="hidden"
      >
        <image
          href={cel.source}
          width={cel.sheetWidth}
          height={cel.sheetHeight}
          clipPath={`url(#${id})`}
        />
      </svg>
    </svg>
  );
}
