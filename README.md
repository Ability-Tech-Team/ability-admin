# Community Admin

Community Admin is Ability-Tech's administration product for the community
mobile app. Client organizations buy it separately from, or together with,
Ability CRM. Its page is still a placeholder behind the sign-in: users sign
in on Ability Portal through the portal backend, and this app opens only when
the sign-in lists `community-admin` for the user. It has no business module or
business API client yet. Mobile resident and
guest access is separate and not part of this sign-in.

Read `../AGENTS.md` (shared project instructions) and `../docs/MIGRATION.md`
(recorded state, decisions, and the Community Admin tracker) before working
here. Amer CRM (`../Amer-CRM`) is a behavioral reference only; its module list
is not this product's scope.

## Local development

Requires Node.js 22.12 or newer (the Vitest 5 test runner; Next.js alone
needs 20.9 or newer) and npm. Verified with Node.js 22.23.2.

From `CRM/`:

```bash
npm --prefix Ability-Community-Admin ci
cp Ability-Community-Admin/.env.example Ability-Community-Admin/.env.local
npm --prefix Ability-Community-Admin run dev -- --port 3200
```

Or from this directory: `npm ci`, then `npm run dev -- --port 3200`.
Open <http://localhost:3200>. Without a session you are sent to the
Portal's sign-in page (port 3300) and brought back afterwards; signed in, `/`
redirects to `/en` (or the browser's preferred supported locale), and `/ar`
renders right-to-left. Ability Portal (`../Ability-Portal`) links here by
default. Signing in needs the Portal and the portal backend (see
`../README.md`).

| Task | Command (from this directory) |
| --- | --- |
| Lint (ESLint) | `npm run lint` |
| Type check (`tsc --noEmit`) | `npm run typecheck` |
| Unit tests (Vitest) | `npm test` |
| Production build | `npm run build` |
| Production server | `npm run start -- --port 3200` |

## Environment

| Variable | Local value | Purpose |
| --- | --- | --- |
| `PORTAL_URL` | `http://localhost:3300` | Where signed-out users sign in |

It is server-only and read at runtime. Without it, signed-out visits get
"Sign-in isn't available" instead of the product.

The sign-in itself comes from the Portal's `ability_portal_session` cookie
(the portal backend's answer), on the same host locally and on the shared
parent domain when deployed. Until this app has its API, that cookie listing
`community-admin` is its only access check. This app never uses Amer CRM's API
URL, cookies, or secrets. Keep real values in ignored `.env*` files and add
sanitized keys to `.env.example`.

## Container

To run the app as a standalone container on a server with Docker and curl,
from this directory:

```bash
cp .env.example .env.production   # this server's values, without quotes
npm run docker:prod:update
```

| Command | What it does |
| --- | --- |
| `npm run docker:prod:update` | Builds a new image, checks it in a private preview container, then switches port 3200 to it. The running container serves until then and comes back if the new one doesn't answer. Also does the first deploy |
| `npm run docker:prod:build` | Builds the image only |
| `npm run docker:prod` | (Re)starts the container from the last image, e.g. after changing `.env.production` |
| `npm run docker:prod:logs` | Follows the container's logs |
| `npm run docker:prod:stop` | Stops and removes the container; the images stay |

- **Image:** the `Dockerfile` builds the standalone server on Node.js 22
  Alpine (`NEXT_OUTPUT=standalone`; `npm run build` keeps the regular output
  for `next start`). It runs as the unprivileged `node` user on port 3000
  inside the container.
- **Settings:** the image holds no env file (`.dockerignore`). The container
  reads `.env.production` when it starts (`docker run --env-file`), so one
  image serves every environment. Docker reads the file literally, so write
  values without quotes; the script refuses quoted ones.
- **Readiness:** `GET /aws/health-check`, for the script's switch and the
  image's `HEALTHCHECK`.
- **Options:** `PORT` (host port, default 3200), `ENV_FILE` (default
  `.env.production`), `IMAGE` and `NAME` (default `ability-community-admin`),
  `STARTUP_TIMEOUT` (60 seconds), and `KEEP_RELEASES` (3), e.g.
  `PORT=8080 npm run docker:prod:update`.
- **Releases:** each image is tagged `ability-community-admin:<UTC time>-<commit>` and
  `ability-community-admin` (the last one built or deployed); the 3 newest release tags are
  kept. To go back by hand:
  `docker tag ability-community-admin:<older tag> ability-community-admin && npm run docker:prod`.
- **Network:** `docker build` downloads the npm packages.
- **Behind a load balancer or reverse proxy** that terminates HTTPS, forward
  `Host` (or `X-Forwarded-Host`) and `X-Forwarded-Proto`. The app builds the
  addresses it sends users back to from them.

## Structure

- `src/app/[locale]/` - root layout (`lang`/`dir`) and the placeholder page
- `src/proxy.ts` - locale routing, and the redirect to the Portal's sign-in
  for visits without a session cookie; it returns to the page at the address
  the browser used (`requestOrigin` in `src/lib/portal.ts`), not the server's
  own address
- `src/app/aws/health-check/route.ts` - `GET /aws/health-check` answers 200
  with `{"status":200}` for the load balancer, as in Amer CRM (no locale or
  session)
- `src/lib/access.ts` - the access check every page runs (server-only)
- `src/lib/sessionDetails.ts`, `session.ts` - read and validate the Portal's
  session cookie (tested)
- `src/lib/portal.ts`, `baseUrl.ts` - the Portal's sign-in and home links
- `src/components/AccessNotice.tsx`, `AccountBar.tsx`, `LocaleLinks.tsx` -
  the access page, who is signed in, and the language links
- `src/i18n/` - locale routing, navigation, request config
- `messages/en.json`, `messages/ar.json` - this app's translation catalogs
- `test/server-only.ts` - stands in for `server-only` in unit tests
- `Dockerfile`, `.dockerignore`, `scripts/docker.sh` - the standalone
  container and the `docker:prod:*` scripts (see [Container](#container))
- Empty folders with `.gitkeep` mark the planned architecture (`(app)`,
  `(auth)`, `components/ui`, `hooks`, `store`, `public`); they are not
  implemented modules.

Imports use the root-based alias `@/src/...` (`"@/*": ["./*"]`).

## Repository

This directory is its own Git repository, with its own `origin` remote on
GitHub (`Ability-Tech-Team`). It shares no history or remote with Amer CRM or
the other apps.
