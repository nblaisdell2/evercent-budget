/**
 * Persisted side-panel preferences.
 *
 * Implemented as an external store rather than component state for two reasons:
 * `useSyncExternalStore` gives a distinct server snapshot, so SSR renders the
 * defaults and hydration cannot mismatch; and it keeps the localStorage read out
 * of an effect body, which the repo's `react-hooks/set-state-in-effect` rule
 * would otherwise reject.
 */

export interface PanelState {
  /** Rail widths in px, at the current --ui-scale. */
  leftWidth: number;
  rightWidth: number;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
}

export type PanelSide = "left" | "right";

const STORAGE_KEY = "evercent.panels.v1";

/** 15.5rem — matches --spacing-rail. */
export const DEFAULT_RAIL_REM = 15.5;
/** Drag bounds and the center panel's floor, in rem. See globals.css. */
export const RAIL_MIN_REM = 12;
export const RAIL_MAX_REM = 26;
export const CENTER_MIN_REM = 30;

function defaults(): PanelState {
  return {
    leftWidth: DEFAULT_RAIL_REM * 16,
    rightWidth: DEFAULT_RAIL_REM * 16,
    leftCollapsed: false,
    rightCollapsed: false,
  };
}

const SERVER_SNAPSHOT: PanelState = defaults();

/* The snapshot must be a stable reference between changes — returning a fresh
   object each call would spin useSyncExternalStore forever. */
let snapshot: PanelState = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getSnapshot(): PanelState {
  return snapshot;
}

export function getServerSnapshot(): PanelState {
  return SERVER_SNAPSHOT;
}

function isPanelState(value: unknown): value is PanelState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.leftWidth === "number" &&
    typeof v.rightWidth === "number" &&
    typeof v.leftCollapsed === "boolean" &&
    typeof v.rightCollapsed === "boolean" &&
    Number.isFinite(v.leftWidth) &&
    Number.isFinite(v.rightWidth)
  );
}

/**
 * Called once after mount. Reading during module init instead would make the
 * first client render disagree with the server HTML.
 */
export function hydrateFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!isPanelState(parsed)) return;
    snapshot = parsed;
    emit();
  } catch {
    // Corrupt or unavailable storage (private mode, quota) — keep the defaults.
  }
}

export function setPanelState(patch: Partial<PanelState>): void {
  const next = { ...snapshot, ...patch };
  if (
    next.leftWidth === snapshot.leftWidth &&
    next.rightWidth === snapshot.rightWidth &&
    next.leftCollapsed === snapshot.leftCollapsed &&
    next.rightCollapsed === snapshot.rightCollapsed
  ) {
    return;
  }
  snapshot = next;
  emit();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Persistence is best-effort; the in-memory state is still correct.
  }
}

export function resetPanels(): void {
  setPanelState(defaults());
}
