import type { ComponentProps } from 'react';
import { WorkflowGuide } from '@/components/workflow-guide/workflow-guide';
import { ArrowRight, Check } from 'lucide-react';
import { GuardianActionLink } from '@/components/guardian-ui/guardian-ui';
import styles from './practice-flow.module.css';
export function PracticeFlow({
  appearance = 'classic',
  ...props
}: Omit<ComponentProps<typeof WorkflowGuide>, 'steps'> & {
  appearance?: 'classic' | 'workspace';
}) {
  const steps = [
    'Voorbereiden',
    'Beoordelen',
    'Klaarzetten',
    'Oefenen',
    'Resultaat',
  ];
  if (appearance === 'workspace')
    return (
      <section className={styles.flow} aria-label="Volgende stap">
        <ol className={styles.steps} aria-label="Van oefening naar resultaat">
          {steps.map((step, i) => (
            <li
              key={step}
              aria-current={props.current === i ? 'step' : undefined}
            >
              <span className={styles.stepMark} aria-hidden="true">
                {i < props.current ? <Check size={12} /> : i + 1}
              </span>
              {step}
              {i < steps.length - 1 && (
                <ArrowRight size={12} aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
        <div className={styles.next}>
          <div>
            <h2>{props.title}</h2>
            <div className={styles.description}>{props.children}</div>
          </div>
          {props.action && (
            <GuardianActionLink href={props.action.href}>
              {props.action.label}
              <ArrowRight size={16} aria-hidden="true" />
            </GuardianActionLink>
          )}
        </div>
      </section>
    );
  return <WorkflowGuide steps={steps} {...props} />;
}
