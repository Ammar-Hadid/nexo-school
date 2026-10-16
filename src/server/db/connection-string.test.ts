import { describe, expect, it } from 'vitest';
import { databaseConnectionString } from './connection-string';

describe('database connection configuration', () => {
  it('fails without credentials rather than selecting a fallback database', () => {
    expect(() => databaseConnectionString(undefined)).toThrow(
      'DATABASE_URL is required',
    );
    expect(() => databaseConnectionString('')).toThrow(
      'DATABASE_URL is required',
    );
  });
  it('accepts certificate-verified remote PostgreSQL and local disposable PostgreSQL', () => {
    for (const value of [
      'postgresql://fixture:fixture@db.example.invalid/test?sslmode=verify-full',
      'postgres://fixture:fixture@127.0.0.1:5432/test',
    ]) {
      expect(databaseConnectionString(value)).toBe(value);
    }
  });
  it('rejects remote connections without certificate verification', () => {
    for (const suffix of [
      '',
      '?sslmode=disable',
      '?sslmode=require',
      '?sslmode=no-verify',
      '?sslmode=verify-full&sslmode=disable',
      '?sslmode=verify-full&ssl=false',
    ]) {
      expect(() =>
        databaseConnectionString(
          `postgresql://db.example.invalid/test${suffix}`,
        ),
      ).toThrow('sslmode=verify-full');
    }
  });
  it('rejects invalid providers without echoing secrets', () => {
    for (const value of [
      'not-a-url-secret',
      'https://fixture:secret@db.example.invalid/test',
    ]) {
      expect(() => databaseConnectionString(value)).toThrow(
        /^DATABASE_URL must be a PostgreSQL URL\.$/,
      );
    }
  });
});
