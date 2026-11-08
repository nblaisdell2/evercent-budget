"use client";

import { useRef, useState } from "react";
import type { PanelSide } from "@/lib/panels/panel-store";

const KEYBOARD_STEP = 16;

/**
 * The draggable divider between a rail and the center panel.
 *
 * Pointer events (not mouse events) plus `setPointerCapture`, so the drag
 * survives the cursor outrunning the handle and works under touch.
 *
 * During the drag this calls `onLiveResize`, which writes a CSS custom property
 * straight to the DOM — no React state, so the table's 19 rows are not
 * re-rendered at pointer frequency. State is committed once, on pointerup.
 */
export function PanelResizer({
  side,
  controls,
  width,
  getBounds,
  onLiveResize,
  onCommit,
  onToggleCollapse,
  onRestoreDefault,
}: {
  side: PanelSide;
  /** id of the panel this separator resizes, for aria-controls */
  controls: string;
  width: number;
  /** Measures the container. Called once per gesture, never per frame. */
  getBounds: () => { min: number; max: number };
  onLiveResize: (width: number) => void;
  onCommit: (width: number) => void;
  onToggleCollapse: () => void;
  onRestoreDefault: () => void;
}) {
  const drag = useRef<{
    startX: number;
    startWidth: number;
    bounds: { min: number; max: number };
  } | null>(null);
  const live = useRef(width);
  const [dragging, setDragging] = useState(false);
  const [bounds, setBounds] = useState(() => ({ min: 0, max: 0 }));

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    e.preventDefault();
    // Capture can throw NotFoundError if the pointer is already gone; the drag
    // still works without it, just without tracking outside the element.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* non-fatal */
    }
    // Measured ONCE per gesture. Calling getBoundingClientRect() inside
    // pointermove would force a layout flush on every single frame.
    const measured = getBounds();
    drag.current = { startX: e.clientX, startWidth: width, bounds: measured };
    live.current = width;
    setBounds(measured);
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const delta = e.clientX - d.startX;
    // Dragging right grows a left rail but shrinks a right one.
    const proposed = d.startWidth + (side === "left" ? delta : -delta);
    const next = Math.round(Math.max(d.bounds.min, Math.min(d.bounds.max, proposed)));
    live.current = next;
    onLiveResize(next);
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* non-fatal */
    }
    drag.current = null;
    setDragging(false);
    onCommit(live.current);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const grow = side === "left" ? "ArrowRight" : "ArrowLeft";
    const shrink = side === "left" ? "ArrowLeft" : "ArrowRight";

    if (e.key === grow || e.key === shrink) {
      e.preventDefault();
      const b = getBounds();
      const proposed = width + (e.key === grow ? KEYBOARD_STEP : -KEYBOARD_STEP);
      onCommit(Math.round(Math.max(b.min, Math.min(b.max, proposed))));
    } else if (e.key === "Home") {
      e.preventDefault();
      onToggleCollapse();
    } else if (e.key === "End") {
      e.preventDefault();
      onRestoreDefault();
    }
  }

  return (
    <div
      data-slot={side === "left" ? "handle-left" : "handle-right"}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${side} panel`}
      aria-controls={controls}
      aria-valuenow={Math.round(width)}
      aria-valuemin={Math.round(bounds.min)}
      aria-valuemax={Math.round(bounds.max)}
      /* A screen reader announcing "248" is meaningless; this is not. */
      aria-valuetext={width === 0 ? "Collapsed" : `${Math.round(width)} pixels`}
      /* Not garnish: ARIA only honours valuenow/valuemin/valuemax on a
         separator when it is focusable. Without tabIndex the value semantics
         are simply ignored. */
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={onToggleCollapse}
      onKeyDown={handleKeyDown}
      className={[
        "relative z-20 w-px shrink-0 cursor-col-resize touch-none self-stretch transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-border-accent",
        dragging ? "bg-border-accent" : "bg-border-accent/40 hover:bg-border-accent",
      ].join(" ")}
    >
      {/* The visible divider is a hairline; this widens the grab target to a
          comfortable size without changing the layout. */}
      <span aria-hidden="true" className="absolute inset-y-0 -left-[0.1875rem] -right-[0.1875rem]" />
    </div>
  );
}
