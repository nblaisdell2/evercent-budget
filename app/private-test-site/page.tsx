import { SignOutButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/features/auth/auth-shell";

export const metadata: Metadata = { title: "Private test site | EverCent" };

/**
 * Dev site only: ensureUser() (lib/data/users.ts) sends signed-in people who
 * aren't on DEV_ALLOWED_EMAILS here. It's public, so it can't loop back into
 * that check, and it says what to do next: sign out.
 */
export default function PrivateTestSitePage() {
  return (
    <AuthShell>
      <section aria-labelledby="private-test-site-title" className="w-full max-w-md text-left">
        <h1 id="private-test-site-title" className="text-section font-extrabold text-fg-primary">
          This is a private test site
        </h1>
        <p className="mt-4 text-body text-fg-secondary">
          EverCent&rsquo;s dev site is open only to invited testers, and the account you signed in
          with isn&rsquo;t on the list. If you were invited, sign out and sign in with the email the
          invitation went to.
        </p>
        <div className="mt-8">
          <SignOutButton>
            <Button variant="primary" size="lg">
              Sign out
            </Button>
          </SignOutButton>
        </div>
      </section>
    </AuthShell>
  );
}
