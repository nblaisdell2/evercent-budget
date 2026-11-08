import { AddFilledIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { RailSection } from "@/components/ui/rail-section";
import { MonthStepper } from "@/features/budget/month/month-stepper";
import { ToBeBudgetedCard } from "@/features/budget/month/to-be-budgeted-card";
import type { Account, BudgetSummary, Debt, MonthContext } from "@/lib/domain/types";
import { BrandBlock } from "./brand-block";
import { NavList } from "./nav-list";

/**
 * Account and debt rows share a shape; only the amount color differs. Lighter
 * and indented against the section's bold band, the same relationship as a
 * category row to its group in the budget table.
 */
function BalanceRow({ name, cents, tone }: { name: string; cents: number; tone: "neutral" | "debt" }) {
  return (
    <div className="flex h-[1.625rem] items-center justify-between gap-[0.5rem] border-b border-border-rule pr-[0.5rem] pl-[1.375rem] text-row font-medium text-fg-secondary last:border-b-0 hover:bg-surface-control">
      <span className="truncate">{name}</span>
      <Money cents={cents} className={tone === "debt" ? "text-money-owed" : undefined} />
    </div>
  );
}

export function LeftRail({
  budget,
  month,
  accounts,
  debts,
}: {
  budget: BudgetSummary;
  month: MonthContext;
  accounts: Account[];
  debts: Debt[];
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-[0.625rem] pt-[0.625rem]">
        <BrandBlock name={budget.name} />
      </div>

      {/* The rail's interior scrolls so a short viewport never clips the accounts. */}
      <div className="flex min-h-0 flex-1 flex-col gap-[0.625rem] overflow-y-auto p-[0.625rem]">
        <NavList />

        {/* One object: pick a month, read what's left to budget in it. The accent
            outline sets it apart from the plain nav above and the banded
            sections below. Phones already have this in the top bar. */}
        <section
          aria-label="Selected month"
          className="my-[0.375rem] shrink-0 overflow-hidden rounded-control border border-border-accent bg-surface-panel max-md:hidden"
        >
          <div className="p-[0.375rem]">
            <MonthStepper month={month} layout="panel" />
          </div>
          <ToBeBudgetedCard cents={budget.toBeBudgetedCents} layout="panel" />
        </section>

        <RailSection title="Accounts" summary={<Money cents={budget.accountsTotalCents} />}>
          {accounts.map((account) => (
            <BalanceRow
              key={account.id}
              name={account.name}
              cents={account.balanceCents}
              tone="neutral"
            />
          ))}
        </RailSection>

        <RailSection
          title="Debts"
          summary={<Money cents={budget.debtsTotalCents} className="text-money-owed" />}
        >
          {debts.map((debt) => (
            <BalanceRow key={debt.id} name={debt.name} cents={debt.balanceCents} tone="debt" />
          ))}
        </RailSection>

        <Button className="w-full justify-center">
          <AddFilledIcon width={16} height={16} />
          Add account
        </Button>
      </div>
    </div>
  );
}
