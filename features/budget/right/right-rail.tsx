import type { BudgetPageData } from "@/lib/domain/types";
import { ActionsCard } from "./actions-card";
import { ActivityCard } from "./activity-card";
import { CalendarCard } from "./calendar/calendar-card";
import { FutureBudgetCard } from "./future-budget-card";

/** One scrolling column. The activity ledger takes whatever height is spare. */
export function RightRail({
  month,
  activity,
  future,
  calendar,
}: Pick<BudgetPageData, "month" | "activity" | "future" | "calendar">) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-[0.625rem] overflow-y-auto p-[0.625rem]">
      <ActionsCard monthLabel={month.shortLabel} />
      <CalendarCard calendar={calendar} />
      <ActivityCard monthLabel={month.shortLabel} transactions={activity} />
      <FutureBudgetCard allocations={future} />
    </div>
  );
}
