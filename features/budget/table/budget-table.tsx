"use client";

import { useReducer } from "react";
import { Chevron } from "@/components/icons";
import { CheckBox } from "@/components/ui/check-box";
import { getGroupCheckState, getHeaderCheckState } from "@/lib/domain/selection";
import type { CategoryGroup } from "@/lib/domain/types";
import { CategoryRow, GroupRow } from "./budget-rows";
import {
  cellId,
  initialTableState,
  tableReducer,
  type EditableColumn,
} from "./table-reducer";

/**
 * The one unavoidable client boundary on this screen.
 *
 * `role="treegrid"` rather than <table>: a two-level expandable hierarchy with
 * multi-select is exactly what treegrid describes, and CSS Grid gives the pixel
 * column control that <table> fights. Full keyboard navigation is out of scope
 * for this pass, but the roles cost nothing now and make adding it mechanical.
 */
export function BudgetTable({ groups }: { groups: CategoryGroup[] }) {
  const [state, dispatch] = useReducer(tableReducer, initialTableState);

  const headerState = getHeaderCheckState(groups, state.selectedRowIds);
  const anyCollapsed = Object.keys(state.collapsedGroupIds).length > 0;

  /** Local edits layered over the source data. */
  function effective(rowId: string, column: EditableColumn, fallback: number) {
    const edited = state.edits[cellId(rowId, column)];
    return edited ?? fallback;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden" role="treegrid" aria-label="Budget">
      {/* Header row. The accent-colored top rule is Figma's Line 4 (#5555f3),
          distinct from the neutral #464646 row separators below it. */}
      <div
        role="row"
        className="budget-grid h-rowhead shrink-0 border-y border-border-rule border-t-border-accent pr-[0.375rem] @max-xl/center:h-auto @max-xl/center:min-h-[2.5rem] @max-xl/center:py-[0.25rem]"
      >
        <div role="gridcell" data-col="lead" className="grid place-items-center">
          <button
            type="button"
            aria-label={anyCollapsed ? "Expand all groups" : "Collapse all groups"}
            onClick={() =>
              dispatch(anyCollapsed ? { type: "expandAll" } : { type: "collapseAll", groups })
            }
            className="grid size-[1.1875rem] place-items-center rounded text-fg-primary hover:bg-surface-control focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-accent"
          >
            <Chevron width={12} direction={anyCollapsed ? "right" : "down"} />
          </button>
        </div>

        <div role="gridcell" data-col="check" className="grid place-items-center">
          <CheckBox
            checked={headerState}
            onChange={() => dispatch({ type: "toggleAllSelected", groups })}
            ariaLabel="Select all categories"
          />
        </div>

        {/* The header uses the same budget-grid utility as every body row, so
            in stacked mode it restructures identically and ends up reading as a
            legend for the two-line rows beneath it. */}
        <div
          role="columnheader"
          data-col="label"
          className="text-colhead font-light tracking-[0.04em] text-fg-muted"
        >
          GROUP / CATEGORY
        </div>
        <div
          role="columnheader"
          data-col="budgeted"
          className="text-right text-colhead font-light tracking-[0.04em] text-fg-muted"
        >
          BUDGETED
        </div>
        <div
          role="columnheader"
          data-col="activity"
          className="text-right text-colhead font-light tracking-[0.04em] text-fg-muted"
        >
          ACTIVITY
        </div>
        <div
          role="columnheader"
          data-col="available"
          className="text-right text-colhead font-light tracking-[0.04em] text-fg-muted"
        >
          AVAILABLE
        </div>
      </div>

      {/* min-h-0 is load-bearing: a flex item defaults to min-height:auto and
          refuses to shrink below its content, which puts the scrollbar on the
          wrong element. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {groups.map((group) => {
          const collapsed = Boolean(state.collapsedGroupIds[group.id]);

          return (
            <div key={group.id} role="rowgroup">
              <GroupRow
                group={group}
                collapsed={collapsed}
                checkState={getGroupCheckState(group, state.selectedRowIds)}
                onToggleCollapsed={() =>
                  dispatch({ type: "toggleGroupCollapsed", groupId: group.id })
                }
                onToggleSelected={() => dispatch({ type: "toggleGroupSelected", group })}
              />

              {!collapsed &&
                group.categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    selected={Boolean(state.selectedRowIds[category.id])}
                    budgetedCents={effective(category.id, "budgeted", category.budgetedCents)}
                    availableCents={effective(category.id, "available", category.availableCents)}
                    editingCellId={state.editingCellId}
                    onToggleSelected={() =>
                      dispatch({ type: "toggleCategorySelected", categoryId: category.id })
                    }
                    onStartEdit={(column) =>
                      dispatch({ type: "startEdit", rowId: category.id, column })
                    }
                    onCommitEdit={(column, cents) =>
                      dispatch({ type: "commitEdit", rowId: category.id, column, cents })
                    }
                    onCancelEdit={() => dispatch({ type: "cancelEdit" })}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
