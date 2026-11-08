"use client";

import { useState, type ReactNode } from "react";
import { Chevron } from "@/components/icons";

/**
 * The right rail's card chrome: tinted body, accent border, 40px solid accent
 * header bar with a collapse chevron.
 *
 * This is a client shell that renders `children` handed to it from a server
 * component. That keeps the RSC boundary shallow — the ledger rows and
 * dot-leader rows inside these cards stay server-rendered and ship zero JS;
 * only the open/closed decision is client-side.
 */
export function AccordionCard({
  title,
  defaultOpen = true,
  bodyClassName = "",
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-card border border-border-accent bg-surface-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-cardhead w-full items-center gap-[0.375rem] bg-surface-card-header px-[0.5625rem] text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg-primary"
      >
        <Chevron
          width={11}
          direction={open ? "down" : "right"}
          className="shrink-0 text-fg-primary transition-transform"
        />
        <h2 className="truncate text-group font-extrabold text-fg-primary">{title}</h2>
      </button>

      {open && <div className={bodyClassName}>{children}</div>}
    </section>
  );
}
