"use client";

/**
 * CrossFadeStack — M2 step 1 (2026-05-22), tokens wired M2 step 1.5.
 *
 * Controlled stack: parent owns activeIndex, this component renders exactly
 * one of N children at a time with a smooth opacity cross-fade. Built for
 * the M2 HeroSpread (homepage product spread) and the PDP image gallery.
 *
 * Defaults reference DESIGN.md tokens via CSS var() with literal fallbacks
 * for SSR safety: --dur-gallery (320ms) and --ease-out
 * (cubic-bezier(0.2, 0, 0, 1)). The fallback only ever appears if globals.css
 * hasn't loaded — under normal operation the tokens win.
 *
 * prefers-reduced-motion is handled entirely in CSS: the @media block in
 * globals.css collapses every --vfx-dur-* to 0ms, which propagates through
 * the aliases consumed here. No JS detection needed.
 *
 * SSR-safe: the active child is opacity 1 from the very first render — no
 * useEffect gate, no flicker. The transition only fires on activeIndex
 * changes after hydration.
 */

import { Children, type CSSProperties, type ReactNode } from "react";

export interface CrossFadeStackProps {
  children: ReactNode[];
  activeIndex: number;
  /** Fade duration as a CSS time value. Default reads --dur-gallery (320ms). */
  duration?: string;
  /** CSS easing. Default reads --ease-out (cubic-bezier(0.2, 0, 0, 1)). */
  easing?: string;
  /** Recommended — prevents layout shift. Examples: "4/5", "1/1", "16/9". */
  aspectRatio?: string;
  className?: string;
}

const DEFAULT_DURATION = "var(--dur-gallery, 320ms)";
const DEFAULT_EASING = "var(--ease-out, cubic-bezier(0.2, 0, 0, 1))";

export function CrossFadeStack({
  children,
  activeIndex,
  duration = DEFAULT_DURATION,
  easing = DEFAULT_EASING,
  aspectRatio,
  className,
}: CrossFadeStackProps) {
  const items = Children.toArray(children);

  if (process.env.NODE_ENV !== "production") {
    if (items.length === 0) {
      console.warn("[CrossFadeStack] children array is empty — nothing to render.");
    } else if (activeIndex < 0 || activeIndex >= items.length) {
      console.warn(
        `[CrossFadeStack] activeIndex ${activeIndex} is out of bounds (0..${items.length - 1}).`,
      );
    }
  }

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio,
  };

  return (
    <div className={className} style={containerStyle}>
      {items.map((child, i) => {
        const isActive = i === activeIndex;
        const itemStyle: CSSProperties = {
          position: "absolute",
          inset: 0,
          opacity: isActive ? 1 : 0,
          visibility: isActive ? "visible" : "hidden",
          pointerEvents: isActive ? "auto" : "none",
          transform: "translateZ(0)",
          transition: isActive
            ? `opacity ${duration} ${easing}, visibility 0s 0s`
            : `opacity ${duration} ${easing}, visibility 0s ${duration}`,
          willChange: "opacity",
        };
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            style={itemStyle}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default CrossFadeStack;
