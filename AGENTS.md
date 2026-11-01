# Community Admin: app-level agent notes

Read `../AGENTS.md` before working here. It is the canonical guide for the
`CRM/` workspace: architecture, repository boundaries, definitions-module
conventions, sign-in, subscription, and tenant rules, and verification
requirements. This file adds app-specific facts only. If anything here seems to
conflict, `../AGENTS.md` and the user's current request take precedence. In a
standalone clone without the parent folder, get the canonical `AGENTS.md` from
the workspace instead of assuming it exists.

- **Target:** a chat started in this directory targets Community Admin, the
  administration product for the community mobile app (npm package
  `ability-community-admin`, local port 3200). Do not change sibling apps
  unless the request names them.
- **Scope:** Amer CRM's module inventory is a reference, not this product's
  scope. Community Admin's scope comes from the community app requirements and
  its own agreed contracts. Mobile resident/guest access is separate from the
  client's web access through the Portal.
- **Independence:** this app has its own manifest, lockfile, environment files,
  build output, and local Git repository. Never import runtime code from
  `../Amer-CRM`, `../Ability-CRM`, or `../Ability-Portal`. Copy and adapt
  reference code when useful, and record its source in `../docs/MIGRATION.md`.
- **Status (2026-11-01):** the placeholder page sits behind the Portal's
  session cookie; there is no business module or API client yet. Checked end
  to end against contract stand-ins. Do not expose protected features without
  the check, and do not add a stub, bypass, or demo mode.
- **Sign-in and access** (decided 2026-11-01; rules in `../AGENTS.md`): users
  sign in once, on Ability Portal, through the portal backend; this app has
  no password form and keeps no passwords. It reads the Portal's
  `ability_portal_session` cookie and never sets or deletes it. Mobile
  residents and guests are not Portal users (see Scope).
  - `src/proxy.ts`: without the cookie, redirects straight to
    `<PORTAL_URL>/<locale>/sign-in?returnTo=<this page>`. This is only an
    optimistic check.
  - `src/lib/sessionDetails.ts`: reads and validates the cookie (the sign-in's
    `session`, with the same rules as the Portal's `src/lib/signInAnswer.ts`
    and Ability CRM's `src/lib/sessionDetails.ts`; keep them in step).
    `src/lib/session.ts` reads it once per render.
  - `src/lib/access.ts` (server-only): `requireProductAccess(locale)` redirects
    signed-out users to the Portal and returns `available` when the sign-in's
    `platforms` lists `community-admin`, `denied` otherwise, or
    `sign-in-unavailable` when `PORTAL_URL` isn't set. Every protected page and
    data request calls it first, not only a layout. Until this app has an API,
    the cookie is its only check; that API must check the backend's
    `access_token` on every call.
  - `src/components/`: `AccessNotice.tsx` (not available, or sign-in not
    configured), `AccountBar.tsx` (who is signed in and their role, with a
    link back to the Portal), and `LocaleLinks.tsx`.
- **Structure:** follow Amer CRM's definitions module (route-colocated
  `hooks/`, `components/`, `schema.ts`, `types.ts`, `utils.ts`; entity API
  operations in `src/services/`; HTTP client and configuration in `src/lib/`).
  The `.gitkeep` folders mark that structure; they are not implemented modules.
- **Imports** use the root-based alias `"@/*": ["./*"]`, e.g.
  `@/src/i18n/routing`.
- **Locales:** routing lives in `src/proxy.ts` (the Next.js 16 name for
  middleware) and `src/i18n/`. `src/app/[locale]/layout.tsx` is the root
  layout, and the request locale comes from `next/root-params`. English is the
  default; Arabic renders right-to-left. This app owns `messages/en.json` and
  `messages/ar.json`.
- **Environment** (`.env.example`): `PORTAL_URL`, server-only and read at
  runtime. Never reuse Amer CRM's API URL, cookies, or credentials.
  Document new keys in `.env.example` with placeholder values.
- **Tests:** `npm test` runs Vitest (`vitest.config.mts`) on
  `src/**/*.test.ts`; `test/server-only.ts` stands in for `server-only`. The
  tests cover the session cookie and the Portal URLs.

Commands, from this directory (details in `README.md`):

```bash
npm ci
cp .env.example .env.local   # Portal settings
npm run dev -- --port 3200
npm run lint
npm run typecheck
npm test
npm run build
npm run start -- --port 3200
```

State, decisions, and the Community Admin tracker: `../docs/MIGRATION.md`.
Workspace commands: `../README.md`.

The block below is managed by Next.js: `next dev` re-adds it when it is missing
or outdated. Keep it unchanged.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
