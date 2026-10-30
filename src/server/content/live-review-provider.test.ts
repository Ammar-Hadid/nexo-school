import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import {
  createLiveReviewProvider,
  buildLiveRequest,
} from './live-review-provider';
import {
  smokeSpecification,
  outputCap,
} from '../../modules/content/review-benchmark/live-smoke';
import { benchmarkModels } from '../../modules/content/review-benchmark/setup';

it('freezes tools-free single-turn requests with combined output limits and no key-bearing URLs', () => {
  for (const { model } of benchmarkModels) {
    const request = buildLiveRequest(smokeSpecification(model, 'solve'));
    expect(request.url).toMatch(
      /^https:\/\/(api.openai.com|api.anthropic.com|generativelanguage.googleapis.com)\//,
    );
    expect(request.url).not.toContain('?');
    expect(JSON.stringify(request.body)).not.toContain('"tools"');
    expect(JSON.stringify(request.body)).toContain(String(outputCap));
    expect(JSON.stringify(request.body)).not.toContain(
      'Tel vier op bij drie: zeven.',
    );
  }
});

it('adds Google thoughts to billable output, rejects missing usage and never retries HTTP errors', async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          modelVersion: 'gemini-3.8-flash',
          responseId: 'reply-1',
          candidates: [
            { finishReason: 'STOP', content: { parts: [{ text: '{}' }] } },
          ],
          usageMetadata: {
            promptTokenCount: 100,
            candidatesTokenCount: 40,
            thoughtsTokenCount: 60,
          },
        }),
      ),
  );
  const provider = createLiveReviewProvider(
    { GEMINI_API_KEY: 'sentinel' },
    fetcher,
  );
  const input = {
    specification: smokeSpecification('gemini-3.8-flash', 'solve'),
    feature: 'review',
    idempotencyKey: 'one',
    signal: new AbortController().signal,
  };
  const receipt = await provider.generate(input);
  expect(receipt.inputTokens).toBe(100);
  expect(receipt.outputTokens).toBe(100);
  expect(JSON.parse(receipt.draft).validReview).toBe(false);
  expect(receipt.draft).not.toContain('sentinel');
  fetcher.mockImplementation(async () => new Response('{}'));
  await expect(provider.generate(input)).rejects.toThrow(
    'UNKNOWN_PROVIDER_USAGE',
  );
  fetcher.mockImplementation(
    async () => new Response('secret-sentinel', { status: 401 }),
  );
  await expect(provider.generate(input)).rejects.toThrow('PROVIDER_HTTP_401');
  expect(fetcher).toHaveBeenCalledTimes(3);
});

it('charges reasoning once for OpenAI and includes all Anthropic input categories', async () => {
  for (const [model, body, expected] of [
    [
      'gpt-6-luna',
      {
        model: 'gpt-6-luna',
        id: 'r1',
        status: 'incomplete',
        usage: {
          input_tokens: 100,
          output_tokens: 80,
          output_tokens_details: { reasoning_tokens: 60 },
        },
        output: [],
      },
      [100, 80],
    ],
    [
      'claude-haiku-5-5',
      {
        model: 'claude-haiku-5-5',
        id: 'r2',
        stop_reason: 'max_tokens',
        usage: {
          input_tokens: 100,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 20,
          output_tokens: 80,
        },
        content: [],
      },
      [120, 80],
    ],
  ] as const) {
    const provider = createLiveReviewProvider(
      { OPENAI_API_KEY: 'x', ANTHROPIC_API_KEY: 'x' },
      async () => new Response(JSON.stringify(body)),
    );
    const result = await provider.generate({
      specification: smokeSpecification(model, 'solve'),
      feature: 'review',
      idempotencyKey: 'one',
      signal: new AbortController().signal,
    });
    expect([result.inputTokens, result.outputTokens]).toEqual(expected);
    expect(JSON.parse(result.draft).validReview).toBe(false);
  }
});

