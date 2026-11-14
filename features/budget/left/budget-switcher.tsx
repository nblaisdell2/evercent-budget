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
      className="flex min-w-0 max-w-full items-center gap-[0.375rem] rounded-control px-[0.375rem] py-[0.125rem] text-left text-fg-primary transition-colors hover:bg-surface-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent"
    >
      <span className="truncate text-title leading-tight font-bold">{name}</span>
      <Chevron width={11} className="shrink-0 text-fg-accent" />
    </button>
  );
}
