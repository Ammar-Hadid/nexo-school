'use client';

import type { ComponentProps, ReactNode } from 'react';
import styles from './button.module.css';

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
} & ({ iconOnly: true; 'aria-label': string } | { iconOnly?: false });

/** Native button semantics; busy actions retain focus and reject activation. */
export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  iconOnly = false,
  startIcon,
  endIcon,
  children,
  disabled,
  className = '',
  type = 'button',
  onClick,
  'aria-disabled': ariaDisabled,
  ...props
}: ButtonProps) {
  const unavailable =
    disabled || loading || ariaDisabled === true || ariaDisabled === 'true';

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      aria-disabled={loading || ariaDisabled || undefined}
      aria-busy={loading || undefined}
      className={`${styles.button} ${className}`}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-icon-only={iconOnly || undefined}
      data-loading={loading || undefined}
      onClick={(event) => {
        if (unavailable) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      <span className={styles.content}>
        {startIcon && (
          <span className={styles.icon} aria-hidden="true">
            {startIcon}
          </span>
        )}
        {iconOnly ? (
          <span className={styles.icon} aria-hidden="true">
            {children}
          </span>
        ) : (
          children
        )}
        {endIcon && (
          <span className={styles.icon} aria-hidden="true">
            {endIcon}
          </span>
        )}
      </span>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
}
