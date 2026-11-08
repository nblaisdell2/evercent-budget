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
 * The tab that hides or shows a side panel. Open, it sits on the panel's inner
 * edge; closed, it pins to the window edge at the same height with its arrow
 * flipped, so the way back is where you left it. It stays one element in both
 * states, so keyboard focus survives the toggle. Placement is in globals.css.
 */
function RailToggle({
  side,
  open,
  onToggle,
}: {
  side: PanelSide;
  open: boolean;
  onToggle: () => void;
}) {
  const label = `${open ? "Hide" : "Show"} ${side === "left" ? "budget navigation" : "budget details"}`;
  const pointsLeft = (side === "left") === open;

  return (
    <button
      type="button"
      data-slot={`toggle-${side}`}
      data-open={open}
      onClick={onToggle}
      aria-label={label}
      aria-expanded={open}
      aria-controls={`rail-${side}`}
      title={label}
      className={[
        "grid h-[3rem] w-[0.75rem] place-items-center rounded-control bg-surface-control-solid text-fg-accent transition-colors",
        "hover:bg-surface-control-strong hover:text-fg-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-fg-primary",
        open ? "" : side === "left" ? "rounded-l-none" : "rounded-r-none",
      ].join(" ")}
    >
      <Chevron width={9} direction={pointsLeft ? "left" : "right"} />
    </button>
  );
}

/**
 * The page shell: three panels, plus a top bar that appears only while the left
 * panel is off screen (see `.ec-topbar` in globals.css).
 *
 * Desktop: rails are grid tracks that can be dragged, collapsed, and restored,
 * with the center panel guaranteed a minimum width by the grid's own track
 * sizing rather than by JavaScript.
 *
 * Tablet and phone: the rails leave the grid and become overlay drawers. They
 * open beneath the top bar, which stays visible and usable. The switch itself is
 * pure CSS (see `.ec-shell` in globals.css) so it is correct on first paint; the
 * media query here drives only behavior — `inert`, Escape, and the backdrop.
 *
 * `top` / `left` / `center` / `right` arrive as ReactNode props — the RSC
 * children pattern — so the panels' contents stay server-rendered even though
 * this component is client-side.
 */
export function PanelLayout({
  top,
  left,
  center,
  right,
}: {
  top: ReactNode;
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

  function toggleRail(side: PanelSide, isDrawer: boolean) {
    if (isDrawer) setOpenDrawer(activeDrawer === side ? null : side);
    else toggleCollapsed(side);
  }

  return (
    <div
      ref={containerRef}
      data-left-collapsed={state.leftCollapsed}
      className="ec-shell flex h-dvh w-full flex-col overflow-hidden bg-surface-app"
      style={
        {
          "--rail-left-req": `${state.leftCollapsed ? 0 : state.leftWidth}px`,
          "--rail-right-req": `${!hasRight || state.rightCollapsed ? 0 : state.rightWidth}px`,
          "--handle-left-req": state.leftCollapsed ? "0px" : "1px",
          "--handle-right-req": !hasRight || state.rightCollapsed ? "0px" : "1px",
        } as React.CSSProperties
      }
    >
      {top}

      <div className="ec-panels relative min-h-0 flex-1 overflow-hidden">
        {/* Rails stay mounted at all sizes — collapsed, drawered, or open — so
            their internal state (which sections are open) survives both a
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

        <RailToggle
          side="left"
          open={leftVisible}
          onToggle={() => toggleRail("left", leftIsDrawer)}
        />
        {hasRight && (
          <RailToggle
            side="right"
            open={rightVisible}
            onToggle={() => toggleRail("right", rightIsDrawer)}
          />
        )}
      </div>
    </div>
  );
}
