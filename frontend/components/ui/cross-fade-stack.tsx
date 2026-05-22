"use client";

/**
 * CrossFadeStack — M2 step 1 (2026-05-22).
 *
 * Controlled stack: parent owns activeIndex, this component renders exactly
 * one of N children at a time with a smooth opacity cross-fade. Built for
 * the M2 HeroSpread (homepage product spread) and the PDP image gallery.
 *
 * Defaults track DESIGN.md tokens: 320ms / cubic-bezier(0.2, 0, 0, 1)
 * (--dur-gallery / --ease-out). Honors prefers-reduced-motion by collapsing
 * the transition to 0ms (instant swap, no fade).
 *
 * SSR-safe: the active child is opacity 1 from the very first render — no
 * useEffect gate, no flicker. The transition only fires on activeIndex
 * changes after hydration.
 */

import {
  Children,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useState,
} from "react";

export interface CrossFadeStackProps {
  children: ReactNode[];
  activeIndex: number;
  /** Fade duration in ms. Default 320ms (DESIGN.md --dur-gallery). */
  duration?: number;
  /** CSS easing. Default cubic-bezier(0.2, 0, 0, 1) (DESIGN.md --ease-out). */
  easing?: string;
  /** Recommended — prevents layout shift. Examples: "4/5", "1/1", "16/9". */
  aspectRatio?: string;
  className?: string;
}

const DEFAULT_DURATION = 320;
const DEFAULT_EASING = "cubic-bezier(0.2, 0, 0, 1)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function CrossFadeStack({
  children,
  activeIndex,
  duration = DEFAULT_DURATION,
  easing = DEFAULT_EASING,
  aspectRatio,
  className,
}: CrossFadeStackProps) {
  const items = Children.toArray(children);
  const reducedMotion = usePrefersReducedMotion();
  const effectiveDuration = reducedMotion ? 0 : duration;

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
            ? `opacity ${effectiveDuration}ms ${easing}, visibility 0s 0s`
            : `opacity ${effectiveDuration}ms ${easing}, visibility 0s ${effectiveDuration}ms`,
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
