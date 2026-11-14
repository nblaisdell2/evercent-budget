// Railway infrastructure-as-code: the single declarative description of this
// project's hosting stack. It plays the role Terraform used to play.
//
//   railway config plan     preview what would change (always look first)
//   railway config apply    make Railway match this file
//
// `npm run railway:setup` runs both for you the first time. After that, edit
// this file and run them yourself whenever the INFRASTRUCTURE changes. Code
// changes don't need it: every push to `main` rebuilds and redeploys `web`.
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

// Clerk's production publishable key (Clerk dashboard → EverCent → Production →
// API keys). It's public by design: it only names the Clerk instance
// (clerk.testapisite.net) and ends up in every visitor's browser anyway, so it
// lives here in git. Its partner CLERK_SECRET_KEY never does; see env below.
const CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsudGVzdGFwaXNpdGUubmV0JA";
// ----------------------------------------------------------------------------

export default defineRailway(() => {
  // Managed PostgreSQL with its own volume. Railway generates the credentials
  // and exposes them as variables on this service (DATABASE_URL, PG*). It is
  // only reachable over the private network: no public TCP proxy.
  const db = postgres("postgres");

  const web = service("web", {
    // Deploy-on-push: Railway watches this repo/branch and redeploys on push.
    source: github(GITHUB_REPO, { branch: "main" }),

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
    },

    // One instance. Raise this (or use `railway scale`) to run more.
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
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: CLERK_PUBLISHABLE_KEY,
      // The secret key is set on Railway by hand (dashboard → web → Variables)
      // and never written here. preserve() keeps whatever value Railway holds,
      // so `railway config apply` neither overwrites nor deletes it.
      CLERK_SECRET_KEY: preserve(),
    },
  });

  return project(PROJECT_NAME, { resources: [db, web] });
});
