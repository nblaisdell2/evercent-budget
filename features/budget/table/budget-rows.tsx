"use client";

import { Chevron } from "@/components/icons";
import { CheckBox } from "@/components/ui/check-box";
import { EditableCurrencyCell } from "@/components/ui/editable-currency-cell";
import { Money } from "@/components/ui/money";
import { deriveAvailableState } from "@/lib/domain/available-state";
import type { CheckState } from "@/lib/domain/selection";
import type { Category, CategoryGroup } from "@/lib/domain/types";
import type { Cents } from "@/lib/format/currency";
import { AvailablePill } from "./available-pill";
import { MonthsAheadBadge } from "./months-ahead-badge";
import type { EditableColumn } from "./table-reducer";

/*
 * Row height is uniform across BOTH group and category rows — `--spacing-row`
 * (34px at --ui-scale 1, down from Figma's 47).
 *
 * Figma's separator lines sat at y = 105, 152, 199, 246 ... — every gap exactly
 * 47. The 49px group-row background rectangles bleed 1px above and below the
 * lines, which is what makes them look taller. Tracking two heights would drift
 * the table ~40px by the bottom row. With border-box sizing, `h-row border-b`
 * totals exactly one row.
 *
 * In stacked mode every row is instead a uniform min-height — still identical
 * across group and category rows, so the invariant is rearranged, not broken.
 *
 * Note also that category rows are NOT x-indented: group label 10:3 and
 * category label 10:105 are both at x=381 in the design. Hierarchy is conveyed
 * by the chevron, the 14px vs 13px type, and the group row's background.
 */
/* The `@max-xl/center` variants are the stacked-layout switch. They must live
   here rather than inside the budget-grid utility, so that the height override
   is an ordinary Tailwind variant and cannot lose a specificity fight with the
   base `h-row` utility. */
const ROW_BASE =
  "budget-grid h-row border-b border-border-rule pr-[0.375rem] " +
  "@max-xl/center:h-auto @max-xl/center:min-h-[3.25rem] @max-xl/center:py-[0.25rem]";

export function GroupRow({
  group,
  collapsed,
  checkState,
  onToggleCollapsed,
  onToggleSelected,
}: {
  group: CategoryGroup;
  collapsed: boolean;
  checkState: CheckState;
  onToggleCollapsed: () => void;
  onToggleSelected: () => void;
}) {
  const collapsible = group.kind === "normal";

  return (
    <div
      role="row"
      aria-level={1}
      aria-expanded={collapsible ? !collapsed : undefined}
      className={`${ROW_BASE} bg-surface-row-group`}
    >
      <div role="gridcell" data-col="lead" className="grid place-items-center">
        {collapsible && (
          <button
            type="button"
            aria-label={`${collapsed ? "Expand" : "Collapse"} ${group.name}`}
            onClick={onToggleCollapsed}
            className="grid size-[1.1875rem] place-items-center rounded text-fg-primary hover:bg-surface-control focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-accent"
          >
            <Chevron width={12} direction={collapsed ? "right" : "down"} />
          </button>
        )}
      </div>

      <div role="gridcell" data-col="check" className="grid place-items-center">
        <CheckBox
          checked={checkState}
          onChange={onToggleSelected}
          ariaLabel={`Select all categories in ${group.name}`}
        />
      </div>

      <div role="gridcell" data-col="label" className="truncate text-group font-bold text-fg-primary">
        {group.name}
      </div>

      <div role="gridcell" data-col="budgeted" className="text-right text-group font-bold text-fg-primary">
        <Money cents={group.budgetedCents} />
      </div>
      <div role="gridcell" data-col="activity" className="text-right text-group font-bold text-fg-primary">
        <Money cents={group.activityCents} />
      </div>
      <div role="gridcell" data-col="available" className="text-right text-group font-bold text-fg-primary">
        <Money cents={group.availableCents} />
      </div>
    </div>
  );
}

export function CategoryRow({
  category,
  selected,
  budgetedCents,
  availableCents,
  editingCellId,
  onToggleSelected,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
}: {
  category: Category;
  selected: boolean;
  /** Effective values, with any local edit already layered in. */
  budgetedCents: Cents;
  availableCents: Cents;
  editingCellId: string | null;
  onToggleSelected: () => void;
  onStartEdit: (column: EditableColumn) => void;
  onCommitEdit: (column: EditableColumn, cents: Cents) => void;
  onCancelEdit: () => void;
}) {
  const state = deriveAvailableState({
    availableCents,
    targetCents: category.targetCents,
  });

  return (
    <div
      role="row"
      aria-level={2}
      aria-selected={selected}
      className={`${ROW_BASE} hover:bg-surface-row-alt`}
    >
      <div role="gridcell" data-col="lead" className="grid place-items-center">
        <MonthsAheadBadge months={category.monthsAheadFunded} />
      </div>

      <div role="gridcell" data-col="check" className="grid place-items-center">
        <CheckBox
          checked={selected}
          onChange={onToggleSelected}
          ariaLabel={`Select ${category.name}`}
        />
      </div>

      <div role="gridcell" data-col="label" className="truncate text-row font-medium text-fg-primary">
        {category.name}
      </div>

      <div role="gridcell" data-col="budgeted" className="flex justify-end">
        <EditableCurrencyCell
          valueCents={budgetedCents}
          isEditing={editingCellId === `${category.id}:budgeted`}
          onStartEdit={() => onStartEdit("budgeted")}
          onCommit={(cents) => onCommitEdit("budgeted", cents)}
          onCancel={onCancelEdit}
          ariaLabel={`Budgeted for ${category.name}`}
          boxClassName="h-pillh w-full rounded-card px-[0.3125rem] text-right"
          className="text-row font-medium text-fg-primary hover:bg-surface-control"
        />
      </div>

      <div role="gridcell" data-col="activity" className="text-right text-row font-medium text-fg-primary">
        <Money cents={category.activityCents} />
      </div>

      <div role="gridcell" data-col="available" className="flex justify-end">
        <AvailablePill
          state={state}
          valueCents={availableCents}
          isEditing={editingCellId === `${category.id}:available`}
          onStartEdit={() => onStartEdit("available")}
          onCommit={(cents) => onCommitEdit("available", cents)}
          onCancel={onCancelEdit}
          label={category.name}
        />
      </div>
    </div>
  );
}
