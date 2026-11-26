import { describe, expect, it } from "vitest";
import { isProtectedPath } from "./routes";

describe("isProtectedPath", () => {
  it("protects the hidden debug tools, such as the Sentry test page", () => {
    expect(isProtectedPath("/debug")).toBe(true);
    expect(isProtectedPath("/debug/sentry")).toBe(true);
  });

  it("matches whole path segments, not any path that starts with the same letters", () => {
    expect(isProtectedPath("/debugger")).toBe(false);
  });
});
