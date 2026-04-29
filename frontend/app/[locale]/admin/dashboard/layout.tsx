"use client";

import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { AdminMobileBottomNav, AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <AdminSidebar />
        <div className="min-w-0 flex-1 space-y-8 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
      </div>
      <AdminMobileBottomNav />
    </AdminAuthGuard>
  );
}
