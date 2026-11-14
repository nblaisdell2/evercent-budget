import { formatCents, type Cents } from "@/lib/format/currency";
import { cn } from "@/lib/cn";

/**
 * The hero metric of zero-based budgeting: money that hasn't been given a job.
 * It uses the same fills and dark text as the table's AVAILABLE pills, so it
 * reads as the biggest pill on the page.
 *
 * In the left panel it's the base of the month block, and its amount is sized
 * against the panel's width (`cqi`) so a long figure still fits a narrow panel.
 * In the top bar it's a compact pill.
 */
export function ToBeBudgetedCard({ cents, layout }: { cents: Cents; layout: "panel" | "bar" }) {
  const tone =
    cents > 0
      ? "bg-surface-hero text-state-funded-fg"
      : cents < 0
        ? "bg-state-overspent text-state-overspent-fg"
        : "bg-state-zero text-fg-primary";
  const label = cents < 0 ? "Budgeted too much" : "To be budgeted";

  if (layout === "panel") {
    return (
      <div className={cn("@container px-2.5 pt-1.5 pb-2", tone)}>
        <p className="text-row font-bold">{label}</p>
        <p className="text-[length:clamp(1.25rem,17cqi,2rem)] leading-tight font-extrabold tabular-nums">
          {formatCents(cents)}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-x-3 rounded-hero px-3 py-0.75 max-md:flex-col max-md:items-start max-md:px-2.5",
        tone,
      )}
    >
      <p className="text-row font-bold max-md:text-meta">{label}</p>
      <p className="text-hero leading-tight font-extrabold tabular-nums">{formatCents(cents)}</p>
    </div>
  );
}
