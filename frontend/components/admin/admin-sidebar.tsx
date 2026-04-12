"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  {
    href: "/admin/dashboard/categories",
    label: "Categories",
    icon: FolderTree,
  },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 md:w-56 lg:w-60">
      <nav className="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0 md:pr-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
