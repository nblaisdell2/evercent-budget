import { formatCents, type Cents } from "@/lib/format/currency";
import type { CalendarDay, CalendarEventKind } from "@/lib/domain/types";
import { cn } from "@/lib/cn";

const DOT_COLOR: Record<CalendarEventKind, string> = {
  payday: "bg-event-payday",
  expense: "bg-event-expense",
};

/**
 * What's happening on the selected day, and what the surrounding pay period has
 * to cover. Sits below the grid rather than floating over it, so it never hides
 * the days you're comparing. The minimum height fits a busy day, which keeps the
 * sections below from jumping as you click around.
 */
export function DayDetail({
  day,
  dateLabel,
  paycheckLabel,
  periodBillsCents,
}: {
  /** null when no day is selected. */
  day: CalendarDay | null;
  dateLabel: string;
  paycheckLabel: string | null;
  periodBillsCents: Cents;
}) {
  return (
    <div
      aria-live="polite"
      className="mt-1.5 flex min-h-23 flex-col border-t border-border-rule px-1 pt-1.5"
    >
      {day === null ? (
        <p className="text-meta font-medium text-fg-muted">Pick a day to see what&apos;s due.</p>
      ) : (
        <>
          <p className="text-meta font-bold text-fg-primary">{dateLabel}</p>

          {day.events.length === 0 ? (
            <p className="mt-0.5 text-detail font-medium text-fg-muted">Nothing due this day.</p>
          ) : (
            <ul className="mt-0.5">
              {day.events.map((event) => (
                <li
                  key={event.id}
                  className="flex h-4.25 items-center gap-1.5 text-detail font-medium text-fg-primary"
                >
                  <span
                    aria-hidden="true"
                    className={cn("size-1.25 shrink-0 rounded-full", DOT_COLOR[event.kind])}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {event.kind === "payday" && paycheckLabel ? paycheckLabel : event.label}
                  </span>
                  {event.amountCents !== null && (
                    <span className="shrink-0 text-fg-secondary tabular-nums">
                      {formatCents(event.amountCents)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-auto flex justify-between gap-2 pt-1 text-detail font-medium text-fg-muted">
            <span>Bills this pay period</span>
            <span className="shrink-0 font-bold text-fg-primary tabular-nums">
              {formatCents(periodBillsCents)}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
