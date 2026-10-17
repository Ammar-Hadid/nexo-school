export type NavigationIconName =
  | 'overview'
  | 'planning'
  | 'progress'
  | 'settings'
  | 'admin'
  | 'menu'
  | 'close'
  | 'person';
const paths: Record<NavigationIconName, string> = {
  person: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M4 21v-2a8 8 0 0 1 16 0v2',
  overview: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  planning:
    'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M7 3v4 M17 3v4 M3 11h18 M7 15h3 M14 15h3',
  progress: 'M4 3v17h17 M8 15l4-5 4 2 5-7',
  settings: 'M4 6h16 M4 12h16 M4 18h16 M8 3v6 M16 9v6 M10 15v6',
  admin: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z M9 12l2 2 4-4',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'M6 6l12 12 M18 6 6 18',
};
export function NavigationIcon({ name }: { name: NavigationIconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
