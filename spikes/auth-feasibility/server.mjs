import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createAuth } from './auth.mjs';
import { loadConfig } from './config.mjs';
import { Denied, opaque, hash, cookies, requireOrigin, activeGrant, authenticationGrant, enrollment, ENROLL_MS, GRANT_MS, MFA_MS, IDLE_MS } from './policy.mjs';

const json = (data, status = 200) => Response.json(data, { status });
const AUTH_ROUTES = new Map([
  ['/sign-in/email', 'POST'], ['/sign-out', 'POST'],
  ['/two-factor/enable', 'POST'], ['/two-factor/verify-totp', 'POST'],
  ['/passkey/generate-register-options', 'GET'], ['/passkey/verify-registration', 'POST'],
  ['/passkey/generate-authenticate-options', 'GET'], ['/passkey/verify-authentication', 'POST'],
]);
function responseCookies(request, response) {
  const merged = cookies(request.headers);
  for (const cookie of response.headers.getSetCookie()) {
    const [key, value] = cookie.split(';')[0].split(/=(.*)/s);
    merged[key] = value;
  }
  const headers = new Headers(request.headers);
  headers.set('cookie', Object.entries(merged).map(([k, v]) => `${k}=${v}`).join('; '));
  return headers;
}
export async function createSpike(config) {
  const { auth, db, cookieName } = await createAuth(config);
  const studentId = db.prepare("SELECT user_id FROM spike_principal WHERE kind = 'student'").get()?.user_id;
  if (!studentId) throw new Error('Run npm run setup first.');
  const kindOf = id => db.prepare('SELECT kind FROM spike_principal WHERE user_id = ?').get(id)?.kind;
  const rawSession = headers => auth.api.getSession({ headers, query: { disableCookieCache: true, disableRefresh: true } });
  const rate = new Map();
  function throttle(key, maximum = 30) {
    const now = Date.now();
    for (const [k, bucket] of rate) if (bucket.until <= now) rate.delete(k);
    const bucket = rate.get(key) || { count: 0, until: now + 60_000 };
    bucket.count++;
    rate.set(key, bucket);
    if (bucket.count > maximum) throw new Denied('RATE_LIMITED', 429);
  }
  async function session(headers) {
    const data = await rawSession(headers);
    if (!data) throw new Denied('SIGN_IN_REQUIRED', 401);
    const kind = kindOf(data.user.id);
    if (Date.now() - new Date(data.session.createdAt).getTime() >= 12 * 60 * 60_000) throw new Denied('SESSION_EXPIRED', 401);
    if (kind === 'student') {
      const grant = activeGrant(db, headers, cookieName);
      const binding = db.prepare('SELECT * FROM session_binding WHERE session_id = ? AND grant_id = ?').get(data.session.id, grant.id);
      if (data.user.id !== grant.student_id || !binding || binding.last_seen <= Date.now() - IDLE_MS) throw new Denied('STUDENT_SESSION_LOCKED', 401);
      db.prepare('UPDATE session_binding SET last_seen = ? WHERE session_id = ?').run(Date.now(), data.session.id);
    } else if (kind !== 'guardian') throw new Denied('UNKNOWN_PRINCIPAL');
    return { ...data, kind };
  }
  async function guardian(headers, fresh = true) {
    const data = await session(headers);
    if (data.kind !== 'guardian') throw new Denied('GUARDIAN_REQUIRED');
    const mfa = db.prepare('SELECT verified_at FROM adult_mfa WHERE session_id = ?').get(data.session.id);
    if (!data.user.twoFactorEnabled || !mfa || (fresh && mfa.verified_at <= Date.now() - MFA_MS)) throw new Denied('RECENT_GUARDIAN_MFA_REQUIRED');
    return data;
  }
  async function authRoute(request, url, body) {
    const path = url.pathname.slice('/api/auth'.length);
    if (AUTH_ROUTES.get(path) !== request.method) throw new Denied('AUTH_ENDPOINT_DISABLED', 404);
    throttle(`auth:${path}`, path === '/two-factor/verify-totp' ? 10 : 30);
    if (path === '/sign-in/email') {
      if (await rawSession(request.headers)) throw new Denied('SIGN_OUT_BEFORE_SWITCHING');
      if (body.email !== 'test-guardian@nexo.invalid') throw new Denied('SYNTHETIC_GUARDIAN_ONLY');
    }
    if (path === '/two-factor/enable') {
      const s = await session(request.headers);
      if (s.kind !== 'guardian' || s.user.twoFactorEnabled) throw new Denied('FACTOR_SETUP_DENIED');
    }
    if (path === '/two-factor/verify-totp') {
      const s = await rawSession(request.headers);
      if (s && kindOf(s.user.id) !== 'guardian') throw new Denied('GUARDIAN_REQUIRED');
      if (body.trustDevice) throw new Denied('TRUSTED_DEVICE_BYPASS_DISABLED');
    }
    if (path.startsWith('/passkey/')) {
      // Even session-authenticated registration must pass our policy. The plugin's
      // resolveUser hook alone is insufficient: it skips resolution for a session.
      if (await rawSession(request.headers)) throw new Denied('SIGN_OUT_BEFORE_PASSKEY_CEREMONY');
      if (path.includes('register') || path === '/passkey/verify-registration') {
        const token = cookies(request.headers)[cookieName];
        const g = token && db.prepare('SELECT id FROM browser_grant WHERE secret_hash = ?').get(hash(token));
        enrollment(db, request.headers, cookieName, path.includes('generate') ? url.searchParams.get('context') : g?.id);
        if (body.createSession) throw new Denied('REGISTRATION_SESSION_DISABLED');
      } else {
        const grant = authenticationGrant(db, request.headers, cookieName);
        if (path.includes('verify') && grant.state === 'active' && body.response?.id !== grant.credential_id) throw new Denied('CREDENTIAL_NOT_APPROVED');
      }
    }
    let response = await auth.handler(request);
    if (!response.ok) return response;
    if (path === '/passkey/generate-authenticate-options') {
      const data = await response.json();
      const grant = authenticationGrant(db, request.headers, cookieName);
      // v1.7.10 hardcodes preferred here. Narrow only the returned UI options;
      // the afterVerification hook independently enforces verified UV server-side.
      data.userVerification = 'required';
      data.allowCredentials = (grant.state === 'active' ? [{ credentialID: grant.credential_id }] : db.prepare('SELECT credentialID FROM passkey WHERE userId = ?').all(grant.student_id)).map(key => ({ id: key.credentialID, type: 'public-key' }));
      response = new Response(JSON.stringify(data), { status: response.status, headers: response.headers });
    }
    if (path === '/passkey/verify-registration') {
      const result = await response.clone().json();
      const token = cookies(request.headers)[cookieName];
      const changed = db.prepare("UPDATE browser_grant SET state = 'active', expires_at = ? WHERE secret_hash = ? AND state = 'registering' AND credential_id = ? AND enroll_expires > ?")
        .run(Date.now() + GRANT_MS, hash(token || ''), result.credentialID, Date.now());
      if (changed.changes !== 1) throw new Denied('ENROLLMENT_FINALIZATION_FAILED');
    }
    if (path === '/passkey/verify-authentication') {
      const grant = activeGrant(db, request.headers, cookieName);
      const result = await response.clone().json();
      if (result.user?.id !== grant.student_id) throw new Denied('PRINCIPAL_MISMATCH');
      db.prepare('INSERT INTO session_binding VALUES (?, ?, ?)').run(result.session.id, grant.id, Date.now());
    }
    if (path === '/two-factor/verify-totp') {
      const verified = await rawSession(responseCookies(request, response));
      if (!verified || kindOf(verified.user.id) !== 'guardian' || !verified.user.twoFactorEnabled) throw new Denied('MFA_FINALIZATION_FAILED');
      db.prepare('INSERT OR REPLACE INTO adult_mfa VALUES (?, ?)').run(verified.session.id, Date.now());
    }
    return response;
  }
  async function route(request, body = {}) {
    const url = new URL(request.url);
    if (url.origin !== config.origin) throw new Denied('HOST_DENIED');
    // Public documents must open from bookmarks or another site. Restrict API
    // calls, including GET challenge endpoints, to the exact origin.
    if (url.pathname.startsWith('/api/')) requireOrigin(request, config.origin);
    if (url.pathname.startsWith('/api/auth/')) return authRoute(request, url, body);
    if (request.method === 'GET' && url.pathname === '/health') return json({ status: 'ok', synthetic: true });
    if (request.method === 'GET' && url.pathname === '/api/status') {
      const token = cookies(request.headers)[cookieName];
      const grant = token && db.prepare('SELECT id, code, state, label, enroll_expires, expires_at FROM browser_grant WHERE secret_hash = ?').get(hash(token));
      let identity = null;
      try {
        const s = await session(request.headers);
        const mfa = db.prepare('SELECT verified_at FROM adult_mfa WHERE session_id = ?').get(s.session.id);
        identity = { name: s.user.name, kind: s.kind, twoFactorEnabled: !!s.user.twoFactorEnabled, recentMFA: !!mfa && mfa.verified_at > Date.now() - MFA_MS };
      } catch (e) { if (!(e instanceof Denied)) throw e; }
      return json({ synthetic: true, origin: config.origin, identity, browser: grant || null });
    }
    if (request.method === 'POST' && url.pathname === '/api/enrollment') {
      throttle('enrollment', 10);
      if (await rawSession(request.headers)) throw new Denied('SIGN_OUT_BEFORE_ENROLLMENT');
      const old = cookies(request.headers)[cookieName];
      if (old && db.prepare("SELECT 1 FROM browser_grant WHERE secret_hash = ? AND state = 'active' AND expires_at > ?").get(hash(old), Date.now())) throw new Denied('BROWSER_ALREADY_APPROVED');
      const label = typeof body.label === 'string' ? body.label.trim() : '';
      if (!label || label.length > 60) throw new Denied('BROWSER_LABEL_REQUIRED', 400);
      const id = randomUUID(), token = opaque(), code = randomBytes(5).toString('hex').toUpperCase();
      const now = Date.now();
      db.prepare('INSERT INTO browser_grant(id,secret_hash,code,label,student_id,state,enroll_expires,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)')
        .run(id, hash(token), code, label, studentId, 'pending', now + ENROLL_MS, now + GRANT_MS, now);
      const response = json({ id, code, expiresAt: now + ENROLL_MS }, 201);
      response.headers.append('set-cookie', `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${GRANT_MS / 1000}${config.secure ? '; Secure' : ''}`);
      return response;
    }
    if (url.pathname === '/api/guardian/enrollment' && request.method === 'POST') {
      await guardian(request.headers);
      throttle('lookup', 10);
      const pending = db.prepare("SELECT id, code, label, state, enroll_expires FROM browser_grant WHERE code = ? AND state = 'pending' AND enroll_expires > ?").get(String(body.code || '').toUpperCase(), Date.now());
      if (!pending) throw new Denied('PENDING_ENROLLMENT_NOT_FOUND', 404);
      return json({ ...pending, student: 'Test Student (synthetic)' });
    }
    if (url.pathname === '/api/guardian/approve' && request.method === 'POST') {
      const adult = await guardian(request.headers);
      const result = db.prepare("UPDATE browser_grant SET state = 'approved', approved_by = ? WHERE id = ? AND code = ? AND state = 'pending' AND enroll_expires > ?")
        .run(adult.user.id, String(body.id || ''), String(body.code || '').toUpperCase(), Date.now());
      if (result.changes !== 1) throw new Denied('APPROVAL_EXPIRED_OR_USED', 409);
      return json({ approved: true });
    }
    if (url.pathname === '/api/guardian/devices' && request.method === 'GET') {
      await guardian(request.headers, false);
      return json(db.prepare('SELECT id,label,state,created_at,expires_at FROM browser_grant ORDER BY created_at DESC').all());
    }
    if (url.pathname === '/api/guardian/revoke' && request.method === 'POST') {
      await guardian(request.headers);
      const grant = db.prepare('SELECT * FROM browser_grant WHERE id = ?').get(String(body.id || ''));
      if (!grant || !['browser','credential','all'].includes(body.scope)) throw new Denied('INVALID_REVOCATION', 400);
      const grants = body.scope === 'all' ? db.prepare('SELECT id FROM browser_grant WHERE student_id = ?').all(studentId)
        : body.scope === 'credential' ? db.prepare('SELECT id FROM browser_grant WHERE credential_id = ?').all(grant.credential_id) : [grant];
      db.exec('BEGIN IMMEDIATE');
      try {
        for (const g of grants) {
          db.prepare("UPDATE browser_grant SET state = 'revoked' WHERE id = ?").run(g.id);
          db.prepare('DELETE FROM session WHERE id IN (SELECT session_id FROM session_binding WHERE grant_id = ?)').run(g.id);
        }
        if (body.scope === 'credential') db.prepare('DELETE FROM passkey WHERE credentialID = ?').run(grant.credential_id);
        if (body.scope === 'all') db.prepare('DELETE FROM passkey WHERE userId = ?').run(studentId);
        db.exec('COMMIT');
      } catch (e) { db.exec('ROLLBACK'); throw e; }
      return json({ revoked: true, scope: body.scope });
    }
    if (url.pathname === '/api/student' && request.method === 'GET') {
      const s = await session(request.headers);
      if (s.kind !== 'student') throw new Denied('STUDENT_REQUIRED');
      return json({ message: 'Signed in as Test Student. This is a synthetic authentication check; there are no lessons or real student records.', kind: 'student' });
    }
    if (request.method === 'GET' && ['/', '/client.js', '/style.css'].includes(url.pathname)) {
      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      return new Response(await readFile(new URL(`./dist/${file}`, import.meta.url)), { headers: { 'content-type': file.endsWith('html') ? 'text/html; charset=utf-8' : file.endsWith('js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8' } });
    }
    throw new Denied('NOT_FOUND', 404);
  }
  const server = createServer(async (req, res) => {
    let response;
    try {
      if (req.headers.host !== new URL(config.origin).host) throw new Denied('HOST_DENIED');
      const buffers = []; let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 64 * 1024) throw new Denied('BODY_TOO_LARGE', 413);
        buffers.push(chunk);
      }
      const body = Buffer.concat(buffers).toString();
      if (body && !String(req.headers['content-type']).startsWith('application/json')) throw new Denied('JSON_REQUIRED', 415);
      let parsed = {};
      if (body) { try { parsed = JSON.parse(body); } catch { throw new Denied('INVALID_JSON', 400); } }
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Denied('JSON_OBJECT_REQUIRED', 400);
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      const request = new Request(new URL(req.url, config.origin), { method: req.method, headers, ...(body ? { body } : {}) });
      response = await route(request, parsed);
    } catch (e) {
      response = json({ code: e instanceof Denied ? e.code : 'INTERNAL_ERROR' }, e instanceof Denied ? e.status : 500);
      // Never log credentials, cookies, WebAuthn responses or request bodies.
      if (!(e instanceof Denied)) console.error('SPIKE_REQUEST_FAILED', e.name);
    }
    const security = {
      'cache-control': 'no-store',
      'content-security-policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
      'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer',
      'permissions-policy': 'publickey-credentials-get=(self), publickey-credentials-create=(self)',
      ...(config.secure ? { 'strict-transport-security': 'max-age=86400' } : {}),
    };
    res.writeHead(response.status, { ...Object.fromEntries(response.headers), ...security, 'set-cookie': response.headers.getSetCookie() });
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  return { server, auth, db };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.umask(0o077);
  const config = loadConfig();
  const { server, db } = await createSpike(config);
  const port = Number(process.env.PORT || 4317);
  server.listen(port, process.env.SPIKE_BIND || '127.0.0.1', () => console.log(`Synthetic auth spike listening on port ${port}; expected origin ${config.origin}`));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
}
