"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { useAdminToken } from "@/hooks/use-admin-token";

export default function AdminPage() {
  const t = useTranslations("AdminLogin");
  const router = useRouter();
  const { token, hydrated } = useAdminToken();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? "/admin/dashboard" : "/admin/login");
  }, [hydrated, token, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-hidden />
      <span className="text-sm">{t("loading")}</span>
    </div>
  );
}
