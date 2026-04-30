"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAdminToken } from "@/hooks/use-admin-token";

export function FooterAdminAuth() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const { token, clearToken, hydrated } = useAdminToken();

  if (!hydrated) {
    return <div className="h-10" aria-hidden />;
  }

  if (token) {
    return (
      <button
        type="button"
        onClick={() => {
          clearToken();
          window.location.assign(`/${locale}/admin/login`);
        }}
        className="text-sm opacity-70 hover:opacity-100 transition-opacity underline-offset-4 hover:underline"
      >
        {t("adminLogoutLink")}
      </button>
    );
  }

  return (
    <Link
      href="/admin/login"
      className="text-sm opacity-70 hover:opacity-100 transition-opacity underline-offset-4 hover:underline"
    >
      {t("adminLoginLink")}
    </Link>
  );
}
