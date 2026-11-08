import { AddFilledIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { RailSection } from "@/components/ui/rail-section";
import type { Account, BudgetSummary, Debt, MonthContext } from "@/lib/domain/types";
import { BudgetSwitcher } from "./budget-switcher";
import { MonthStepper } from "./month-stepper";
import { NavList } from "./nav-list";
import { ToBeBudgetedCard } from "./to-be-budgeted-card";

function Rule() {
  return <div aria-hidden="true" className="mx-[0.25rem] h-px shrink-0 bg-border-accent" />;
}

/** Account and debt rows share a shape; only the amount color differs. */
function BalanceRow({ name, cents, tone }: { name: string; cents: number; tone: "neutral" | "debt" }) {
  return (
    <div className="flex h-[1.25rem] items-center justify-between rounded-control px-[1.4375rem] text-row font-medium text-fg-primary hover:bg-surface-control">
      <span className="truncate">{name}</span>
      <Money
        cents={cents}
        className={tone === "debt" ? "font-bold text-money-outflow" : undefined}
      />
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
      <div className="shrink-0 px-[0.5625rem] pt-[0.625rem] pb-[0.625rem]">
        <BudgetSwitcher name={budget.name} />
      </div>

      <Rule />

      {/* The rail's interior scrolls so a short viewport never clips the wordmark. */}
      <div className="flex min-h-0 flex-1 flex-col gap-[1.1875rem] overflow-y-auto px-[0.5625rem] py-[0.5625rem]">
        <NavList />

        <Rule />

        <MonthStepper month={month} />

        <ToBeBudgetedCard cents={budget.toBeBudgetedCents} />

        <Rule />

        <RailSection label="ACCOUNTS">
          {accounts.map((account) => (
            <BalanceRow
              key={account.id}
              name={account.name}
              cents={account.balanceCents}
              tone="neutral"
            />
          ))}
        </RailSection>

        <RailSection label="DEBTS">
          {debts.map((debt) => (
            <BalanceRow key={debt.id} name={debt.name} cents={debt.balanceCents} tone="debt" />
          ))}
        </RailSection>

        <Button variant="tinted" className="mx-auto w-[7.125rem] justify-center">
          <AddFilledIcon width={23} height={23} />
          Add Account
        </Button>
      </div>

      <p className="shrink-0 px-[0.25rem] pb-[0.125rem] font-brand text-row font-bold text-fg-wordmark">
        EverCent
      </p>
    </div>
  );
}
