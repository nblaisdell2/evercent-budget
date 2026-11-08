import { RailSection } from "@/components/ui/rail-section";
import { formatCents } from "@/lib/format/currency";
import type { FutureAllocation } from "@/lib/domain/types";

/**
 * Months you haven't reached yet. Each row fills like the table's AVAILABLE
 * pills, so how far ahead you're funded reads as a shape before any number does.
 *
 * Together with the paycheck calendar and the Automation nav item, this is the
 * part of the screen that distinguishes EverCent from a plain envelope budgeter.
 */
export function FutureBudgetCard({ allocations }: { allocations: FutureAllocation[] }) {
  return (
    <RailSection title="Budgeted in the future" bodyClassName="p-[0.375rem]">
      <ul className="flex flex-col gap-[0.1875rem]">
        {allocations.map((allocation) => {
          const percent = Math.min(
            100,
            Math.round((allocation.budgetedCents / allocation.targetCents) * 100),
          );

          return (
            <li
              key={allocation.monthKey}
              title={`${percent}% of ${formatCents(allocation.targetCents)} planned`}
              style={{ ["--funded" as string]: `${percent}%` }}
              className="relative flex h-[1.25rem] items-center justify-between overflow-hidden rounded-card bg-surface-rail px-[0.4375rem] text-detail font-medium text-fg-primary"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[var(--funded)] bg-surface-control-strong/35"
              />
              <span className="relative">{allocation.label}</span>
              <span className="relative tabular-nums">{formatCents(allocation.budgetedCents)}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-[0.25rem] px-[0.125rem] text-detail font-medium text-fg-muted">
        Each bar fills toward that month&apos;s plan.
      </p>
    </RailSection>
  );
}
