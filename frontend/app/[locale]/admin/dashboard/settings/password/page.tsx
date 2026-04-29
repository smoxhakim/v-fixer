"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminToken } from "@/hooks/use-admin-token";
import { changeAdminPassword } from "@/lib/api";

export default function AdminChangePasswordPage() {
  const t = useTranslations("AdminSettingsPassword");
  const { token } = useAdminToken();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("toastNotSignedIn"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("toastTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("toastMismatch"));
      return;
    }
    setSaving(true);
    try {
      await changeAdminPassword({ currentPassword, newPassword }, token);
      toast.success(t("toastSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toastFailed");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="-mt-2 gap-2" asChild>
        <Link href="/admin/dashboard/settings/profile">
          <ArrowLeft className="size-4" />
          {t("backProfile")}
        </Link>
      </Button>

      <AdminPageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{t("cardTitle")}</CardTitle>
          <CardDescription>{t("cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cur-pw">{t("currentLabel")}</Label>
              <Input
                id="cur-pw"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">{t("newLabel")}</Label>
              <Input
                id="new-pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("minHint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf-pw">{t("confirmLabel")}</Label>
              <Input
                id="conf-pw"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving || !token}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("saving")}
                </>
              ) : (
                t("submitButton")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
