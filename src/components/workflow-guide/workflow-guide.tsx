import { useId, type ReactNode } from 'react';
import styles from './workflow-guide.module.css';
/** Presentation only: the host supplies the current step and next action. */
export function WorkflowGuide({
  steps,
  current,
  title,
  children,
  action,
}: {
  steps: readonly string[];
  current: number;
  title: string;
  children: ReactNode;
  action?: { label: string; href: string };
}) {
  const id = useId();
  return (
    <section className={styles.guide} aria-labelledby={id}>
      <ol className={styles.steps} aria-label="Van oefening naar resultaat">
        {steps.map((step, index) => (
          <li key={step} aria-current={index === current ? 'step' : undefined}>
            <span aria-hidden="true">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div className={styles.next}>
        <div>
          <p className={styles.eyebrow}>Jouw volgende stap</p>
          <h2 id={id}>{title}</h2>
          <div className={styles.description}>{children}</div>
        </div>
        {action && (
          <a className={styles.action} href={action.href}>
            {action.label}
            <span aria-hidden="true"> →</span>
          </a>
        )}
      </div>
    </section>
  );
}
