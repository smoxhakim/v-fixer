"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Admin shell: no top nav on dashboard (navigation lives in {@link AdminSidebar}).
 * Login route keeps a thin bar with brand + link back to the storefront.
 */
export function AdminLayoutChrome({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AdminLayout");
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      {isLogin ? (
        <header className="border-b border-border bg-card shadow-sm">
          <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">{t("brand")}</span>
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {t("viewStore")}
            </Link>
          </div>
        </header>
      ) : null}
      <main className="mx-auto w-full max-w-none flex-1 p-4 py-6 md:px-6 lg:px-8">{children}</main>
    </div>
  );
}
