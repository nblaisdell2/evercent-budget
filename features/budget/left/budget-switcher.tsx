"use client";

import { Chevron } from "@/components/icons";

/**
 * The budget's name, which is also the budget switcher. It's the title of the
 * left panel, beside the EverCent mark, so it reads as "you are in My Budget"
 * and the chevron says it can be changed.
 */
export function BudgetSwitcher({ name }: { name: string }) {
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={false}
      aria-label={`Budget: ${name}. Switch budget`}
      className="flex max-w-full min-w-0 items-center gap-1.5 rounded-control px-1.5 py-0.5 text-left text-fg-primary transition-colors hover:bg-surface-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent"
    >
      <span className="truncate text-title leading-tight font-bold">{name}</span>
      <Chevron width={11} className="shrink-0 text-fg-accent" />
    </button>
  );
}
