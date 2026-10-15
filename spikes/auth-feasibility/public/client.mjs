import { createAuthClient } from 'better-auth/client';
import { twoFactorClient } from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';
const client = createAuthClient({ plugins: [twoFactorClient(), passkeyClient()] });
const $ = id => document.getElementById(id);
let status, reviewed;
const notice = message => { $('notice').textContent = message; };
function result(value) { if (value.error) throw new Error(value.error.message || value.error.code); return value.data; }
async function api(path, body) {
  const response = await fetch(`/api${path}`, { method: body === undefined ? 'GET' : 'POST', headers: body === undefined ? {} : { 'content-type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const value = await response.json();
  if (!response.ok) throw new Error(value.code || value.message || `Request failed (${response.status})`);
  return value;
}
async function refresh() {
  status = await api('/status');
  $('identity').textContent = status.identity ? `${status.identity.name} · ${status.identity.kind}${status.identity.kind === 'guardian' ? ` · recent MFA: ${status.identity.recentMFA ? 'yes' : 'no'}` : ''}` : 'Signed out (or session locked).';
  const grant = status.browser;
  $('browser-state').textContent = grant ? `Browser grant: ${grant.state} · ${grant.label}` : 'This browser has no student approval.';
  $('enrollment-code').textContent = grant && ['pending','approved'].includes(grant.state) ? `${grant.code} · expires ${new Date(grant.enroll_expires).toLocaleTimeString()}` : '';
}
function action(id, fn, event = 'click') {
  $(id).addEventListener(event, async e => {
    e.preventDefault();
    const buttons = [...document.querySelectorAll('button')]; buttons.forEach(b => b.disabled = true);
    try { await fn(); await refresh(); } catch (error) { notice(error.message); }
    finally { buttons.forEach(b => b.disabled = false); }
  });
}
action('refresh', async () => { await refresh(); notice('Status refreshed.'); });
action('signout', async () => { result(await client.signOut()); $('password').value = ''; $('totp').value = ''; hideSecrets(); $('devices').replaceChildren(); $('review').hidden = true; notice('Signed out. Student browser approval is retained.'); });
action('student-check', async () => notice((await api('/student')).message));
action('request-enrollment', async () => { await api('/enrollment', { label: $('device-label').value }); notice('Show the enrollment code to the guardian on their separate browser.'); });
action('register', async () => {
  await refresh();
  if (status.browser?.state !== 'approved') throw new Error('Guardian approval is required. Refresh after approval.');
  result(await client.passkey.addPasskey({ context: status.browser.id, name: 'Test Student — spike', createSession: false }));
  notice('Student passkey registered. Use “Sign in with passkey” to test daily access.');
});
action('login', async () => { result(await client.signIn.passkey()); notice('Passkey accepted. Check student access.'); });
action('guardian-login', async () => {
  const data = result(await client.signIn.email({ email: 'test-guardian@nexo.invalid', password: $('password').value }));
  notice(data.twoFactorRedirect ? 'Enter your test authenticator code to finish sign-in.' : 'Signed in. Set up a test authenticator on the first run.');
}, 'submit');
action('enable-totp', async () => {
  const data = result(await client.twoFactor.enable({ password: $('password').value }));
  const uri = new URL(data.totpURI);
  $('totp-secret').textContent = uri.searchParams.get('secret');
  $('backup-codes').textContent = data.backupCodes.join('\n');
  $('totp-setup').hidden = false;
  notice('Save the test secret, then verify a code below.');
});
function hideSecrets() { $('totp-setup').hidden = true; $('totp-secret').textContent = ''; $('backup-codes').textContent = ''; }
action('hide-secrets', async () => { hideSecrets(); notice('Setup secrets hidden.'); });
action('verify-totp', async () => { result(await client.twoFactor.verifyTotp({ code: $('totp').value, trustDevice: false })); $('totp').value = ''; $('password').value = ''; hideSecrets(); notice('Guardian MFA verified for five minutes.'); }, 'submit');
action('lookup', async () => {
  reviewed = await api('/guardian/enrollment', { code: $('lookup-code').value });
  $('review-summary').textContent = `Approve ${reviewed.label} for ${reviewed.student}? Code ${reviewed.code}. Compare both screens before approving.`;
  $('review').hidden = false;
  notice('Check the student browser label and code.');
}, 'submit');
action('approve', async () => { await api('/guardian/approve', { id: reviewed.id, code: reviewed.code }); $('review').hidden = true; notice('Approved. Refresh status on the student browser.'); });
async function devices() {
  const rows = await api('/guardian/devices');
  $('devices').replaceChildren();
  for (const row of rows) {
    const li = document.createElement('li');
    const label = document.createElement('p'); label.textContent = `${row.label} · ${row.state}`; li.append(label);
    for (const [scope, title] of [['browser', 'Revoke browser'], ['credential', 'Revoke passkey everywhere'], ['all', 'Revoke all student access']]) {
      const button = document.createElement('button'); button.textContent = title;
      button.addEventListener('click', async () => {
        try { await api('/guardian/revoke', { id: row.id, scope }); notice(`Revoked: ${scope}.`); await devices(); }
        catch (e) { notice(e.message); }
      }); li.append(button);
    } $('devices').append(li);
  }
}
action('list-devices', devices);
$('capability').textContent = `Secure context: ${window.isSecureContext ? 'yes' : 'no'} · WebAuthn API: ${window.PublicKeyCredential ? 'available' : 'unavailable'}. Actual passkey support still needs a successful ceremony.`;
refresh().catch(error => notice(error.message));
