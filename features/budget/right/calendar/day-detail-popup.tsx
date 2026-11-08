import { formatDollars } from "@/lib/format/currency";
import type { CalendarDay, CalendarEventKind } from "@/lib/domain/types";

const DOT_COLOR: Record<CalendarEventKind, string> = {
  payday: "bg-event-payday",
  expense: "bg-event-expense",
};

/**
 * The day-detail overlay. Positioned by its parent; sized to Figma's 162x75 with
 * the accent border and the faint white outer glow from node 53:22.
 *
 * The "#10 (out of 26)" paycheck counter is a Figma sibling of the popup frame
 * but sits visually inside it, so it lives here.
 */
export function DayDetailPopup({
  day,
  monthLabel,
  paycheckIndex,
  paycheckTotal,
}: {
  day: CalendarDay;
  monthLabel: string;
  paycheckIndex: number;
  paycheckTotal: number;
}) {
  const [monthName, year] = monthLabel.split(" ");
  const showsPaycheck = day.events.some((event) => event.kind === "payday");

  return (
    <div
      className="pointer-events-none absolute top-[2.125rem] left-[2.8125rem] z-20 w-[7.875rem] rounded-control border border-border-accent bg-surface-panel px-[0.25rem] py-[0.1875rem] shadow-popup"
      role="tooltip"
    >
      <div className="flex items-baseline justify-between gap-[0.3125rem]">
        <p className="text-meta font-extrabold text-fg-primary">
          {monthName} {day.day} {year}
        </p>
      </div>

      <div aria-hidden="true" className="my-[0.125rem] h-px bg-border-accent" />

      <ul className="flex flex-col gap-[0.125rem]">
        {day.events.map((event, index) => (
          <li key={event.id} className="flex items-center gap-[0.1875rem] text-micro text-fg-primary">
            <span
              aria-hidden="true"
              className={`size-[0.25rem] shrink-0 rounded-full ${DOT_COLOR[event.kind]}`}
            />
            <span className="truncate font-medium">{event.label}</span>

            {/* The paycheck counter sits on the first row, right-aligned. */}
            {index === 0 && showsPaycheck && (
              <span className="ml-auto shrink-0 font-medium tabular-nums">
                #{paycheckIndex} (out of {paycheckTotal})
              </span>
            )}

            {event.amountCents !== null && (
              <span className="ml-auto shrink-0 font-extrabold tabular-nums">
                {formatDollars(event.amountCents)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
