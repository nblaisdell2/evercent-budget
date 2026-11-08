import type { BudgetSummary, MonthContext } from "@/lib/domain/types";
import { MonthStepper } from "./month-stepper";
import { ToBeBudgetedCard } from "./to-be-budgeted-card";

/**
 * Keeps the month and To Be Budgeted in view while the left panel is off screen:
 * on phones, where it's a drawer, and whenever it's been collapsed. `.ec-topbar`
 * in globals.css decides when this shows, so it's right on first paint.
 *
 * The To Be Budgeted zone sizes itself from the same variable as the right panel
 * beneath it, so the two line up. `min-w-max` lets it outgrow a very narrow panel
 * rather than clip.
 */
export function TopBar({ budget, month }: { budget: BudgetSummary; month: MonthContext }) {
  return (
    <header className="ec-topbar shrink-0 border-b border-border-rule bg-surface-rail">
      <div className="flex-1 py-[0.5rem] pr-[0.625rem] pl-[0.625rem] md:pl-[2.25rem]">
        <MonthStepper month={month} layout="bar" />
      </div>

      <div className="min-w-max basis-[var(--rail-right-w)] py-[0.5rem] pr-[0.625rem] md:pl-[0.625rem]">
        <ToBeBudgetedCard cents={budget.toBeBudgetedCents} layout="bar" />
      </div>
    </header>
  );
}
