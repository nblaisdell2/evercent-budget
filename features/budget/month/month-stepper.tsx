"use client";

import { Chevron } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { MonthContext } from "@/lib/domain/types";
import { useMonthOffset } from "./month-offset";
import { cn } from "@/lib/cn";

/**
 * Month scope for the whole screen: prev/next arrows plus "This month" and
 * "Latest month" quick jumps.
 *
 * Stepping only moves a label for now — real month navigation belongs in the
 * data layer, so this holds an offset and derives a display string rather than
 * pretending to refetch.
 */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function shiftLabel(key: string, offset: number): string {
  const [yearPart, monthPart] = key.split("-");
  const baseIndex = Number(monthPart) - 1 + offset;
  const year = Number(yearPart) + Math.floor(baseIndex / 12);
  const monthIndex = ((baseIndex % 12) + 12) % 12;
  return `${MONTHS[monthIndex]} ${year}`;
}

export function MonthStepper({ month, layout }: { month: MonthContext; layout: "panel" | "bar" }) {
  const [offset, setOffset] = useMonthOffset();
  const label = offset === 0 ? month.label : shiftLabel(month.key, offset);
  const inPanel = layout === "panel";

  const arrowSize = inPanel ? "iconSmall" : "icon";
  const jumpSize = inPanel ? "chip" : "md";
  const jumpWidth = inPanel ? "flex-auto" : "max-md:h-5.5 max-md:text-meta";

  return (
    <div
      className={
        inPanel
          ? "@container/month flex flex-col gap-1.5"
          : "flex flex-wrap items-center gap-x-4 gap-y-1"
      }
    >
      <div className={cn("flex items-center gap-1 max-md:gap-0.5", inPanel && "justify-between")}>
        <Button size={arrowSize} aria-label="Previous month" onClick={() => setOffset(offset - 1)}>
          <Chevron width={11} direction="left" />
        </Button>

        {/* In the bar, the minimum width keeps the arrows still as the name changes. */}
        <h2
          className={cn(
            "text-center font-bold text-fg-primary",
            inPanel
              ? "min-w-0 truncate text-month @max-[12.5rem]/month:text-group"
              : "min-w-37 text-month max-md:min-w-26 max-md:text-group",
          )}
        >
          {label}
        </h2>

        <Button size={arrowSize} aria-label="Next month" onClick={() => setOffset(offset + 1)}>
          <Chevron width={11} direction="right" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size={jumpSize}
          variant={offset === 0 ? "selected" : "tinted"}
          aria-pressed={offset === 0}
          onClick={() => setOffset(0)}
          className={jumpWidth}
        >
          This month
        </Button>
        <Button size={jumpSize} onClick={() => setOffset(0)} className={jumpWidth}>
          Latest month
        </Button>
      </div>
    </div>
  );
}
