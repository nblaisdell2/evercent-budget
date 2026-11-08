import { AccordionCard } from "@/components/ui/accordion-card";
import { Money } from "@/components/ui/money";
import type { Transaction } from "@/lib/domain/types";

/**
 * The month's transaction ledger. Rows alternate between the deep panel navy and
 * an 80%-alpha rail navy, per Figma's 23:904 / 23:905 pair.
 *
 * Every row here is a server component — the card's client shell only decides
 * whether to mount them — so the ledger ships no JavaScript.
 */
export function ActivityCard({
  monthLabel,
  transactions,
}: {
  monthLabel: string;
  transactions: Transaction[];
}) {
  return (
    <AccordionCard
      title={`Activity in ${monthLabel}`}
      bodyClassName="max-h-[9rem] overflow-y-auto"
    >
      <ul>
        {transactions.map((txn, index) => (
          <li
            key={txn.id}
            className={[
              "flex h-[1rem] items-center gap-[0.375rem] px-[0.5625rem] text-meta font-medium text-fg-primary",
              index % 2 === 0 ? "bg-surface-panel" : "bg-surface-row-alt",
            ].join(" ")}
          >
            <span className="w-[1.9375rem] shrink-0 tabular-nums">{txn.dayLabel}</span>
            <span className="flex-1 truncate">{txn.payee}</span>
            <Money
              cents={txn.amountCents}
              absolute
              className={
                txn.direction === "inflow" ? "text-money-inflow" : "text-money-outflow"
              }
            />
          </li>
        ))}
      </ul>
    </AccordionCard>
  );
}
