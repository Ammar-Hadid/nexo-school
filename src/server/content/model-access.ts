import 'server-only';
import { benchmarkModels } from '../../modules/content/review-benchmark/setup.ts';
import { record } from '../../modules/content/content-records.ts';
import type { readBenchmarkKeys } from './benchmark-setup.ts';

/** Read-only model metadata, no inference, retries, redirects or arbitrary endpoints. */
export async function checkModelAccess(
  keys: ReturnType<typeof readBenchmarkKeys>,
  fetcher: typeof fetch = fetch,
) {
  return Promise.all(
    benchmarkModels.map(async ({ provider, model }) => {
      const key =
        keys[
          provider === 'openai'
            ? 'OPENAI_API_KEY'
            : provider === 'anthropic'
              ? 'ANTHROPIC_API_KEY'
              : 'GEMINI_API_KEY'
        ];
      const base = { provider, requestedModel: model };
      if (!key) return { ...base, status: 'missing-key' as const };
      const url =
        provider === 'openai'
          ? `https://api.openai.com/v1/models/${model}`
          : provider === 'anthropic'
            ? `https://api.anthropic.com/v1/models/${model}`
            : `https://generativelanguage.googleapis.com/v1beta/models/${model}`;
      const headers: Record<string, string> =
        provider === 'openai'
          ? { authorization: `Bearer ${key}` }
          : provider === 'anthropic'
            ? { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
            : { 'x-goog-api-key': key };
      try {
        const response = await fetcher(url, {
          method: 'GET',
          headers,
          redirect: 'error',
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) {
          await response.body?.cancel();
          return {
            ...base,
            status: 'not-accessible' as const,
            httpStatus: response.status,
          };
        }
        const body: unknown = await response.json();
        const served = record(body)
          ? provider === 'google'
            ? body.name
            : body.id
          : undefined;
        if (
          typeof served !== 'string' ||
          !/^[a-zA-Z0-9_./-]{1,150}$/.test(served)
        )
          return { ...base, status: 'invalid-metadata' as const };
        return {
          ...base,
          status: 'accessible' as const,
          resolvedModel: served,
          httpStatus: response.status,
        };
      } catch {
        return { ...base, status: 'network-error' as const };
      }
    }),
  );
}
