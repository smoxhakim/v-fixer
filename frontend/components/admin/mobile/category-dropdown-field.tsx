"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AdminCategory } from "@/lib/admin-types";

const NONE_VALUE = "__none__";

export type CategoryDropdownFieldProps = {
  categories: AdminCategory[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  disabled?: boolean;
  id?: string;
};

function labelFor(categories: AdminCategory[], selectedId: number | null): string {
  if (selectedId === null) return "No category";
  const c = categories.find((x) => x.id === selectedId);
  return c?.name ?? "No category";
}

/**
 * Compact category picker (dropdown) for tight layouts such as a bottom sheet.
 */
export function CategoryDropdownField({
  categories,
  selectedId,
  onSelect,
  disabled,
  id,
}: CategoryDropdownFieldProps) {
  const value = selectedId === null ? NONE_VALUE : String(selectedId);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          id={id}
          className={cn(
            "h-11 w-full justify-between gap-2 px-3 font-normal",
            !selectedId && "text-muted-foreground",
          )}
          aria-label="Category"
        >
          <span className="min-w-0 truncate text-left">{labelFor(categories, selectedId)}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={4}
        className={cn(
          "z-[100] flex max-h-[min(50vh,280px)] w-[var(--radix-dropdown-menu-trigger-width)] flex-col overflow-hidden p-0",
        )}
      >
        <DropdownMenuLabel className="shrink-0 border-b px-2 py-1.5 text-xs font-normal text-muted-foreground">
          Category
        </DropdownMenuLabel>
        <div
          className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-1 py-1 [-webkit-overflow-scrolling:touch]"
          onWheel={(e) => e.stopPropagation()}
        >
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(v) => {
              onSelect(v === NONE_VALUE ? null : Number(v));
            }}
          >
            <DropdownMenuRadioItem value={NONE_VALUE} className="min-h-10">
              No category
            </DropdownMenuRadioItem>
            {categories.map((c) => (
              <DropdownMenuRadioItem key={c.id} value={String(c.id)} className="min-h-10">
                <span className="truncate">{c.name}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
