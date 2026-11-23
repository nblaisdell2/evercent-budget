// Railway infrastructure-as-code: the single declarative description of this
// project's hosting stack. It plays the role Terraform used to play.
//
// One file describes BOTH environments of the project:
//
//   production  branch `main`, app.testapisite.net, real people
//   dev         branch `dev`,  dev.testapisite.net, invited testers, test data
//
// Railway runs the function below once per environment and tells it which one
// (`ctx.environment`), so every value that differs is a `prod ? a : b`. Each
// environment has its own `web` and its own `postgres` (separate data).
//
//   railway config plan  --environment production   preview (always look first)
//   railway config apply --environment production   make Railway match this file
//   (and the same with --environment dev)
//
// `npm run railway:setup` runs both for you the first time. After that, edit
// this file and run them yourself whenever the INFRASTRUCTURE changes, for each
// environment. Code changes don't need it: a push to `dev` redeploys dev's
// `web`, and a push (merged pull request) to `main` redeploys production's.
//
// Railway does not read this folder during deploys. A push never changes
// infrastructure, only `railway config apply` does.
//
// WARNING: this file is the whole truth. Removing a resource here and applying
// DELETES it on Railway, and that includes the Postgres database and its data.
//
// Reference: https://docs.railway.com/infrastructure-as-code/reference

import { defineRailway, github, postgres, preserve, project, service } from "railway/iac";

// ---- Project identity (filled in by `npm run template:init`) ---------------
const PROJECT_NAME = "evercent-budget";
const GITHUB_REPO = "nblaisdell2/evercent-budget";
// Optional custom domain, e.g. "app.example.com". Leave "" to use only the
// generated *.up.railway.app domain. See "Custom domain" in the README.
// Read by the npm scripts, which attach it with `railway domain`: Railway's IaC
// can't register custom domains itself (plan fails with "Custom-domain
// registration is not supported"), so it isn't passed to service() below.
const CUSTOM_DOMAIN = "app.testapisite.net";
// The dev environment's custom domain, attached the same way with
// `npm run railway:domain -- <domain> -Environment dev`.
const DEV_DOMAIN = "dev.testapisite.net";

// Clerk's production publishable key (Clerk dashboard → EverCent → Production →
// API keys). It's public by design: it only names the Clerk instance
// (clerk.testapisite.net) and ends up in every visitor's browser anyway, so it
// lives here in git. Its partner CLERK_SECRET_KEY never does; see env below.
const CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsudGVzdGFwaXNpdGUubmV0JA";
// The dev environment uses Clerk's DEVELOPMENT instance (the same one as
// localhost: test users, Clerk's shared social-login credentials, Invite-only
// sign-up). Also public. Its secret key (sk_test_...) is set by hand on dev's
// web service, like production's.
const CLERK_DEV_PUBLISHABLE_KEY = "pk_test_Y3VyaW91cy1jb2xsaWUtNDUyMy5jbGVyay5hY2NvdW50cy5kZXYk";

// Sentry's DSN for the evercent-budget project (Sentry → Settings → Projects →
// evercent-budget → Client Keys). Also public: it only says where to send
// error reports. The same value is in .env.local for local development.
const SENTRY_DSN =
  "https://1d3679d392542394db52263c57ac89d2@o4512432633085952.ingest.us.sentry.io/4512432663494656";
// ----------------------------------------------------------------------------

// The Railway environments this file knows. Anything else fails the plan
// rather than falling through to the wrong values: a typo can't give
// production dev's settings, or the other way round.
const ENVIRONMENTS = ["production", "dev"] as const;

