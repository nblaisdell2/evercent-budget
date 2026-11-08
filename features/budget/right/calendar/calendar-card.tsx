"use client";

import { useState } from "react";
import { RailSection } from "@/components/ui/rail-section";
import type { CalendarMonth } from "@/lib/domain/types";
import { DayDetail } from "./day-detail";
import { billsInPayPeriod, payPeriodOfEachCell } from "./pay-periods";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * The paycheck calendar, and the one loud thing on the right rail.
 *
 * Paydays are solid green coins and bills are amber dots beneath the date.
 * Selecting a day highlights its whole pay period, running from one payday to
 * the next, because the question this answers is "what does this paycheck have
 * to cover?"
 *
 * `cells` arrives pre-flattened from the data layer with leading nulls for the
 * blank days before the 1st, so a cell's weekday is just its index modulo 7 and
 * no date arithmetic happens here.
 */
export function CalendarCard({ calendar }: { calendar: CalendarMonth }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(calendar.defaultSelectedDay);

  const monthName = calendar.label.split(" ")[0];
  const periods = payPeriodOfEachCell(calendar.cells);
  const selectedIndex =
    selectedDay === null ? -1 : calendar.cells.findIndex((cell) => cell?.day === selectedDay);
  const selected = selectedIndex === -1 ? null : calendar.cells[selectedIndex];
  const selectedPeriod = selectedIndex === -1 ? null : periods[selectedIndex];

  /* Hidden on a very narrow rail so the month name always fits in the band. */
  const legend = (
    <span className="hidden items-center gap-[0.5rem] text-meta font-medium text-fg-muted @[14.5rem]/rail-section:flex">
      <span className="flex items-center gap-[0.25rem]">
        <span aria-hidden="true" className="size-[0.5rem] rounded-full bg-event-payday" />
        Payday
      </span>
      <span className="flex items-center gap-[0.25rem]">
        <span aria-hidden="true" className="size-[0.3125rem] rounded-full bg-event-expense" />
        Bill
      </span>
    </span>
  );

  return (
    <RailSection title={calendar.label} summary={legend} bodyClassName="p-[0.5rem]">
      <div className="grid grid-cols-7 text-center text-meta font-medium text-fg-muted">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-[0.1875rem] grid grid-cols-7 gap-y-[0.125rem]">
        {calendar.cells.map((cell, index) => {
          if (cell === null) {
            return <span key={`blank-${index}`} aria-hidden="true" />;
          }

          const isSelected = cell.day === selectedDay;
          const isPayday = cell.events.some((event) => event.kind === "payday");
          const bills = cell.events.filter((event) => event.kind === "expense");

          /* The band is drawn cell by cell, then rounded wherever it starts or
             stops on a given week, the way a date-range picker shows a range. */
          const inBand = selectedPeriod !== null && periods[index] === selectedPeriod;
          const bandStarts = inBand && (index % 7 === 0 || periods[index - 1] !== selectedPeriod);
          const bandEnds = inBand && (index % 7 === 6 || periods[index + 1] !== selectedPeriod);

          const description = [
            `${monthName} ${cell.day}`,
            isPayday ? "payday" : null,
            bills.length > 0 ? `${bills.length} ${bills.length === 1 ? "bill" : "bills"}` : null,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <div
              key={cell.day}
              className={[
                "flex h-[2.25rem] flex-col items-center pt-[0.125rem] transition-colors motion-reduce:transition-none",
                inBand ? "bg-surface-band" : "",
                bandStarts ? "rounded-l-[1.125rem]" : "",
                bandEnds ? "rounded-r-[1.125rem]" : "",
              ].join(" ")}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={description}
                onClick={() => setSelectedDay(isSelected ? null : cell.day)}
                className={[
                  "grid size-[1.625rem] shrink-0 place-items-center rounded-full text-row tabular-nums transition-colors motion-reduce:transition-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-fg-primary",
                  "aria-pressed:outline-2 aria-pressed:outline-offset-0 aria-pressed:outline-fg-primary",
                  isPayday
                    ? "bg-event-payday font-bold text-fg-on-fill"
                    : "font-medium text-fg-primary hover:bg-surface-control",
                ].join(" ")}
              >
                {cell.day}
              </button>

              {bills.length > 0 && (
                <span aria-hidden="true" className="mt-[0.1875rem] flex gap-[0.125rem]">
                  {bills.slice(0, 3).map((bill) => (
                    <span key={bill.id} className="size-[0.3125rem] rounded-full bg-event-expense" />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <DayDetail
        day={selected}
        dateLabel={`${WEEKDAY_NAMES[selectedIndex % 7]}, ${monthName} ${selectedDay}`}
        paycheckLabel={
          selectedPeriod
            ? `Paycheck ${calendar.paycheckIndex + selectedPeriod - 1} of ${calendar.paycheckTotal}`
            : null
        }
        periodBillsCents={
          selectedPeriod === null ? 0 : billsInPayPeriod(calendar.cells, periods, selectedPeriod)
        }
      />
    </RailSection>
  );
}
