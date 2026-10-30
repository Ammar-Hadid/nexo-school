# D13 live-provider API contract investigation

22 October 2026. Primary-source preparation only; no inference requests, token-count requests, credentials inspection or spending. Read current roadmap/ledger, D13 handoff, development protocol and fake provider/policy. The user has accounts with all four providers, reports €0 other nexo AI expenses this month, and will adjudicate references as Ammar. This is human benchmark review, not independent educator certification. The eight-model field is agreed; exact live spending remains separately gated.

## Findings that change the implementation

- OpenAI's newer models charge cache writes at **1.25 times ordinary input** by default. The original ordinary-input estimates are not worst-case bounds. Cache-write usage must survive receipt parsing.
- All selected OpenAI/Anthropic models and Gemini Argon document combined output/thinking ceilings. A tiny cap can produce no final JSON despite incurring cost. Treat truncation as unresolved; do not automatically retry with a higher cap.
- Token-count endpoints are useful but not uniformly documented as exact billing bounds. Anthropic calls its count an estimate. Google's own basic example counts 10 prompt tokens before generation and reports 11 afterwards. Adding an arbitrary percentage is an engineering allowance, not a contractual proof.
- No hosted Mistral pre-count API was verified in the current API catalogue. Its full 256K context ceiling provides a conservative input reservation fallback for this inexpensive model. For the other providers a full-context reservation is also possible, but ties up several euros temporarily for expensive models.
- Keep text-only, one turn, one candidate, no external tools, no cached conversation/previous-response IDs, no background jobs, no automatic continuation and no SDK retries. This is a proposed benchmark configuration, not a statement that these controls already exist.

## OpenAI: GPT-6 Luna and GPT-6.1 Sol

Use `POST https://api.openai.com/v1/responses` with bearer authorization. Proposed body shape (variables denote frozen application values):

```js
{
  model,
  instructions: frozenInstructions,
  input: frozenCandidate,
  max_output_tokens: approvedOutputCap,
  reasoning: { effort: 'low' },
  text: { format: { type: 'json_schema', name: 'd13_review', strict: true, schema } },
  service_tier: 'default',
  store: false,
  stream: false,
  prompt_cache_options: { mode: 'implicit', ttl: '30m' }
}
```

`gpt-6-luna` supports `none` through `max`; `gpt-6.1-sol` rejects `none`/`minimal`, so `low` is a supported initial setting for both. Each has a 1,050,000-token context and 128,000 maximum output. Standard USD/MTok rates: Luna ordinary input 0.10, cache read 0.01, cache write 0.125, output 0.50; Sol 2, 0.10, 2.50, 10 respectively. Above 272K input, long-context multipliers apply; regional processing adds 10%. These are direct-model rates, not Flex/Batch/Fast rates. [Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol).

