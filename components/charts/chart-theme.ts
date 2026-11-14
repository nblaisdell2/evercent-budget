/**
 * EverCent's look for Recharts (https://recharts.org), used on Reporting and
 * in the Budget Visualizer. Every color is a CSS variable from
 * app/globals.css, so charts follow the same tokens as the rest of the UI.
 *
 * Recharts renders SVG in the browser: put charts in a "use client" component
 * and give the chart a parent with a real height (ResponsiveContainer fills
 * its parent, and a parent with no height draws nothing).
 *
 *   <ResponsiveContainer width="100%" height={240}>
 *     <BarChart data={rows}>
 *       <CartesianGrid {...CHART_GRID} />
 *       <XAxis dataKey="month" {...CHART_AXIS} />
 *       <YAxis {...CHART_AXIS} tickFormatter={formatAxisCents} />
 *       <Tooltip {...CHART_TOOLTIP} formatter={(v) => formatCents(Number(v))} />
 *       <Bar dataKey="debtCents" fill={CHART_COLORS.debt} radius={CHART_BAR_RADIUS} />
 *     </BarChart>
 *   </ResponsiveContainer>
 *
 * Animations: Recharts' default (isAnimationActive "auto") already skips them
 * for people who turned on "reduce motion", so leave it at the default.
 */

/** One color per budget category type (the --viz-* tokens), plus states. */
export const CHART_COLORS = {
  debt: "var(--viz-debt)",
  obligations: "var(--viz-obligations)",
  subscriptions: "var(--viz-subscriptions)",
  trueExpenses: "var(--viz-true-expenses)",
  unused: "var(--viz-unused)",
  funded: "var(--state-funded)",
  partial: "var(--state-partial)",
  overspent: "var(--state-overspent)",
  accent: "var(--border-accent)",
} as const;

/** Axis lines hidden, muted tick labels at the app's meta size. */
export const CHART_AXIS = {
  stroke: "var(--border-rule)",
  tick: { fill: "var(--fg-muted)", fontSize: "0.75rem" },
  tickLine: false,
  axisLine: false,
} as const;

/** Faint horizontal guides only. */
export const CHART_GRID = {
  stroke: "var(--border-rule)",
  vertical: false,
} as const;

/** Tooltip box styled like the app's popovers. */
export const CHART_TOOLTIP = {
  cursor: { fill: "var(--surface-band)" },
  contentStyle: {
    background: "var(--surface-control-solid)",
    border: "1px solid var(--border-rule)",
    borderRadius: "0.4375rem",
    color: "var(--fg-primary)",
    fontSize: "0.8125rem",
  },
  labelStyle: { color: "var(--fg-muted)" },
  itemStyle: { color: "var(--fg-primary)" },
} as const;

/** Rounded top corners on vertical bars. */
export const CHART_BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

/** Axis labels for cents: 125000 -> "$1.3K". Tooltips use formatCents instead. */
export function formatAxisCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(cents / 100);
}
