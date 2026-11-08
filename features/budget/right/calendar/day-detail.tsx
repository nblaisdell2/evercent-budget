import { formatCents, type Cents } from "@/lib/format/currency";
import type { CalendarDay, CalendarEventKind } from "@/lib/domain/types";

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
    <div aria-live="polite" className="mt-[0.375rem] flex min-h-[5.75rem] flex-col border-t border-border-rule px-[0.25rem] pt-[0.375rem]">
      {day === null ? (
        <p className="text-meta font-medium text-fg-muted">Pick a day to see what&apos;s due.</p>
      ) : (
        <>
          <p className="text-meta font-bold text-fg-primary">{dateLabel}</p>

          {day.events.length === 0 ? (
            <p className="mt-[0.125rem] text-detail font-medium text-fg-muted">Nothing due this day.</p>
          ) : (
            <ul className="mt-[0.125rem]">
              {day.events.map((event) => (
                <li
                  key={event.id}
                  className="flex h-[1.0625rem] items-center gap-[0.375rem] text-detail font-medium text-fg-primary"
                >
                  <span
                    aria-hidden="true"
                    className={`size-[0.3125rem] shrink-0 rounded-full ${DOT_COLOR[event.kind]}`}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {event.kind === "payday" && paycheckLabel ? paycheckLabel : event.label}
                  </span>
                  {event.amountCents !== null && (
                    <span className="shrink-0 tabular-nums text-fg-secondary">
                      {formatCents(event.amountCents)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-auto flex justify-between gap-[0.5rem] pt-[0.25rem] text-detail font-medium text-fg-muted">
            <span>Bills this pay period</span>
            <span className="shrink-0 font-bold tabular-nums text-fg-primary">
              {formatCents(periodBillsCents)}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
