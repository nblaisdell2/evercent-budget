"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { TRANSITION } from "@/lib/motion";

/**
 * App-wide settings for Motion animations, wrapped around every page in
 * app/layout.tsx. It renders no element of its own.
 *
 * reducedMotion="user": when someone has turned on "reduce motion" in their
 * operating system, Motion skips movement (transforms and layout changes) and
 * keeps only fades, matching the CSS animations in globals.css.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={TRANSITION.base}>
      {children}
    </MotionConfig>
  );
}
