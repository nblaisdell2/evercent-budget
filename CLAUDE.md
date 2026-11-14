# CLAUDE.md

Guidance for AI coding assistants working in this repository. The person you're
helping may not be an experienced developer: explain what you're about to do in
plain language, prefer the npm scripts below over ad-hoc commands, and confirm
before anything that changes or deletes things on Railway.

## What this project is

A Next.js (App Router, TypeScript) site with a PostgreSQL database, hosted on
Railway. Project name: `evercent-budget`.

- `app/page.tsx`: the public landing page at `/` (sections in `features/landing/`).
- `app/(app)/`: the signed-in app: `/budget`, `/automation`, `/reporting`. The
  `(app)` folder is a route group and isn't part of the URL.
- `app/sign-in/`, `app/sign-up/`: Clerk's cards in EverCent's frame (`features/auth/`).
- `app/api/health` is Railway's health check; keep it. It returns 503 if the
  Clerk keys are missing, so a misconfigured deploy never takes traffic.
- `components/` + `features/budget/`: the budget UI, styled with Tailwind v4. Design
  tokens and the global size setting (`--ui-scale`) are in `app/globals.css`.
- `lib/data/placeholder/`: the hard-coded sample budget data the UI shows.
  `lib/data/budget-repository.ts` is where real budget data would plug in.
- Auth is Clerk (`@clerk/nextjs` v7, "Core 3"): `proxy.ts` (Next 16's name for
  middleware) runs `clerkMiddleware`; `lib/auth/routes.ts` holds the sign-in
  URLs and `PROTECTED_PREFIXES`; `lib/auth/appearance.ts` holds Clerk's colors and
  wording; `lib/data/users.ts` has `ensureUser()`, which every signed-in page
  calls first and which keeps the `users` table in step with Clerk.
- `lib/db.ts`: the only way app code talks to Postgres. Use `query<T>(sql, params)`.
- `db/migrations/NNNN_name.sql`: the database schema, applied in filename order by
  `db/migrate.mjs`, which records each file in `schema_migrations`.
- `.railway/railway.ts`: Railway infrastructure-as-code (Postgres + `web` service).
- `Dockerfile`: how Railway builds and runs the app.
- `scripts/*.ps1` + `scripts/*.sh`: setup and Railway helpers (identical behavior).

## Commands

| Task | Command |
|------|---------|
| First-time local setup | `npm run setup` (needs a local Postgres; see README Quick start) |
| Run locally | `npm run dev`, then http://localhost:3000 |
| Check the code | `npm run lint` and `npm run build` (both must pass before pushing) |
| Apply migrations locally | `npm run migrate` |
| First deploy to Railway | `npm run railway:setup` |
| Deploy changes | commit and `git push` to `main` (Railway deploys automatically) |
| Deploy local folder now | `npm run railway:deploy` |
| Add a custom domain | `npm run railway:domain -- www.example.com` |
| Railway logs | `railway logs --service web` (add `--build` for build logs) |

## How to make common changes

**Add a page.** Create `app/<route>/page.tsx`. Pages that read the database must
`export const dynamic = "force-dynamic";` and call `query()` from `@/lib/db`
on the server. Interactive pieces go in a separate `"use client"` component
(see `components/ui/rail-section.tsx`).

**Add a signed-in page.** Put it under `app/(app)/<route>/page.tsx`, add the
route to `PROTECTED_PREFIXES` in `lib/auth/routes.ts`, and start the page with
`const user = await ensureUser();` (from `@/lib/data/users`). Scope every query
to `user.id`, never to an id that came from the request. Public pages (landing,
sign-in) stay outside `(app)`. Clerk components and `<Show when=...>` come from
`@clerk/nextjs`; server helpers (`auth`, `currentUser`) from `@clerk/nextjs/server`.

**Add an API route.** Create `app/api/<name>/route.ts` exporting `GET`/`POST`/...
with `export const dynamic = "force-dynamic"; export const runtime = "nodejs";`.
Validate input and always use parameterized SQL (`$1`, `$2`), never string concatenation.

**Change the database.** Add a NEW file `db/migrations/000N_description.sql`
(next number), then `npm run migrate`. Never edit or rename a migration that's
already been applied anywhere. Railway runs migrations before each deploy, and a
failing migration fails the deploy. Keep changes compatible with the currently
running code (add before use, remove after the code stops using it).

**Change infrastructure** (env vars, replicas, health check, new services).
Edit `.railway/railway.ts`, run `railway config plan`, show the person the plan,
and only then `railway config apply`. Pushing to GitHub does NOT apply infra
changes. On Windows with the npm-installed CLI, `railway config` fails a bogus
version check unless `$env:_` points at the real `railway.exe` (see README
"Design decisions and gotchas"); `Invoke-RailwayConfig` in
`scripts/lib/common.ps1` does this. Don't set values that equal Railway's
defaults (e.g. restart policy): they show as a change on every apply.

**Domains** are not declared in `service()`; Railway's IaC can't create them.
Use `npm run railway:domain -- <domain>`, which attaches it and records
`CUSTOM_DOMAIN` in `railway.ts`.

## Rules

- Never commit `.env` or any credential. Railway provides `DATABASE_URL` via a
  reference variable; don't hardcode connection strings anywhere.
- Clerk keys live in `.env.local` locally (never `.env`, which `npm run setup`
  rewrites) and never in git. Don't read, print, or copy `CLERK_SECRET_KEY`; ask
  the person to paste it. On Railway it must be declared with `preserve()` in
  `railway.ts` and set via `railway variables`, so the value never enters git.
- Never create a database pool at module top level; `next build` must work
  without `DATABASE_URL`. Use `lib/db.ts`.
- Never hardcode the port: Railway injects `PORT`.
- Keep `DATABASE_SSL=disable` for Railway's private network; `require` is only for
  a temporary public TCP proxy, which doesn't exist by default.
  Don't open one permanently; see README "Cost and teardown".
- Removing a resource from `.railway/railway.ts` and applying DELETES it on
  Railway, including the Postgres database and its data. Never pass
  `--confirm-destructive` and never run `npm run railway:destroy` or
  `railway delete` without the person's explicit go-ahead.
- When you change a script, change both the `.ps1` and the `.sh` version.
- Run `npm run lint` and `npm run build` before committing.
