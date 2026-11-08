import type { CalendarDay } from "@/lib/domain/types";

type Cells = (CalendarDay | null)[];

/**
 * Which pay period each calendar cell belongs to, or null for blank cells.
 *
 * Every payday starts a new period, numbered from 1 within the month. Days
 * before the month's first payday are period 0: they belong to a paycheck that
 * landed last month.
 */
export function payPeriodOfEachCell(cells: Cells): (number | null)[] {
  let period = 0;
  return cells.map((cell) => {
    if (cell === null) return null;
    if (cell.events.some((event) => event.kind === "payday")) period += 1;
    return period;
  });
}

/** What the paycheck that starts this period has to cover. */
export function billsInPayPeriod(
  cells: Cells,
  periods: (number | null)[],
  period: number,
): number {
  return cells.reduce((total, cell, index) => {
    if (cell === null || periods[index] !== period) return total;
    return (
      total +
      cell.events.reduce(
        (sum, event) => sum + (event.kind === "expense" ? (event.amountCents ?? 0) : 0),
        0,
      )
    );
  }, 0);
}
