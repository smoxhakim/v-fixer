"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AdminAuthBannerProps {
  variant: "read" | "write";
}

export function AdminAuthBanner({ variant }: AdminAuthBannerProps) {
  const t = useTranslations("AdminAuthBanner");
  const write = variant === "write";
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <Info className="text-primary" aria-hidden />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{write ? t("descriptionWrite") : t("descriptionRead")}</span>
        <Button asChild variant="secondary" size="sm" className="shrink-0">
          <Link href="/admin/login">{t("previewLogin")}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
