"use client";

import { Chevron } from "@/components/icons";

/** The budget's name sits under the wordmark and doubles as a budget switcher. */
export function BudgetSwitcher({ name }: { name: string }) {
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={false}
      className="flex max-w-full items-center gap-[0.3125rem] rounded-card text-left text-fg-secondary transition-colors hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent"
    >
      <span className="truncate text-row font-semibold">{name}</span>
      <Chevron width={9} className="shrink-0" />
    </button>
  );
}
