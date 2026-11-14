import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Join Tailwind classes, dropping falsy values and letting a later class beat
 * an earlier one that sets the same thing:
 *
 *   cn("h-control px-2", isActive && "bg-surface-control-strong", className)
 *
 * Use it wherever classes are combined, and always when a component accepts a
 * `className` prop, so a caller's `h-10` really replaces the component's
 * `h-control` instead of the winner depending on stylesheet order.
 *
 * tailwind-merge must be told about EverCent's own tokens from the @theme
 * block in app/globals.css. Without this it would read `text-row` (a font
 * size) as a text COLOR and silently delete it next to `text-fg-muted`.
 * lib/cn.test.ts fails if a token is added to globals.css but not here.
 */

/** --text-* sizes in globals.css. */
export const THEME_TEXT_SIZES = [
  "hero",
  "title",
  "month",
  "nav",
  "group",
  "row",
  "colhead",
  "meta",
  "detail",
  "display",
  "section",
  "lede",
  "body",
];

/** --spacing-* names in globals.css (h-row, w-rail, size-checkbox, ...). */
export const THEME_SPACING = [
  "rail",
  "railmin",
  "railmax",
  "centermin",
  "row",
  "rowhead",
  "pillw",
  "pillh",
  "badge",
  "navitem",
  "control",
  "checkbox",
];

/** --radius-* names in globals.css. */
export const THEME_RADII = ["card", "control", "hero"];

/** --font-* families in globals.css. */
export const THEME_FONTS = ["sans", "brand"];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: THEME_TEXT_SIZES,
      spacing: THEME_SPACING,
      radius: THEME_RADII,
      font: THEME_FONTS,
    },
  },
  override: {
    conflictingClassGroups: {
      // tailwind-merge's default deletes `leading-*` whenever a font size comes
      // after it. In Tailwind v4 a leading-* class wins over the size's own line
      // height regardless of order, so keeping both is what the CSS does.
      "font-size": [],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
