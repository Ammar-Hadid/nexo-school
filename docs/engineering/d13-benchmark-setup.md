# D13 — benchmark setup and live technical smoke

**22 October expanded-run amendment:** the user authorized the seven-model provisional 40-item screen. See [expanded benchmark](d13-expanded-benchmark.md) for its separate version, 560-call limit and commands. Human approval remains pending; the historical smoke instructions below remain scoped to the original connectivity run.

22 October 2026. Ammar supplied OpenAI, Anthropic and Gemini keys, explicitly removed Mistral and authorized efficient testing. The comparison now contains seven models. He previously confirmed €0 other nexo AI spending in October and named himself reference reviewer. The €10 monthly ceiling remains unchanged. This authorization covers the bounded technical smoke below; human reference decisions remain pending and no quality winner is selected. **Current result: all seven models passed both technical checks after one explicitly requested Gemini recovery; total conservative usage charges €0.056702, no unresolved cost holds.** See [recovery and final results](d13-gemini-recovery.md).

## Commands and private configuration

Use Node 24.22.0 from the repository root. `.env.d13.local` contains `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` and `GEMINI_API_KEY`. It is Git-ignored, mode 0600 and separate from Next's normal environment loading. The reader rejects symlinks, nonregular/oversized/world-readable files, duplicates and unexpected variables; an obsolete Mistral line is ignored. Keys are never printed.

```sh
npm run content:prepare-benchmark
npm run content:check-model-access
npm run content:smoke-live -- report
```

Preparation is offline and reports presence only. Model access performs seven read-only model-information requests, without inference tokens. Report reads the durable ledger and writes `.artifacts/d13/smoke-report.json`; it makes no provider requests. All seven model IDs returned HTTP 200 during the access check on 22 October.

On the existing checkout the dedicated local database has been prepared. For a new authorized local setup:

```sh
npm run content:smoke-live -- setup
npm run content:smoke-live -- execute
```

**Execute makes paid calls.** The fixed manifest allows only original synthetic c01 (`3 + 4 =`), separately concealed-key solve and full-content semantic stages, across seven models: initially at most 14 calls, one attempt per job. The user subsequently explicitly requested a Gemini retry after linking billing; the fixed recovery adds exactly one job, for 15 total historical dispatches. Re-running uses the same immutable IDs, without repeating completed jobs. Uncertain usage stops dispatch; failed jobs are not automatically retried. The [recovery commands](d13-gemini-recovery.md#bounded-recovery-commands) preserve the failed job and audit its evidenced cost adjustment before one new retry. The price manifest expires on 1 November 2026. This is connectivity, structured-response and accounting evidence, not a meaningful model-quality comparison.

The wrapper owns only Docker container/volume `nexo-school-d13-benchmark`, PostgreSQL 17 on a random loopback port, and private `.artifacts/d13/database.json`. The volume retains D12's shared `GenerationBudget`, jobs and receipts across process/container restarts. Do not delete the volume/config or start a new database to reset the monthly allowance. Before moving live execution to another database, transfer/reconcile the same month's commitments. No VPS services or unrelated local containers are changed.

## Budget enforcement

The smoke has an **€8 commitment/reservation ceiling inside the €10 shared monthly cap**. An initially proposed €1 ceiling was corrected before paid dispatch because a conservative full-context reservation for Sol alone requires €7.93644. This is a temporary risk reservation, not expected spend. Only valid usage receipts release unused funds. Unknown outcomes retain the full reservation and stop the run.

Adapters bound total output including thinking at 2,048 tokens, use low thinking effort, one candidate, no tools/continuations and no automatic retries. Full supported input context is reserved; no guessed characters-to-tokens estimate is trusted. The frozen rates include OpenAI long-context/cache-write premiums and Google's announced post-promotion rates. Anthropic cache creation is not requested and unexpected writes fail closed. A conservative €1.50/USD allowance covers exchange/tax headroom; the ECB's 22 October reference was USD 1.1205/EUR ([reference source](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html)). Ledger charges are **conservative usage ceilings, not exact provider invoices**. Invoice reconciliation remains pending.

The existing offline 40-item/two-stage estimate is now seven models/560 calls and €5.913 at assumed 2,000 input/500 output tokens. It is illustrative, excludes generation/holdout/retries and is not permission or a guarantee that a full benchmark fits the budget. See [API accounting research](../research/2026-10-22-d13-api-contracts.md).

## Human review and full benchmark gate

Read the [12-item reference package](../../tasks/d13-reference-review.md), including clean cases, full context and deliberately incorrect keys. Record actual judgments by item ID in chat or [the decisions file](../../tasks/d13-review-decisions.json): `accept-proposal`, `change-required` or `pending`, corrections in `note`, actual date in `reviewedAt`. Do not change hashes or overwrite decisions with a fresh template. Corrections require a new fixture/review version.

Ammar's adjudication records benchmark judgments; it does not certify the curriculum or permit automatic publication. The broader quality benchmark still needs adjudicated references, family/passage separation, an unused holdout and a frozen expanded request manifest fitting the remaining reconciled budget. Content-creation experiments are not implemented by this review-only smoke. D13 remains open; D14's dependency is not satisfied by a successful connection test.

## Verification

The live slice passed 164 unit/tooling tests in 39 files, the standalone production build and 71 PostgreSQL/integration tests in eight files, including nine-migration fresh install/replay. Twelve learning-path Storybook interaction/accessibility checks and ten built browser regressions passed. The first launch failed before enqueue/dispatch because dotted model IDs violated request-ID syntax; a red regression check was added, IDs normalized and the focused tests passed before retrying the launch.

After the uncertain-usage stop was added, the final 164 unit tests, strict typecheck, root lint and 71 non-built PostgreSQL/integration tests passed. The built 71-test run preceded that final queue guard; no second full build was run for the guard. A real command replay returned `idle`, retaining exactly seven attempts and €2.394897 commitment with no additional provider call. Offline preparation, scoped formatting, local document targets, Git exclusion and whitespace checks passed.

The [initial smoke report](d13-live-smoke-results.md) preserves the first failure; [the completed recovery](d13-gemini-recovery.md) owns final outcomes and later verification (165 unit tests, 74 built integration tests, typecheck/lint and idempotent real replay). No learner-facing UI, assessment threshold, content approval, Nexai wording, VPS migration, real learner data or public deployment changed. Full Storybook/E2E/visual/device/Safari/manual screen-reader suites, remote CI, populated prior-version migration and provider invoice reconciliation were not performed. Browser tests used the existing static Storybook build. Existing pg/color-environment warnings remain.

## Authorized small generator follow-up

The user authorized the four-model, 32-exercise generator comparison with Haiku review. [Its contract](d13-generator-benchmark.md) owns the 64-call limit, unchanged shared ledger, experiment bounds and pending human-review status. `npm run content:smoke-live -- generator-report` reads saved results without provider calls; `generator-run` executes/resumes only that fixed manifest. The earlier reviewer benchmark/holdout remains unchanged.
