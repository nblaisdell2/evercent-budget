# CLAUDE.md

Guidance for AI coding assistants working in this repository. The person you're
helping may not be an experienced developer: explain what you're about to do in
plain language, prefer the npm scripts below over ad-hoc commands, and confirm
before anything that changes or deletes things on Railway.

## What this project is

EverCent: a zero-based budget that runs on the user's pay schedule. A Next.js
(App Router, TypeScript) site with a PostgreSQL database, hosted on Railway.
Project name: `evercent-budget`.

- `app/page.tsx`: the public landing page at `/` (sections in `features/landing/`).
- `app/(app)/`: the signed-in app: `/budget`, `/automation`, `/reporting`. The
  `(app)` folder is a route group and isn't part of the URL.
- `app/sign-in/`, `app/sign-up/`: Clerk's cards in EverCent's frame (`features/auth/`).
- `app/api/health` is Railway's health check; keep it. It returns 503 if the
  Clerk keys are missing, so a misconfigured deploy never takes traffic.
- `components/` + `features/budget/`: the budget UI, styled with Tailwind v4. Design
  tokens and the global size setting (`--ui-scale`) are in `app/globals.css`.
- `lib/domain/`: the budget's rules as plain TypeScript (types, pill states, selection).
- `lib/data/budget-repository.ts`: every read the budget page does. It still
  returns the hard-coded sample data in `lib/data/placeholder/`.
- `lib/services/`: database operations (writes and business reads), e.g. `users.ts`.
- `lib/validation/`: Zod schemas for input (`common.ts`: cents, month, date, id, name).
- `lib/db/`: the only way app code talks to Postgres (Kysely; see "Database").
- Auth is Clerk (`@clerk/nextjs` v7, "Core 3"): `proxy.ts` (Next 16's name for
  middleware) runs `clerkMiddleware`; `lib/auth/routes.ts` holds the sign-in
  URLs and `PROTECTED_PREFIXES`; `lib/auth/appearance.ts` holds Clerk's colors and
  wording; `lib/data/users.ts` has `ensureUser()`, which every signed-in page
  calls first and which keeps the `users` table in step with Clerk.
- `db/migrations/NNNN_name.sql`: the database schema, applied in filename order by
  `db/migrate.mjs`, which records each file in `schema_migrations`.
- Error monitoring is Sentry: `lib/sentry.ts` (shared settings, including
  privacy), `instrumentation-client.ts` (browser), `sentry.server.config.ts`,
  `sentry.edge.config.ts`, `instrumentation.ts`, `app/global-error.tsx`, and
  `withSentryConfig` in `next.config.mjs`. See "Error monitoring (Sentry)".
- Tests: `*.test.ts(x)` next to the code they test (Vitest), `e2e/` (Playwright).
- `.github/workflows/ci.yml`: checks every push; Railway waits for it before deploying.
- `.railway/railway.ts`: Railway infrastructure-as-code (Postgres + `web` service).
- `Dockerfile`: how Railway builds and runs the app.
- `scripts/*.ps1` + `scripts/*.sh`: setup and Railway helpers (identical behavior).

## Product decisions

- **Transactions are entered by hand, on purpose.** Typing each one keeps
  people aware of what they have available. Don't propose or build bank
  connections (Plaid, SimpleFIN, Teller) or automatic imports.
- **Automations run as Railway cron jobs.** Work that must happen without the
  person opening the app (funding bills on payday, for example) runs as a
  Railway scheduled job, hourly at the top of the hour. Not built yet; see
  "Scheduled jobs (Railway cron)". Don't add a job queue (pg-boss, BullMQ,
  Redis) or an always-running worker for this.

## Architecture: rules that keep later work easy

1. **Money is whole cents everywhere.** The `Cents` type (a number) in
   TypeScript, a `BIGINT` column named `*_cents` in Postgres, and
   `centsSchema` when validating. Never store or calculate money as fractional
   dollars, floats or `NUMERIC`. Turn cents into "$1,234.56" only at the
   moment of display, with `formatCents` from `lib/format/currency.ts`; read
   typed amounts with `parseCents`.