it('retains HTTP 503 diagnostics even if cancelling the error body fails', async () => {
  const response = new Response('private upstream body', { status: 503 });
  vi.spyOn(response.body!, 'cancel').mockRejectedValue(
    new Error('private cancel error'),
  );
  const diagnostic = vi.fn();
  const fetcher = vi.fn(async () => response);
  const provider = createLiveReviewProvider(
    { GEMINI_API_KEY: 'sentinel' },
    fetcher,
    diagnostic,
  );
  await expect(
    provider.generate({
      specification: smokeSpecification('gemini-3.8-flash', 'solve'),
      feature: 'review',
      idempotencyKey: '503',
      signal: new AbortController().signal,
    }),
  ).rejects.toThrow('PROVIDER_HTTP_503');
  expect(diagnostic).toHaveBeenCalledWith(
    'gemini-3.8-flash',
    'PROVIDER_HTTP_503',
  );
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it('uses the expanded frozen request and schema without altering the smoke schema', async () => {
  const { expandedRequest, expandedProviderId } =
    await import('../../modules/content/review-benchmark/expanded');
  const spec = expandedRequest('s08', 'semantic', 'gpt-6-luna');
  const request = buildLiveRequest(spec, 'expanded');
  expect(JSON.stringify(request.body)).toContain('rubric-response-mismatch');
  expect(JSON.stringify(request.body)).toContain('"objective"');
  const provider = createLiveReviewProvider(
    { OPENAI_API_KEY: 'x' },
    async () =>
      new Response(
        JSON.stringify({
          model: 'gpt-6-luna',
          status: 'completed',
          usage: { input_tokens: 900, output_tokens: 120 },
          output: [
            {
              content: [
                {
                  type: 'output_text',
                  text: JSON.stringify({
                    contentHash: JSON.parse(spec).contentHash,
                    status: 'flagged',
                    answer: null,
                    findings: [
                      {
                        code: 'rubric-response-mismatch',
                        severity: 'attention',
                        field: 'rubric',
                        quote: JSON.parse(spec).rubric,
                        reason: 'No choices.',
                      },
                    ],
                  }),
                },
              ],
            },
          ],
        }),
      ),
    undefined,
    'expanded',
  );
  expect(provider.id).toBe(expandedProviderId);
  const receipt = await provider.generate({
    specification: spec,
    feature: 'review',
    idempotencyKey: 'expanded',
    signal: new AbortController().signal,
  });
  expect(JSON.parse(receipt.draft).validReview).toBe(true);
  expect(
    JSON.stringify(
      buildLiveRequest(smokeSpecification('gpt-6-luna', 'solve')).body,
    ),
  ).not.toContain('rubric-response-mismatch');
});

it('preserves frozen reviewer requests while adding bounded generation and blinded Haiku review', async () => {
  const { expandedManifest } =
    await import('../../modules/content/review-benchmark/expanded');
  const { fingerprint } =
    await import('../../modules/content/review-benchmark/benchmark');
  expect(
    fingerprint(
      expandedManifest.map((m) =>
        buildLiveRequest(m.specification, 'expanded'),
      ),
    ),
  ).toBe('0903e5bc375b031b531092a0315a8bb9ff2a418b256bea1e58f745f8a6bf14d2');
  const {
    generatorRequest,
    generatorRequestId,
    generatorReviewRequest,
    parseGeneratedExercise,
  } = await import('../../modules/content/review-benchmark/generator');
  const candidate = parseGeneratedExercise('t01', {
    prompt: 'Dapper. Welk woord past?',
    passage: '',
    options: ['moedig', 'bang', 'lui', 'stil'],
    rubric: 'Kies één antwoord.',
    answer: 'moedig',
    explanation: 'Moedig is ongeveer hetzelfde als dapper.',
  })!;
  for (const model of ['gpt-6-luna', 'gemini-3.8-flash', 'claude-sonnet-5-5']) {
    const generation = buildLiveRequest(
      generatorRequest('t01', model),
      'generator',
    );
    expect(generation.model).toBe(model);
    const review = buildLiveRequest(
      generatorReviewRequest(generatorRequestId('t01', model), candidate),
      'generator',
    );
    expect(review.model).toBe('claude-haiku-5-5');
    expect(JSON.stringify(review.body)).not.toContain(model);
    expect(JSON.stringify(review.body)).not.toContain('parentRequestId');
  }
  const provider = createLiveReviewProvider(
    { ANTHROPIC_API_KEY: 'x' },
    async () =>
      new Response(
        JSON.stringify({
          model: 'claude-sonnet-5-5',
          stop_reason: 'end_turn',
          usage: { input_tokens: 100, output_tokens: 200 },
          content: [{ type: 'text', text: '{"bad":true}' }],
        }),
      ),
    () => {},
    'generator',
  );
  // Known malformed generated content still has a charge and cannot become a candidate.
  const receipt = await provider.generate({
    specification: generatorRequest('t01', 'claude-sonnet-5-5'),
    feature: 'generation',
    idempotencyKey: 'one',
    signal: new AbortController().signal,
  });
  expect(JSON.parse(receipt.draft).candidate).toBeNull();
  expect(receipt.costMicroEur).toBeGreaterThan(0);
});

it('retains valid generated content and bounds invalid diagnostics inside the durable receipt limit', async () => {
  const { generatorRequest } =
    await import('../../modules/content/review-benchmark/generator');
  const fields = {
    prompt: 'Kies het tegengestelde van vol.',
    passage: '',
    options: ['leeg', 'rond', 'zwaar', 'groot'],
    rubric: 'Kies één antwoord.',
    answer: 'leeg',
    explanation: 'Vol en leeg zijn tegengestelden.',
  };
  let output = JSON.stringify(fields);
  const provider = createLiveReviewProvider(
    { OPENAI_API_KEY: 'x' },
    async () =>
      new Response(
        JSON.stringify({
          model: 'gpt-6-luna',
          status: 'completed',
          usage: { input_tokens: 100, output_tokens: 200 },
          output: [{ content: [{ type: 'output_text', text: output }] }],
        }),
      ),
    () => {},
    'generator',
  );
  const input = {
    specification: generatorRequest('t02', 'gpt-6-luna'),
    feature: 'generation',
    idempotencyKey: 'one',
    signal: new AbortController().signal,
  };
  const valid = await provider.generate(input);
  expect(JSON.parse(valid.draft).candidate.answer).toBe('leeg');
  output = '\u0000'.repeat(6000);
  const invalid = await provider.generate(input);
  expect(JSON.parse(invalid.draft).candidate).toBeNull();
  expect(invalid.draft.length).toBeLessThan(8000);
  expect(JSON.stringify(invalid.draft).length).toBeLessThan(15000);
});
