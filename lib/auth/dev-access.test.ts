import { describe, expect, it } from "vitest";
import { isAllowedOnDev } from "./dev-access";

describe("isAllowedOnDev", () => {
  const list = " Tester@Example.com, second@example.com ,,";

  it("lets in emails on the list, ignoring case and spaces", () => {
    expect(isAllowedOnDev("tester@example.com", list)).toBe(true);
    expect(isAllowedOnDev("  SECOND@example.com ", list)).toBe(true);
  });

  it("turns away anyone not on the list", () => {
    expect(isAllowedOnDev("stranger@example.com", list)).toBe(false);
    expect(isAllowedOnDev("tester@example.com.evil", list)).toBe(false);
  });

  it("lets nobody in when the list is empty or missing", () => {
    expect(isAllowedOnDev("tester@example.com", "")).toBe(false);
    expect(isAllowedOnDev("tester@example.com", " , ")).toBe(false);
    expect(isAllowedOnDev("tester@example.com", undefined)).toBe(false);
  });

  it("turns away an account with no email", () => {
    expect(isAllowedOnDev(null, list)).toBe(false);
    expect(isAllowedOnDev(undefined, list)).toBe(false);
    expect(isAllowedOnDev("", list)).toBe(false);
  });
});
