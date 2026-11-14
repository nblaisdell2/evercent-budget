// Sentry in the browser. Next.js runs this file before the app starts.
import * as Sentry from "@sentry/nextjs";
import { sentryBaseOptions } from "@/lib/sentry";

Sentry.init({
  ...sentryBaseOptions,
  integrations: [
    // Replay records only the moments before an error (rates below), and masks
    // every piece of text, every input and every image, so amounts, names and
    // payees never leave the browser.
    Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: true }),
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});

// Times page-to-page navigation as part of tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