2. **Business rules live in plain TypeScript, outside components.** Put
   calculations and decisions in `lib/domain/` (or a reducer such as
   `features/budget/table/table-reducer.ts`) as pure functions, and have
   components only display the result. Components never sum, total or decide
   anything themselves; if a component needs a number, the data layer or a
   domain function provides it.
3. **All data reads go through one swappable place.** Pages get their data
   from a repository (`lib/data/budget-repository.ts`), never by querying in a
   component or page. Swapping placeholder data for real queries happens
   inside the repository; no component changes.
4. **Writes go through services.** A service in `lib/services/` takes the
   signed-in user's `user.id` plus input that has already been validated, and
   talks to the database. The entry points (page, server action, API route,
   scheduled job) do the signing-in check and the Zod validation, then call
   the service. That way one operation serves the website now and the mobile
   app later.

These layers are enforced by ESLint (`eslint.config.mjs`):

| Folder                                                  | May import            | May not import                      |
| ------------------------------------------------------- | --------------------- | ----------------------------------- |
| `lib/domain/`, `lib/format/`, `lib/validation/`         | each other, Zod       | React, Next.js, Clerk, the database |
| `lib/services/`, `lib/data/*-repository.ts`             | the above, `@/lib/db` | React, Next.js, Clerk               |
| `app/`, `components/`, `features/`, `lib/data/users.ts` | anything              |                                     |

### Getting ready for the mobile app (Expo)

A native Android app (iOS later) will be built with **Expo (React Native)**
in this same repository. It is NOT set up yet: don't add Expo or React
Native packages until the person asks. Until then, build so that it's easy:

- The shareable code is everything in the "May not import React, Next.js..."
  row above. Keep logic there, not in components or route files; the phone
  app will reuse it, while its screens will be written fresh.
