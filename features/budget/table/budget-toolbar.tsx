"use client";

import { AddFilledIcon, DollarIcon, RedoIcon, UndoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

/**
 * Add New Category / Move Money on the left, Undo / Redo on the right.
 *
 * Undo and Redo being first-class toolbar items — rather than buried in a menu —
 * is a real signal about this screen: it expects sweeping, occasionally-regretted
 * bulk edits. Wiring them to the reducer's history is a follow-up.
 */
export function BudgetToolbar() {
  return (
    /* Widths are intrinsic, not pinned. Figma specified 194px and 149px, but a
       fixed width breaks the moment a label changes and it overflows on a phone.
       The row wraps rather than clipping, so all four controls keep their labels
       at every width. */
    <div className="flex shrink-0 flex-wrap items-center gap-x-[1rem] gap-y-[0.375rem] py-[0.125rem] pl-[1.9375rem] pr-[0.375rem] @max-md/center:gap-x-[0.375rem] @max-md/center:pl-[0.375rem]">
      <Button variant="tinted" className="pl-[0.3125rem]">
        <AddFilledIcon width={23} height={23} />
        Add New Category
      </Button>

      <Button variant="tinted" className="pl-[0.5625rem]">
        <DollarIcon width={12} height={23} />
        Move Money
      </Button>

      <div className="ml-auto flex items-center gap-[0.5rem]">
        {/* On a phone these keep their names for screen readers but show only
            the arrow, so all four controls stay on one row. */}
        <Button>
          <UndoIcon width={20} height={8} />
          <span className="@max-md/center:sr-only">Undo</span>
        </Button>
        <Button>
          <RedoIcon width={20} height={8} />
          <span className="@max-md/center:sr-only">Redo</span>
        </Button>
      </div>
    </div>
  );
}