The pre-count endpoint is `POST /v1/responses/input_tokens`; send the same model, input and relevant configuration, including the schema. Documentation explicitly describes its count as exact and including request-formatting tokens. `max_output_tokens` bounds visible, reasoning and non-visible generated tokens. [Token counting](https://developers.openai.com/api/docs/guides/token-counting).

Parse final text from `output` message items containing `output_text`, not the first array element and not an assumed raw-HTTP `output_text` convenience property. Require completed status and handle refusals/incomplete results separately. Persist response ID/model and raw usage. [Responses reference](https://developers.openai.com/api/reference/resources/responses/methods/create), [structured output](https://developers.openai.com/api/docs/guides/structured-outputs).

Usage: `input_tokens` includes ordinary, read and write tokens; subtract `input_tokens_details.cached_tokens` and `cache_write_tokens` to obtain ordinary input. Output usage already includes reasoning—do not add `output_tokens_details.reasoning_tokens` again. Pin 30-minute caching; 12-hour writes cost 2.5× input. For reservations charge every input token at the allowed maximum write rate; later settle using valid complete usage. Cache writes are an alternative input category, not an additive charge. [Caching and receipt formula](https://developers.openai.com/api/docs/guides/prompt-caching).

## Anthropic: Haiku, Sonnet and Opus 5.5

Use `POST https://api.anthropic.com/v1/messages`, `x-api-key`, `anthropic-version: 2023-06-01`, JSON content type. Proposed body:

```js
{
  model,
  system: frozenInstructions,
  messages: [{ role: 'user', content: frozenCandidate }],
  max_tokens: approvedOutputCap,
  thinking: { type: 'adaptive' },
  output_config: { effort: 'low', format: { type: 'json_schema', schema } },
  stream: false
}
```

Use exact agreed IDs `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`. Opus always thinks; attempting to disable thinking fails. Haiku supports disabling at lower efforts, but that would be a different benchmark configuration. `max_tokens` is the combined thinking/text cap. Explicit effort avoids differing vendor defaults. Select text blocks by `type`, not position. [Opus migration](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide), [Haiku behavior](https://platform.claude.com/docs/en/models/haiku-5-5/whats-new-haiku-5-5), [effort](https://platform.claude.com/docs/en/build-with-claude/effort).

JSON schema belongs in `output_config.format`, not deprecated `output_format`. The schema subset excludes numerical bounds and string-length limits; retain those in application validation. Objects require `additionalProperties:false`. Model refusal or token exhaustion still needs explicit handling. [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

`POST /v1/messages/count_tokens` returns `input_tokens` for the same structured inputs, including system content. The guide calls the result an estimate and supplies no maximum deviation bound. Do not silently promote it to an exact invoice guarantee. [Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting).

USD/MTok ordinary input/output: Haiku 0.10/0.50 at up to 100K prompt tokens, 0.50/2.50 above; Sonnet 2/10; Opus 4/20. Five-minute cache writes cost 1.25× input and one-hour writes 2×. Omit cache-control in this initial single-turn proposal; if caching is later enabled, adjust reservations. [Pricing](https://platform.claude.com/docs/en/about-claude/pricing).

Anthropic's `usage.input_tokens` is only ordinary input. Total input is ordinary + `cache_creation_input_tokens` + `cache_read_input_tokens`. Preserve optional `cache_creation.ephemeral_5m_input_tokens` and `ephemeral_1h_input_tokens` if present. Output includes thinking. Nonzero unexpected cache use is an accounting event, not a reason to ignore tokens. [Cache accounting](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

## Google: Gemini 3.8 Flash and Gemini 4 Argon

Use `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`, with `x-goog-api-key` header rather than a logged URL query parameter. Proposed body:

```js
{
  systemInstruction: { parts: [{ text: frozenInstructions }] },
  contents: [{ role: 'user', parts: [{ text: frozenCandidate }] }],
  generationConfig: {
    maxOutputTokens: approvedOutputCap,
    thinkingConfig: { thinkingLevel: 'low' },
    responseMimeType: 'application/json',
    responseJsonSchema: schema
  }
}
```

`maxOutputTokens` includes thoughts and answer. Argon supports low/medium/high and a unified 1,048,576-token context. Its non-streaming REST single-hop ceiling is 32,768; continuation is unnecessary here and must not be followed. Current SDKs can continue automatically when a larger limit is requested, so raw bounded REST is simpler. Google recommends larger caps for Argon quality; a deliberately smaller cap measures usefulness under our cost restriction, not unrestricted capability. [Argon guide](https://ai.google.dev/gemini-api/docs/generate-content/latest-model), [long decode](https://ai.google.dev/gemini-api/docs/generate-content/long-decode), [Flash cap clarification](https://discuss.ai.google.dev/t/gemini-3-8-flash-high-does-maxoutputtokens-include-thinking-tokens/181077).

Use `:countTokens` with the full `generateContentRequest` form; result `totalTokens` is pre-count input. The official example demonstrates pre-count/generation framing differences, so it does not establish a zero-error invoice bound. [Count API](https://ai.google.dev/api/tokens).

Read `candidates[].content.parts` text, excluding thought parts. Persist `modelVersion`, `responseId`, `finishReason`, prompt blocking and `usageMetadata`. Output cost uses `candidatesTokenCount + thoughtsTokenCount`; input uses `promptTokenCount` (already includes cached input), with any cache discount separated. Require exactly one usable candidate. Do not treat `MAX_TOKENS`, `CONTINUATION`, blocked or missing candidates as valid review. Sampling parameters are ignored on these newer models; omit them. [Generate API](https://ai.google.dev/api/generate-content), [structured output](https://ai.google.dev/gemini-api/docs/structured-output).

USD/MTok paid standard rates: Flash 0.75/3.75 through 31 December 2026, then 1.50/7.50; Argon 2/10 through 30 November, then 4/20. Output includes thinking. Revalidate immediately before authorized execution; expire the price manifest rather than silently use a promotion after its end. [Google prices](https://ai.google.dev/gemini-api/docs/pricing).

## Mistral Small 4

Use `POST https://api.mistral.ai/v1/chat/completions`, bearer authorization. Proposed body:

```js
{
  model: 'mistral-small-2603',
  messages: [
    { role: 'system', content: frozenInstructions },
    { role: 'user', content: frozenCandidate }
  ],
  max_tokens: approvedOutputCap,
  n: 1,
  stream: false,
  service_tier: 'standard',
  response_format: {
    type: 'json_schema',
    json_schema: { name: 'd13_review', strict: true, schema }
  }
}
```

The model card confirms 256K context, USD/MTok 0.15 input / 0.60 output and structured-output support. [Model card](https://docs.mistral.ai/models/mistral-small-4-0-26-03). `max_tokens` limits generated completion, and input plus maximum output cannot exceed context. Do not enable `prompt_mode:'reasoning'` or assert all generic `reasoning_effort` values work on this particular model without compatibility evidence. Pin and report the normal instruct configuration initially. [Chat API](https://docs.mistral.ai/api/endpoint/chat), [request source](https://raw.githubusercontent.com/mistralai/client-ts/main/src/models/components/chatcompletionrequest.ts).

The raw schema wrapper above is confirmed by Mistral's [response-format source](https://raw.githubusercontent.com/mistralai/client-ts/main/src/models/components/responseformat.ts) and [JSON schema source](https://raw.githubusercontent.com/mistralai/client-ts/main/src/models/components/jsonschema.ts). Content may be a string or typed chunks; select text and require `finish_reason:'stop'`. Preserve `usage.prompt_tokens`, `completion_tokens`, `total_tokens`, and actual service tier. The SDK defaults absent usage values to zero; our accounting must instead treat missing usage as unknown and retain the reservation. [Usage source](https://raw.githubusercontent.com/mistralai/client-ts/main/src/models/components/usageinfo.ts), [content forms](https://docs.mistral.ai/studio/conversations/chat-completion).

## Budget-bound design implications

These are recommendations, not implemented controls:

1. Freeze request bytes and their hash before pre-count/reservation. Exclude tools, image/file URLs, state references and continuations. Reject changed bytes between preflight and dispatch.
2. Reserve before network dispatch, reconcile only from valid receipts, and retain the entire reservation after timeout, lost response or uncertain cost. Abort is not proof of provider cancellation. Each retry requires a new reservation; prefer no automatic retries during smoke testing.
3. For a strict bound, use verified exact pre-count where documented (OpenAI). Otherwise use the provider's full allowed input/context ceiling at the worst relevant price tier, or obtain a provider-backed tighter ceiling. A request-character cap, guessed token ratio or count-plus-margin is not equivalent to a proven billable-token cap.
4. Full-context fallback is deliberately pessimistic. At roughly 1M tokens it reserves about $4 input for Opus and $2 for Sonnet before output, tax/FX; Haiku must use its higher long-context rate. Mistral's entire 256K input is about $0.04. Serial execution and settlement releases unused reservation, but a late expensive call may be blocked even when its expected cost is tiny. Do not misrepresent that as guaranteed completion within €10.
5. Reconcile worst-case input/output dollar amounts using a documented conservative EUR-per-USD bound, applicable tax and payment fees, rounded upward in integer micro-euros. A currency buffer without account billing facts is an assumption, not an absolute invoice guarantee. Never auto-fund accounts; minimum credit purchases differ from usage charges.
6. An eight-model 40-item screen at an assumed 500 output tokens per call remains an estimate. Allowing 2,048 or 4,096 output/thinking tokens materially increases maximum reservations. Start with a separately capped smoke run, then freeze affordable screen size/caps based on observed completion behavior. Never raise limits behind the user's approval.

## Data settings to verify in the user's accounts

Only synthetic benchmark content is needed. OpenAI API training is opt-in; `store:false` avoids normal response application-state storage but does not itself remove abuse-monitoring retention. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

The selected Claude models are not on the current mandatory-retention Covered Models list, unlike Fable/Mythos. Verify the actual workspace retention agreement; do not infer ZDR just from API use. [Covered Models](https://support.claude.com/en/articles/15425695-covered-models), [API retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).

Google's paid service applies to API calls through a project with active billing; paid prompts/responses are not used to improve products. Confirm the intended billed project rather than assuming a free API key has equivalent conditions. [Gemini terms](https://ai.google.dev/gemini-api/terms).

Mistral's current privacy policy describes rolling 30-day abuse-monitoring retention unless ZDR is enabled. Training opt-out and ZDR are different account controls; verify both rather than repeat an older blanket no-training assertion. [Privacy policy](https://legal.mistral.ai/terms/privacy-policy/), [ZDR controls](https://help.mistral.ai/en/articles/347612-can-i-activate-zero-data-retention-zdr).

## Verification and handoff

Documentation research only. Current provider references and first-party SDK types were inspected; no account access, model availability test or invoice verification occurred. The initial fake policy still has fictional €0.001 reservations, 5-second timeout and three attempts. Its numbers cannot safely be reused. Exact input bound, price/FX manifest, credential setup, adjudicated references, off-network adapter/accounting tests and final capped-run authorization remain required before inference. The main agent owns ledger updates and implementation; this file does not advance D13 status.
