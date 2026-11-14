import { describe, expect, it } from "vitest";
import {
  countSelected,
  getGroupCheckState,
  getHeaderCheckState,
  toggleAll,
  toggleCategory,
  toggleGroup,
  type SelectedIds,
} from "./selection";
import type { Category, CategoryGroup } from "./types";

function category(id: string, groupId: string): Category {
  return {
    id,
    groupId,
    name: id,
    budgetedCents: 0,
    activityCents: 0,
    availableCents: 0,
    targetCents: null,
    monthsAheadFunded: 0,
  };
}

function group(id: string, categoryIds: string[]): CategoryGroup {
  return {
    id,
    name: id,
    kind: "normal",
    budgetedCents: 0,
    activityCents: 0,
    availableCents: 0,
    categories: categoryIds.map((c) => category(c, id)),
  };
}

const bills = group("bills", ["rent", "power"]);
const fun = group("fun", ["coffee"]);
const empty = group("empty", []);
const groups = [bills, fun, empty];

describe("getGroupCheckState", () => {
  it("is unchecked, mixed, or checked by how many categories are selected", () => {
    expect(getGroupCheckState(bills, {})).toBe(false);
    expect(getGroupCheckState(bills, { rent: true })).toBe("mixed");
    expect(getGroupCheckState(bills, { rent: true, power: true })).toBe(true);
  });

  it("treats a group with no categories as unchecked", () => {
    expect(getGroupCheckState(empty, {})).toBe(false);
  });
});

describe("getHeaderCheckState", () => {
  it("looks at every category in every group", () => {
    expect(getHeaderCheckState(groups, {})).toBe(false);
    expect(getHeaderCheckState(groups, { coffee: true })).toBe("mixed");
    expect(getHeaderCheckState(groups, { rent: true, power: true, coffee: true })).toBe(true);
  });
});

describe("toggleGroup", () => {
  it("selects every category when the group is unchecked or mixed", () => {
    expect(toggleGroup(bills, {})).toEqual({ rent: true, power: true });
    expect(toggleGroup(bills, { rent: true })).toEqual({ rent: true, power: true });
  });

  it("clears the group when it is fully checked", () => {
    expect(toggleGroup(bills, { rent: true, power: true })).toEqual({});
  });

  it("leaves other groups' selections alone and doesn't change its input", () => {
    const before: SelectedIds = { coffee: true };
    expect(toggleGroup(bills, before)).toEqual({ coffee: true, rent: true, power: true });
    expect(before).toEqual({ coffee: true });
  });
});

describe("toggleCategory", () => {
  it("turns one category on and off", () => {
    expect(toggleCategory("rent", {})).toEqual({ rent: true });
    expect(toggleCategory("rent", { rent: true })).toEqual({});
  });
});

describe("toggleAll", () => {
  it("selects everything from an empty or partial selection", () => {
    const all = { rent: true, power: true, coffee: true };
    expect(toggleAll(groups, {})).toEqual(all);
    expect(toggleAll(groups, { rent: true })).toEqual(all);
  });

  it("clears everything when everything is selected", () => {
    expect(toggleAll(groups, { rent: true, power: true, coffee: true })).toEqual({});
  });
});

describe("countSelected", () => {
  it("counts selected categories", () => {
    expect(countSelected({})).toBe(0);
    expect(countSelected({ rent: true, coffee: true })).toBe(2);
  });
});
