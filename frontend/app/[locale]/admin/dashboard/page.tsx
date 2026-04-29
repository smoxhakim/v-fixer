"use client";

import { useCallback, useEffect, useState } from "react";
import { Link as LocaleLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  FolderTree,
  Loader2,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminToken } from "@/hooks/use-admin-token";
import {
  adminListCategories,
  adminListOrders,
  adminListProducts,
} from "@/lib/admin-queries";
import {
  LOW_STOCK_THRESHOLD,
  lowStockProducts,
  parseMoney,
  pendingOrdersCount,
  totalRevenue,
} from "@/lib/admin-stats";
import type { AdminCategory, AdminOrder, AdminProduct } from "@/lib/admin-types";
import { formatCurrency } from "@/lib/format";

type LoadState =
  | { status: "loading" }
  | {
      status: "ready";
      products: AdminProduct[];
      categories: AdminCategory[];
      orders: AdminOrder[];
      ordersNeedAuth: boolean;
      productError?: string;
      categoryError?: string;
      orderError?: string;
    }
  | { status: "fatal"; message: string };

export default function AdminDashboardOverviewPage() {
  const t = useTranslations("AdminDashboard");
  const tSidebar = useTranslations("AdminSidebar");
  const { token, hydrated, clearToken } = useAdminToken();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    const [pr, cr, or] = await Promise.all([
      adminListProducts(),
      adminListCategories(),
      adminListOrders(token),
    ]);

    if (!pr.ok && !cr.ok) {
      setState({
        status: "fatal",
        message: `${pr.error} ${cr.error}`.trim(),
      });
      return;
    }

    setState({
      status: "ready",
      products: pr.ok ? pr.data : [],
      categories: cr.ok ? cr.data : [],
      orders: or.ok ? or.data : [],
      ordersNeedAuth: Boolean(or.ok && or.needsAuth),
      productError: pr.ok ? undefined : pr.error,
      categoryError: cr.ok ? undefined : cr.error,
      orderError: or.ok ? undefined : or.error,
    });
  }, [token]);

  useEffect(() => {
    if (!hydrated) return;
    void load();
  }, [hydrated, load]);

  const onLogout = () => {
    clearToken();
    toast.message(t("sessionCleared"));
    void load();
  };

  if (!hydrated || state.status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">{t("loading")}</span>
      </div>
    );
  }

  if (state.status === "fatal") {
    return <AdminErrorState message={state.message} onRetry={() => void load()} />;
  }

  const { products, categories, orders, ordersNeedAuth, productError, categoryError, orderError } =
    state;

  const revenue = totalRevenue(orders);
  const pending = pendingOrdersCount(orders);
  const low = lowStockProducts(products);
  const recent = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex flex-wrap gap-2">
            {token ? (
              <Button type="button" variant="outline" size="sm" onClick={onLogout}>
                {t("clearSession")}
              </Button>
            ) : null}
            <Button asChild size="sm">
              <LocaleLink href="/admin/dashboard/products">{t("addProduct")}</LocaleLink>
            </Button>
          </div>
        }
      />

      {!token ? <AdminAuthBanner variant="read" /> : null}
      {ordersNeedAuth ? <AdminAuthBanner variant="write" /> : null}

      {(productError || categoryError || orderError) && (
        <div className="grid gap-3 md:grid-cols-3">
          {productError ? (
            <AdminErrorState
              title={tSidebar("products")}
              message={productError}
              onRetry={() => void load()}
            />
          ) : null}
          {categoryError ? (
            <AdminErrorState
              title={tSidebar("categories")}
              message={categoryError}
              onRetry={() => void load()}
            />
          ) : null}
          {orderError ? (
            <AdminErrorState
              title={tSidebar("orders")}
              message={orderError}
              onRetry={() => void load()}
            />
          ) : null}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title={t("statProducts")} value={products.length} icon={Package} />
        <StatCard title={t("statCategories")} value={categories.length} icon={FolderTree} />
        <StatCard title={t("statOrders")} value={orders.length} icon={ShoppingCart} />
        <StatCard
          title={t("statRevenue")}
          value={formatCurrency(revenue)}
          subtitle={t("statRevenueHint")}
          icon={Wallet}
        />
        <StatCard
          title={t("statPending")}
          value={pending}
          subtitle={t("statPendingHint")}
          icon={ShoppingCart}
        />
        <StatCard
          title={t("statLowStock")}
          value={low.length}
          subtitle={t("statLowStockHint", { threshold: LOW_STOCK_THRESHOLD })}
          icon={Package}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("quickActions")}</CardTitle>
            <CardDescription>{t("quickActionsHint")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="secondary" className="justify-between">
              <LocaleLink href="/admin/dashboard/products">
                {t("addProduct")}
                <ArrowRight className="size-4" aria-hidden />
              </LocaleLink>
            </Button>
            <Button asChild variant="secondary" className="justify-between">
              <LocaleLink href="/admin/dashboard/categories">
                {t("addCategory")}
                <ArrowRight className="size-4" aria-hidden />
              </LocaleLink>
            </Button>
            <Button asChild variant="secondary" className="justify-between">
              <LocaleLink href="/admin/dashboard/orders">
                {t("viewOrders")}
                <ArrowRight className="size-4" aria-hidden />
              </LocaleLink>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <LocaleLink href="/">
                {t("viewStorefront")}
                <ArrowRight className="size-4" aria-hidden />
              </LocaleLink>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{t("recentOrders")}</CardTitle>
              <CardDescription>{t("recentOrdersHint")}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <LocaleLink href="/admin/dashboard/orders">{t("viewAll")}</LocaleLink>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersNeedAuth && orders.length === 0 ? (
              <AdminEmptyState title={t("ordersHiddenTitle")} description={t("ordersHiddenDesc")} />
            ) : recent.length === 0 ? (
              <AdminEmptyState title={t("noOrdersTitle")} description={t("noOrdersDesc")} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("orderCol")}</TableHead>
                    <TableHead>{t("customerCol")}</TableHead>
                    <TableHead className="text-right">{t("totalCol")}</TableHead>
                    <TableHead>{t("statusCol")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.orderNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{o.name}</span>
                          {o.email ? <span className="text-xs">{o.email}</span> : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(parseMoney(o.total))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{o.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
