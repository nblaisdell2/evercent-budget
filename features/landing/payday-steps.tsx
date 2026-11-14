import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * "Then let payday do the work": EverCent's automation as the sequence it
 * really is. You set it up (pay, then amounts), it runs (on payday), and you
 * watch the result (months ahead). The numbers mark that order.
 *
 * Each step carries a small, still slice of the matching automation screen so
 * the page shows the product rather than describing it.
 */

function Fragment({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="rounded-hero border border-border-rule bg-surface-rail p-4 sm:p-5">
      <figcaption className="sr-only">{label}</figcaption>
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}

function Row({ term, value, tone }: { term: string; value: string; tone?: "inflow" }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border-rule py-2 last:border-b-0">
      <span className="text-[0.875rem] font-medium text-fg-muted">{term}</span>
      <span
        className={cn(
          "text-right tabular-nums",
          tone === "inflow"
            ? "text-[1.125rem] font-bold text-money-inflow"
            : "text-[0.9375rem] font-bold text-fg-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function PayInfo() {
  return (
    <Fragment label="Pay details: $5,000 monthly income, paid every two weeks, next payday December 20.">
      <Row term="Monthly income" value="$5,000" tone="inflow" />
      <Row term="Pay frequency" value="Every 2 weeks" />
      <Row term="Next payday" value="Dec 20, in 6 days" />
    </Fragment>
  );
}

/* A $5,000 month split by category type, in the Budget Visualizer's own colors
   and order (the --viz-* tokens in globals.css). */
const SPLIT = [
  { name: "Debt payments", cents: 45_000, color: "bg-viz-debt" },
  { name: "Immediate obligations", cents: 200_000, color: "bg-viz-obligations" },
  { name: "Subscriptions", cents: 60_000, color: "bg-viz-subscriptions" },
  { name: "True expenses", cents: 20_000, color: "bg-viz-true-expenses" },
  { name: "Unused", cents: 175_000, color: "bg-viz-unused" },
];
const INCOME = SPLIT.reduce((sum, s) => sum + s.cents, 0);
const UNUSED = SPLIT[SPLIT.length - 1].cents;
const pct = (cents: number) => Math.round((cents / INCOME) * 100);
const dollars = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

function VizStat({ label, value, tone }: { label: string; value: string; tone?: "inflow" }) {
  return (
    <div className="text-center">
      <span className="block text-[0.8125rem] leading-tight font-semibold text-fg-primary">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 block text-[1.25rem] leading-none font-extrabold tabular-nums",
          tone === "inflow" ? "text-money-inflow" : "text-fg-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Visualizer() {
  return (
    <Fragment
      label={`Income split: ${SPLIT.map((s) => `${pct(s.cents)}% ${s.name.toLowerCase()}`).join(", ")}. ${dollars(INCOME - UNUSED)} of ${dollars(INCOME)} is assigned.`}
    >
      <div className="grid grid-cols-3 gap-2">
        <VizStat label="Total amount" value={dollars(INCOME)} tone="inflow" />
        <VizStat label="Amount used" value={dollars(INCOME - UNUSED)} />
        <VizStat label="Amount remaining" value={dollars(UNUSED)} />
      </div>

      <p className="mt-4.5 text-[0.875rem] font-semibold text-fg-primary">By group</p>
      <div className="mt-1.5 flex h-10 overflow-hidden rounded-card">
        {SPLIT.map((s) => (
          <span key={s.name} className={s.color} style={{ width: `${pct(s.cents)}%` }} />
        ))}
      </div>

      <ul className="mt-3.5 grid gap-x-5 gap-y-1.5 text-[0.8125rem] font-medium sm:grid-cols-2">
        {SPLIT.map((s) => (
          <li key={s.name} className="flex items-center gap-2">
            <span className={cn("size-2.5 shrink-0 rounded-full", s.color)} />
            <span className="min-w-0 flex-1 truncate text-fg-secondary">{s.name}</span>
            <span className="text-fg-primary tabular-nums">{pct(s.cents)}%</span>
          </li>
        ))}
      </ul>
    </Fragment>
  );
}

const RUN = [
  { month: "December", amount: "$1,312.00" },
  { month: "January", amount: "$640.00" },
  { month: "February", amount: "$288.00" },
  { month: "March", amount: "$160.00" },
];

function NextRun() {
  return (
    <Fragment label="Next automation run: December 20 at 5:00 pm, posting $2,400 across December through March.">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[0.875rem] font-medium text-fg-muted">Next run</span>
        <span className="text-[0.9375rem] font-bold text-fg-primary">Dec 20 at 5:00 pm</span>
      </div>
      <div className="mt-3 rounded-control bg-surface-app px-3.5 py-2">
        {RUN.map((r) => (
          <div
            key={r.month}
            className="flex justify-between border-b border-border-rule py-1.5 text-[0.875rem] font-medium last:border-b-0"
          >
            <span className="text-fg-secondary">{r.month}</span>
            <span className="text-money-inflow tabular-nums">{r.amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex justify-between text-[0.9375rem] font-bold">
        <span className="text-fg-primary">Amount to post</span>
        <span className="text-money-inflow tabular-nums">$2,400.00</span>
      </div>
    </Fragment>
  );
}

function Progress() {
  return (
    <Fragment label="Progress: 15 of 21 regular expenses have reached the six-month target. Saving for a new laptop: $640 of $1,400, ready in 9 paychecks.">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.875rem] font-medium text-fg-muted">
          Bills at the 6-month target
        </span>
        <span className="text-[1.125rem] font-bold text-fg-primary tabular-nums">15 of 21</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-card bg-surface-row-group">
        <span className="block h-full bg-state-funded" style={{ width: `${(15 / 21) * 100}%` }} />
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <span className="text-[0.9375rem] font-bold text-fg-primary">New laptop</span>
        <span className="text-[0.875rem] font-medium text-fg-secondary tabular-nums">
          $640 of $1,400
        </span>
      </div>
      {/* Partly saved: green over amber, the AVAILABLE pill's reading. */}
      <div className="mt-2 flex h-3 overflow-hidden rounded-card bg-state-partial">
        <span className="h-full bg-state-funded" style={{ width: `${(640 / 1400) * 100}%` }} />
      </div>
      <p className="mt-2 text-[0.8125rem] font-medium text-fg-muted">Ready to buy in 9 paychecks</p>
    </Fragment>
  );
}

const STEPS: { title: string; body: string; fragment: ReactNode }[] = [
  {
    title: "Tell EverCent how you're paid",
    body: "Your monthly income, how often you're paid, and your next payday. Every automatic step after this is scheduled from these three answers.",
    fragment: <PayInfo />,
  },
  {
    title: "Decide what each category needs",
    body: "Set an amount for each category and mark the bills that don't come monthly, like car insurance every six months. The Budget Visualizer shows how that splits your income, and how much is left unused.",
    fragment: <Visualizer />,
  },
  {
    title: "Payday posts it for you",
    body: "On each payday EverCent posts those amounts into your budget: this month first, then the months after it. You can check the next run, and change it, before it happens.",
    fragment: <NextRun />,
  },
  {
    title: "Watch yourself get ahead",
    body: "Regular Expenses counts how many bills have reached your months-ahead target. Upcoming Expenses shows when you'll have saved enough for something you're planning to buy.",
    fragment: <Progress />,
  },
];

export function PaydaySteps() {
  return (
    <ol className="mt-12 grid gap-12 sm:mt-14 lg:gap-16">
      {STEPS.map((step, i) => (
        <li
          key={step.title}
          className="relative grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12 lg:gap-20"
        >
          {/* The rule joining one step's number to the next, so the list reads
              as one path rather than four separate claims. */}
          {i < STEPS.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-11 -bottom-10 left-4.25 w-px bg-border-accent lg:-bottom-14"
            />
          )}

          <div className="flex gap-4.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-control-strong text-[1rem] font-bold text-fg-primary tabular-nums">
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-[1.375rem] leading-tight font-bold text-fg-primary">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-136 text-body font-medium text-fg-secondary">
                {step.body}
              </p>
            </div>
          </div>

          <div className="pl-13.5 md:pl-0">{step.fragment}</div>
        </li>
      ))}
    </ol>
  );
}
