import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

/**
 * Settings shared by EverCent's three Sentry setups: the browser
 * (instrumentation-client.ts), the Node server (sentry.server.config.ts) and
 * the edge runtime that runs proxy.ts (sentry.edge.config.ts).
 *
 * The DSN only says where to send events; it isn't a secret. It comes from
 * NEXT_PUBLIC_SENTRY_DSN (.env.local locally, .railway/railway.ts on
 * Railway). Without it Sentry does nothing, which is what CI and tests want.
 *
 * PRIVACY: EverCent handles people's money, so Sentry gets the error and
 * where it happened, not the person's data. The settings below stop it from
 * collecting IP addresses, emails, cookies, request and response bodies
 * (amounts, names), database query values, and local variables. People are
 * identified only by their EverCent id (see ensureUser in lib/data/users.ts).
 * Don't loosen these without asking; lib/sentry.test.ts fails if they change.
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * The only request headers whose values Sentry receives; every other header
 * arrives as its name with the value "[Filtered]". An allow-list rather than
 * a deny-list, because Clerk adds its own headers (some encrypted session
 * data) whose names Sentry's built-in filter doesn't recognize.
 */
const SAFE_HEADERS = ["accept", "content-type", "host", "user-agent"];

export const SENTRY_PRIVACY: NonNullable<NodeOptions["dataCollection"]> = {
  userInfo: false,
  cookies: false,
  httpHeaders: { allow: SAFE_HEADERS },
  httpBodies: [],
  databaseQueryData: false,
  stackFrameVariables: false,
  queues: false,
  genAI: { inputs: false, outputs: false },
};

/** Options every runtime uses. */
export const sentryBaseOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: isDevelopment ? "development" : "production",
  // Every trace locally, so you can see one while working; 10% in production.
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,
  dataCollection: SENTRY_PRIVACY,
} satisfies BrowserOptions & NodeOptions & EdgeOptions;
