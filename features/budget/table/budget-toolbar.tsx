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
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1.5 py-0.5 pr-1.5 pl-7.75 @max-md/center:gap-x-1.5 @max-md/center:pl-1.5">
      <Button variant="tinted" className="pl-1.25">
        <AddFilledIcon width={23} height={23} />
        Add New Category
      </Button>

      <Button variant="tinted" className="pl-2.25">
        <DollarIcon width={12} height={23} />
        Move Money
      </Button>

      <div className="ml-auto flex items-center gap-2">
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
