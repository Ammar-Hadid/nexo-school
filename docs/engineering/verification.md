# Verification and review

Use Node from `.nvmrc`. Run `npm ci --ignore-scripts`, `npm run setup`, then `npx --no-install playwright install chromium` (CI uses `--with-deps`). No database credentials are needed for the foundation checks. Use the root package for the application; the spike remains independently installed/tested in its own directory.

| Command                      | Contract                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run format:check`       | Formatting for application/configuration/new governance docs; historical approved prose and verbatim protocol are excluded                           |
| `npm run lint`               | Next.js/React/TypeScript/Storybook rules; no app imports from spike, no infrastructure/domain imports into shared UI                                 |
| `npm run typecheck`          | Generate Prisma client and Next route types, then strict TypeScript                                                                                  |
| `npm run db:validate`        | Validate PostgreSQL schema, with no connection or migration                                                                                          |
| `npm test`                   | Configuration failures and lint-boundary regression checks                                                                                           |
| `npm run test:stories`       | Real Chromium story rendering, interaction and axe checks using the same styles and locale as the app                                                |
| `npm run build`              | Generate Prisma client, build Next standalone output, package static assets                                                                          |
| `npm run storybook:build`    | Build the development component workbench                                                                                                            |
| `npm run test:e2e`           | Start the built standalone app and static Storybook on loopback; keyboard, responsive, headers, accessibility, runtime-error and shared-style checks |
| `npm run check`              | All preceding checks in dependency order                                                                                                             |
| `npm run audit:dependencies` | Production security gate and explicitly triaged development audit; see tooling risk record                                                           |
| `npm run test:visual`        | Explicit image comparison against reviewed platform-specific baselines; baseline writes disabled by default                                          |

The root scripts do not install or run the isolated auth spike. CI includes a separate spike job to preserve its regression suite. Never reuse the deployed spike's credentials or database for tests.

## Risk-based completion

For shared UI, meaningful stories, keyboard/focus/error/loading states, relevant viewport checks and revision-specific review evidence are required. Do not generate the full cross-product of props. Feature UI stays local until reuse is established. For auth/database/education logic, add negative authorization, transaction/migration and independent correctness tests as those slices are introduced. Normal checks never call paid AI providers or use real learner data.

An axe pass is not WCAG certification; screen-reader, device and full-journey checks remain necessary for the actual product. Tests of viewport dimensions are not physical Safari/Android authentication evidence. Report source and date of evidence.

## Visual baseline review

No approved visual baselines exist yet. The foundation is a provisional fixture, not an approved product screen. The explicit visual command will fail on missing baselines and is intentionally not in `check`/CI yet. E2E tests capture inspection screenshots under ignored `test-results/`.

For the first reviewed UI revision: generate candidate screenshots in a disposable review checkout on the intended baseline platform, inspect them with the user, record the exact component/story revision and approval, then commit only the approved images under `tests/visual/baselines/<platform>/`. Enable visual comparison in CI for that platform. Do not use `--update-snapshots` during normal verification or treat generated images as automatically approved. Later diffs must be reviewed for intentional contract changes.

## Reports and approvals

At a checkpoint report implemented files/behavior, architectural decisions, components/stories, executed tests with results, accessibility/security concerns, remaining risks, approvals and next scope. Label unrun checks and failures. Approval means an explicit user response for that revision, not a passing story. See `docs/design/component-approvals.md` and the canonical user protocol.

The foundation's PostgreSQL schema has no models/migrations. The lazy server-only adapter is prepared for Neon pooled runtime credentials; live connectivity, adult/student auth schema and routes, roles, recovery and data isolation await roadmap 1A/1B. Better Auth packages are pinned, not exposed as an unguarded catch-all auth endpoint. Building successfully does not prove these future capabilities.
