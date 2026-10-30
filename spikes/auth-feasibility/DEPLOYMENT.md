# Temporary deployment and cleanup

Deployed 15 October 2026 with the user's authorization to use `nexo-vps` and `auth-test.ammarhadid.com`. Only this test hostname was added. No other domains or existing DNS records were changed.

## Current resources

- VPS directory: `/srv/apps/nexo-auth-spike`, owned by the existing `ammar` account, mode 0700.
- Container/image: `nexo-auth-spike` / `nexo-auth-spike:2026-10-15`.
- Database/config/test credentials: `/srv/apps/nexo-auth-spike/data`, mode 0700; secret/credential files mode 0600. Never commit/copy these into the source tree outside ignored `.data`.
- Internal Docker network: `nexo-auth-spike`, containing the spike and existing Caddy. There is no published app port and no outbound internet dependency from the application container.
- Compose: non-root UID 1000, read-only root filesystem, no capabilities, no-new-privileges, 256 MiB memory with no extra swap allowance, 0.5 CPU, 64 PIDs, bounded logs, 16 MiB temporary filesystem.
- DNS: one proxied A record, `auth-test.ammarhadid.com` → existing VPS IPv4. Existing domain-wide SSL/security settings were not changed.
- Caddy: a marked block from `Caddyfile.fragment` appended to `/srv/apps/caddy/Caddyfile`. Candidate validated before a graceful reload. `Caddyfile.before` is kept in the spike directory for comparison; the prior content was verified byte-for-byte unchanged.
- Local private handoff: `.data/deployment/guardian-credentials.txt`; the public URL is safe to share, the synthetic password is not.

The Caddy network attachment was added with `docker network connect nexo-auth-spike caddy`. It survives ordinary container restarts, but **must be reattached if the Caddy container is recreated**; the existing Caddy Compose project was not rewritten. If the trial remains longer term, incorporate only that external network into its managed configuration after review. This disposable deployment does not establish a production operational baseline.

## Build / update only this container

Build on the Mac; do not spend the shared VPS's memory on compilation. The Dockerfile pins an inspected official Node image digest and the lockfile pins packages. Installation scripts remain disabled.

```sh
cd spikes/auth-feasibility
npm run check
npm audit
docker buildx build --platform linux/amd64 --load -t nexo-auth-spike:2026-10-15 .
docker save nexo-auth-spike:2026-10-15 | gzip > .data/deployment/auth-spike-image.tar.gz
scp .data/deployment/auth-spike-image.tar.gz compose.yaml nexo-vps:/srv/apps/nexo-auth-spike/
ssh nexo-vps 'cd /srv/apps/nexo-auth-spike && docker load -i auth-spike-image.tar.gz && docker compose up -d'
```

The first initialization used `docker compose run --rm -e SPIKE_ORIGIN=https://auth-test.ammarhadid.com auth-spike node scripts/setup.mjs`. Do not rerun it against initialized data or reuse the localhost credentials/DB for HTTPS. The setup command refuses to replace an initialized config.

## Read-only status

```sh
curl --fail https://auth-test.ammarhadid.com/health
ssh nexo-vps 'cd /srv/apps/nexo-auth-spike && docker compose ps'
ssh nexo-vps 'docker stats --no-stream nexo-auth-spike'
```

Caddy manages certificates using its existing storage. Health checks use `node:http` with the exact expected Host header. No health request queries the database. Public page/API responses are no-store; the app emits no auth payloads in logs. Cloudflare/Caddy retain their existing provider/operational behavior; do not treat this as a zero-telemetry environment.

## Pause / remove after recording results

To pause just the trial, run `docker compose stop` from `/srv/apps/nexo-auth-spike`; leave other Compose projects alone. The URL will then fail upstream until restarted.

For full removal:

1. Remove **only** the block between `BEGIN nexo-auth-spike` and `END nexo-auth-spike` in the current Caddyfile. Validate and gracefully reload. Do not overwrite the whole current file with `Caddyfile.before`, since other work may have been added since this trial.
2. Disconnect just `nexo-auth-spike` from Caddy: `docker network disconnect nexo-auth-spike caddy`.
3. From `/srv/apps/nexo-auth-spike`, run `docker compose down`. With Caddy disconnected this removes the spike's own network/container. It does not remove the bind-mounted data.
4. Remove only the `auth-test.ammarhadid.com` DNS record. Do not alter the zone or other records.
5. After retaining the non-secret findings, destroy the disposable data/config/password and image archive on both the VPS and Mac. Remove the spike image if no longer needed. Do not run global Docker prune or remove Caddy's certificate volumes.
6. On each test device, remove the synthetic passkey and test TOTP/recovery entries through the user's password manager. Deleting the server database cannot delete credentials held by an authenticator.

No automatic cleanup or monitoring job has been scheduled. Keep the trial only as long as needed for hardware testing. It must not receive real learning data.
