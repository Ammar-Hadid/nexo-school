import { canonicalJson, record } from '../content-records.ts';
import { benchmarkCases } from './fixtures.ts';
import { reviewRequest, type Stage } from './benchmark.ts';
import { benchmarkModels } from './setup.ts';

export const liveProviderId = 'd13-live-smoke-v1';
export const livePolicyVersion = 'd13-live-smoke-20261022-v1';
export const liveRunCeilingMicroEur = 8_000_000;
export const outputCap = 2048;
export const smokeCandidate = benchmarkCases[0]!.candidate;
// Fixed global endpoints. Worst input tier/cache-write and long-context prices;
// Google uses its announced post-promotion rate. EUR allowance includes FX/tax.
const bounds: Record<
  string,
  { input: number; output: number; context: number }
> = {
  'gpt-6-luna': { input: 250_000, output: 1_000_000, context: 1_050_000 },
  'gpt-6.1-sol': { input: 5_000_000, output: 20_000_000, context: 1_050_000 },
  'claude-haiku-5-5': { input: 500_000, output: 2_500_000, context: 1_048_576 },
  'claude-sonnet-5-5': {
    input: 2_000_000,
    output: 10_000_000,
    context: 1_048_576,
  },
  'claude-opus-5-5': {
    input: 4_000_000,
    output: 20_000_000,
    context: 1_048_576,
  },
  'gemini-3.8-flash': {
    input: 1_500_000,
    output: 7_500_000,
    context: 1_048_576,
  },
  'gemini-4-argon': {
    input: 4_000_000,
    output: 20_000_000,
    context: 1_048_576,
  },
};
export function smokeRequestId(model: string, stage: Stage) {
  return `d13-smoke-20261022-v1-${model.replaceAll('.', '_')}-${stage}`;
}
export function smokeSpecification(model: string, stage: Stage) {
  if (
    !benchmarkModels.some((m) => m.model === model) ||
    !['solve', 'semantic'].includes(stage)
  )
    throw new Error('INVALID_SMOKE_PROFILE');
  return canonicalJson({
    ...reviewRequest(smokeCandidate, stage, 'fake-checker-v1'),
    model,
  });
}
export function readSmokeSpecification(specification: string) {
  const value: unknown = JSON.parse(specification);
  if (
    !record(value) ||
    typeof value.model !== 'string' ||
    (value.stage !== 'solve' && value.stage !== 'semantic') ||
    specification !== smokeSpecification(value.model, value.stage)
  )
    throw new Error('SMOKE_REQUEST_CONFLICT');
  return value as { model: string; stage: Stage; id: string };
}
export function usageCeilingMicroEur(
  model: string,
  input: number,
  output: number,
) {
  const rate = bounds[model];
  if (
    !rate ||
    !Number.isSafeInteger(input) ||
    !Number.isSafeInteger(output) ||
    input < 0 ||
    input > rate.context ||
    output < 0 ||
    output > outputCap
  )
    throw new Error('INVALID_BILLABLE_USAGE');
  const amount =
    (BigInt(input) * BigInt(rate.input) +
      BigInt(output) * BigInt(rate.output)) *
    1_500_000n;
  return Number((amount + 999_999_999_999n) / 1_000_000_000_000n);
}
export function smokePolicy(specification: string) {
  const { model } = readSmokeSpecification(specification);
  return {
    version: livePolicyVersion,
    provider: liveProviderId,
    maxAttempts: 1,
    timeoutMs: 60_000,
    leaseMs: 90_000,
    retryDelayMs: 0,
    reservationMicroEur: usageCeilingMicroEur(
      model,
      bounds[model]!.context,
      outputCap,
    ),
  };
}
