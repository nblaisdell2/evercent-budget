import { formatCents, type Cents } from "@/lib/format/currency";

/**
 * The hero metric of zero-based budgeting: money that hasn't been given a job.
 * Green while there is something left to assign; the design has no negative
 * variant, so overspent is left as a follow-up (see DESIGN-NOTES.md).
 */
export function ToBeBudgetedCard({ cents }: { cents: Cents }) {
  return (
    <div className="mx-auto flex h-[4.8125rem] w-[12.0625rem] flex-col items-center justify-center rounded-hero bg-surface-hero">
      <span className="text-group font-bold text-fg-primary underline decoration-solid">
        To Be Budgeted
      </span>
      <span className="text-hero leading-none font-extrabold tabular-nums text-fg-primary">
        {formatCents(cents)}
      </span>
    </div>
  );
}
