import type {
  Account,
  BudgetPageData,
  CalendarDay,
  CalendarMonth,
  Debt,
  FutureAllocation,
  Transaction,
} from "@/lib/domain/types";
import { budgetGroups } from "./budget-groups";

/*
 * Every display string here is precomputed rather than derived at render time.
 * That is not laziness — `new Date()` and implicit-locale `Intl` calls resolve
 * differently on the Node server than in the browser, and this screen is dense
 * enough in dates and currency that the resulting hydration mismatches would be
 * tedious to chase. When real logic replaces this module, the formatting moves
 * into the data layer where it belongs and no component changes.
 */

const accounts: Account[] = [
  { id: "acct-checking", name: "Checking", balanceCents: 384_210 },
  { id: "acct-savings", name: "Savings", balanceCents: 1_240_000 },
];

const debts: Debt[] = [{ id: "debt-school-loan", name: "School Loan", balanceCents: 1_842_500 }];

const activity: Transaction[] = [
  { id: "txn-1", dayLabel: "24th", payee: "Domino's", amountCents: 3_524, direction: "outflow" },
  { id: "txn-2", dayLabel: "24th", payee: "Walmart", amountCents: 12_847, direction: "outflow" },
  { id: "txn-3", dayLabel: "23rd", payee: "Taxes", amountCents: 41_200, direction: "outflow" },
  { id: "txn-4", dayLabel: "23rd", payee: "Paycheck", amountCents: 49_850, direction: "inflow" },
  { id: "txn-5", dayLabel: "19th", payee: "Shell", amountCents: 5_612, direction: "outflow" },
  { id: "txn-6", dayLabel: "18th", payee: "Trader Joe's", amountCents: 8_734, direction: "outflow" },
  { id: "txn-7", dayLabel: "14th", payee: "Spotify", amountCents: 1_199, direction: "outflow" },
  { id: "txn-8", dayLabel: "14th", payee: "Rent", amountCents: 150_000, direction: "outflow" },
  { id: "txn-9", dayLabel: "9th", payee: "Paycheck", amountCents: 49_850, direction: "inflow" },
  { id: "txn-10", dayLabel: "7th", payee: "Costco", amountCents: 21_408, direction: "outflow" },
  { id: "txn-11", dayLabel: "4th", payee: "Comcast", amountCents: 8_500, direction: "outflow" },
  { id: "txn-12", dayLabel: "2nd", payee: "City Electric", amountCents: 11_260, direction: "outflow" },
];

/** February's total budgeted, standing in for every future month's plan. */
const MONTHLY_PLAN_CENTS = 459_000;

const future: FutureAllocation[] = [
  { monthKey: "2024-03", label: "March", budgetedCents: 459_000, targetCents: MONTHLY_PLAN_CENTS },
  { monthKey: "2024-04", label: "April", budgetedCents: 398_500, targetCents: MONTHLY_PLAN_CENTS },
  { monthKey: "2024-05", label: "May", budgetedCents: 268_500, targetCents: MONTHLY_PLAN_CENTS },
  { monthKey: "2024-06", label: "June", budgetedCents: 125_000, targetCents: MONTHLY_PLAN_CENTS },
  { monthKey: "2024-07", label: "July", budgetedCents: 42_000, targetCents: MONTHLY_PLAN_CENTS },
];

/**
 * February 2024: a 29-day month whose 1st falls on a Thursday, hence the four
 * leading nulls. Built as a literal so the component performs no date
 * arithmetic at all.
 */
function buildCalendarCells(): (CalendarDay | null)[] {
  const eventsByDay: Record<number, CalendarDay["events"]> = {
    1: [{ id: "ev-1", kind: "payday", label: "Payday", amountCents: null }],
    6: [{ id: "ev-2", kind: "expense", label: "Electric", amountCents: 11_260 }],
    13: [{ id: "ev-3", kind: "expense", label: "Car Payment", amountCents: 25_000 }],
    15: [
      { id: "ev-4", kind: "payday", label: "Payday", amountCents: null },
      { id: "ev-5", kind: "expense", label: "Rent", amountCents: 150_000 },
      { id: "ev-6", kind: "expense", label: "Groceries", amountCents: 15_000 },
    ],
    22: [{ id: "ev-7", kind: "expense", label: "Internet", amountCents: 8_500 }],
    29: [{ id: "ev-8", kind: "payday", label: "Payday", amountCents: null }],
  };

  const leadingBlanks: (CalendarDay | null)[] = [null, null, null, null];
  const days: (CalendarDay | null)[] = Array.from({ length: 29 }, (_, i) => {
    const day = i + 1;
    return { day, events: eventsByDay[day] ?? [] };
  });

  return [...leadingBlanks, ...days];
}

const calendar: CalendarMonth = {
  label: "February 2024",
  cells: buildCalendarCells(),
  paycheckIndex: 3,
  paycheckTotal: 26,
  defaultSelectedDay: 15,
};

export const placeholderBudgetPage: BudgetPageData = {
  budget: {
    id: "budget-demo",
    name: "My Budget",
    toBeBudgetedCents: 25_000,
    accountsTotalCents: 1_624_210,
    debtsTotalCents: 1_842_500,
  },
  month: {
    key: "2024-02",
    label: "February 2024",
    shortLabel: "February",
    isCurrentMonth: true,
    isLatestMonth: false,
    hasPrevious: true,
    hasNext: true,
  },
  groups: budgetGroups,
  accounts,
  debts,
  activity,
  future,
  calendar,
};
