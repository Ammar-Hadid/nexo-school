'use client';
import { useId, type ComponentProps } from 'react';
import './text-field.tokens.css';
import styles from './text-field.module.css';

type Props = Omit<ComponentProps<'input'>, 'size'> & {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  pending?: boolean;
  appearance?: 'standard' | 'answer';
};

/** Presentation only: validation and answer correctness belong to the caller. */
export function TextField({
  label,
  hint,
  error,
  success,
  pending,
  appearance = 'standard',
  id,
  className = '',
  'aria-describedby': describedBy,
  ...input
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const status = error ? 'error' : success ? 'success' : 'normal';
  const message = error || success || (pending ? 'Even controleren…' : hint);
  return (
    <div
      className={`${styles.field} ${className}`}
      data-appearance={appearance}
      data-status={status}
    >
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {input.required && <span> (verplicht)</span>}
      </label>
      <div className={styles.shell}>
        {appearance === 'answer' && (
          <span className={styles.pencil} aria-hidden="true">
            ✎
          </span>
        )}
        <input
          {...input}
          id={inputId}
          className={styles.input}
          aria-invalid={Boolean(error) || input['aria-invalid']}
          aria-busy={pending || undefined}
          readOnly={input.readOnly || pending}
          aria-describedby={
            [describedBy, message ? `${inputId}-message` : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {(error || success || pending) && (
          <span className={styles.mark} aria-hidden="true">
            {pending ? '…' : error ? '!' : '✓'}
          </span>
        )}
      </div>
      {message && (
        <p
          id={`${inputId}-message`}
          className={styles.message}
          role={error ? 'alert' : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
}
