import { withSentryConfig } from "@sentry/nextjs/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal, self-contained server build in .next/standalone
  // that the Docker image copies and runs.
  output: "standalone",
  reactStrictMode: true,
};

/**
 * Sentry's build step (see lib/sentry.ts for what the app sends at runtime).
 *
 * Source maps make production stack traces readable. They upload only when
 * SENTRY_AUTH_TOKEN is set, which is on Railway's builds; local and CI builds
 * skip it. The release name comes from SENTRY_RELEASE, which the Dockerfile
 * sets to the git commit Railway is deploying.
 */
export default withSentryConfig(nextConfig, {
  org: "personal-soq",
  project: "evercent-budget",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Upload maps for more of the client code, for fuller stack traces.
  widenClientFileUpload: true,
  // Browser events go to this route on EverCent's own server, which passes
  // them on to Sentry, so ad blockers don't drop them. proxy.ts skips it.
  tunnelRoute: "/monitoring",
  // Don't send usage statistics about this build plugin to Sentry.
  telemetry: false,
  // Quiet locally; print the upload log in CI and on Railway.
  silent: !process.env.CI,
});
