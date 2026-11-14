import { describe, expect, it } from "vitest";
import {
  centsSchema,
  idSchema,
  isoDateSchema,
  monthKeySchema,
  nameSchema,
  nonNegativeCentsSchema,
} from "./common";

describe("centsSchema", () => {
  it("accepts whole cents, including negatives", () => {
    for (const value of [0, 1, -500, 123_456]) {
      expect(centsSchema.safeParse(value).success).toBe(true);
    }
  });

  it("rejects fractions, text, and amounts too big to store exactly", () => {
    for (const value of [1.5, Number.NaN, "100", Number.MAX_SAFE_INTEGER + 1]) {
      expect(centsSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("nonNegativeCentsSchema", () => {
  it("rejects negative amounts", () => {
    expect(nonNegativeCentsSchema.safeParse(0).success).toBe(true);
    expect(nonNegativeCentsSchema.safeParse(-1).success).toBe(false);
  });
});

describe("monthKeySchema", () => {
  it("accepts YYYY-MM", () => {
    expect(monthKeySchema.safeParse("2026-11").success).toBe(true);
    expect(monthKeySchema.safeParse("2027-01").success).toBe(true);
  });

  it("rejects other shapes and impossible months", () => {
    for (const value of ["2026-13", "2026-00", "2026-1", "26-11", "2026-11-14"]) {
      expect(monthKeySchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("isoDateSchema", () => {
  it("accepts real calendar days", () => {
    expect(isoDateSchema.safeParse("2026-11-14").success).toBe(true);
    expect(isoDateSchema.safeParse("2028-02-29").success).toBe(true);
  });

  it("rejects impossible days and other formats", () => {
    for (const value of ["2026-02-30", "2027-02-29", "11/14/2026", "2026-11-14T00:00:00Z"]) {
      expect(isoDateSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("idSchema", () => {
  it("accepts a positive whole number or its text form", () => {
    expect(idSchema.parse(42)).toBe(42);
    expect(idSchema.parse("42")).toBe(42);
  });

  it("rejects anything else", () => {
    for (const value of [0, -1, 1.5, "abc", ""]) {
      expect(idSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("nameSchema", () => {
  it("trims surrounding spaces", () => {
    expect(nameSchema.parse("  Groceries ")).toBe("Groceries");
  });

  it("rejects empty and overlong names", () => {
    expect(nameSchema.safeParse("   ").success).toBe(false);
    expect(nameSchema.safeParse("x".repeat(101)).success).toBe(false);
  });
});
