import type { CategoryGroup } from "@/lib/domain/types";
import { BudgetTable } from "./budget-table";
import { BudgetToolbar } from "./budget-toolbar";

export function CenterPanel({ groups }: { groups: CategoryGroup[] }) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden pt-[0.4375rem] pl-[0.3125rem]">
      <BudgetToolbar />
      <div className="h-[0.75rem] shrink-0" />
      <BudgetTable groups={groups} />
    </section>
  );
}
