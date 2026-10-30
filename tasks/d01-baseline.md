# D01 baseline and verification

20 October 2026 · Prepared by the D01 chat · **Implemented, tested and user-confirmed**

The user assigned D01 to finish the remaining baseline/decisions before D02. The [release contract](../docs/product/d01-release-contract.md) records the confirmed scope, local identity boundary and later decision gates. The user explicitly confirmed “Confirm D01 handoff” on 20 October 2026, satisfying D01 review. This confirms the local identity boundary and decision placement; later proposals have not acquired approval.

## Source baseline

Starting HEAD: `1cd7620` (`design: make practice blocks welcoming for students`). At task start there were 26 modified tracked files and 354 untracked files. No staged changes were present. The [start inventory](d01-baseline-inventory.json) fingerprints all 486 tracked/non-ignored candidate files present on disk: **205,929,831 bytes**. Hashes identify the pre-D01 working contents, not just HEAD. This manifest is an inventory, not a claim that every line or asset has received review.

| Group                                                                      | Disposition                                                                                                                                                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing application, stories, tests, configuration and scripts            | Preserve all current work. Foundation app still renders `FoundationNotice`; Prisma still has no auth/domain models. D02 is not implemented.                                                             |
| Architecture/product/design/research and task records                      | Preserve current contracts, dated evidence and superseded history. Use the approval register and current contracts rather than filenames to infer approval.                                             |
| Approved Nexai master, pose/layer sources, manifests and public copies     | Retain intentionally as source/provenance inputs. All nine frozen master hashes match; unit tests verify approved pose/public asset parity.                                                             |
| Historical motion/review experiments under references and public assets    | Retain as historical evidence. They are not automatically selected for production delivery; D09 must enforce the approved selection.                                                                    |
| `.impeccable/config.json`                                                  | Shared detector decisions retained; formatting-only change. No detector rule/value changes.                                                                                                             |
| `.impeccable/hook.cache.json`                                              | Volatile plugin cache, already locally ignored. Add repository-level Git and Prettier exclusions so another checkout has the same behavior.                                                             |
| Isolated auth spike                                                        | Preserve all source and its separate package. No spike edits or deployed smoke test.                                                                                                                    |
| Ignored secrets, dependencies, generated clients/builds and test artifacts | Excluded from the source snapshot. `.env.example` contains blank configuration only. Existing tracked `next-env.d.ts` is inventoried as inherited toolchain metadata; no new generated output is added. |

A local recovery snapshot and final SHA-256 inventory are stored under ignored `.artifacts/d01/` as `source-baseline.tar.gz` and `final-inventory.json`. Archive members are individually checked against that final inventory. The pre-D01 manifest is retained separately so later work can distinguish inherited changes from this task.

This is a recoverable local working-tree baseline, **not a clean Git checkout or release commit**. No bulk commit, reset, stash, deletion, push or remote mutation was performed. Atomic commits of the accumulated prior work remain repository hygiene work; they are not a prerequisite for the local D02 slice. A local archive is not an off-host backup.

Credential-pattern scanning found only the synthetic `fixture:fixture` PostgreSQL URL at `db.example.invalid` in `src/server/db/connection-string.test.ts`, inspected as a negative/positive configuration fixture. No suspicious candidate credential file was found; pattern scanning is not a comprehensive security audit.

## Formatting policy

The initial root formatting check failed only on `.impeccable/config.json` and `.impeccable/hook.cache.json`. Format the shared configuration and exclude only the volatile cache; do not exempt the whole plugin directory or relax application/assessment checks. Historical approved prose exclusions remain unchanged. Newly authored product prose was explicitly checked with the ignore file disabled.

## Executed verification

Using Node **24.22.0** from the existing local npm runtime cache, matching `.nvmrc`:

- `npm test`: **110 passed across 22 files**, including assessment regressions and artwork/copy integrity coverage.
- `npm run lint`: **passed**, zero warnings.
- `npm run typecheck`: **passed**, including Prisma generation and Next route type generation.
- `npm run format:check`: **passed** after the scoped policy/configuration correction.
- Scoped Prettier check of the new contract with historical exclusions disabled: **passed**.
- Local Markdown targets and anchors in the D01 contract/report and updated roadmap/ledger links: **passed**.
- `git diff --check`: **passed**.
- Nine master manifest SHA-256 entries: **all match**. Source preservation check: all original files except the explicitly listed D01 edits retain their starting hashes.

Not rerun: Storybook tests/build, application build, E2E, visual comparison, dependency audit, Docker, spike tests or physical devices. No runtime/UI/educational behavior changed. The aggregate `npm run check` was **not run** and is not claimed green. No database connection/migration, live AI, real learner data or deployment was used.

## Handoff

The user confirmed the [D01 contract](../docs/product/d01-release-contract.md): local D02 boundary and explicit placement of remaining decisions at their dependent tasks. Reward/audio proposals remain unapproved. D01 is complete and D02 is next; it starts with supported-library inspection and disposable local PostgreSQL bootstrap/recovery tests. D03–D36 remain incomplete; M0's full operating envelope and release approvals remain open at their named gates.