- Every operation the app performs should be reachable over plain HTTP. Server
  actions are fine for the website, but they call a service, so adding an
  `app/api/...` route for the phone later is a few lines (see "Add an API
  route").
- API routes authenticate with Clerk's `auth()`, which also accepts the
  session token the Expo app will send in an `Authorization: Bearer` header.
- Calendar days travel as `"YYYY-MM-DD"` text, money as cents, ids as numbers,
  and nothing shared depends on the browser (`window`, `localStorage`, CSS).
- Animation timing lives in `lib/motion.ts` as plain numbers so the phone app
  can match it.

## Database

`import { db } from "@/lib/db"` gives a **Kysely** query builder: queries read
like SQL, and TypeScript checks table names, columns and result types against
`lib/db/schema.ts`. It isn't an ORM; there are no models. For the rare query
the builder can't express, use Kysely's `sql` template tag
(`import { sql } from "kysely"`). Both always send parameterized SQL; never
build SQL by joining strings.

- After adding a migration: `npm run migrate`, then `npm run db:types` to
  regenerate `lib/db/schema.ts` (never edit it by hand). CI fails if it's stale.
- What the driver returns (`lib/db/pg-types.ts`): `BIGINT` -> number (throws
  instead of losing precision), `DATE` -> `"YYYY-MM-DD"` text,
  `TIMESTAMPTZ` -> `Date`.
- Column types: money `BIGINT` (`amount_cents`), ids `BIGSERIAL`, calendar days
  (paydays, due dates) `DATE`, moments in time `TIMESTAMPTZ`. Never `TIMESTAMP`
  without time zone, and never `NUMERIC`/`REAL` for money.
- Scope every query to the signed-in user's `user.id`, never to an id that came
  from the request alone.

## Validation (Zod)

Every server action and API route validates its input with a Zod schema built
from `lib/validation/common.ts` before doing anything else. Use `safeParse` and
return the field errors, so the form can show them:

```ts
// app/(app)/budget/actions.ts
"use server";
import { z } from "zod";
import { ensureUser } from "@/lib/data/users";
import { setCategoryBudgeted } from "@/lib/services/budget";
import { centsSchema, idSchema, monthKeySchema } from "@/lib/validation/common";

const SetBudgeted = z.object({ categoryId: idSchema, month: monthKeySchema, cents: centsSchema });

export async function setBudgeted(raw: unknown) {
  const user = await ensureUser();
  const parsed = SetBudgeted.safeParse(raw);
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  await setCategoryBudgeted(user.id, parsed.data); // the service checks the category is this user's
  return { ok: true };
}
```

Put a schema that a form and its server action both need in `lib/validation/`.

## UI, styling and animation

- **Tailwind v4.** Use the standard scale (`gap-2`, `px-4`, `h-12`; any
  multiple of 0.25rem works, e.g. `px-2.25`) and the named tokens from
  `app/globals.css` (`text-row`, `h-control`, `rounded-card`,
  `bg-surface-panel`). Arbitrary values like `px-[0.875rem]` only when nothing
  fits (grid templates, one-off sizes on the landing page). Colors always come
  from tokens, never hex in a component.
- **`cn()` from `@/lib/cn`** to combine classes, and always for a component's
  `className` prop, so a caller's class replaces the component's own. When you
  add a `--text-*`, `--spacing-*`, `--radius-*` or `--font-*` token to
  `globals.css`, add its name to `lib/cn.ts` too (a test checks).
- **Prettier** formats code and sorts Tailwind classes: `npm run format`.
- **Base UI (`@base-ui/react`)** for interactive pieces: menus, dialogs,
  popovers, selects, comboboxes, tooltips, tabs, switches. Style its parts with
  the tokens; don't hand-build these (focus handling, keyboard support and
  screen-reader behavior are easy to get wrong). Its popups render outside the
  page's `data-app-root` wrapper (`app/layout.tsx`), so they always sit on top.
  Base UI's own docs are in `node_modules/@base-ui/react/docs/`.
- **Recharts** for charts, in a `"use client"` component, using the colors and
  styles in `components/charts/chart-theme.ts`.
- **Motion (`motion/react`)** for animation. **Before designing any new
  animation or transition, or reshaping a piece of UI, use the
  `frontend-design:frontend-design` skill**; the person relies on it for
  animation and design judgment. Then:
  - Take durations and easing from `lib/motion.ts` so everything feels alike.
  - Animate `transform` and `opacity`; use Motion's `layout` prop for rows
    moving or collapsing.
  - `MotionProvider` (in `app/layout.tsx`) already honors the system "reduce
    motion" setting; CSS animations must keep their `prefers-reduced-motion`
    guard too.
  - Simple hover and color changes stay as Tailwind `transition-colors`.
  - Animated pieces are small `"use client"` components.
  - For a Base UI popup, follow the "Motion" section of Base UI's animation
    handbook (`docs/react/handbook/animation.md`).
  - Between pages, use View Transitions rather than `AnimatePresence`, which
    is unreliable across App Router navigations.

## Error monitoring (Sentry)

Errors from the browser, the server and `proxy.ts` go to the Sentry project
`personal-soq/evercent-budget` automatically, as do traces (10% in production,
all of them locally), logs sent with `Sentry.logger`, and a masked replay of
the moments before a browser error. The DSN comes from `NEXT_PUBLIC_SENTRY_DSN`
(`.env.local` locally, `railway.ts` on Railway); without it Sentry is off, as in
CI and tests. Browser events go through the `/monitoring` route, which
`proxy.ts` skips.

**Privacy comes first: EverCent handles people's money.** `lib/sentry.ts` stops
Sentry from collecting IP addresses, emails, cookies, request and response
bodies, database query values and local variables, and only a few harmless
headers keep their values. Replay masks all text, inputs and images. Keep it
that way:

