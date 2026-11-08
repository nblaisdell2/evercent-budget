"use client";

import { useState } from "react";
import type { CalendarEventKind, CalendarMonth } from "@/lib/domain/types";
import { DayDetailPopup } from "./day-detail-popup";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DOT_COLOR: Record<CalendarEventKind, string> = {
  payday: "bg-event-payday",
  expense: "bg-event-expense",
};

/**
 * The paycheck calendar.
 *
 * `cells` arrives pre-flattened from the data layer with leading nulls for the
 * blank days before the 1st, so this component performs no date arithmetic at
 * all — when real logic lands, first-weekday and days-in-month computation moves
 * into the repository and nothing here changes.
 *
 * The popup is statically anchored at Figma's offsets (58, 43) rather than
 * tracking the selected cell. Proper anchoring with edge-flipping wants
 * @floating-ui/react; deliberately deferred. See DESIGN-NOTES.md.
 */
export function CalendarCard({ calendar }: { calendar: CalendarMonth }) {
  const [selectedDay, setSelectedDay] = useState<number | null>(calendar.defaultSelectedDay);

  const selected =
    selectedDay === null
      ? null
      : (calendar.cells.find((cell) => cell?.day === selectedDay) ?? null);

  return (
    /* min-h rather than a fixed h: Figma's grid is a 29-day month needing 5
       rows, but a 31-day month starting Saturday needs 6. A fixed height would
       clip that last row with no way to reach it. */
    <div className="relative min-h-[12.3125rem] shrink-0 rounded-card border border-border-accent bg-surface-panel px-[0.25rem] pt-[0.375rem] pb-[0.3125rem]">
      <div className="grid grid-cols-7 text-center text-meta font-medium text-fg-primary">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div aria-hidden="true" className="mt-[0.3125rem] h-px bg-border-accent" />

      {/* Cell + gap reproduces Figma's row pitch proportionally (day rows sat
          at y = 809, 852, 895, 939, 983 — a 43.5px pitch at the old scale). */}
      <div className="grid grid-cols-7 gap-y-[0.375rem] pt-[0.4375rem]">
        {calendar.cells.map((cell, index) => {
          if (cell === null) {
            return <span key={`blank-${index}`} aria-hidden="true" />;
          }

          const isSelected = cell.day === selectedDay;

          return (
            <button
              key={cell.day}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${calendar.label} ${cell.day}${
                cell.events.length ? `, ${cell.events.length} event(s)` : ""
              }`}
              onClick={() => setSelectedDay(isSelected ? null : cell.day)}
              className="relative mx-auto grid size-calcell place-items-center rounded-full text-meta font-medium tabular-nums text-fg-primary transition-colors hover:bg-surface-control focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-accent aria-pressed:bg-surface-control-strong"
            >
              {cell.day}

              {cell.events.length > 0 && (
                <span className="absolute -top-[0.0625rem] flex gap-[0.125rem]">
                  {cell.events.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      aria-hidden="true"
                      className={`size-[0.25rem] rounded-full ${DOT_COLOR[event.kind]}`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && selected.events.length > 0 && (
        <DayDetailPopup
          day={selected}
          monthLabel={calendar.label}
          paycheckIndex={calendar.paycheckIndex}
          paycheckTotal={calendar.paycheckTotal}
        />
      )}
    </div>
  );
}
