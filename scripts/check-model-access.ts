import { resolve } from 'node:path';
import { readBenchmarkKeys } from '../src/server/content/benchmark-setup.ts';
import { checkModelAccess } from '../src/server/content/model-access.ts';

try {
  if (process.argv.length !== 2) throw new Error('NO_ARGUMENTS_SUPPORTED');
  const models = await checkModelAccess(
    readBenchmarkKeys(resolve('.env.d13.local')),
  );
  console.log(
    JSON.stringify(
      {
        mode: 'read-only-model-metadata',
        checkedAt: new Date().toISOString(),
        inferenceCalls: 0,
        models,
      },
      null,
      2,
    ),
  );
  if (models.some((m) => m.status !== 'accessible')) process.exitCode = 1;
} catch {
  console.error(
    'MODEL_ACCESS_CHECK_FAILED: check the private local configuration; no secret values are printed.',
  );
  process.exitCode = 1;
}
