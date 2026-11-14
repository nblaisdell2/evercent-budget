import { PanelLayout } from "@/components/layout/panel-layout";
import { LeftRail } from "@/features/budget/left/left-rail";
import { RightRail } from "@/features/budget/right/right-rail";
import { TopBar } from "@/features/budget/month/top-bar";
import { CenterPanel } from "@/features/budget/table/center-panel";
import { budgetRepository } from "@/lib/data/budget-repository";
import { ensureUser } from "@/lib/data/users";

/* Reads the signed-in user and the database on every request. */
export const dynamic = "force-dynamic";

/**
 * Server component, and the only place on this screen that reads data. Client
 * components are pushed out to the leaves that actually hold state.
 */
export default async function BudgetPage() {
  // Signed-in check plus the user's `users` row. The budget itself is still
  // placeholder data; when it's real, it will be looked up by `user.id`.
  await ensureUser();

  const data = await budgetRepository.getBudgetPage({
    budgetId: "budget-demo",
    month: "2024-02",
  });

  return (
    <PanelLayout
      top={<TopBar budget={data.budget} month={data.month} />}
      left={
        <LeftRail
          budget={data.budget}
          month={data.month}
          accounts={data.accounts}
          debts={data.debts}
        />
      }
      center={<CenterPanel groups={data.groups} />}
      right={
        <RightRail
          month={data.month}
          activity={data.activity}
          future={data.future}
          calendar={data.calendar}
        />
      }
    />
  );
}
