import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cn, THEME_FONTS, THEME_RADII, THEME_SPACING, THEME_TEXT_SIZES } from "./cn";

describe("cn", () => {
  it("drops falsy values", () => {
    expect(cn("px-2", false, undefined, null, "", "py-1")).toBe("px-2 py-1");
  });

  it("lets a later class replace an earlier one that sets the same thing", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("h-control", "h-10")).toBe("h-10");
    expect(cn("rounded-control", "rounded-card")).toBe("rounded-card");
  });

  it("keeps a custom font size next to a text color", () => {
    expect(cn("text-row text-fg-muted")).toBe("text-row text-fg-muted");
    expect(cn("text-group", "text-money-inflow")).toBe("text-group text-money-inflow");
  });

  it("lets a later custom font size replace an earlier one", () => {
    expect(cn("text-nav font-bold", "text-group")).toBe("font-bold text-group");
  });

  it("keeps a line height when a font size comes after it", () => {
    expect(cn("leading-none", "text-[1.125rem]")).toBe("leading-none text-[1.125rem]");
  });

  it("keeps a side override of a custom radius", () => {
    expect(cn("rounded-control", "rounded-l-none")).toBe("rounded-control rounded-l-none");
  });
});

describe("cn knows every token in app/globals.css", () => {
  const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
  const theme = css.slice(css.indexOf("@theme inline {"));
  const tokens = (prefix: string) =>
    [...theme.matchAll(new RegExp(`^\\s*--${prefix}-([a-z0-9]+(?:-[a-z0-9]+)*):`, "gm"))]
      .map((match) => match[1])
      // --text-display--line-height is a modifier of a size, not a size.
      .filter((name) => !name.includes("--"))
      .sort();

  it.each([
    ["text", THEME_TEXT_SIZES],
    ["spacing", THEME_SPACING],
    ["radius", THEME_RADII],
    ["font", THEME_FONTS],
  ])("--%s-* tokens match lib/cn.ts", (prefix, registered) => {
    expect([...registered].sort()).toEqual(tokens(prefix));
  });
});
