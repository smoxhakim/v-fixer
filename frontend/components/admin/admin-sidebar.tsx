"use client";

import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  FileUp,
  LayoutTemplate,
  TrendingUp,
  Flame,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Space reserved for {@link AdminMobileBottomNav} on small screens. Keep in sync with
 * `pb-[calc(4.75rem+env(safe-area-inset-bottom))]` on the admin dashboard layout main column.
 */
export const ADMIN_MOBILE_BOTTOM_NAV_OFFSET =
  "calc(4.75rem+env(safe-area-inset-bottom))" as const;

export const adminNavLinks = [
  { href: "/admin/dashboard", labelKey: "overview" as const, icon: LayoutDashboard },
  { href: "/admin/dashboard/products", labelKey: "products" as const, icon: Package },
  { href: "/admin/dashboard/home-hero", labelKey: "homeHero" as const, icon: LayoutTemplate },
  { href: "/admin/dashboard/best-selling", labelKey: "bestSelling" as const, icon: TrendingUp },
  { href: "/admin/dashboard/hot-deals", labelKey: "hotDeals" as const, icon: Flame },
  { href: "/admin/dashboard/categories", labelKey: "categories" as const, icon: FolderTree },
  { href: "/admin/dashboard/orders", labelKey: "orders" as const, icon: ShoppingCart },
  { href: "/admin/dashboard/import", labelKey: "import" as const, icon: FileUp },
  { href: "/admin/dashboard/settings/profile", labelKey: "profile" as const, icon: User },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/admin/dashboard") return false;
  if (pathname.startsWith(href)) return true;
  if (
    href === "/admin/dashboard/settings/profile" &&
    pathname.startsWith("/admin/dashboard/settings/")
  ) {
    return true;
  }
  return false;
}

/** Left column navigation — desktop only (`md+`). */
export function AdminSidebar() {
  const t = useTranslations("AdminSidebar");
  const tLayout = useTranslations("AdminLayout");
  const pathname = usePathname();

  return (
    <aside className="sticky top-6 z-30 hidden w-56 shrink-0 self-start md:flex md:flex-col lg:w-60">
      <div className="flex min-h-0 flex-1 flex-col border-border md:border-e md:pe-3">
        <div className="mb-2">
          <Link
            href="/admin/dashboard"
            className="block min-w-0 truncate rounded-lg px-3 py-2 text-lg font-bold leading-tight tracking-tight text-foreground transition-colors hover:bg-muted"
            title={tLayout("brand")}
          >
            {tLayout("brand")}
          </Link>
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]"
          aria-label={t("navAria")}
        >
          {adminNavLinks.map(({ href, labelKey, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{t(labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/**
 * Mobile: fixed bottom bar, horizontal scroll + snap (see docs/vfixer_scrollable_bottom_nav.html).
 * Desktop: not rendered.
 */
export function AdminMobileBottomNav() {
  const t = useTranslations("AdminSidebar");
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = scrollRef.current;
    if (!wrap) return;
    const active = wrap.querySelector<HTMLElement>("[data-admin-nav-active]");
    active?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [pathname]);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md md:hidden",
        "pb-[max(0.25rem,env(safe-area-inset-bottom))]",
      )}
      aria-label={t("navAria")}
    >
      <div className="relative">
        <div
          ref={scrollRef}
          className={cn(
            "flex overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch]",
            "snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "px-1 pt-0.5",
          )}
        >
          {adminNavLinks.map(({ href, labelKey, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                data-admin-nav-active={active ? "" : undefined}
                className={cn(
                  "relative flex min-w-[56px] shrink-0 snap-start flex-col items-center gap-0.5 px-2.5 pb-2 pt-2",
                  "text-muted-foreground transition-colors",
                  active && "text-primary",
                )}
              >
                <Icon
                  className={cn("size-5 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                  aria-hidden
                />
                <span
                  className={cn(
                    "max-w-[72px] truncate text-center text-[10px] font-medium leading-tight",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {t(labelKey)}
                </span>
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent"
          aria-hidden
        />
      </div>
    </nav>
  );
}
