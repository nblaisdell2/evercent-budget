import { afterEach, describe, expect, it, vi } from "vitest";
import { SENTRY_PRIVACY, sentryBaseOptions } from "./sentry";

/**
 * EverCent handles people's money, so what Sentry may collect is deliberately
 * narrow. If one of these fails, someone loosened lib/sentry.ts: put it back,
 * or get the person's OK and update the test on purpose.
 */
describe("Sentry privacy settings", () => {
  it("collects no IP addresses, emails, cookies or bodies", () => {
    expect(SENTRY_PRIVACY.userInfo).toBe(false);
    expect(SENTRY_PRIVACY.cookies).toBe(false);
    expect(SENTRY_PRIVACY.httpBodies).toEqual([]);
  });

  it("collects no database values, local variables or queue arguments", () => {
    expect(SENTRY_PRIVACY.databaseQueryData).toBe(false);
    expect(SENTRY_PRIVACY.stackFrameVariables).toBe(false);
    expect(SENTRY_PRIVACY.queues).toBe(false);
    expect(SENTRY_PRIVACY.genAI).toEqual({ inputs: false, outputs: false });
  });

  it("keeps the values of only these harmless headers", () => {
    expect(SENTRY_PRIVACY.httpHeaders).toEqual({
      allow: ["accept", "content-type", "host", "user-agent"],
    });
  });

  it("applies the privacy settings to every runtime", () => {
    expect(sentryBaseOptions.dataCollection).toBe(SENTRY_PRIVACY);
  });
});

describe("Sentry environment and sampling", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadWith(nodeEnv: string) {
    vi.stubEnv("NODE_ENV", nodeEnv);
    vi.resetModules();
    return (await import("./sentry")).sentryBaseOptions;
  }

  it("samples 10% of traces in production", async () => {
    const options = await loadWith("production");
    expect(options.environment).toBe("production");
    expect(options.tracesSampleRate).toBe(0.1);
  });

  it("samples every trace locally, tagged development", async () => {
    const options = await loadWith("development");
    expect(options.environment).toBe("development");
    expect(options.tracesSampleRate).toBe(1);
  });

  it("is off when no DSN is configured, as in CI and tests", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", undefined);
    const options = await loadWith("production");
    expect(options.dsn).toBeUndefined();
  });
});
