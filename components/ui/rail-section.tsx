"use client";

import { useState, type ReactNode } from "react";
import { Chevron } from "@/components/icons";

/**
 * The left rail's collapsible ACCOUNTS / DEBTS groups. Same disclosure pattern
 * as AccordionCard but with no card chrome — just a chevron and an all-caps
 * heading, per the design.
 */
export function RailSection({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-[0.3125rem] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-accent"
      >
        <Chevron
          width={9}
          direction={open ? "down" : "right"}
          className="shrink-0 text-fg-primary"
        />
        <h2 className="text-section font-black tracking-[0.01em] text-fg-primary">{label}</h2>
      </button>

      {open && <div className="mt-[0.25rem]">{children}</div>}
    </section>
  );
}
