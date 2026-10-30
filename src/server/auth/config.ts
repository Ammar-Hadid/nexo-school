/** Only the disposable synthetic identity slice is enabled by D02. */
export function localIdentityConfig(env: Record<string, string | undefined>) {
  const invalid = () =>
    new Error('Local synthetic identity configuration is invalid.');
  try {
    const databaseUrl = env.DATABASE_URL ?? '';
    const db = new URL(databaseUrl);
    const origin = env.BETTER_AUTH_URL ?? '';
    const site = new URL(origin);
    const secret = env.BETTER_AUTH_SECRET ?? '';
    if (
      env.NEXO_LOCAL_IDENTITY !== 'synthetic-only' ||
      !['postgres:', 'postgresql:'].includes(db.protocol) ||
      db.hostname !== '127.0.0.1' ||
      !/^\/nexo_identity_(local|test_[a-z0-9_]+)$/.test(db.pathname) ||
      db.search ||
      db.hash ||
      site.protocol !== 'http:' ||
      !['127.0.0.1', 'localhost'].includes(site.hostname) ||
      site.origin !== origin ||
      secret.length < 32
    )
      throw invalid();
    return { databaseUrl, origin, secret };
  } catch {
    throw invalid();
  }
}
export type LocalIdentityConfig = ReturnType<typeof localIdentityConfig>;
