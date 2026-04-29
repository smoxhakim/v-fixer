"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AdminProduct } from "@/lib/admin-types";
import { formatCurrency } from "@/lib/format";
import { parseMoney } from "@/lib/admin-stats";

export type MobileProductCardProps = {
  product: AdminProduct;
  onOpen: () => void;
};

export function MobileProductCard({ product, onOpen }: MobileProductCardProps) {
  const stock = Number(product.stock ?? 0);
  const out = stock === 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full rounded-xl border border-border bg-card p-3 text-start shadow-sm transition-colors",
        "active:scale-[0.99] hover:bg-muted/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-sm font-medium text-foreground">
          {product.name}
        </span>
        <Badge
          variant="outline"
          className="shrink-0 text-[10px]"
          title="No status field on API model yet"
        >
          Active
        </Badge>
      </div>
      <p className="mt-1 truncate text-[10px] text-muted-foreground">{product.slug}</p>
      <div className="mt-2 flex gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Category
          </span>
          <span className="truncate text-xs font-medium text-foreground">
            {product.categorySlug ?? "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Price
          </span>
          <span className="text-xs font-medium tabular-nums text-foreground">
            {formatCurrency(parseMoney(product.price))}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Stock
          </span>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              out ? "text-destructive" : "text-foreground",
            )}
          >
            {stock}
          </span>
        </div>
      </div>
    </button>
  );
}
