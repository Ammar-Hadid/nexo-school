#!/bin/sh
set -eu
# Runs once, only in this service's empty PGDATA. Never copy Auctus credentials.
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 <<'SQL'
\getenv migrator_password NEXO_MIGRATOR_PASSWORD
\getenv app_password NEXO_APP_PASSWORD
\getenv backup_password NEXO_BACKUP_PASSWORD
CREATE ROLE nexo_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'migrator_password';
CREATE ROLE nexo_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'app_password';
CREATE ROLE nexo_backup LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'backup_password';
ALTER DATABASE nexo_identity_local OWNER TO nexo_migrator;
REVOKE ALL ON DATABASE nexo_identity_local FROM PUBLIC;
GRANT CONNECT ON DATABASE nexo_identity_local TO nexo_app, nexo_backup;
ALTER SCHEMA public OWNER TO nexo_migrator;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO nexo_app, nexo_backup;
ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrator IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nexo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrator IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO nexo_app;
ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrator IN SCHEMA public GRANT SELECT ON TABLES TO nexo_backup;
ALTER DEFAULT PRIVILEGES FOR ROLE nexo_migrator IN SCHEMA public GRANT SELECT ON SEQUENCES TO nexo_backup;
SQL
