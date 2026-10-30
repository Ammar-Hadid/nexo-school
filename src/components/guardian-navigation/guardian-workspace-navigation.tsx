'use client';
import { useEffect, useId, useRef, useState } from 'react';
import {
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  House,
  Menu,
  PanelLeftClose,
  Settings,
  UserRound,
  X,
} from 'lucide-react';
import type {
  GuardianDestination,
  GuardianNavigationProps,
} from './guardian-navigation';
import '../../styles/guardian.tokens.css';
import styles from './guardian-workspace-navigation.module.css';
import { useGuardianAccount } from './guardian-account-context';

export const workspaceDestinations = [
  { id: 'overview', label: 'Vandaag', icon: House },
  { id: 'progress', label: 'Voortgang', icon: ChartNoAxesCombined },
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'admin', label: 'Oefenmateriaal', icon: BookOpenCheck },
  { id: 'results', label: 'Resultaten', icon: ClipboardList },
  { id: 'settings', label: 'Instellingen', icon: Settings },
] as const;

/** R3 presentation. Routing, identity and capability checks remain host-owned. */
export function GuardianWorkspaceNavigation({
  current,
  hrefFor,
  onNavigate,
  accountLabel = 'Ammar',
  contextNote = 'Je kijkt mee met Adam.',
  children,
  mainContent = false,
  label = 'Ouderportaal',
}: GuardianNavigationProps) {
  const [menu, setMenu] = useState(false);
  const account = useGuardianAccount();
  const displayedName = account?.name ?? accountLabel;
  const [collapsed, setCollapsed] = useState(false);
  const panelId = useId();
  const mainId = useId();
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLElement>(null);
  useEffect(() => {
    if (menu) panel.current?.querySelector('a')?.focus();
  }, [menu]);
  function navigate(id: GuardianDestination) {
    onNavigate(id);
    setMenu(false);
    requestAnimationFrame(() => {
      const h = content.current?.querySelector<HTMLElement>('h1');
      if (h) {
        h.tabIndex = -1;
        h.focus();
      }
    });
  }
  function link(item: (typeof workspaceDestinations)[number], mobile = false) {
    const Icon = item.icon;
    return (
      <a
        key={item.id}
        href={hrefFor(item.id)}
        aria-current={current === item.id ? 'page' : undefined}
        className={mobile ? styles.bottomLink : styles.navLink}
        title={collapsed && !mobile ? item.label : undefined}
        onClick={(event) => {
          if (
            event.button ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          navigate(item.id);
        }}
      >
        <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
        <span>{item.label}</span>
      </a>
    );
  }
  return (
    <div
      data-guardian-ui="r3"
      className={styles.workspace}
      data-collapsed={collapsed}
      data-menu={menu}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && menu) {
          setMenu(false);
          trigger.current?.focus();
        }
      }}
    >
      <header className={styles.header}>
        <a className={styles.skip} href={`#${mainId}`}>
          Naar de inhoud
        </a>
        <div className={styles.headerStart}>
          <button
            className={styles.desktopToggle}
            aria-label={collapsed ? 'Zijbalk uitklappen' : 'Zijbalk inklappen'}
            aria-expanded={!collapsed}
            aria-controls={panelId}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <a
            href={hrefFor('overview')}
            className={styles.brand}
            aria-label="nexo School — vandaag"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              navigate('overview');
            }}
          >
            <strong>nexo</strong>
            <span> School</span>
          </a>
          <span className={styles.portal}>Ouderportaal</span>
        </div>
        <div className={styles.accountArea}>
          <a
            href={hrefFor('settings')}
            className={styles.account}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              navigate('settings');
            }}
            aria-label={`${displayedName} — instellingen`}
          >
            <span className={styles.avatar}>
              <UserRound size={21} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className={styles.accountName}>{displayedName}</span>
          </a>
          {account?.actions}
        </div>
      </header>
      <div className={styles.body}>
        <aside
          id={panelId}
          ref={panel}
          className={styles.sidebar}
          aria-label="Portaalnavigatie"
        >
          <div className={styles.mobileMenuHeading}>
            <strong>Ouderportaal</strong>
            <button
              onClick={() => {
                setMenu(false);
                trigger.current?.focus();
              }}
              aria-label="Menu sluiten"
            >
              <X size={22} />
            </button>
          </div>
          <nav aria-label={`Hoofdnavigatie — ${label}`} className={styles.nav}>
            {workspaceDestinations.map((item) => link(item))}
          </nav>
          <div className={styles.context}>
            <span className={styles.contextMark}>
              <BookOpenCheck size={19} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p>{contextNote}</p>
          </div>
        </aside>
        <section
          id={mainId}
          ref={content}
          role={mainContent ? 'main' : undefined}
          aria-label={`${workspaceDestinations.find((i) => i.id === current)?.label} — ${label}`}
          className={styles.content}
          tabIndex={-1}
        >
          {children}
        </section>
      </div>
      <nav
        className={styles.bottomNav}
        aria-label={`Mobiele navigatie — ${label}`}
      >
        {workspaceDestinations.slice(0, 3).map((item) => link(item, true))}
        <button
          ref={trigger}
          className={styles.bottomLink}
          aria-expanded={menu}
          aria-controls={panelId}
          data-current={['admin', 'settings', 'results'].includes(current)}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X size={21} /> : <Menu size={21} />}
          <span>{menu ? 'Sluiten' : 'Meer'}</span>
        </button>
      </nav>
    </div>
  );
}
