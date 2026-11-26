"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { ensureUser } from "@/lib/data/users";

/**
 * Throws on purpose so Sentry records a server error (the "Send a server test
 * error" button on /debug/sentry). Sentry's server-action wrapper reports the
 * error and re-throws it, so the browser sees the action fail. It takes no
 * input, so there's nothing to validate; the message is fixed text with no
 * personal data.
 */
export async function throwTestServerError(): Promise<never> {
  return Sentry.withServerActionInstrumentation(
    "throwTestServerError",
    { headers: await headers() },
    async () => {
      await ensureUser();
      throw new Error("EverCent Sentry test error (server)");
    },
  );
}
