# nexo School development instructions

Before each substantial task:

1. Read `docs/engineering/development-protocol.md` and the relevant approved architecture/product documents. Current user instructions can amend earlier decisions; record conflicts explicitly.
2. Inspect code, tests and `tasks/todo.md`. Documentation defines intended behavior; actual implementation and executed tests establish evidence. Never infer implementation from a plan.
3. Work within the authorized milestone, verify the affected behavior and update its evidence.

## Current scope

On 16 October 2026 the user accepted the authentication feasibility spike and authorized the **foundation milestone**: instructions, approved stack, quality checks and Storybook. See `tasks/plan.md`. Preserve the isolated `spikes/auth-feasibility/` package and its credentials/data exclusions. Safari was skipped at user direction; do not claim it passed or repeat the spike request.

Keep the approved Next.js/React/TypeScript modular monolith, Prisma/Neon PostgreSQL, Better Auth/passkeys and existing VPS/Docker/Caddy. Do not add services or change the stack without a concrete reviewed reason. This milestone does not authorize a production deployment, real learner data, live AI calls, a full UI catalogue or educational feature implementation.

On 17 October 2026 the user approved the Plum & Cornflower palette and its static practice-page direction, and authorized central color tokens. For color changes or new UI, read `docs/design/color-palette.md`. The user subsequently approved the lighter purple (`--palette-purple: #8759A6`) and Button revision 4 on 17 October 2026. The current palette and component approval register are authoritative; original plum references remain historical. This extends the foundation scope to palette adoption; product components and educational functionality still require their own implementation/review.

## Code boundaries

- `src/app`: Next.js routing/composition; server components by default.
- `src/modules/<domain>`: domain-owned use cases and feature UI, introduced only when needed. Keep business rules independent of rendering and infrastructure. Do not create empty future domains.
- `src/server`: server-only configuration and infrastructure adapters. Guard runtime entry points with `server-only`; no credentials in browser modules, public environment variables, logs or fixtures.
- `src/components`: genuinely shared UI, with stories; no business logic or server/domain imports.
- `src/styles`: shared tokens and styles used by application and Storybook. Color approval and editing guidance live in `docs/design/color-palette.md`; approved typography and adoption status live in `docs/design/typography.md`; remaining visual scales are provisional.
- `prisma`: schema and reviewed versioned migrations. Do not run migrations against a remote database without authorization for that environment.

## Design and review

Storybook is mandatory for meaningful shared components. Before adding a component, search for an existing implementation/variant. Use shared semantic tokens; do not scatter visual literals or adopt the spike's colors as branding. See `docs/design/component-approvals.md` for revision-specific Draft → In Review → Approved evidence. Only the user approves components/branding; tests and stories are not approval. Significant contract changes require review; routine internal work does not require repeated permission.

## Verification and reporting

Read `docs/engineering/verification.md` before changing tests, CI or reporting completion. Use the root npm scripts for the application and the spike's separate scripts for spike changes. Never run the deployed spike's initial password-only smoke script after TOTP setup. Normal tests use synthetic fixtures and no external AI.

Before completing, run appropriate checks and report exact outcomes and omissions. Separate Implemented, Tested, In Review, Approved and Not Implemented. Do not update visual baselines merely to pass tests. Keep secrets, generated clients, build outputs and test artifacts out of Git.

For decisions use the existing ADR register at `docs/architecture/decisions.md`; for educational scope use `docs/product/mvp-scope.md`. All five categories and MVP AI generation remain required. Deterministic arithmetic/grading and initially human-reviewed semantic content remain the approved policy.
