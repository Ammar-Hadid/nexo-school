# D13 Gemini recovery — 22 October 2026

The user supplied a Google AI Studio screenshot after the partial smoke run. The selected project is `nexo-school`, labelled **Free tier**; the Gemini 3.8 Flash request at approximately 10:23 UTC−8 matches the ledger's 18:23 UTC dispatch. The dashboard shows **503 ServiceUnavailable**, input usage and no output-token data. This supplies provider-side evidence absent from the original console diagnostic. It supports a temporary service failure; it does not establish that lack of billing caused it.

The screenshot is retained privately at `.artifacts/d13/gemini-20261022-dashboard.png`, mode 0600, Git-ignored. SHA-256: `1be39c3eaa8c74c86351d8c7f54122ffc90f218f71f272c742dc11a747b8fc92`. The account identity shown in the image is not copied into source or logs. The initial run and original report remain described in [the historical results](d13-live-smoke-results.md).

The user subsequently stated that he linked the project to billing and explicitly requested retesting. This does not retroactively change the screenshot's historical free-tier evidence. All new requests retain the existing paid-rate reservations; no future-free assumption is used.

## Evidence and decision

Google documents 503 as a retryable transient error and recommends bounded backoff ([troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting)). Its [billing guide](https://ai.google.dev/gemini-api/docs/billing) distinguishes free and paid tiers, says keys inherit project billing, and explains that failed 400/500 requests are not token-billed but still consume quota. We use the user-provided **historical free-tier evidence** to reconcile this specific failed attempt to zero, rather than extrapolating a zero bill from absent output tokens or every possible failure.

No exact original input/output receipt is reconstructed. Unknown token counts remain unknown. The failed attempt and job are retained. New `GenerationCostReconciliation` records are append-only, one per attempt, with evidence hash, operator note, reconciled cost and timestamp. A transaction/trigger validates the uncertain live attempt and applies only the difference to its original month's shared budget, under the same advisory lock. Replays return the same record; conflicts, over-bound costs, non-uncertain targets, mutation/deletion and failed atomic adjustments are rejected. The queue calculates net commitments and stops on any still-unreconciled uncertain attempt.

The internal €2.382336 hold can therefore be released with an auditable record; it was never a provider charge. The existing six successful calls remain in the ledger. No failed job is reset and no cap is raised.

## Bounded recovery commands

```sh
npm run content:smoke-live -- setup
npm run content:smoke-live -- reconcile
npm run content:smoke-live -- retry-gemini
npm run content:smoke-live -- report
```

`setup` applies the additive migration only to the dedicated loopback D13 database. `reconcile` validates the exact prior request, its dispatch time and screenshot hash; it has no provider call. `retry-gemini` requires that reconciliation and adds only the fixed `-recovery-1` request ID for Gemini Flash solve, then processes existing pending jobs. It preserves the six successful responses. Maximum total dispatches are 15: original 14-stage manifest plus one explicit recovery. Re-running the command cannot add another retry or duplicate completed calls. The unchanged run/month limits are €8/€10. Another uncertain receipt stops dispatch.

An adapter regression reproduced loss of the HTTP status when cancellation of an error response body throws. Cancellation errors can no longer mask the HTTP status; only fixed status codes are logged. This is a proven diagnostic weakness, not a claim that it caused the original missing console code.

## Verification and remaining scope

Node 24.22.0: 165 unit/tooling tests in 39 files passed; standalone build and 74 built PostgreSQL/integration tests in eight files passed, with ten-migration install/replay. The two reconciliation tests cover concurrent exact replay, conflict, immutable history, budget rollback, validation and resumption within the same monthly cap. Existing unit tests cover HTTP failure, missing usage, thinking tokens and strict responses. Full visual/device/Storybook suites were not rerun for this server-only recovery. No learner UI, scoring/assessment, human labels, publication authority, real learner data, VPS or public deployment changed.

Strict typecheck and root lint also passed. The additive migration was applied to the existing populated local smoke database, preserving its seven prior attempts. Scoped formatting, local documentation targets and whitespace were checked. No VPS migration or new external service was used.

## Executed recovery results

The explicit recovery made **eight additional calls**: the seven pending stages plus one Gemini Flash solve retry. All succeeded with valid usage receipts, matching content hashes and valid structured reviews. Combined with the previous six successes, **all seven models passed both c01 stages**: 14 successful responses and one historical failed attempt, 15 total attempts. Every solver returned `7`; every semantic review returned clear. No repeated successful call was needed.

| Model | Solve / semantic | Conservative usage charge |
| ----- | ---------------- | ------------------------: |

| gpt-6.1-sol | Both valid | €0.009908 |
| gpt-6-luna | Both valid | €0.000564 |
| claude-haiku-5-5 | Both valid | €0.002089 |
| gemini-3.8-flash | Both valid | €0.004019 |
| claude-sonnet-5-5 | Both valid | €0.008358 |
| claude-opus-5-5 | Both valid | €0.016692 |
| gemini-4-argon | Both valid | €0.015072 |

**Total shared October commitment: €0.056702 (about 5.7 cents)**. The prior €2.382336 reservation was reconciled to zero using the historical free-tier evidence. There are **zero unreconciled cost attempts**; the old attempt's token counts remain unknown rather than fabricated. These are conservative paid-rate/FX usage ceilings for successful calls, not exact vendor invoices. The €10 cap remains unchanged, with €9.943298 internal allowance remaining given the user's prior €0-other-spend statement.

Replaying both reconciliation and `retry-gemini` returned the existing reconciliation and `idle`: still 15 attempts, 14 valid responses, one reconciliation and €0.056702 committed. No additional provider call or duplicate refund occurred. The full private report remains `.artifacts/d13/smoke-report.json`. The recovery manifest hash is `17ad9525be29a7681b8aed01b4a7ed8b0f0a6e5650c5a2baf5200da381afcd2f`.

D13's connection/response/accounting smoke is now complete. D13 as a whole remains open: adjudicated defects, larger family/passage-separated screening, an unused holdout and task-creation comparisons are still pending. One trivial arithmetic item cannot rank model quality. Next: Ammar reviews the [12 reference candidates](../../tasks/d13-reference-review.md), then prepare the expanded bounded comparison using the remaining budget.
