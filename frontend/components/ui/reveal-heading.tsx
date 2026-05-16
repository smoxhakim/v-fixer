"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Section heading that reveals on scroll via a clip-path wipe from the bottom.
 * Falls back to a plain heading when the user prefers reduced motion.
 *
 * Polymorphic by level (defaults to h2). Use it as a drop-in replacement
 * for `<h2>`/`<h3>` etc. — same className, children, etc.
 */
export function RevealHeading({
  level = 2,
  className,
  children,
  delay = 0,
}: {
  level?: 1 | 2 | 3 | 4;
  className?: string;
  children: ReactNode;
  /** Optional extra delay (s) — useful when several headings reveal in sequence. */
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    if (level === 1) return <h1 className={className}>{children}</h1>;
    if (level === 3) return <h3 className={className}>{children}</h3>;
    if (level === 4) return <h4 className={className}>{children}</h4>;
    return <h2 className={className}>{children}</h2>;
  }

  /* clipPath wipes from bottom (covered) → top (revealed). Pair with a small
     y offset so the type also rises slightly while the wipe plays. */
  const variants: Variants = {
    hidden: { opacity: 0, y: 14, clipPath: "inset(100% 0 0 0)" },
    show: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0% 0 0 0)",
      transition: { duration: 0.55, delay, ease: [0.2, 0.7, 0.2, 1] },
    },
  };

  const common = {
    className,
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once: true, margin: "-60px" as const },
    variants,
  };

  if (level === 1) return <motion.h1 {...common}>{children}</motion.h1>;
  if (level === 3) return <motion.h3 {...common}>{children}</motion.h3>;
  if (level === 4) return <motion.h4 {...common}>{children}</motion.h4>;
  return <motion.h2 {...common}>{children}</motion.h2>;
}
