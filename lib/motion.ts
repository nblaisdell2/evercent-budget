/**
 * Shared animation timing, so every animation in EverCent feels like part of
 * one product. Motion (https://motion.dev) takes seconds and cubic-bezier
 * arrays; the CSS animations in app/globals.css use the same values.
 *
 *   import { motion } from "motion/react";
 *   import { TRANSITION } from "@/lib/motion";
 *   <motion.div animate={{ opacity: 1 }} transition={TRANSITION.enter} />
 *
 * Plain numbers with no imports, so a future Expo app (which animates with
 * Reanimated, not Motion) can reuse the same timing.
 */

/** Seconds. */
export const DURATION = {
  /** Hover and press feedback. */
  fast: 0.15,
  /** The default: drawers, collapsing rows, small moves. Matches the rails' 200ms. */
  base: 0.2,
  /** Something entering or leaving the screen. */
  slow: 0.3,
  /** One-off showpieces, like the landing chart's bars filling. */
  reveal: 0.7,
} as const;

/** Cubic-bezier curves. */
export const EASE = {
  /** CSS `ease`: the default for movement on screen. */
  standard: [0.25, 0.1, 0.25, 1],
  /** CSS `ease-out`: things arriving. */
  out: [0, 0, 0.58, 1],
  /** Quick start, long settle; the landing chart's bar fill. */
  emphasized: [0.2, 0.7, 0.2, 1],
} as const;

/** Ready-made transitions. MotionProvider makes `base` the app-wide default. */
export const TRANSITION = {
  base: { duration: DURATION.base, ease: EASE.standard },
  fast: { duration: DURATION.fast, ease: EASE.standard },
  enter: { duration: DURATION.slow, ease: EASE.out },
  reveal: { duration: DURATION.reveal, ease: EASE.emphasized },
  /** For layout animations (a row moving, a list reordering): no overshoot. */
  layout: { type: "spring", bounce: 0, duration: DURATION.slow },
} as const;
