"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

/** Matches admin dashboard `pb-[calc(4.75rem+env(safe-area-inset-bottom))]` / {@link ADMIN_MOBILE_BOTTOM_NAV_OFFSET}. */
const ADMIN_NAV_OVERLAY_BOTTOM =
  "max-md:left-0 max-md:right-0 max-md:top-0 max-md:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]" as const;

type AdminBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Extra classes on the bottom sheet panel */
  className?: string;
};

/**
 * Mobile-oriented bottom sheet: Radix Sheet with `side="bottom"`, max height, rounded top, drag handle.
 * On viewports below `md`, sits above {@link AdminMobileBottomNav} so the tab bar stays visible and tappable.
 */
export function AdminBottomSheet({
  open,
  onOpenChange,
  children,
  className,
}: AdminBottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        overlayClassName={ADMIN_NAV_OVERLAY_BOTTOM}
        className={cn(
          "gap-0 rounded-t-2xl border-t p-0 pb-[max(1rem,env(safe-area-inset-bottom))]",
          "flex max-h-[88vh] flex-col overflow-hidden",
          "max-md:bottom-[calc(4.75rem+env(safe-area-inset-bottom))]",
          "max-md:max-h-[calc(100dvh-4.75rem-env(safe-area-inset-bottom)-2rem)]",
          className,
        )}
      >
        <div
          className="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-muted"
          aria-hidden
        />
        {children}
      </SheetContent>
    </Sheet>
  );
}
