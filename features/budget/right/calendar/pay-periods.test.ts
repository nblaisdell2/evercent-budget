import { describe, expect, it } from "vitest";
import type { CalendarDay, CalendarEvent } from "@/lib/domain/types";
import { billsInPayPeriod, payPeriodOfEachCell } from "./pay-periods";

const payday: CalendarEvent = { id: "pay", kind: "payday", label: "Payday", amountCents: null };
const bill = (amountCents: number | null): CalendarEvent => ({
  id: `bill-${amountCents}`,
  kind: "expense",
  label: "Bill",
  amountCents,
});
const day = (n: number, events: CalendarEvent[] = []): CalendarDay => ({ day: n, events });

// Two blank cells before the 1st, paydays on the 3rd and 5th.
const cells = [
  null,
  null,
  day(1, [bill(1_000)]),
  day(2),
  day(3, [payday, bill(2_500)]),
  day(4, [bill(500), bill(null)]),
  day(5, [payday]),
  day(6, [bill(7_000)]),
];

describe("payPeriodOfEachCell", () => {
  it("leaves blank cells null and numbers periods from each payday", () => {
    expect(payPeriodOfEachCell(cells)).toEqual([null, null, 0, 0, 1, 1, 2, 2]);
  });

  it("puts days before the month's first payday in period 0", () => {
    expect(payPeriodOfEachCell([day(1), day(2)])).toEqual([0, 0]);
  });
});

describe("billsInPayPeriod", () => {
  const periods = payPeriodOfEachCell(cells);

  it("adds up the bills that fall in the period", () => {
    expect(billsInPayPeriod(cells, periods, 1)).toBe(3_000);
    expect(billsInPayPeriod(cells, periods, 2)).toBe(7_000);
  });

  it("counts bills before the first payday in period 0", () => {
    expect(billsInPayPeriod(cells, periods, 0)).toBe(1_000);
  });

  it("is 0 for a period with no bills", () => {
    expect(billsInPayPeriod(cells, periods, 3)).toBe(0);
  });
});
