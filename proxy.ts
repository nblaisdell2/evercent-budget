import { clerkMiddleware } from "@clerk/nextjs/server";
import { isProtectedPath, SIGN_IN_URL, SIGN_UP_URL } from "@/lib/auth/routes";

/**
 * Runs before every page and API request (Next.js 16 calls this file "proxy";
 * older versions called it "middleware").
 *
 * clerkMiddleware reads the session cookie and makes `auth()` work everywhere
 * downstream. On its own it blocks nothing, so the landing page, sign-in pages
 * and API routes stay public. For the app's own sections, a signed-out visitor
 * is sent to /sign-in and brought back to the page they asked for afterward.
 *
 * This is the front door. Each app page also calls `ensureUser()` (see
 * lib/data/users.ts), which checks again right where the data is read.
 */
export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedPath(req.nextUrl.pathname)) {
      await auth.protect();
    }
  },
  { signInUrl: SIGN_IN_URL, signUpUrl: SIGN_UP_URL },
);

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and Railway's health check, which
    // must answer 200 without depending on Clerk being reachable.
    "/((?!_next|api/health|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes (except the health check above).
    "/(api(?!/health)|trpc)(.*)",
    // Clerk's own frontend API routes.
    "/__clerk/(.*)",
  ],
};
