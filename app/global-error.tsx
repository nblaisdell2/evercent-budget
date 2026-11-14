"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { buttonStyles } from "@/components/ui/button";
import "./globals.css";

/**
 * The last-resort error screen: Next.js shows it when an error escapes every
 * page, replacing the whole layout (so it brings its own <html> and <body>).
 * It reports the error to Sentry and offers a way back.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body className="font-sans antialiased">
        <main className="grid min-h-dvh place-items-center bg-surface-app p-8 text-fg-primary">
          <div className="max-w-md text-center">
            <h1 className="text-title font-bold">Something went wrong</h1>
            <p className="mt-3 text-body text-fg-secondary">
              EverCent hit an unexpected error and has reported it. Try again, or head back to the
              start.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className={buttonStyles({ variant: "primary", size: "lg" })}
              >
                Try again
              </button>
              {/* A plain link on purpose: it reloads the app from scratch. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className={buttonStyles({ variant: "tinted", size: "lg" })}>
                Home page
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
