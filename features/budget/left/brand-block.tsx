import { GearIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { BudgetSwitcher } from "./budget-switcher";

/**
 * The product name, the budget you're in, and settings, at the top of the left
 * panel.
 *
 * The gear will open the settings modal (logging out, account settings) once
 * that exists, which is what `aria-haspopup` is declaring ahead of time.
 */
export function BrandBlock({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between gap-[0.75rem]">
      <div className="min-w-0">
        <p className="font-brand text-title leading-tight font-bold text-fg-wordmark">EverCent</p>
        <BudgetSwitcher name={name} />
      </div>

      <Button size="icon" aria-label="Settings" aria-haspopup="dialog" title="Settings">
        <GearIcon width={17} height={17} />
      </Button>
    </div>
  );
}
