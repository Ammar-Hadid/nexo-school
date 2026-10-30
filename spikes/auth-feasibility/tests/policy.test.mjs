import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { activeGrant, enrollment, hash, requireUV, requireOrigin } from '../policy.mjs';
const headers = new Headers({ cookie: 'grant=synthetic-token' });
function database() {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE browser_grant(id,secret_hash,state,expires_at,enroll_expires,credential_id,student_id); CREATE TABLE passkey(credentialID,userId);');
  db.prepare('INSERT INTO browser_grant VALUES(?,?,?,?,?,?,?)').run('enrollment-1',hash('synthetic-token'),'active',200,200,'credential-1','student-1');
  db.prepare('INSERT INTO passkey VALUES(?,?)').run('credential-1','student-1');
  return db;
}
test('UV requires an explicit verified flag', () => {
  for (const value of [undefined, {}, { userVerified: false }]) assert.throws(() => requireUV(value));
  assert.doesNotThrow(() => requireUV({ userVerified: true }));
});
test('browser approval fails closed for missing cookie, expiry, revocation and deleted credential', () => {
  const db = database();
  assert.equal(activeGrant(db,headers,'grant',199).id,'enrollment-1');
  assert.throws(() => activeGrant(db,new Headers(),'grant',199));
  assert.throws(() => activeGrant(db,headers,'grant',200));
  db.exec("UPDATE browser_grant SET state='revoked'");
  assert.throws(() => activeGrant(db,headers,'grant',199));
  db.exec("UPDATE browser_grant SET state='active'; DELETE FROM passkey");
  assert.throws(() => activeGrant(db,headers,'grant',199)); db.close();
});
test('enrollment requires matching browser, context, unexpired approval and unused state', () => {
  const db = database();
  assert.throws(() => enrollment(db,headers,'grant','enrollment-1',199));
  db.exec("UPDATE browser_grant SET state='approved'");
  assert.equal(enrollment(db,headers,'grant','enrollment-1',199).id,'enrollment-1');
  assert.throws(() => enrollment(db,headers,'grant','different',199));
  assert.throws(() => enrollment(db,headers,'grant','enrollment-1',200));
  db.exec("UPDATE browser_grant SET state='registering'");
  assert.throws(() => enrollment(db,headers,'grant','enrollment-1',199)); db.close();
});
test('CSRF policy denies sibling origins and missing POST origins', () => {
  const origin='https://auth-test.example.com';
  for (const headers of [{}, {origin:'https://sibling.example.com'}, {origin,'sec-fetch-site':'same-site'}]) {
    assert.throws(() => requireOrigin(new Request(`${origin}/api/enrollment`,{method:'POST',headers}),origin));
  }
  assert.doesNotThrow(() => requireOrigin(new Request(`${origin}/api/enrollment`,{method:'POST',headers:{origin,'sec-fetch-site':'same-origin'}}),origin));
});
