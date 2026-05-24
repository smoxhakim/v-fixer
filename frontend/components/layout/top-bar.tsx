"use client";

/**
 * TopBar — M2 step 2 (2026-05-23).
 *
 * Replaces the old Header. Matches the finalized homepage mock:
 *   ~/.gstack/projects/smoxhakim-v-fixer/designs/storefront-homepage-20260516/finalized.html
 *
 * Desktop: single ~60px row — Fraunces wordmark · search · FR·AR / Panier · N / Thème.
 * Mobile: two rows — wordmark + icon pills on top, full-width search beneath.
 * Theme toggle is hidden on mobile by design (low-frequency action).
 *
 * Routes (existing in this app, not the spec's wording):
 *   - Cart pill → /cart  (spec said /panier; that route doesn't exist)
 *   - Search submit → /search?q={q}  (spec said /products?q={q}; /products doesn't read q)
 *
 * Categories dropdown intentionally dropped per the trade-catalog brief —
 * search-first navigation; /categories is the browse entry.
 */

import { useEffect, useState, type FormEvent } from "react";
import { Search, ShoppingCart, Sun, Moon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Link as IntlLink, useRouter, usePathname } from "@/i18n/navigation";
import { useCart } from "@/context/cart-context";

import styles from "./top-bar.module.css";

export function TopBar() {
  const t = useTranslations("Header");
  const locale = useLocale() as "fr" | "ar";
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [themeReady, setThemeReady] = useState(false);

  // next-themes only resolves the active theme client-side. Defer the
  // sun/moon icon read until after mount so first paint matches SSR.
  useEffect(() => setThemeReady(true), []);

  const currentTheme = (theme === "system" ? resolvedTheme : theme) ?? "light";
  const isDark = currentTheme === "dark";

  const otherLocale: "fr" | "ar" = locale === "fr" ? "ar" : "fr";
  const switchLocale = () => {
    // Hard navigation: preserves query, sidesteps router/locale races.
    const suffix = pathname === "/" ? "" : pathname;
    const qs = typeof window !== "undefined" ? window.location.search : "";
    window.location.assign(`/${otherLocale}${suffix}${qs}`);
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const langLabel = t("topBarLangLabel", {
    current: locale === "fr" ? t("topBarLangFr") : t("topBarLangAr"),
  });
  const cartLabel = t("topBarCartLabel", { count: itemCount });

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "color-mix(in oklab, var(--vfx-bg) 92%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--vfx-rule)",
      }}
    >
      <div className={`${styles.topbarInner} mx-auto w-full max-w-7xl px-4`}>
        {/* Wordmark */}
        <IntlLink
          href="/"
          aria-label="v-fixer"
          className={styles.wordmark}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 24,
            lineHeight: 1,
            letterSpacing: "-0.015em",
            fontVariationSettings: '"opsz" 24',
            color: "var(--vfx-ink)",
            whiteSpace: "nowrap",
            textDecoration: "none",
          }}
        >
          v-fixer<span style={{ color: "var(--vfx-accent)" }}>.</span>
        </IntlLink>

        {/* Search */}
        <form role="search" onSubmit={submitSearch} className={styles.search}>
          <Search
            size={16}
            strokeWidth={2}
            aria-hidden
            style={{
              position: "absolute",
              insetInlineStart: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--vfx-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="search"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("topBarSearchPlaceholder")}
            aria-label={t("searchAria")}
            autoComplete="off"
            style={{
              width: "100%",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--vfx-ink)",
              background: "var(--vfx-surface)",
              border: "1px solid var(--vfx-rule)",
              borderRadius: 2,
              paddingBlock: 9,
              paddingInlineStart: 36,
              paddingInlineEnd: 12,
              outline: "none",
              transition:
                "border-color var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--vfx-accent)";
              e.currentTarget.style.background = "var(--vfx-bg)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--vfx-rule)";
              e.currentTarget.style.background = "var(--vfx-surface)";
            }}
          />
        </form>

        {/* Controls */}
        <nav className={styles.controls} aria-label={t("cartAria")}>
          {/* Language */}
          <button
            type="button"
            className={`${styles.pill} ${styles.pillLang}`}
            onClick={switchLocale}
            aria-label={langLabel}
          >
            <span className={`${styles.pillText} ${styles.langDesktop}`}>
              FR · AR
            </span>
            <span className={styles.langMobile}>
              {locale === "fr" ? "FR" : "AR"}
            </span>
          </button>

          {/* Cart */}
          <IntlLink
            href="/cart"
            className={`${styles.pill} ${styles.pillCart}`}
            aria-label={cartLabel}
          >
            <span className={styles.pillIcon} aria-hidden>
              <ShoppingCart size={18} strokeWidth={1.8} />
            </span>
            <span className={styles.pillText}>
              {t("topBarPanier")} ·{" "}
              <span className={styles.count}>{itemCount}</span>
            </span>
            {itemCount > 0 ? (
              <span className={styles.pillBadge} aria-hidden>
                {itemCount}
              </span>
            ) : null}
          </IntlLink>

          {/* Theme — desktop only */}
          <button
            type="button"
            className={`${styles.pill} ${styles.pillTheme}`}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={t("topBarThemeAria")}
          >
            <span className={styles.pillText}>{t("topBarTheme")}</span>
            <span className={styles.pillIcon} aria-hidden>
              {themeReady && isDark ? (
                <Sun size={16} strokeWidth={2} />
              ) : (
                <Moon size={16} strokeWidth={2} />
              )}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default TopBar;
