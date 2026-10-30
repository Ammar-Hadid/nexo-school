import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleHelp,
  Info,
  LoaderCircle,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../button/button';
import '../../styles/guardian.tokens.css';
import styles from './guardian-ui.module.css';
import buttonStyles from '../button/button.module.css';

export function GuardianActionLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
}) {
  return (
    <a
      href={href}
      className={buttonStyles.button}
      data-variant={variant}
      data-size="small"
    >
      <span className={buttonStyles.content}>{children}</span>
    </a>
  );
}

export function GuardianPageHeading({
  title,
  description,
  children,
  context,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  context?: ReactNode;
}) {
  return (
    <header className={styles.pageHeading}>
      <div>
        {context && <div className={styles.context}>{context}</div>}
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className={styles.headingActions}>{children}</div>}
    </header>
  );
}
export function GuardianPanel({
  title,
  children,
  action,
  className = '',
  icon: Icon,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <section className={`${styles.panel} ${className}`}>
      {title && (
        <header className={styles.panelHeading}>
          <h2>
            {Icon && <Icon size={21} strokeWidth={1.75} aria-hidden="true" />}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
export function GuardianStatus({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'positive' | 'warning' | 'negative';
}) {
  return (
    <span className={styles.status} data-tone={tone}>
      {tone === 'positive' && <Check size={13} aria-hidden="true" />}
      {children}
    </span>
  );
}
export function GuardianFeedback({
  title,
  children,
  tone = 'positive',
  undo,
  next,
}: {
  title: string;
  children?: ReactNode;
  tone?: 'positive' | 'warning' | 'negative' | 'info';
  undo?: { label?: string; onClick: () => void; disabled?: boolean };
  next?: ReactNode;
}) {
  const Icon =
    tone === 'positive' ? Check : tone === 'info' ? Info : AlertCircle;
  return (
    <div
      className={styles.feedback}
      data-tone={tone}
      role={tone === 'negative' ? 'alert' : 'status'}
    >
      <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {children && <div className={styles.feedbackText}>{children}</div>}
        {next}
      </div>
      {undo && (
        <Button
          size="small"
          variant="ghost"
          disabled={undo.disabled}
          onClick={undo.onClick}
        >
          <Undo2 size={16} aria-hidden="true" />
          {undo.label ?? 'Ongedaan maken'}
        </Button>
      )}
    </div>
  );
}
export function GuardianEmpty({
  title,
  children,
  action,
  loading = false,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  loading?: boolean;
}) {
  const Icon = loading ? LoaderCircle : CircleHelp;
  return (
    <div className={styles.empty} role={loading ? 'status' : undefined}>
      <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
      <h2>{title}</h2>
      <div>{children}</div>
      {action}
    </div>
  );
}
export function GuardianTextLink({
  children,
  href,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </>
  );
  return href ? (
    <a className={styles.textLink} href={href}>
      {content}
    </a>
  ) : (
    <button className={styles.textLink} type="button" onClick={onClick}>
      {content}
    </button>
  );
}
