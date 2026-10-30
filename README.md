# nexo School

A TypeScript/Next.js modular monolith for four subjects: Rekenen (including Redactiesommen), Taal, Spelling and Begrijpend Lezen. The **foundation milestone** provides the application runtime, Prisma/PostgreSQL adapter preparation, quality checks and Storybook. The isolated authentication spike was accepted by the user on 16 October 2026.

The original foundation was a development environment, not the learning application: no lessons, real learner records, live AI calls or production auth routes. The approved infrastructure remains self-hosted PostgreSQL on the existing Hetzner Docker/Caddy host; nothing new has been deployed by this milestone.

## Delivery status

[Delivery roadmap revision 1](tasks/delivery-roadmap.md) was approved on 20 October 2026. Before every task, read [current position and handoff](tasks/todo.md#current-position-and-handoff) and follow the mandatory workflow in [AGENTS.md](AGENTS.md#approved-delivery-plan-and-mandatory-task-workflow). Update the shared task ledger with verified progress and the next action when handing off.

## Test the saved application locally

D04-M1 adds ordinary guardian/student login over the existing saved workflow. With Node 24.22.0 and Docker running, run `npm run portal:setup`, then `npm run portal:start`. Open the private `.local/portals/START-HERE.md` for the synthetic account's initial password and email-verification link. Guardian: <http://localhost:3060/guardian>; student: <http://localhost:3060/student>, in a separate normal browser profile.

Accounts, browser approvals and saved work persist across restarts. `npm run portal:stop` preserves the database. Follow the [portal setup, recovery and saved-work rehearsal](docs/engineering/local-portal-access.md). Use synthetic learners only; these local controls remain In Review and do not imply a public release or educational approval. The foundation-only instructions below remain available for the component workbench.

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
- `src/modules`: domain-owned features and synthetic Storybook flows, including the approved Rekenen page pattern.
- `src/server`: server-only infrastructure; lazy Prisma/PostgreSQL connection boundary.
- `src/styles`: provisional common styles/tokens for application and Storybook.
- `prisma`: reviewed domain schema and versioned migrations.
- `.storybook`, `tests`, `.github/workflows`: component workbench and quality gates.
- `spikes/auth-feasibility`: separate disposable auth package and accepted feasibility evidence.

## Project records

- [Agent instructions](AGENTS.md) and [user engineering protocol](docs/engineering/development-protocol.md)
- [Architecture](docs/architecture/initial-architecture.md) and [decision register](docs/architecture/decisions.md)
- [MVP roadmap](docs/product/mvp-scope.md)
- [Foundation plan](tasks/plan.md), [task status](tasks/todo.md) and [verification report](docs/engineering/foundation-report.md)
- [Component approval register](docs/design/component-approvals.md)
- [Synthetic guardian task-result review revision 1 — In Review](docs/design/guardian-task-results.md); [working Storybook review](http://127.0.0.1:6006/?path=/story/practice-guardian-task-results--review-page). Read-only actual attempts/results from the same temporary student snapshots, with approved guardian navigation.
- [Approved connected student practice journey revision 1](docs/design/connected-practice-journey.md); [working Storybook review](http://127.0.0.1:6006/?path=/story/practice-connected-journey--review-page). All five approved subjects, task-specific temporary resume and completion; refresh resets progress.
- [Approved Rekenen page pattern and reuse map](docs/design/rekenen-task.md#approved-pattern-and-reuse); Storybook **Practice → Rekenen → Review Page** (`practice-rekenen--review-page`)
- [Approved Taal revision 1](docs/design/taal-task.md); Storybook **Practice → Taal → Review Page** (`practice-taal--review-page`), reusing the approved exercise composition.
- [Approved Spelling revision 1](docs/design/spelling-task.md); Storybook **Practice → Spelling → Review Page** (`practice-spelling--review-page`), using the same shared composition.
- [Approved Redactiesommen revision 2](docs/design/redactiesommen-task.md); Storybook **Practice → Redactiesommen → Review Page** (`practice-redactiesommen--review-page`), using the same composition with longer continuous story passages and unit labels.
- [Approved Begrijpend Lezen revision 3](docs/design/begrijpend-lezen-task.md); Storybook **Practice → Begrijpend Lezen → Review Page** (`practice-begrijpend-lezen--review-page`), with full reading text, adjacent answer choices and Nexai below the answer panel.
- [Auth spike findings](spikes/auth-feasibility/FINDINGS.md) and [physical-device record](spikes/auth-feasibility/DEVICE-TESTS.md)

- [Automatic learning-path prototype · In Review](docs/design/automatic-learning-path.md): [Storybook review](http://127.0.0.1:6006/?path=/story/practice-automatic-learning-path--review-page), with synthetic automatic progression, daily Redactiesommen and retention in memory only.

The automatic learning-path preview is now **revision 3 · In Review**, with a [shared synthetic assessment policy](docs/product/assessment-policy.md), [research/validation plan](docs/research/2026-10-20-assessment-architecture.md) and [review/evidence](docs/design/automatic-learning-path.md). It distinguishes provisional advancement, missing evidence and targeted recovery. The current Taal bank cannot justify advancement; this is visible. Passing software checks is not educational validity.
