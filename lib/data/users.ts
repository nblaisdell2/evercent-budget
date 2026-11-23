import { auth, currentUser } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isDevEnvironment } from "@/lib/app-environment";
import { isAllowedOnDev } from "@/lib/auth/dev-access";
import { PRIVATE_TEST_SITE_URL } from "@/lib/auth/routes";
import { touchUser, upsertUser } from "@/lib/services/users";

/** Errors during this request show which EverCent user hit them: the id only, never email or name. */
function identify(user: AppUser): AppUser {
  Sentry.setUser({ id: String(user.id) });
  return user;
}

export type AppUser = {
  /** EverCent's id (users.id). Reference this from other tables. */
  id: number;
  clerkUserId: string;
};

/**
 * The signed-in person as an EverCent user, creating their `users` row the
 * first time they show up. Call it at the top of every page that's behind
 * sign-in.
 *
 * Signed out: redirects to /sign-in (proxy.ts normally gets there first; this
 * is the second check, right where data is read).
 *
 * Cost: `auth()` reads the session cookie locally, so a returning user costs
 * one small UPDATE. Only a brand-new user triggers `currentUser()`, which calls
 * Clerk's API once to fetch their email and name.
 *
 * Wrapped in React's `cache()` so several calls during one request share a
 * single lookup. The database work itself is in lib/services/users.ts.
 */
export const ensureUser = cache(async (): Promise<AppUser> => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  // The private dev site only: anyone not on DEV_ALLOWED_EMAILS is turned
  // away before a users row exists for them. Costs one Clerk API call per
  // request there, which is fine for a handful of testers. Never runs in
  // production.
  if (isDevEnvironment()) {
    const profile = await currentUser();
    const email = profile?.primaryEmailAddress?.emailAddress;
    if (!isAllowedOnDev(email, process.env.DEV_ALLOWED_EMAILS)) redirect(PRIVATE_TEST_SITE_URL);
  }

  const existingId = await touchUser(userId);
  if (existingId !== null) return identify({ id: existingId, clerkUserId: userId });

  const profile = await currentUser();
  const id = await upsertUser(userId, {
    email: profile?.primaryEmailAddress?.emailAddress ?? null,
    name: profile?.fullName ?? profile?.username ?? null,
  });
  return identify({ id, clerkUserId: userId });
});
