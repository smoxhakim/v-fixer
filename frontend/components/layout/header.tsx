"use client";

import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Flame,
  Truck,
  MapPin,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAdminToken } from "@/hooks/use-admin-token";
import { getCategories } from "@/lib/api";
import {
  readRecentSearchKeywords,
  rememberSearchKeyword,
  subscribeRecentSearchKeywords,
} from "@/lib/recent-search-keywords";

export function Header() {
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { itemCount } = useCart();
  const { token } = useAdminToken();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);

  const navLinks = [
    { labelKey: "navHome" as const, href: "/" },
    { labelKey: "navCollections" as const, href: "/category/smartphone" },
    { labelKey: "navProducts" as const, href: "/category/computer" },
    { labelKey: "navAudio" as const, href: "/category/audio" },
    { labelKey: "navGaming" as const, href: "/category/game-console" },
  ];

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setRecentKeywords(readRecentSearchKeywords());
    return subscribeRecentSearchKeywords(() =>
      setRecentKeywords(readRecentSearchKeywords()),
    );
  }, []);

  useEffect(() => {
    setRecentKeywords(readRecentSearchKeywords());
  }, [pathname]);

  const runSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setRecentKeywords(rememberSearchKeyword(q));
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  const otherLocale = locale === "fr" ? "ar" : "fr";

  /** Full document navigation so `<html lang dir>` and root fonts re-run (RTL vs LTR). Client-side locale switches alone do not always refresh those. */
  const switchLocaleHard = () => {
    const suffix = pathname === "/" ? "" : pathname;
    const qs = typeof window !== "undefined" ? window.location.search : "";
    window.location.assign(`/${otherLocale}${suffix}${qs}`);
  };

  const accountHref = token ? "/admin/dashboard/settings/profile" : "/admin/login";
  const accountAria = token ? t("adminProfileAria") : t("accountAria");

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-2xl font-bold text-foreground">
              <span className="text-primary">V-</span>fixer
            </span>
          </Link>

          {/* Shop Now button */}
          <Link
            href="/category/smartphone"
            className="hidden md:flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("shopNow")}
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                runSearch();
              }}
            >
              <input
                type="search"
                name="q"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pe-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute end-0 top-0 bottom-0 flex items-center justify-center w-10 text-muted-foreground hover:text-primary transition-colors"
                aria-label={t("searchAria")}
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 ms-auto">
            <button
              type="button"
              onClick={switchLocaleHard}
              className="cursor-pointer rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
              aria-label={locale === "fr" ? t("switchToAr") : t("switchToFr")}
            >
              {locale === "fr" ? t("switchToAr") : t("switchToFr")}
            </button>
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t("toggleMenu")}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link
              href="#"
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label={t("wishlistAria")}
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              aria-label={t("cartAria")}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href={accountHref}
              className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label={accountAria}
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Recent searches (from localStorage; updated when user searches) */}
        {recentKeywords.length > 0 ? (
          <div className="mx-auto max-w-7xl px-4 pb-2 hidden md:flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span className="font-medium">{t("recentSearches")}</span>
            {recentKeywords.map((k) => (
              <Link
                key={k}
                href={`/search?q=${encodeURIComponent(k)}`}
                className="hover:text-primary transition-colors"
              >
                {k}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="hidden md:block border-b border-border">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.labelKey}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link
              href="/category/smartphone"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Flame className="h-3.5 w-3.5 text-red-500 shrink-0" />
              {t("hotDeals")}
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Truck className="h-3.5 w-3.5 shrink-0" />
              {t("trackOrder")}
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {t("storeLocator")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-card">
          <div className="px-4 py-3">
            <form
              className="relative mb-3"
              onSubmit={(e) => {
                e.preventDefault();
                runSearch();
              }}
            >
              <input
                type="search"
                name="q"
                placeholder={t("mobileSearchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pe-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute end-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-primary"
                aria-label={t("searchAria")}
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm font-medium text-foreground hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link
                href={accountHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 border-t border-border py-3 text-sm font-medium text-foreground hover:text-primary"
              >
                <User className="h-4 w-4 shrink-0" aria-hidden />
                {token ? t("adminProfile") : t("adminLogin")}
              </Link>
              <div className="border-t border-border pt-2 mt-1">
                <p className="text-xs text-muted-foreground mb-2">{t("categories")}</p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
