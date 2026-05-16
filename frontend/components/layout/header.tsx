"use client";

import { Link as IntlLink, useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Flame,
  Truck,
  MapPin,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupPrefix,
  InputGroupInput,
} from "@heroui/react";

import { useCart } from "@/context/cart-context";
import { useAdminToken } from "@/hooks/use-admin-token";
import { getCategories } from "@/lib/api";
import {
  readRecentSearchKeywords,
  rememberSearchKeyword,
  subscribeRecentSearchKeywords,
} from "@/lib/recent-search-keywords";
import { HOT_DEALS_PAGE_PATH } from "@/lib/hot-deals-constants";
import { ThemeToggle } from "@/components/theme-toggle";

const STORE_MAP_URL = "https://maps.app.goo.gl/uzBi3A9kpstfvjSG8";

export function Header() {
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { itemCount } = useCart();
  const { token, hydrated } = useAdminToken();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);

  const navLinks = [
    { labelKey: "navHome" as const, href: "/" },
    { labelKey: "navCollections" as const, href: "/categories" },
    { labelKey: "navProducts" as const, href: "/products" },
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

  const runSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setRecentKeywords(rememberSearchKeyword(q));
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  const otherLocale = locale === "fr" ? "ar" : "fr";
  const switchLocaleHard = () => {
    const suffix = pathname === "/" ? "" : pathname;
    const qs = typeof window !== "undefined" ? window.location.search : "";
    window.location.assign(`/${otherLocale}${suffix}${qs}`);
  };

  const showAdminProfile = hydrated && Boolean(token);

  return (
    <header className="sticky top-0 z-50 bg-card/85 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 h-[4.5rem] flex items-center gap-3 md:gap-4">
        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={t("toggleMenu")}
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={2.2} />
          ) : (
            <MenuIcon className="h-5 w-5" strokeWidth={2.2} />
          )}
        </button>

        {/* Logo */}
        <IntlLink href="/" className="flex items-center shrink-0">
          <span className="text-2xl font-black tracking-tight text-foreground">
            <span className="text-warning">V-</span>fixer
          </span>
        </IntlLink>

        {/* Search bar — desktop */}
        <form
          className="hidden md:block flex-1 max-w-xl mx-2"
          onSubmit={runSearch}
        >
          <InputGroup className="bg-background border border-border rounded-lg has-[input:focus]:border-warning has-[input:focus]:ring-1 has-[input:focus]:ring-warning transition-colors [&_svg]:text-muted-foreground">
            <InputGroupPrefix className="ps-3">
              <Search className="h-4 w-4" strokeWidth={2.2} />
            </InputGroupPrefix>
            <InputGroupInput
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchAria")}
              autoComplete="off"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </InputGroup>
        </form>

        {/* Right cluster */}
        <div className="ms-auto flex items-center gap-1 md:gap-2">
          {/* Categories mega-menu */}
          <div className="hidden lg:flex">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="ghost"
                  className="rounded-md h-9 px-3 text-sm text-foreground hover:bg-secondary"
                >
                  {t("categories")}
                </Button>
              </DropdownTrigger>
              <DropdownPopover className="bg-card border border-border rounded-lg p-1 shadow-xl min-w-[14rem]">
                <DropdownMenu
                  aria-label={t("categories")}
                  onAction={(key) => router.push(`/category/${String(key)}`)}
                >
                  {categories.slice(0, 12).map((cat) => (
                    <DropdownItem
                      key={cat.slug}
                      id={cat.slug}
                      className="px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-secondary data-[focused=true]:bg-secondary data-[focus-visible=true]:bg-secondary outline-none"
                    >
                      {cat.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </DropdownPopover>
            </Dropdown>
          </div>

          {/* Locale */}
          <Button
            variant="bordered"
            onPress={switchLocaleHard}
            aria-label={locale === "fr" ? t("switchToAr") : t("switchToFr")}
            className="h-8 px-2 text-xs rounded-md border border-border text-foreground hover:bg-secondary min-w-[44px]"
          >
            {locale === "fr" ? t("switchToAr") : t("switchToFr")}
          </Button>

          {/* Theme toggle */}
          <ThemeToggle ariaLabel="Toggle theme" />

          {/* Wishlist */}
          <button
            type="button"
            aria-label={t("wishlistAria")}
            onClick={() => router.push("/")}
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-warning hover:text-warning-foreground"
          >
            <Heart className="h-5 w-5" strokeWidth={2.2} />
          </button>

          {/* Cart with badge */}
          <div className="relative inline-flex">
            <button
              type="button"
              aria-label={t("cartAria")}
              onClick={() => router.push("/cart")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-warning text-warning-foreground transition-opacity hover:opacity-90"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2.2} />
            </button>
            {itemCount > 0 ? (
              <span
                aria-label={`${itemCount}`}
                className="pointer-events-none absolute -top-1 -end-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold"
              >
                {itemCount}
              </span>
            ) : null}
          </div>

          {/* Admin */}
          {showAdminProfile ? (
            <button
              type="button"
              aria-label={t("adminProfileAria")}
              onClick={() => router.push("/admin/dashboard/settings/profile")}
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-warning hover:text-warning-foreground"
            >
              <User className="h-5 w-5" strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Secondary nav (desktop) */}
      <nav className="hidden md:block border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 py-3">
            {navLinks.map((link) => (
              <IntlLink
                key={link.labelKey}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-warning transition-colors"
              >
                {t(link.labelKey)}
              </IntlLink>
            ))}
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <IntlLink
              href={HOT_DEALS_PAGE_PATH}
              className="flex items-center gap-1 hover:text-warning transition-colors"
            >
              <Flame className="h-3.5 w-3.5 text-destructive shrink-0" />
              {t("hotDeals")}
            </IntlLink>
            <IntlLink
              href="#"
              className="flex items-center gap-1 hover:text-warning transition-colors"
            >
              <Truck className="h-3.5 w-3.5 shrink-0" />
              {t("trackOrder")}
            </IntlLink>
            <a
              href={STORE_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-warning transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t("storeLocator")}
            </a>
          </div>
        </div>
      </nav>

      {/* Recent searches */}
      {recentKeywords.length > 0 ? (
        <div className="hidden md:block bg-card border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 text-warning shrink-0" />
            <span className="font-medium">{t("recentSearches")}</span>
            {recentKeywords.map((k) => (
              <IntlLink
                key={k}
                href={`/search?q=${encodeURIComponent(k)}`}
                className="hover:text-warning transition-colors"
              >
                {k}
              </IntlLink>
            ))}
          </div>
        </div>
      ) : null}

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={runSearch}>
              <InputGroup className="bg-background border border-border rounded-lg has-[input:focus]:border-warning [&_svg]:text-muted-foreground">
                <InputGroupPrefix className="ps-3">
                  <Search className="h-4 w-4" strokeWidth={2.2} />
                </InputGroupPrefix>
                <InputGroupInput
                  type="search"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("mobileSearchPlaceholder")}
                  aria-label={t("searchAria")}
                  autoComplete="off"
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </InputGroup>
            </form>

            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <IntlLink
                  key={link.labelKey}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm font-medium text-foreground hover:text-warning"
                >
                  {t(link.labelKey)}
                </IntlLink>
              ))}

              {hydrated && token ? (
                <IntlLink
                  href="/admin/dashboard/settings/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 border-t border-border py-3 text-sm font-medium text-foreground hover:text-warning"
                >
                  <User className="h-4 w-4 shrink-0" aria-hidden />
                  {t("adminProfile")}
                </IntlLink>
              ) : hydrated ? (
                <IntlLink
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 border-t border-border py-3 text-sm font-medium text-foreground hover:text-warning"
                >
                  <User className="h-4 w-4 shrink-0" aria-hidden />
                  {t("adminLogin")}
                </IntlLink>
              ) : null}

              <div className="border-t border-border pt-3 mt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("categories")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <IntlLink
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-warning hover:text-warning-foreground transition-colors"
                    >
                      {cat.name}
                    </IntlLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
