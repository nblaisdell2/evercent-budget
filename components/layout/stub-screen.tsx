import { LeftRail } from "@/features/budget/left/left-rail";
import { TopBar } from "@/features/budget/month/top-bar";
import { budgetRepository } from "@/lib/data/budget-repository";
import { PanelLayout } from "./panel-layout";

/**
 * Placeholder for the Automation and Reporting routes.
 *
 * It renders through the same `PanelLayout` as the budget page rather than
 * duplicating shell markup, so these routes inherit rail resizing, collapsing,
 * and drawer behavior for free.
 */
export async function StubScreen({ title, blurb }: { title: string; blurb: string }) {
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
      center={
        <div className="grid h-full place-items-center p-[2rem]">
          <div className="max-w-[26rem] text-center">
            <h1 className="text-title font-bold text-fg-primary">{title}</h1>
            <p className="mt-[0.75rem] text-row font-medium text-fg-muted">{blurb}</p>
          </div>
        </div>
      }
      right={null}
    />
  );
}
