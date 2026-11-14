import type { AvailableState } from "@/lib/domain/available-state";

/**
 * Fill and text color for each AVAILABLE pill state.
 *
 * Kept out of `available-pill.tsx` because that file is a client module: a
 * server component importing a plain object from it would receive a client
 * reference, not the object. The landing page's static preview of the table
 * reads these too, so the two can never disagree about what "funded" looks like.
 */
export const AVAILABLE_PILL_CLASSES: Record<AvailableState["kind"], string> = {
  funded: "bg-state-funded text-state-funded-fg",
  partial: "bg-state-funded text-state-funded-fg",
  zero: "bg-state-zero text-state-zero-fg",
  overspent: "bg-state-overspent text-state-overspent-fg",
};
