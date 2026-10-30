'use client';
import { useState } from 'react';
import { NexaiArtwork } from './nexai-artwork';
import { NexaiAnimatedPose } from './nexai-animated-pose';
import type { NexaiPoseId } from './nexai-library';
import type { NexaiMotion } from './nexai-motion';
import './nexai.tokens.css';
import styles from './nexai.module.css';
export function NexaiCompanion({
  message,
  layout = 'stacked',
  pose,
  motion = 'blink',
  eventKey = 0,
  ambient = true,
  quiet = false,
}: {
  message: string;
  layout?: 'stacked' | 'beside';
  pose?: NexaiPoseId;
  motion?: NexaiMotion;
  eventKey?: string | number;
  ambient?: boolean;
  quiet?: boolean;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={`${styles.companion} ${layout === 'beside' ? styles.beside : ''}`}
    >
      <p className={styles.bubble} role="status" aria-live="polite">
        {message}
      </p>
      {pose ? (
        <NexaiAnimatedPose
          pose={pose}
          eventKey={eventKey}
          repeat={ambient}
          paused={paused}
        />
      ) : (
        <NexaiArtwork
          motion={motion}
          eventKey={eventKey}
          ambient={ambient}
          paused={paused}
          quiet={quiet}
        />
      )}
      <button
        type="button"
        className={styles.pause}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? 'Laat Nexai bewegen' : 'Nexai even stilzetten'}
      </button>
    </div>
  );
}