export default defineRailway((ctx) => {
  const environment = ctx.environment ?? ctx.environmentName;
  if (!ENVIRONMENTS.some((name) => name === environment)) {
    throw new Error(
      `.railway/railway.ts describes the environments ${ENVIRONMENTS.join(" and ")}, not "${environment}". Pass --environment production or --environment dev.`,
    );
  }
  const prod = environment === "production";

  // Managed PostgreSQL with its own volume. Railway generates the credentials
  // and exposes them as variables on this service (DATABASE_URL, PG*). It is
  // only reachable over the private network: no public TCP proxy.
  const db = postgres("postgres");

  const web = service("web", {
    // Deploy-on-push: Railway watches this repo/branch and redeploys on push.
    // checkSuites is Railway's "Wait for CI": it holds each deploy until the
    // GitHub Actions checks (.github/workflows/ci.yml) pass, and skips the
    // deploy if they fail, so a commit that breaks a test never goes live.
    // Production follows `main`, dev follows `dev`.
    source: github(GITHUB_REPO, { branch: prod ? "main" : "dev", checkSuites: true }),

    // Build the repo's Dockerfile (multi-stage, standalone Next.js server).
    build: { builder: "DOCKERFILE", dockerfilePath: "Dockerfile" },

    deploy: {
      // Apply pending SQL migrations before the new version takes traffic.
      // A failing migration fails the deploy; the old version keeps serving.
      preDeployCommand: ["npm run migrate"],
      // Traffic only moves to a new deploy once this returns 200.
      healthcheckPath: "/api/health",
      healthcheckTimeout: 120,
      // Restart policy: Railway's default (restart on failure, up to 10 times)
      // is what we want. Don't set restartPolicyType / restartPolicyMaxRetries
      // to those same values: Railway stores the default as "unset", so the
      // plan would show a change, and redeploy, on every apply.
      //
      // Dev only: sleep when nobody has used it for a while, to save money.
      // The first request after a nap takes a few seconds (and can briefly
      // answer 502). Production never sleeps.
      ...(!prod && { sleepApplication: true }),
    },

    // One instance in each environment. Raise production's (or use
    // `railway scale`) to run more; dev stays at 1.
    replicas: 1,

    // Domains (generated *.up.railway.app and CUSTOM_DOMAIN) are attached by
    // `npm run railway:setup` / `npm run railway:domain`, not declared here.

    env: {
      // Reference variable: resolves to ${{postgres.DATABASE_URL}}, the
      // private-network URL (postgres.railway.internal). Never stored in git.
      DATABASE_URL: db.env.DATABASE_URL,
      // The private network is isolated to this project; no TLS needed. See lib/db.ts.
      DATABASE_SSL: "disable",
      NODE_ENV: "production",
      // Clerk (sign-in). The publishable key is read at build time too (the
      // Dockerfile declares it as a build ARG) and at runtime.
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: prod ? CLERK_PUBLISHABLE_KEY : CLERK_DEV_PUBLISHABLE_KEY,
      // The secret key is set on Railway by hand (dashboard → web → Variables)
      // and never written here. preserve() keeps whatever value Railway holds,
      // so `railway config apply` neither overwrites nor deletes it.
      CLERK_SECRET_KEY: preserve(),
      // Sentry (error monitoring). The DSN is read at build time (Dockerfile
      // ARG) and at runtime, like the Clerk publishable key.
      NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
      // Build-time only: lets the build upload source maps. Set by hand with
      // `railway variables` and never written here, like CLERK_SECRET_KEY.
      // Until it's set, deploys work and simply skip the upload.
      SENTRY_AUTH_TOKEN: preserve(),
      // Dev only. Production deliberately has neither variable: the app treats
      // a missing NEXT_PUBLIC_APP_ENV as production (lib/app-environment.ts).
      ...(!prod && {
        // Turns on the dev banner, noindex, Sentry's "dev" environment and the
        // allowlist below. Read at build time too (Dockerfile ARG).
        NEXT_PUBLIC_APP_ENV: "dev",
        // Emails allowed into the dev site, comma-separated (the backstop to
        // Clerk's Invite-only mode; see lib/auth/dev-access.ts). Set by hand
        // on Railway; emails never go into git. Empty means nobody gets in.
        DEV_ALLOWED_EMAILS: preserve(),
      }),
    },
  });

  return project(PROJECT_NAME, { resources: [db, web] });
});
