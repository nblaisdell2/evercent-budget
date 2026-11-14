import { describe, expect, it } from "vitest";
import type { CategoryGroup } from "@/lib/domain/types";
import { cellId, initialTableState, tableReducer, type TableState } from "./table-reducer";

function group(id: string, kind: CategoryGroup["kind"] = "normal"): CategoryGroup {
  return {
    id,
    name: id,
    kind,
    budgetedCents: 0,
    activityCents: 0,
    availableCents: 0,
    categories: [],
  };
}

describe("tableReducer: collapsing", () => {
  it("toggles one group open and closed", () => {
    const collapsed = tableReducer(initialTableState, {
      type: "toggleGroupCollapsed",
      groupId: "bills",
    });
    expect(collapsed.collapsedGroupIds).toEqual({ bills: true });

    const reopened = tableReducer(collapsed, { type: "toggleGroupCollapsed", groupId: "bills" });
    expect(reopened.collapsedGroupIds).toEqual({});
  });

  it("collapse all skips the Hidden group, which can't collapse", () => {
    const state = tableReducer(initialTableState, {
      type: "collapseAll",
      groups: [group("bills"), group("fun"), group("hidden", "hidden")],
    });
    expect(state.collapsedGroupIds).toEqual({ bills: true, fun: true });
  });

  it("expand all clears every collapsed group", () => {
    const state: TableState = { ...initialTableState, collapsedGroupIds: { bills: true } };
    expect(tableReducer(state, { type: "expandAll" }).collapsedGroupIds).toEqual({});
  });
});

describe("tableReducer: editing", () => {
  it("opens one cell at a time", () => {
    const first = tableReducer(initialTableState, {
      type: "startEdit",
      rowId: "rent",
      column: "budgeted",
    });
    expect(first.editingCellId).toBe("rent:budgeted");

    const second = tableReducer(first, { type: "startEdit", rowId: "power", column: "available" });
    expect(second.editingCellId).toBe("power:available");
  });

  it("commit stores the amount and closes the cell", () => {
    const editing = tableReducer(initialTableState, {
      type: "startEdit",
      rowId: "rent",
      column: "budgeted",
    });
    const committed = tableReducer(editing, {
      type: "commitEdit",
      rowId: "rent",
      column: "budgeted",
      cents: 200_000,
    });
    expect(committed.editingCellId).toBeNull();
    expect(committed.edits[cellId("rent", "budgeted")]).toBe(200_000);
  });

  it("cancel closes the cell without storing anything", () => {
    const editing = tableReducer(initialTableState, {
      type: "startEdit",
      rowId: "rent",
      column: "budgeted",
    });
    const cancelled = tableReducer(editing, { type: "cancelEdit" });
    expect(cancelled.editingCellId).toBeNull();
    expect(cancelled.edits).toEqual({});
  });

  it("never changes the state it was given", () => {
    const before = structuredClone(initialTableState);
    tableReducer(initialTableState, { type: "toggleGroupCollapsed", groupId: "bills" });
    tableReducer(initialTableState, {
      type: "commitEdit",
      rowId: "rent",
      column: "budgeted",
      cents: 1,
    });
    expect(initialTableState).toEqual(before);
  });
});
