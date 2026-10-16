# nexo School

A TypeScript/Next.js modular monolith for the approved five-category educational product. The **foundation milestone** provides the application runtime, Prisma/PostgreSQL adapter preparation, quality checks and Storybook. The isolated authentication spike was accepted by the user on 16 October 2026.

The foundation is a development environment, not the learning application: no lessons, real learner records, live AI calls or production auth routes. The approved infrastructure remains Neon PostgreSQL and the existing Hetzner Docker/Caddy host; nothing new has been deployed by this milestone.

## Local development

Use Node **24.22.0** (`.nvmrc`; `nvm use` if you use nvm).

```sh
npm ci --ignore-scripts
npm run setup
npx --no-install playwright install chromium
npm run dev
```

Open http://127.0.0.1:3000. In another terminal, run `npm run storybook` and open http://127.0.0.1:6006. Both bind to loopback. If 6006 is occupied, use `npm run storybook -- --port 6007`. The shared Dutch development notice is a provisional fixture, not an approved brand or product component.

The foundation does not need `.env` values. When the database slice begins, copy `.env.example` to `.env`, set separate runtime/migration credentials privately and follow the reviewed migration plan. Do not provision a database, apply schema changes or copy spike credentials just to run this foundation.

## Checks and packaging

```sh
npm run check
npm run audit:dependencies
```

`check` runs formatting, linting, strict types, Prisma schema validation, unit tests, Storybook browser/axe tests, production builds and Playwright against the built app/workbench. See [verification](docs/engineering/verification.md) for individual commands and visual-baseline review. The auth spike has separate commands in its [README](spikes/auth-feasibility/README.md).

`npm run build && npm start` runs the standalone production build locally. `docker build -t nexo-school:local .` packages it for the existing container-based architecture; no Caddy/DNS deployment occurs. Runtime is non-root and needs only its standalone output. Do not expose the development app or Storybook publicly as a learning service.

Known tooling limitations—including a small upstream Storybook compatibility backport and one unresolved development-only audit advisory—are recorded in [tooling risks](docs/engineering/tooling-risks.md). The full audit is not claimed clean.

## Repository map

- `src/app`: route composition and server-first React layouts.
- `src/modules`: domain-owned features, introduced as slices need them; currently only the development fixture.
- `src/server`: server-only infrastructure; lazy Prisma/Neon-compatible PostgreSQL connection boundary.
- `src/styles`: provisional common styles/tokens for application and Storybook.
- `prisma`: schema/generator configuration; no domain models or migrations yet.
- `.storybook`, `tests`, `.github/workflows`: component workbench and quality gates.
- `spikes/auth-feasibility`: separate disposable auth package and accepted feasibility evidence.

## Project records

- [Agent instructions](AGENTS.md) and [user engineering protocol](docs/engineering/development-protocol.md)
- [Architecture](docs/architecture/initial-architecture.md) and [decision register](docs/architecture/decisions.md)
- [MVP roadmap](docs/product/mvp-scope.md)
- [Foundation plan](tasks/plan.md), [task status](tasks/todo.md) and [verification report](docs/engineering/foundation-report.md)
- [Component approval register](docs/design/component-approvals.md)
- [Auth spike findings](spikes/auth-feasibility/FINDINGS.md) and [physical-device record](spikes/auth-feasibility/DEVICE-TESTS.md)
