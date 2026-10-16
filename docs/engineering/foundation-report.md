# Foundation milestone report

16 October 2026 · Branch `codex/foundation` · **Implemented and locally verified; ready for user review.**

## Delivered

- Repository `AGENTS.md`, preserved user protocol, reconciled architecture/Storybook scope and accepted auth-spike decision, component approval lifecycle and risk-based verification guide.
- Root Next.js 16.4.2 / React 19.3.1 / strict TypeScript 5.9.3 application on Node 24.22.0. One Dutch development notice, server-rendered, with a native disclosure. It is a temporary feature fixture, not product branding or an approved shared primitive.
- Prisma 7.10.1 PostgreSQL generator/configuration and lazy server-only `pg` adapter prepared for Neon pooled runtime connections. Remote connections require certificate verification. No models/migrations or database provisioning in this milestone.
- Better Auth/passkey 1.7.10 dependencies pinned to the accepted spike version. No unguarded production auth endpoints or incomplete sign-in buttons.
- Storybook 10.6.2 with shared styles/locale, Default and Expanded stories, interaction tests and accessibility checks. System colors and minimal layout tokens remain provisional. No shared component catalogue was created.
- ESLint/Prettier, strict type checking, Vitest configuration and boundary tests, Playwright built-app/workbench checks, explicit reviewed-baseline visual-test path, pinned GitHub Actions and non-root standalone Docker packaging.

The architecture stack, five categories, required AI generation, deterministic grading, initial human semantic review and existing hosting direction are unchanged. ADR-011 records tooling choices and their consequences. The isolated spike implementation and live VPS/DNS were not changed.

## Executed evidence

| Check                            | Observed result                                                                                                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean install and setup          | `npm ci --ignore-scripts` and `npm run setup` succeeded using Node 24.22.0; no database credentials required                                                                                                               |
| Complete local gate              | `NEXT_TELEMETRY_DISABLED=1 npm run check` exited 0 after the clean install                                                                                                                                                 |
| Formatting / lint / strict types | Passed; Prisma generation and Next route type generation included                                                                                                                                                          |
| Prisma schema                    | Validation passed; empty domain schema generates successfully without a database                                                                                                                                           |
| Unit and boundary regressions    | **6 passed**: missing/invalid/insecure connection configuration and shared-UI import restrictions                                                                                                                          |
| Storybook browser tests          | **2 passed** in Chromium, including disclosure interaction and axe checks                                                                                                                                                  |
| Built-app / built-Storybook E2E  | **4 passed**: 1440×900, 1280×800, 390×844; keyboard interaction, no horizontal overflow, language, headers, app runtime errors and accessibility; shared Storybook/application typography                                  |
| Visual inspection                | Desktop/mobile screenshots inspected; foundation text, focus indicator and disclosure visible without clipping. These are inspection artifacts, not approved baselines                                                     |
| Live Storybook workbench         | Manager and preview rendered on loopback port 6007 without page errors; default 6006 was occupied and its existing process was left untouched                                                                              |
| Next and Storybook builds        | Both passed. Next standalone output includes static assets                                                                                                                                                                 |
| Container                        | Local Docker clean-lockfile build passed; non-root UID 1000, read-only filesystem, dropped capabilities and resource limits served HTTP 200; disposable smoke container stopped                                            |
| Auth spike regression            | Separate build, **4 policy tests and 2 browser tests passed** (including nine-step auth scenario) using its unchanged package                                                                                              |
| Dependency audit                 | Production: **0 vulnerabilities** reported. Full audit: **5 high package entries from one unresolved development-only braces advisory**. Scoped audit gate reports this exact chain and fails other high/critical findings |
| CI configuration                 | YAML parsed; action commit references and read-only permissions inspected. **Hosted GitHub Actions not run**; branch not pushed                                                                                            |

Local build/test logs and inspection screenshots are ignored artifacts, not secret-bearing reports to commit. Package versions and lockfiles are the reproducible inputs.

## Fixes made during verification

- Backported the upstream Storybook router-context field into its pinned development package because the published stable version failed with security-patched Next.js. The script is version/match guarded and documented for removal on upgrade. No Next.js security downgrade was made.
- Used real Playwright keyboard events to verify native disclosure activation; Storybook interaction checks use click events because synthetic keyboard events do not activate the native default action.
- Disabled clean-URL redirects in the static Storybook test server: they stripped the story query and produced “No Preview.” The built-workbench test now verifies actual rendering.
- Packaged static assets and ran the actual standalone entry point instead of using `next start` with standalone output.
- Patched the test server's compression dependency with a compatible scoped override. Full detail: [tooling risks](tooling-risks.md).

## Remaining boundaries and review

**Not implemented/tested here:** live Neon connectivity/migrations, production Better Auth supervision and roles, educational/AI features, hosted CI execution, VPS capacity, production backup/restore, screen-reader certification or a live release. Those are future vertical slices. Device tests skipped during the accepted spike remain skipped, not passed.

**In review:** this foundation implementation. **Approved:** the architectural direction, user protocol, scope authorization and user's acceptance of core auth feasibility. **Not approved:** any product brand, shared-component design contract or visual baseline. The visual comparison command exists but is not run/enabled in CI before baseline review. This is explicit, not a silently skipped passing test.

Known unresolved development issues include the braces advisory, ESLint 9 peer-compatibility constraint and Storybook build notices. These are recorded in the tooling risk register; they are not a clean security certification. The temporary Storybook fix needs removal once a verified stable upstream release contains it.

Next recommended milestone: review nexo-specific brand direction and representative student/guardian screens, then develop the first small token/component batch with revision-specific Storybook approval. Resume production supervision/data/auth slices against the approved roadmap with their own concrete scope and verification.
