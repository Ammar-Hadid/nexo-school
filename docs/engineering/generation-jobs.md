# D12 — Durable generation and shared spend ledger

22 October 2026. Local synthetic implementation **Implemented/Tested, Approved by the user on 22 October 2026**. D11's delivered technical slice is user-approved; independent educational certification remains pending. D12 depends on D10 and introduces no educational approval, live provider, deployment or remote migration.

## Ownership and execution

`src/modules/content/generation-policy.ts` owns the bounded request/policy contract. `src/server/content/generation-jobs.ts` owns enqueue, lease, settlement and burst execution; `fake-generation-provider.ts` implements the sole application-owned provider port. The additive migration stores `GenerationJob`, `GenerationAttempt` and `GenerationBudget`. No new dependency, service or public route is introduced. This implements the existing ADR-008 PostgreSQL approach.

These are trusted server operator/worker entry points, not browser commands. Caller authentication must be added through the existing operator boundary before any future UI/route is exposed. A request contains only an idempotency key, feature (`generation`, `review`, `feedback`) and bounded synthetic specification. Extra fields, invalid keys/features and empty/oversized specifications fail. This structural check is not a personal-data classifier: the caller must supply synthetic material. No real learner data or network call is used here.

`enqueueGeneration(db, request)` binds a globally unique request ID to the exact request, policy and provider hash. Concurrent identical calls return the same durable job; changed payload reuse fails. Successful/failed jobs cannot be reset through enqueue. Outputs remain hashed `unreviewed-synthetic` drafts in the job table; they do not create D10 content/review/publication records or D05 assignments. The fake adapter produces an explicitly synthetic placeholder draft, not usable educational stock. D13/D14 own later benchmarking and review integration.

`runGenerationBurst(db, capMicroEur, provider, limit)` executes at most three jobs and exits on idle. There is no background loop or installed scheduler. The caller supplies the cap from trusted server configuration, never a job request. Only `fake-v1` is enabled. A future live adapter requires an explicit new policy, bounded provider request/pricing contract and separately authorized spend/privacy setup; selecting a model/provider is not performed here.

## Leases, retries and failure

Short PostgreSQL transactions take one shared advisory lock across enqueue/claim/settlement and all three features. At most one unexpired reserved attempt exists through these use cases. A provider call begins only after its lease and cost reservation commit and runs outside transactions. The database clock owns lease and UTC month boundaries.

Each attempt has a fresh durable ID, sequence and 30-second lease. The attempt ID is the provider idempotency key. A five-second application timeout aborts and returns even if the adapter ignores cancellation. Errors, malformed receipts and timeouts retain the full reservation and requeue after one second times the attempt number. Raw provider errors are neither stored nor logged. Three attempts is the maximum. The existing attempt state records settled versus uncertain cost; it does not diagnose provider failure reasons.

An abandoned lease is recovered on the next claim. Its reservation becomes an uncertain charge, including a crash before a request was sent, and the job can retry up to the same limit. This intentionally favors the budget ceiling over utilization. An old/expired/already-settled attempt cannot save output, refund money or overwrite its replacement. Settlement, result storage and refund commit together. A failed transaction leaves a recoverable reservation. Exact provider execution is not claimed: timeout/restart can produce multiple remote executions, so every new attempt gets its own reservation. Non-cooperative remote calls may continue after timeout; their maximum remains counted.

## Cost contract

All amounts use integer **micro-euros** (1 euro = 1,000,000 units). The configured shared monthly cap accepts 0 through 10,000,000 (€10), covering generation, automated review and feedback together. The first reservation initializes that UTC month's cap; a different cap supplied during that month fails closed rather than silently increasing or lowering it. Zero disables dispatch. Budget-blocked jobs stay queued; a later invocation/month can reconsider them.

The synthetic policy reserves **1,000 micro-euros (€0.001)** per attempt. The fake provider reports **400 micro-euros (€0.0004)** and fictional input/output token counts. These are test units, not actual vendor prices or money spent. The committed balance includes both outstanding reservations and settled/uncertain charges. Only a valid nonnegative integer receipt within the reservation can refund the unused difference. Invalid/over-bound costs receive no refund and no successful output. All features share one period row and lock, preventing concurrent oversubscription.

Month rollover does not move or forgive previous charges. A retry reserves in the current UTC month, while the old uncertain attempt stays in its original month. Settlement refunds its own reservation's period even if the clock has advanced. Production pricing, FX/tax buffers, provider-side maximum enforcement and reconciliation of uncertain costs require the later live-adapter policy; this fake-only implementation cannot guarantee the size of a real vendor invoice.

Database constraints enforce cap/amount ranges, supported feature/policy/provider, bounded sequences, receipt completeness and result hashes. Triggers preserve request/lease identity, terminal jobs, closed attempts and monthly cap configuration; deletions are rejected. Application transactions maintain aggregate balance conservation. Database administrators can still alter tables/triggers; these are not defenses against a compromised database owner.

## Testing

Use Node **24.22.0** and a running local Docker daemon:

```sh
npm test -- src/modules/content/generation-policy.test.ts
npm run test:identity
npm run test:saved
```

The focused command runs two request/cap-policy tests. The database commands create and remove a disposable PostgreSQL container, ignoring caller database URLs; they apply all eight migrations and replay them. `test:saved` additionally builds the app and exercises the existing authenticated saved student/guardian journey. None calls a paid provider or migrates the VPS. There is no new screen to test.

`tests/identity/generation-jobs.test.ts` has 13 scenarios covering concurrent enqueue/lease, conflicting IDs, terminal replay, shared feature caps, zero/invalid/changed caps, database disconnect/reconnect and fresh-worker-process abandoned-lease recovery, stale completion, three-attempt/backoff limits, a real five-second timeout and late response, malformed/over-bound receipts, reservation/settlement rollback, UTC-period separation and database guards. Time travel temporarily disables the lease trigger only in isolated test fixtures; production code cannot rewrite lease identity. One restart case reconnects the Prisma database client; another exits a real Node worker process after committing its lease and launches a fresh process to recover and finish the job after simulated expiry. This is not a VPS/database-server restart rehearsal.

Final Node 24.22.0 verification: 145 unit tests/32 files, 65 built PostgreSQL/integration tests/6 files, eight-migration install/replay, 12 learning-path story checks and 10 built browser regressions passed, along with lint, typecheck, schema validation, standalone build, formatting and local links.

Exact executed totals, initial corrections and omitted checks are recorded in the [task ledger](../../tasks/todo.md#current-position-and-handoff). The shared assessment evaluator/thresholds and all learner-facing screens, retries and Nexai wording are unchanged. D13 is the next dependency-ready task; its real-provider benchmark remains a separate capped authorization.
