import { DatabaseSync } from 'node:sqlite';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { getMigrations } from 'better-auth/db/migration';
import { twoFactor } from 'better-auth/plugins';
import { passkey } from '@better-auth/passkey';
import { activeGrant, authenticationGrant, enrollment, requireUV } from './policy.mjs';

export async function createAuth(config) {
  const db = new DatabaseSync(`${config.dataDir}/spike.sqlite`);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  const cookieName = `${config.secure ? '__Host-' : ''}nexo-spike-browser`;
  const deny = error => { throw new APIError('FORBIDDEN', { message: error.code || 'POLICY_DENIED' }); };
  const options = {
    appName: 'nexo AUTH SPIKE — synthetic',
    baseURL: config.origin,
    secret: config.secret,
    database: db,
    trustedOrigins: [config.origin],
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 16 },
    session: { expiresIn: 12 * 60 * 60, updateAge: 60 * 60, cookieCache: { enabled: false } },
    advanced: {
      // Supply __Host- names ourselves; Better Auth otherwise adds __Secure-.
      useSecureCookies: false,
      cookiePrefix: config.secure ? '__Host-nexo-spike' : 'nexo-spike',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'strict', secure: config.secure, path: '/' },
      // Reverse proxy headers must never choose our trusted origin or RP ID.
      trustedProxyHeaders: false,
    },
    rateLimit: { enabled: true, window: 60, max: 40 },
    logger: { disabled: true },
    plugins: [
      twoFactor({ issuer: 'nexo AUTH SPIKE', skipVerificationOnEnable: false }),
      passkey({
        rpID: config.rpID,
        rpName: 'nexo AUTH SPIKE — synthetic',
        origin: config.origin,
        authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
        registration: {
          requireSession: false,
          resolveUser: async ({ ctx, context }) => {
            try {
              const grant = enrollment(db, ctx.headers, cookieName, context);
              return { id: grant.student_id, name: 'test-student@nexo.invalid', displayName: 'Test Student (synthetic)' };
            } catch (e) { deny(e); }
          },
          afterVerification: async ({ ctx, context, verification, user }) => {
            try {
              requireUV(verification.registrationInfo);
              const grant = enrollment(db, ctx.headers, cookieName, context);
              if (user.id !== grant.student_id) throw new Error('PRINCIPAL_MISMATCH');
              // Consume before library persistence. A failure leaves this grant unusable;
              // never return it to approved or let an orphan credential authorize access.
              const change = db.prepare("UPDATE browser_grant SET state = 'registering', credential_id = ? WHERE id = ? AND state = 'approved' AND enroll_expires > ?")
                .run(verification.registrationInfo.credential.id, grant.id, Date.now());
              if (change.changes !== 1) throw new Error('ENROLLMENT_CONSUMED');
              return { userId: grant.student_id };
            } catch (e) { deny(e); }
          },
        },
        authentication: {
          afterVerification: async ({ ctx, verification, clientData }) => {
            try {
              requireUV(verification.authenticationInfo);
              const grant = authenticationGrant(db, ctx.headers, cookieName);
              if (!db.prepare('SELECT 1 FROM passkey WHERE credentialID = ? AND userId = ?').get(clientData.id, grant.student_id)) throw new Error('CREDENTIAL_NOT_APPROVED');
              if (grant.state === 'approved') {
                const changed = db.prepare("UPDATE browser_grant SET state = 'active', credential_id = ? WHERE id = ? AND state = 'approved' AND enroll_expires > ?").run(clientData.id, grant.id, Date.now());
                if (changed.changes !== 1) throw new Error('ENROLLMENT_CONSUMED');
              } else if (grant.credential_id !== clientData.id) throw new Error('CREDENTIAL_NOT_APPROVED');
            } catch (e) { deny(e); }
          },
        },
      }),
    ],
  };
  const auth = betterAuth(options);
  await (await getMigrations(options)).runMigrations();
  db.exec(`
    CREATE TABLE IF NOT EXISTS spike_principal (user_id TEXT PRIMARY KEY REFERENCES user(id), kind TEXT NOT NULL CHECK(kind IN ('guardian','student')));
    CREATE TABLE IF NOT EXISTS browser_grant (
      id TEXT PRIMARY KEY, secret_hash TEXT UNIQUE NOT NULL, code TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL, student_id TEXT NOT NULL REFERENCES user(id),
      state TEXT NOT NULL CHECK(state IN ('pending','approved','registering','active','revoked')),
      enroll_expires INTEGER NOT NULL, expires_at INTEGER NOT NULL,
      credential_id TEXT, approved_by TEXT REFERENCES user(id), created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS session_binding (
      session_id TEXT PRIMARY KEY REFERENCES session(id) ON DELETE CASCADE,
      grant_id TEXT NOT NULL REFERENCES browser_grant(id), last_seen INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS adult_mfa (
      session_id TEXT PRIMARY KEY REFERENCES session(id) ON DELETE CASCADE, verified_at INTEGER NOT NULL
    );
  `);
  return { auth, db, cookieName };
}
