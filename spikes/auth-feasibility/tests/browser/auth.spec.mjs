import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { base32 } from '@better-auth/utils/base32';
import { createOTP } from '@better-auth/utils/otp';
const origin = 'http://localhost:4318';
const post = (context, path, data) => context.request.post(path, { data, headers: { origin } });
async function virtual(browser) {
  const context = await browser.newContext({ baseURL: origin });
  const page = await context.newPage();
  await page.goto('/');
  const cdp = await context.newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: {
    protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true,
  } });
  return { context, page, cdp, authenticatorId };
}
async function requestEnrollment(child, label) {
  const response = await post(child.context, '/api/enrollment', { label });
  expect(response.status()).toBe(201);
  return response.json();
}
async function approve(guardian, enrollment) {
  expect((await post(guardian, '/api/guardian/enrollment', { code: enrollment.code })).status()).toBe(200);
  expect((await post(guardian, '/api/guardian/approve', enrollment)).status()).toBe(200);
}
async function signIn(child) {
  const [verification] = await Promise.all([
    child.page.waitForResponse(r => r.url().endsWith('/api/auth/passkey/verify-authentication')),
    child.page.getByRole('button', { name: 'Sign in with passkey', exact: true }).click(),
  ]);
  expect(verification.status()).toBe(200);
  await expect(child.page.locator('#notice')).toContainText('Passkey accepted');
  expect((await child.context.request.get('/api/student')).status()).toBe(200);
}
async function signOut(child) { expect((await post(child.context, '/api/auth/sign-out', {})).status()).toBe(200); }

