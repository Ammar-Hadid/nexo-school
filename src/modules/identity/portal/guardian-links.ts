export function guardianHref(id: string) {
  switch (id) {
    case 'overview':
      return '/guardian';
    case 'settings':
      return '/guardian/access';
    case 'admin':
      return '/guardian/content/supply';
    case 'planning':
      return '/guardian/content/assignments';
    case 'progress':
      return '/guardian/progress';
    default:
      return '/guardian/results';
  }
}
