import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  className,
  action,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <Icon
          className="mb-3 size-10 text-muted-foreground"
          strokeWidth={1.25}
          aria-hidden
        />
      ) : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
