/** Money is integer cents everywhere in this app. Format only at the edge. */
export type Cents = number;

/* The locale is pinned explicitly rather than left implicit. Intl's default
   locale resolves differently on the Node server than in the browser, which
   shows up as a hydration mismatch on exactly this kind of currency-heavy UI. */
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 100000 -> "$1,000.00";  -1000000 -> "-$10,000.00" */
export function formatCents(cents: Cents): string {
  return currency.format(cents / 100);
}

/** Absolute value, for ledger rows that carry direction separately. */
export function formatCentsAbs(cents: Cents): string {
  return currency.format(Math.abs(cents) / 100);
}

/**
 * Parse whatever a user typed into an editable money cell.
 * Tolerates "$", commas, spaces, and a leading/trailing minus.
 * Returns null when the input isn't a number, so callers can cancel the edit
 * rather than silently writing NaN.
 */
export function parseCents(input: string): Cents | null {
  const cleaned = input.replace(/[$,\s]/g, "").trim();
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

/** The raw string an editable cell seeds its input with — no "$", no commas,
 *  so the user never has to delete formatting before typing. */
export function toEditableString(cents: Cents): string {
  return (cents / 100).toFixed(2);
}
