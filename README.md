# doctolib-crawler

A self-hostable watcher that polls [Doctolib](https://www.doctolib.de) appointment
search pages on your behalf and **emails you the moment a new appointment slot
appears**. Useful when you're waiting on a hard-to-get appointment and don't want
to refresh the page yourself every few minutes.

You paste one or more Doctolib search URLs into a small web UI, and a background
worker re-checks each of them on a schedule (every 5 minutes by default). When a
slot shows up that it hasn't seen before, you get an email with a link straight
to it.

> **Note:** This is a personal project intended for low-volume, personal use.
> Please be considerate of Doctolib's servers and terms of service when running
> it.

## How it works

The project runs as three containers, orchestrated with Docker Compose:

| Service    | What it does                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| `frontend` | A [TanStack Start](https://tanstack.com/start) + React (Mantine) web app where you manage the list of URLs to watch. Protected by OAuth login. |
| `worker`   | A [Bull](https://github.com/OptimalBits/bull)-based job runner that drives a headless Chromium (via Puppeteer) to load each search page, detect new results, and queue emails. |
| `valkey`   | A [Valkey](https://valkey.io) (Redis-compatible) instance used both as the Bull queue backend and to store your watch list and the set of already-seen results. |

The flow:

1. You log in to the web UI and submit a list of fully-qualified Doctolib search
   URLs (one per line). These are stored in Valkey.
2. Every 5 minutes the worker loads each URL in headless Chromium (emulating an
   iPhone), waits for the single-page app to render, and reads the appointment
   result cards.
3. Each result is fingerprinted (URL + date). On the first run it records a
   baseline silently; afterwards, any result it hasn't seen before triggers a
   notification email via Gmail SMTP.

## Requirements

- A host with [Docker](https://docs.docker.com/get-docker/) and Docker Compose.
- A **Gmail account** with an [app password](https://myaccount.google.com/apppasswords)
  for sending notification emails.
- An **OpenID Connect / OAuth provider** to gate access to the web UI. The app
  is configured for [Pocket ID](https://github.com/pocket-id/pocket-id) out of
  the box, but any generic OIDC provider works (see `auth.ts`).

## Configuration

Configuration is split between a `.env` file (non-secret settings) and Docker
secrets (sensitive values).

### 1. Environment file

Copy the example and fill it in:

```sh
cp .env.example .env
```

| Variable                   | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `GMAIL_USER`               | The Gmail address used to send notifications.                |
| `NODEMAILER_FROM_ADDRESS`  | The "From" address on notification emails.                   |
| `NODEMAILER_TO_ADDRESS`    | The address that should receive notifications (i.e. you).    |
| `OAUTH_CLIENT_ID`          | OAuth client ID registered with your OIDC provider.          |
| `OAUTH_ISSUER`             | Base URL of your OIDC provider (used for OpenID discovery).  |

A couple of additional environment variables are consumed at runtime:

- `TZ` — the timezone for the containers (e.g. `Europe/Berlin`). Set it in your
  shell or `.env` so scheduling and email timestamps are sensible.
- `BASE_URL` — the public URL the frontend is served from, required by the auth
  layer. Set this for production deployments.
- `BETTER_AUTH_TRUSTED_ORIGINS` — optional, comma-separated list of trusted
  origins for auth.

### 2. Secrets

Sensitive values are mounted as [Docker secrets](https://docs.docker.com/engine/swarm/secrets/)
from the `secrets/` directory (these files are git-ignored). Create the
following three files:

```sh
# Gmail app password (NOT your normal account password)
printf '%s' 'your-gmail-app-password' > secrets/GMAIL_PASS

# Session signing secret
openssl rand -hex 32 > secrets/AUTH_SECRET

# OAuth client secret from your OIDC provider
printf '%s' 'your-oauth-client-secret' > secrets/OAUTH_CLIENT_SECRET
```

## Running it

### Production

Build and start the stack:

```sh
docker compose up -d --build
```

The frontend listens on port `5555` inside its container but is **not** published
to the host in `compose.yaml` — the expectation is that you put it behind your
own reverse proxy (Caddy, Traefik, nginx, etc.) that terminates TLS and forwards
to the `frontend` service. Make sure `BASE_URL` matches that public URL.

Tagged releases (`v*.*.*`) are also built and published to the GitHub Container
Registry via GitHub Actions, so you can pull a pre-built image instead of
building locally if you prefer.

### Development

A development compose overlay is provided that enables file watching and exposes
ports directly:

```sh
yarn dev
```

This runs `docker compose -f compose.yaml -f compose.dev.yaml up`, which:

- serves the frontend with Vite's dev server on [http://localhost:3000](http://localhost:3000),
- runs the worker with `--watch` for live reloads,
- exposes Valkey on `localhost:6379`.

## Usage

1. Open the web UI and log in through your OAuth provider.
2. On the home page, paste the Doctolib search URLs you want to watch — one
   fully-qualified URL per line — and submit. To get a URL, perform a search on
   Doctolib (specialty, location, etc.) and copy the resulting page URL.
3. The `/browse` page lists your currently watched URLs as clickable links.
4. From then on, you'll receive an email whenever a new appointment appears for
   any of those searches. (You'll also get a "Crawler is live" email when the
   worker starts.)

### Trying a search from the command line

You can test the scraping logic against one or more URLs without the full stack
using the bundled script (runs a non-headless browser so you can watch it):

```sh
node ./bin/search.ts --url "https://www.doctolib.de/..." --url "https://..."
```

## Caveats

- Doctolib is a single-page app and the markup it renders is not a stable, public
  API. If Doctolib changes their front-end, the result-detection selectors in
  `lib/searchLatestResults.ts` may need updating.
- This tool only tells you that a slot *appeared*; you still need to be quick to
  actually book it.
