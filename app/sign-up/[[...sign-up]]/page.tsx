import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";

export const metadata: Metadata = { title: "Create your EverCent account" };

/** Clerk's sign-up card. Catch-all route for the same reason as /sign-in. */
export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp />
    </AuthShell>
  );
}
