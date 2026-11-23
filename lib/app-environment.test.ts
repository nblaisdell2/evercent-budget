import { afterEach, describe, expect, it, vi } from "vitest";
import { appEnvironment, isDevEnvironment } from "./app-environment";

describe("appEnvironment", () => {
  afterEach(() => vi.unstubAllEnvs());

  function withEnv(nodeEnv: string, appEnv: string | undefined) {
    vi.stubEnv("NODE_ENV", nodeEnv);
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", appEnv);
  }

  it("is production when nothing says otherwise", () => {
    withEnv("production", undefined);
    expect(appEnvironment()).toBe("production");
    expect(isDevEnvironment()).toBe(false);
  });

  it("is dev on the dev environment", () => {
    withEnv("production", "dev");
    expect(appEnvironment()).toBe("dev");
    expect(isDevEnvironment()).toBe(true);
  });

  it("is local on your own computer", () => {
    withEnv("development", undefined);
    expect(appEnvironment()).toBe("local");
  });

  it("treats any other value as production, never as dev", () => {
    for (const value of ["", "staging", "DEV", "production"]) {
      withEnv("production", value);
      expect(appEnvironment()).toBe("production");
    }
  });
});
