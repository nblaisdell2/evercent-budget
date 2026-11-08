import { formatCents, type Cents } from "@/lib/format/currency";

/**
 * `tabular-nums` is not optional here. Figma won't tell you this because it
 * renders each amount as its own text node, but with proportional digits the
 * BUDGETED / ACTIVITY / AVAILABLE columns come out visibly ragged in a browser.
 */
export function Money({ cents, className = "" }: { cents: Cents; className?: string }) {
  return <span className={`tabular-nums ${className}`}>{formatCents(cents)}</span>;
}
