import { UserButton } from "@clerk/nextjs";
import { EverCentMark } from "@/components/brand/evercent-logo";
import { BudgetSwitcher } from "./budget-switcher";

/**
 * The top of the left panel: the EverCent mark, the budget you're in (the
 * panel's title, and its switcher), and your account.
 *
 * The mark stands in for the "EverCent" wordmark so the budget name gets the
 * big type: inside the app, which budget you're looking at matters more than
 * which product you're in.
 *
 * The avatar is Clerk's UserButton: it opens a menu with account settings and
 * sign out. Its size and colors come from `clerkAppearance` in
 * lib/auth/appearance.ts.
 */
export function BrandBlock({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-[0.5rem]">
      <EverCentMark size="lg" />

      <div className="min-w-0 flex-1">
        <BudgetSwitcher name={name} />
      </div>

      <div className="grid size-control shrink-0 place-items-center">
        <UserButton />
      </div>
    </div>
  );
}
