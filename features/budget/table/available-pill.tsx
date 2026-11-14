"use client";

import { EditableCurrencyCell } from "@/components/ui/editable-currency-cell";
import { unfundedFraction, type AvailableState } from "@/lib/domain/available-state";
import type { Cents } from "@/lib/format/currency";
import { AVAILABLE_PILL_CLASSES } from "./available-pill-styles";

/**
 * The AVAILABLE pill: 97x28, rounded 4px, colored by state, and click-to-edit.
 *
 * The partially-funded variant is a green base with an amber segment anchored to
 * the pill's RIGHT edge, sized as a percentage. Driving it off a ratio rather
 * than a pixel width means it is already data-driven — swapping placeholder
 * targets for real goals needs no code change here.
 *
 * The width goes through a CSS custom property rather than an inline `width`
 * because Tailwind cannot generate a class for a runtime value; routing it
 * through `--unfunded` keeps the sizing in the class list with everything else.
 */
export function AvailablePill({
  state,
  valueCents,
  isEditing,
  onStartEdit,
  onCommit,
  onCancel,
  label,
}: {
  state: AvailableState;
  valueCents: Cents;
  isEditing: boolean;
  onStartEdit: () => void;
  onCommit: (cents: Cents) => void;
  onCancel: () => void;
  label: string;
}) {
  const unfunded = unfundedFraction(state);

  return (
    <div
      className={`relative ml-auto h-pillh w-pillw overflow-hidden rounded-card ${AVAILABLE_PILL_CLASSES[state.kind]}`}
      style={{ ["--unfunded" as string]: `${unfunded * 100}%` }}
    >
      {state.kind === "partial" && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-[var(--unfunded)] bg-state-partial"
        />
      )}

      {/* The input renders inside the pill so the state color stays visible
          while typing — that is what "similar to YNAB" means in practice. */}
      <EditableCurrencyCell
        valueCents={valueCents}
        isEditing={isEditing}
        onStartEdit={onStartEdit}
        onCommit={onCommit}
        onCancel={onCancel}
        ariaLabel={`Available for ${label}`}
        boxClassName="relative z-10 h-full w-full px-[0.3125rem] text-center"
        className="text-row font-semibold"
      />
    </div>
  );
}
