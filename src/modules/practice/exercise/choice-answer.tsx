import type { Ref } from 'react';
import styles from './exercise-screen.module.css';

/** Native radio group for the concrete reading preview. */
export function ChoiceAnswer({
  ref,
  name,
  questionId,
  options,
  value,
  disabled,
  error,
  onChange,
}: {
  ref: Ref<HTMLInputElement>;
  name: string;
  questionId: string;
  options: readonly { value: string; label: string }[];
  value: string;
  disabled: boolean;
  error: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset
      className={styles.choices}
      disabled={disabled}
      aria-labelledby={questionId}
      aria-describedby={error ? `${name}-error` : undefined}
      aria-invalid={!!error}
    >
      <legend>Kies je antwoord</legend>
      {options.map((option, index) => (
        <label
          key={option.value}
          className={styles.choice}
          data-selected={value === option.value}
        >
          <input
            ref={index === 0 ? ref : undefined}
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
      {error && (
        <p id={`${name}-error`} className={styles.choiceError} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
