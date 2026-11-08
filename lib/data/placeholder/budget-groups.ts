import type { CategoryGroup } from "@/lib/domain/types";

/**
 * Realistic stand-in data shaped to match the Figma mock's row structure:
 * five normal groups holding 4 / 2 / 4 / 2 / 1 categories, plus a trailing
 * Hidden group — 19 rows in total.
 *
 * The mix is tuned so all four AVAILABLE states are visible without the table
 * turning into a wall of amber: 5 funded, 4 partial, 2 zero, 2 overspent. The
 * two partials with a lot of amber are both long-horizon savings goals, where
 * being early in the goal is the honest reading.
 *
 * Group totals are the sums of their children. They are plain fields rather
 * than getters because real logic will compute them server-side — components
 * must never sum children themselves.
 */
export const budgetGroups: CategoryGroup[] = [
  {
    id: "grp-monthly-bills",
    name: "Monthly Bills",
    kind: "normal",
    budgetedCents: 225_500,
    activityCents: -222_740,
    availableCents: 187_080,
    categories: [
      {
        id: "cat-rent",
        groupId: "grp-monthly-bills",
        name: "Rent",
        budgetedCents: 150_000,
        activityCents: -150_000,
        availableCents: 150_000,
        targetCents: 150_000,
        // Funded three months ahead — renders the blue badge.
        monthsAheadFunded: 3,
      },
      {
        id: "cat-groceries",
        groupId: "grp-monthly-bills",
        name: "Groceries",
        budgetedCents: 55_000,
        activityCents: -47_320,
        availableCents: 42_000,
        // 42000 / 55000 = 76.4% funded, so 23.6% of the pill renders amber.
        // Figma's partial segment is 23 of 97px (23.7%), so this lands within
        // half a pixel of the design while still reading as real data.
        targetCents: 55_000,
        monthsAheadFunded: 0,
      },
      {
        id: "cat-electric",
        groupId: "grp-monthly-bills",
        name: "Electric",
        budgetedCents: 12_000,
        activityCents: -12_000,
        availableCents: 0,
        targetCents: 12_000,
        monthsAheadFunded: 0,
      },
      {
        id: "cat-internet",
        groupId: "grp-monthly-bills",
        name: "Internet",
        budgetedCents: 8_500,
        activityCents: -13_420,
        availableCents: -4_920,
        targetCents: 8_500,
        monthsAheadFunded: 0,
      },
    ],
  },
  {
    id: "grp-transportation",
    name: "Transportation",
    kind: "normal",
    budgetedCents: 47_500,
    activityCents: -38_910,
    availableCents: 43_000,
    categories: [
      {
        id: "cat-gas",
        groupId: "grp-transportation",
        name: "Gas",
        budgetedCents: 22_500,
        activityCents: -18_910,
        availableCents: 18_000,
        targetCents: 22_500,
        monthsAheadFunded: 0,
      },
      {
        id: "cat-car-payment",
        groupId: "grp-transportation",
        name: "Car Payment",
        budgetedCents: 25_000,
        activityCents: -20_000,
        availableCents: 25_000,
        targetCents: 25_000,
        monthsAheadFunded: 1,
      },
    ],
  },
  {
    id: "grp-everyday",
    name: "Everyday Spending",
    kind: "normal",
    budgetedCents: 61_000,
    activityCents: -54_780,
    availableCents: 36_700,
    categories: [
      {
        id: "cat-dining",
        groupId: "grp-everyday",
        name: "Dining Out",
        budgetedCents: 20_000,
        activityCents: -24_300,
        availableCents: -4_300,
        targetCents: 20_000,
        monthsAheadFunded: 0,
      },
      {
        id: "cat-coffee",
        groupId: "grp-everyday",
        name: "Coffee",
        budgetedCents: 6_000,
        activityCents: -5_480,
        availableCents: 6_000,
        targetCents: 6_000,
        monthsAheadFunded: 0,
      },
      {
        id: "cat-hobbies",
        groupId: "grp-everyday",
        name: "Hobbies",
        budgetedCents: 15_000,
        activityCents: -10_000,
        availableCents: 15_000,
        targetCents: 15_000,
        monthsAheadFunded: 0,
      },
      {
        id: "cat-subscriptions",
        groupId: "grp-everyday",
        name: "Subscriptions",
        budgetedCents: 20_000,
        activityCents: -15_000,
        availableCents: 20_000,
        targetCents: 20_000,
        monthsAheadFunded: 2,
      },
    ],
  },
  {
    id: "grp-savings-goals",
    name: "Savings Goals",
    kind: "normal",
    budgetedCents: 90_000,
    activityCents: 0,
    availableCents: 268_000,
    categories: [
      {
        id: "cat-emergency-fund",
        groupId: "grp-savings-goals",
        name: "Emergency Fund",
        budgetedCents: 60_000,
        activityCents: 0,
        availableCents: 240_000,
        // 40% of a $6000 goal — a long-horizon target, so a large amber
        // remainder is the honest reading rather than an alarm.
        targetCents: 600_000,
        monthsAheadFunded: 0,
      },
      {
        id: "cat-vacation",
        groupId: "grp-savings-goals",
        name: "Vacation",
        budgetedCents: 30_000,
        activityCents: 0,
        availableCents: 28_000,
        targetCents: 120_000,
        monthsAheadFunded: 0,
      },
    ],
  },
  {
    id: "grp-debt-payments",
    name: "Debt Payments",
    kind: "normal",
    budgetedCents: 35_000,
    activityCents: -35_000,
    availableCents: 0,
    categories: [
      {
        id: "cat-school-loan",
        groupId: "grp-debt-payments",
        name: "School Loan",
        budgetedCents: 35_000,
        activityCents: -35_000,
        availableCents: 0,
        targetCents: 35_000,
        monthsAheadFunded: 0,
      },
    ],
  },
  {
    id: "grp-hidden",
    name: "Hidden",
    kind: "hidden",
    budgetedCents: 0,
    activityCents: 0,
    availableCents: 4_150,
    categories: [],
  },
];
