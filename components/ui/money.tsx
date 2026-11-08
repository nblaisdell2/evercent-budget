import { formatCents, formatCentsAbs, type Cents } from "@/lib/format/currency";

/**
 * `tabular-nums` is not optional here. Figma won't tell you this because it
 * renders each amount as its own text node, but with proportional digits the
 * BUDGETED / ACTIVITY / AVAILABLE columns come out visibly ragged in a browser.
 */
export function Money({
  cents,
  absolute = false,
  className = "",
}: {
  cents: Cents;
  /** Render the magnitude only, for ledgers that show direction by color. */
  absolute?: boolean;
  className?: string;
}) {
  return (
    <span className={`tabular-nums ${className}`}>
      {absolute ? formatCentsAbs(cents) : formatCents(cents)}
    </span>
  );
}
