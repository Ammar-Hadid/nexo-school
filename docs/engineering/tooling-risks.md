# Tooling compatibility and dependency risk record

Inspected 16 October 2026. These are engineering limitations, not a claim of user risk acceptance or production security certification. Review on dependency updates and before the live pilot.

## Storybook Next.js App Router fix

Storybook 10.6.2's mock omits `parentRenderTree.data.bfcacheId`, read by Next.js 16.4's router. Actual browser stories failed before the correction. The published stable packages do not yet include [upstream PR 36732](https://github.com/storybookjs/storybook/pull/36732); see [issue 36720](https://github.com/storybookjs/storybook/issues/36720).

`scripts/prepare-storybook.mjs` applies exactly that context field to the pinned development dependency, refusing another package version or an ambiguous source match. `npm run setup`, Storybook commands and story tests invoke it explicitly; npm lifecycle scripts remain disabled. This is not a production Next.js patch. Remove it when a tested stable Storybook release includes the fix. Existing App Router stories reproduce the failure without it.

Do not downgrade Next.js below the [October security release](https://nextjs.org/blog/nextjs-security-update-october-14-2026) to avoid this Storybook incompatibility. The application remains on 16.4.2.

## Development-only braces advisory

The full npm audit reports five high-severity package entries rooted in one [unpatched braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. There is no published fixed braces version at the audit date. The problem involves deeply nested attacker-supplied glob patterns. This foundation uses fixed repository-owned lint patterns; these packages are development tooling, not the shipped standalone runtime.

No blanket `audit fix --force`, silent downgrade or ignored future audit failure is used. `npm run audit:dependencies` first blocks high/critical production advisories, then reports the full totals and allows only this named development dependency chain/advisory. Other high/critical findings fail. Review this limitation when updating the lint stack; do not expose dev tooling as a public service or feed untrusted glob expressions to it. This remains a known unresolved tooling issue, not a clean full audit.

A separate `serve` compression advisory was fixed using a scoped override to `compression@1.8.2`, within the same compatible minor line. Remove the override when serve's own dependency includes the fix. `serve` only hosts the built Storybook on loopback during tests; it is not the app runtime server.

## Toolchain peer compatibility

ESLint 9.39.5 is pinned because the current Next.js ESLint preset's React/import/accessibility plugins declare support through ESLint 9, not 10. npm reports ESLint 9 as unsupported and `tsconfck@3.1.6` as unmaintained. Retain the actual working, peer-compatible toolchain temporarily rather than force incompatible versions; review compatible releases at the next dependency update. TypeScript 5.9.3 is within the declared typescript-eslint support range; do not follow a moving `latest` tag blindly. Prisma 7.10.1 is stable and supported by Better Auth; the Prisma CLI `latest` tag pointed at an 8.0 release candidate during setup.

Storybook's development bundle emits size notices for its docs/axe tooling and Vite notices about Next.js `use client` directives. Storybook renders in a client-only preview; this does not describe the production app's server/client build. Keep warnings visible and recheck if the framework changes. Browser runtime errors are not accepted.
