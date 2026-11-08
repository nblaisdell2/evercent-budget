import type { BudgetPageData } from "@/lib/domain/types";
import { ActionsCard } from "./actions-card";
import { ActivityCard } from "./activity-card";
import { CalendarCard } from "./calendar/calendar-card";
import { FutureBudgetCard } from "./future-budget-card";

export function RightRail({
  month,
  activity,
  future,
  calendar,
}: Pick<BudgetPageData, "month" | "activity" | "future" | "calendar">) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-[0.375rem] pt-[0.9375rem] pb-[0.5rem]">
      <div className="flex min-h-0 flex-1 flex-col gap-[1.25rem] overflow-y-auto">
        <ActionsCard />
        <ActivityCard monthLabel={month.shortLabel} transactions={activity} />
        <FutureBudgetCard allocations={future} />
      </div>

      {/* Figma leaves ~28px of empty space above the calendar, then pins it to the
          bottom of the rail. mt-auto is the lossless flex translation of that. */}
      <div aria-hidden="true" className="mt-auto h-px shrink-0 bg-border-accent" />
      <div className="pt-[0.5625rem]">
        <CalendarCard calendar={calendar} />
      </div>
    </div>
  );
}
