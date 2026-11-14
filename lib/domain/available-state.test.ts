import { describe, expect, it } from "vitest";
import { deriveAvailableState, unfundedFraction } from "./available-state";

describe("deriveAvailableState", () => {
  it("is overspent whenever Available is negative, even with a goal", () => {
    expect(deriveAvailableState({ availableCents: -1, targetCents: 10_000 })).toEqual({
      kind: "overspent",
    });
    expect(deriveAvailableState({ availableCents: -500, targetCents: null })).toEqual({
      kind: "overspent",
    });
  });

  it("is zero when nothing is available", () => {
    expect(deriveAvailableState({ availableCents: 0, targetCents: 12_000 })).toEqual({
      kind: "zero",
    });
  });

  it("is funded when there is no goal", () => {
    expect(deriveAvailableState({ availableCents: 500, targetCents: null })).toEqual({
      kind: "funded",
    });
    expect(deriveAvailableState({ availableCents: 500, targetCents: 0 })).toEqual({
      kind: "funded",
    });
  });

  it("is funded when the goal is met or beaten", () => {
    expect(deriveAvailableState({ availableCents: 150_000, targetCents: 150_000 })).toEqual({
      kind: "funded",
    });
    expect(deriveAvailableState({ availableCents: 160_000, targetCents: 150_000 })).toEqual({
      kind: "funded",
    });
  });

  it("is partial, with the funded share, when the goal isn't met yet", () => {
    expect(deriveAvailableState({ availableCents: 42_000, targetCents: 55_000 })).toEqual({
      kind: "partial",
      fundedRatio: 42_000 / 55_000,
    });
  });
});

describe("unfundedFraction", () => {
  it("is the unfunded share of a partial pill", () => {
    expect(unfundedFraction({ kind: "partial", fundedRatio: 0.75 })).toBeCloseTo(0.25);
  });

  it("is 0 for every other state", () => {
    expect(unfundedFraction({ kind: "funded" })).toBe(0);
    expect(unfundedFraction({ kind: "zero" })).toBe(0);
    expect(unfundedFraction({ kind: "overspent" })).toBe(0);
  });
});
