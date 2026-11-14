import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { BudgetPreview } from "@/features/landing/budget-preview";
import { HeroRegularExpenses } from "@/features/landing/hero-regular-expenses";
import { PaydaySteps } from "@/features/landing/payday-steps";
import { RegisterPreview } from "@/features/landing/register-preview";
import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";
import { SIGN_IN_URL, SIGN_UP_URL } from "@/lib/auth/routes";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "EverCent: get months ahead on your bills",
  description:
    "A zero-based budget that runs on your pay schedule and funds future months every payday.",
};

/** Page gutters and max width, shared by every section so their edges line up. */
const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** The budget screen's two jobs, beside its preview. */
const BUDGET_POINTS = [
  {
    term: "Budget the month",
    detail:
      "Give each category an amount until To Be Budgeted reaches $0.00. Group them the way you think about money: monthly bills, everyday spending, and the costs that only come around once or twice a year.",
  },
  {
    term: "See what's left",
    detail:
      "Available shows each category's balance. Green is covered, amber is partly there, red is overspent, and the blue badge counts how many months ahead a category is already paid for.",
  },
];

/**
 * The public landing page. Mostly reading: the only actions are logging in and
 * creating an account. Everything below the hero is still; the hero's Regular
 * Expenses chart is the one thing that moves.
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-surface-app text-fg-primary">
      <SiteHeader />

      <main>
        <section
          className={cn(
            WRAP,
            "grid items-center gap-12 pt-14 pb-18 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16 lg:pt-24 lg:pb-28",
          )}
        >
          <div>
            <h1 className="max-w-[11ch] text-display font-extrabold text-balance">
              Six months ahead on every bill.
            </h1>
            <p className="mt-6 max-w-136 text-lede font-medium text-fg-secondary">
              EverCent is a zero-based budget that runs on your pay schedule. Each payday it covers
              this month&apos;s bills first, then sets money aside for the months after, until every
              bill is paid for long before it&apos;s due.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={SIGN_UP_URL} className={buttonStyles({ variant: "primary", size: "lg" })}>
                Create your budget
              </Link>
              <Link href={SIGN_IN_URL} className={buttonStyles({ variant: "tinted", size: "lg" })}>
                Log in
              </Link>
            </div>
          </div>

          <HeroRegularExpenses />
        </section>

        <section
          aria-labelledby="budget-heading"
          className="border-y border-border-rule bg-surface-rail"
        >
          <div className={cn(WRAP, "py-18 lg:py-24")}>
            <h2 id="budget-heading" className="text-section font-bold">
              Plan every dollar before you spend it
            </h2>
            <p className="mt-4.5 max-w-160 text-lede font-medium text-fg-secondary">
              Your budget starts with the money you have, not the money you expect. Assign it to
              categories until nothing is left over, then record spending against those categories
              as it happens.
            </p>

            {/* The budget preview takes the wider column so that, on a laptop or
                larger, it's past the budget table's 36rem stacking point and its
                rows read on one line, as they do in the app. */}
            <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
              <dl className="max-w-xl lg:order-2">
                {BUDGET_POINTS.map((point) => (
                  <div
                    key={point.term}
                    className="border-t border-border-rule py-4.5 first:border-t-0 first:pt-0"
                  >
                    <dt className="text-[1.125rem] font-bold text-fg-primary">{point.term}</dt>
                    <dd className="mt-1.5 text-body font-medium text-fg-secondary">
                      {point.detail}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="lg:order-1">
                <BudgetPreview />
              </div>
            </div>

            <div className="mt-16 grid items-center gap-10 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-14">
              <div className="max-w-xl">
                <h3 className="text-[1.125rem] font-bold text-fg-primary">Record transactions</h3>
                <p className="mt-1.5 text-body font-medium text-fg-secondary">
                  Every account gets its own register. Log each purchase against a category, mark it
                  posted once it clears, and lock older items so they can&apos;t change by accident.
                  Pending charges are counted separately, so the &ldquo;true&rdquo; balance is the
                  one you can actually spend.
                </p>
              </div>
              <RegisterPreview />
            </div>
          </div>
        </section>

        <section aria-labelledby="automation-heading" className={cn(WRAP, "py-18 lg:py-26")}>
          <h2 id="automation-heading" className="text-section font-bold">
            Then let payday do the work
          </h2>
          <p className="mt-4.5 max-w-160 text-lede font-medium text-fg-secondary">
            Budgeting by hand means sitting down every payday to move money around. EverCent&apos;s
            automation does that part on your schedule, and works ahead on the bills that don&apos;t
            come every month.
          </p>

          <PaydaySteps />
        </section>

        <section
          aria-labelledby="start-heading"
          className="border-t border-border-accent bg-surface-rail"
        >
          <div
            className={cn(
              WRAP,
              "flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between lg:py-20",
            )}
          >
            <div>
              <h2 id="start-heading" className="text-section font-bold">
                Start with your next paycheck
              </h2>
              <p className="mt-3.5 max-w-136 text-body font-medium text-fg-secondary">
                Create your budget, tell EverCent when you&apos;re paid, and let the next payday do
                the sorting.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href={SIGN_UP_URL} className={buttonStyles({ variant: "primary", size: "lg" })}>
                Create your budget
              </Link>
              <Link href={SIGN_IN_URL} className={buttonStyles({ variant: "tinted", size: "lg" })}>
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
