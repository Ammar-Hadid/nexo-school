import { mkdirSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { opaque } from '../policy.mjs';
import { createAuth } from '../auth.mjs';
import { loadConfig } from '../config.mjs';

process.umask(0o077);
const dataDir = resolve(process.env.SPIKE_DATA_DIR || '.data');
if (existsSync(`${dataDir}/config.json`)) throw new Error('Already initialized. Use a NEW SPIKE_DATA_DIR to start another isolated run.');
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
chmodSync(dataDir, 0o700);
writeFileSync(`${dataDir}/config.json`, JSON.stringify({
  origin: process.env.SPIKE_ORIGIN || 'http://localhost:4317',
  secret: opaque(),
}, null, 2), { mode: 0o600 });
const config = loadConfig();
const { auth, db } = await createAuth(config);
const context = await auth.$context;
const guardianId = randomUUID();
const studentId = randomUUID();
const password = opaque();
const createdGuardian = await context.internalAdapter.createUser({ id: guardianId, name: 'Test Guardian', email: 'test-guardian@nexo.invalid', emailVerified: true });
await context.internalAdapter.createAccount({ userId: createdGuardian.id, accountId: createdGuardian.id, providerId: 'credential', password: await context.password.hash(password) });
await context.internalAdapter.createUser({ id: studentId, name: 'Test Student', email: 'test-student@nexo.invalid', emailVerified: false });
// Adapter-generated IDs can differ from requested IDs; resolve seeded identities.
const guardian = db.prepare('SELECT id FROM user WHERE email = ?').get('test-guardian@nexo.invalid');
const student = db.prepare('SELECT id FROM user WHERE email = ?').get('test-student@nexo.invalid');
db.prepare('INSERT INTO spike_principal VALUES (?, ?)').run(guardian.id, 'guardian');
db.prepare('INSERT INTO spike_principal VALUES (?, ?)').run(student.id, 'student');
writeFileSync(`${dataDir}/guardian-credentials.txt`, `SYNTHETIC TEST ACCOUNT ONLY\nEmail: test-guardian@nexo.invalid\nPassword: ${password}\n\nEnroll a separate TEST TOTP entry through the UI. No email is sent.\n`, { mode: 0o600 });
db.close();
console.log(`Initialized synthetic data for ${config.origin}. Credentials saved privately in ${dataDir}/guardian-credentials.txt. No secrets printed.`);
