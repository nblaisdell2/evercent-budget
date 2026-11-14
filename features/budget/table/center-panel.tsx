import type { CategoryGroup } from "@/lib/domain/types";
import { BudgetTable } from "./budget-table";
import { BudgetToolbar } from "./budget-toolbar";

export function CenterPanel({ groups }: { groups: CategoryGroup[] }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden pt-1.75 pl-1.25">
      <BudgetToolbar />
      <div className="h-3 shrink-0" />
      <BudgetTable groups={groups} />
    </section>
  );
}
