# Next.js + Railway Site Template

A starting point for any server-rendered **Next.js** (App Router) site with a
**PostgreSQL** database, hosted on **[Railway](https://railway.com)**. The whole
loop is: _use the template → one setup command → one deploy command → push to
`main`_. You end up with a live site on HTTPS, optionally on your own domain.

The site is **EverCent**: a public landing page at `/`, sign-in through
[Clerk](https://clerk.com), and the budget app at `/budget` (plus `/automation`
and `/reporting`) for signed-in users. The budget's numbers are still hard-coded
sample data; the database holds the user records so far. See
[Accounts (Clerk)](#accounts-clerk).

```
git push origin main ──> GitHub Actions CI (format, lint, types, tests, build)
                     ──> Railway (GitHub integration; waits for CI to pass)
                           ├─ builds the Dockerfile
                           ├─ pre-deploy: npm run migrate   (fails the deploy if a migration fails)
                           ├─ starts the container, waits for /api/health = 200
                           └─ switches traffic to the new version

Browser ──HTTPS──> web service (*.up.railway.app or your domain, cert by Let's Encrypt)
                     │  DATABASE_URL = ${{postgres.DATABASE_URL}}  (reference variable)
                     ▼  private network only, no TLS needed
                   postgres service (Railway-managed PostgreSQL + volume, not exposed publicly)
```

**New to building sites?** You can do everything below by asking an AI coding
assistant such as [Claude Code](https://claude.com/claude-code) to do it for you.
See [Working with an AI assistant](#working-with-an-ai-assistant).

## Quick start

**Prerequisites:** Node.js 22+, Docker (for the local database), the
[GitHub CLI](https://cli.github.com/) (`gh auth login`), the
[Railway CLI](https://docs.railway.com/cli) (`npm install -g @railway/cli`, then
`railway login`), and PowerShell 7 (`pwsh`) for the npm aliases. On macOS/Linux
without `pwsh`, run the matching `scripts/*.sh` directly (see [Scripts](#scripts)).

```bash
# 1. Create your repo from this template and clone it. Either use GitHub's
#    "Use this template" button, then clone it, or in one line:
gh repo create my-new-app --template nblaisdell2/nextjs-railway-template --private --clone
cd my-new-app

# 2. Start a local Postgres (skip if you already have one; flags explained below):
docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# 3. Onboard: npm install, write .env, create a local DB named after this project,
#    migrate, and personalize the project (name + GitHub repo, from the folder name).
npm run setup            # asks for the local Postgres password ("postgres" above); typing is hidden

# 4. Run it locally:
npm run dev              # http://localhost:3000

# 5. Commit the personalized files and push:
git add -A && git commit -m "Personalize template" && git push -u origin main

# 6. Deploy to Railway (creates the project, database and web service; prints the live URL):
npm run railway:setup
```

From then on, **every push to `main` deploys**.

What the `docker run` flags mean:

| Flag                            | Meaning                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--name pg`                     | Names the container `pg`, so you can `docker stop pg` / `docker start pg` later                                                                                           |
| `-e POSTGRES_PASSWORD=postgres` | Sets the database superuser's password (this is what `npm run setup` asks for)                                                                                            |
| `-p 5432:5432`                  | Exposes Postgres on `localhost:5432`. If that port is already taken (for example by a Postgres you installed), use `-p 5433:5432` and run `npm run setup -- -DbPort 5433` |
| `-d`                            | Runs it in the background                                                                                                                                                 |
| `postgres:16`                   | The official PostgreSQL 16 image                                                                                                                                          |

## What's here

| Path                                                         | Purpose                                                                                                                                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`                                               | The public landing page at `/` (sections live in `features/landing/`)                                                                                                                                      |
| `app/(app)/`                                                 | The signed-in app: `budget/`, plus placeholder `automation/` and `reporting/` pages. `(app)` is a route group, so it isn't part of the URL                                                                 |
| `app/sign-in/`, `app/sign-up/`                               | Clerk's sign-in and sign-up cards inside EverCent's frame (`features/auth/`)                                                                                                                               |
| `app/api/health`                                             | Health check used by Railway; deliberately outside sign-in                                                                                                                                                 |
| `proxy.ts`                                                   | Runs before each request: Clerk reads the session and sends signed-out visitors from app pages to `/sign-in`                                                                                               |
| `lib/auth/`                                                  | Sign-in URLs and which routes are protected (`routes.ts`), Clerk's colors and wording (`appearance.ts`)                                                                                                    |
| `lib/data/users.ts`                                          | `ensureUser()`: the signed-in check plus the user's row in the `users` table                                                                                                                               |
| `components/`, `features/budget/`                            | The budget UI, styled with Tailwind                                                                                                                                                                        |
| `lib/domain/`                                                | The budget's rules as plain TypeScript (types, pill states, selection), shared with the future mobile app                                                                                                  |
| `lib/data/budget-repository.ts`                              | Every read the budget page makes; returns the sample data in `lib/data/placeholder/` until real queries replace it                                                                                         |
| `lib/services/`                                              | Database operations (`users.ts` so far): plain functions that take a user id and validated input                                                                                                           |
| `lib/validation/`                                            | Zod schemas for input: cents, months, dates, ids, names                                                                                                                                                    |
| `lib/db/`                                                    | The Kysely query builder (`db`), the connection pool (created lazily; TLS controlled by `DATABASE_SSL`), how Postgres types become JavaScript (`pg-types.ts`), and the generated table types (`schema.ts`) |
| `lib/cn.ts`                                                  | `cn()`: combines Tailwind classes so a later class wins                                                                                                                                                    |
| `lib/motion.ts`, `components/motion/`                        | Shared animation timing and the app-wide Motion settings                                                                                                                                                   |
| `lib/sentry.ts`, `instrumentation*.ts`, `sentry.*.config.ts` | Sentry error monitoring: shared settings (including what it may collect) and where each runtime starts it                                                                                                  |
| `components/charts/chart-theme.ts`                           | Colors and styles for Recharts charts                                                                                                                                                                      |
| `*.test.ts`, `*.test.tsx`                                    | Vitest tests, next to the code they test                                                                                                                                                                   |
| `e2e/`                                                       | Playwright end-to-end tests                                                                                                                                                                                |
| `.github/workflows/ci.yml`                                   | The checks every push must pass before Railway deploys it                                                                                                                                                  |
| `db/migrations/*.sql`                                        | Your database schema, as numbered SQL files applied in order                                                                                                                                               |
| `db/migrate.mjs`                                             | Forward-only migration runner (records applied files in `schema_migrations`)                                                                                                                               |
| `db/ensure-database.mjs`                                     | Creates the local database if it's missing (local dev only)                                                                                                                                                |
| `db/choose-database-name.mjs`                                | Picks this project's local database name during `npm run setup` (local dev only)                                                                                                                           |
| `.railway/railway.ts`                                        | **Railway infrastructure-as-code**: the Postgres service, the web service, its settings, and domains                                                                                                       |
| `Dockerfile`                                                 | Multi-stage build of the standalone Next.js server; runs as a non-root user and listens on `PORT`                                                                                                          |
| `scripts/`                                                   | Setup and Railway helper scripts, each in PowerShell (`.ps1`) and Bash (`.sh`)                                                                                                                             |
| `.env.example`                                               | Template for your local `.env` (`DATABASE_URL`, `DATABASE_SSL`), and a note on the Clerk keys that go in `.env.local`                                                                                      |
| `CLAUDE.md`                                                  | Instructions for AI coding assistants working in this repo                                                                                                                                                 |

## Stack

| Area                     | Choice                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Framework                | [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript                                        |
| Styling                  | [Tailwind CSS](https://tailwindcss.com) v4 with EverCent's tokens in `app/globals.css`; `cn()` for merging |
| Interactive pieces       | [Base UI](https://base-ui.com) (menus, dialogs, popovers, selects...), unstyled and styled with the tokens |
| Animation                | [Motion](https://motion.dev)                                                                               |
| Error monitoring         | [Sentry](https://sentry.io): errors, traces, logs and masked replays, privacy-first                        |
| Charts                   | [Recharts](https://recharts.org)                                                                           |
| Sign-in                  | [Clerk](https://clerk.com)                                                                                 |
| Database                 | PostgreSQL, queried with [Kysely](https://kysely.dev) (type-checked SQL, not an ORM); plain SQL migrations |
| Input validation         | [Zod](https://zod.dev)                                                                                     |
| Tests                    | [Vitest](https://vitest.dev) + Testing Library, and [Playwright](https://playwright.dev) for the browser   |
| Code quality             | ESLint, Prettier (sorts Tailwind classes), GitHub Actions CI                                               |
| Hosting                  | [Railway](https://railway.com): the web service and Postgres, declared in `.railway/railway.ts`            |
| Mobile (planned)         | [Expo](https://expo.dev) (React Native); see [Future enhancements](#future-enhancements)                   |
| Scheduled jobs (planned) | Railway cron jobs, hourly at the top of the hour (see `CLAUDE.md`)                                         |

## Scripts

Every script ships in both PowerShell (`.ps1`) and Bash (`.sh`) and behaves the
same in both. The npm aliases call the PowerShell version through `pwsh`, so
they work on any OS that has PowerShell 7.

| npm                                        | Script                   | What it does                                                                    |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------- |
| `npm run dev` / `build` / `start` / `lint` | Next.js                  | Develop, build, run, lint                                                       |
| `npm run check`                            |                          | Everything CI checks: formatting, lint, types, tests, build. Run before pushing |
| `npm run format` / `format:check`          | Prettier                 | Format the code (and sort Tailwind classes) / only report what would change     |
| `npm run typecheck`                        | TypeScript               | Type-check the whole project                                                    |
| `npm test` / `test:watch`                  | Vitest                   | Run the tests once / re-run them as you edit                                    |
| `npm run test:e2e` / `test:e2e:ui`         | Playwright               | Browser tests against the running app / the same in Playwright's visual runner  |
| `npm run migrate`                          | `db/migrate.mjs`         | Apply pending migrations to whatever `DATABASE_URL` points at (reads `.env`)    |
| `npm run db:types`                         | kysely-codegen           | Regenerate `lib/db/schema.ts` from your local database after a migration        |
| `npm run db:ensure`                        | `db/ensure-database.mjs` | Create the local database if it doesn't exist                                   |
| `npm run setup`                            | `setup-local`            | One-shot local onboarding (below)                                               |
| `npm run template:init`                    | `init-from-template`     | One-time, offline personalization (below)                                       |
| `npm run railway:setup`                    | `setup-railway`          | First-time deploy, end to end (below)                                           |
| `npm run railway:deploy`                   | `railway-deploy`         | Deploy your local folder now, without waiting for a push                        |
| `npm run railway:migrate`                  | `railway-migrate`        | Re-run migrations against the live database without pushing                     |
| `npm run railway:domain`                   | `railway-domain`         | Generate the Railway domain, or attach a custom domain                          |
| `npm run railway:destroy`                  | `railway-destroy`        | Delete the Railway project (asks you to type its name)                          |

Pass arguments after `--`, e.g. `npm run template:init -- -ProjectName my-app -GitHubRepo me/my-app`.
(`npm run setup` is the exception: it works with or without `--`.)
The Bash versions take `--flag value` style arguments (shown below).

**`setup`** (`-DbName`, `-DbPort` / `--db-name=`, `--db-port=`, in any order; both optional)

1. Asks for the local Postgres password. Your typing is hidden, and the password can't be passed as an argument. For automated runs, set the standard `PGPASSWORD` environment variable instead.
2. `npm install`.
3. Chooses the database name and writes `.env` from `.env.example` with a URL-encoded password and `DATABASE_SSL=disable`.
4. `npm run db:ensure`, then `npm run migrate`.
5. Runs `template:init` with the folder name as the project name and `<your GitHub login>/<folder>` as the repo.

The database name is whichever of these applies first, so each project gets its own database:

- the name you passed with `-DbName`, used as is (an existing database with that name is reused);
- the name already in this project's `.env`, so re-running setup never creates another database;
- the project folder's name, with other characters turned into underscores (`my-new-app` becomes `my_new_app`);
- that folder-based name plus a random suffix (`my_new_app_3fa9`) if it's already taken on your Postgres server.

**`template:init`** (`-ProjectName`, `-GitHubRepo`, `-CustomDomain` / `--name`, `--repo`, `--custom-domain`)
Offline: it only edits files, so you can review it with `git diff` before
anything exists on Railway. It swaps the template's placeholder name for your
project name (`.railway/railway.ts`, `package.json`, `package-lock.json`,
`README.md`, `CLAUDE.md`), writes your GitHub `owner/repo` into
`.railway/railway.ts`, and optionally records a custom domain (`CUSTOM_DOMAIN`)
that `railway:setup` attaches. Project names are 3–30 lowercase letters, digits
or hyphens, starting with a letter.

**`railway:setup`** (`-Yes` / `--yes`). Safe to re-run.

1. Checks prerequisites: Railway CLI and login (offers `railway login`), `gh auth status`, a git `origin` remote, and that `railway.ts` has been personalized.
2. Links this folder to the Railway project named in `railway.ts` (`railway link`); if it doesn't exist, asks before creating it (`railway init`). Without a terminal it never creates a project unless you pass `-Yes`.
3. `railway config plan` (always shown), then `railway config apply` (asks you to confirm). This creates Postgres and the web service; connecting the GitHub repo starts the first deploy.
4. If nothing is pushed to `main` yet, prints the `git push` command and stops. Otherwise waits for that deploy to finish.
5. Generates the `*.up.railway.app` domain if the service has none, and attaches `CUSTOM_DOMAIN` if one is set.
6. Prints the live HTTPS URL and, for a custom domain, the DNS records to add.

`-Yes` creates the project without asking and passes `--yes` to `railway config apply`.
Destructive changes (deleting a service, variable or volume) are never confirmed automatically.

**`railway:deploy`**: `railway up --service web --ci`. Uploads your local folder
(respecting `.gitignore`, uncommitted changes included), builds it on Railway
and prints the URL. Handy for a quick check; the next push to `main` replaces it.

**`railway:migrate`** (`-Ssh` / `--ssh`): you rarely need it, because every
deploy already migrates. By default it runs `railway redeploy` on the web
service, which re-runs the pre-deploy `npm run migrate` with Railway's
`DATABASE_URL` (never your local `.env`), waits for it, and prints the
migration output. With `-Ssh` it instead runs `npm run migrate` inside the
running container over `railway ssh` (no restart), which needs an SSH key on
your machine (`ssh-keygen -t ed25519`). Either way it runs the migrations in the
_deployed_ image, so push new migration files first.

**`railway:domain [domain]`**: see [Custom domain](#custom-domain).

**`railway:destroy`** (`-Yes` / `--yes`): shows what will be deleted, reminds you
to dump the data first, asks you to type the project name, then runs
`railway delete` and unlinks the folder.

## Local development

`npm run setup` does all of this. By hand, or day to day:

```bash
npm install
docker start pg             # or the docker run command from Quick start
cp .env.example .env        # then set the password + a database name unique to this project in DATABASE_URL
npm run db:ensure           # create the database if it doesn't exist
npm run migrate             # apply migrations
npm run dev                 # http://localhost:3000
```

You also need Clerk's two development keys in `.env.local` before the app will
start; see [Accounts (Clerk)](#accounts-clerk).

### Changing the database

Add a new file in `db/migrations/` with the next number, e.g.
`0004_add_tags.sql`, then run `npm run migrate` and `npm run db:types`. The
second command regenerates `lib/db/schema.ts`, the TypeScript description of
your tables that Kysely checks every query against; commit it with the
migration (CI fails if it's out of date). Never edit a migration that has
already been applied (locally or on Railway). Write a new one instead. When you
push, Railway applies it before the new code takes traffic.

How Postgres values arrive in JavaScript (set in `lib/db/pg-types.ts`):
`BIGINT` (money in cents, ids) becomes a number, `DATE` (paydays, due dates)
stays `"2026-11-14"` text so it can't shift a day across time zones, and
`TIMESTAMPTZ` becomes a `Date`.

## Testing

| Kind                       | Where                                                      | Run                                                |
| -------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| Logic and components       | `*.test.ts` / `*.test.tsx` beside the code                 | `npm test` (or `npm run test:watch` while editing) |
| Database                   | `*.db.test.ts`, against your local Postgres                | `npm test`; skipped when `DATABASE_URL` isn't set  |
| The whole app in a browser | `e2e/*.spec.ts` (desktop Chrome and an Android phone size) | `npm run test:e2e` (`test:e2e:ui` to watch)        |

`npm run test:e2e` uses your running `npm run dev` server, or starts one. The
first time, download Playwright's browser with `npx playwright install chromium`.

**Signed-in browser tests** need a test user, otherwise they're skipped:

1. In the Clerk dashboard, switch to the **Development** instance and create a
   user (Users → Create user), e.g. `e2e+clerk_test@example.com`. Clerk's test
   helpers only work on the development instance, never production.
2. Add `E2E_CLERK_USER_EMAIL=<that email>` to `.env.local`.

The tests sign that user in with a one-time Clerk token, so no password is stored.

**Browser tests in CI** are off until you turn them on, because they need
Clerk's development keys. In the GitHub repository's Settings → Secrets and
variables → Actions, add the secrets `CLERK_TEST_PUBLISHABLE_KEY` and
`CLERK_TEST_SECRET_KEY` (the development instance's keys) and
`E2E_CLERK_USER_EMAIL`, then the variable `E2E_ENABLED` = `true`.

**Writing tests with Claude Code.** When a change adds behavior worth
protecting, Claude proposes a short list of tests in plain language for you
to approve, reject or add to before writing them (see "Testing" in
`CLAUDE.md`). It won't ask for styling or wording changes.

## Error monitoring (Sentry)

Errors from the browser, the server and `proxy.ts` are reported to the
[Sentry](https://sentry.io) project **evercent-budget** (organization
`personal-soq`), along with traces (10% of requests in production, all of them
locally), logs written with `Sentry.logger`, and a replay of the moments before
a browser error.

**What Sentry receives.** EverCent handles people's money, so `lib/sentry.ts`
keeps Sentry to the error and where it happened: no IP addresses, emails,
cookies, request or response bodies, database query values or local
variables, and only a few harmless headers. Signed-in users are identified only
by their EverCent id number. Replays mask every piece of text, every input and
every image. One more switch lives in Sentry itself: Settings → Projects →
evercent-budget → Security & Privacy → **Prevent Storing of IP Addresses**,
which also stops Sentry from working out a rough location from each report.

**Locally**, `NEXT_PUBLIC_SENTRY_DSN` in `.env.local` turns it on (remove the
line to turn it off). Local reports are tagged `development`, so they're easy
to filter out.

**On Railway**, `.railway/railway.ts` sets the same DSN, and each deploy is
tagged with its git commit as the Sentry release.

**Readable production stack traces (source maps).** Production code is
minified, so Sentry needs the build's source maps to show real file names and
lines. The build uploads them once Railway has a Sentry auth token:

1. In Sentry: Settings → Developer Settings → **Organization Tokens** → Create
   New Token (name it e.g. `railway-build`). Copy it; Sentry shows it once.
2. In a terminal in this folder, replacing the placeholder:

   ```bash
   railway variables --service web --set "SENTRY_AUTH_TOKEN=<paste the token>"
   ```

The token stays on Railway (`railway.ts` only declares it with `preserve()`),
is used only while building, and never reaches the running app. Without it,
deploys still work; stack traces just point at minified code. It's set on both
production and dev, and each build log shows Sentry's upload lines
(`railway logs --service web --build`).

**Alerts.** Sentry emails the `personal` team (you) when:

- **Production: new issue**: a kind of error appears in production for the
  first time (at most once per issue every 5 minutes).
- **Production: error spike**: production records more than 20 errors within
  5 minutes. It's a monitor (Sentry → Monitors) connected to an alert (Sentry →
  Alerts) of the same name.
- **Send a notification for high priority issues**: Sentry's default rule, for
  every environment (local and dev too).

Alert emails show the error's title, the page and tags, never amounts, emails
or payees, as long as error messages stay free of personal data (see
CLAUDE.md). For Railway's own alerts (spend, failed deploys) see "Manual steps
in the Railway dashboard".

**Checking that it works.** Signed in, open `/debug/sentry` (not linked from
the app) and press **Send a browser test error** or **Send a server test
error**. Within a minute the error is in Sentry
(`npx sentry@0.49.0 issue list personal-soq/evercent-budget`), tagged with the
environment it came from. On dev or production, its stack trace should name
`features/debug/sentry-test-buttons.tsx` or `app/(app)/debug/sentry/actions.ts`
with real line numbers; a `chunks/…js` file means source maps didn't upload. In
production it also sends the "Production: new issue" email. Resolve test issues
afterwards (`npx sentry@0.49.0 issue resolve <ID>`), so the next test counts as
new again.

**The Sentry CLI** runs through npm without installing anything:
`npx sentry@0.49.0 issue list personal-soq/evercent-budget` lists recent
errors. If it says you're not logged in, run `npx sentry@0.49.0 auth login`
and approve the code it shows in your browser.

## Accounts (Clerk)

[Clerk](https://clerk.com) handles everything about signing in: accounts,
passwords, email codes, Google/Facebook/Discord logins, sessions, and the account
menu. EverCent never sees a password. The pieces, in the order a request meets
them:

```
Clerk dashboard (EverCent app)        sign-in methods, paths, the two API keys
        │ keys
        ▼
.env.local                            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (public, ends up in the browser)
                                      CLERK_SECRET_KEY (server only; never commit it)
        │
        ▼
proxy.ts  ── clerkMiddleware ──────── reads the session cookie on every request;
        │                             /budget, /automation, /reporting → /sign-in if signed out
        ▼
app/layout.tsx  ── <ClerkProvider> ── makes the user available to every page and
        │                             Clerk component; colors/wording from lib/auth/appearance.ts
        ▼
/sign-in, /sign-up ── <SignIn/>, <SignUp/> ── Clerk's cards, in EverCent's frame
        │ on success → /budget (APP_HOME in lib/auth/routes.ts)
        ▼
app page ── ensureUser() ──────────── checks again, then finds or creates the
                                      person's row in the `users` table (db/migrations/0003_users.sql)
```

- **Landing page header:** `<Show when="signed-out">` / `<Show when="signed-in">`
  decide on the server whether to show _Log in / Create account_ or _Open budget_
  plus the avatar.
- **Avatar menu:** `<UserButton/>` (landing header and the budget's left panel)
  opens Clerk's account settings and Sign out. Signing out returns to `/`.
- **Our own user records:** `users.id` is EverCent's id for a person, and future
  tables (budgets, accounts) should point at it. `users.clerk_user_id` links it
  to Clerk. `ensureUser()` only calls Clerk's API the first time it sees
  someone (to copy their email and name); after that it's one local UPDATE.
- **Adding a protected section:** put the page under `app/(app)/`, add its path to
  `PROTECTED_PREFIXES` in `lib/auth/routes.ts`, and call `await ensureUser()` at
  the top of the page.

**Local keys.** In the Clerk dashboard, open the EverCent app → **Configure →
API keys** and copy both keys into `.env.local` (gitignored). They go there
rather than `.env` because `npm run setup` rewrites `.env`. The `test` keys
belong to Clerk's _development_ instance: fine on localhost, and they show a
small "Development mode" label on the sign-in card.

### Production (live at https://app.testapisite.net)

Production uses a separate Clerk **production instance** (dashboard → EverCent →
switch the environment to _Production_), with its own users and its own keys.
Clerk requires a domain you own for it, so it can't run on `*.up.railway.app`.

| Piece                         | Where it lives                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clerk domain                  | `testapisite.net` (the app itself is on `app.testapisite.net`)                                                                                                   |
| Sign-in methods               | Email + password and email code. Google, Facebook and Discord are **disabled**: production needs your own OAuth credentials (see below)                          |
| Publishable key (`pk_live_…`) | `CLERK_PUBLISHABLE_KEY` in `.railway/railway.ts`. It's public by design, so it's in git                                                                          |
| Secret key (`sk_live_…`)      | Set by hand on Railway (web → Variables). `railway.ts` declares it as `CLERK_SECRET_KEY: preserve()`, which keeps Railway's value without ever writing it to git |
| Custom domain                 | `CUSTOM_DOMAIN = "app.testapisite.net"` in `railway.ts`, attached with `npm run railway:domain`                                                                  |
| DNS                           | AWS Route53, hosted zone `testapisite.net`                                                                                                                       |

The Route53 records:

| Name                                | Type  | Value                                     | For                                               |
| ----------------------------------- | ----- | ----------------------------------------- | ------------------------------------------------- |
| `app`                               | CNAME | `cia68j0d.up.railway.app`                 | Traffic to Railway                                |
| `_railway-verify.app`               | TXT   | `railway-verify=…`                        | Proves to Railway you own the domain              |
| `dev`                               | CNAME | `b4188c9f.up.railway.app`                 | Traffic to the dev environment                    |
| `_railway-verify.dev`               | TXT   | `railway-verify=…`                        | Proves to Railway you own `dev.testapisite.net`   |
| `clerk`                             | CNAME | `frontend-api.clerk.services`             | Clerk's sign-in API                               |
| `accounts`                          | CNAME | `accounts.clerk.services`                 | Clerk's hosted account pages                      |
| `clkmail`                           | CNAME | `mail.8gik0tn6gkr1.clerk.services`        | Sending verification emails                       |
| `clk._domainkey`, `clk2._domainkey` | CNAME | `dkim1/dkim2.8gik0tn6gkr1.clerk.services` | Email signing (DKIM), so codes don't land in spam |

To change any of it later: Clerk dashboard → Production → **Domains** shows the
records Clerk expects and re-checks them ("Verify Records"), and
`railway domain status app.testapisite.net --service web` shows Railway's side.

**Changing the secret key.** Paste the new value in Railway's dashboard
(web → Variables). Railway holds dashboard edits as _staged changes_ until you
click **Deploy**; until then neither the app nor `railway variables` sees them.

**Turning on Google / Facebook / Discord.** Create an OAuth app with each
provider (Google Cloud console, Meta for Developers and the Discord Developer
Portal are all free), paste its client ID and secret into Clerk → Production →
**SSO connections** → the provider, and enable it. Clerk shows the callback URL
to give the provider. No code changes are needed; the sign-in card picks it up.
Google's consent screen and Facebook's Live mode both need a public privacy
policy URL, and a Facebook app only lets its listed testers sign in until it's
switched to Live.

**Development vs production.** `.env.local` keeps the development instance's
`test` keys, so localhost has its own users and still has every social login
(on Clerk's shared development credentials). An account made on one instance
doesn't exist on the other.

**If the keys ever go missing on Railway, a push to `main` won't go live.** The
build itself succeeds without them, but every page would answer 500, so
`/api/health` returns 503 when either key is missing. Railway then rejects the
new deploy and keeps the previous one serving. The `Dockerfile` also passes
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` into the build, because Next.js can bake
`NEXT_PUBLIC_*` values into the browser bundle at build time.

## Dev environment and releases

Nothing goes straight to live users. Every change runs on the private **dev**
site first, and is released to production with a pull request.

|                | Production                             | Dev                                                     |
| -------------- | -------------------------------------- | ------------------------------------------------------- |
| Git branch     | `main` (protected: pull requests only) | `dev`                                                   |
| Address        | https://app.testapisite.net            | https://dev.testapisite.net                             |
| Database       | production Postgres                    | its own Postgres, **test data only**                    |
| Clerk          | production instance (`pk_live_…`)      | development instance (`pk_test_…`), Invite-only sign-up |
| Sentry         | environment `production`               | environment `dev` (localhost reports as `local`)        |
| Who can use it | everyone                               | invited people whose email is in `DEV_ALLOWED_EMAILS`   |
| Idle           | always on                              | sleeps when unused; the first visit after a nap is slow |

Both environments are described by the one `.railway/railway.ts` (values that
differ are `prod ? a : b`), in the same Railway project. Dev shows an amber
"Dev site, for testing only" strip on every page and tells search engines to
stay away (`app/robots.ts` and `noindex`).

**Day to day**

1. Work on a feature branch (or straight on `dev` for small changes).
2. Merge or push it to `dev`. CI runs, and Railway deploys dev once CI passes.
   Migrations run on dev's database first.
3. Check the change on https://dev.testapisite.net.
4. Open a pull request `dev` → `main`. When CI passes, merge it (a merge
   commit; keep the `dev` branch), and Railway deploys production.
5. Bring `dev` up to the merge commit, so `dev` and `main` point at the same
   commit again. This redeploys dev with identical code.

```bash
gh pr create --base main --head dev --title "Release: <what changed>"
gh pr merge --merge          # once CI passes; never --delete-branch
git switch dev && git pull --ff-only origin main && git push
```

**Hotfix** (an urgent production bug): branch from `main`, fix it, open a pull
request into `main`, then merge `main` back into `dev`
(`git switch dev && git merge main && git push`) so the two don't drift.

**Migrations** run on dev first, but they still have to work with the code
that's running in production while the new version starts: add things before
using them, remove them after the code stops using them.

**Infrastructure changes** need a plan and an apply for **each** environment.
Look at both plans before applying either:

```powershell
. ./scripts/lib/common.ps1   # Invoke-RailwayConfig: the Windows workaround below
Invoke-RailwayConfig plan --environment dev
Invoke-RailwayConfig plan --environment production
```

**Who can use dev.** Two locks, both needed:

- Clerk → EverCent → **Development** instance → User & authentication → **Access
  mode → Invite-only**, with testers invited from Users → **Invitations**. (The
  development instance has every Clerk feature for free.) It also applies to
  localhost, which uses the same instance.
- `DEV_ALLOWED_EMAILS` on dev's web service (comma-separated, set by hand in the
  Railway dashboard, never in git). Anyone signed in with another email is sent
  to `/private-test-site`. An empty list lets nobody in. Production never checks
  it.

**Inviting a tester** (both lists have to agree):

1. Add their email to `DEV_ALLOWED_EMAILS` (Railway → `dev` environment → web →
   Variables), then click **Deploy** on the staged change.
2. Clerk → EverCent → **Development** → Users → **Invitations** → invite the same
   email. An invitation isn't an account: it's a link that lets that person past
   "Access restricted" and create their own account (password or Google). After
   that they just sign in.

Invitation links go to the development instance's home address, set under Clerk
→ Development → **Paths**. It's set to `https://dev.testapisite.net`, because
Clerk's default (`http://localhost:3000`) sent invitations to localhost. If an
old invitation still points there, swap `http://localhost:3000` for
`https://dev.testapisite.net` and keep the rest of the link, or delete it and
invite again. To remove a tester, delete them in Clerk → Development → Users
and take their email off `DEV_ALLOWED_EMAILS`.

**Dev's secrets**, set by hand on dev's web service (Railway → switch to the
`dev` environment → web → Variables): `CLERK_SECRET_KEY` (the development
instance's `sk_test_…`), `DEV_ALLOWED_EMAILS` and, optionally,
`SENTRY_AUTH_TOKEN`. Never copy production data into dev.

**Commands for dev** take `--environment dev`; the folder itself stays linked
to production:

```bash
railway logs --service web --environment dev
railway domain status dev.testapisite.net --service web --environment dev
npm run railway:domain -- dev.testapisite.net -Environment dev
```

## Deploying

### Deployment model

| What changes                                                     | Who applies it   | How                                                                                                                                                          |
| ---------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Code** (pages, APIs, migrations)                               | GitHub → Railway | Push to `dev` (deploys dev), then a pull request `dev` → `main` (deploys production). Railway builds the Dockerfile, migrates, health-checks, swaps traffic. |
| **Infrastructure** (services, variables, health check, replicas) | Your laptop      | Edit `.railway/railway.ts`, then `railway config plan` and `railway config apply`, with `--environment dev` and `--environment production`                   |
| **Domains**                                                      | Your laptop      | `npm run railway:domain [domain]` (uses `railway domain`; Railway's IaC can't create domains)                                                                |
| **Secrets / credentials**                                        | Railway          | Postgres credentials are generated by Railway and referenced by name; nothing sensitive is in git or in the image                                            |
| **Quick manual deploy**                                          | Your laptop      | `npm run railway:deploy`                                                                                                                                     |

Your laptop owns `railway.ts`, and pushes own code rollouts: the same split as a
Terraform + CI setup, without any IAM roles to enforce it. There is no deploy
secret to set: Railway's GitHub integration handles deploy-on-push. GitHub
Actions (`.github/workflows/ci.yml`) only checks the code, and because the web
service's source has `checkSuites: true` (Railway's "Wait for CI"), Railway
holds each deploy until those checks pass and skips it if they fail.

### What `.railway/railway.ts` declares

- `postgres("postgres")`: a managed PostgreSQL service with its own volume,
  reachable only over the private network (`postgres.railway.internal`).
- `service("web")`, which:
  - deploys from your GitHub repo's `main` branch in production, and `dev` in dev
  - is built from the `Dockerfile`
  - runs `npm run migrate` as its pre-deploy command
  - waits for `/api/health` to return 200 (120 s timeout)
  - runs 1 replica, with Railway's default restart policy (on failure, up to 10 times)
  - gets `DATABASE_URL` as a reference to `postgres.DATABASE_URL`, plus `DATABASE_SSL=disable` and `NODE_ENV=production`
- `project("<your project>")` containing both.

In dev it also gets `NEXT_PUBLIC_APP_ENV=dev`, `DEV_ALLOWED_EMAILS` and
sleep-when-idle, and uses Clerk's development publishable key. Any environment
name other than `production` or `dev` fails the plan.

It also holds `PROJECT_NAME`, `GITHUB_REPO`, `CUSTOM_DOMAIN` and `DEV_DOMAIN`, which the npm
scripts read. Domains themselves are attached by the scripts, not declared in
`service()`, because Railway's IaC can't register custom domains.
Railway injects `PORT` into the web container; the Next.js server listens on it.

### Logs and status

```bash
railway logs --service web            # runtime logs (including pre-deploy migrations)
railway logs --service web --build    # build logs
railway status                        # what's linked
railway open                          # the project in the dashboard
```

The dashboard shows the same logs plus metrics per deployment.

### Scaling

Set `replicas` in `.railway/railway.ts` (e.g. `replicas: 2`) and run
`railway config apply`. Or run `railway scale --service web us-east=2`; if you do
that, put the same number in `railway.ts` so the next apply doesn't undo it.
Remember each replica opens its own database pool (`DATABASE_POOL_MAX`, default 5).

## Custom domain

1. Attach the domain:
   ```bash
   npm run railway:domain -- app.example.com
   ```
   This runs `railway domain app.example.com --service web`, prints the DNS
   records from `railway domain status`, and records
   `CUSTOM_DOMAIN = "app.example.com"` in `.railway/railway.ts` (commit it).
   You can also set it from the start with
   `npm run template:init -- -ProjectName my-app -CustomDomain app.example.com`;
   `railway:setup` then attaches it after the first deploy.
2. At your DNS provider, add **both** records shown:
   - a **CNAME** from your domain to the Railway target (routes the traffic), and
   - a **TXT** record (proves you own the domain). Without the TXT, Railway answers **404** even when the CNAME resolves.
3. Wait for DNS to propagate. Railway issues the Let's Encrypt certificate
   automatically; there's nothing to upload. Check progress with:
   ```bash
   railway domain status app.example.com --service web
   ```

**A bare domain (`example.com`, no subdomain) needs the right DNS provider.**
Railway gives you a hostname to point at, and DNS doesn't allow a CNAME on a
bare domain. Providers with _CNAME flattening_ (Cloudflare, automatically) or an
ALIAS/ANAME record that accepts outside hostnames work. **AWS Route53 doesn't**:
its ALIAS records only point at AWS resources. That's why this project runs on
`app.testapisite.net` rather than `testapisite.net`. To put the app on a bare
domain, manage that domain's DNS at Cloudflare (free).

**Cloudflare:** never proxy `_acme-challenge` records. Nested subdomains
(`a.b.example.com`) must be **DNS only** (grey cloud) unless you pay for
Cloudflare's Advanced Certificate Manager, because Cloudflare's universal
certificate only covers one level of subdomain. A root domain needs CNAME
flattening (Cloudflare does this automatically for the apex).

Without an argument, `npm run railway:domain` generates the free
`*.up.railway.app` domain (if the service doesn't have one yet). The generated
domain keeps working alongside your custom one.

Switching domains: running `railway:domain` with a new domain attaches it and
updates `CUSTOM_DOMAIN`, but leaves the old one attached; it prints the
`railway domain delete <old> --service web --yes` command to remove it.

## Cost and teardown

Railway bills by usage: CPU, memory, Postgres volume storage and network egress
for both services. See [railway.com/pricing](https://railway.com/pricing) and
check your current spend with `railway usage`.

**Backups.** The Postgres data lives on a Railway volume. Take an on-demand
backup, or set a schedule, with:

```bash
railway postgres pitr backup create --service postgres   # one-off backup
railway postgres pitr schedule set --service postgres    # daily / weekly / monthly
railway postgres pitr enable --service postgres          # continuous point-in-time recovery
```

The same controls are on the Postgres service's **Backups** tab in the dashboard.
Backups belong to the project, so **deleting the project deletes them too.**

**Reaching the database from your laptop** (for `pg_dump`, a GUI client, or a
one-off query). The database has no public address by default. Either:

- `railway connect postgres`: opens `psql` through an SSH tunnel (needs `psql`
  and an SSH key on your machine), or
- open a temporary public TCP proxy, use it, then close it:
  ```bash
  railway tcp-proxy create --port 5432 --service postgres
  railway variables --service postgres   # PGUSER, PGPASSWORD, PGDATABASE,
                                         # RAILWAY_TCP_PROXY_DOMAIN, RAILWAY_TCP_PROXY_PORT
  pg_dump "postgresql://PGUSER:PGPASSWORD@PROXY_DOMAIN:PROXY_PORT/PGDATABASE?sslmode=require" > backup.sql
  railway tcp-proxy list --service postgres  # get the proxy id, then:
  railway tcp-proxy delete <id> --service postgres --yes
  ```
  (Substitute the values; URL-encode the password if it has special characters.)
  If you point this app or `npm run migrate` at that URL, set `DATABASE_SSL=require`.

Dump anything you want to keep before tearing down.

**Tear down everything:**

```bash
npm run railway:destroy
```

It lists what will be deleted, asks you to type the project name, and runs
`railway delete`. The site goes offline immediately and Railway purges the
project after a grace period (about 48 hours). Your GitHub repo and local files
are untouched; run
`npm run railway:setup` again to start fresh.

## Using as a template for new projects

This repo is a GitHub **template repository**. For a new project:

1. "Use this template" (or `gh repo create my-new-app --template nblaisdell2/nextjs-railway-template --private --clone`).
2. `npm run setup`. It personalizes the project from the folder name and your GitHub login, then sets up local dev.
   - To _only_ personalize: `npm run template:init -- -ProjectName my-app -GitHubRepo owner/my-app`.
3. Review `git diff`, commit, push to `main`.
4. `npm run railway:setup`.
5. Build your app: add your own pages, APIs and migrations. `lib/db.ts`, `app/api/health`, `db/migrate.mjs`,
   the `Dockerfile` and `.railway/railway.ts` are app-agnostic and can stay as they are.

## Working with an AI assistant

`CLAUDE.md` tells AI coding assistants (Claude Code and others that read it) how this
project fits together, what's safe to change, and which commands to run. Open the
project folder in [Claude Code](https://claude.com/claude-code) and ask in plain
English, for example:

- "Set this project up for local development and start it."
- "Add a page at /about with a short bio and link it from the home page."
- "Add a `tags` table with a migration and show tags on the budget page."
- "Deploy this to Railway." / "Why did my last Railway deploy fail?"
- "Put the site on www.example.com."

The assistant runs the same npm scripts documented here. Commands that change
Railway (`railway config apply`, `railway:destroy`) ask for confirmation, and so
should you: read what they print before saying yes.

## Design decisions and gotchas

- **`PORT` is injected by Railway.** Never hardcode `3000` in the server. The
  Dockerfile's `PORT=3000` is only the fallback for a plain `docker run`, and
  Next's standalone `server.js` reads `PORT` and `HOSTNAME=0.0.0.0`.
- **The private network doesn't need TLS, so `DATABASE_SSL=disable` is correct there.**
  `postgres.railway.internal` is only reachable from inside your project, and the
  database has no public address unless you open a TCP proxy. Use
  `DATABASE_SSL=require` when connecting through such a proxy: the proxy also
  accepts unencrypted connections, so `require` is what keeps traffic across the
  internet encrypted. Its certificate is self-signed, so `require` encrypts
  without verifying it.
- **`sslmode` in the URL is stripped on purpose.** `pg` turns `?sslmode=...` into
  its own TLS settings (newer versions treat `sslmode=require` as full
  verification), which would silently override `DATABASE_SSL`. One switch, no surprises.
- **Pre-deploy migrations gate the release.** If a migration fails, the deploy
  fails and the previous version keeps serving, rather than serving new code
  against a half-migrated schema. Keep migrations backward compatible with the
  version that's still running (add columns before using them, drop them later).
- **`next build` must not touch the database.** `lib/db.ts` creates its pool on
  first query, so builds (locally and on Railway) don't need `DATABASE_URL`.
  Pages that query the database use `export const dynamic = "force-dynamic"`.
- **Node doesn't load `.env` by itself.** The npm scripts use
  `node --env-file-if-exists=.env`; inside the container there's no `.env`, and
  Node prints a harmless "not found" note before using Railway's variables.
- **Passwords are never command-line arguments.** Arguments stay visible in your
  terminal, your shell history and npm's `> pwsh ...` command echo, so
  `npm run setup` always asks with hidden input (or reads `PGPASSWORD`).
- **npm consumes `-Flag` arguments unless they come after `--`.**
  `npm run setup -DbName foo` reaches the script as just `foo`. `setup` handles
  this by sorting bare values: all digits is the port, anything else is the
  database name. The other scripts need the `--`; without it, a switch like
  `-Yes` or `-Ssh` silently disappears. One limit: an old-style
  `npm run setup -DbPassword secret` without `--` delivers only `secret`, which
  setup can't tell apart from a database name, so don't type passwords there.
- **PowerShell and flags containing `=`.** Quote them: `"--flag=value"`. Unquoted,
  PowerShell can split the argument before the CLI sees it. The PowerShell
  scripts avoid `=` flags for this reason.
- **Custom domains need both CNAME and TXT**, and Cloudflare proxying has limits
  (see [Custom domain](#custom-domain)).
- **Railway does not read `.railway/` during deploys.** A push ships code only;
  `railway config apply` is the only way infrastructure changes land.
- **`railway.ts` is the whole truth for services and variables.** Removing a
  resource from it and applying **deletes** it on Railway, including the Postgres
  database. The plan marks these as destructive and asks again; read it.
- **Railway's IaC can't create custom domains.** Declaring one in `service({ domains })`
  fails the plan with "Custom-domain registration is not supported" until the
  domain already exists, so this template attaches domains with `railway domain`
  (via `npm run railway:domain`) and keeps `CUSTOM_DOMAIN` as a plain setting.
  Domains not declared in the file are left alone by `railway config apply`.
- **Don't declare settings that equal Railway's defaults.** Railway stores a
  default as "unset", so e.g. `restartPolicyType: "ON_FAILURE"` shows up as a
  change, and triggers a redeploy, on every `railway config apply`. If
  `railway config plan` keeps showing the same change, that's why.
- **`RAILWAY_PUBLIC_DOMAIN` switches to your custom domain** once one exists. The
  scripts read the generated domain from `railway domain list` instead.
- **`railway run` executes on your laptop.** It injects Railway's variables, but
  `postgres.railway.internal` doesn't resolve outside Railway, so
  `railway run npm run migrate` can't reach the database. `railway:migrate`
  redeploys (or uses `railway ssh` with `-Ssh`) instead.
- **Windows: `railway config` needs a workaround with an npm-installed CLI.** The
  `railway/iac` package checks the CLI version by spawning `railway` without a
  shell, which can't run npm's `railway.cmd` shim, so `railway config plan` fails
  with "requires Railway CLI 5.42.1 or newer" even on a newer CLI. The scripts
  work around it (`Invoke-RailwayConfig` / `railway_config` in `scripts/lib/`).
  Running `railway config ...` by hand on Windows: in PowerShell, first run
  `$env:_ = "$(npm root -g)\@railway\cli\bin\railway.exe"`, or install the CLI
  with a native installer (e.g. `scoop install railway`) instead of npm.

## Future enhancements

### Mobile app (Expo)

EverCent will also become a native app on Android (Google Play) and later iOS
(App Store), built with **[Expo](https://expo.dev)**, the standard way to build
React Native apps. Nothing for it is installed yet; the website comes first.

React Native draws native controls instead of HTML and CSS, so the phone app's
screens will be written fresh (with [NativeWind](https://www.nativewind.dev)
for Tailwind-style classes). What it will share with the website:

- **The budget's rules and formats**: `lib/domain/`, `lib/format/` and
  `lib/validation/` are plain TypeScript with no website-specific imports
  (ESLint enforces this), so both apps calculate and validate identically.
- **The server**: every operation lives in a service (`lib/services/`), so the
  app can reach it through an `app/api/...` route as easily as the website
  reaches it through a server action.
- **Sign-in**: Clerk has an Expo SDK, and the same Clerk checks the website's
  server uses also accept the session token the app sends.

When the time comes, the repository becomes a monorepo: the website and the
Expo app side by side, with the shared code in its own package.

## Manual steps in the Railway dashboard

Normally none: `railway:setup` does everything from the CLI. Check these if it stops:

- **Plan / billing:** creating a project needs an active plan. If `railway init`
  fails with "Your trial has expired", pick a plan in the dashboard and re-run.
- **GitHub access:** Railway's GitHub app must be able to see your repo for
  deploy-on-push. If `railway:setup` reports that no deploy started, open the
  project (`railway open`) → web → Settings → Source, connect the repo (granting
  the Railway app access when GitHub asks), then re-run `npm run railway:setup`.
- **Spend alert:** workspace → Settings → **Usage**: set a custom email alert
  amount. A hard limit is optional and shuts the site down when it's reached,
  so leave it off or set it well above the alert.
- **Deploy-failure emails:** account menu → Account Settings →
  **Notifications**: email for failed and crashed deploys.
- **Optional:** backup schedules are easiest to set in the dashboard
  (`railway open`).
