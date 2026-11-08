"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Chevron } from "@/components/icons";
import { usePanelLayout } from "@/lib/panels/use-panel-layout";
import type { PanelSide } from "@/lib/panels/panel-store";
import {
  LEFT_RAIL_IS_DRAWER,
  RIGHT_RAIL_IS_DRAWER,
  useMediaQuery,
} from "@/lib/panels/use-media-query";
import { PanelResizer } from "./panel-resizer";

/**
 * Pinned to the shell edge whenever a rail is not visible — either collapsed on
 * desktop or closed as a drawer. Without it there would be no way back.
 */
function RailEdgeTab({
  side,
  label,
  onOpen,
}: {
  side: PanelSide;
  label: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      title={label}
      className={[
        "absolute top-1/2 z-50 grid h-[3rem] w-[0.875rem] -translate-y-1/2 place-items-center",
        "bg-surface-control text-fg-accent transition-colors hover:bg-surface-control-strong hover:text-fg-primary",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-accent",
        side === "left" ? "left-0 rounded-r-control" : "right-0 rounded-l-control",
      ].join(" ")}
    >
      <Chevron width={9} direction={side === "left" ? "right" : "left"} />
    </button>
  );
}

/**
 * The three-panel shell.
 *
 * Desktop: rails are grid tracks that can be dragged, collapsed, and restored,
 * with the center panel guaranteed a minimum width by the grid's own track
 * sizing rather than by JavaScript.
 *
 * Tablet and phone: the rails leave the grid and become overlay drawers. The
 * switch itself is pure CSS (see `.ec-shell` in globals.css) so it is correct on
 * first paint; the media query here drives only behavior — `inert`, Escape, and
 * the backdrop.
 *
 * `left` / `center` / `right` arrive as ReactNode props — the RSC children
 * pattern — so the panels' contents stay server-rendered even though this
 * component is client-side.
 */
export function PanelLayout({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, boundsFor, applyLiveWidth, commitWidth, toggleCollapsed, setCollapsed } =
    usePanelLayout(containerRef);

  const leftIsDrawer = useMediaQuery(LEFT_RAIL_IS_DRAWER);
  const rightIsDrawer = useMediaQuery(RIGHT_RAIL_IS_DRAWER);
  const [openDrawer, setOpenDrawer] = useState<PanelSide | null>(null);

  const hasRight = right != null;

  const closeDrawer = useCallback(() => setOpenDrawer(null), []);

  /* A drawer left open while the window widens back to desktop must stop
     counting as open. Deriving that here rather than clearing `openDrawer` in an
     effect keeps it impossible for the two to disagree — and avoids syncing
     state in an effect, which cascades renders. */
  const activeDrawer: PanelSide | null =
    (openDrawer === "left" && leftIsDrawer) || (openDrawer === "right" && rightIsDrawer)
      ? openDrawer
      : null;

  // Escape closes an open drawer.
  useEffect(() => {
    if (!activeDrawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeDrawer, closeDrawer]);

  const leftVisible = leftIsDrawer ? activeDrawer === "left" : !state.leftCollapsed;
  const rightVisible = rightIsDrawer ? activeDrawer === "right" : !state.rightCollapsed;

  return (
    <div
      ref={containerRef}
      className="ec-shell relative h-dvh w-full overflow-hidden bg-surface-app"
      style={
        {
          "--rail-left-req": `${state.leftCollapsed ? 0 : state.leftWidth}px`,
          "--rail-right-req": `${!hasRight || state.rightCollapsed ? 0 : state.rightWidth}px`,
          "--handle-left-req": state.leftCollapsed ? "0px" : "1px",
          "--handle-right-req": !hasRight || state.rightCollapsed ? "0px" : "1px",
        } as React.CSSProperties
      }
    >
      {/* Rails stay mounted at all sizes — collapsed, drawered, or open — so
          their internal state (which accordion cards are open) survives both a
          collapse/restore round trip and a breakpoint crossing. */}
      <aside
        id="rail-left"
        data-slot="rail-left"
        data-rail="left"
        data-open={leftIsDrawer ? activeDrawer === "left" : undefined}
        aria-label="Budget navigation"
        inert={!leftVisible}
        className="min-w-0 overflow-hidden bg-surface-rail"
      >
        {left}
      </aside>

      {!leftIsDrawer && !state.leftCollapsed && (
        <PanelResizer
          side="left"
          controls="rail-left"
          width={state.leftWidth}
          getBounds={() => boundsFor("left")}
          onLiveResize={(w) => applyLiveWidth("left", w)}
          onCommit={(w) => commitWidth("left", w)}
          onToggleCollapse={() => toggleCollapsed("left")}
          onRestoreDefault={() => setCollapsed("left", false)}
        />
      )}

      {/* Marked as a container so the budget table responds to the CENTER
          PANEL's width. Dragging a rail wider shrinks this without the viewport
          changing at all, which a media query would miss entirely. */}
      <main data-slot="center" className="@container/center flex min-w-0 flex-col overflow-hidden bg-surface-app">
        {center}
      </main>

      {hasRight && !rightIsDrawer && !state.rightCollapsed && (
        <PanelResizer
          side="right"
          controls="rail-right"
          width={state.rightWidth}
          getBounds={() => boundsFor("right")}
          onLiveResize={(w) => applyLiveWidth("right", w)}
          onCommit={(w) => commitWidth("right", w)}
          onToggleCollapse={() => toggleCollapsed("right")}
          onRestoreDefault={() => setCollapsed("right", false)}
        />
      )}

      <aside
        id="rail-right"
        data-slot="rail-right"
        data-rail="right"
        data-open={rightIsDrawer ? activeDrawer === "right" : undefined}
        aria-label="Budget details"
        inert={!rightVisible}
        hidden={!hasRight}
        className="min-w-0 overflow-hidden bg-surface-rail"
      >
        {right}
      </aside>

      {/* Click-away for drawer mode. */}
      {activeDrawer && (
        <button
          type="button"
          aria-label="Close panel"
          onClick={closeDrawer}
          className="absolute inset-0 z-30 cursor-default bg-black/50"
        />
      )}

      {!leftVisible && (
        <RailEdgeTab
          side="left"
          label="Show budget navigation"
          onOpen={() =>
            leftIsDrawer ? setOpenDrawer("left") : setCollapsed("left", false)
          }
        />
      )}
      {hasRight && !rightVisible && (
        <RailEdgeTab
          side="right"
          label="Show budget details"
          onOpen={() =>
            rightIsDrawer ? setOpenDrawer("right") : setCollapsed("right", false)
          }
        />
      )}
    </div>
  );
}
