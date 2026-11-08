import type { Category } from "./types";

/**
 * The four visual states of the AVAILABLE pill.
 *
 * A discriminated union rather than a plain enum so `fundedRatio` only exists
 * on the one variant where it means anything.
 */
export type AvailableState =
  | { kind: "funded" }
  | { kind: "partial"; fundedRatio: number }
  | { kind: "zero" }
  | { kind: "overspent" };

/**
 * Map a category onto its pill state.
 *
 * This lives in a pure module, deliberately not in JSX, for two reasons: it is
 * the piece most likely to be replaced when real goal rules land (YNAB has
 * several goal types that all collapse into these same four visuals), and it is
 * the only logic on this screen genuinely worth unit-testing.
 *
 * Precedence is top to bottom.
 */
export function deriveAvailableState(
  category: Pick<Category, "availableCents" | "targetCents">,
): AvailableState {
  const { availableCents, targetCents } = category;

  if (availableCents < 0) return { kind: "overspent" };
  if (availableCents === 0) return { kind: "zero" };

  // No goal set, or the goal is met or beaten.
  if (targetCents === null || targetCents <= 0 || availableCents >= targetCents) {
    return { kind: "funded" };
  }

  return { kind: "partial", fundedRatio: availableCents / targetCents };
}

/** Fraction of the pill that should render as the amber "not yet funded"
 *  segment, anchored to the right edge. 0 for every non-partial state. */
export function unfundedFraction(state: AvailableState): number {
  return state.kind === "partial" ? 1 - state.fundedRatio : 0;
}
