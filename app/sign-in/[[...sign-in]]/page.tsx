import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";

export const metadata: Metadata = { title: "Log in to EverCent" };

/**
 * Clerk's sign-in card. The `[[...sign-in]]` folder name is a catch-all, so
 * Clerk's in-card steps (email code, factor-two, SSO callback) all render here
 * under /sign-in/... without their own pages.
 */
export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn />
    </AuthShell>
  );
}
