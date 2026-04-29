"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { login } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAdminToken } from "@/hooks/use-admin-token";

export default function AdminLogin() {
  const t = useTranslations("AdminLogin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token, setToken, hydrated } = useAdminToken();

  useEffect(() => {
    if (!hydrated) return;
    if (token) {
      router.replace("/admin/dashboard");
    }
  }, [hydrated, token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ username, password });
      setToken(data.access);
      toast.success(t("successToast"));
      router.push("/admin/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("invalidCredentials");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || token) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{t("subtitle")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("signingIn") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