- Never loosen `SENTRY_PRIVACY` in `lib/sentry.ts` without the person's OK.
- Identify people only by their EverCent id (`ensureUser()` already calls
  `Sentry.setUser({ id })`). Never send emails, names, amounts, payees or
  category names to Sentry, in `setUser`, tags, `Sentry.logger` messages or
  their attributes, or error messages.
- Wrap each server action in
  `Sentry.withServerActionInstrumentation("actionName", { headers: await headers() }, async () => { ... })`
  for tracing. Don't pass its `formData` or `recordResponse` options; they
  would send what the person typed.
- Handled errors that should still be reported: `Sentry.captureException(error)`.
- Production stack traces need source maps, which the Railway build uploads
  when its `SENTRY_AUTH_TOKEN` variable is set (README "Error monitoring").
- The Sentry CLI isn't installed globally; run it as `npx sentry@0.49.0 ...`
  (for example `npx sentry@0.49.0 issue list personal-soq/evercent-budget`).
  If it says it isn't authenticated, ask the person to run
  `npx sentry@0.49.0 auth login` and approve the code in their browser.

## Scheduled jobs (Railway cron)

Automations (funding bills each payday, for example) will run as **Railway cron
jobs**: a separate service in `.railway/railway.ts` that Railway starts on a
schedule, which does its work and exits. Nothing is built yet. When the first
job is built:

- Schedule: hourly at the top of the hour, `deploy: { cronSchedule: "0 * * * *" }`.
  Railway schedules in UTC, may start a run a few minutes late, and skips a run
  if the previous one is still going. The job must exit when it's done.
- The job's work lives in `lib/services/` like any other operation; the cron
  entry point is a small script that calls it and exits. It runs outside
  Next.js, so the service must not import Next.js, React or Clerk (ESLint
  already enforces this).
- Every run must be safe to repeat: record what each run did with a unique key
  (for example user + pay date), so a retried or overlapping run can never
  fund a bill twice. Paydays are calendar days: compare `DATE` values, and
  remember that "today" in UTC isn't the person's today.
- Wrap the run in `Sentry.withMonitor("<job-name>", fn, { schedule: { type: "crontab", value: "0 * * * *" } })`
  so Sentry alerts you when a run fails or doesn't happen.
- It's an infrastructure change: show the `railway config plan` before applying.

## Testing

| Kind                   | Where                              | Run                                         |
| ---------------------- | ---------------------------------- | ------------------------------------------- |
| Logic (pure functions) | `*.test.ts` next to the code       | `npm test`                                  |
| React components       | `*.test.tsx` next to the component | `npm test`                                  |
| Database               | `*.db.test.ts`                     | `npm test` (skipped without `DATABASE_URL`) |
| Whole app in a browser | `e2e/*.spec.ts` (Playwright)       | `npm run test:e2e`                          |

**Propose tests for approval, but only when they're relevant.** When a task
adds or changes behavior worth protecting (a domain rule or calculation, a
service or database write, a validation rule, a user-facing flow, or a bug
fix), present the tests you plan to write before writing them: a short
numbered list, each with what it checks in plain language, the file, and the
kind (logic, component, database, end-to-end). Ask the person to approve,
reject or add to it, then write the approved ones and run them.

- Once per task, not on every message. Don't ask for styling, copy, docs,
  config, or refactors already covered by existing tests: just run the tests
  and say they passed.
- For a bug fix, propose a test that fails before the fix and passes after.
- Never delete, skip or loosen an existing test to make it pass without
  asking; a failing test is usually right.
- Tests that write to the database need a separate test database, which isn't
  set up yet. Propose setting it up when the first such test is approved.
