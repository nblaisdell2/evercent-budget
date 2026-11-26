import { withSentryConfig } from "@sentry/nextjs/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal, self-contained server build in .next/standalone
  // that the Docker image copies and runs.
  output: "standalone",
  reactStrictMode: true,
  // The standalone build copies only the files Next.js can see the app
  // import. Sentry's server tracing loads a Node "hook" by file path at
  // startup, which Next.js can't see, so production logged "Failed to register
  // diagnostics-channel injection hooks" and recorded no database or HTTP
  // timing. These are the hook's files: the ES-module builds of Sentry's
  // runtime-injection package and of what it imports (@sentry/core, which
  // imports @sentry/conventions). Recheck after upgrading @sentry/nextjs: the
  // production log line above means a file is missing again.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@sentry/server-runtime-injection/build/esm/**/*.{js,json}",
      "./node_modules/@sentry/core/build/esm/**/*.{js,json}",
      "./node_modules/@sentry/conventions/dist/*.mjs",
    ],
  },
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
  // Quiet locally; print the build plugin's log in CI and whenever it uploads
  // source maps (Railway's builds, which have the token but no CI variable),
  // so the build log shows the upload happened.
  silent: !process.env.CI && !process.env.SENTRY_AUTH_TOKEN,
});
