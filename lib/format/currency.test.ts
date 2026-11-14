import { describe, expect, it } from "vitest";
import { formatCents, formatCentsAbs, parseCents, toEditableString } from "./currency";

describe("formatCents", () => {
  it("formats whole cents as US dollars", () => {
    expect(formatCents(100_000)).toBe("$1,000.00");
    expect(formatCents(5)).toBe("$0.05");
    expect(formatCents(0)).toBe("$0.00");
  });

  it("puts the minus sign before the dollar sign", () => {
    expect(formatCents(-1_000_000)).toBe("-$10,000.00");
  });
});

describe("formatCentsAbs", () => {
  it("drops the sign, for rows that show direction separately", () => {
    expect(formatCentsAbs(-2_550)).toBe("$25.50");
    expect(formatCentsAbs(2_550)).toBe("$25.50");
  });
});

describe("parseCents", () => {
  it("reads plain numbers as dollars", () => {
    expect(parseCents("10")).toBe(1_000);
    expect(parseCents("12.5")).toBe(1_250);
    expect(parseCents("1234.56")).toBe(123_456);
  });

  it("tolerates a dollar sign, commas and spaces", () => {
    expect(parseCents("$1,000.00")).toBe(100_000);
    expect(parseCents("  42  ")).toBe(4_200);
  });

  it("reads a leading minus as a negative amount", () => {
    expect(parseCents("-3.10")).toBe(-310);
    expect(parseCents("-$3.10")).toBe(-310);
  });

  it("rounds to the nearest cent", () => {
    expect(parseCents("0.999")).toBe(100);
  });

  it("returns null for input that isn't a number, so the edit is cancelled", () => {
    expect(parseCents("")).toBeNull();
    expect(parseCents("   ")).toBeNull();
    expect(parseCents("-")).toBeNull();
    expect(parseCents("abc")).toBeNull();
    expect(parseCents("12.3.4")).toBeNull();
    expect(parseCents("12.50-")).toBeNull();
  });
});

describe("toEditableString", () => {
  it("seeds the input with a bare number: no $, no commas", () => {
    expect(toEditableString(123_456)).toBe("1234.56");
    expect(toEditableString(100_000)).toBe("1000.00");
    expect(toEditableString(-5)).toBe("-0.05");
  });

  it("round-trips through parseCents", () => {
    for (const cents of [0, 1, 99, 100_000, -250_075]) {
      expect(parseCents(toEditableString(cents))).toBe(cents);
    }
  });
});
