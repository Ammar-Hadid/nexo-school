import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  benchmarkModels,
  createReviewDecisions,
  estimateScreen,
  renderReviewPackage,
  reviewReadiness,
} from '../src/modules/content/review-benchmark/setup.ts';
import {
  initializeBenchmarkKeys,
  inspectBenchmarkKeys,
} from '../src/server/content/benchmark-setup.ts';

// Deliberately no live-run option, HTTP client, database access or secret output.
const args = process.argv.slice(2);
try {
  if (
    args.length > 1 ||
    (args[0] &&
      !['--init-keys', '--review-markdown', '--review-template'].includes(
        args[0],
      ))
  )
    throw new Error(
      'Usage: content:prepare-benchmark [--init-keys|--review-markdown|--review-template]. This command is offline only.',
    );
  const keyFile = resolve('.env.d13.local');
  if (args[0] === '--init-keys') {
    console.log(
      JSON.stringify({
        file: keyFile,
        result: initializeBenchmarkKeys(keyFile),
        paidCallsEnabled: false,
      }),
    );
  } else if (args[0] === '--review-markdown') {
    console.log(renderReviewPackage());
  } else if (args[0] === '--review-template') {
    console.log(JSON.stringify(createReviewDecisions(), null, 2));
  } else {
    let decisions: unknown = null;
    try {
      decisions = JSON.parse(
        readFileSync(resolve('tasks/d13-review-decisions.json'), 'utf8'),
      );
    } catch {
      /* Missing or invalid decisions stay unready; never print their contents. */
    }
    console.log(
      JSON.stringify(
        {
          mode: 'offline-preparation-only',
          paidCallsEnabled: false,
          userConfirmed: {
            accounts: ['openai', 'anthropic', 'google'],
            reviewer: 'Ammar',
            otherNexoSpendMicroEur: 0,
            month: '2026-10',
          },
          monthlyCeilingMicroEur: 10_000_000,
          remainingAllowanceVerified: false,
          // No database/vendor invoice read: the user statement is not a reconciled balance.
          keys: inspectBenchmarkKeys(keyFile),
          keyStatusMeaning: 'presence only; account/model access not checked',
          models: benchmarkModels.map(({ provider, model }) => ({
            provider,
            model,
          })),
          existingDevelopmentReferences: reviewReadiness(decisions),
          estimate: estimateScreen({
            items: 40,
            inputTokens: 2000,
            outputTokens: 500,
            microEurPerUsd: 1_500_000,
          }),
          blockers: [
            'Human adjudication and expanded family/passage-separated reference set',
            'Expanded quality-run manifest and bounds; live smoke is limited to c01',
            'Provider invoice reconciliation against the durable local smoke ledger',
          ],
        },
        null,
        2,
      ),
    );
  }
} catch (error) {
  // Helpers expose only fixed diagnostic messages, never raw provider/secret data.
  console.error(
    error instanceof Error ? error.message : 'BENCHMARK_SETUP_FAILED',
  );
  process.exitCode = 1;
}
