import { formatCentsAbs, type Cents } from "@/lib/format/currency";

/**
 * A still of an account's transaction register for the landing page: the
 * account's balances up top, then each transaction with its category and where
 * it stands: pending (switch off), posted (switch on), or locked so it can't be
 * changed by accident.
 *
 * Responds to its own width (a container query), not the window's: when the
 * card is narrow it drops the Category and Credit columns rather than squeeze.
 */

type Status = "pending" | "posted" | "locked";

type Txn = {
  date: string;
  payee: string;
  category: string;
  /** Money out (a charge) is a debit; money in (a payment) is a credit. */
  debit?: Cents;
  credit?: Cents;
  status: Status;
};

const TRANSACTIONS: Txn[] = [
  { date: "Nov 14", payee: "Kroger", category: "Groceries", debit: 2_284, status: "pending" },
  { date: "Nov 13", payee: "Pizza Palace", category: "Dining out", debit: 1_240, status: "pending" },
  { date: "Nov 12", payee: "Shell", category: "Gas", debit: 4_120, status: "posted" },
  { date: "Nov 10", payee: "Card payment", category: "Transfer", credit: 25_000, status: "posted" },
  { date: "Nov 3", payee: "Target", category: "Household", debit: 6_487, status: "locked" },
  { date: "Nov 1", payee: "City Electric", category: "Electric", debit: 11_830, status: "locked" },
];

/* Narrow cards drop Category and Credit; @max-md is the card's own width. */
const COLS =
  "grid grid-cols-[3.75rem_minmax(0,1.2fr)_minmax(0,1fr)_4.5rem_4.5rem_2.75rem] items-center gap-x-[0.5rem] " +
  "@max-md/register:grid-cols-[3.25rem_minmax(0,1fr)_4.5rem_2.5rem]";
const WIDE_ONLY = "@max-md/register:hidden";
const NARROW_ONLY = "hidden @max-md/register:inline";

function Balance({ label, value, tone }: { label: string; value: string; tone: "inflow" | "owed" }) {
  return (
    <div className="flex items-baseline justify-between gap-[0.75rem] sm:block sm:text-right">
      <span className="block text-[0.75rem] font-medium text-fg-muted">{label}</span>
      <span
        className={`block text-[1.125rem] leading-tight font-bold tabular-nums ${
          tone === "inflow" ? "text-money-inflow" : "text-money-owed"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatusMark({ status }: { status: Status }) {
  if (status === "locked") {
    return (
      <svg viewBox="0 0 16 16" className="size-[0.875rem] fill-surface-control-strong">
        <path d="M4.5 7V5a3.5 3.5 0 1 1 7 0v2h.5A1.5 1.5 0 0 1 13.5 8.5v5A1.5 1.5 0 0 1 12 15H4a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 4 7h.5Zm1.75 0h3.5V5a1.75 1.75 0 1 0-3.5 0v2Z" />
      </svg>
    );
  }

  const on = status === "posted";
  return (
    <span
      className={`flex h-[1rem] w-[1.75rem] items-center rounded-full px-[0.125rem] ${
        on ? "justify-end bg-surface-control-strong" : "justify-start bg-border-control/60"
      }`}
    >
      <span className="size-[0.75rem] rounded-full bg-fg-primary" />
    </span>
  );
}

export function RegisterPreview() {
  return (
    <figure className="@container/register overflow-hidden rounded-hero border border-border-rule bg-surface-app">
      <figcaption className="sr-only">
        A sample account register for a rewards credit card: balance $533.74, $35.24 pending, and
        a true balance of $498.50. Six recent transactions, each with a category. The two newest
        are pending, two are posted, and two older ones are locked.
      </figcaption>

      <div aria-hidden="true">
        <div className="flex flex-col gap-[0.875rem] bg-surface-rail p-[1rem] sm:flex-row sm:items-start sm:justify-between sm:p-[1.25rem]">
          <div>
            <p className="text-[1.375rem] leading-tight font-extrabold text-fg-primary">Rewards card</p>
            <p className="mt-[0.125rem] text-[0.8125rem] font-medium text-fg-muted">Credit card</p>
          </div>
          <div className="grid gap-[0.375rem] sm:grid-cols-3 sm:gap-[1.25rem]">
            <Balance label="Balance" value="$533.74" tone="inflow" />
            <Balance label="Pending" value="-$35.24" tone="owed" />
            <Balance label="“True” balance" value="$498.50" tone="inflow" />
          </div>
        </div>

        <div
          className={`${COLS} h-rowhead border-y border-border-rule border-t-border-accent px-[0.75rem] text-colhead font-medium text-fg-muted`}
        >
          <span>Date</span>
          <span>Recipient</span>
          <span className={WIDE_ONLY}>Category</span>
          <span className="text-right">
            <span className={WIDE_ONLY}>Debit</span>
            <span className={NARROW_ONLY}>Amount</span>
          </span>
          <span className={`text-right ${WIDE_ONLY}`}>Credit</span>
          <span className="text-center">Posted</span>
        </div>

        {TRANSACTIONS.map((txn) => (
          <div
            key={txn.payee}
            className={`${COLS} h-row border-b border-border-rule px-[0.75rem] text-row font-medium last:border-b-0 odd:bg-surface-row-group even:bg-surface-rail`}
          >
            <span className="tabular-nums text-fg-secondary">{txn.date}</span>
            <span className="truncate text-fg-primary">{txn.payee}</span>
            <span className={`truncate text-fg-secondary ${WIDE_ONLY}`}>{txn.category}</span>
            <span className="text-right tabular-nums text-fg-primary">
              {txn.debit ? (
                formatCentsAbs(txn.debit)
              ) : (
                // Narrow cards have no Credit column, so a credit shows here instead.
                <span className={`text-money-inflow ${NARROW_ONLY}`}>
                  +{formatCentsAbs(txn.credit ?? 0)}
                </span>
              )}
            </span>
            <span className={`text-right tabular-nums text-money-inflow ${WIDE_ONLY}`}>
              {txn.credit ? formatCentsAbs(txn.credit) : ""}
            </span>
            <span className="grid place-items-center">
              <StatusMark status={txn.status} />
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}
