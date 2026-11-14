import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { EverCentLockup } from "@/components/brand/evercent-logo";
import { buttonStyles } from "@/components/ui/button";
import { APP_HOME, SIGN_IN_URL, SIGN_UP_URL } from "@/lib/auth/routes";

/**
 * The landing page header. Signed out, it offers Log in and Create account;
 * signed in, it skips straight to the budget. `<Show>` decides on the server,
 * so the right buttons are in the first HTML and nothing swaps after load.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-rule bg-surface-app/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4rem] max-w-[72rem] items-center justify-between gap-[1rem] px-[1rem] sm:px-[1.5rem] lg:px-[2rem]">
        <Link
          href="/"
          aria-label="EverCent home"
          className="rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-accent"
        >
          <EverCentLockup size="md" />
        </Link>

        <nav aria-label="Account" className="flex items-center gap-[0.5rem] sm:gap-[0.75rem]">
          <Suspense fallback={<span className="h-control w-[10rem]" />}>
            <Show when="signed-out">
              <Link href={SIGN_IN_URL} className={buttonStyles({ variant: "tinted", size: "nav" })}>
                Log in
              </Link>
              <Link href={SIGN_UP_URL} className={buttonStyles({ variant: "primary", size: "nav" })}>
                Create account
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href={APP_HOME} className={buttonStyles({ variant: "primary", size: "nav" })}>
                Open budget
              </Link>
              <UserButton />
            </Show>
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
