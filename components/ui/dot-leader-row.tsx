import type { ReactNode } from "react";

/**
 * The "Budgeted in the Future" row shape: label, a dotted rule that fills the
 * gap, then a right-aligned amount.
 *
 * The `flex-1` spacer means the leader auto-sizes to whatever the label and
 * amount leave over — which is what Figma actually shows (leaders of
 * 152/163/165/163/171px all terminating at the same right edge). A literal
 * string of periods would not survive a width change.
 */
export function DotLeaderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-[0.25rem] text-meta font-medium text-fg-primary">
      <span className="shrink-0">{label}</span>
      <span aria-hidden="true" className="dot-leader mb-[0.25rem] h-px flex-1" />
      <span className="shrink-0 tabular-nums">{children}</span>
    </div>
  );
}
