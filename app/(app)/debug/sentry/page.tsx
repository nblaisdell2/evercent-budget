import type { Metadata } from "next";
import { SentryTestButtons } from "@/features/debug/sentry-test-buttons";
import { ensureUser } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Sentry test | EverCent",
  robots: { index: false, follow: false },
};

/* Signed-in check on every request. */
export const dynamic = "force-dynamic";

/**
 * A hidden page (not in the nav) for checking error monitoring end to end:
 * each button sends a deliberate error to Sentry, so you can confirm that the
 * report arrives, that its stack trace shows the real source files (source
 * maps), and that production's alert emails go out. See README "Error
 * monitoring (Sentry)".
 */
export default async function SentryTestPage() {
  await ensureUser();

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-app p-8 text-fg-primary">
      <section aria-labelledby="sentry-test-title" className="w-full max-w-md">
        <h1 id="sentry-test-title" className="text-title font-bold">
          Sentry test
        </h1>
        <p className="mt-3 text-body text-fg-secondary">
          Each button sends a test error to Sentry, the error-monitoring service. Use it to check
          that errors are reported with readable stack traces and that alerts arrive. Nothing about
          your budget is sent.
        </p>
        <SentryTestButtons />
      </section>
    </main>
  );
}
