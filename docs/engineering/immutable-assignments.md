# Immutable arithmetic assignments — D05

20 October 2026. **Implemented, tested and accepted for synthetic testing.** On 20 October the user asked to proceed to D06 after the synthetic-only acceptance boundary was explained. Production template, pedagogical bounds and skill certification remain D10/D11. This is a synthetic software certificate, not a production template certification. D04's local identity handoff was checked before implementation. No remote migration, deployment, real learner data or AI calls.

## Bounded contract for review

The seed uses `addition-digits-v1`: two integers from 0 through 9, fixed renderer `a + b =`, integer response, exact sum between 0 and 18. Zero and unit carry are included; negatives, fractions, units and free-form wording are excluded. All 100 operand pairs have an independent counting oracle check. Ten fixed ordered instances use `a = 0…9`, `b = (3a) mod 10`. They belong to Rekenen / Optellen with **synthetic** mapping `demo:optellen:single-digits` in `synthetic-d05-v1`. These variants represent one procedure family and cannot establish category mastery or independent evidence breadth. No curriculum or assessment policy is changed.

`src/server/content/arithmetic.ts` contains the generator, per-instance validator and exact versioned payload hashing. Each published row stores the template, validator, evaluator contract, curriculum, skill, rights, parameters, answer and payload hash. The evaluator version names the future exact-integer contract; D06 still owns response parsing/submission/scoring. The publication policy is explicitly `synthetic-addition-seed-v1`. There is no human certification record yet, and no production automatic-publication claim. D10/D11 must add the reviewed production publication/certification model; this narrow seed does not complete those tasks.

## Persistence and authority

The additive `202610200004_immutable_assignments` migration introduces `ArithmeticQuestionVersion`, `Assignment` and `AssignmentItem`. Assignment membership pins exact question versions in a unique contiguous order. Those immutable question rows pin their evaluation and mapping metadata. The assignment records the selection policy, revision, student, actor, request ID and request hash.

Database triggers reject update/delete of these facts. Deferred commit constraints reject incomplete membership, gaps or later extensions; restrictive foreign keys protect references. These are normal-operation protections, not a privacy retention policy. An authorized future maintenance/deletion path must handle erasure; runtime APIs cannot disable the triggers. Application authorization, not PostgreSQL row-level security, enforces student ownership.

Creation uses D03 `assign` capability and D02's existing authenticated transaction/advisory lock. Synthetic seed publication, ordered membership, assignment and secret-free audit commit together. Concurrent identical actor/request IDs return the same assignment. The same actor/request ID with different student/policy returns 409 after authorization. Authorization is rechecked on retries, including revoked capability. Stored seed payloads must match every expected field and hash; mismatches fail closed without rewriting published content.

Student reads use D04 `withStudentIdentity` with approved-browser/credential/session revalidation, then a student-scoped query. Adult sessions cannot use the student GET endpoint. Future guardian projections may use the transaction-level reader with an authenticated adult actor and active `canView`; no guardian result UI is added here.

## Local API

Uses the existing opt-in synthetic loopback identity configuration. D04 student access requires the explicit localhost origin and passkey enrollment described in [student browser authentication](student-browser-auth.md). There is no automatic startup seed; publication occurs only during an authorized synthetic assignment request.

| Request                             | Behavior                                                                                                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/practice/assignments`    | Authenticated guardian; exact JSON `{studentId, requestId}` with UUID values; active assign capability; creates the fixed ten-item seed assignment. Returns only `{id}` with 201, or 200 on replay. |
| `GET /api/practice/assignments/:id` | Authenticated approved-browser student; own assignment only; minimal presentation DTO.                                                                                                              |

Mutations require the configured Origin. Reads require that Origin or same-origin Fetch Metadata. Query parameters, unsupported methods, unexpected input and bodies exceeding 1 KiB are rejected. Responses are no-store; unavailable and unauthorized assignment IDs are indistinguishable. Configuration failure returns 503 before database access at the Next boundary.

`PublicAssignment` includes only assignment ID, student ID, revision, subject, category and ordered item IDs/positions/prompts/response types. It excludes keys, hashes, seeds, evaluator metadata and private content records. Server entry points import `server-only`; no preview scoring definitions enter this API. Arithmetic answers are naturally derivable from the visible question; preventing access to the stored key is the security boundary.

## Executed verification

Node 24.22.0, 20 October 2026:

- Root unit suite: **126 tests / 25 files passed**, including all 100 operand pairs, invalid operand bounds and existing assessment regressions. Initial red test failed because the generator module did not yet exist.
- PostgreSQL integration: first **35 passed**, then **36 passed** after adding stored-publication mismatch coverage. Fresh migration and replay passed. Includes real Chromium virtual-authenticator student access and denial after revoke-all, exact DTO fields, immutable records, atomic rollback, incomplete membership rejection, duplicate concurrent creation, conflicting payloads and capability denial.
- **11 targeted built Playwright checks passed**, including disabled assignment routes and no D05 private seed/evaluator markers in root HTML, RSC or loaded scripts. The positive assignment API projection is tested through the real identity handler/Chromium loopback adapter. There is no assignment page yet, so these are not claims about D07's future assignment-page HTML/RSC.
- Typecheck, zero-warning lint, Prisma validation, production standalone build and root formatting passed.
- An attempted migration-diff generation required an unconfigured shadow database and failed without applying anything. The additive SQL was authored explicitly and verified by the disposable PostgreSQL runner. No failed command is counted as passing.

Full Storybook/learner/visual/device suites, populated prior-version migration upgrade, VPS migration, hosted runtime, remote CI and aggregate `npm run check` were not run. No UI/shared component changed, so no new stories or visual approval. No approved artwork or Nexai copy changed. Existing unrelated working-tree changes were preserved; no mass commit was made.

## Handoff

The user accepted the synthetic testing boundary by asking to proceed to D06 on 20 October; D05 is complete for that narrowed acceptance. The architecture requires human approval of renderer, pedagogical bounds and skill mapping; tests cannot supply it. D10/D11 will review the exact template and source before production certification. D06 is now authorized and implements authoritative submissions, immutable attempts, response validation and approved retries/score against these pinned records. D07 then connects approved learner screens. Real educational assessment, full publication workflows and production use remain separate gates.
