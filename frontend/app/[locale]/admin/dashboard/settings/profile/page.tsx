"use client";

import { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, LogOut, Store } from "lucide-react";
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
import {
  getAdminProfile,
  isAdminSessionExpiredErrorMessage,
  patchAdminProfile,
} from "@/lib/api";

export default function AdminProfilePage() {
  const t = useTranslations("AdminProfile");
  const router = useRouter();
  const { token, clearToken } = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const p = await getAdminProfile(token);
      setUsername(p.username);
      setFirstName(p.firstName ?? "");
      setLastName(p.lastName ?? "");
      setEmail(p.email ?? "");
    } catch (e) {
      const message = e instanceof Error ? e.message : t("toastLoadFailed");
      toast.error(message);
      if (isAdminSessionExpiredErrorMessage(message)) clearToken();
    } finally {
      setLoading(false);
    }
  }, [token, clearToken, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("toastNotSignedIn"));
      return;
    }
    setSaving(true);
    try {
      const p = await patchAdminProfile(
        { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() },
        token,
      );
      setUsername(p.username);
      setFirstName(p.firstName ?? "");
      setLastName(p.lastName ?? "");
      setEmail(p.email ?? "");
      toast.success(t("toastSaved"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("toastSaveFailed");
      toast.error(message);
      if (isAdminSessionExpiredErrorMessage(message)) clearToken();
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    clearToken();
    router.push("/admin/login");
    router.refresh();
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title={t("pageTitle")} description={t("toastNotSignedIn")} />
        <Button asChild variant="outline">
          <Link href="/admin/login">{t("backDashboard")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="-mt-2 gap-2" asChild>
        <Link href="/admin/dashboard">
          <ArrowLeft className="size-4" />
          {t("backDashboard")}
        </Link>
      </Button>

      <AdminPageHeader title={t("pageTitle")} description={t("pageDescription")} />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="max-w-xl lg:max-w-none">
            <CardHeader>
              <CardTitle>{t("accountCardTitle")}</CardTitle>
              <CardDescription>{t("accountCardDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-username">{t("usernameLabel")}</Label>
                  <Input id="prof-username" value={username} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-first">{t("firstNameLabel")}</Label>
                  <Input
                    id="prof-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-last">{t("lastNameLabel")}</Label>
                  <Input
                    id="prof-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-email">{t("emailLabel")}</Label>
                  <Input
                    id="prof-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      {t("saving")}
                    </>
                  ) : (
                    t("saveProfile")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="max-w-xl lg:max-w-none">
            <CardHeader>
              <CardTitle>{t("securityCardTitle")}</CardTitle>
              <CardDescription>{t("securityCardDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href="/admin/dashboard/settings/password">
                  {t("changePassword")}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" aria-hidden />
                {t("signOut")}
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/">
                  <Store className="size-4" aria-hidden />
                  {t("viewStore")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
