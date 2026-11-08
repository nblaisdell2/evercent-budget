import { AccordionCard } from "@/components/ui/accordion-card";
import { DotLeaderRow } from "@/components/ui/dot-leader-row";
import { formatCents } from "@/lib/format/currency";
import type { FutureAllocation } from "@/lib/domain/types";

/**
 * Months you haven't reached yet. Together with the paycheck calendar and the
 * Automation nav item, this is the part of the screen that distinguishes EverCent
 * from a plain envelope budgeter — it cares about funding forward.
 */
export function FutureBudgetCard({ allocations }: { allocations: FutureAllocation[] }) {
  return (
    <AccordionCard
      title="Budgeted in the Future"
      bodyClassName="flex flex-col gap-[0.375rem] px-[0.8125rem] pt-[0.5625rem] pb-[0.5rem]"
    >
      {allocations.map((allocation) => (
        <DotLeaderRow key={allocation.monthKey} label={allocation.label}>
          {formatCents(allocation.budgetedCents)}
        </DotLeaderRow>
      ))}
    </AccordionCard>
  );
}
