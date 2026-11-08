"use client";

import { CheckIcon, MinusIcon } from "@/components/icons";
import type { CheckState } from "@/lib/domain/selection";

/**
 * A custom rounded box with a radix-icons:check glyph, so a native
 * <input type="checkbox"> would be styled away entirely.
 *
 * Using a button with aria-checked also expresses the indeterminate state
 * correctly: aria-checked="mixed" is the accessible truth, and it avoids the
 * useEffect+ref dance that native `input.indeterminate` requires.
 *
 * The box is deliberately small; the `after` layer keeps the clickable area at
 * 24px so it stays easy to hit.
 */
export function CheckBox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: CheckState;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  const isOn = checked === true;
  const isMixed = checked === "mixed";

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isMixed ? "mixed" : isOn}
      aria-label={ariaLabel}
      onClick={() => onChange(!isOn)}
      className={[
        "relative grid size-checkbox place-items-center rounded-[0.1875rem] border transition-colors",
        "after:absolute after:-inset-[0.375rem] after:content-['']",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent",
        isOn || isMixed
          ? "border-border-control bg-surface-checkbox-on"
          : "border-border-muted bg-transparent hover:border-border-accent",
      ].join(" ")}
    >
      {isOn && <CheckIcon width={14} height={14} className="absolute text-fg-primary" />}
      {isMixed && <MinusIcon width={7} height={1.5} className="text-fg-primary" />}
    </button>
  );
}
