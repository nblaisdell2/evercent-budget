import { AccordionCard } from "@/components/ui/accordion-card";
import { Button } from "@/components/ui/button";

/**
 * The bulk-operation drawer that pairs with the table's row checkboxes.
 *
 * These two buttons are hardcoded rather than modeled as data — they are UI
 * affordances, not budget entities.
 */
export function ActionsCard() {
  return (
    <AccordionCard title="Actions" bodyClassName="flex flex-col gap-[0.25rem] p-[0.3125rem]">
      <Button variant="solid" size="row" className="font-extrabold">
        Reset All Budget Amounts
      </Button>
      <Button variant="subtle" size="row" className="font-medium">
        Reset Budgeted Amounts
      </Button>
    </AccordionCard>
  );
}
