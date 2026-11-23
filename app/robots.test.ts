import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";

describe("robots.txt", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("turns every crawler away from the dev site", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "dev");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("lets crawlers in on production", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", undefined);
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });
  });
});
