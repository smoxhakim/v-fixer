"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AdminAuthBanner } from "@/components/admin/admin-auth-banner";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminToken } from "@/hooks/use-admin-token";
import {
  adminListOrders,
  adminListProducts,
} from "@/lib/admin-queries";
import { parseMoney } from "@/lib/admin-stats";
import type { AdminOrder, AdminProduct } from "@/lib/admin-types";
import { patchOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const ORDER_STATUSES = [
  "Pending",
  "Contacted",
  "Fulfilled",
  "Cancelled",
] as const;

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function orderDateKey(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function AdminOrdersPage() {
  const { token, hydrated } = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [active, setActive] = useState<AdminOrder | null>(null);
  const [detailStatus, setDetailStatus] = useState("");
  const [detailNotes, setDetailNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [or, pr] = await Promise.all([
      adminListOrders(token),
      adminListProducts(),
    ]);
    if (!or.ok) setError(or.error);
    setOrders(or.ok ? or.data : []);
    setNeedsAuth(Boolean(or.ok && or.needsAuth));
    setProducts(pr.ok ? pr.data : []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const productNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of products) m.set(Number(p.id), p.name);
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (dateFrom && orderDateKey(o.date) < dateFrom) return false;
      if (dateTo && orderDateKey(o.date) > dateTo) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const blob = [
          o.orderNumber,
          o.name,
          o.email ?? "",
          o.phone,
          o.id,
        ]
          .join(" ")
          .toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFrom, dateTo, search]);

  const openDetail = (o: AdminOrder) => {
    setActive(o);
    setDetailStatus(o.status);
    setDetailNotes(o.notes ?? "");
  };

  const saveDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !token) return;
    setSaving(true);
    try {
      await patchOrder(
        active.id,
        { status: detailStatus, notes: detailNotes || null },
        token,
      );
      toast.success("Order saved");
      setActive(null);
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update order (see backend notes).",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <span className="text-sm">Loading orders…</span>
      </div>
    );
  }

  if (error && orders.length === 0 && !needsAuth) {
    return <AdminErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Orders"
        description="Filters run in the browser on the current page of results. Server-side filtering can replace this once query params exist on the API."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        }
      />

      {!token || needsAuth ? <AdminAuthBanner variant="write" /> : null}
      {error ? (
        <AdminErrorState message={error} onRetry={() => void load()} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Client-side filters on the loaded list. The API has no payment field yet — the table shows “—” for payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ord-search">Search</Label>
            <Input
              id="ord-search"
              placeholder="Order #, name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Order status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="df">From date</Label>
            <Input
              id="df"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dt">To date</Label>
            <Input
              id="dt"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {filtered.length} order{filtered.length === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>Click a row to inspect and update.</CardDescription>
        </CardHeader>
        <CardContent>
          {needsAuth && orders.length === 0 ? (
            <AdminEmptyState
              title="Orders require an admin token"
              description="Use /admin/login to obtain a JWT, then return here."
            />
          ) : filtered.length === 0 ? (
            <AdminEmptyState
              title="No orders match"
              description="Adjust filters or wait for new checkouts."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openDetail(o)}
                  >
                    <TableCell className="font-medium">{o.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{o.name}</span>
                        {o.email ? (
                          <span className="text-xs text-muted-foreground">{o.email}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(parseMoney(o.total))}
                    </TableCell>
                    <TableCell className="text-muted-foreground" title="Not in API">
                      —
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(o.date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Order detail</SheetTitle>
            <SheetDescription>
              Line items show product ids until the API embeds product snapshots.
            </SheetDescription>
          </SheetHeader>
          {active ? (
            <form className="flex flex-1 flex-col gap-4 py-2" onSubmit={saveDetail}>
              <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Order</span>
                  <span className="font-medium">{active.orderNumber}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Placed</span>
                  <span>{formatDateTime(active.date)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="text-right">{active.name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{active.phone}</span>
                </div>
                {active.email ? (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="break-all text-right">{active.email}</span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Ship to</span>
                  <span className="max-w-[220px] text-right">
                    {active.address}, {active.city}{" "}
                    {active.postalCode ?? ""}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {active.items?.length ? (
                      active.items.map((it, idx) => (
                        <TableRow key={`${active.id}-${idx}`}>
                          <TableCell>
                            {productNameById.get(Number(it.productId)) ?? (
                              <span className="text-muted-foreground">
                                ID {it.productId}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{it.quantity}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(parseMoney(it.price))}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground">
                          No line items
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(parseMoney(active.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(parseMoney(active.total))}
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ord-status">Order status</Label>
                <Select value={detailStatus} onValueChange={setDetailStatus}>
                  <SelectTrigger id="ord-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Serializer currently marks <code className="text-[10px]">status</code>{" "}
                  read-only — if saves fail, backend must allow updates.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ord-notes">Notes</Label>
                <Textarea
                  id="ord-notes"
                  rows={4}
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  placeholder="Customer notes and internal context share this field today."
                />
              </div>

              <SheetFooter className="mt-auto flex-row gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setActive(null)}>
                  Close
                </Button>
                <Button type="submit" disabled={!token || saving}>
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </SheetFooter>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
