import type { Appearance } from "@clerk/ui";
import { dark } from "@clerk/ui/themes";

/**
 * How Clerk's prebuilt components (sign-in, sign-up, the account menu) look.
 *
 * Starts from Clerk's dark theme, then swaps in EverCent's palette from
 * app/globals.css. The colors are literal hex rather than var(--...) because
 * Clerk derives hover and border shades from them in JavaScript, which it can't
 * do with a CSS variable. Keep these in step with the tokens there.
 */
export const clerkAppearance: Appearance = {
  theme: dark,
  variables: {
    colorPrimary: "#5555f3", // --ec-accent
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#000037", // --ec-navy-rail: the card
    colorForeground: "#ffffff",
    colorMutedForeground: "#9d9dc6", // --ec-muted
    colorMuted: "#19192c", // --ec-row
    colorInput: "#000018", // --ec-navy-deep: fields sit "into" the card
    colorInputForeground: "#ffffff",
    colorNeutral: "#ffffff",
    colorBorder: "#3e3e86", // bright enough to outline the social login buttons
    colorDanger: "#ff9090", // --ec-red-soft: readable as text on navy
    colorSuccess: "#2a9635", // --ec-green
    colorWarning: "#d09600", // --ec-amber
    colorRing: "#5555f3",
    colorModalBackdrop: "rgb(0 0 24 / 0.75)",
    fontFamily: "var(--font-urbanist), ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.4375rem", // --radius-control
  },
  elements: {
    // Same footprint as the icon buttons beside it in the budget's left panel.
    userButtonAvatarBox: "size-[1.875rem]",
    // Clerk outlines these at a few percent opacity, which vanishes on navy.
    // Give them the app's tinted-button fill instead, so they read as buttons.
    socialButtonsIconButton: {
      backgroundColor: "#19196d", // --surface-control-solid
      boxShadow: "none",
      border: "1px solid rgb(150 150 235 / 0.22)", // --ec-rule, a touch stronger
      "&:hover": { backgroundColor: "#5555f3" },
    },
  },
};

/**
 * Clerk's wording, where it differs from ours. EverCent's buttons say "Log in",
 * so the card they open says it too. Anything not listed keeps Clerk's default.
 */
export const clerkLocalization = {
  signIn: {
    start: {
      title: "Log in to EverCent",
      subtitle: "Welcome back. Your budget is where you left it.",
      actionText: "New to EverCent?",
      actionLink: "Create an account",
    },
  },
  signUp: {
    start: {
      title: "Create your EverCent account",
      subtitle: "Then tell EverCent when you're paid, and it takes it from there.",
      actionText: "Already have an account?",
      actionLink: "Log in",
    },
  },
};
