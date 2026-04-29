"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AdminCategory } from "@/lib/admin-types";

export type CategorySelectorProps = {
  categories: AdminCategory[];
  /** Selected category id, or `null` for “no category”. */
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  /** Scrollable list max height */
  listClassName?: string;
};

/**
 * Scrollable list of categories + optional “no category” row.
 * Presentational only; parent owns persistence.
 */
export function CategorySelector({
  categories,
  selectedId,
  onSelect,
  listClassName,
}: CategorySelectorProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border",
        listClassName,
      )}
    >
      <p className="shrink-0 px-4 pb-2 pt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Category
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3.5 text-start text-sm font-medium transition-colors",
          selectedId === null
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "hover:bg-muted",
        )}
      >
        <span>No category</span>
        {selectedId === null ? (
          <Check className="size-4 shrink-0" aria-hidden />
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}
      </button>
      {categories.map((c) => {
        const selected = selectedId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "flex w-full items-center justify-between px-4 py-3.5 text-start text-sm font-medium transition-colors",
              selected
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-muted",
            )}
          >
            <span className="truncate">{c.name}</span>
            {selected ? (
              <Check className="size-4 shrink-0" aria-hidden />
            ) : (
              <span className="size-4 shrink-0" aria-hidden />
            )}
          </button>
        );
      })}
      </div>
    </div>
  );
}
