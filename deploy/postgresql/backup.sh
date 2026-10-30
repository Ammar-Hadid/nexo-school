#!/bin/sh
set -eu
umask 077
backup_dir=/srv/backups/nexo-school/postgresql
[ -d "$backup_dir" ]
exec 9>"$backup_dir/backup.lock"
flock -n 9 || exit 0
stamp=$(date -u +%Y%m%dT%H%M%SZ)
partial="$backup_dir/$stamp.dump.partial"
trap 'rm -f "$partial"' EXIT HUP INT TERM
# Password stays in the container; use the read-only backup role over TCP/SCRAM.
docker exec nexo-postgres sh -c 'PGPASSWORD="$NEXO_BACKUP_PASSWORD" exec pg_dump -h 127.0.0.1 -U nexo_backup -d nexo_identity_local -Fc' > "$partial"
[ -s "$partial" ]
docker exec -i nexo-postgres pg_restore --list < "$partial" > /dev/null
mv "$partial" "$backup_dir/$stamp.dump"
(cd "$backup_dir" && sha256sum "$stamp.dump" > "$stamp.dump.sha256")
find "$backup_dir" -maxdepth 1 -type f \( -name '*.dump' -o -name '*.dump.sha256' \) -mtime +14 -delete
printf '%s PostgreSQL backup saved; archive header checked\n' "$stamp"
