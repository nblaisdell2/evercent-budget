import { formatCents, type Cents } from "@/lib/format/currency";

/**
 * The hero metric of zero-based budgeting: money that hasn't been given a job.
 * It uses the same fills and dark text as the table's AVAILABLE pills, so it
 * reads as the biggest pill on the page.
 *
 * In the left panel it's the base of the month block, and its amount is sized
 * against the panel's width (`cqi`) so a long figure still fits a narrow panel.
 * In the top bar it's a compact pill.
 */
export function ToBeBudgetedCard({
  cents,
  layout,
}: {
  cents: Cents;
  layout: "panel" | "bar";
}) {
  const tone =
    cents > 0
      ? "bg-surface-hero text-state-funded-fg"
      : cents < 0
        ? "bg-state-overspent text-state-overspent-fg"
        : "bg-state-zero text-fg-primary";
  const label = cents < 0 ? "Budgeted too much" : "To be budgeted";

  if (layout === "panel") {
    return (
      <div className={`@container px-[0.625rem] pt-[0.375rem] pb-[0.5rem] ${tone}`}>
        <p className="text-row font-bold">{label}</p>
        <p className="text-[length:clamp(1.25rem,17cqi,2rem)] leading-tight font-extrabold tabular-nums">
          {formatCents(cents)}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-x-[0.75rem] rounded-hero px-[0.75rem] py-[0.1875rem] max-md:flex-col max-md:items-start max-md:px-[0.625rem] ${tone}`}
    >
      <p className="text-row font-bold max-md:text-meta">{label}</p>
      <p className="text-hero leading-tight font-extrabold tabular-nums">{formatCents(cents)}</p>
    </div>
  );
}
