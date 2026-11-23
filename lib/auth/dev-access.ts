/**
 * Who may use the private dev site (dev.testapisite.net).
 *
 * Clerk's Invite-only access mode on the development instance is the main
 * gate. This is the backstop, in case someone gets an account another way
 * (for example a social sign-in): DEV_ALLOWED_EMAILS on the dev environment
 * lists the emails allowed in, separated by commas. It's set by hand on
 * Railway and never written in git.
 *
 * Fails closed: an empty or missing list lets nobody in. Only used on dev
 * (see ensureUser in lib/data/users.ts); production never checks it.
 */
export function parseAllowedEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedOnDev(
  email: string | null | undefined,
  rawAllowList: string | undefined,
): boolean {
  if (!email) return false;
  return parseAllowedEmails(rawAllowList).has(email.trim().toLowerCase());
}
