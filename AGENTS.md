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
  `ability-community-admin`, local port 9993). Do not change sibling apps
  unless the request names them.
- **Scope:** Amer CRM's module inventory is a reference, not this product's
  scope. Community Admin's scope comes from the community app requirements and
  its own agreed contracts. Mobile resident/guest access is separate from the
  client's web access through the Portal.
- **Independence:** this app has its own manifest, lockfile, environment files,
  and build output. Never import runtime code from `../Amer-CRM`,
  `../Ability-CRM`, `../Ability-Portal`, or `../ability-crm-api`. Copy and adapt
  reference code when useful, and record its source in `../docs/MIGRATION.md`.
- **Repositories (the user's arrangement, 2026-11-19):** this folder is in
  both the `CRM/` monorepo and its own repository (`origin`
  `Ability-Tech-Team/ability-admin`, nested here since 2026-11-17, with the
  same files). Git run here resolves to the nested one; `git status` from
  `CRM/` shows the monorepo's view. The user commits and pushes in both;
  leave changes uncommitted (`../AGENTS.md`, Read first).
- **Status:** the admin shell (side menu and navbar, 2026-11-11) and the
  team's dashboard, master-data, operations, and notifications screens
  (merged 2026-11-16) are behind the Portal's session cookie. Since
  2026-11-22 every screen with an API route loads from the API in the browser:
  the dashboard, projects, units, customers, unit assignment, family members,
  rental management, service requests, complaints, invoices, guest
  invitations, sending notifications, events, news, guidelines, the phone
  directory and About Us (branding), plus the side-menu and tab counts.
  Since 2026-11-23 the forms' choice lists come from the definitions routes
  (`GET /admin/definitions/all-dropdowns`, `/definitions/services`; the CRM's
  shared `libs/domain/src/definitions`), through `src/services/definitions.ts`
  and `src/hooks/useDropdowns.ts`. They feed Add/Edit Customer, Add Unit, New
  Request, New Complaint, Generate Invoice and the invoice-type filter. The
  forms acting for a resident pick an owned unit with
  `src/components/OwnedUnitPicker.tsx` (`useOwnedUnitSearch`) and save to the
  unit's project; Add Customer and Add Unit save to the chosen project (or,
  if the project list is refused, the sign-in project,
  `readBrowserApiConfig().sessionProject`). Controls whose route doesn't
  exist yet stay visible but disabled with a "not available yet" title (e.g.
  Save Draft on the notification form). The sent-notifications list, its tab
  count and Delivery Logs load from `GET /admin/notifications` (one entry per
  send, with read counts and push results). Screens with no admin routes at all still
  show sample data: Users, Roles & Permissions, Audit Log, Notification
  Templates, and Settings (`src/services/*.ts` marked `TODO: replace with
  real API call`).
