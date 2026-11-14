import type { ReactNode } from "react";

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
    <figure className="rounded-hero border border-border-rule bg-surface-rail p-[1rem] sm:p-[1.25rem]">
      <figcaption className="sr-only">{label}</figcaption>
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}

function Row({ term, value, tone }: { term: string; value: string; tone?: "inflow" }) {
  return (
    <div className="flex items-baseline justify-between gap-[1rem] border-b border-border-rule py-[0.5rem] last:border-b-0">
      <span className="text-[0.875rem] font-medium text-fg-muted">{term}</span>
      <span
        className={`text-right tabular-nums ${
          tone === "inflow" ? "text-[1.125rem] font-bold text-money-inflow" : "text-[0.9375rem] font-bold text-fg-primary"
        }`}
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
      <span className="block text-[0.8125rem] leading-tight font-semibold text-fg-primary">{label}</span>
      <span
        className={`mt-[0.25rem] block text-[1.25rem] leading-none font-extrabold tabular-nums ${
          tone === "inflow" ? "text-money-inflow" : "text-fg-primary"
        }`}
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
      <div className="grid grid-cols-3 gap-[0.5rem]">
        <VizStat label="Total amount" value={dollars(INCOME)} tone="inflow" />
        <VizStat label="Amount used" value={dollars(INCOME - UNUSED)} />
        <VizStat label="Amount remaining" value={dollars(UNUSED)} />
      </div>

      <p className="mt-[1.125rem] text-[0.875rem] font-semibold text-fg-primary">By group</p>
      <div className="mt-[0.375rem] flex h-[2.5rem] overflow-hidden rounded-card">
        {SPLIT.map((s) => (
          <span key={s.name} className={s.color} style={{ width: `${pct(s.cents)}%` }} />
        ))}
      </div>

      <ul className="mt-[0.875rem] grid gap-x-[1.25rem] gap-y-[0.375rem] text-[0.8125rem] font-medium sm:grid-cols-2">
        {SPLIT.map((s) => (
          <li key={s.name} className="flex items-center gap-[0.5rem]">
            <span className={`size-[0.625rem] shrink-0 rounded-full ${s.color}`} />
            <span className="min-w-0 flex-1 truncate text-fg-secondary">{s.name}</span>
            <span className="tabular-nums text-fg-primary">{pct(s.cents)}%</span>
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
      <div className="flex flex-wrap items-baseline justify-between gap-x-[1rem] gap-y-[0.25rem]">
        <span className="text-[0.875rem] font-medium text-fg-muted">Next run</span>
        <span className="text-[0.9375rem] font-bold text-fg-primary">Dec 20 at 5:00 pm</span>
      </div>
      <div className="mt-[0.75rem] rounded-control bg-surface-app px-[0.875rem] py-[0.5rem]">
        {RUN.map((r) => (
          <div
            key={r.month}
            className="flex justify-between border-b border-border-rule py-[0.375rem] text-[0.875rem] font-medium last:border-b-0"
          >
            <span className="text-fg-secondary">{r.month}</span>
            <span className="tabular-nums text-money-inflow">{r.amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-[0.625rem] flex justify-between text-[0.9375rem] font-bold">
        <span className="text-fg-primary">Amount to post</span>
        <span className="tabular-nums text-money-inflow">$2,400.00</span>
      </div>
    </Fragment>
  );
}

function Progress() {
  return (
    <Fragment label="Progress: 15 of 21 regular expenses have reached the six-month target. Saving for a new laptop: $640 of $1,400, ready in 9 paychecks.">
      <div className="flex items-baseline justify-between gap-[1rem]">
        <span className="text-[0.875rem] font-medium text-fg-muted">Bills at the 6-month target</span>
        <span className="text-[1.125rem] font-bold tabular-nums text-fg-primary">15 of 21</span>
      </div>
      <div className="mt-[0.5rem] h-[0.75rem] overflow-hidden rounded-card bg-surface-row-group">
        <span className="block h-full bg-state-funded" style={{ width: `${(15 / 21) * 100}%` }} />
      </div>

      <div className="mt-[1.25rem] flex items-baseline justify-between gap-[1rem]">
        <span className="text-[0.9375rem] font-bold text-fg-primary">New laptop</span>
        <span className="text-[0.875rem] font-medium tabular-nums text-fg-secondary">$640 of $1,400</span>
      </div>
      {/* Partly saved: green over amber, the AVAILABLE pill's reading. */}
      <div className="mt-[0.5rem] flex h-[0.75rem] overflow-hidden rounded-card bg-state-partial">
        <span className="h-full bg-state-funded" style={{ width: `${(640 / 1400) * 100}%` }} />
      </div>
      <p className="mt-[0.5rem] text-[0.8125rem] font-medium text-fg-muted">Ready to buy in 9 paychecks</p>
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
    <ol className="mt-[3rem] grid gap-[3rem] sm:mt-[3.5rem] lg:gap-[4rem]">
      {STEPS.map((step, i) => (
        <li
          key={step.title}
          className="relative grid items-start gap-[1.5rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-[3rem] lg:gap-[5rem]"
        >
          {/* The rule joining one step's number to the next, so the list reads
              as one path rather than four separate claims. */}
          {i < STEPS.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-[2.75rem] bottom-[-2.5rem] left-[1.0625rem] w-px bg-border-accent lg:bottom-[-3.5rem]"
            />
          )}

          <div className="flex gap-[1.125rem]">
            <span className="grid size-[2.25rem] shrink-0 place-items-center rounded-full bg-surface-control-strong text-[1rem] font-bold tabular-nums text-fg-primary">
              {i + 1}
            </span>
            <div className="pt-[0.25rem]">
              <h3 className="text-[1.375rem] leading-tight font-bold text-fg-primary">{step.title}</h3>
              <p className="mt-[0.625rem] max-w-[34rem] text-body font-medium text-fg-secondary">
                {step.body}
              </p>
            </div>
          </div>

          <div className="pl-[3.375rem] md:pl-0">{step.fragment}</div>
        </li>
      ))}
    </ol>
  );
}
