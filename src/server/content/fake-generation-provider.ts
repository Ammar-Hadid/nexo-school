import 'server-only';
import type { GenerationProvider } from './generation-jobs';

/** No network, learner information or content approval. Rates are fictional test units. */
export const fakeGenerationProvider: GenerationProvider = Object.freeze({
  id: 'fake-v1',
  async generate({
    feature,
    signal,
  }: Parameters<GenerationProvider['generate']>[0]) {
    signal.throwIfAborted();
    return {
      draft: `Synthetisch concept voor ${feature}; inhoudelijke beoordeling vereist.`,
      costMicroEur: 400,
      inputTokens: 10,
      outputTokens: 20,
    };
  },
});
