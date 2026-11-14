import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { M_PLUS_1, Urbanist } from "next/font/google";
import { clerkAppearance, clerkLocalization } from "@/lib/auth/appearance";
import { AFTER_SIGN_OUT_URL, APP_HOME, SIGN_IN_URL, SIGN_UP_URL } from "@/lib/auth/routes";
import "./globals.css";

/* Figma reports Urbanist in Light/Medium/SemiBold/Bold/ExtraBold/Black across
   this screen, and M PLUS 1 Bold for the EverCent wordmark alone. */
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
  display: "swap",
});

const mplus = M_PLUS_1({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-mplus",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EverCent",
  description: "A zero-based budget that runs on your pay schedule and funds future months every payday.",
};

/**
 * ClerkProvider makes the signed-in user available to every page and to Clerk's
 * components. It sits inside <body>, which Clerk's current SDK (Core 3)
 * requires. It reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from the environment
 * (.env.local locally); the URLs come from lib/auth/routes.ts.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${urbanist.variable} ${mplus.variable}`}>
      <body className="font-sans antialiased">
        <ClerkProvider
          appearance={clerkAppearance}
          localization={clerkLocalization}
          signInUrl={SIGN_IN_URL}
          signUpUrl={SIGN_UP_URL}
          signInFallbackRedirectUrl={APP_HOME}
          signUpFallbackRedirectUrl={APP_HOME}
          afterSignOutUrl={AFTER_SIGN_OUT_URL}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
