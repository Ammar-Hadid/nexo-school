# Resource ownership — D03

20 October 2026. Local synthetic implementation under the approved delivery roadmap and the existing [identity/resource policy](../architecture/initial-architecture.md#identity-and-resource-level-permission-policy). D03 follows completed D02/D02a; the [ledger](../../tasks/todo.md#current-position-and-handoff) owns current status. No new service, dependency, UI or educational policy is introduced.

## Data and authority

`Student` is a pseudonymous profile linked uniquely to one student-kind Better Auth `User`. `GuardianStudent` is an explicit many-to-many link with independent `canView`, `canAssign`, `canManage` capabilities and `revokedAt`. There is no implicit household grant, adult-wide student access or content-admin shortcut. New links default to no capabilities. Creating a new profile grants its authenticated creator all three guardian capabilities atomically.

The versioned migration `202610200002_resource_ownership` adds composite foreign keys and SQL role checks: an adult cannot be a student profile, a student cannot be a guardian, and linked identities cannot change kind. One auth identity cannot map to multiple student profiles. Deletion is restrictive; revoking the last supervision link retains the profile and its identity. Future privacy deletion/recovery is an explicit separate workflow. Database constraints preserve role/reference integrity; they are **not row-level security**. Application authorization protects access through the shared database runtime role.

`src/modules/identity/authorization.ts` owns the pure capability policy. Students may view/practice only their own resources and may never assign, manage or gain adult authority. Guardians need the particular active capability; they cannot submit scored practice as a student. Management additionally requires MFA within five minutes, with future timestamps denied. `canAssign` is permission groundwork for later assignment use cases, not an implemented assignment feature.

`src/server/identity/students.ts` performs principal-scoped database reads and returns only `{ id, displayName }`. It checks relationship state on each operation. `withAdultIdentity` in the existing auth service verifies the real Better Auth cookie against PostgreSQL, requiring verified email, enabled MFA and server-recorded MFA proof. The session check, resource check, write and secret-free audit share D02's transaction/advisory lock, so revocation cannot race a check followed by a later write. This deliberately retains the bounded local serialization design, not a throughput guarantee. Audit events identify the actor and target student without recording names, cookies or credentials. Audit failure rolls the entire mutation back.

## Local HTTP contract

Uses exactly the [D02 opt-in and loopback configuration](local-identity.md#run-and-verify). The Next adapter refuses access before opening the database if configuration is absent/invalid. These routes are synthetic operator/test surfaces, not reviewed guardian screens.

| Method and route                                | Behavior                                                                                                                                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/identity/students`                   | Fresh adult MFA; accepts exactly `{ "displayName": "Synthetic child" }`; creates the student identity/profile and creator relationship atomically. Returns the minimal profile with status 201. |
| `GET /api/identity/students/:id`                | Verified adult session and active `view` capability. Returns only the minimal profile.                                                                                                          |
| `PATCH /api/identity/students/:id`              | Active `manage` capability and fresh adult MFA; accepts exactly `displayName`; updates the profile and audit atomically.                                                                        |
| `DELETE /api/identity/students/:id/supervision` | Active `manage` capability and fresh adult MFA; no request body; revokes only the caller's relationship and audits it. Other guardians keep their own explicit access.                          |

Names must be nonempty after trimming, at most 100 characters and contain no ASCII control characters. JSON reads are bounded to 1 KiB. Unexpected fields, ownership/role input, query parameters and unsupported methods are denied. Mutation requests require the exact configured Origin. All responses are `no-store`; absent and unauthorized resource IDs return the same status/body. The API has no arbitrary existing-student linking, permission editing, list-all, role switching, account signup or role-grant endpoint. Additional guardians are trusted synthetic database fixtures in tests; a future invitation workflow must separately verify authority.

The required library email field for new student identities contains a generated internal UUID at `example.invalid`; no child email is collected, and no password account or credential is created. Learner-facing copy and existing practice previews are unchanged.

## D04 integration boundary

Student **HTTP authentication remains denied** in D03. Merely creating a student user or generic library session must never unlock access. D04 must resolve a student actor only after real user-verified passkey authentication plus an active guardian-approved browser/session binding, then call the same capability and scoped-query policy. Database tests exercise trusted synthetic student actors directly; these are not evidence of student login or approved-browser security.

D04 must also apply `manage` plus recent adult MFA to enrollment/revocation/recovery, serialize authorization-sensitive writes with this boundary (or replace it with equally verified concurrency control), and reuse profile IDs. Future practice records must reference the student ID and enforce ownership in every use case; D03's profile tests do not certify future assignment/result APIs. No public migration, VPS change, real child data or production identity release is included here.

## Verification — 20 October 2026

- Node 24.22.0. `npm run test:identity`: **24 passed** (16 existing identity cases plus 8 D03 cases), against a disposable local PostgreSQL instance. Both migrations applied cleanly; replay reported no pending migrations; the test container was removed.
- Two actual MFA-authenticated guardian cookie jars test both directions of cross-family GET/PATCH/DELETE denial, minimal projections and missing-ID equivalence. Other cases cover multiple guardians/students, independent capabilities, student-scoped database access, generic student-session denial, missing/expired/deleted/MFA-less sessions, forged authority, stale MFA, origin/input rejection, SQL role/FK/uniqueness enforcement, audit rollback and concurrent revoke/update behavior.
- `npm test`: **123 passed in 24 files**, including the capability matrix and shared-UI/server import guard. `npm run typecheck` and zero-warning `npm run lint` passed.
- Initial Prisma validation rejected the missing composite unique declaration on the one-to-one student identity relation. The schema/index was corrected before the passing migration and test run; no failed check is counted as a pass.

`npm run build` and `npm run test:e2e -- tests/e2e/local-identity.spec.ts` passed: **5 targeted built-route checks**, covering auth plus GET/POST/PATCH/DELETE resource denial when configuration is disabled. `npm run format:check`, `npm run db:validate`, local documentation target checks and Git whitespace checks passed. Full Storybook/visual/learner browser suites, physical-device authentication, remote CI, hosting verification and VPS migration are not rerun for this backend slice. No new visual or educational approval is claimed.

## D04 follow-up — 20 October 2026

[D04](student-browser-auth.md) implements the previously pending local student authentication boundary. Protected student work must use `withStudentIdentity` and then the existing resource policy; generic library sessions remain insufficient. This extension uses the same transaction lock and student IDs. D03's recorded test totals and VPS-migration omission above remain historical.
