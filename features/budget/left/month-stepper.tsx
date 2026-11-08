"use client";

import { useState } from "react";
import { Chevron } from "@/components/icons";
import type { MonthContext } from "@/lib/domain/types";

/**
 * Month scope for the whole screen: prev/next arrows plus "This Month" and
 * "Latest Month" quick jumps.
 *
 * Stepping only moves a local label for now — real month navigation belongs in
 * the data layer, so this holds an offset and derives a display string rather
 * than pretending to refetch.
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

export function MonthStepper({ month }: { month: MonthContext }) {
  const [offset, setOffset] = useState(0);
  const label = offset === 0 ? month.label : shiftLabel(month.key, offset);

  const chip =
    "grid h-[1.25rem] w-[4.875rem] place-items-center rounded-control text-meta font-bold transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent";

  return (
    <div className="flex flex-col items-center gap-[0.5625rem]">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setOffset((o) => o - 1)}
          className="grid size-[1.375rem] place-items-center rounded-control text-fg-primary hover:bg-surface-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent"
        >
          <Chevron width={19} direction="left" />
        </button>

        <h2 className="text-month font-bold text-fg-primary">{label}</h2>

        <button
          type="button"
          aria-label="Next month"
          onClick={() => setOffset((o) => o + 1)}
          className="grid size-[1.375rem] place-items-center rounded-control text-fg-primary hover:bg-surface-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent"
        >
          <Chevron width={19} direction="right" />
        </button>
      </div>

      <div className="flex w-full items-center justify-between px-[0.6875rem]">
        <button
          type="button"
          aria-pressed={offset === 0}
          onClick={() => setOffset(0)}
          className={
            offset === 0
              ? `${chip} bg-surface-control-strong text-surface-rail`
              : `${chip} border border-border-accent text-fg-accent hover:bg-surface-control`
          }
        >
          This Month
        </button>

        <button
          type="button"
          onClick={() => setOffset(0)}
          className={`${chip} border border-border-accent text-fg-accent hover:bg-surface-control`}
        >
          Latest Month
        </button>
      </div>
    </div>
  );
}
