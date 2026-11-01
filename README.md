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

## Structure

- `src/app/[locale]/` - root layout (`lang`/`dir`) and the placeholder page
- `src/proxy.ts` - locale routing, and the redirect to the Portal's sign-in
  for visits without a session cookie
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
- Empty folders with `.gitkeep` mark the planned architecture (`(app)`,
  `(auth)`, `components/ui`, `hooks`, `store`, `public`); they are not
  implemented modules.

Imports use the root-based alias `@/src/...` (`"@/*": ["./*"]`).

## Repository

This directory is its own local Git repository, with one local commit and no
remote. It shares no history or remote with Amer CRM or the other apps.
