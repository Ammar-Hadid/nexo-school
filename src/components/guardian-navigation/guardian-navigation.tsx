'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../button/button';
import { NavigationIcon } from './navigation-icon';
import './navigation.tokens.css';
import styles from './guardian-navigation.module.css';
import { GuardianWorkspaceNavigation } from './guardian-workspace-navigation';

export const destinations = [
  { id: 'overview', label: 'Overzicht' },
  { id: 'planning', label: 'Weekplanning' },
  { id: 'progress', label: 'Voortgang' },
  { id: 'settings', label: 'Instellingen' },
  { id: 'admin', label: 'Beheer' },
] as const;
export type GuardianDestination =
  (typeof destinations)[number]['id'] | 'results';
export type GuardianNavigationProps = {
  appearance?: 'classic' | 'workspace';
  current: GuardianDestination;
  label?: string;
  contextNote?: string;
  accountLabel?: string;
  mainContent?: boolean;
  mobileNavigation: 'bottom' | 'menu';
  onNavigate: (destination: GuardianDestination) => void;
  hrefFor: (destination: GuardianDestination) => string;
  children: ReactNode;
  initiallyExpanded?: boolean;
};

/** Navigation-only shell. The host owns routes, page data and permissions. */
export function GuardianNavigation(props: GuardianNavigationProps) {
  return props.appearance === 'workspace' ? (
    <GuardianWorkspaceNavigation {...props} />
  ) : (
    <ClassicGuardianNavigation {...props} />
  );
}
function ClassicGuardianNavigation({
  current,
  label: navigationLabel = 'Ouderportaal',
  contextNote = 'Je kijkt mee met Adam.',
  accountLabel = 'Ammar',
  mainContent = false,
  mobileNavigation,
  onNavigate,
  hrefFor,
  children,
  initiallyExpanded = false,
}: GuardianNavigationProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const panelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (expanded && lastTrigger.current)
      panelRef.current?.querySelector('a')?.focus();
  }, [expanded]);
  const label = destinations.find((item) => item.id === current)?.label;
  function toggle(trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setExpanded(!expanded);
  }
  function go(destination: GuardianDestination) {
    onNavigate(destination);
    setExpanded(false);
    lastTrigger.current?.focus();
  }
  function link(item: (typeof destinations)[number], bottom = false) {
    return (
      <a
        key={item.id}
        href={hrefFor(item.id)}
        aria-current={current === item.id ? 'page' : undefined}
        onClick={(event) => {
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          go(item.id);
        }}
        className={bottom ? styles.bottomLink : styles.navLink}
      >
        <NavigationIcon name={item.id} />
        <span>
          {bottom && item.id === 'planning' ? 'Planning' : item.label}
        </span>
      </a>
    );
  }
  return (
    <div className={styles.container}>
      <div
        className={styles.shell}
        data-mobile={mobileNavigation}
        data-expanded={expanded}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && expanded) {
            setExpanded(false);
            lastTrigger.current?.focus();
          }
        }}
      >
        <header className={styles.header}>
          <div className={styles.headerStart}>
            <Button
              className={styles.menuToggle}
              variant="ghost"
              size="small"
              iconOnly
              aria-label={expanded ? 'Navigatie sluiten' : 'Navigatie openen'}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={(event) => toggle(event.currentTarget)}
            >
              <NavigationIcon name={expanded ? 'close' : 'menu'} />
            </Button>
            <span className={styles.brand}>
              nexo<span> School</span>
            </span>
            <span className={styles.portal}>Ouderportaal</span>
          </div>
          <a
            className={styles.account}
            href={hrefFor('settings')}
            aria-label={`${accountLabel} — instellingen`}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              go('settings');
            }}
          >
            <span className={styles.avatar} aria-hidden="true">
              <NavigationIcon name="person" />
            </span>
            <span className={styles.accountName}>{accountLabel}</span>
          </a>
        </header>
        <div className={styles.body}>
          <aside
            ref={panelRef}
            id={panelId}
            className={styles.sidebar}
            hidden={!expanded}
          >
            <div className={styles.sideIntro}>
              <span>Ouderportaal</span>
              <strong>Ruimte om te groeien.</strong>
            </div>
            <nav
              aria-label={`Hoofdnavigatie — ${navigationLabel}`}
              className={styles.primaryNav}
            >
              {destinations.slice(0, 3).map((item) => link(item))}
            </nav>
            <nav
              aria-label={`Instellingen en beheer — ${navigationLabel}`}
              className={styles.utilityNav}
            >
              {destinations.slice(3).map((item) => link(item))}
            </nav>
            <p className={styles.sideNote}>{contextNote}</p>
          </aside>
          <section
            role={mainContent ? 'main' : undefined}
            className={styles.content}
            aria-label={`${label} — ${navigationLabel}`}
            tabIndex={0}
          >
            {children}
          </section>
        </div>
        {mobileNavigation === 'bottom' && (
          <nav
            className={styles.bottomNav}
            aria-label={`Mobiele navigatie — ${navigationLabel}`}
          >
            {destinations.slice(0, 3).map((item) => link(item, true))}
            <button
              className={styles.bottomLink}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={(event) => toggle(event.currentTarget)}
              data-current={current === 'settings' || current === 'admin'}
            >
              <NavigationIcon name={expanded ? 'close' : 'menu'} />
              <span>{expanded ? 'Sluiten' : 'Meer'}</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