- **API plumbing** (shared by every screen): `src/lib/apiConfig.ts`
  (`readBrowserApiConfig`, called by pages after the access check),
  `src/hooks/useApiQuery.ts` (reads), `useApiMutation.ts` (saves),
  `useApiDownload.ts` (exports and import error reports, sent with the page's
  language), `useDebouncedValue.ts`, `src/lib/apiFailure.ts` with
  `src/components/ApiFailureNotice.tsx`, and `src/components/Pagination.tsx`.
  The one project list for pickers is `fetchProjectOptions` in
  `src/services/projects.ts` (`GET /projects/accessible`, open to every
  employee: all projects for the Super Admin, else the sign-in project plus
  the employee's other granted projects). Never add sample or fallback data to a connected screen. The app reads its API address from the sign-in and has the local
  dev proxy (below). Do not expose protected features without the check, and
  do not add a stub, bypass, or demo mode.
- **Backend:** this app's API is `../ability-crm-api/apps/community-admin`
  (prefix `/admin`, port 5556), with shared modules in its `libs/domain` and
  `libs/core`. The screens call it through `src/lib/apiClient.ts`
  (`apiGet`/`apiPost`/`apiPut`/`apiDelete`/`apiDownload`, the envelope,
  `ApiError`) and one `src/services/<entity>.ts` per entity, which parses each
  answer with zod. Calls are made from the browser, which alone holds the
  API's `access_token` cookie. The admin API also serves the shared orders,
  rentals and imports routes (`libs/domain`), whose `@RequirePermission`
  checks don't run there because `PermissionsGuard` is commented out. Read a route's controller, DTOs, and guards
  before calling it. The mobile app's API is the separate
  `community-api` (`/app`). Rules for changing the backend are in
  `../AGENTS.md` ("The backend repository").
- **Sign-in and access** (decided 2026-11-01; rules in `../AGENTS.md`): users
  sign in once, on Ability Portal, through the portal backend; this app has
  no password form and keeps no passwords. It reads the Portal's
  `ability_portal_session` cookie and never sets or deletes it. Mobile
  residents and guests are not Portal users (see Scope).
  - `src/proxy.ts`: without the cookie, redirects straight to
    `<PORTAL_URL>/<locale>/sign-in?returnTo=<this page>`. This is only an
    optimistic check. The page's address comes from `requestOrigin` in
    `src/lib/portal.ts` (`X-Forwarded-Host` or `Host`), as in `entryUrl`;
    `request.nextUrl` reports the server's own address, such as
    `0.0.0.0:3000` in the container.
  - `src/lib/sessionDetails.ts`: reads and validates the cookie (the sign-in's
    `session`, with the same rules as the Portal's `src/lib/signInAnswer.ts`
    and Ability CRM's `src/lib/sessionDetails.ts`; keep them in step).
    `src/lib/session.ts` reads it once per render.
  - `src/lib/access.ts` (server-only): `requireProductAccess(locale)` redirects
    signed-out users to the Portal and returns `available` when the sign-in's
    `platforms` lists `community-admin`, `denied` otherwise, or
    `sign-in-unavailable` when `PORTAL_URL` isn't set. Every protected page and
    data request calls it first, not only a layout. The pages don't call the
    API yet (only Contact support does), so the cookie is their only check. That API checks the backend's
    `access_token` on every call, but on 2026-11-19 it checked the role only
    on its Super Admin routes (dashboard, projects, sub-projects). Its
    privilege check (`PermissionsGuard`) was commented out, and it didn't
    check the `community-admin` platform (`../docs/MIGRATION.md`).
  - **The API address** (2026-11-11): `readApiBaseUrl()` in
    `src/lib/session.ts` returns the sign-in's
    `platforms[community-admin].apiUrl` only when `API_ALLOWED_URLS` lists it.
    The browser calls `browserApiBaseUrl(...)` from `src/lib/devApiProxy.ts`:
    under `next dev`, `/api/dev-proxy/admin/<n>`, which `next.config.ts`
    forwards to the n-th allowed address (same-origin requests only), so the
    backend's cookie lands on `localhost`; otherwise the API itself. Builds
    have no rewrites. Calls need `credentials: "include"`.
  - `src/components/`: `AccessNotice.tsx` (not available, or sign-in not
    configured), `AccountBar.tsx` (who is signed in and their role, with a
    link back to the Portal), and `LocaleLinks.tsx`.
  - **The admin shell** (`src/app/[locale]/(app)/layout.tsx`): it runs
    `requireProductAccess` and draws `SideMenu.tsx` and `Navbar.tsx`
    (`src/components/`, icons in `src/components/icons/`) only when the
    status is `available`; otherwise the page alone shows the notice. The
    navbar shows the session's user (never a fixed name).
    - The menu's entries are in `src/lib/sideMenuItems.ts`: `href: "#"` for
      modules not built yet, and a `badge` only from real API counts.
    - On narrow screens the menu starts collapsed and, once opened, covers
      the page.
    - Labels come from the `SideMenu` and `Navbar` catalog namespaces.
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
- **Environment** (`.env.example`): `PORTAL_URL` and `API_ALLOWED_URLS`,
  server-only and read at runtime. Never reuse Amer CRM's API URL, cookies, or credentials.
  Document new keys in `.env.example` with placeholder values.
- **Container** (README.md, Container): `Dockerfile` (the standalone server,
  built with `NEXT_OUTPUT=standalone`; `next.config.ts` keeps the regular
  output otherwise), `.dockerignore` (no env file enters the image), and
  `scripts/docker.sh`, run by `npm run docker:prod:update`, `docker:prod`,
  `docker:prod:build`, `docker:prod:logs`, and `docker:prod:stop`. The
  container reads `.env.production` when it starts and is ready when
  `/aws/health-check` answers. Reading the scripts doesn't authorize
  running them; Docker isn't installed on the development Mac.
- **Tests:** `npm test` runs Vitest (`vitest.config.mts`) on
  `src/**/*.test.ts`; `test/server-only.ts` stands in for `server-only`. The
  tests cover the session cookie, the Portal URLs, the request origin, the
  API client's envelope handling, and the support request rules.

Commands, from this directory (details in `README.md`):

```bash
npm ci
cp .env.example .env.local   # Portal settings
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

State, decisions, and the Community Admin tracker: `../docs/MIGRATION.md`.
Workspace commands: `../README.md`.

The block below is managed by Next.js: `next dev` re-adds it when it is missing
or outdated. Keep it unchanged.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
