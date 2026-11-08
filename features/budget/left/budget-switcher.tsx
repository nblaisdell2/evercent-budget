"use client";

import { Chevron } from "@/components/icons";

/** The "My Budget" heading doubles as a budget switcher in the design. */
export function BudgetSwitcher({ name }: { name: string }) {
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={false}
      className="flex w-full items-center justify-between gap-[0.375rem] rounded-control text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent"
    >
      <span className="truncate text-title font-bold text-fg-primary">{name}</span>
      <Chevron width={19} className="mr-[0.625rem] shrink-0 text-fg-primary" />
    </button>
  );
}
