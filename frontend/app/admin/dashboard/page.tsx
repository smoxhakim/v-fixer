"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
    toast.message("Session cleared locally.");
    void load();
  };

  if (!hydrated || state.status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    );
  }

  if (state.status === "fatal") {
    return (
      <AdminErrorState message={state.message} onRetry={() => void load()} />
    );
  }

  const { products, categories, orders, ordersNeedAuth, productError, categoryError, orderError } =
    state;

  const revenue = totalRevenue(orders);
  const pending = pendingOrdersCount(orders);
  const low = lowStockProducts(products);
  const recent = [...orders]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Store overview"
        description="High-level metrics and shortcuts. Stats are computed from list endpoints until a dedicated analytics API exists."
        actions={
          <div className="flex flex-wrap gap-2">
            {token ? (
              <Button type="button" variant="outline" size="sm" onClick={onLogout}>
                Clear local session
              </Button>
            ) : null}
            <Button asChild size="sm">
              <Link href="/admin/dashboard/products">Add product</Link>
            </Button>
          </div>
        }
      />

      {!token ? <AdminAuthBanner variant="read" /> : null}
      {ordersNeedAuth ? <AdminAuthBanner variant="write" /> : null}

      {(productError || categoryError || orderError) && (
        <div className="grid gap-3 md:grid-cols-3">
          {productError ? (
            <AdminErrorState title="Products" message={productError} onRetry={() => void load()} />
          ) : null}
          {categoryError ? (
            <AdminErrorState
              title="Categories"
              message={categoryError}
              onRetry={() => void load()}
            />
          ) : null}
          {orderError ? (
            <AdminErrorState title="Orders" message={orderError} onRetry={() => void load()} />
          ) : null}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total products" value={products.length} icon={Package} />
        <StatCard title="Total categories" value={categories.length} icon={FolderTree} />
        <StatCard title="Total orders" value={orders.length} icon={ShoppingCart} />
        <StatCard
          title="Total revenue"
          value={formatCurrency(revenue)}
          subtitle="Sum of order totals in view"
          icon={Wallet}
        />
        <StatCard
          title="Pending orders"
          value={pending}
          subtitle="Status = Pending"
          icon={ShoppingCart}
        />
        <StatCard
          title="Low stock SKUs"
          value={low.length}
          subtitle={`Stock ≤ ${LOW_STOCK_THRESHOLD}`}
          icon={Package}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump to management workspaces.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <Button asChild variant="secondary" className="justify-between">
              <Link href="/admin/dashboard/products">
                Add product
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-between">
              <Link href="/admin/dashboard/categories">
                Add category
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-between">
              <Link href="/admin/dashboard/orders">
                View orders
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-between">
              <Link href="/">
                View storefront
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Newest first (max 6).</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/dashboard/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ordersNeedAuth && orders.length === 0 ? (
              <AdminEmptyState
                title="Orders hidden without admin token"
                description="Sign in via /admin/login to store a JWT, or wait until public read APIs are added."
              />
            ) : recent.length === 0 ? (
              <AdminEmptyState
                title="No orders yet"
                description="When customers check out, they will appear here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.orderNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{o.name}</span>
                          {o.email ? (
                            <span className="text-xs">{o.email}</span>
                          ) : null}
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
