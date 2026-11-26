"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { throwTestServerError } from "@/app/(app)/debug/sentry/actions";
import { Button } from "@/components/ui/button";

/**
 * Builds the browser test error here, in our own code, so the top frame of its
 * stack trace is this file. In production that frame is minified, and Sentry
 * shows `sentry-test-buttons.tsx` only if the build's source maps uploaded.
 */
function makeBrowserTestError(): Error {
  return new Error("EverCent Sentry test error (browser)");
}

/** The two buttons on /debug/sentry, and an announcement of what happened. */
export function SentryTestButtons() {
  const [status, setStatus] = useState("");
  const [sendingServer, setSendingServer] = useState(false);

  function sendBrowserError() {
    const eventId = Sentry.captureException(makeBrowserTestError());
    setStatus(`Sent a browser test error to Sentry (event ${eventId}).`);
  }

  async function sendServerError() {
    setSendingServer(true);
    setStatus("Sending a server test error…");
    try {
      await throwTestServerError();
      // The action always throws; reaching here would mean it didn't.
      setStatus("The server didn't throw, so nothing was sent.");
    } catch {
      setStatus("Sent a server test error to Sentry.");
    } finally {
      setSendingServer(false);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" size="lg" onClick={sendBrowserError}>
          Send a browser test error
        </Button>
        <Button size="lg" onClick={sendServerError} disabled={sendingServer}>
          Send a server test error
        </Button>
      </div>
      <p aria-live="polite" className="mt-4 min-h-6 text-body text-fg-secondary">
        {status}
      </p>
    </>
  );
}
