import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link
            href="/admin/dashboard"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            V-fixer Admin
          </Link>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
            <Link
              href="/admin/dashboard"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard/products"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Products
            </Link>
            <Link
              href="/admin/dashboard/categories"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/admin/dashboard/orders"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Orders
            </Link>
            <Link
              href="/admin/login"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Login
            </Link>
            <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">
              View Store
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-screen-2xl flex-1 p-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
