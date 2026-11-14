import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { query } from "@/lib/db";

export type AppUser = {
  /** EverCent's id (users.id). Reference this from other tables. */
  id: string;
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
 * single lookup.
 */
export const ensureUser = cache(async (): Promise<AppUser> => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const existing = await query<{ id: string }>(
    `UPDATE users SET last_seen_at = now() WHERE clerk_user_id = $1 RETURNING id`,
    [userId],
  );
  if (existing[0]) return { id: existing[0].id, clerkUserId: userId };

  const profile = await currentUser();
  const email = profile?.primaryEmailAddress?.emailAddress ?? null;
  const name = profile?.fullName ?? profile?.username ?? null;

  // ON CONFLICT covers two tabs opening the app at the same moment: whichever
  // INSERT loses the race updates the winner's row instead of failing.
  const inserted = await query<{ id: string }>(
    `INSERT INTO users (clerk_user_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (clerk_user_id)
       DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, last_seen_at = now()
     RETURNING id`,
    [userId, email, name],
  );
  return { id: inserted[0].id, clerkUserId: userId };
});