- Signed-in end-to-end tests need `E2E_CLERK_USER_EMAIL` in `.env.local` (a test
  user in Clerk's development instance); without it they're skipped.

## Commands

| Task                            | Command                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| First-time local setup          | `npm run setup` (needs a local Postgres; see README Quick start) |
| Run locally                     | `npm run dev`, then http://localhost:3000                        |
| Check everything before pushing | `npm run check` (format, lint, types, tests, build)              |
| Format code                     | `npm run format`                                                 |
| Tests                           | `npm test` (`npm run test:watch` while working)                  |
| End-to-end tests                | `npm run test:e2e` (`npm run test:e2e:ui` to watch them)         |
| Apply migrations locally        | `npm run migrate`, then `npm run db:types`                       |
| First deploy to Railway         | `npm run railway:setup`                                          |
| Deploy changes                  | commit and `git push` to `main` (deploys after CI passes)        |
| Deploy local folder now         | `npm run railway:deploy`                                         |
| Add a custom domain             | `npm run railway:domain -- www.example.com`                      |
| Railway logs                    | `railway logs --service web` (add `--build` for build logs)      |

## How to make common changes

**Add a page.** Create `app/<route>/page.tsx`. Pages that read the database must
`export const dynamic = "force-dynamic";` and get their data from a repository
in `lib/data/` on the server. Interactive pieces go in a separate `"use client"`
component (see `components/ui/rail-section.tsx`).

**Add a signed-in page.** Put it under `app/(app)/<route>/page.tsx`, add the
route to `PROTECTED_PREFIXES` in `lib/auth/routes.ts`, and start the page with
`const user = await ensureUser();` (from `@/lib/data/users`). Public pages
(landing, sign-in) stay outside `(app)`. Clerk components and `<Show when=...>`
come from `@clerk/nextjs`; server helpers (`auth`, `currentUser`) from
`@clerk/nextjs/server`.

**Add a write (save, create, delete).** A service function in `lib/services/`
taking `(userId, input)`, a Zod schema, and a server action that validates and
calls the service (example under "Validation").

**Add an API route.** Create `app/api/<name>/route.ts` exporting `GET`/`POST`/...
with `export const dynamic = "force-dynamic"; export const runtime = "nodejs";`.
`proxy.ts` doesn't protect `/api`, so each route checks the user itself: with
the first signed-in API route, add a `requireApiUser()` beside `ensureUser()`
in `lib/data/users.ts` that does the same lookup but answers 401 instead of
redirecting. Then validate the body or query with Zod and call the same
service a server action would.

**Change the database.** Add a NEW file `db/migrations/000N_description.sql`
(next number), then `npm run migrate` and `npm run db:types`. Never edit or
rename a migration that's already been applied anywhere. Railway runs migrations
before each deploy, and a failing migration fails the deploy. Keep changes
compatible with the currently running code (add before use, remove after the
code stops using it).

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
  `SENTRY_AUTH_TOKEN` follows the same rule, except the person sets it
  themselves: never ask them to paste it into the conversation.
- Never create a database pool at module top level; `next build` must work
  without `DATABASE_URL`. Use `db` from `@/lib/db`, which connects lazily.
- Never hardcode the port: Railway injects `PORT`.
- Keep `DATABASE_SSL=disable` for Railway's private network; `require` is only for
  a temporary public TCP proxy, which doesn't exist by default.
  Don't open one permanently; see README "Cost and teardown".
- Removing a resource from `.railway/railway.ts` and applying DELETES it on
  Railway, including the Postgres database and its data. Never pass
  `--confirm-destructive` and never run `npm run railway:destroy` or
  `railway delete` without the person's explicit go-ahead.
- When you change a script, change both the `.ps1` and the `.sh` version.
- Run `npm run check` before committing; CI runs the same checks and Railway
  won't deploy a commit that fails them.
- Install new packages only at versions published at least two weeks ago
  (`npm install --before=<date two weeks back> <package>`). If npm then
  can't resolve the project's own newer packages (it reports e.g.
  `next@undefined`), install an exact version that old instead
  (`npm install <package>@<version> --save-exact`).
