# D13 live technical smoke — 22 October 2026

**Historical initial partial run; recovered subsequently.** All seven models now have two successful responses, with €0.056702 total conservative usage charges and no unresolved cost holds. See [the recovery evidence and final results](d13-gemini-recovery.md). D13 remains open for quality evaluation.

**Initial evidence:** Mistral was removed at Ammar’s request. He authorized efficient live testing using the three supplied provider keys. Seven model-information GETs returned HTTP 200. The fixed inference manifest permits two c01 stages per model, one attempt each, without retries.

Run manifest SHA-256: `08f7048d03e140b835bc52b933648eb71dc6409d63520777c4991485f5b1ec3e`. Report timestamp: `2026-10-22T18:23:30.339Z`. Original development fixture hash remains `d1a6482afa85f1f1d256c86ef06bc49ffcd018d897afbf80092eb0db22b789f7`.

| Model             | Solve              | Semantic       | Conservative settled usage | Uncertain reservation |
| ----------------- | ------------------ | -------------- | -------------------------: | --------------------: |
| gpt-6.1-sol       | valid response     | valid response |                  €0.009908 |             €0.000000 |
| gpt-6-luna        | valid response     | valid response |                  €0.000564 |             €0.000000 |
| claude-haiku-5-5  | valid response     | valid response |                  €0.002089 |             €0.000000 |
| gemini-3.8-flash  | unresolved failure | not dispatched |                  €0.000000 |             €2.382336 |
| claude-sonnet-5-5 | not dispatched     | not dispatched |                  €0.000000 |             €0.000000 |
| claude-opus-5-5   | not dispatched     | not dispatched |                  €0.000000 |             €0.000000 |
| gemini-4-argon    | not dispatched     | not dispatched |                  €0.000000 |             €0.000000 |

Six calls returned valid usage receipts and structured reviews: all three solve responses answered `7`; their semantic responses were clear. Combined conservative settled usage is **€0.012561**. The seventh dispatch, Gemini Flash solve, ended without a usable receipt in approximately 0.8 seconds. No HTTP failure code was logged and no response was retained, so the exact transport/response-validation cause cannot be established retrospectively. It was not the 60-second timeout. Do not claim zero billing or a model-quality failure.

**Total ledger commitment: €2.394897**, comprising €0.012561 settled usage ceilings and **€2.382336 uncertain reservation**. This is not a €2.39 vendor bill. Provider invoice reconciliation remains pending. No reservations were released based on guesswork. Seven planned calls remain undispatched.

Dispatch stopped on uncertain usage. The queue now also prevents any later live claim while an uncertain live attempt exists, including after restarting the command; fake-policy behavior remains unchanged. A regression covers this with two inexpensive reservations that would otherwise fit. Future adapter failures emit only fixed safe diagnostic codes, never raw errors/keys. No further paid request was made to diagnose the failure.

The first attempted launch before this run failed before enqueue/spend because dotted model names were invalid request IDs. Normalized IDs plus the all-seven-model regression fixed it. No ledger or failed run was reset.

## What this establishes

Connectivity and structured-response/accounting work for Sol, Luna and Haiku on one trivial arithmetic item. It does not compare educational quality, defect detection, longer text, generation, latency distributions or cost per useful exercise. Sonnet, Opus and Argon have metadata-access evidence only. Ammar’s 12 reference decisions remain pending; no educational approval or production model is selected.

## Resume and test

`npm run content:smoke-live -- report` reads the persistent local ledger without provider calls. The safe detailed JSON is `.artifacts/d13/smoke-report.json` (Git-ignored). Keep the local database volume and private configuration. `execute` cannot bypass unresolved usage by restarting.

Next: obtain Gemini billing/usage evidence for the request around **22 October 2026, 18:23:29–18:23:30 UTC (20:23:29–20:23:30 Amsterdam)**, reconcile the retained reservation through an audited adjustment that preserves history, then diagnose with a separately versioned bounded request if needed. No reconciliation mutation or retry workflow is implemented in this slice. Review the [reference package](../../tasks/d13-reference-review.md) to enable the later quality benchmark. See the [setup and budget contract](d13-benchmark-setup.md).
