/**
 * Which copy of EverCent this is:
 *
 *   production  app.testapisite.net, real people (Railway environment "production")
 *   dev         dev.testapisite.net, invited testers and test data only
 *               (Railway environment "dev", from the `dev` git branch)
 *   local       your own computer (`npm run dev`)
 *
 * NEXT_PUBLIC_APP_ENV is set to "dev" only on the dev environment (see
 * .railway/railway.ts) and is baked into the build (Dockerfile ARG), so the
 * browser and the server agree. Anything else counts as production, so a
 * missing variable can never switch on dev-only behavior for real users.
 *
 * Plain TypeScript with no framework imports, so the phone app can share it.
 */
export type AppEnvironment = "production" | "dev" | "local";

export function appEnvironment(): AppEnvironment {
  // Written out in full (not process.env[name]) so Next.js can inline it.
  if (process.env.NEXT_PUBLIC_APP_ENV === "dev") return "dev";
  if (process.env.NODE_ENV === "development") return "local";
  return "production";
}

export function isDevEnvironment(): boolean {
  return appEnvironment() === "dev";
}
