import { db } from "@/lib/db";

/**
 * EverCent's `users` table: one row per Clerk account (see
 * db/migrations/0003_users.sql).
 *
 * A service: plain functions that take ids and already-validated input and
 * talk to the database. No Next.js, Clerk or React imports, so the same
 * functions serve pages, server actions, API routes (for the future Expo app),
 * scheduled jobs and tests. The Next.js glue (reading the session, redirects)
 * lives in lib/data/users.ts.
 */

export interface UserProfile {
  email: string | null;
  name: string | null;
}

/**
 * Mark a returning user as seen. Returns their EverCent id, or null when the
 * Clerk user has no row yet.
 */
export async function touchUser(clerkUserId: string): Promise<number | null> {
  const row = await db
    .updateTable("users")
    .set({ last_seen_at: new Date() })
    .where("clerk_user_id", "=", clerkUserId)
    .returning("id")
    .executeTakeFirst();
  return row?.id ?? null;
}

/**
 * Create the user's row, or refresh it if it already exists. ON CONFLICT
 * covers two tabs opening the app at the same moment: whichever INSERT loses
 * the race updates the winner's row instead of failing.
 */
export async function upsertUser(clerkUserId: string, profile: UserProfile): Promise<number> {
  const row = await db
    .insertInto("users")
    .values({ clerk_user_id: clerkUserId, email: profile.email, name: profile.name })
    .onConflict((oc) =>
      oc.column("clerk_user_id").doUpdateSet((eb) => ({
        email: eb.ref("excluded.email"),
        name: eb.ref("excluded.name"),
        last_seen_at: new Date(),
      })),
    )
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}
