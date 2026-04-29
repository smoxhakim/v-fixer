"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { useAdminToken } from "@/hooks/use-admin-token";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AdminLayout");
  const { token, hydrated } = useAdminToken();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/admin/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">{t("checkingSession")}</span>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">{t("redirectSignIn")}</span>
      </div>
    );
  }

  return <>{children}</>;
}
