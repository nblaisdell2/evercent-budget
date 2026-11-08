"use client";

import { useSyncExternalStore } from "react";

/*
 * `matchMedia` is a natural external store, so this needs no effect and no
 * setState — which keeps it clear of the repo's `react-hooks/set-state-in-effect`
 * rule and gives SSR a deterministic snapshot.
 *
 * Subscriptions are memoized at module scope by query string so the subscribe
 * function identity is stable across renders; an inline closure would make
 * useSyncExternalStore resubscribe on every render.
 */
const lists = new Map<string, MediaQueryList>();
const subscribers = new Map<string, (onChange: () => void) => () => void>();

function listFor(query: string): MediaQueryList | null {
  if (typeof window === "undefined") return null;
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

function subscriberFor(query: string) {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = (onChange: () => void) => {
      const list = listFor(query);
      if (!list) return () => {};
      list.addEventListener("change", onChange);
      /* Also listen to resize. MediaQueryList change events are unreliable in
         some embedded webviews and under CDP-driven viewport emulation, where
         CSS re-evaluates but the event never fires. getSnapshot returns a
         primitive, so the extra notifications are free — React bails out when
         the value is unchanged. */
      window.addEventListener("resize", onChange);
      return () => {
        list.removeEventListener("change", onChange);
        window.removeEventListener("resize", onChange);
      };
    };
    subscribers.set(query, subscribe);
  }
  return subscribe;
}

/**
 * @param query      a CSS media query string
 * @param serverValue what SSR should assume; defaults to desktop
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    subscriberFor(query),
    // A primitive snapshot, so the "must return a cached reference" trap that
    // bites object snapshots does not apply.
    () => listFor(query)?.matches ?? serverValue,
    () => serverValue,
  );
}

/** Matches the CSS breakpoints in globals.css — keep the two in step. */
export const RIGHT_RAIL_IS_DRAWER = "(max-width: 63.999rem)";
export const LEFT_RAIL_IS_DRAWER = "(max-width: 47.999rem)";
