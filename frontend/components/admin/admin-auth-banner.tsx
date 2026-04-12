"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AdminAuthBannerProps {
  variant: "read" | "write";
}

/** Shown when admin JWT is missing; auth UI is deferred but API may require a token. */
export function AdminAuthBanner({ variant }: AdminAuthBannerProps) {
  const write = variant === "write";
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <Info className="text-primary" aria-hidden />
      <AlertTitle>Admin session</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {write
            ? "Creating or updating records and viewing orders usually requires an authenticated admin account once auth is enabled."
            : "Order history is only returned for authenticated admins. Product and category lists remain public for this storefront API."}
        </span>
        <Button asChild variant="secondary" size="sm" className="shrink-0">
          <Link href="/admin/login">Preview login (optional)</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
