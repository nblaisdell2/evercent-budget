import type { Cents } from "@/lib/format/currency";
import type { CategoryGroup } from "@/lib/domain/types";
import {
  toggleAll,
  toggleCategory,
  toggleGroup,
  type SelectedIds,
} from "@/lib/domain/selection";

export type EditableColumn = "budgeted" | "available";

/** `${rowId}:${column}` — only one cell may be open at a time. */
export type EditingCellId = string;

export function cellId(rowId: string, column: EditableColumn): EditingCellId {
  return `${rowId}:${column}`;
}

export interface TableState {
  collapsedGroupIds: Record<string, true>;
  selectedRowIds: SelectedIds;
  editingCellId: EditingCellId | null;
  /** Local edits layered over the placeholder data, keyed by cellId. */
  edits: Record<EditingCellId, Cents>;
}

export const initialTableState: TableState = {
  collapsedGroupIds: {},
  selectedRowIds: {},
  editingCellId: null,
  edits: {},
};

export type TableAction =
  | { type: "toggleGroupCollapsed"; groupId: string }
  | { type: "collapseAll"; groups: CategoryGroup[] }
  | { type: "expandAll" }
  | { type: "toggleGroupSelected"; group: CategoryGroup }
  | { type: "toggleCategorySelected"; categoryId: string }
  | { type: "toggleAllSelected"; groups: CategoryGroup[] }
  | { type: "startEdit"; rowId: string; column: EditableColumn }
  | { type: "commitEdit"; rowId: string; column: EditableColumn; cents: Cents }
  | { type: "cancelEdit" };

/**
 * Plain reducer, no JSX, no React imports. If this state ever outgrows one
 * component a store can wrap it verbatim.
 *
 * `commitEdit` writes into `edits` rather than mutating the source data — the
 * exact seam a server action replaces once real logic exists.
 */
export function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "toggleGroupCollapsed": {
      const next = { ...state.collapsedGroupIds };
      if (next[action.groupId]) delete next[action.groupId];
      else next[action.groupId] = true;
      return { ...state, collapsedGroupIds: next };
    }

    case "collapseAll": {
      const next: Record<string, true> = {};
      for (const group of action.groups) {
        if (group.kind === "normal") next[group.id] = true;
      }
      return { ...state, collapsedGroupIds: next };
    }

    case "expandAll":
      return { ...state, collapsedGroupIds: {} };

    case "toggleGroupSelected":
      return { ...state, selectedRowIds: toggleGroup(action.group, state.selectedRowIds) };

    case "toggleCategorySelected":
      return {
        ...state,
        selectedRowIds: toggleCategory(action.categoryId, state.selectedRowIds),
      };

    case "toggleAllSelected":
      return { ...state, selectedRowIds: toggleAll(action.groups, state.selectedRowIds) };

    case "startEdit":
      return { ...state, editingCellId: cellId(action.rowId, action.column) };

    case "commitEdit":
      return {
        ...state,
        editingCellId: null,
        edits: {
          ...state.edits,
          [cellId(action.rowId, action.column)]: action.cents,
        },
      };

    case "cancelEdit":
      return { ...state, editingCellId: null };

    default:
      return state;
  }
}
