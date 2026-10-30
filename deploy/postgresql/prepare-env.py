#!/usr/bin/env python3
"""Run on nexo-vps as ammar after the operator creates the private directories."""
import os
import secrets
from pathlib import Path

base = Path('/srv/data/nexo-school/current')
backup = Path('/srv/backups/nexo-school/postgresql')
for directory in (base, backup):
    if not directory.is_dir() or not os.access(directory, os.W_OK):
        raise SystemExit('Operator-owned private directories must exist first.')
    if directory.stat().st_mode & 0o077:
        raise SystemExit('Private directories must have mode 0700.')
path = base / 'postgres.env'
# Exclusive creation: rerunning never rotates a live database password.
try:
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
except FileExistsError:
    raise SystemExit('postgres.env already exists; preserved without modification.')
with os.fdopen(descriptor, 'w') as output:
    output.write('POSTGRES_USER=postgres\n')
    for key in ('POSTGRES_PASSWORD', 'NEXO_MIGRATOR_PASSWORD', 'NEXO_APP_PASSWORD', 'NEXO_BACKUP_PASSWORD'):
        output.write(f'{key}={secrets.token_hex(32)}\n')
print('Created private PostgreSQL credentials; values withheld.')
