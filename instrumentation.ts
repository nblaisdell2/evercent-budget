// Next.js runs register() once when the server starts. It must live in the
// project root (beside app/) for production builds to pick it up.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Sends every error thrown while rendering a page, in a server action, API
// route or proxy.ts to Sentry.
export const onRequestError = Sentry.captureRequestError;
