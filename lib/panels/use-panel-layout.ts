"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  CENTER_MIN_REM,
  DEFAULT_RAIL_REM,
  DEFAULT_RIGHT_RAIL_REM,
  RAIL_MAX_REM,
  RAIL_MIN_REM,
  getServerSnapshot,
  getSnapshot,
  hydrateFromStorage,
  setPanelState,
  subscribe,
  type PanelSide,
  type PanelState,
} from "./panel-store";

/**
 * Bounds are stored in rem and converted against the live root font-size, so
 * they follow the global --ui-scale knob instead of hardcoding px.
 */
function rootPx(): number {
  if (typeof window === "undefined") return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

export interface PanelBounds {
  min: number;
  max: number;
}

export function usePanelLayout(containerRef: React.RefObject<HTMLDivElement | null>) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Read persisted prefs only after mount — see panel-store.ts.
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  /* Callbacks read the store directly rather than closing over `state`. The
     external store is always current, so this keeps the callbacks stable
     without mirroring state into a ref. */
  const effectiveWidth = useCallback(
    (side: PanelSide, s: PanelState = getSnapshot()) =>
      side === "left"
        ? s.leftCollapsed
          ? 0
          : s.leftWidth
        : s.rightCollapsed
          ? 0
          : s.rightWidth,
    [],
  );

  /** Upper bound for one rail: whatever is left after the other rail and the
   *  center panel's floor have taken their share. */
  const boundsFor = useCallback(
    (side: PanelSide): PanelBounds => {
      const px = rootPx();
      const containerW = containerRef.current?.getBoundingClientRect().width ?? 0;
      const other = effectiveWidth(side === "left" ? "right" : "left");
      const room = containerW - other - CENTER_MIN_REM * px;
      return {
        min: RAIL_MIN_REM * px,
        max: Math.max(RAIL_MIN_REM * px, Math.min(RAIL_MAX_REM * px, room)),
      };
    },
    [containerRef, effectiveWidth],
  );

  const clamp = useCallback(
    (side: PanelSide, proposed: number) => {
      const { min, max } = boundsFor(side);
      return Math.round(Math.max(min, Math.min(max, proposed)));
    },
    [boundsFor],
  );

  /** Write straight to the DOM during a drag. Committing to React state on
   *  every pointermove would re-render all 19 table rows at 60fps. */
  const applyLiveWidth = useCallback(
    (side: PanelSide, width: number) => {
      containerRef.current?.style.setProperty(
        side === "left" ? "--rail-left-w" : "--rail-right-w",
        `${width}px`,
      );
    },
    [containerRef],
  );

  const commitWidth = useCallback(
    (side: PanelSide, width: number) => {
      /* Drop the drag's inline value. Left in place it would outrank the
         stylesheet for good, and collapsing the rail would stop working. */
      containerRef.current?.style.removeProperty(
        side === "left" ? "--rail-left-w" : "--rail-right-w",
      );
      setPanelState(side === "left" ? { leftWidth: width } : { rightWidth: width });
    },
    [containerRef],
  );

  const toggleCollapsed = useCallback((side: PanelSide) => {
    const s = getSnapshot();
    setPanelState(
      side === "left" ? { leftCollapsed: !s.leftCollapsed } : { rightCollapsed: !s.rightCollapsed },
    );
  }, []);

  const setCollapsed = useCallback((side: PanelSide, collapsed: boolean) => {
    setPanelState(side === "left" ? { leftCollapsed: collapsed } : { rightCollapsed: collapsed });
  }, []);

  const restoreDefault = useCallback((side: PanelSide) => {
    const width = (side === "left" ? DEFAULT_RAIL_REM : DEFAULT_RIGHT_RAIL_REM) * rootPx();
    setPanelState(
      side === "left"
        ? { leftWidth: width, leftCollapsed: false }
        : { rightWidth: width, rightCollapsed: false },
    );
  }, []);

  /*
   * There is deliberately no resize handler here.
   *
   * The shell's grid template is `minmax(0, railWidth) … minmax(--center-min,
   * 1fr) … minmax(0, railWidth)`, so when the window shrinks the browser's own
   * track-sizing algorithm squeezes the rails and keeps the center panel above
   * its floor. Stored widths are never rewritten, which means widening the
   * window restores the rails exactly — something a handler that clamped and
   * re-saved the widths would have destroyed.
   */

  return {
    state,
    effectiveWidth,
    boundsFor,
    clamp,
    applyLiveWidth,
    commitWidth,
    toggleCollapsed,
    setCollapsed,
    restoreDefault,
  };
}
