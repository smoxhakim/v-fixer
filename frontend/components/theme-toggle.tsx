"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Sun/moon toggle wired to next-themes. Pre-mount renders a same-size
 * placeholder to avoid hydration mismatch. Uses a plain <button> so the
 * icon centers deterministically regardless of HeroUI variant CSS.
 */
export function ThemeToggle({ ariaLabel = "Toggle theme" }: { ariaLabel?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full"
      />
    );
  }

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
    >
      {isDark ? (
        <Sun className="h-5 w-5" strokeWidth={2.2} />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={2.2} />
      )}
    </button>
  );
}
