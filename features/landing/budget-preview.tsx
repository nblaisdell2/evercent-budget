import { Chevron } from "@/components/icons";
import { Money } from "@/components/ui/money";
import { AVAILABLE_PILL_CLASSES } from "@/features/budget/table/available-pill-styles";
import { MonthsAheadBadge } from "@/features/budget/table/months-ahead-badge";
import { deriveAvailableState, unfundedFraction } from "@/lib/domain/available-state";
import type { Cents } from "@/lib/format/currency";

/**
 * A still, read-only slice of the real budget screen for the landing page.
 *
 * It is built from the app's own parts rather than a screenshot: the same
 * `budget-grid` column utility (and therefore the same narrow-width stacking),
 * the same pill state logic and colors, the same months-ahead badge. If the
 * budget's look changes, this preview changes with it.
 */

type SampleCategory = {
  name: string;
  budgeted: Cents;
  activity: Cents;
  available: Cents;
  /** null = no goal, so any positive balance reads as covered. */
  target: Cents | null;
  monthsAhead: number;
};

type SampleGroup = { name: string; categories: SampleCategory[] };

const GROUPS: SampleGroup[] = [
  {
    name: "Monthly bills",
    categories: [
      { name: "Rent", budgeted: 145_000, activity: -145_000, available: 145_000, target: 145_000, monthsAhead: 2 },
      { name: "Electric", budgeted: 12_000, activity: -12_000, available: 0, target: 12_000, monthsAhead: 0 },
      { name: "Internet", budgeted: 7_000, activity: -7_000, available: 7_000, target: 7_000, monthsAhead: 5 },
      { name: "Phone", budgeted: 6_500, activity: 0, available: 6_500, target: 6_500, monthsAhead: 1 },
    ],
  },
  {
    name: "Everyday spending",
    categories: [
      { name: "Groceries", budgeted: 55_000, activity: -13_000, available: 42_000, target: 55_000, monthsAhead: 0 },
      { name: "Gas", budgeted: 18_000, activity: -4_120, available: 13_880, target: null, monthsAhead: 0 },
      { name: "Dining out", budgeted: 15_000, activity: -18_640, available: -3_640, target: 15_000, monthsAhead: 0 },
    ],
  },
  {
    name: "True expenses",
    categories: [
      { name: "Car insurance", budgeted: 10_200, activity: 0, available: 40_800, target: 61_200, monthsAhead: 0 },
      { name: "Gifts", budgeted: 5_000, activity: 0, available: 26_000, target: null, monthsAhead: 0 },
      { name: "Vacation", budgeted: 20_000, activity: 0, available: 115_000, target: 240_000, monthsAhead: 0 },
    ],
  },
];

const sum = (categories: SampleCategory[], pick: (c: SampleCategory) => Cents) =>
  categories.reduce((total, c) => total + pick(c), 0);

const ROW =
  "budget-grid h-row border-b border-border-rule pr-[0.75rem] " +
  "@max-xl/center:h-auto @max-xl/center:min-h-[3.25rem] @max-xl/center:py-[0.25rem]";

function SamplePill({ category }: { category: SampleCategory }) {
  const state = deriveAvailableState({ availableCents: category.available, targetCents: category.target });
  const unfunded = unfundedFraction(state);

  return (
    <span
      className={`relative ml-auto grid h-pillh w-pillw place-items-center overflow-hidden rounded-card ${AVAILABLE_PILL_CLASSES[state.kind]}`}
    >
      {unfunded > 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 right-0 bg-state-partial"
          style={{ width: `${unfunded * 100}%` }}
        />
      )}
      <Money cents={category.available} className="relative z-10 text-row font-semibold" />
    </span>
  );
}

export function BudgetPreview() {
  return (
    <figure className="overflow-hidden rounded-hero border border-border-rule bg-surface-app">
      <figcaption className="sr-only">
        A sample of the budget screen with three category groups. Monthly bills: Rent is funded
        and two months ahead, Internet five months ahead, Electric has nothing left. Everyday
        spending: Groceries is partly funded and Dining out is overspent by $36.40. True expenses:
        Car insurance and Vacation are being saved for over several months.
      </figcaption>

      <div aria-hidden="true" className="@container/center">
        <div className="budget-grid h-rowhead border-b border-border-rule border-t-border-accent pr-[0.75rem] @max-xl/center:h-auto @max-xl/center:min-h-[2.5rem] @max-xl/center:py-[0.25rem]">
          <span data-col="lead" />
          <span data-col="check" />
          <span data-col="label" className="text-colhead font-medium text-fg-muted">
            Group / category
          </span>
          <span data-col="budgeted" className="text-right text-colhead font-medium text-fg-muted">
            Budgeted
          </span>
          <span data-col="activity" className="text-right text-colhead font-medium text-fg-muted">
            Activity
          </span>
          <span data-col="available" className="text-right text-colhead font-medium text-fg-muted">
            Available
          </span>
        </div>

        {GROUPS.map((group) => (
          <div key={group.name}>
            <div className={`${ROW} bg-surface-row-group text-group font-bold text-fg-primary`}>
              <span data-col="lead" className="grid place-items-center">
                <Chevron width={12} direction="down" />
              </span>
              <span data-col="check" />
              <span data-col="label" className="truncate">
                {group.name}
              </span>
              <span data-col="budgeted" className="text-right">
                <Money cents={sum(group.categories, (c) => c.budgeted)} />
              </span>
              <span data-col="activity" className="text-right">
                <Money cents={sum(group.categories, (c) => c.activity)} />
              </span>
              <span data-col="available" className="text-right">
                <Money cents={sum(group.categories, (c) => c.available)} />
              </span>
            </div>

            {group.categories.map((category) => (
              <div key={category.name} className={`${ROW} text-row font-medium`}>
                <span data-col="lead" className="grid place-items-center">
                  <MonthsAheadBadge months={category.monthsAhead} />
                </span>
                <span data-col="check" />
                <span data-col="label" className="truncate text-fg-primary">
                  {category.name}
                </span>
                <span data-col="budgeted" className="text-right text-fg-primary">
                  <Money cents={category.budgeted} />
                </span>
                <span data-col="activity" className="text-right text-fg-secondary">
                  <Money cents={category.activity} />
                </span>
                <span data-col="available" className="flex justify-end">
                  <SamplePill category={category} />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </figure>
  );
}
