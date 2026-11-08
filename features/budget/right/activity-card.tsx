import { RailSection } from "@/components/ui/rail-section";
import { formatCents, formatCentsAbs } from "@/lib/format/currency";
import type { Transaction } from "@/lib/domain/types";

/**
 * The month's transaction ledger, written like a register: the date appears once
 * per day, spending stays neutral because spending is normal, and only money
 * coming in gets color.
 *
 * Repeated dates are transparent rather than removed, so the column holds its
 * width and screen readers still get the date on every row.
 */
export function ActivityCard({
  monthLabel,
  transactions,
}: {
  monthLabel: string;
  transactions: Transaction[];
}) {
  return (
    <RailSection title={`Activity in ${monthLabel}`} fill bodyClassName="overflow-y-auto">
      <ul>
        {transactions.map((txn, index) => {
          const startsDay = transactions[index - 1]?.dayLabel !== txn.dayLabel;
          const isInflow = txn.direction === "inflow";

          return (
            <li
              key={txn.id}
              className="flex h-[1.25rem] items-center gap-[0.375rem] border-b border-border-rule px-[0.5rem] text-detail font-medium text-fg-primary last:border-b-0"
            >
              <span
                className={`w-[1.875rem] shrink-0 tabular-nums ${
                  startsDay ? "text-fg-muted" : "text-transparent"
                }`}
              >
                {txn.dayLabel}
              </span>
              <span className="min-w-0 flex-1 truncate">{txn.payee}</span>
              <span
                className={`shrink-0 tabular-nums ${isInflow ? "font-bold text-money-inflow" : ""}`}
              >
                {isInflow
                  ? `+${formatCentsAbs(txn.amountCents)}`
                  : formatCents(-txn.amountCents)}
              </span>
            </li>
          );
        })}
      </ul>
    </RailSection>
  );
}
