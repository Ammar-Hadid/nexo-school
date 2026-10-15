import { randomBytes, createHash } from 'node:crypto';
export const ENROLL_MS = 10 * 60_000;
export const MFA_MS = 5 * 60_000;
export const IDLE_MS = 30 * 60_000;
export const GRANT_MS = 90 * 86400_000;
export const hash = value => createHash('sha256').update(value).digest('hex');
export const opaque = () => randomBytes(32).toString('base64url');
export class Denied extends Error {
  constructor(code, status = 403) { super(code); this.code = code; this.status = status; }
}
export function requireUV(info) {
  if (info?.userVerified !== true) throw new Denied('USER_VERIFICATION_REQUIRED');
}
export function cookies(headers) {
  return Object.fromEntries((headers.get('cookie') || '').split(';').map(s => s.trim().split(/=(.*)/s).slice(0, 2)).filter(p => p.length === 2));
}
export function requireOrigin(request, origin) {
  const given = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if ((given && given !== origin) || site === 'cross-site' || site === 'same-site' ||
      (request.method !== 'GET' && given !== origin)) throw new Denied('ORIGIN_DENIED');
}
export function activeGrant(db, headers, cookieName, now = Date.now()) {
  const token = cookies(headers)[cookieName];
  if (!token) throw new Denied('APPROVED_BROWSER_REQUIRED');
  const row = db.prepare('SELECT * FROM browser_grant WHERE secret_hash = ?').get(hash(token));
  if (!row || row.state !== 'active' || row.expires_at <= now ||
      !db.prepare('SELECT 1 FROM passkey WHERE credentialID = ? AND userId = ?').get(row.credential_id, row.student_id)) {
    throw new Denied('APPROVED_BROWSER_REQUIRED');
  }
  return row;
}
export function enrollment(db, headers, cookieName, context, now = Date.now()) {
  const token = cookies(headers)[cookieName];
  if (!token) throw new Denied('APPROVED_ENROLLMENT_REQUIRED');
  const row = db.prepare('SELECT * FROM browser_grant WHERE secret_hash = ? AND id = ?').get(hash(token), context || '');
  if (!row || row.state !== 'approved' || row.enroll_expires <= now) throw new Denied('APPROVED_ENROLLMENT_REQUIRED');
  return row;
}
// An approved enrollment may prove an existing (possibly synced) passkey once.
// Possessing that passkey without this cookie-bound approval remains insufficient.
export function authenticationGrant(db, headers, cookieName, now = Date.now()) {
  try { return activeGrant(db, headers, cookieName, now); }
  catch (e) {
    const token = cookies(headers)[cookieName];
    const row = token && db.prepare('SELECT id FROM browser_grant WHERE secret_hash = ?').get(hash(token));
    if (!row) throw e;
    return enrollment(db, headers, cookieName, row.id, now);
  }
}
