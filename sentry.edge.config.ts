// Sentry in the edge runtime, where proxy.ts (Clerk's sign-in check) runs.
// Loaded by instrumentation.ts.
import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions } from "@/lib/sentry";

Sentry.init(sentryBaseOptions);
