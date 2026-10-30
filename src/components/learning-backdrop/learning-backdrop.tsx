import type { ReactNode } from 'react';
import './learning-backdrop.tokens.css';
import styles from './learning-backdrop.module.css';

/** Decorative student-page frame. Content retains all semantics and interaction. */
export function LearningBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.artwork} aria-hidden="true">
        <svg className={styles.left} viewBox="0 0 180 900" focusable="false">
          <path
            className={styles.wash}
            d="M17 98C-4 45 48 12 104 37s78 65 41 98S39 153 17 98Z"
          />
          <g
            className={styles.ink}
            transform="translate(16 54) rotate(-12 70 40)"
          >
            <path d="M70 18C48 3 29 3 9 9v77c23-7 42-4 61 9 19-13 38-16 61-9V9c-20-6-39-6-61 9Zm0 0v77" />
            <path d="M24 26c12-2 22 0 32 6m-32 12c12-2 22 0 32 6m28-18c10-6 20-8 32-6M84 50c10-6 20-8 32-6" />
          </g>
          <path
            className={styles.trail}
            d="M80 182c-74 72 79 108 40 176S11 432 62 497"
          />
          <g className={styles.blue} transform="translate(90 303) rotate(14)">
            <path d="m0-21 6 15 15 6-15 6-6 15-6-15-15-6 15-6Z" />
          </g>
          <g
            className={styles.ink}
            transform="translate(43 555) rotate(18 40 40)"
          >
            <path d="m34 4 28 0 0 91-14 26-14-26Z M34 20h28M34 95h28M48 20v75" />
            <path d="m43 111 5 10 5-10" />
          </g>
          <circle className={styles.dot} cx="142" cy="518" r="7" />
          <circle className={styles.dot} cx="32" cy="743" r="5" />
          <path
            className={styles.blue}
            d="m117 753 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z"
          />
        </svg>
        <svg className={styles.right} viewBox="0 0 180 900" focusable="false">
          <path
            className={styles.wash}
            d="M44 58c45-31 116-14 119 44s-46 90-93 63S-3 90 44 58Z"
          />
          <g
            className={styles.ink}
            transform="translate(37 59) rotate(31 40 50)"
          >
            <path d="M26 0h29v100l-14 27-15-27ZM26 18h29M26 100h29M41 18v82" />
          </g>
          <path
            className={styles.trail}
            d="M103 221c86 87-95 76-69 164s129 67 101 157"
          />
          <path
            className={styles.blue}
            d="m126 342 6 17 17 6-17 6-6 17-6-17-17-6 17-6Z"
          />
          <circle className={styles.dot} cx="28" cy="262" r="6" />
          <g
            className={styles.ink}
            transform="translate(18 598) rotate(9 70 40)"
          >
            <path d="M70 17C49 4 28 4 9 10v70c23-6 43-3 61 10 18-13 38-16 61-10V10c-19-6-40-6-61 7Zm0 0v73M24 29l29 8m31 0 31-8M24 47l29 8m31 0 31-8" />
          </g>
          <path
            className={styles.blue}
            d="m63 795 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z"
          />
        </svg>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
