// Sentry on the Node.js server (pages, server actions, API routes).
// Loaded by instrumentation.ts.
import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions } from "@/lib/sentry";

Sentry.init(sentryBaseOptions);
