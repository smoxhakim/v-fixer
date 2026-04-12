import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <AdminSidebar />
      <div className="min-w-0 flex-1 space-y-8">{children}</div>
    </div>
  );
}
