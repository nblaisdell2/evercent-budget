import type { Cents } from "@/lib/format/currency";

export type { Cents };

/** "2022-02" */
export type MonthKey = string;

export interface BudgetSummary {
  id: string;
  name: string;
  /** The zero-based-budgeting figure the whole screen revolves around. */
  toBeBudgetedCents: Cents;
}

/**
 * Everything the UI needs to render month context without doing date math.
 * Display strings are precomputed here on purpose — see the note in
 * placeholder/index.ts about why.
 */
export interface MonthContext {
  key: MonthKey;
  /** "February 2022" */
  label: string;
  /** "February" — feeds the "Activity in February" card title */
  shortLabel: string;
  isCurrentMonth: boolean;
  isLatestMonth: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
}

export type GroupKind = "normal" | "hidden";

export interface CategoryGroup {
  id: string;
  name: string;
  /** "hidden" is the trailing Hidden group: no chevron, not collapsible. */
  kind: GroupKind;
  /** Rolled-up totals. Fields, not getters — real logic will compute these
   *  server-side, and components must never sum children themselves. */
  budgetedCents: Cents;
  activityCents: Cents;
  availableCents: Cents;
  categories: Category[];
}

export interface Category {
  id: string;
  groupId: string;
  name: string;
  budgetedCents: Cents;
  activityCents: Cents;
  availableCents: Cents;
  /** The month's funding goal. null means no goal, so never "partial". */
  targetCents: Cents | null;
  /** Months fully funded ahead. > 0 renders the blue badge. */
  monthsAheadFunded: number;
}

export interface Account {
  id: string;
  name: string;
  balanceCents: Cents;
}

export interface Debt {
  id: string;
  name: string;
  balanceCents: Cents;
}

export type TransactionDirection = "outflow" | "inflow";

export interface Transaction {
  id: string;
  /** "24th" — ordinal precomputed by the data layer. */
  dayLabel: string;
  payee: string;
  /** Always positive; `direction` carries the sign. */
  amountCents: Cents;
  direction: TransactionDirection;
}

export interface FutureAllocation {
  monthKey: MonthKey;
  /** "March" */
  label: string;
  budgetedCents: Cents;
}

export type CalendarEventKind = "payday" | "expense";

export interface CalendarEvent {
  id: string;
  kind: CalendarEventKind;
  label: string;
  /** null renders no amount (Payday has none in the design). */
  amountCents: Cents | null;
}

export interface CalendarDay {
  day: number;
  events: CalendarEvent[];
}

export interface CalendarMonth {
  /** "August 2024" — the popup title is built from this plus the day. */
  label: string;
  /**
   * Flat 7-column cell array INCLUDING leading nulls for the blank days before
   * the 1st. The component renders cells.map() into a grid and does zero date
   * arithmetic, so when real logic lands, first-weekday and days-in-month
   * computation moves into the data layer and the grid component never changes.
   */
  cells: (CalendarDay | null)[];
  /** "#10 (out of 26)" */
  paycheckIndex: number;
  paycheckTotal: number;
  /** Day pre-selected on load. null matches the mock, where the selection
   *  circle exists but is hidden. */
  defaultSelectedDay: number | null;
}

/** The complete payload for one render of the budget page. */
export interface BudgetPageData {
  budget: BudgetSummary;
  month: MonthContext;
  groups: CategoryGroup[];
  accounts: Account[];
  debts: Debt[];
  activity: Transaction[];
  future: FutureAllocation[];
  calendar: CalendarMonth;
}
