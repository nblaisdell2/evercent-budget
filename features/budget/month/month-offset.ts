import { useSyncExternalStore } from "react";

/**
 * How many months the screen has been stepped away from the current one.
 *
 * The month controls exist in two places (the left panel, and the top bar for
 * when that panel is off screen), so they share this rather than each keeping
 * their own and drifting apart. Real month navigation belongs in the data layer
 * and will replace it.
 */
let offset = 0;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function setMonthOffset(next: number) {
  offset = next;
  for (const listener of listeners) listener();
}

export function useMonthOffset() {
  const value = useSyncExternalStore(
    subscribe,
    () => offset,
    () => 0,
  );
  return [value, setMonthOffset] as const;
}
