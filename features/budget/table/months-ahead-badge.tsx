/**
 * The blue circled number beside a category: how many future months are already
 * fully funded. Sits in the same 42px leading grid cell as a group row's
 * chevron — both are centered on the same axis in the design, which is why it
 * belongs in the row grid rather than being absolutely positioned.
 */
export function MonthsAheadBadge({ months }: { months: number }) {
  if (months <= 0) return null;

  const description = `Funded ${months} ${months === 1 ? "month" : "months"} ahead`;

  return (
    <span
      role="img"
      aria-label={description}
      title={description}
      className="grid size-badge place-items-center rounded-full bg-surface-control-strong text-colhead font-bold tabular-nums text-fg-on-fill"
    >
      {months}
    </span>
  );
}
