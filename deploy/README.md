# Production deployment

The production stack contains three containers: React frontend, FastAPI backend,
and Caddy as the only public entry point. The API listens only on the internal
Docker network; Caddy routes `/api/*` to it and serves the frontend for every
other path.

## One-time VPS preparation

1. Copy `bootstrap-vps.sh` to the Ubuntu VPS and run it as `root`.
2. Copy `.env.example` to `/opt/pav/.env` and `backend.env.example` to
   `/opt/pav/backend.env`. Add a long random `DOCUMENT_ACCESS_TOKEN` to
   `/opt/pav/.env`; compose refuses to start the production backend without it.
   Clients use it as `Authorization: Bearer <token>` for every `/api/documents`
   endpoint. For a temporary stand only, set
   `DOCUMENT_ACCESS_CODE_COPY_ENABLED=true` in `/opt/pav/.env` to show a button
   that copies this code on the document-access screen. Leave it `false` in
   production and remove the feature before release. Fill `backend.env` with
   the production Synapse values if that integration is used.
3. Append the public half of the dedicated GitHub Actions deploy key to
   `/root/.ssh/authorized_keys`.
4. Configure the GitHub repository secrets below.

`CADDY_SITE_ADDRESS=:80` permits the first deployment by IP address. When a
domain has an A record pointing at the VPS, change it to that domain name and
redeploy. Caddy then enables HTTPS and renews certificates automatically.

## GitHub secrets

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS public IPv4 address |
| `VPS_USER` | `root` for the initial server setup |
| `VPS_DEPLOY_KEY` | Private key of the dedicated GitHub Actions deploy key |
| `GHCR_PULL_TOKEN` | Classic GitHub token with the `read:packages` scope |

The workflow publishes images to GitHub Container Registry (GHCR). The VPS
uses `GHCR_PULL_TOKEN` only to pull a new release and logs out immediately
afterward. Do not place application secrets in images; the document token stays
in `/opt/pav/.env` and other backend secrets stay in `/opt/pav/backend.env` on
the VPS.

## Release behavior

Every push to `master` runs tests, publishes the frontend and backend images
tagged with the commit SHA, copies the deployment files to `/opt/pav`, pulls
that exact image pair, restarts the stack, and checks `/api/health`.
