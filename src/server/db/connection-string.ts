/** Validate before constructing a driver; never include connection strings in errors. */
export function databaseConnectionString(value: string | undefined): string {
  if (!value) throw new Error('DATABASE_URL is required for database access.');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a PostgreSQL URL.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname) {
    throw new Error('DATABASE_URL must be a PostgreSQL URL.');
  }
  // Local disposable PostgreSQL may omit TLS; remote hosts must verify certificates.
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (
    !local &&
    (url.searchParams.getAll('sslmode').length !== 1 ||
      url.searchParams.get('sslmode') !== 'verify-full' ||
      url.searchParams.has('ssl'))
  ) {
    throw new Error('Remote DATABASE_URL requires sslmode=verify-full.');
  }
  return value;
}
