import { clerkSetup } from "@clerk/testing/playwright";

/**
 * Runs once before any test. Fetches a Clerk "testing token", which lets the
 * automated browser past Clerk's bot protection. Only works with the Clerk
 * DEVELOPMENT instance's keys (pk_test_ / sk_test_), never production's.
 */
export default async function globalSetup() {
  const missing = ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    throw new Error(
      `End-to-end tests need Clerk's development keys: ${missing.join(", ")} missing. ` +
        "Locally they belong in .env.local; in CI, in the repository's secrets.",
    );
  }
  await clerkSetup();
}
