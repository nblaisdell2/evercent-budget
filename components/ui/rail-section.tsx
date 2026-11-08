"use client";

import { useState, type ReactNode } from "react";
import { Chevron } from "@/components/icons";

/**
 * A collapsible section on either rail, built the same way as a group in the
 * budget table: a header band in the group-row color with its rows beneath it,
 * all inside one container so the two read as a unit.
 *
 * `summary` sits at the right of the band and stays visible while collapsed.
 * `fill` lets an open section absorb the rail's spare height and scroll inside
 * itself, which is what the activity ledger needs.
 *
 * This is a client shell around server-rendered children, so only the
 * open/closed decision ships JavaScript. The section is a named container so a
 * summary can hide itself when the rail is too narrow to fit it.
 */
export function RailSection({
  title,
  summary,
  fill = false,
  defaultOpen = true,
  bodyClassName = "",
  children,
}: {
  title: string;
  summary?: ReactNode;
  fill?: boolean;
  defaultOpen?: boolean;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const fills = fill && open;

  return (
    <section
      className={`@container/rail-section overflow-hidden rounded-control bg-surface-panel ${
        fills ? "flex min-h-[9rem] flex-1 flex-col" : "shrink-0"
      }`}
    >
      <h2 className="shrink-0">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[1.75rem] w-full items-center gap-[0.3125rem] bg-surface-row-group px-[0.5rem] text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-accent"
        >
          <Chevron
            width={9}
            direction={open ? "down" : "right"}
            className="shrink-0 text-fg-muted"
          />
          <span className="truncate text-group font-bold text-fg-primary">{title}</span>
          {summary && (
            <span className="ml-auto shrink-0 text-row font-bold tabular-nums text-fg-primary">
              {summary}
            </span>
          )}
        </button>
      </h2>

      {open && <div className={`${fills ? "min-h-0 flex-1" : ""} ${bodyClassName}`}>{children}</div>}
    </section>
  );
}