test('actual Better Auth ceremonies enforce approval, MFA, UV, roles, replay, revoke and recovery', async ({ browser }) => {
  const { dataDir } = JSON.parse(readFileSync('.data/test-current.json','utf8'));
  const password = readFileSync(`${dataDir}/guardian-credentials.txt`,'utf8').match(/Password: (.+)/)[1];
  const db = new DatabaseSync(`${dataDir}/spike.sqlite`);
  const guardian = await browser.newContext({ baseURL: origin });
  const adult = await guardian.newPage();
  const child = await virtual(browser);
  const enrollment = await requestEnrollment(child, 'Synthetic tablet');
  let otp;
  await test.step('guardian password alone cannot approve; real TOTP setup and verification unlocks approval', async () => {
    await adult.goto('/');
    await adult.getByLabel('Synthetic guardian password').fill(password);
    await adult.getByRole('button', { name: 'Sign in as test guardian', exact: true }).click();
    await expect(adult.locator('#notice')).toContainText('Set up a test authenticator');
    expect((await post(guardian, '/api/guardian/approve', enrollment)).status()).toBe(403);
    await adult.getByText('First run: set up a test authenticator', { exact: true }).click();
    await adult.getByRole('button', { name: 'Set up test TOTP', exact: true }).click();
    await expect(adult.locator('#totp-secret')).not.toHaveText('');
    otp = createOTP(new TextDecoder().decode(base32.decode(await adult.locator('#totp-secret').textContent())));
    await adult.getByLabel('Authenticator code', { exact: true }).fill(await otp.totp());
    await adult.getByRole('button', { name: 'Verify / refresh MFA' }).click();
    await expect(adult.locator('#notice')).toContainText('Guardian MFA verified');
    await adult.getByLabel('Enrollment code shown on the student browser').fill(enrollment.code);
    await adult.getByRole('button', { name: 'Review enrollment' }).click();
    await expect(adult.locator('#review-summary')).toContainText('Synthetic tablet');
    await adult.getByRole('button', { name: 'Approve this enrollment' }).click();
    await expect(adult.locator('#notice')).toContainText('Approved.');
    expect((await post(guardian, '/api/guardian/approve', enrollment)).status()).toBe(409);
    expect((await post(guardian, '/api/auth/two-factor/disable', { password })).status()).toBe(404);
  });
  await test.step('unapproved browser cannot reuse an enrollment context; approved browser registers and signs in', async () => {
    const stranger = await browser.newContext({ baseURL: origin });
    expect((await stranger.request.get(`/api/auth/passkey/generate-register-options?context=${enrollment.id}`)).status()).toBe(403);
    await stranger.close();
    await child.cdp.send('WebAuthn.setResponseOverrideBits', {authenticatorId:child.authenticatorId,isBadUV:true});
    await child.page.route('**/api/auth/passkey/generate-register-options?*', async route => {
      const response = await route.fetch(); const value = await response.json(); value.authenticatorSelection.userVerification = 'discouraged';
      await route.fulfill({response,json:value});
    });
    await child.page.getByRole('button', { name: 'Create student passkey' }).click();
    await expect(child.page.locator('#notice')).toContainText('USER_VERIFICATION_REQUIRED');
    await child.page.unroute('**/api/auth/passkey/generate-register-options?*');
    await child.cdp.send('WebAuthn.setResponseOverrideBits', {authenticatorId:child.authenticatorId});
    await child.page.getByRole('button', { name: 'Create student passkey' }).click();
    await expect(child.page.locator('#notice')).toContainText('Student passkey registered');
    expect((await child.context.request.get('/api/student')).status()).toBe(401);
    await signIn(child);
    expect((await child.context.request.get('/api/guardian/devices')).status()).toBe(403);
    expect((await post(child.context, '/api/auth/sign-up/email', {email:'other@nexo.invalid',password})).status()).toBe(404);
    expect((await post(child.context, '/api/auth/passkey/delete-passkey', {id:'anything'})).status()).toBe(404);
    expect((await child.context.request.get(`/api/auth/passkey/generate-register-options?context=${enrollment.id}`)).status()).toBe(403);
    expect((await post(child.context, '/api/auth/sign-in/email', {email:'test-guardian@nexo.invalid',password})).status()).toBe(403);
  });
  const { credentials } = await child.cdp.send('WebAuthn.getCredentials', { authenticatorId: child.authenticatorId });
  const second = await virtual(browser);
  await second.cdp.send('WebAuthn.addCredential', { authenticatorId: second.authenticatorId, credential: { ...credentials.find(c => Buffer.from(c.credentialId, 'base64').toString('base64url') === db.prepare("SELECT credential_id FROM browser_grant WHERE id = ?").get(enrollment.id).credential_id), signCount: 100 } });
  await test.step('synced credential alone is denied; fresh guardian approval permits its use on another browser', async () => {
    expect((await second.context.request.get('/api/auth/passkey/generate-authenticate-options')).status()).toBe(403);
    const secondEnrollment = await requestEnrollment(second, 'Synthetic synced browser');
    await approve(guardian, secondEnrollment);
    await signIn(second);
    second.grantId = secondEnrollment.id;
  });
  await test.step('browser revocation removes that session and leaves the other approved browser usable', async () => {
    expect((await post(guardian, '/api/guardian/revoke', {id:enrollment.id,scope:'browser'})).status()).toBe(200);
    expect((await child.context.request.get('/api/student')).status()).not.toBe(200);
    expect((await second.context.request.get('/api/student')).status()).toBe(200);
  });
  await test.step('MFA freshness and child inactivity are enforced server-side', async () => {
    db.prepare('UPDATE adult_mfa SET verified_at = ?').run(Date.now() - 6*60_000);
    expect((await post(guardian,'/api/guardian/revoke',{id:second.grantId,scope:'browser'})).status()).toBe(403);
    expect((await post(guardian,'/api/auth/two-factor/verify-totp',{code:await otp.totp()})).status()).toBe(200);
    db.prepare('UPDATE session_binding SET last_seen = ?').run(Date.now() - 31*60_000);
    expect((await second.context.request.get('/api/student')).status()).toBe(401);
    await signOut(second);
    await signIn(second);
  });
  await test.step('verified WebAuthn assertion with UV missing is denied; replay and wrong origin are denied', async () => {
    await signOut(second);
    await second.cdp.send('WebAuthn.setUserVerified', {authenticatorId:second.authenticatorId,isUserVerified:false});
    // Deliberately downgrade only client options to obtain a signed UV=false assertion.
    await second.page.route('**/api/auth/passkey/generate-authenticate-options', async route => {
      const response = await route.fetch(); const value = await response.json(); value.userVerification = 'discouraged';
      await route.fulfill({response,json:value});
    });
    await second.page.getByRole('button', { name: 'Sign in with passkey',exact:true }).click();
    await expect(second.page.locator('#notice')).toContainText('USER_VERIFICATION_REQUIRED');
    expect((await second.context.request.get('/api/student')).status()).toBe(401);
    await second.page.unroute('**/api/auth/passkey/generate-authenticate-options');
    await second.cdp.send('WebAuthn.setUserVerified', {authenticatorId:second.authenticatorId,isUserVerified:true});
    let assertion;
    await second.page.route('**/api/auth/passkey/verify-authentication', async route => { assertion = route.request().postDataJSON(); await route.continue(); });
    await signIn(second);
    await signOut(second);
    expect((await post(second.context,'/api/auth/passkey/verify-authentication',assertion)).status()).not.toBe(200);
    expect((await second.context.request.post('/api/auth/passkey/verify-authentication',{data:assertion,headers:{origin:'https://sibling.invalid'}})).status()).toBe(403);
    await second.page.unroute('**/api/auth/passkey/verify-authentication');
  });
  await test.step('credential-wide revocation denies every copy; new guardian enrollment recovers access', async () => {
    await signIn(second);
    expect((await post(guardian,'/api/guardian/revoke',{id:second.grantId,scope:'credential'})).status()).toBe(200);
    expect((await second.context.request.get('/api/student')).status()).not.toBe(200);
    expect((await second.context.request.get('/api/auth/passkey/generate-authenticate-options')).status()).toBe(403);
    const recovered = await virtual(browser);
    const recovery = await requestEnrollment(recovered,'Synthetic recovery');
    await approve(guardian,recovery);
    await recovered.page.getByRole('button',{name:'Create student passkey'}).click();
    await expect(recovered.page.locator('#notice')).toContainText('Student passkey registered');
    await signIn(recovered);
    // Session token alone without its separately approved browser cookie is denied.
    const stolen = await browser.newContext({baseURL:origin});
    await stolen.addCookies((await recovered.context.cookies()).filter(c => !c.name.endsWith('browser')));
    expect((await stolen.request.get('/api/student')).status()).toBe(403);
    await stolen.close();
    expect((await post(guardian,'/api/guardian/revoke',{id:recovery.id,scope:'all'})).status()).toBe(200);
    expect((await recovered.context.request.get('/api/student')).status()).not.toBe(200);
    await recovered.context.close();
  });
  await test.step('expired enrollment cannot register; public responses set restrictive headers', async () => {
    const expired = await requestEnrollment(child,'Expired test');
    await approve(guardian,expired);
    db.prepare('UPDATE browser_grant SET enroll_expires = ? WHERE id = ?').run(Date.now()-1,expired.id);
    expect((await child.context.request.get(`/api/auth/passkey/generate-register-options?context=${expired.id}`)).status()).toBe(403);
    const page = await guardian.request.get('/', {headers:{'sec-fetch-site':'cross-site'}});
    expect(page.status()).toBe(200);
    expect((await guardian.request.get('/api/status',{headers:{'sec-fetch-site':'cross-site'}})).status()).toBe(403);
    expect(page.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(page.headers()['cache-control']).toBe('no-store');
    expect((await guardian.request.post('/api/enrollment',{data:{label:'CSRF'}})).status()).toBe(403);
  });
  await test.step('returning guardian login requires the second factor again', async () => {
    expect((await post(guardian,'/api/auth/sign-out',{})).status()).toBe(200);
    const passwordOnly = await post(guardian,'/api/auth/sign-in/email',{email:'test-guardian@nexo.invalid',password});
    expect((await passwordOnly.json()).twoFactorRedirect).toBe(true);
    expect((await guardian.request.get('/api/guardian/devices')).status()).toBe(401);
    expect((await post(guardian,'/api/auth/two-factor/verify-totp',{code:await otp.totp()})).status()).toBe(200);
    expect((await guardian.request.get('/api/guardian/devices')).status()).toBe(200);
  });
  db.close();
  await Promise.all([guardian.close(),child.context.close(),second.context.close()]);
});

test('layout remains usable at tablet, desktop and mobile widths', async ({page}) => {
  for (const [width,height] of [[1440,900],[1280,800],[390,844]]) {
    await page.setViewportSize({width,height}); await page.goto('/');
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
