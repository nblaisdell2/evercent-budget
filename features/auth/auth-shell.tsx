import Link from "next/link";
import { EverCentLockup } from "@/components/brand/evercent-logo";
import type { ReactNode } from "react";

/**
 * The frame around Clerk's sign-in and sign-up cards: the wordmark (back to the
 * landing page) and the card, centered. The card carries its own title, and its
 * colors and wording come from lib/auth/appearance.ts.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-app">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="EverCent home"
          className="rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-accent"
        >
          <EverCentLockup size="md" />
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:items-center sm:pt-0">
        {children}
      </main>
    </div>
  );
}
