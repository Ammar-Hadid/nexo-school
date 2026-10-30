'use client';
import { useId, type ReactNode } from 'react';
import './sign-in.tokens.css';
import styles from './sign-in-layout.module.css';

export type SignInLayoutProps = {
  context: string;
  title: string;
  description: string;
  welcome: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
  };
  children: ReactNode;
  help?: ReactNode;
  footer?: ReactNode;
};

/** Shared brand composition. Identity, form fields and authentication methods stay with the caller. */
export function SignInLayout({
  context,
  title,
  description,
  welcome,
  children,
  help,
  footer,
}: SignInLayoutProps) {
  const id = useId();
  return (
    <div className={styles.page}>
      <a className={styles.skip} href={`#${id}`}>
        Naar aanmelden
      </a>
      <header className={styles.header}>
        <div className={styles.brand} aria-label="nexo School">
          <span className={styles.brandMark} aria-hidden="true">
            n<span>·</span>
          </span>
          <span>
            nexo<span className={styles.school}>school</span>
          </span>
        </div>
        <p className={styles.brandLine}>Samen leren. Verder groeien.</p>
      </header>
      <main className={styles.layout}>
        <aside className={styles.welcome} aria-label="Welkom bij nexo School">
          <div className={styles.welcomeCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              {welcome.eyebrow}
            </p>
            <p className={styles.display}>
              {welcome.title}
              <br />
              <span>{welcome.accent}</span>
            </p>
            <p className={styles.welcomeDescription}>{welcome.description}</p>
          </div>
          <div className={styles.art} aria-hidden="true">
            <div className={styles.orbit} />
            <span className={styles.orbitDot} />
            <div className={styles.letterTile}>
              Aa<span>Taal ontdekken</span>
            </div>
            <div className={styles.notebook}>
              <div className={styles.notebookTop}>
                <span>Een nieuw hoofdstuk</span>
                <span>✦</span>
              </div>
              <div className={styles.bookPages}>
                <div>
                  <span className={styles.chapter}>01</span>
                  <div className={styles.bookLine} />
                  <div className={styles.bookLine} />
                  <div className={styles.bookLine} />
                  <span className={styles.bookCircle} />
                </div>
                <div>
                  <span className={styles.bookSpark}>✳</span>
                  <div className={styles.bookLine} />
                  <div className={styles.bookLine} />
                  <div className={styles.bookLine} />
                </div>
              </div>
            </div>
            <div className={styles.numberTile}>
              1<span>2</span>3
            </div>
            <span className={styles.pencil} />
            <span className={styles.artCaption}>
              Nieuwsgierig vandaag. Een stap verder morgen.
            </span>
          </div>
          <div className={styles.subjects} aria-label="Onze vakken">
            <span>Rekenen</span>
            <span>Taal</span>
            <span>Spelling</span>
            <span>Begrijpend lezen</span>
          </div>
        </aside>
        <section className={styles.formSide} aria-labelledby={`${id}-title`}>
          <div className={styles.formContent} id={id} tabIndex={-1}>
            <div className={styles.context}>
              <span className={styles.contextIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 5.5c3-1 5-.5 7 1.5 2-2 4-2.5 7-1.5V18c-3-1-5-.5-7 1.5-2-2-4-2.5-7-1.5V5.5ZM12 7v12" />
                </svg>
              </span>
              <span>{context}</span>
            </div>
            <h1 id={`${id}-title`}>{title}</h1>
            <p className={styles.description}>{description}</p>
            <div className={styles.formSlot}>{children}</div>
            {help && <div className={styles.help}>{help}</div>}
          </div>
          <p className={styles.formFooter}>
            Een fijne plek om te leren, op jouw tempo.
          </p>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>nexo School · Leren met aandacht</span>
        {footer}
      </footer>
    </div>
  );
}

/** Compact feedback that reserves the form's hierarchy and exposes a live status. */
export function SignInNotice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success';
  children: ReactNode;
}) {
  return (
    <div
      className={styles.notice}
      data-tone={tone}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span aria-hidden="true">
        {tone === 'error' ? '!' : tone === 'success' ? '✓' : 'i'}
      </span>
      <div>{children}</div>
    </div>
  );
}
