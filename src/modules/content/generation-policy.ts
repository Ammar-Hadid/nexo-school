import { exact, record } from './content-records.ts';

export const generationPolicy = Object.freeze({
  version: 'synthetic-generation-v1',
  provider: 'fake-v1',
  maxAttempts: 3,
  timeoutMs: 5000,
  leaseMs: 30000,
  retryDelayMs: 1000,
  reservationMicroEur: 1000,
  maxMonthlyMicroEur: 10_000_000,
});
export type GenerationRequest = {
  requestId: string;
  feature: 'generation' | 'review' | 'feedback';
  specification: string;
};
export function validateGenerationRequest(value: unknown): GenerationRequest {
  if (
    !record(value) ||
    !exact(value, ['requestId', 'feature', 'specification']) ||
    typeof value.requestId !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(value.requestId) ||
    typeof value.feature !== 'string' ||
    !['generation', 'review', 'feedback'].includes(value.feature) ||
    typeof value.specification !== 'string' ||
    !value.specification.trim() ||
    value.specification.length > 8000
  )
    throw new Error('INVALID_GENERATION_REQUEST');
  return value as GenerationRequest;
}
export function validateMonthlyCap(cap: number): number {
  if (
    !Number.isSafeInteger(cap) ||
    cap < 0 ||
    cap > generationPolicy.maxMonthlyMicroEur
  )
    throw new Error('INVALID_MONTHLY_CAP');
  return cap;
}
