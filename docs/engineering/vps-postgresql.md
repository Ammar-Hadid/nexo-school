# Self-hosted PostgreSQL on nexo-vps

20 October 2026. User-authorized hosting amendment to ADR-002 and D02. PostgreSQL replaces the previously selected managed database. Prisma and the standard `pg` adapter remain; there was no provider SDK or managed database migration to undo.

## Scope and organization

Use `ssh nexo-vps` as `ammar`. Preserve the existing `/srv` conventions and every unrelated service. Auctus uses SQLite, so its directory layout is the reference, not its database engine or credentials. Do not edit Auctus, Caddy, firewall rules, or the deployed authentication spike. Clean, organized infrastructure is a standing user requirement.

| Purpose             | Dedicated path/resource                             |
| ------------------- | --------------------------------------------------- |
| Deployment files    | `/srv/apps/nexo-school/deploy/postgresql/`          |
| Private credentials | `/srv/data/nexo-school/current/postgres.env` (0600) |
| Durable cluster     | `/srv/data/nexo-school/current/postgresql/`         |
| Private dumps       | `/srv/backups/nexo-school/postgresql/` (0700)       |
| Container/network   | `nexo-postgres` / `nexo-school-db`                  |
| Database            | `nexo_identity_local`, synthetic D02 data only      |
| Host port           | `127.0.0.1:15432`, SSH tunnel access only           |

The compose manifest pins PostgreSQL 17.11 by image digest. Limits: 512 MiB memory, no additional swap, 0.5 CPU, 30 connections, 128 MiB shared buffers, 4 MiB work memory, bounded Docker logs. These are initial shared-host limits, not capacity qualification. Inspection found approximately 12 GB free disk (85% used) and an already cached PostgreSQL image. Do not clean unrelated files to make room. Disk alerting/capacity and independent backup storage remain release gates.

## Install procedure

1. Operator creates private parent directories using their own terminal (sudo is interactive; never send passwords to chat):

   ```sh
   ssh -t nexo-vps 'sudo install -d -o ammar -g ammar -m 0700 /srv/data/nexo-school/current /srv/backups/nexo-school/postgresql'
   ```

2. Create `/srv/apps/nexo-school/deploy/postgresql` as `ammar`; copy only this repository's `deploy/postgresql/` files there. Run `python3 prepare-env.py` on the VPS. It creates independent random credentials with exclusive creation and never overwrites an existing file. Never copy another application's credentials or print the environment.
3. Confirm port 15432 and the named container/network are unused. Run `docker compose up -d --wait` from the dedicated directory. On later updates review the exact manifest first; initialization SQL runs only for empty PGDATA. A Docker-managed database directory has its image-required owner; do not recursively chown existing data to the operator.
4. Use an SSH loopback tunnel (`ssh -N -L 127.0.0.1:15433:127.0.0.1:15432 nexo-vps`) for the local D02 CLI. Supply credentials privately through environment, never command arguments or Git. `DATABASE_URL`/`DIRECT_DATABASE_URL` for migrations use `nexo_migrator` at local tunnel port 15433 and database `nexo_identity_local`. Apply `npm run identity:local -- migrate`; repeat to check no pending migrations. The synthetic-only configuration and HTTP loopback application origin remain mandatory.
5. After migration, execute `REVOKE ALL ON TABLE "_prisma_migrations" FROM nexo_app;` as migrator. Runtime uses `nexo_app`; migrations use `nexo_migrator`; backups use read-only `nexo_backup`. No role except the reserved bootstrap administrator is superuser or can create databases/roles. Default privileges cover future migrator-owned tables; recheck new migrations do not need additional runtime privileges.
6. Bootstrap/recovery follow the [D02 runbook](local-identity.md). Do not run the truncating integration suite against the persistent database. The default test runner always creates its own disposable local container. Any VPS integration rehearsal must create and remove a separately named synthetic test database on this cluster only.

The database is not published through Caddy or a public interface. Existing direct remote URL validation still requires `sslmode=verify-full`; SSH forwarding terminates at loopback without weakening that rule. A future app container's private-network/TLS configuration must be explicitly implemented and verified before deploying the main app.

## Backups, restoration and rollback

`backup.sh` uses `pg_dump -Fc` with the read-only role, a lock, private temporary output, atomic rename, checksum, archive-header check and a 14-day retention window. A successful archive-header check is not a restore test. Before scheduling it, restore into a separate disposable database and verify expected records. A dedicated user-crontab line was installed after the live rehearsal at **04:10 UTC**, preserving all existing entries (Auctus runs at 03:40 UTC). Output goes to the private backup directory’s `backup.log`. Copying these files alone does not install that schedule.

For restore: verify the checksum, create a new empty database, use the pinned image's `pg_restore --exit-on-error`, and verify migrations/records plus identity revocation semantics before switching any application. Preserve the source database. Never restore over a running database as a routine test.

Same-host backups cannot survive host loss. D33 still must select off-host encrypted storage, alert destination, RPO/RTO and retention/deletion policy; D34 must rehearse full application restore including revocation/deletion replay. This synthetic hosting task cannot close those gates.

Rollback: stop only this compose project's PostgreSQL service; retain its data and backups. Do not use global Docker cleanup or remove volumes/directories. PostgreSQL major upgrades require a separate tested migration; changing the image tag is not an upgrade procedure.

## Verification and current status

**Implemented and tested on 20 October 2026:** dedicated PostgreSQL 17.11 is healthy at `127.0.0.1:15432`; persistent synthetic D02 schema migrated and replayed successfully. The operator-authorized private directories and credentials have verified modes 0700/0600. No secret values are in source or logs. PostgreSQL used approximately 75 MiB of its 512 MiB limit during verification.

- Local deployment-manifest test passed: startup, migration/replay, runtime CRUD/DDL and migration-metadata denial, backup read-only, restart persistence and full dump/restore.
- Fresh local D02 integration run: **16 passed**. SSH-tunnel run in a separately created VPS test database: **16 passed**, 71 seconds; test database removed. Persistent database contains no user account.
- Live VPS restart retained the completed migration. Runtime transaction/write and schema-change denial passed.
- First private backup `20261020T183902Z.dump`: checksum and full restore passed; migration record and empty user table verified; restore database removed. Daily backup installed at 04:10 UTC with 14-day retention. Scheduled execution itself has not yet occurred.
- Every pre-existing container ID remained unchanged. Auctus external `/api/health` returned 403 both before and after; this is not a health-success claim. Caddy and other app configuration were not changed.
- Scoped ESLint, shell/Python syntax, repository formatting, document file targets and whitespace checks passed. Earlier D02 aggregate UI/build results remain historical; no full UI rerun or remote CI claim for this hosting-only amendment.

This closes D02a synthetic hosting. D03 resource ownership is next. No public main application, real learner, production email or off-host recovery qualification is enabled by this change.

Reproducible isolated check: `npm run test:postgresql-hosting`. It transforms the actual compose manifest into a unique local project with private temporary credentials and a disposable volume. It checks pinned image startup, migration replay, runtime CRUD/DDL boundaries, read-only backup access, restart persistence and a full custom-format dump/restore. It never reads an operator database URL or uses VPS paths.

Sources: [official PostgreSQL image](https://hub.docker.com/_/postgres), [PostgreSQL 17 logical backup/restore](https://www.postgresql.org/docs/17/backup-dump.html). Operational verification results are recorded in the [task ledger](../../tasks/todo.md#current-position-and-handoff).
