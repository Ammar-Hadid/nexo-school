// Run once before human TOTP enrollment. Never prints passwords, cookies or tokens.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const origin = 'https://auth-test.ammarhadid.com';
const password = readFileSync('.data/deployment/guardian-credentials.txt','utf8').match(/Password: (.+)/)[1];
const post = (path, body, cookie = '', givenOrigin = origin) => fetch(`${origin}${path}`, {
  method:'POST', headers:{origin:givenOrigin,'content-type':'application/json', ...(cookie ? {cookie} : {})}, body:JSON.stringify(body),
});
const health = await fetch(`${origin}/health`); assert.equal(health.status,200);
assert.equal((await fetch(`${origin}/api/student`)).status,401);
assert.equal((await post('/api/enrollment',{label:'Denied origin check'},'', 'https://sibling.invalid')).status,403);
const login = await post('/api/auth/sign-in/email',{email:'test-guardian@nexo.invalid',password});
assert.equal(login.status,200);
const setCookies = login.headers.getSetCookie();
const session = setCookies.find(c => c.includes('session_token='));
assert.ok(session,'Run this initial bootstrap check before enrolling TOTP.');
assert.ok(session.startsWith('__Host-'));
for (const attribute of ['Secure','HttpOnly','SameSite=Strict','Path=/']) assert.ok(session.toLowerCase().includes(attribute.toLowerCase()));
assert.ok(!/domain=/i.test(session));
const cookie = setCookies.map(c => c.split(';')[0]).join('; ');
assert.equal((await post('/api/guardian/approve',{},cookie)).status,403);
assert.equal((await post('/api/auth/sign-out',{},cookie)).status,200);
console.log('PASS: public HTTPS, signed-out denial, sibling-origin denial, __Host-/Secure/HttpOnly/Strict session cookie, password-only approval denial, sign-out. No secrets logged.');
