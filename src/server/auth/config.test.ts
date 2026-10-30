import { describe, expect, it } from 'vitest';
import { localIdentityConfig } from './config';

const valid = {
  NEXO_LOCAL_IDENTITY: 'synthetic-only',
  DATABASE_URL:
    'postgresql://fixture:fixture@127.0.0.1:5432/nexo_identity_local',
  BETTER_AUTH_URL: 'http://127.0.0.1:3000',
  BETTER_AUTH_SECRET: 'synthetic-secret-for-tests-only-0123456789',
};
describe('local identity configuration', () => {
  it('accepts explicitly enabled loopback synthetic identity', () => {
    expect(localIdentityConfig(valid).origin).toBe(valid.BETTER_AUTH_URL);
  });
  it('accepts an explicit localhost origin for WebAuthn', () => {
    expect(
      localIdentityConfig({
        ...valid,
        BETTER_AUTH_URL: 'http://localhost:3000',
      }).origin,
    ).toBe('http://localhost:3000');
  });
  it.each([
    { NEXO_LOCAL_IDENTITY: undefined },
    {
      DATABASE_URL:
        'postgresql://fixture:fixture@remote.invalid/nexo_identity_local',
    },
    { DATABASE_URL: 'postgresql://fixture:fixture@127.0.0.1/production' },
    { DATABASE_URL: `${valid.DATABASE_URL}?host=remote.invalid` },
    { BETTER_AUTH_URL: 'https://remote.invalid' },
    { BETTER_AUTH_URL: 'http://127.0.0.1:3000/path' },
    { BETTER_AUTH_SECRET: 'short' },
  ])('rejects unsafe configuration without echoing values: %j', (override) => {
    expect(() => localIdentityConfig({ ...valid, ...override })).toThrow(
      'Local synthetic identity configuration is invalid.',
    );
  });
});
