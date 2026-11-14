/**
 * Where sign-in lives and where people land, in one place.
 *
 * These are passed to Clerk as props (`ClerkProvider` in app/layout.tsx and
 * `clerkMiddleware` in proxy.ts) rather than set as NEXT_PUBLIC_CLERK_* env
 * vars, so they're visible in code, identical in every environment, and need
 * nothing configured on Railway.
 */

/** Our own sign-in and sign-up pages (app/sign-in, app/sign-up). */
export const SIGN_IN_URL = "/sign-in";
export const SIGN_UP_URL = "/sign-up";

/** Where someone lands after signing in or creating an account. */
export const APP_HOME = "/budget";

/** Where someone lands after signing out: the public landing page. */
export const AFTER_SIGN_OUT_URL = "/";

/**
 * Routes that need a signed-in user. Each entry also covers everything under
 * it (`/budget` protects `/budget/...`). Add new app sections here.
 */
export const PROTECTED_PREFIXES = ["/budget", "/automation", "/reporting"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
