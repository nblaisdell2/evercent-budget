import type { CSSProperties } from "react";

/**
 * The landing page's hero: a still of the Regular Expenses screen, the part of
 * EverCent that shows how far ahead each bill is paid for.
 *
 * Same reading as the app: one bar per bill, months funded ahead along the
 * bottom (0 to 6, then More), a dashed line at the six-month target, and color
 * for where each bill stands against it. Bars past the target run to "More" and
 * print their real count.
 *
 * Server-rendered and purely presentational. Layout and the one-time grow-in
 * are in globals.css ("hero's Regular Expenses chart").
 */

const TARGET = 6;
/** Axis intervals: 0→1 … 5→6, then 6→More. */
const INTERVALS = 7;
const AXIS = ["0", "1", "2", "3", "4", "5", "6", "More"];

type Bill = { name: string; months: number };
type Group = { name: string; bills: Bill[] };

const GROUPS: Group[] = [
  {
    name: "Monthly bills",
    bills: [
      { name: "Rent", months: 6 },
      { name: "Electric", months: 3 },
      { name: "Water", months: 1 },
      { name: "Internet", months: 10 },
      { name: "Phone", months: 7 },
    ],
  },
  {
    name: "Insurance",
    bills: [
      { name: "Car insurance", months: 4 },
      { name: "Renters", months: 8 },
    ],
  },
  {
    name: "Subscriptions",
    bills: [
      { name: "Streaming", months: 7 },
      { name: "Gym", months: 2 },
    ],
  },
];

const ALL_BILLS = GROUPS.flatMap((g) => g.bills);
/** Each group's first row number, so bars grow in one after another down the chart. */
const ROW_OFFSETS = GROUPS.map((_, gi) =>
  GROUPS.slice(0, gi).reduce((rows, g) => rows + g.bills.length, 0),
);
const AT_TARGET = ALL_BILLS.filter((b) => b.months >= TARGET).length;
const AT_TARGET_PCT = Math.round((AT_TARGET / ALL_BILLS.length) * 100);

/** Met the target, at least halfway there, or well short. */
function toneClass(months: number) {
  if (months >= TARGET) return "bg-progress-met";
  if (months >= TARGET / 2) return "bg-progress-partial";
  return "bg-progress-behind";
}

type BarVars = CSSProperties & { "--w": string; "--i": number };

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-[0.5rem] py-[0.75rem] text-center">
      <span className="text-[0.75rem] leading-tight font-semibold text-fg-secondary sm:text-[0.8125rem]">
        {label}
      </span>
      <span className="mt-[0.25rem] text-[1.5rem] leading-none font-extrabold tabular-nums text-fg-primary">
        {value}
        {detail && <span className="ml-[0.25rem] text-[0.875rem] font-bold">{detail}</span>}
      </span>
    </div>
  );
}

export function HeroRegularExpenses() {
  return (
    <figure className="overflow-hidden rounded-hero border border-border-rule bg-surface-app shadow-[0_1.5rem_4rem_-1.5rem_rgb(0_0_0/0.6)]">
      <figcaption className="sr-only">
        The Regular Expenses screen. With a six-month target, {AT_TARGET} of {ALL_BILLS.length}{" "}
        regular bills are paid for six or more months ahead, including Rent, Internet and Phone.
        Car insurance and Electric are partway there, and Water and Gym are one or two months
        ahead.
      </figcaption>

      <div aria-hidden="true">
        <div className="grid grid-cols-3 divide-x divide-border-rule border-b border-border-accent bg-surface-rail">
          <Stat label="Months ahead target" value={String(TARGET)} />
          <Stat label="Regular expenses" value={String(ALL_BILLS.length)} />
          <Stat label="At target" value={String(AT_TARGET)} detail={`(${AT_TARGET_PCT}%)`} />
        </div>

        <div className="px-[1rem] pt-[0.75rem] pb-[0.5rem] sm:px-[1.25rem]">
          <div className="ec-rx">
            <div className="ec-rx-plot" />

            {GROUPS.map((group, gi) => (
              <div key={group.name} className="ec-rx-group">
                <span className="mb-[0.25rem] block text-[0.75rem] font-bold text-fg-primary sm:mb-0">
                  {group.name}
                </span>
                <div>
                  {group.bills.map((bill, bi) => {
                    const i = ROW_OFFSETS[gi] + bi;
                    const over = bill.months > TARGET;
                    const width = over ? 100 : (bill.months / INTERVALS) * 100;
                    return (
                      <div key={bill.name} className="ec-rx-row">
                        <span className="truncate text-right text-[0.75rem] font-medium text-fg-secondary">
                          {bill.name}
                        </span>
                        <span className="ec-rx-track">
                          <span
                            className={`ec-rx-bar ${toneClass(bill.months)}`}
                            style={{ "--w": `${width}%`, "--i": i } as BarVars}
                          >
                            {over && (
                              <span
                                className="ec-rx-value text-[0.625rem] leading-none font-bold tabular-nums text-fg-primary"
                                style={{ "--i": i } as BarVars}
                              >
                                {bill.months}
                              </span>
                            )}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="ec-rx-target-layer">
              <span className="ec-rx-target" />
            </div>

            <div className="ec-rx-axis">
              {AXIS.map((tick, i) => (
                <span
                  key={tick}
                  className="absolute top-[0.4375rem] -translate-x-1/2 text-[0.6875rem] font-medium tabular-nums text-fg-muted"
                  style={{ left: `${(i / INTERVALS) * 100}%` }}
                >
                  {tick}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-[0.375rem] border-t border-border-rule px-[1rem] py-[0.625rem] text-[0.8125rem] font-medium sm:px-[1.25rem]">
          <span className="text-fg-muted">Months each bill is paid for ahead</span>
          <span className="flex items-center gap-[0.5rem] text-fg-secondary">
            <span className="h-[0.875rem] border-l-2 border-dashed border-progress-target" />
            {TARGET}-month target
          </span>
        </div>
      </div>
    </figure>
  );
}
