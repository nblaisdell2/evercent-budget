import { Button } from "@/components/ui/button";
import { RailSection } from "@/components/ui/rail-section";

/**
 * Actions that apply to the budget as a whole. Both resets send money back to
 * To Be Budgeted, which sits right above this section in the top bar.
 *
 * They wipe out work, so each stays calm until hovered and only then turns red.
 */
export function ActionsCard({ monthLabel }: { monthLabel: string }) {
  return (
    <RailSection
      title="Budget actions"
      bodyClassName="grid grid-cols-[repeat(auto-fit,minmax(7.25rem,1fr))] gap-[0.25rem] p-[0.375rem]"
    >
      <Button
        variant="destructive"
        className="justify-center"
        title={`Clears ${monthLabel}'s Budgeted column and returns that money to To be budgeted.`}
      >
        Reset {monthLabel}
      </Button>
      <Button
        variant="destructive"
        className="justify-center"
        title="Empties every category across all months, so Available is $0.00 everywhere and all the money returns to To be budgeted."
      >
        Reset all months
      </Button>
    </RailSection>
  );
}
